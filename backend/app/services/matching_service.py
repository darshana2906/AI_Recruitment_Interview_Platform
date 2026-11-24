import re
from typing import Dict, Any, List, Set, Tuple
from app.services.embedding_service import get_embedding, cosine_similarity


def normalize_skill(skill: str) -> str:
    """Normalize skill name for case-insensitive and variant matching."""
    s = skill.lower().strip()
    s = re.sub(r"\.js\b", "", s)  # react.js -> react, node.js -> node
    s = re.sub(r"[-_]", " ", s)
    if s == "golang":
        return "go"
    if s == "js":
        return "javascript"
    if s == "ts":
        return "typescript"
    if s == "py":
        return "python"
    if s == "postgres":
        return "postgresql"
    return s


def get_edu_level(edu_str: str) -> int:
    """Map education string to hierarchical numerical level."""
    s = (edu_str or "").lower()
    if "phd" in s or "doctorate" in s:
        return 4
    if "master" in s or "m.s" in s or "m.tech" in s:
        return 3
    if "bachelor" in s or "b.s" in s or "b.tech" in s or "b.e" in s or "degree" in s:
        return 2
    if "associate" in s or "diploma" in s:
        return 1
    return 1


def compute_hybrid_matching_score(
    candidate: Any,
    job: Any,
    candidate_embedding: List[float] = None,
    job_embedding: List[float] = None
) -> Dict[str, Any]:
    """Execute the 5-factor hybrid candidate matching algorithm.

    Weights:
    - Technical Skills (Required): 35 points
    - Relevant Experience: 25 points
    - Educational Qualifications: 15 points
    - Preferred Skills: 5 points
    - Semantic Similarity: 20 points
    Total Score: 0 to 100 points
    """
    # 1. Required Technical Skills Match (Max 35 pts)
    job_req_skills = job.required_skills if hasattr(job, "required_skills") else []
    cand_skills = candidate.skills if hasattr(candidate, "skills") else []

    cand_skills_norm = {normalize_skill(s): s for s in cand_skills}
    job_req_norm = {normalize_skill(s): s for s in job_req_skills}

    matched_req_norm = set(cand_skills_norm.keys()).intersection(set(job_req_norm.keys()))
    matched_skills = [cand_skills_norm[k] for k in matched_req_norm]
    missing_skills = [job_req_norm[k] for k in job_req_norm.keys() if k not in matched_req_norm]

    if job_req_skills:
        tech_score = (len(matched_skills) / len(job_req_skills)) * 35.0
    else:
        tech_score = 35.0

    # 2. Preferred Skills Match (Max 5 pts)
    job_pref_skills = job.preferred_skills if hasattr(job, "preferred_skills") else []
    job_pref_norm = {normalize_skill(s): s for s in job_pref_skills}
    matched_pref_norm = set(cand_skills_norm.keys()).intersection(set(job_pref_norm.keys()))
    matched_pref_skills = [cand_skills_norm[k] for k in matched_pref_norm]

    if job_pref_skills:
        pref_score = min(5.0, (len(matched_pref_skills) / len(job_pref_skills)) * 5.0)
    else:
        pref_score = 5.0

    # 3. Relevant Experience Match (Max 25 pts)
    cand_exp = float(getattr(candidate, "total_experience_years", 0.0) or 0.0)
    min_exp = float(getattr(job, "min_experience", 0.0) or 0.0)
    max_exp = float(getattr(job, "max_experience", 10.0) or 10.0)

    if cand_exp >= min_exp:
        exp_score = 25.0
        exp_comparison = f"{cand_exp:.1f} yrs (Exceeds/Meets min {min_exp:.1f} yrs)"
    else:
        gap = min_exp - cand_exp
        if gap <= 1.0:
            exp_score = 18.0
        elif gap <= 2.0:
            exp_score = 12.0
        else:
            exp_score = max(0.0, (cand_exp / max(1.0, min_exp)) * 10.0)
        exp_comparison = f"{cand_exp:.1f} yrs vs {min_exp:.1f} yrs required (-{gap:.1f} yrs)"

    # 4. Educational Qualifications (Max 15 pts)
    cand_edu_level = get_edu_level(getattr(candidate, "education_level", ""))
    job_edu_level = get_edu_level(getattr(job, "education_requirement", ""))

    if cand_edu_level >= job_edu_level:
        edu_score = 15.0
    elif cand_edu_level == job_edu_level - 1:
        edu_score = 10.0
    else:
        edu_score = 5.0

    # 5. Semantic Similarity (Max 20 pts)
    if candidate_embedding and job_embedding:
        sim = cosine_similarity(candidate_embedding, job_embedding)
    else:
        # Generate on-the-fly dense embeddings
        cand_text = f"{candidate.full_name} {candidate.profile_summary} {' '.join(cand_skills)}"
        job_text = f"{job.title} {job.description} {' '.join(job_req_skills)}"
        c_emb = get_embedding(cand_text)
        j_emb = get_embedding(job_text)
        sim = cosine_similarity(c_emb, j_emb)

    # Normalize cosine similarity to [0.0, 1.0]
    normalized_sim = max(0.0, min(1.0, (sim + 1.0) / 2.0 if sim < 0 else sim))
    semantic_score = normalized_sim * 20.0

    # Total Score: 0 to 100
    total_score = round(min(100.0, max(0.0, tech_score + exp_score + edu_score + pref_score + semantic_score)), 1)

    # 6. Explainable AI Rationale Synthesis
    if total_score >= 80.0:
        fit_tier = "Strong Candidate Match"
    elif total_score >= 65.0:
        fit_tier = "Good Candidate Match"
    elif total_score >= 45.0:
        fit_tier = "Moderate Candidate Match"
    else:
        fit_tier = "Low Candidate Match"

    reason_parts = [
        f"{fit_tier} (Score: {total_score}/100).",
        f"Matched {len(matched_skills)}/{len(job_req_skills)} required technical skills ({', '.join(matched_skills) if matched_skills else 'None'}).",
    ]
    if missing_skills:
        reason_parts.append(f"Missing required skills: {', '.join(missing_skills)}.")
    reason_parts.append(f"Experience: {exp_comparison}.")
    if matched_pref_skills:
        reason_parts.append(f"Bonus preferred skills: {', '.join(matched_pref_skills)}.")
    reason_parts.append(f"Semantic profile alignment: {int(normalized_sim * 100)}%.")

    recommendation_reason = " ".join(reason_parts)

    return {
        "overall_score": total_score,
        "score_breakdown": {
            "technical_skills_score": round(tech_score, 1),
            "experience_score": round(exp_score, 1),
            "education_score": round(edu_score, 1),
            "preferred_skills_score": round(pref_score, 1),
            "semantic_similarity_score": round(semantic_score, 1),
        },
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matched_preferred_skills": matched_pref_skills,
        "experience_comparison": exp_comparison,
        "semantic_similarity_percent": round(normalized_sim * 100, 1),
        "recommendation_reason": recommendation_reason,
    }
