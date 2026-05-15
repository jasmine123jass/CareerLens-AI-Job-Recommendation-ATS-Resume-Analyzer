from pymongo import MongoClient
from app.config import MONGO_URI, DB_NAME

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

users_collection = db["users"]
resumes_collection = db["resumes"]
jobs_collection = db["jobs"]
saved_jobs_collection = db["saved_jobs"]
applied_jobs_collection = db["applied_jobs"]