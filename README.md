# CareerLens-AI-Job-Recommendation-ATS-Resume-Analyzer

# Project Statement

CareerLens is an AI-powered career assistance platform designed to help students, freshers, and job seekers improve their resumes, analyze ATS compatibility, and receive intelligent job recommendations based on their skills and experience.
Traditional job portals only display jobs, but they do not analyze whether a candidate’s resume is suitable for ATS systems or whether the candidate’s skills match industry requirements. CareerLens solves this problem using NLP and machine learning techniques.

The system allows users to:

Upload resumes in PDF/DOCX format
Analyze ATS score
Extract skills automatically
Identify missing keywords
Generate improvement suggestions
Recommend jobs based on resume skills
Save and apply to jobs
Build ATS-friendly resumes
Manage user profiles professionally

The platform combines modern frontend technologies, backend APIs, machine learning models, and NLP techniques to create a smart AI-driven recruitment assistance system.

# Main Objectives
Build an intelligent ATS resume analyzer.
Provide AI-based job recommendations.
Automatically extract skills from resumes.
Improve candidate-job matching.
Help users create ATS-friendly resumes.
Build a professional career guidance platform.
# Problem Statement

Many candidates apply for jobs without knowing:

Whether their resume is ATS friendly
Whether required keywords are missing
Whether their skills match the job role
Which jobs are suitable for their profile

Recruiters use ATS systems to filter resumes before human review. Many resumes get rejected because they:

Lack technical keywords
Have poor formatting
Miss certifications/projects
Do not match role-specific skills

CareerLens helps solve this issue using AI and NLP.

# Tech Stack Used
Frontend
React.js
Vite
Tailwind CSS
Axios
React Hooks
LocalStorage
Backend
FastAPI
Python
REST APIs
JWT Authentication
Uvicorn Server
Database
MongoDB
PyMongo
Machine Learning / NLP
Scikit-learn
TF-IDF Vectorization
Cosine Similarity
Named Entity Recognition (NER)
Keyword Extraction
Resume Parsing
Semantic Matching
Libraries Used
pdfminer.six
python-docx
reportlab
pandas
numpy
scikit-learn
pymongo
fastapi
uvicorn
python-jose
passlib

# System Architecture

The project consists of three major modules:

# Frontend Layer
Backend API Layer
NLP/ML Processing Layer
Frontend Layer

The frontend is built using React.js and Tailwind CSS.

Responsibilities:

User authentication
Resume upload UI
Dashboard display
ATS score visualization
Job recommendation display
Profile management
Resume builder interface

Important Pages:

Login Page
Signup Page
Dashboard
Resume Analyzer
Job Match Page
Saved Jobs
Profile Section
Resume Builder
# Backend Layer

The backend is built using FastAPI.

Responsibilities:

Handle API requests
Resume processing
ATS scoring
Job recommendation logic
Authentication
MongoDB communication
Resume PDF generation

Important Routes:

/auth
/resume
/jobs
/profile
/editor
# Database Layer

MongoDB stores:

User accounts
Profile information
Uploaded resumes
Saved jobs
Applied jobs
ATS reports

Collections:

users
resumes
jobs
saved_jobs
applied_jobs
# NLP Techniques Used
1. Resume Parsing

The uploaded PDF/DOCX resume is converted into raw text using:

pdfminer.six
python-docx

The extracted text is then analyzed.

2. Skill Extraction

The system compares resume text against predefined skill datasets.

Example skills:

Python
React
Machine Learning
SQL
FastAPI
JavaScript

The extracted skills are used for:

ATS scoring
Job recommendation
Skill gap analysis
3. Keyword Extraction

Important resume keywords are extracted using NLP preprocessing.

Steps:

Tokenization
Lowercasing
Stopword removal
Frequency analysis
4. Named Entity Recognition (NER)

NER is used to identify:

Name
Email
Phone number
Education
Experience

Example:

Input Resume:

“Baggam Srujitha Jasmine Python Developer Email: abc@gmail.com”

Extracted Information:

Name
Email
Skills
Experience
5. TF-IDF Vectorization

TF-IDF converts resume text and job descriptions into numerical vectors.

Purpose:

Compare similarity between resume and job descriptions
Improve recommendation accuracy
6. Cosine Similarity

Cosine similarity measures how closely a resume matches a job description.

Higher similarity = better recommendation.

Used for:

Job ranking
Match percentage calculation
# ATS Score Logic

The ATS score is calculated based on:

Resume skills
Keywords
Certifications
Projects
Word count
Resume formatting
Action verbs

Score Range:

90–100 → Excellent
70–89 → Good
Below 70 → Needs Improvement

If score is low, the system shows suggestions.

Example Suggestions:

Add role-specific keywords
Improve project descriptions
Include certifications
Add measurable achievements
# Job Recommendation Workflow

Step 1: User uploads resume.

Step 2: Resume parser extracts text.

Step 3: Skills are extracted.

Step 4: TF-IDF vectorization converts skills and jobs into vectors.

Step 5: Cosine similarity calculates match percentage.

Step 6: Top matching jobs are displayed.

# Displayed Information:

Job title
Company name
Location
Match percentage
Salary
Required skills
Apply button
Resume Builder Workflow

The Resume Builder allows users to:

Add personal details
Add education
Add projects
Add certifications
Add technical skills

The backend generates ATS-friendly PDF resumes using ReportLab.

Templates:

Minimal Professional
Modern Tech
Corporate Clean
Authentication System

Authentication uses JWT token-based login.

Features:

Signup
Login
Logout
Protected routes
Token validation
Features Implemented
Core Features
User Authentication
Resume Upload
ATS Resume Analyzer
Skill Extraction
Keyword Extraction
Job Recommendation
Saved Jobs
Applied Jobs
Resume Builder
PDF Resume Download
User Profile Management
Sidebar Navigation
UI Features
Responsive Design
Modern Dashboard
Loading Animations
ATS Score Visualization
Match Percentage Cards
Profile Completion Tracker
Project Workflow
Step-by-Step Flow
User creates account
User logs in
User uploads resume
Backend parses resume
NLP extracts skills and keywords
ATS score is generated
Suggestions are displayed
Job matching algorithm runs
Recommended jobs displayed
User can save/apply jobs
User can edit profile
User can generate ATS-friendly resume
Folder Structure Explanation
Backend

app/routes

Contains API endpoints.

Examples:

auth.py → login/signup
resume.py → resume upload
jobs.py → job recommendation
profile.py → profile management
editor.py → PDF resume generation

app/services

Contains business logic.

Examples:

parser.py
ats_scorer.py
matcher.py

app/nlp

Contains NLP modules.

Examples:

skill_extractor.py
keyword_extractor.py
ner_pipeline.py

app/db

MongoDB connection files.

Frontend Structure

pages/

Contains all major pages.

components/

Reusable UI components.

api/

Axios API communication.

context/

Authentication context.

Advantages of the System
Faster job matching
ATS-friendly resume analysis
Reduces manual job search effort
Improves resume quality
Helps freshers identify missing skills
Professional AI-powered interface
Future Enhancements
Real-time LinkedIn integration
AI chatbot career assistant
Interview preparation module
Voice-based resume analysis
AI cover letter generation
Multi-language resume support
Cloud deployment
# Conclusion

CareerLens is a complete AI-powered recruitment assistance platform that combines:

NLP
Machine Learning
Resume Parsing
Semantic Job Matching
ATS Optimization

The project demonstrates how artificial intelligence can simplify the recruitment process and help candidates improve their career opportunities.

It provides a professional modern solution for resume analysis, ATS optimization, and intelligent job recommendation
