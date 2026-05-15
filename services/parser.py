from pdfminer.high_level import extract_text as pdf_extract
from docx import Document
import io, re
from app.nlp.skill_extractor import extract_skills
from app.nlp.keyword_extractor import extract_keywords
from app.nlp.ner_pipeline import extract_email, extract_phone, extract_name, extract_education, extract_experience_years

def extract_text_from_pdf(file_bytes: bytes) -> str:
    return pdf_extract(io.BytesIO(file_bytes))

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join([p.text for p in doc.paragraphs])

def parse_resume(file_bytes: bytes, filename: str) -> dict:
    if filename.lower().endswith('.pdf'):
        text = extract_text_from_pdf(file_bytes)
    elif filename.lower().endswith('.docx'):
        text = extract_text_from_docx(file_bytes)
    else:
        text = file_bytes.decode('utf-8', errors='ignore')

    skills = extract_skills(text)
    keywords = extract_keywords(text)
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    education = extract_education(text)
    experience_years = extract_experience_years(text)

    return {
        "raw_text": text,
        "name": name,
        "email": email,
        "phone": phone,
        "education": education,
        "skills": skills,
        "keywords": keywords,
        "experience_years": experience_years,
        "word_count": len(text.split())
    }