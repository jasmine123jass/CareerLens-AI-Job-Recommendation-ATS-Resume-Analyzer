import re

def extract_email(text):
    match = re.search(r'[\w.+-]+@[\w-]+\.[a-zA-Z]+', text)
    return match.group() if match else ""

def extract_phone(text):
    match = re.search(r'(\+?\d[\d\s\-().]{7,}\d)', text)
    return match.group().strip() if match else ""

def extract_name(text):
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for line in lines[:5]:
        if 2 <= len(line.split()) <= 4 and line[0].isupper():
            if not any(c in line for c in ['@', '.com', '/', 'http']):
                return line
    return ""

def extract_education(text):
    edu_keywords = ['b.tech','m.tech','b.sc','m.sc','bca','mca','phd','bachelor','master',
                    'engineering','computer science','information technology','mba']
    lines = text.lower().split('\n')
    edu_lines = [l for l in lines if any(k in l for k in edu_keywords)]
    return " | ".join(edu_lines[:3])

def extract_experience_years(text):
    match = re.search(r'(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)', text.lower())
    if match:
        return int(match.group(1))
    return 0