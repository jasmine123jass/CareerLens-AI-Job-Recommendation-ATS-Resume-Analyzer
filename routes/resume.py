from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..services.parser import parse_resume
from ..services.ats_scorer import score_resume
from ..services.matcher import match_jobs
from ..services.auth_service import decode_token
from ..db.database import resumes_collection
import datetime

router = APIRouter(prefix="/resume", tags=["resume"])
security = HTTPBearer()

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    email = decode_token(creds.credentials)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), user_email: str = Depends(get_current_user)):
    content = await file.read()
    parsed = parse_resume(content, file.filename)
    ats = score_resume(parsed)
    jobs = match_jobs(parsed)
    
    doc = {
        "user_email": user_email,
        "filename": file.filename,
        "parsed": parsed,
        "ats": ats,
        "jobs": jobs,
        "uploaded_at": datetime.datetime.utcnow().isoformat()
    }
    resumes_collection.insert_one(doc)
    parsed.pop("raw_text", None)
    return {"parsed": parsed, "ats": ats, "jobs": jobs}

@router.get("/history")
def get_resume_history(user_email: str = Depends(get_current_user)):
    resumes = list(resumes_collection.find({"user_email": user_email}, {"_id": 0, "parsed.raw_text": 0}))
    return {"resumes": resumes}