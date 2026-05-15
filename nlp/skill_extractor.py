import re, pandas as pd
from pathlib import Path

# ── Paths ───────────────────────────────────────────────────────
DATA_DIR      = Path(__file__).parent.parent.parent / "data"
SKILLS_FILE   = DATA_DIR / "skills_list.txt"
RESUME_CSV    = DATA_DIR / "resume_dataset.csv" / "Resume" / "Resume.csv"

# ── Hardcoded base skill set (always present) ───────────────────
BASE_SKILLS = {
    "python","java","javascript","typescript","c++","c#","go","rust","scala","r","kotlin","swift",
    "react","angular","vue","next.js","node.js","express","django","flask","fastapi","spring boot",
    "sql","mysql","postgresql","mongodb","redis","elasticsearch","cassandra","sqlite","oracle",
    "aws","azure","gcp","docker","kubernetes","terraform","ansible","linux","git","github","gitlab",
    "machine learning","deep learning","nlp","computer vision","tensorflow","pytorch","keras",
    "scikit-learn","pandas","numpy","matplotlib","seaborn","spark","hadoop","kafka","airflow",
    "rest","graphql","microservices","ci/cd","jenkins","github actions","agile","scrum","jira",
    "html","css","tailwind css","sass","figma","photoshop","tableau","power bi","excel",
    "penetration testing","networking","security","siem","firewalls","ethical hacking",
    "data analysis","data visualization","statistics","probability","linear algebra"
}

def load_skills_from_txt():
    """Load skill list from skills_list.txt"""
    if not SKILLS_FILE.exists():
        print("[skill_extractor] skills_list.txt not found → using base skills only")
        return set()
    lines = SKILLS_FILE.read_text(encoding='utf-8', errors='ignore').splitlines()
    skills = set(l.strip().lower() for l in lines if l.strip() and len(l.strip()) > 1)
    print(f"[skill_extractor] Loaded {len(skills)} skills from skills_list.txt")
    return skills

def load_skills_from_resume_csv():
    """Extract skill vocabulary from resume_dataset.csv"""
    if not RESUME_CSV.exists():
        print("[skill_extractor] resume_dataset.csv not found → skipping")
        return set()
    try:
        df = pd.read_csv(RESUME_CSV, on_bad_lines='skip')
        df.columns = [c.lower().strip() for c in df.columns]
        print(f"[skill_extractor] Resume CSV loaded: {len(df)} rows | cols: {list(df.columns)}")

        # Find text column
        text_col = None
        for c in ['skills','resume','resume_str','text','content','description','category']:
            if c in df.columns:
                text_col = c
                break

        if not text_col:
            print("[skill_extractor] No recognizable text column found in resume CSV")
            return set()

        all_text = " ".join(df[text_col].dropna().astype(str).tolist()).lower()

        # Extract known tech skills from resume text using regex
        tech_pattern = (
            r'\b(python|java(?:script)?|typescript|c\+\+|c#|golang|rust|scala|kotlin|swift|ruby|php|'
            r'react(?:\.js)?|angular|vue(?:\.js)?|next\.js|node(?:\.js)?|express|django|flask|fastapi|'
            r'spring(?: boot)?|hibernate|laravel|rails|'
            r'sql|mysql|postgresql|mongodb|redis|elasticsearch|cassandra|sqlite|'
            r'aws|azure|gcp|docker|kubernetes|terraform|ansible|jenkins|'
            r'machine learning|deep learning|nlp|tensorflow|pytorch|keras|'
            r'scikit.learn|pandas|numpy|spark|hadoop|kafka|airflow|'
            r'git|linux|agile|scrum|rest(?:ful)?|graphql|microservices|'
            r'html|css|tailwind|sass|figma|tableau|power bi)\b'
        )
        found = set(re.findall(tech_pattern, all_text))
        print(f"[skill_extractor] Extracted {len(found)} skill terms from resume CSV")
        return found

    except Exception as e:
        print(f"[skill_extractor] Error reading resume CSV: {e}")
        return set()

# ── Build master skill set once at startup ─────────────────────
SKILL_SET = BASE_SKILLS | load_skills_from_txt() | load_skills_from_resume_csv()
print(f"[skill_extractor] Total skill vocabulary: {len(SKILL_SET)} skills")

# ── Main extraction function ────────────────────────────────────
def extract_skills(text: str) -> list:
    """Extract skills from resume text using the master skill set"""
    text_lower = text.lower()
    found = []
    for skill in SKILL_SET:
        # Use word boundary for short skills, substring for longer ones
        if len(skill) <= 3:
            pattern = r'\b' + re.escape(skill) + r'\b'
        else:
            pattern = re.escape(skill)
        if re.search(pattern, text_lower):
            found.append(skill)
    return sorted(list(set(found)))