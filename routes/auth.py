from fastapi import APIRouter, HTTPException
from ..models.user import UserSignup, UserLogin
from ..services.auth_service import hash_password, verify_password, create_access_token
from ..db.database import users_collection

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
def signup(user: UserSignup):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(user.password)
    doc = {"name": user.name, "email": user.email, "password": hashed,
           "skills": [], "certifications": [], "phone": "", "education": "",
           "experience": "", "linkedin": "", "github": ""}
    users_collection.insert_one(doc)
    token = create_access_token({"sub": user.email})
    return {"token": token, "name": user.name, "email": user.email}

@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return {"token": token, "name": db_user["name"], "email": user.email}