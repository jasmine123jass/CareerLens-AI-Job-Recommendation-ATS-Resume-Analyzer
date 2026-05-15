from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..services.auth_service import decode_token
from ..services.matcher import load_jobs
from ..db.database import resumes_collection, saved_jobs_collection, applied_jobs_collection
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/jobs", tags=["jobs"])
security = HTTPBearer()

class SaveJobRequest(BaseModel):
    job: dict

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    email = decode_token(creds.credentials)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

@router.post("/save")
def save_job(body: SaveJobRequest, user_email: str = Depends(get_current_user)):
    doc = {"user_email": user_email, **body.job}
    saved_jobs_collection.insert_one(doc)
    return {"message": "Job saved"}

@router.get("/saved")
def get_saved_jobs(user_email: str = Depends(get_current_user)):
    jobs = list(saved_jobs_collection.find({"user_email": user_email}, {"_id": 0}))
    return {"jobs": jobs}

@router.post("/apply")
def apply_job(body: SaveJobRequest, user_email: str = Depends(get_current_user)):
    doc = {"user_email": user_email, "applied_at": datetime.datetime.utcnow().isoformat(), **body.job}
    applied_jobs_collection.insert_one(doc)
    return {"message": "Job application recorded"}

@router.get("/applied")
def get_applied_jobs(user_email: str = Depends(get_current_user)):
    jobs = list(applied_jobs_collection.find({"user_email": user_email}, {"_id": 0}))
    return {"jobs": jobs}

@router.get("/recommendations")
def get_job_recommendations(user_email: str = Depends(get_current_user)):
    resume = resumes_collection.find_one({"user_email": user_email}, sort=[("uploaded_at", -1)])
    if resume and resume.get("jobs") and len(resume.get("jobs", [])) > 0:
        print(f"[jobs] Returning {len(resume['jobs'])} matched jobs from resume")
        return {"jobs": resume["jobs"][:100]}
    print(f"[jobs] No resume or jobs found, loading full dataset for {user_email}")
    all_jobs = load_jobs()
    print(f"[jobs] Loaded {len(all_jobs)} jobs from dataset")
    return {"jobs": all_jobs[:100]}
