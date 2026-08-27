CREATE DATABASE IF NOT EXISTS resume_ai;
USE resume_ai;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('candidate','hr') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Resumes (
    resume_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_path VARCHAR(255),
    raw_text LONGTEXT,
    summary TEXT,
    is_builder_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Education (
    education_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    degree VARCHAR(150),
    institution VARCHAR(150),
    cgpa VARCHAR(20),
    start_year INT,
    end_year INT,
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id)
);

CREATE TABLE IF NOT EXISTS Experience (
    experience_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    company VARCHAR(150),
    role VARCHAR(150),
    description TEXT,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id)
);

CREATE TABLE IF NOT EXISTS Projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    title VARCHAR(150),
    description TEXT,
    tech_stack VARCHAR(255),
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id)
);

CREATE TABLE IF NOT EXISTS Certifications (
    cert_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    title VARCHAR(150),
    issuer VARCHAR(150),
    year INT,
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id)
);

CREATE TABLE IF NOT EXISTS ResumeSkills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    skill_name VARCHAR(100),
    skill_type ENUM('technical','soft'),
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id)
);

CREATE TABLE IF NOT EXISTS JobDescriptions (
    jd_id INT AUTO_INCREMENT PRIMARY KEY,
    hr_id INT NOT NULL,
    title VARCHAR(150),
    raw_text LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hr_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS JobSkills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jd_id INT NOT NULL,
    skill_name VARCHAR(100),
    is_required BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (jd_id) REFERENCES JobDescriptions(jd_id)
);

CREATE TABLE IF NOT EXISTS ScreeningResults (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    jd_id INT NOT NULL,
    ats_score DECIMAL(5,2),
    skill_match_pct DECIMAL(5,2),
    keyword_match_pct DECIMAL(5,2),
    experience_match_pct DECIMAL(5,2),
    education_match_pct DECIMAL(5,2),
    project_relevance_pct DECIMAL(5,2),
    missing_skills TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id),
    FOREIGN KEY (jd_id) REFERENCES JobDescriptions(jd_id)
);

CREATE TABLE IF NOT EXISTS CandidateRankings (
    rank_id INT AUTO_INCREMENT PRIMARY KEY,
    jd_id INT NOT NULL,
    resume_id INT NOT NULL,
    final_score DECIMAL(5,2),
    status ENUM('shortlisted','review','not_recommended'),
    rank_position INT,
    FOREIGN KEY (jd_id) REFERENCES JobDescriptions(jd_id),
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id)
);