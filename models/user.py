from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    education: Optional[str]
    skills: Optional[List[str]] = []
    experience: Optional[str]
    certifications: Optional[List[str]] = []
    linkedin: Optional[str]
    github: Optional[str]