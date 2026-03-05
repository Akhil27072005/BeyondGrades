"""
Deterministic matching heuristics for Beyond Grades
Implements the exact scoring algorithm as specified:
- Weights: domain=0.30, skill=0.45, expertise=0.25
- Level mapping: beginner=1, intermediate=2, advanced=3, expert=4
- Evidence scoring with bonuses for repo, demo, etc.
"""

from typing import List, Dict, Any, Optional
import math
from datetime import datetime, timedelta

class MatchingEngine:
    def __init__(self):
        # Weights as specified
        self.W_DOMAIN = 0.30
        self.W_SKILLS = 0.45
        self.W_EXPERTISE = 0.25
        
        # Level mapping
        self.LEVEL_MAPPING = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3,
            'expert': 4
        }
        
        # Domain mapping for partial matches
        self.DOMAIN_MAPPING = {
            'web development': ['sde', 'frontend', 'backend', 'fullstack'],
            'mobile development': ['ios', 'android', 'mobile'],
            'data science': ['ml', 'ai', 'analytics', 'data'],
            'cloud computing': ['devops', 'aws', 'azure', 'cloud'],
            'blockchain': ['web3', 'defi', 'crypto'],
            'cybersecurity': ['security', 'penetration', 'vulnerability']
        }

    def calculate_domain_score(self, job_domain: str, student_projects: List[Dict]) -> float:
        """
        Calculate domain score based on project domain tags
        Returns 1.0 for exact match, 0.5 for partial match, 0.0 for no match
        """
        if not student_projects:
            return 0.0
            
        # Check for exact domain match in any project
        for project in student_projects:
            domain_tags = project.get('domainTags', [])
            if job_domain.lower() in [tag.lower() for tag in domain_tags]:
                return 1.0
        
        # Check for partial domain match
        job_domain_lower = job_domain.lower()
        if job_domain_lower in self.DOMAIN_MAPPING:
            partial_domains = self.DOMAIN_MAPPING[job_domain_lower]
            for project in student_projects:
                domain_tags = project.get('domainTags', [])
                for tag in domain_tags:
                    if any(partial in tag.lower() for partial in partial_domains):
                        return 0.5
        
        return 0.0

    def calculate_skill_score(self, required_skills: List[Dict], student_skills: List[Dict]) -> float:
        """
        Calculate skill score based on required skills vs student skills
        Uses weighted average with level matching
        """
        if not required_skills:
            return 0.0
            
        total_weight = sum(skill.get('weight', 1.0) for skill in required_skills)
        if total_weight == 0:
            return 0.0
            
        weighted_score = 0.0
        
        for req_skill in required_skills:
            skill_name = req_skill.get('name', '').lower()
            required_level = req_skill.get('requiredLevel', 'beginner')
            weight = req_skill.get('weight', 1.0)
            
            # Find matching student skill
            student_skill = None
            for skill in student_skills:
                if skill.get('name', '').lower() == skill_name:
                    student_skill = skill
                    break
            
            if not student_skill:
                # No matching skill found
                match_score = 0.0
            else:
                student_level = student_skill.get('level', 'beginner')
                student_level_num = self.LEVEL_MAPPING.get(student_level, 1)
                required_level_num = self.LEVEL_MAPPING.get(required_level, 1)
                
                if student_level_num >= required_level_num:
                    match_score = 1.0
                elif student_level_num > 1:  # Has some level of the skill
                    match_score = 0.5
                else:
                    match_score = 0.0
            
            weighted_score += match_score * weight
        
        return weighted_score / total_weight

    def calculate_evidence_score(self, project: Dict, required_skills: List[Dict]) -> float:
        """
        Calculate evidence score for a project based on skill matches and bonuses
        """
        project_skill_tags = project.get('skillTags', [])
        required_skill_names = [skill.get('name', '').lower() for skill in required_skills]
        
        # Tag match ratio
        matched_skills = 0
        for tag in project_skill_tags:
            if any(req_skill in tag.lower() for req_skill in required_skill_names):
                matched_skills += 1
        
        tag_match_ratio = matched_skills / max(len(required_skill_names), 1)
        
        # Bonuses
        repo_bonus = 0.10 if project.get('repoUrl') else 0.0
        demo_bonus = 0.05 if project.get('demoUrl') else 0.0
        github_stars_bonus = 0.0  # Would need GitHub API integration
        recency_boost = 0.0  # Would need project date comparison
        
        # Calculate raw score
        raw_score = 0.7 * tag_match_ratio + repo_bonus + demo_bonus + github_stars_bonus + recency_boost
        
        return min(raw_score, 1.0)

    def calculate_expertise_score(self, required_skills: List[Dict], student_projects: List[Dict]) -> float:
        """
        Calculate expertise score based on project evidence
        """
        if not required_skills or not student_projects:
            return 0.0
            
        total_weight = sum(skill.get('weight', 1.0) for skill in required_skills)
        if total_weight == 0:
            return 0.0
            
        weighted_expertise = 0.0
        
        for req_skill in required_skills:
            skill_name = req_skill.get('name', '').lower()
            weight = req_skill.get('weight', 1.0)
            
            # Find maximum evidence for this skill across all projects
            max_evidence = 0.0
            for project in student_projects:
                project_skill_tags = project.get('skillTags', [])
                if any(skill_name in tag.lower() for tag in project_skill_tags):
                    evidence = self.calculate_evidence_score(project, [req_skill])
                    max_evidence = max(max_evidence, evidence)
            
            weighted_expertise += max_evidence * weight
        
        return weighted_expertise / total_weight

    def get_matched_skills(self, required_skills: List[Dict], student_skills: List[Dict]) -> List[Dict]:
        """
        Get list of matched skills with details
        """
        matched_skills = []
        
        for req_skill in required_skills:
            skill_name = req_skill.get('name', '')
            required_level = req_skill.get('requiredLevel', 'beginner')
            
            # Find matching student skill
            student_skill = None
            for skill in student_skills:
                if skill.get('name', '').lower() == skill_name.lower():
                    student_skill = skill
                    break
            
            if student_skill:
                student_level = student_skill.get('level', 'beginner')
                student_level_num = self.LEVEL_MAPPING.get(student_level, 1)
                required_level_num = self.LEVEL_MAPPING.get(required_level, 1)
                
                if student_level_num >= required_level_num:
                    match_score = 1.0
                elif student_level_num > 1:
                    match_score = 0.5
                else:
                    match_score = 0.0
            else:
                student_level = 'none'
                match_score = 0.0
            
            matched_skills.append({
                'name': skill_name,
                'requiredLevel': required_level,
                'studentLevel': student_level,
                'matchScore': match_score
            })
        
        return matched_skills

    def get_matched_projects(self, required_skills: List[Dict], student_projects: List[Dict]) -> List[Dict]:
        """
        Get list of matched projects with evidence scores
        """
        matched_projects = []
        
        for project in student_projects:
            evidence_score = self.calculate_evidence_score(project, required_skills)
            if evidence_score > 0:
                matched_projects.append({
                    'projectId': str(project.get('_id', '')),
                    'title': project.get('title', ''),
                    'evidenceScore': evidence_score,
                    'evidenceExplanation': f"Project matches {evidence_score:.2%} of required skills"
                })
        
        # Sort by evidence score
        matched_projects.sort(key=lambda x: x['evidenceScore'], reverse=True)
        return matched_projects

    def generate_reasons(self, domain_score: float, skill_score: float, expertise_score: float, 
                        matched_skills: List[Dict], matched_projects: List[Dict]) -> List[str]:
        """
        Generate explainable reasons for the match
        """
        reasons = []
        
        # Domain reasons
        if domain_score >= 1.0:
            reasons.append("Perfect domain match with project experience")
        elif domain_score >= 0.5:
            reasons.append("Good domain alignment with relevant projects")
        elif domain_score > 0:
            reasons.append("Some domain relevance in projects")
        else:
            reasons.append("Limited domain experience")
        
        # Skill reasons
        strong_skills = [s for s in matched_skills if s['matchScore'] >= 1.0]
        partial_skills = [s for s in matched_skills if 0 < s['matchScore'] < 1.0]
        
        if strong_skills:
            skill_names = [s['name'] for s in strong_skills]
            reasons.append(f"Strong skills in: {', '.join(skill_names)}")
        
        if partial_skills:
            skill_names = [s['name'] for s in partial_skills]
            reasons.append(f"Developing skills in: {', '.join(skill_names)}")
        
        # Project reasons
        if matched_projects:
            top_project = matched_projects[0]
            reasons.append(f"Strong project: {top_project['title']} ({top_project['evidenceScore']:.2%} match)")
        
        # Overall assessment
        total_score = (self.W_DOMAIN * domain_score + 
                      self.W_SKILLS * skill_score + 
                      self.W_EXPERTISE * expertise_score)
        
        if total_score >= 0.8:
            reasons.append("Excellent overall match")
        elif total_score >= 0.6:
            reasons.append("Good match with strong potential")
        elif total_score >= 0.4:
            reasons.append("Moderate match with some gaps")
        else:
            reasons.append("Limited match - consider for junior role")
        
        return reasons

    def calculate_final_score(self, domain_score: float, skill_score: float, expertise_score: float) -> float:
        """
        Calculate final weighted score
        """
        return (self.W_DOMAIN * domain_score + 
                self.W_SKILLS * skill_score + 
                self.W_EXPERTISE * expertise_score)

    def match_students(self, job_data: Dict, students_data: List[Dict], 
                      required_skills: List[Dict], allow_hired: bool = False) -> List[Dict]:
        """
        Main matching function that processes all students and returns ranked results
        """
        results = []
        
        for student in students_data:
            # Skip if student is hired (unless allow_hired is True)
            if not allow_hired and student.get('hired', False):
                continue
            
            # Get student data
            student_skills = student.get('skills', [])
            student_projects = student.get('projects', [])
            
            # Calculate individual scores
            domain_score = self.calculate_domain_score(job_data.get('domain', ''), student_projects)
            skill_score = self.calculate_skill_score(required_skills, student_skills)
            expertise_score = self.calculate_expertise_score(required_skills, student_projects)
            
            # Calculate final score
            final_score = self.calculate_final_score(domain_score, skill_score, expertise_score)
            
            # Get detailed matches
            matched_skills = self.get_matched_skills(required_skills, student_skills)
            matched_projects = self.get_matched_projects(required_skills, student_projects)
            
            # Generate reasons
            reasons = self.generate_reasons(domain_score, skill_score, expertise_score, 
                                         matched_skills, matched_projects)
            
            results.append({
                'studentId': str(student.get('_id', '')),
                'score': round(final_score, 4),
                'skillScore': round(skill_score, 4),
                'domainScore': round(domain_score, 4),
                'expertiseScore': round(expertise_score, 4),
                'matchedSkills': matched_skills,
                'matchedProjects': matched_projects,
                'reasons': reasons
            })
        
        # Sort by final score (descending)
        results.sort(key=lambda x: x['score'], reverse=True)
        
        return results
