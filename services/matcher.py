import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pathlib import Path
import re, os

# ── Dataset paths ──────────────────────────────────────────────
DATA_DIR = Path(__file__).parent.parent.parent / "data"
JOBS_PATH = DATA_DIR / "jobs_dataset.csv" / "postings.csv"

# ── Fallback jobs if CSV not found ─────────────────────────────
FALLBACK_JOBS = [
    {"title":"Software Developer","company":"TechCorp","location":"Remote","salary":"₹8-15 LPA",
     "skills":["python","java","git","api","sql"],"description":"Build scalable web applications using modern frameworks and cloud services","type":"remote","experience":"2-5 years"},
    {"title":"Data Analyst","company":"DataViz Inc","location":"Bangalore","salary":"₹6-12 LPA",
     "skills":["python","sql","tableau","pandas","excel"],"description":"Analyze large datasets and build interactive dashboards for business insights","type":"hybrid","experience":"1-3 years"},
    {"title":"ML Engineer","company":"AI Labs","location":"Hyderabad","salary":"₹12-22 LPA",
     "skills":["python","tensorflow","pytorch","scikit-learn","deep learning","nlp"],"description":"Design train and deploy machine learning models for production systems","type":"onsite","experience":"3-6 years"},
    {"title":"Frontend Developer","company":"PixelStudio","location":"Remote","salary":"₹7-14 LPA",
     "skills":["react","javascript","typescript","css","html","tailwind"],"description":"Build responsive pixel-perfect user interfaces with React and modern CSS","type":"remote","experience":"1-4 years"},
    {"title":"Backend Developer","company":"ServerStack","location":"Pune","salary":"₹9-16 LPA",
     "skills":["node.js","python","mongodb","postgresql","docker","fastapi"],"description":"Design and build scalable REST APIs microservices and database architectures","type":"hybrid","experience":"2-5 years"},
    {"title":"DevOps Engineer","company":"CloudNine","location":"Remote","salary":"₹10-20 LPA",
     "skills":["docker","kubernetes","aws","linux","ci/cd","terraform"],"description":"Manage cloud infrastructure automate deployments and ensure system reliability","type":"remote","experience":"3-7 years"},
    {"title":"Cybersecurity Analyst","company":"SecureNet","location":"Delhi","salary":"₹8-18 LPA",
     "skills":["networking","linux","security","python","siem","penetration testing"],"description":"Monitor systems identify vulnerabilities and protect infrastructure from threats","type":"onsite","experience":"2-5 years"},
    {"title":"Cloud Engineer","company":"NimbusTech","location":"Remote","salary":"₹11-21 LPA",
     "skills":["aws","azure","gcp","terraform","kubernetes","python"],"description":"Design and manage scalable cloud architectures on AWS Azure and GCP","type":"remote","experience":"3-6 years"},
    {"title":"Data Scientist","company":"InsightAI","location":"Bangalore","salary":"₹14-25 LPA",
     "skills":["python","machine learning","statistics","pandas","numpy","sql","r"],"description":"Build predictive models and extract insights from complex datasets","type":"hybrid","experience":"3-6 years"},
    {"title":"Full Stack Developer","company":"BuildIt","location":"Remote","salary":"₹10-18 LPA",
     "skills":["react","node.js","mongodb","docker","javascript","css"],"description":"Build end-to-end web applications from database to UI deployment","type":"remote","experience":"2-5 years"},
]

