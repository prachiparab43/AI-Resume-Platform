const db = require("../config/db");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a resume file"
            });
        }

        const userId = req.user.user_id;
        const filePath = req.file.path;

        const formData = new FormData();

        formData.append(
            "file",
            fs.createReadStream(filePath),
            req.file.originalname
        );

        const nlpResponse = await axios.post(
            "http://127.0.0.1:8000/nlp/parse-resume",
            formData,
            {
                headers: formData.getHeaders()
            }
        );

        const extractedText = nlpResponse.data.text || "";
        const extractedSkills = nlpResponse.data.skills || [];
        const extractedSections = nlpResponse.data.sections || {};

        const sql = `
            INSERT INTO Resumes
            (
                user_id,
                file_path,
                raw_text,
                is_builder_generated
            )
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                userId,
                filePath,
                extractedText,
                false
            ],
            (err, result) => {
                if (err) {
                    console.error(
                        "Resume insert error:",
                        err
                    );

                    return res.status(500).json({
                        message: "Failed to save resume"
                    });
                }

                const resumeId = result.insertId;

                if (extractedSkills.length > 0) {
                    const skillValues = extractedSkills.map(
                        (skill) => [
                            resumeId,
                            skill.skill_name,
                            skill.skill_type
                        ]
                    );

                    const skillSql = `
                        INSERT INTO ResumeSkills
                        (
                            resume_id,
                            skill_name,
                            skill_type
                        )
                        VALUES ?
                    `;

                    db.query(
                        skillSql,
                        [skillValues],
                        (skillErr) => {
                            if (skillErr) {
                                console.error(
                                    "Skill insert error:",
                                    skillErr
                                );

                                return res.status(500).json({
                                    message:
                                        "Resume saved, but skills could not be saved"
                                });
                            }

                            return res.status(201).json({
                                message:
                                    "Resume uploaded and analyzed successfully",
                                resume_id: resumeId,
                                filename: req.file.filename,
                                character_count:
                                    extractedText.length,
                                skills: extractedSkills,
                                sections: extractedSections
                            });
                        }
                    );
                } else {
                    return res.status(201).json({
                        message:
                            "Resume uploaded and analyzed successfully",
                        resume_id: resumeId,
                        filename: req.file.filename,
                        character_count:
                            extractedText.length,
                        skills: [],
                        sections: extractedSections
                    });
                }
            }
        );

    } catch (error) {
        console.error(
            "Resume processing error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message: "Resume processing failed",
            error:
                error.response?.data?.detail ||
                error.message
        });
    }
};
exports.analyzeResume = async (req, res) => {
    try {
        const resumeId = req.params.id;
        const { jd_id } = req.body;
        const userId = req.user.user_id;

        if (!jd_id) {
            return res.status(400).json({
                message: "jd_id is required"
            });
        }

        // Get candidate's resume
        const resumeSql = `
            SELECT *
            FROM Resumes
            WHERE resume_id = ?
            AND user_id = ?
        `;

        db.query(
            resumeSql,
            [resumeId, userId],
            (resumeErr, resumeResults) => {

                if (resumeErr) {
                    console.error(resumeErr);

                    return res.status(500).json({
                        message: "Failed to fetch resume"
                    });
                }

                if (resumeResults.length === 0) {
                    return res.status(404).json({
                        message: "Resume not found"
                    });
                }

                const resume = resumeResults[0];

                // Get job description
                const jdSql = `
                    SELECT *
                    FROM JobDescriptions
                    WHERE jd_id = ?
                `;

                db.query(
                    jdSql,
                    [jd_id],
                    async (jdErr, jdResults) => {

                        if (jdErr) {
                            console.error(jdErr);

                            return res.status(500).json({
                                message:
                                    "Failed to fetch job description"
                            });
                        }

                        if (jdResults.length === 0) {
                            return res.status(404).json({
                                message:
                                    "Job description not found"
                            });
                        }

                        const jd = jdResults[0];

                        try {
                            // Send resume + JD to Python
                            const nlpResponse = await axios.post(
                                "http://127.0.0.1:8000/nlp/match",
                                {
                                    resume_text:
                                        resume.raw_text || "",
                                    jd_text:
                                        jd.raw_text || ""
                                }
                            );

                            const result = nlpResponse.data;

                            const recommendations =
                                JSON.stringify(
                                    result.recommendations || []
                                );

                            const missingSkills =
                                JSON.stringify(
                                    result.missing_skills || []
                                );

                            const screeningSql = `
                                INSERT INTO ScreeningResults
                                (
                                    resume_id,
                                    jd_id,
                                    ats_score,
                                    skill_match_pct,
                                    keyword_match_pct,
                                    experience_match_pct,
                                    education_match_pct,
                                    project_relevance_pct,
                                    missing_skills,
                                    recommendations
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `;

                            db.query(
                                screeningSql,
                                [
                                    resumeId,
                                    jd_id,
                                    result.ats_score,
                                    result.skill_match_pct,
                                    result.keyword_match_pct,
                                    result.experience_match_pct,
                                    result.education_match_pct,
                                    result.project_relevance_pct,
                                    missingSkills,
                                    recommendations
                                ],
                                (screenErr, screenResult) => {

                                    if (screenErr) {
                                        console.error(screenErr);

                                        return res.status(500).json({
                                            message:
                                                "Failed to save screening result"
                                        });
                                    }

                                    return res.status(201).json({
                                        message:
                                            "Resume analyzed successfully",

                                        result_id:
                                            screenResult.insertId,

                                        resume_id:
                                            Number(resumeId),

                                        jd_id:
                                            Number(jd_id),

                                        analysis: result
                                    });
                                }
                            );

                        } catch (nlpError) {
                            console.error(
                                nlpError.response?.data ||
                                nlpError.message
                            );

                            return res.status(500).json({
                                message:
                                    "NLP matching service failed"
                            });
                        }
                    }
                );
            }
        );

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Resume analysis failed"
        });
    }
};
