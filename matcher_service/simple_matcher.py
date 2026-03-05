"""
Simple matching service without FastAPI for compatibility
This provides the core matching functionality
"""

import os
import sys
from dotenv import load_dotenv
from matching import MatchingEngine

# Load environment variables
load_dotenv()

def test_matching():
    """Test the matching algorithm"""
    print("🧪 Testing Beyond Grades Matching Algorithm")
    print("=" * 50)
    
    # Initialize matching engine
    matcher = MatchingEngine()
    
    # Test job data
    test_job = {
        "domain": "web development",
        "requiredSkills": [
            {"name": "JavaScript", "requiredLevel": "advanced", "weight": 1.0},
            {"name": "React", "requiredLevel": "intermediate", "weight": 0.8},
            {"name": "Node.js", "requiredLevel": "intermediate", "weight": 0.6}
        ]
    }
    
    # Test students
    test_students = [
        {
            "_id": "student1",
            "skills": [
                {"name": "JavaScript", "level": "expert", "years": 4, "confidence": 0.9},
                {"name": "React", "level": "expert", "years": 3, "confidence": 0.9},
                {"name": "Node.js", "level": "advanced", "years": 2, "confidence": 0.8}
            ],
            "projects": [
                {
                    "title": "Full-Stack E-commerce Platform",
                    "skillTags": ["JavaScript", "React", "Node.js", "MongoDB"],
                    "domainTags": ["web development"],
                    "repoUrl": "https://github.com/student1/ecommerce",
                    "demoUrl": "https://ecommerce-demo.com",
                    "evidenceScore": 0.9
                }
            ],
            "hired": False
        },
        {
            "_id": "student2", 
            "skills": [
                {"name": "JavaScript", "level": "intermediate", "years": 2, "confidence": 0.7},
                {"name": "React", "level": "intermediate", "years": 1, "confidence": 0.6}
            ],
            "projects": [
                {
                    "title": "React Dashboard",
                    "skillTags": ["JavaScript", "React"],
                    "domainTags": ["web development"],
                    "repoUrl": "https://github.com/student2/dashboard",
                    "evidenceScore": 0.6
                }
            ],
            "hired": False
        }
    ]
    
    # Run matching
    results = matcher.match_students(
        job_data=test_job,
        students_data=test_students,
        required_skills=test_job["requiredSkills"],
        allow_hired=False
    )
    
    print(f"📊 Matching Results:")
    print("=" * 50)
    
    for i, result in enumerate(results, 1):
        print(f"\n{i}. Student {result['studentId']}")
        print(f"   Overall Score: {result['score']:.3f}")
        print(f"   Domain Score: {result['domainScore']:.3f}")
        print(f"   Skill Score: {result['skillScore']:.3f}")
        print(f"   Expertise Score: {result['expertiseScore']:.3f}")
        
        print(f"\n   Matched Skills:")
        for skill in result['matchedSkills']:
            print(f"     - {skill['name']}: {skill['studentLevel']} vs {skill['requiredLevel']} (Score: {skill['matchScore']:.2f})")
        
        print(f"\n   Reasons:")
        for reason in result['reasons']:
            print(f"     • {reason}")
    
    print(f"\n🎉 Matching Algorithm Test Complete!")
    return results

if __name__ == "__main__":
    test_matching()
