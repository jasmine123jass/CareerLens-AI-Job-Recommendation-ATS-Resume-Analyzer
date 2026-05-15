from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..services.auth_service import decode_token
from ..db.database import users_collection
from ..models.user import UserProfile

router = APIRouter(prefix="/profile", tags=["profile"])
security = HTTPBearer()

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    email = decode_token(creds.credentials)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

@router.get("/")
def get_profile(user_email: str = Depends(get_current_user)):
    user = users_collection.find_one({"email": user_email}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/")
def update_profile(profile: UserProfile, user_email: str = Depends(get_current_user)):
    update_data = {k: v for k, v in profile.dict().items() if v is not None}
    users_collection.update_one({"email": user_email}, {"$set": update_data})
    return {"message": "Profile updated"}