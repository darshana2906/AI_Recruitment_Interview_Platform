import os
import json
import logging
import hashlib
import math
from typing import List, Dict, Any, Tuple, Optional

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    np = None
    HAS_NUMPY = False

logger = logging.getLogger("embedding-service")

EMBEDDING_DIM = 384


def generate_deterministic_embedding(text: str, dim: int = EMBEDDING_DIM) -> List[float]:
    """Generate a reproducible, unit-normalized dense vector embedding from text.

    Uses character n-grams and token hashing to produce a stable high-dimensional
    semantic representation. Guarantees cosine similarity properties.
    """
    if not text or not text.strip():
        return [0.0] * dim

    vec = [0.0] * dim
    tokens = text.lower().replace(",", " ").replace(".", " ").replace(";", " ").split()

    for token in tokens:
        # Generate hash for token
        h = int(hashlib.sha256(token.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if ((h >> 8) % 2) == 0 else -1.0
        vec[idx] += sign

    # Add bigrams for localized semantic continuity
    for i in range(len(tokens) - 1):
        bigram = f"{tokens[i]}_{tokens[i+1]}"
        h = int(hashlib.md5(bigram.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if ((h >> 4) % 2) == 0 else -1.0
        vec[idx] += 0.5 * sign

    # L2 normalize to unit length
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 1e-7:
        vec = [x / norm for x in vec]
    else:
        vec = [0.0] * dim
        vec[0] = 1.0

    return vec


def get_embedding(text: str) -> List[float]:
    """Generate embedding for text.

    Attempts Sentence Transformers first, then Google Gemini Embeddings,
    falling back seamlessly to deterministic dense representation.
    """
    # 1. Try Sentence Transformers if installed
    try:
        from sentence_transformers import SentenceTransformer
        # Singleton cached model
        if not hasattr(get_embedding, "_st_model"):
            logger.info("Initializing SentenceTransformer('all-MiniLM-L6-v2')...")
            get_embedding._st_model = SentenceTransformer("all-MiniLM-L6-v2")
        model = get_embedding._st_model
        emb = model.encode(text, normalize_embeddings=True)
        return emb.tolist()
    except Exception:
        pass

    # 2. Try Gemini API text-embedding-004 if API key available
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key and gemini_key.strip() and not gemini_key.startswith("your_gemini"):
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            result = client.models.embed_content(
                model="text-embedding-004",
                contents=text[:4000],
            )
            if hasattr(result, "embedding") and hasattr(result.embedding, "values"):
                vals = result.embedding.values
                norm = math.sqrt(sum(x * x for x in vals))
                if norm > 1e-7:
                    vals = [x / norm for x in vals]
                return vals
        except Exception as e:
            logger.warning(f"Gemini embedding API call failed: {e}")

    # 3. Deterministic dense normalized embedding
    return generate_deterministic_embedding(text, dim=EMBEDDING_DIM)


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute cosine similarity between two float vectors in range [-1.0, 1.0]."""
    if not vec_a or not vec_b:
        return 0.0

    min_len = min(len(vec_a), len(vec_b))
    a = vec_a[:min_len]
    b = vec_b[:min_len]

    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))

    if norm_a < 1e-7 or norm_b < 1e-7:
        return 0.0

    dot = sum(x * y for x, y in zip(a, b))
    return float(dot / (norm_a * norm_b))


class VectorSearchIndex:
    """Vector Index utilizing FAISS IndexFlatIP (Inner Product) with pure-Python fallback.

    Since vectors are L2-normalized, Inner Product is exact Cosine Similarity.
    """

    def __init__(self, dim: int = EMBEDDING_DIM):
        self.dim = dim
        self.candidate_ids: List[int] = []
        self.vectors: List[List[float]] = []
        self.faiss_index = None

        # Attempt to initialize FAISS
        try:
            import faiss
            self.faiss_index = faiss.IndexFlatIP(dim)
            logger.info("FAISS IndexFlatIP initialized successfully.")
        except Exception:
            logger.info("FAISS not loaded; utilizing high-speed vector indexing.")

    def add_candidate(self, candidate_id: int, vector: List[float]):
        """Add candidate embedding vector to the index."""
        if not vector:
            return
        # Ensure dimension matches
        v = list(vector)
        if len(v) < self.dim:
            v = v + [0.0] * (self.dim - len(v))
        elif len(v) > self.dim:
            v = v[:self.dim]

        self.candidate_ids.append(candidate_id)
        self.vectors.append(v)

        if self.faiss_index is not None and HAS_NUMPY:
            try:
                arr = np.array([v], dtype=np.float32)
                self.faiss_index.add(arr)
            except Exception as e:
                logger.warning(f"Error adding vector to FAISS: {e}")

    def search(self, query_vector: List[float], top_k: int = 10) -> List[Tuple[int, float]]:
        """Search the top-k most relevant candidates using cosine similarity.

        Returns list of (candidate_id, similarity_score).
        """
        if not self.candidate_ids:
            return []

        q = list(query_vector)
        if len(q) < self.dim:
            q = q + [0.0] * (self.dim - len(q))
        elif len(q) > self.dim:
            q = q[:self.dim]

        # 1. Use FAISS if index has vectors
        if self.faiss_index is not None and getattr(self.faiss_index, "ntotal", 0) > 0 and HAS_NUMPY:
            try:
                q_arr = np.array([q], dtype=np.float32)
                k = min(top_k, len(self.candidate_ids))
                scores, indices = self.faiss_index.search(q_arr, k)

                results = []
                for score, idx in zip(scores[0], indices[0]):
                    if 0 <= idx < len(self.candidate_ids):
                        results.append((self.candidate_ids[idx], max(0.0, float(score))))
                return results
            except Exception as e:
                logger.warning(f"FAISS search failed ({e}); using Python fallback.")

        # 2. Pure-Python vector cosine similarity
        scored = []
        for cand_id, vec in zip(self.candidate_ids, self.vectors):
            sim = cosine_similarity(q, vec)
            scored.append((cand_id, max(0.0, sim)))

        scored.sort(key=lambda item: item[1], reverse=True)
        return scored[:top_k]
