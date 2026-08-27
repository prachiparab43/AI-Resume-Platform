def percentage(part, total):
    if total == 0:
        return 0.0

    return round((part / total) * 100, 2)


def calculate_skill_match(resume_skills, jd_skills):
    resume_names = {
        skill["skill_name"].lower()
        for skill in resume_skills
    }

    jd_names = {
        skill["skill_name"].lower()
        for skill in jd_skills
    }

    if not jd_names:
        return 0.0, [], []

    matched = sorted(resume_names.intersection(jd_names))
    missing = sorted(jd_names - resume_names)

    score = percentage(
        len(matched),
        len(jd_names)
    )

    return score, matched, missing


def calculate_keyword_match(resume_text, jd_text):
    resume_words = set(
        word.lower()
        for word in resume_text.split()
        if len(word) > 3
    )

    jd_words = set(
        word.lower()
        for word in jd_text.split()
        if len(word) > 3
    )

    if not jd_words:
        return 0.0

    common_words = resume_words.intersection(jd_words)

    return percentage(
        len(common_words),
        len(jd_words)
    )


def calculate_completeness(sections):
    required_sections = [
        "education",
        "experience",
        "projects",
        "skills"
    ]

    completed = 0

    for section in required_sections:
        if sections.get(section, "").strip():
            completed += 1

    return percentage(
        completed,
        len(required_sections)
    )


def calculate_ats_score(
    skill_match,
    keyword_match,
    experience_match,
    education_match,
    project_relevance,
    completeness
):
    score = (
        0.35 * skill_match
        + 0.20 * keyword_match
        + 0.15 * experience_match
        + 0.10 * education_match
        + 0.15 * project_relevance
        + 0.05 * completeness
    )

    return round(score, 2)