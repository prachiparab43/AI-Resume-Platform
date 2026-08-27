import re
import json
import os


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

SKILLS_FILE = os.path.join(
    BASE_DIR,
    "data",
    "skills_taxonomy.json"
)


def load_skills():
    with open(
        SKILLS_FILE,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


SKILL_TAXONOMY = load_skills()


def extract_sections(text):
    sections = {
        "education": "",
        "experience": "",
        "projects": "",
        "skills": "",
        "certifications": ""
    }

    headings = {
        "education": [
            "education",
            "academic",
            "academics"
        ],
        "experience": [
            "experience",
            "work experience",
            "internship",
            "internships"
        ],
        "projects": [
            "projects",
            "project"
        ],
        "skills": [
            "skills",
            "technical skills",
            "technical expertise"
        ],
        "certifications": [
            "certifications",
            "certificates"
        ]
    }

    lines = text.splitlines()

    current_section = None

    for line in lines:
        clean_line = line.strip()
        lower_line = clean_line.lower()

        found_section = None

        for section_name, keywords in headings.items():
            if lower_line in keywords:
                found_section = section_name
                break

        if found_section:
            current_section = found_section
            continue

        if current_section and clean_line:
            sections[current_section] += clean_line + "\n"

    return sections


def skill_exists(skill, text):
    pattern = r"(?<!\w)" + re.escape(skill) + r"(?!\w)"

    return re.search(
        pattern,
        text,
        flags=re.IGNORECASE
    ) is not None


def extract_skills(text):
    found_skills = []

    for skill_type, skills in SKILL_TAXONOMY.items():

        for skill in skills:

            if skill_exists(skill, text):
                found_skills.append({
                    "skill_name": skill,
                    "skill_type": skill_type
                })

    return found_skills