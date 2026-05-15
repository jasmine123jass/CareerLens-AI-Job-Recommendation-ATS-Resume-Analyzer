from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from app.services.auth_service import decode_token
from app.services.parser import parse_resume
from app.services.ats_scorer import score_resume
from app.services.resume_builder import build_pdf
from pydantic import BaseModel

router = APIRouter(prefix="/editor", tags=["editor"])
security = HTTPBearer()

class RescoreRequest(BaseModel):
    text: str           # full edited resume text
    target_role: str = ""

class BuildPDFRequest(BaseModel):
    sections: dict      # {summary, experience, skills, education, projects}
    name: str
    email: str
    phone: str

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    email = decode_token(creds.credentials)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

@router.post("/rescore")
def rescore_resume(body: RescoreRequest, user_email: str = Depends(get_current_user)):
    """Re-score edited resume text live"""
    fake_parsed = parse_resume(body.text.encode(), "edited.txt")
    ats = score_resume(fake_parsed)
    return {"ats": ats, "parsed": {k:v for k,v in fake_parsed.items() if k != "raw_text"}}

@router.post("/build-pdf")
def build_resume_pdf(body: BuildPDFRequest, user_email: str = Depends(get_current_user)):
    """Generate ATS-clean PDF from structured sections"""
    pdf_bytes = build_pdf(body.sections, body.name, body.email, body.phone)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ats_resume_{body.name.replace(' ','_')}.pdf"}
    )