# ── Load & normalize jobs CSV ──────────────────────────────────
def load_jobs():
    if not JOBS_PATH.exists():
        print(f"[matcher] jobs_dataset.csv not found -> using fallback jobs")
        return FALLBACK_JOBS

    try:
        df = pd.read_csv(JOBS_PATH, on_bad_lines='skip')
        df.columns = [c.lower().strip().replace(' ', '_') for c in df.columns]
        print(f"[matcher] Loaded jobs CSV: {len(df)} rows | columns: {list(df.columns)[:8]}")

        # ── Try to find the right column names (handles different Kaggle CSV formats)
        def find_col(df, candidates):
            for c in candidates:
                if c in df.columns:
                    return c
            return None

        title_col   = find_col(df, ['title','job_title','position','job_position','name'])
        company_col = find_col(df, ['company_name','company','employer','organization'])
        loc_col     = find_col(df, ['location','job_location','city','place'])
        salary_col  = find_col(df, ['salary','salary_range','pay','compensation','med_salary'])
        desc_col    = find_col(df, ['description','job_description','details','summary','job_summary'])
        type_col    = find_col(df, ['work_type','job_type','type','employment_type','formatted_work_type'])

        jobs = []
        for _, row in df.iterrows():
            title   = str(row[title_col]).strip()   if title_col   else "Tech Role"
            company = str(row[company_col]).strip()  if company_col else "Company"
            loc     = str(row[loc_col]).strip()      if loc_col     else "India"
            salary  = str(row[salary_col]).strip()   if salary_col  else "Competitive"
            desc    = str(row[desc_col]).strip()[:600] if desc_col  else ""
            wtype   = str(row[type_col]).strip().lower() if type_col else "hybrid"

            # Skip bad rows
            if not title or title in ('nan','None',''):
                continue

            # Normalize work type
            if any(w in wtype for w in ['remote','work from home','wfh']):
                wtype = 'remote'
            elif any(w in wtype for w in ['onsite','on-site','in office','in-office']):
                wtype = 'onsite'
            else:
                wtype = 'hybrid'

            # Normalize salary
            if salary in ('nan','None','','0'):
                salary = "Competitive"

            jobs.append({
                "title": title,
                "company": company,
                "location": loc,
                "salary": salary,
                "description": desc,
                "skills": [],
                "type": wtype,
                "experience": "2-5 years",
                "match_percent": 55,
                "why_match": "Explore this role as a strong fit for your skills and experience."
            })

        print(f"[matcher] Parsed {len(jobs)} valid jobs from CSV")
        return jobs if jobs else FALLBACK_JOBS

    except Exception as e:
        print(f"[matcher] Error loading jobs CSV: {e} → using fallback")
        return FALLBACK_JOBS


# ── Main matching function ─────────────────────────────────────
def match_jobs(parsed_resume: dict, top_n: int = 100):
    jobs = load_jobs()

    resume_skills   = set(parsed_resume.get("skills", []))
    resume_keywords = parsed_resume.get("keywords", [])
    exp_years       = parsed_resume.get("experience_years", 0)

    # Build resume text for TF-IDF
    resume_text = " ".join(resume_skills) + " " + " ".join(resume_keywords)
    if not resume_text.strip():
        resume_text = "software developer python"

    # Build corpus: [resume] + [all job descriptions]
    job_texts = [
        j["description"] + " " + j["title"] + " " + " ".join(j.get("skills", []))
        for j in jobs
    ]
    corpus = [resume_text] + job_texts

    # TF-IDF cosine similarity
    try:
        tfidf = TfidfVectorizer(stop_words='english', max_features=800, ngram_range=(1,2))
        matrix = tfidf.fit_transform(corpus)
        raw_scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
    except Exception as e:
        print(f"[matcher] TF-IDF error: {e}")
        raw_scores = np.random.uniform(0.3, 0.7, len(jobs))

    results = []
    for i, job in enumerate(jobs):
        base_score = float(raw_scores[i]) if i < len(raw_scores) else 0.4

        # Boost by skill overlap
        job_text_lower = (job["description"] + " " + job["title"]).lower()
        skill_hits = sum(1 for s in resume_skills if s.lower() in job_text_lower)
        skill_boost = skill_hits * 0.04

        # Slight randomness to avoid all same scores
        noise = np.random.uniform(-0.03, 0.05)

        final_score = base_score + skill_boost + noise
        match_pct = round(min(97, max(30, final_score * 130)), 1)

        # Build "why match" explanation
        matched_skills = [s for s in resume_skills if s.lower() in job_text_lower]
        if matched_skills:
            why = f"Your skills in {', '.join(matched_skills[:3])} directly align with this role's requirements."
        elif resume_skills:
            top = list(resume_skills)[:2]
            why = f"Your background in {', '.join(top)} makes you a strong candidate for this position."
        else:
            why = f"This role matches your experience level and career trajectory."

        results.append({
            **job,
            "match_percent": match_pct,
            "why_match": why,
            "matched_skills": matched_skills[:5]
        })

    # Sort by match score descending
    results.sort(key=lambda x: x["match_percent"], reverse=True)
    return results[:top_n]