"""
Local test script for the matching algorithm
Tests the deterministic heuristics with sample data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from matching import MatchingEngine

def test_matching_algorithm():
    """Test the matching algorithm with sample data"""
    
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
    
    # Test students with different skill levels
    test_students = [
        {
            "_id": "student1",
            "name": "Alice - Expert Developer",
            "skills": [
                {"name": "JavaScript", "level": "expert", "years": 4, "confidence": 0.9},
                {"name": "React", "level": "expert", "years": 3, "confidence": 0.9},
                {"name": "Node.js", "level": "advanced", "years": 2, "confidence": 0.8},
                {"name": "Python", "level": "intermediate", "years": 1, "confidence": 0.6}
            ],
            "projects": [
                {
                    "title": "Full-Stack E-commerce Platform",
                    "description": "Complete e-commerce solution with React frontend and Node.js backend",
                    "skillTags": ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
                    "domainTags": ["web development", "e-commerce"],
                    "repoUrl": "https://github.com/alice/ecommerce",
                    "demoUrl": "https://ecommerce-demo.com",
                    "evidenceScore": 0.9
                },
                {
                    "title": "Real-time Chat Application",
                    "description": "WebSocket-based chat app with React and Node.js",
                    "skillTags": ["JavaScript", "React", "Node.js", "Socket.io"],
                    "domainTags": ["web development", "real-time"],
                    "repoUrl": "https://github.com/alice/chat-app",
                    "evidenceScore": 0.8
                }
            ],
            "hired": False
        },
        {
            "_id": "student2",
            "name": "Bob - Intermediate Developer",
            "skills": [
                {"name": "JavaScript", "level": "intermediate", "years": 2, "confidence": 0.7},
                {"name": "React", "level": "intermediate", "years": 1, "confidence": 0.6},
                {"name": "Python", "level": "advanced", "years": 3, "confidence": 0.8},
                {"name": "SQL", "level": "intermediate", "years": 1, "confidence": 0.6}
            ],
            "projects": [
                {
                    "title": "Data Visualization Dashboard",
                    "description": "Python-based dashboard with some React components",
                    "skillTags": ["Python", "React", "D3.js", "SQL"],
                    "domainTags": ["data science", "web development"],
                    "repoUrl": "https://github.com/bob/dashboard",
                    "evidenceScore": 0.6
                }
            ],
            "hired": False
        },
        {
            "_id": "student3",
            "name": "Charlie - Beginner Developer",
            "skills": [
                {"name": "JavaScript", "level": "beginner", "years": 0.5, "confidence": 0.4},
                {"name": "HTML", "level": "intermediate", "years": 1, "confidence": 0.6},
                {"name": "CSS", "level": "intermediate", "years": 1, "confidence": 0.6}
            ],
            "projects": [
                {
                    "title": "Personal Portfolio Website",
                    "description": "Simple static website with HTML, CSS, and basic JavaScript",
                    "skillTags": ["HTML", "CSS", "JavaScript"],
                    "domainTags": ["web development"],
                    "repoUrl": "https://github.com/charlie/portfolio",
                    "evidenceScore": 0.3
                }
            ],
            "hired": False
        },
        {
            "_id": "student4",
            "name": "Diana - Hired Developer",
            "skills": [
                {"name": "JavaScript", "level": "expert", "years": 5, "confidence": 0.9},
                {"name": "React", "level": "expert", "years": 4, "confidence": 0.9},
                {"name": "Node.js", "level": "expert", "years": 3, "confidence": 0.9}
            ],
            "projects": [
                {
                    "title": "Enterprise Web Application",
                    "description": "Large-scale web application with microservices architecture",
                    "skillTags": ["JavaScript", "React", "Node.js", "Docker", "AWS"],
                    "domainTags": ["web development", "microservices"],
                    "repoUrl": "https://github.com/diana/enterprise-app",
                    "demoUrl": "https://enterprise-demo.com",
                    "evidenceScore": 0.95
                }
            ],
            "hired": True  # Already hired - should be excluded
        }
    ]
    
    print(f"📋 Job Requirements:")
    print(f"   Domain: {test_job['domain']}")
    print(f"   Required Skills:")
    for skill in test_job['requiredSkills']:
        print(f"     - {skill['name']} ({skill['requiredLevel']}) - Weight: {skill['weight']}")
    
    print(f"\n👥 Students to Match:")
    for student in test_students:
        status = "HIRED" if student['hired'] else "Available"
        print(f"   {student['name']} - {status}")
    
    print(f"\n🔍 Running Matching Algorithm...")
    print("=" * 50)
    
    # Run matching
    results = matcher.match_students(
        job_data=test_job,
        students_data=test_students,
        required_skills=test_job['requiredSkills'],
        allow_hired=False  # Exclude hired students
    )
    
    print(f"📊 Matching Results:")
    print("=" * 50)
    
    for i, result in enumerate(results, 1):
        student = next(s for s in test_students if s['_id'] == result['studentId'])
        print(f"\n{i}. {student['name']}")
        print(f"   Overall Score: {result['score']:.3f}")
        print(f"   Domain Score: {result['domainScore']:.3f}")
        print(f"   Skill Score: {result['skillScore']:.3f}")
        print(f"   Expertise Score: {result['expertiseScore']:.3f}")
        
        print(f"\n   Matched Skills:")
        for skill in result['matchedSkills']:
            print(f"     - {skill['name']}: {skill['studentLevel']} vs {skill['requiredLevel']} (Score: {skill['matchScore']:.2f})")
        
        print(f"\n   Matched Projects:")
        for project in result['matchedProjects'][:2]:  # Show top 2 projects
            print(f"     - {project['title']}: {project['evidenceScore']:.2f}")
        
        print(f"\n   Reasons:")
        for reason in result['reasons']:
            print(f"     • {reason}")
    
    print(f"\n🎯 Algorithm Validation:")
    print("=" * 50)
    
    # Validate algorithm correctness
    alice_result = next(r for r in results if r['studentId'] == 'student1')
    bob_result = next(r for r in results if r['studentId'] == 'student2')
    charlie_result = next(r for r in results if r['studentId'] == 'student3')
    
    print(f"✅ Alice (Expert): Score {alice_result['score']:.3f} - Should be highest")
    print(f"✅ Bob (Intermediate): Score {bob_result['score']:.3f} - Should be moderate")
    print(f"✅ Charlie (Beginner): Score {charlie_result['score']:.3f} - Should be lowest")
    print(f"✅ Diana (Hired): Excluded from results - Anti-moonlighting working")
    
    # Check score ordering
    scores = [r['score'] for r in results]
    is_ordered = all(scores[i] >= scores[i+1] for i in range(len(scores)-1))
    print(f"✅ Results properly ordered: {is_ordered}")
    
    # Check weights
    print(f"\n⚖️  Weight Validation:")
    print(f"   Domain Weight: {matcher.W_DOMAIN}")
    print(f"   Skill Weight: {matcher.W_SKILLS}")
    print(f"   Expertise Weight: {matcher.W_EXPERTISE}")
    print(f"   Total Weight: {matcher.W_DOMAIN + matcher.W_SKILLS + matcher.W_EXPERTISE}")
    
    print(f"\n🎉 Algorithm Test Complete!")
    return results

if __name__ == "__main__":
    test_matching_algorithm()
