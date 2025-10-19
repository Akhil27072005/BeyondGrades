# Smart Campus Recruitment Platform: Beyond Grades 🎓

**Beyond Grades** is a full-featured MERN stack platform that transforms campus recruitment by evaluating candidates based on verified skills, hands-on project experience, technical competence, and practical achievements rather than just academic grades. It integrates a dedicated Python microservice for intelligent candidate-job matching, supports customizable scoring and ranking, and provides recruiters, students, and colleges with transparent, data-driven insights to streamline the hiring process.


---

## 🎥 Demo & Access

**Demo Login:**  
- **User:** demo@beyondgrades.com  

| Resource | Link |
|----------|------|
| Working Video Demo | [Watch Here](Insert_YouTube/Vimeo_Link_Here) |
| Live Deployment | [Access Here](Insert_Live_URL_Here) |

---

## 🌟 Core Features

### For Recruiters
- **AI-powered candidate shortlisting**  
- **Skill distribution analytics**  
- **Detailed job creation** with required/optional skills  
- **Hiring management:** track candidates, schedule interviews, and finalize hires  

### For Students
- **Project showcase** with media support & GitHub/Demo links  
- **Skill tracking** with proficiency levels & experience  
- **Personalized job discovery feed**  
- **Online assessments** with automated scoring  

---

## 🏗️ Tech Stack & Architecture

| Layer | Technologies | Details |
|-------|-------------|--------|
| Frontend | React 18, Vite, Bootstrap 5, Axios | Responsive UI with analytics |
| Backend | Node.js, Express, JWT, Bcrypt, Express Validator | Secure API, input validation, GridFS for resumes |
| Matching Service | Python FastAPI, PyMongo, Deterministic Heuristics | High-performance microservice for matching & AI shortlisting |
| Database | MongoDB Atlas | Data & resume storage |
| Media Storage | Cloudinary | Resume & project media hosting |

### Deployment
- **Frontend:** Vercel  
- **Backend & Microservice:** Render  
- **Database:** MongoDB Atlas  

### Security
- JWT-based Role-Based Access Control (RBAC) for **Student**, **Recruiter**, and **Admin** roles

--- 

## 🎯 Advanced Matching System

The platform features a **proprietary matching engine** designed to help recruiters identify the most suitable candidates based on verified skills, project experience, and technical competence. The system focuses on transparency, fairness, and adaptability, without relying on traditional academic grades.

### Key Features
- **Explainable Candidate Rankings:** Provides insights into why candidates are matched to a job.  
- **Customizable Matching Criteria:** Recruiters can adjust priorities based on the role and job criticality.  
- **Intelligent Skill & Domain Tagging:** Automatically identifies and classifies candidate skills and project domains.  
- **Anti-Moonlighting System:** Ensures candidates are not matched across multiple recruiters or companies after being placed.  

> The matching engine is designed for scalability and adaptability while keeping the scoring process **confidential and secure**.

---

## 🖼️ Feature Screenshots

| Feature | Visual | Description |
|---------|-----------|------------|
| Recruiter Shortlist View | ![Recruiter Shortlist](https://res.cloudinary.com/dqcov9axv/image/upload/w_700,h_450/v1760874796/55b9574a-6ef8-4345-af1a-44251a5a7ea9.png) | Ranked candidates with match score and detailed breakdown |
| Student Profile – Project Showcase | ![Student Profile](https://res.cloudinary.com/dqcov9axv/image/upload/w_700,h_450/v1760874600/69fd27c7-aada-4a01-9188-2fd77185234b.png) | Auto-tagging, project media, GitHub/Demo links |
| Skill Distribution Analytics | ![Skill Distribution](https://res.cloudinary.com/dqcov9axv/image/upload/w_700,h_450/0b74bd43-9db5-4344-b5f9-7bc27fdd73b2.png) | Bar chart comparing skills across colleges or batches |
| Job Post Creation Form | ![Job Post Creation](https://res.cloudinary.com/dqcov9axv/image/upload/w_700,h_450/v1760874770/18ad9184-dad8-482d-a128-27f060b5a259.png) | Input form for skills, proficiency, and domain classification |

---
