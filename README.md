# AI Resume Platform

An AI-powered Resume Builder, ATS Screening, and Candidate Ranking platform built using React, Node.js, Express, Python FastAPI, NLP, and MySQL.

The system allows candidates to upload resumes, extracts resume information and skills, compares resumes against job descriptions, calculates an explainable ATS score, identifies missing skills, provides recommendations, and helps HR rank candidates.

---

## Features

### Candidate
- Candidate registration and login
- JWT-based authentication
- PDF/DOCX resume upload
- Resume text extraction
- Automatic skill extraction
- Resume section detection
- Job Description matching
- ATS score calculation
- Matched and missing skills
- Resume improvement recommendations
- Detailed score breakdown

### HR
- HR registration and login
- Create Job Descriptions
- Automatic JD skill extraction
- View candidate rankings
- ATS-based candidate ranking
- Candidate status classification:
  - Shortlisted
  - Review
  - Not Recommended

---

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Multer
- Axios

### NLP Service
- Python
- FastAPI
- PyMuPDF
- python-docx
- Rule-based skill extraction

### Database
- MySQL

### Development Tools
- Git
- GitHub
- Postman
- VS Code
- Swagger / FastAPI Docs

---

## System Architecture

```text
                React Frontend
                      |
                      v
              Node.js / Express
                      |
          +-----------+-----------+
          |                       |
          v                       v
       MySQL DB              FastAPI NLP
                                  |
                     +------------+------------+
                     |            |            |
                     v            v            v
                 PDF/DOCX      Resume       ATS
                 Extraction     Parsing      Matching
```

---

## Project Structure

```text
AI-Resume-Platform/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── nlp-service/
│   ├── data/
│   │   └── skills_taxonomy.json
│   ├── extractors/
│   │   └── resume_extractor.py
│   ├── matcher/
│   │   ├── resume_parser.py
│   │   └── scorer.py
│   ├── main.py
│   └── requirements.txt
│
├── database/
├── docs/
├── .gitignore
└── README.md
```

---

## Application Workflow

### Candidate Flow

```text
Register/Login
      ↓
Upload Resume
      ↓
PDF/DOCX Text Extraction
      ↓
Resume Parsing
      ↓
Skill Extraction
      ↓
Select Job Description
      ↓
ATS Analysis
      ↓
Score + Missing Skills + Recommendations
```

### HR Flow

```text
HR Login
    ↓
Create Job Description
    ↓
JD Skill Extraction
    ↓
Candidates Analyze Resumes
    ↓
ATS Screening Results
    ↓
Candidate Ranking
    ↓
Shortlisted / Review / Not Recommended
```

---

## ATS Scoring

The current scoring engine uses the following weighted components:

| Component | Weight |
|---|---:|
| Skill Match | 35% |
| Keyword Match | 20% |
| Experience Match | 15% |
| Education Match | 10% |
| Project Relevance | 15% |
| Completeness | 5% |

The final ATS score is calculated from the weighted combination of these components.

> Note: The current MVP uses rule-based matching. Semantic similarity using Sentence-BERT is planned as an enhancement.

---

## Candidate Classification

Candidates are classified using their final ATS score:

```text
75 and above  → Shortlisted
50 - 74.99    → Review
Below 50      → Not Recommended
```

---

## Main API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Resume

```text
POST /api/resume/upload
POST /api/resume/:id/analyze
```

### Job Description

```text
POST /api/jd
GET  /api/jd/:id/rankings
```

### NLP Service

```text
GET  /health
POST /nlp/extract-resume
POST /nlp/parse-resume
POST /nlp/extract-jd
POST /nlp/match
```

---

## Database

Main tables include:

```text
Users
Resumes
ResumeSkills
JobDescriptions
JobSkills
ScreeningResults
CandidateRankings
```

### Relationships

```text
Users
  |
  +---- Resumes
  |
  +---- JobDescriptions

Resumes
  |
  +---- ResumeSkills
  |
  +---- ScreeningResults

JobDescriptions
  |
  +---- JobSkills
  |
  +---- ScreeningResults

ScreeningResults
  |
  +---- CandidateRankings
```

---

## Local Setup

### Prerequisites

Install:

- Node.js
- npm
- Python
- MySQL
- Git

---

### 1. Clone Repository

```bash
git clone https://github.com/prachiparab43/AI-Resume-Platform.git
cd AI-Resume-Platform
```

---

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

### 3. Node Backend Setup

Open another terminal:

```bash
cd server
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

Create your own `.env` file for database and JWT configuration.

Do not commit `.env` to GitHub.

---

### 4. NLP Service Setup

Open another terminal:

```bash
cd nlp-service
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload --port 8000
```

NLP service:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Running the Complete Application

The following services should be running:

```text
React Frontend   → http://localhost:5173
Node Backend     → http://localhost:5000
FastAPI NLP      → http://127.0.0.1:8000
MySQL            → Local MySQL Server
```

---

## Security

The project includes:

- Password hashing
- JWT authentication
- Candidate/HR role-based authorization
- Protected backend routes
- Environment variable configuration
- File-type validation

Sensitive files such as `.env`, virtual environments, `node_modules`, and uploaded resumes are excluded from Git.

---

## Screenshots

Screenshots can be added here after the UI is finalized.

Suggested screenshots:

1. Login Page
2. Registration Page
3. Candidate Dashboard
4. Resume Upload
5. ATS Analysis Result
6. HR Dashboard
7. Job Description Creation
8. Candidate Ranking Table

---

## Future Improvements

- Sentence-BERT semantic similarity
- spaCy-based NLP extraction
- Improved experience extraction
- Education requirement matching
- Resume Builder
- Multiple resume templates
- Resume PDF/DOCX export
- Cover letter generator
- Candidate job recommendations
- HR filters and search
- Explainable AI improvements
- Docker deployment
- Cloud deployment

---

## Author

**Prachi Parab**

Computer Engineering Graduate

GitHub: `prachiparab43`

---

## Project Status

**MVP Development — In Progress**

Current completed modules:

- Authentication
- Role-based authorization
- Resume upload
- PDF/DOCX extraction
- Resume parsing
- Skill extraction
- JD creation
- JD skill extraction
- ATS matching
- Missing skill detection
- Recommendations
- Candidate ranking
- Candidate dashboard
- HR dashboard