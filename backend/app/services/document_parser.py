import io
import os
import logging
from typing import Optional

logger = logging.getLogger("document-parser")


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract clean text content from PDF bytes using PyMuPDF (fitz) with pypdf fallback."""
    if not file_bytes or len(file_bytes) < 10:
        raise ValueError("The uploaded PDF file is empty or corrupted (file size is too small).")

    # Basic PDF magic header validation
    if not file_bytes.startswith(b"%PDF"):
        raise ValueError("Invalid PDF format: file header does not match PDF signature.")

    # 1. Try PyMuPDF (fitz) first as primary specified extractor
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        if doc.is_encrypted:
            raise ValueError("The uploaded PDF is password-protected. Please provide an unlocked document.")
        
        extracted_text = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            if text:
                extracted_text.append(text)
        
        full_text = "\n".join(extracted_text).strip()
        if full_text:
            return full_text
    except ImportError:
        logger.warning("PyMuPDF (fitz) not imported; falling back to pypdf extractor.")
    except Exception as e:
        if "password" in str(e).lower() or "encrypted" in str(e).lower():
            raise ValueError("The uploaded PDF is password-protected. Please provide an unlocked document.")
        logger.warning(f"PyMuPDF failed with: {e}. Attempting pypdf fallback.")

    # 2. Resilient fallback using pypdf
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        if reader.is_encrypted:
            raise ValueError("The uploaded PDF is password-protected. Please provide an unlocked document.")
        
        extracted_text = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted_text.append(t)
        
        full_text = "\n".join(extracted_text).strip()
        if not full_text:
            raise ValueError("PDF content could not be read or contains only scanned images without selectable text.")
        return full_text
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Corrupted or invalid PDF file: {str(e)}")


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract clean text content from Microsoft Word DOCX bytes using python-docx."""
    if not file_bytes or len(file_bytes) < 10:
        raise ValueError("The uploaded DOCX file is empty or corrupted.")

    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        
        paragraphs_text = [p.text for p in doc.paragraphs if p.text.strip()]
        
        # Also extract text from any tables in the resume
        table_text = []
        for table in doc.tables:
            for row in table.rows:
                row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_cells:
                    table_text.append(" | ".join(row_cells))
        
        combined = "\n".join(paragraphs_text + table_text).strip()
        if not combined:
            raise ValueError("DOCX document appears to be empty or contains no readable text.")
        return combined
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Corrupted or invalid DOCX document: {str(e)}")


def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    """Unified document text extraction dispatcher supporting PDF and DOCX formats."""
    ext = os.path.splitext(filename.lower())[1]
    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext == ".docx":
        return extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file format '{ext}'. Only PDF (.pdf) and DOCX (.docx) files are supported.")
