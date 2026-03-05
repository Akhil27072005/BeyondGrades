"""
FastAPI matching microservice for Beyond Grades
Provides deterministic matching endpoints for job-student matching
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
import pymongo
from bson import ObjectId
from matching import MatchingEngine

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Beyond Grades Matcher Service",
    description="Deterministic matching microservice for job-student matching",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/beyondgrades")
client = pymongo.MongoClient(MONGO_URI)
db = client.test  # Use 'test' database to match the server

# Initialize matching engine
matcher = MatchingEngine()

# Pydantic models
class MatchRequest(BaseModel):
    topN: int = 10
    allowHired: bool = False

class MatchResponse(BaseModel):
    results: List[Dict[str, Any]]
    totalCandidates: int
    job: Dict[str, Any]

class CountResponse(BaseModel):
    count: int

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "service": "matcher"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

@app.post("/match/job/{job_id}")
async def match_job(
    job_id: str,
    request: MatchRequest
):
    """
    Match students to a specific job using deterministic heuristics
    """
    try:
        # Debug: Print job_id and ObjectId conversion
        print(f"Looking for job with ID: {job_id}")
        try:
            obj_id = ObjectId(job_id)
            print(f"Converted to ObjectId: {obj_id}")
        except Exception as e:
            print(f"ObjectId conversion failed: {e}")
            raise HTTPException(status_code=400, detail="Invalid job ID format")
        
        # Get job data
        job = db.jobs.find_one({"_id": ObjectId(job_id)})
        print(f"Job found: {job is not None}")
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Get required skills
        required_skills = job.get('requiredSkills', [])
        if not required_skills:
            return MatchResponse(
                results=[],
                totalCandidates=0,
                job={"id": str(job["_id"]), "title": job.get("title", "")}
            )
        
        # Build query for students
        student_query = {}
        
        # Filter by batch target if specified
        batch_target = job.get('batchTarget', [])
        if batch_target:
            student_query['yearOfGraduation'] = {'$in': batch_target}
        
        # Get students with their projects
        students_cursor = db.students.find(student_query)
        students = []
        
        for student in students_cursor:
            # Get student's projects
            projects = list(db.projects.find({"studentId": student["_id"]}))
            
            # Check if student is hired (anti-moonlighting)
            hire_record = db.hires.find_one({
                "studentId": student["_id"],
                "active": True
            })
            
            student_data = {
                "_id": student["_id"],
                "skills": student.get("skills", []),
                "projects": projects,
                "hired": hire_record is not None
            }
            students.append(student_data)
        
        # Filter out hired students if not allowed
        if not request.allowHired:
            students = [s for s in students if not s.get('hired', False)]
        
        # Perform matching
        results = matcher.match_students(
            job_data=job,
            students_data=students,
            required_skills=required_skills,
            allow_hired=request.allowHired
        )
        
        # Limit results and convert ObjectIds to strings
        top_results = results[:request.topN]
        for result in top_results:
            if 'studentId' in result:
                result['studentId'] = str(result['studentId'])
            # Convert any other ObjectIds in the result
            if 'matchedProjects' in result:
                for project in result['matchedProjects']:
                    if 'projectId' in project:
                        project['projectId'] = str(project['projectId'])
        
        return MatchResponse(
            results=top_results,
            totalCandidates=len(students),
            job={
                "id": str(job["_id"]),
                "title": job.get("title", ""),
                "domain": job.get("domain", ""),
                "company": str(job.get("recruiterId", ""))
            }
        )
        
    except Exception as e:
        if "InvalidId" in str(e) or "Invalid" in str(e):
            raise HTTPException(status_code=400, detail="Invalid job ID format")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/match/job/{job_id}/count")
async def get_candidate_count(
    job_id: str,
    allowHired: bool = Query(False, description="Include hired students")
):
    """
    Get count of potential candidates for a job
    """
    try:
        # Get job data
        job = db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Build query for students
        student_query = {}
        
        # Filter by batch target if specified
        batch_target = job.get('batchTarget', [])
        if batch_target:
            student_query['yearOfGraduation'] = {'$in': batch_target}
        
        # Count students
        total_students = db.students.count_documents(student_query)
        
        # Count hired students if needed
        if not allowHired:
            hired_count = db.hires.count_documents({"active": True})
            available_count = total_students - hired_count
        else:
            available_count = total_students
        
        return CountResponse(count=max(0, available_count))
        
    except Exception as e:
        if "InvalidId" in str(e) or "Invalid" in str(e):
            raise HTTPException(status_code=400, detail="Invalid job ID format")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/match/student/{student_id}/jobs")
async def get_student_job_matches(
    student_id: str,
    topN: int = Query(10, description="Number of top matches to return")
):
    """
    Get job matches for a specific student
    """
    try:
        # Get student data
        student = db.students.find_one({"_id": ObjectId(student_id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Get student's projects
        projects = list(db.projects.find({"studentId": student["_id"]}))
        
        # Get all jobs
        jobs = list(db.jobs.find({}))
        
        matches = []
        
        for job in jobs:
            required_skills = job.get('requiredSkills', [])
            if not required_skills:
                continue
            
            # Check if student is hired for this job
            hire_record = db.hires.find_one({
                "studentId": student["_id"],
                "jobId": job["_id"],
                "active": True
            })
            
            if hire_record:
                continue  # Skip if already hired for this job
            
            # Perform matching for this job
            student_data = {
                "_id": student["_id"],
                "skills": student.get("skills", []),
                "projects": projects,
                "hired": False
            }
            
            results = matcher.match_students(
                job_data=job,
                students_data=[student_data],
                required_skills=required_skills,
                allow_hired=False
            )
            
            if results:
                match = results[0]  # Should be only one result
                matches.append({
                    "job": {
                        "id": str(job["_id"]),
                        "title": job.get("title", ""),
                        "domain": job.get("domain", ""),
                        "description": job.get("description", "")
                    },
                    "match": match
                })
        
        # Sort by match score
        matches.sort(key=lambda x: x["match"]["score"], reverse=True)
        
        return {
            "studentId": str(student["_id"]),
            "matches": matches[:topN]
        }
        
    except Exception as e:
        if "InvalidId" in str(e) or "Invalid" in str(e):
            raise HTTPException(status_code=400, detail="Invalid student ID format")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/match/validate")
async def validate_matching_algorithm():
    """
    Validate the matching algorithm with test data
    """
    try:
        # Test data for validation
        test_job = {
            "domain": "web development",
            "requiredSkills": [
                {"name": "JavaScript", "requiredLevel": "advanced", "weight": 1.0},
                {"name": "React", "requiredLevel": "intermediate", "weight": 0.8}
            ]
        }
        
        test_students = [
            {
                "_id": "test1",
                "skills": [
                    {"name": "JavaScript", "level": "expert", "years": 3},
                    {"name": "React", "level": "advanced", "years": 2}
                ],
                "projects": [
                    {
                        "title": "Web App",
                        "skillTags": ["JavaScript", "React", "Node.js"],
                        "domainTags": ["web development"],
                        "repoUrl": "https://github.com/test/webapp"
                    }
                ],
                "hired": False
            }
        ]
        
        # Test matching
        results = matcher.match_students(
            job_data=test_job,
            students_data=test_students,
            required_skills=test_job["requiredSkills"],
            allow_hired=False
        )
        
        return {
            "status": "valid",
            "testResults": results,
            "algorithm": "deterministic",
            "weights": {
                "domain": 0.30,
                "skill": 0.45,
                "expertise": 0.25
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("MATCHER_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
