from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel

from extractors.resume_extractor import extract_resume_text
from matcher.resume_parser import extract_sections, extract_skills
from matcher.scorer import (
    calculate_skill_match,
    calculate_keyword_match,
    calculate_completeness,
    calculate_ats_score
)

app = FastAPI(
    title="AI Resume NLP Service",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "AI Resume NLP Service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.post("/nlp/extract-resume")
async def extract_resume(file: UploadFile = File(...)):
    try:
        filename = file.filename

        if not filename:
            raise HTTPException(
                status_code=400,
                detail="Filename is missing"
            )

        if not (
            filename.lower().endswith(".pdf")
            or filename.lower().endswith(".docx")
        ):
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are allowed"
            )

        file_bytes = await file.read()

        extracted_text = extract_resume_text(
            file_bytes,
            filename
        )

        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the resume"
            )

        return {
            "success": True,
            "filename": filename,
            "character_count": len(extracted_text),
            "text": extracted_text
        }

    except HTTPException:
        raise

    except Exception as error:
        print(error)

        raise HTTPException(
            status_code=500,
            detail="Resume text extraction failed"
        )


@app.post("/nlp/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    try:
        filename = file.filename

        if not filename:
            raise HTTPException(
                status_code=400,
                detail="Filename is missing"
            )

        if not (
            filename.lower().endswith(".pdf")
            or filename.lower().endswith(".docx")
        ):
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are allowed"
            )

        file_bytes = await file.read()

        text = extract_resume_text(
            file_bytes,
            filename
        )

        if not text:
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the resume"
            )

        sections = extract_sections(text)
        skills = extract_skills(text)

        return {
            "success": True,
            "filename": filename,
            "text": text,
            "skills": skills,
            "sections": sections
        }

    except HTTPException:
        raise

    except Exception as error:
        print(error)

        raise HTTPException(
            status_code=500,
            detail="Resume parsing failed"
        )


class JDRequest(BaseModel):
    text: str
class MatchRequest(BaseModel):
    resume_text: str
    jd_text: str


@app.post("/nlp/extract-jd")
def extract_jd(request: JDRequest):
    try:
        if not request.text.strip():
            raise HTTPException(
                status_code=400,
                detail="Job description text is required"
            )

        skills = extract_skills(request.text)

        return {
            "success": True,
            "skills": skills
        }

    except HTTPException:
        raise

    except Exception as error:
        print(error)

        raise HTTPException(
            status_code=500,
            detail="Job description extraction failed"
        )
@app.post("/nlp/match")
def match_resume(request: MatchRequest):
    try:
        resume_text = request.resume_text
        jd_text = request.jd_text

        resume_skills = extract_skills(resume_text)
        jd_skills = extract_skills(jd_text)

        sections = extract_sections(resume_text)

        skill_match, matched_skills, missing_skills = (
            calculate_skill_match(
                resume_skills,
                jd_skills
            )
        )

        keyword_match = calculate_keyword_match(
            resume_text,
            jd_text
        )

        experience_match = (
            100.0
            if sections.get("experience", "").strip()
            else 0.0
        )

        education_match = (
            100.0
            if sections.get("education", "").strip()
            else 0.0
        )

        project_relevance = (
            100.0
            if sections.get("projects", "").strip()
            else 0.0
        )

        completeness = calculate_completeness(
            sections
        )

        ats_score = calculate_ats_score(
            skill_match,
            keyword_match,
            experience_match,
            education_match,
            project_relevance,
            completeness
        )

        recommendations = []

        for skill in missing_skills:
            recommendations.append(
                f"Add {skill} experience if you have worked with it."
            )

        return {
            "success": True,
            "ats_score": ats_score,
            "skill_match_pct": skill_match,
            "keyword_match_pct": keyword_match,
            "experience_match_pct": experience_match,
            "education_match_pct": education_match,
            "project_relevance_pct": project_relevance,
            "completeness_pct": completeness,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "recommendations": recommendations
        }

    except Exception as error:
        print(error)

        raise HTTPException(
            status_code=500,
            detail="Resume matching failed"
        )