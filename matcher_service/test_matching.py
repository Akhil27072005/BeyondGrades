#!/usr/bin/env python3

import os
import pymongo
from bson import ObjectId
from dotenv import load_dotenv
from matching import MatchingEngine

load_dotenv()

def test_matching():
    try:
        # Connect to database
        client = pymongo.MongoClient(os.getenv('MONGO_URI'))
        db = client.test
        
        # Get a job
        job = db.jobs.find_one({"_id": ObjectId("68e2c58851306b095bb1c5b8")})
        if not job:
            print("❌ Job not found")
            return
        
        print(f"✅ Job found: {job.get('title', 'No title')}")
        print(f"Required skills: {job.get('requiredSkills', [])}")
        
        # Get students
        students_cursor = db.students.find({})
        students = []
        
        for student in students_cursor:
            # Get student's projects
            projects = list(db.projects.find({"studentId": student["_id"]}))
            
            # Check if student is hired
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
        
        print(f"✅ Found {len(students)} students")
        
        # Test matching
        matcher = MatchingEngine()
        required_skills = job.get('requiredSkills', [])
        
        print(f"Testing matching with {len(required_skills)} required skills")
        
        results = matcher.match_students(
            job_data=job,
            students_data=students,
            required_skills=required_skills,
            allow_hired=False
        )
        
        print(f"✅ Matching completed: {len(results)} results")
        for i, result in enumerate(results[:3]):
            print(f"  {i+1}. Student {result.get('studentId', 'Unknown')}: {result.get('score', 0):.3f}")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_matching()
