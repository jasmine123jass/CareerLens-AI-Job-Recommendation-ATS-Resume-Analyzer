import re, pandas as pd
from pathlib import Path

# ── Paths ───────────────────────────────────────────────────────
DATA_DIR  = Path(__file__).parent.parent.parent / "data"
VERBS_FILE = DATA_DIR / "action_verbs.txt"
ATS_CSV    = DATA_DIR / "ats_dataset.csv"

# ── Load action verbs ───────────────────────────────────────────
def load_verbs():
    if VERBS_FILE.exists():
        verbs = set(l.strip().lower() for l in VERBS_FILE.read_text().splitlines() if l.strip())
        print(f"[ats] Loaded {len(verbs)} action verbs from file")
        return verbs
    return {
        "developed","built","designed","implemented","optimized","led","managed",
        "created","architected","deployed","automated","reduced","increased",
        "improved","analyzed","collaborated","delivered","engineered","launched",
        "scaled","integrated","maintained","refactored","tested","debugged",
        "documented","mentored","coordinated","streamlined","migrated","achieved",
        "accelerated","administered","advised","built","calculated","captured",
        "championed","coded","configured","contributed","converted","crafted"
    }

STRONG_VERBS = load_verbs()

# ── Load ATS dataset to extract common keywords ─────────────────
def load_ats_keywords():
    default = ['python','java','sql','api','machine learning','data','cloud',
               'docker','git','agile','react','javascript','node','aws',
               'tensorflow','kubernetes','mongodb','postgresql','linux','rest']
    if not ATS_CSV.is_file():
        print("[ats] ats_dataset.csv not found or is a directory -> using default keywords")
        return default
    try:
        df = pd.read_csv(ATS_CSV, on_bad_lines='skip')
        df.columns = [c.lower().strip() for c in df.columns]
        print(f"[ats] ATS dataset loaded: {len(df)} rows | cols: {list(df.columns)[:6]}")

        # Try to extract text column
        text_col = None
        for c in ['skills','keywords','description','resume','text','content']:
            if c in df.columns:
                text_col = c
                break

        if text_col:
            all_text = " ".join(df[text_col].dropna().astype(str).tolist()).lower()
            # Extract tech words from text
            tech_pattern = r'\b(python|java|javascript|sql|react|node|aws|docker|git|agile|' \
                           r'machine learning|deep learning|tensorflow|pytorch|kubernetes|' \
                           r'mongodb|postgresql|redis|linux|rest|api|microservices|ci/cd|' \
                           r'typescript|angular|vue|spring|django|flask|fastapi|spark|hadoop|' \
                           r'tableau|power bi|excel|r|scala|go|rust|c\+\+|azure|gcp)\b'
            found = list(set(re.findall(tech_pattern, all_text)))
            if found:
                print(f"[ats] Extracted {len(found)} ATS keywords from dataset")
                return found
    except Exception as e:
        print(f"[ats] Error loading ats_dataset.csv: {e}")
    return default

ATS_KEYWORDS = load_ats_keywords()

# ── Required resume sections ────────────────────────────────────
SECTION_HEADERS = [
    'experience', 'education', 'skills', 'projects',
    'certifications', 'summary', 'objective', 'work experience'
]

# ── Main scoring function ───────────────────────────────────────
def score_resume(parsed: dict) -> dict:
    text  = parsed.get("raw_text", "").lower()
    score = 0
    issues      = []
    suggestions = []

    # ── 1. Section headers (25 pts) ─────────────────────────────
    found_sections = [h for h in SECTION_HEADERS if h in text]
    section_score  = min(25, len(found_sections) * 4)
    score += section_score
    if len(found_sections) < 4:
        missing = [h for h in ['experience','education','skills','projects'] if h not in found_sections]
        if missing:
            issues.append(f"Missing sections: {', '.join(missing)}")
            suggestions.append(f"Add clearly labeled sections: {', '.join(missing).title()}")

    # ── 2. Skills detected (20 pts) ─────────────────────────────
    skill_count  = len(parsed.get("skills", []))
    skill_score  = min(20, skill_count * 2)
    score       += skill_score
    if skill_count < 5:
        issues.append(f"Only {skill_count} skills detected — ATS needs at least 8")
        suggestions.append("Add a dedicated Skills section listing 8-12 relevant technologies")
    elif skill_count < 8:
        suggestions.append("Consider adding 2-3 more relevant technical skills to strengthen your profile")

    # ── 3. Action verbs (20 pts) ────────────────────────────────
    words        = set(text.split())
    strong_found = words & STRONG_VERBS
    verb_score   = min(20, len(strong_found) * 2)
    score       += verb_score
    if len(strong_found) < 5:
        issues.append(f"Only {len(strong_found)} strong action verbs found")
        suggestions.append("Start each bullet point with: Developed, Built, Optimized, Led, Automated, Delivered")
    elif len(strong_found) < 8:
        suggestions.append("Add more varied action verbs — avoid repeating the same verb")

    # ── 4. ATS keyword density (20 pts) ─────────────────────────
    ats_found   = [k for k in ATS_KEYWORDS if k in text]
    ats_score   = min(20, len(ats_found) * 2)
    score      += ats_score
    missing_kw  = [k for k in ATS_KEYWORDS if k not in text]
    if len(ats_found) < 5:
        issues.append(f"Low ATS keyword density — only {len(ats_found)} tech keywords found")
        suggestions.append(f"Include relevant keywords: {', '.join(missing_kw[:6])}")
    elif missing_kw:
        suggestions.append(f"Consider adding: {', '.join(missing_kw[:4])} if relevant to your experience")

    # ── 5. Word count / length (15 pts) ─────────────────────────
    wc = parsed.get("word_count", 0)
    if 350 <= wc <= 800:
        score += 15
    elif 250 <= wc < 350:
        score += 8
        issues.append(f"Resume is short ({wc} words) — aim for 400-700 words")
        suggestions.append("Expand your project descriptions and add quantified achievements")
    elif wc > 800:
        score += 8
        issues.append(f"Resume is long ({wc} words) — ATS prefers concise resumes")
        suggestions.append("Trim to 1 page (400-700 words) for 0-5 years experience")
    else:
        issues.append(f"Resume too short ({wc} words) — ATS may reject very short resumes")
        suggestions.append("Add more detail to experience, projects, and skills sections")

    # ── Compile result ───────────────────────────────────────────
    final_score = min(100, score)
    return {
        "ats_score":           final_score,
        "issues":              issues,
        "suggestions":         suggestions,
        "strong_verbs_found":  list(strong_found),
        "ats_keywords_found":  ats_found,
        "missing_keywords":    missing_kw[:10],
        "sections_found":      found_sections,
        "skill_count":         skill_count,
        "word_count":          wc
    }