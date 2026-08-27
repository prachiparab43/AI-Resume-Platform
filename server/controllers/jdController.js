const db = require("../config/db");
const axios = require("axios");

exports.createJD = async (req, res) => {
    try {
        const { title, raw_text } = req.body;

        if (!title || !raw_text) {
            return res.status(400).json({
                message: "Job title and description are required"
            });
        }

        const hrId = req.user.user_id;

        // Send JD to Python NLP service
        const nlpResponse = await axios.post(
            "http://127.0.0.1:8000/nlp/extract-jd",
            {
                text: raw_text
            }
        );

        const extractedSkills =
            nlpResponse.data.skills || [];

        const sql = `
            INSERT INTO JobDescriptions
            (hr_id, title, raw_text)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [hrId, title, raw_text],
            (err, result) => {
                if (err) {
                    console.error(
                        "JD insert error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Failed to create job description"
                    });
                }

                const jdId = result.insertId;

                // Save extracted skills
                if (extractedSkills.length > 0) {

                    const skillValues =
                        extractedSkills.map(skill => [
                            jdId,
                            skill.skill_name,
                            true
                        ]);

                    const skillSql = `
                        INSERT INTO JobSkills
                        (
                            jd_id,
                            skill_name,
                            is_required
                        )
                        VALUES ?
                    `;

                    db.query(
                        skillSql,
                        [skillValues],
                        (skillErr) => {
                            if (skillErr) {
                                console.error(
                                    "Job skill insert error:",
                                    skillErr
                                );

                                return res.status(500).json({
                                    message:
                                        "JD saved, but skills could not be saved"
                                });
                            }

                            return res.status(201).json({
                                message:
                                    "Job description created and analyzed successfully",
                                jd_id: jdId,
                                title,
                                skills: extractedSkills
                            });
                        }
                    );

                } else {

                    return res.status(201).json({
                        message:
                            "Job description created successfully",
                        jd_id: jdId,
                        title,
                        skills: []
                    });
                }
            }
        );

    } catch (error) {

        console.error(
            "JD processing error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message:
                "Job description processing failed"
        });
    }
};
exports.getRankings = (req, res) => {
    try {
        const jdId = req.params.id;
        const hrId = req.user.user_id;

        // First verify that this JD belongs to the logged-in HR
        const checkJdSql = `
            SELECT jd_id
            FROM JobDescriptions
            WHERE jd_id = ?
            AND hr_id = ?
        `;

        db.query(
            checkJdSql,
            [jdId, hrId],
            (jdErr, jdResults) => {
                if (jdErr) {
                    console.error("JD check error:", jdErr);

                    return res.status(500).json({
                        message: "Failed to verify job description"
                    });
                }

                if (jdResults.length === 0) {
                    return res.status(404).json({
                        message: "Job description not found"
                    });
                }

                /*
                    Get the latest screening result
                    for every resume analyzed against this JD.
                */
                const rankingSql = `
                    SELECT
                        sr.result_id,
                        sr.resume_id,
                        sr.jd_id,
                        sr.ats_score,
                        sr.skill_match_pct,
                        sr.keyword_match_pct,
                        sr.experience_match_pct,
                        sr.education_match_pct,
                        sr.project_relevance_pct,
                        sr.missing_skills,
                        sr.recommendations,
                        u.user_id,
                        u.name,
                        u.email
                    FROM ScreeningResults sr

                    INNER JOIN (
                        SELECT
                            resume_id,
                            jd_id,
                            MAX(result_id) AS latest_result_id
                        FROM ScreeningResults
                        WHERE jd_id = ?
                        GROUP BY resume_id, jd_id
                    ) latest
                    ON sr.result_id = latest.latest_result_id

                    INNER JOIN Resumes r
                    ON sr.resume_id = r.resume_id

                    INNER JOIN Users u
                    ON r.user_id = u.user_id

                    WHERE sr.jd_id = ?

                    ORDER BY sr.ats_score DESC
                `;

                db.query(
                    rankingSql,
                    [jdId, jdId],
                    (rankingErr, results) => {
                        if (rankingErr) {
                            console.error(
                                "Ranking fetch error:",
                                rankingErr
                            );

                            return res.status(500).json({
                                message:
                                    "Failed to calculate rankings"
                            });
                        }

                        if (results.length === 0) {
                            return res.status(200).json({
                                message:
                                    "No candidates have been analyzed for this job yet",
                                rankings: []
                            });
                        }

                        // Generate rank + status
                        const rankings = results.map(
                            (candidate, index) => {

                                const score = Number(
                                    candidate.ats_score
                                );

                                let status;

                                if (score >= 75) {
                                    status = "shortlisted";
                                } else if (score >= 50) {
                                    status = "review";
                                } else {
                                    status = "not_recommended";
                                }

                                return {
                                    ...candidate,
                                    rank_position: index + 1,
                                    status
                                };
                            }
                        );

                        /*
                            Remove previous ranking records
                            for this particular JD.
                        */

                        const deleteSql = `
                            DELETE FROM CandidateRankings
                            WHERE jd_id = ?
                        `;

                        db.query(
                            deleteSql,
                            [jdId],
                            (deleteErr) => {
                                if (deleteErr) {
                                    console.error(
                                        "Old ranking delete error:",
                                        deleteErr
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Failed to refresh rankings"
                                    });
                                }

                                const rankingValues =
                                    rankings.map(candidate => [
                                        jdId,
                                        candidate.resume_id,
                                        candidate.ats_score,
                                        candidate.status,
                                        candidate.rank_position
                                    ]);

                                const insertSql = `
                                    INSERT INTO CandidateRankings
                                    (
                                        jd_id,
                                        resume_id,
                                        final_score,
                                        status,
                                        rank_position
                                    )
                                    VALUES ?
                                `;

                                db.query(
                                    insertSql,
                                    [rankingValues],
                                    (insertErr) => {

                                        if (insertErr) {
                                            console.error(
                                                "Ranking insert error:",
                                                insertErr
                                            );

                                            return res.status(500).json({
                                                message:
                                                    "Failed to save rankings"
                                            });
                                        }

                                        return res.status(200).json({
                                            message:
                                                "Candidate rankings generated successfully",

                                            jd_id:
                                                Number(jdId),

                                            total_candidates:
                                                rankings.length,

                                            rankings:
                                                rankings.map(candidate => ({
                                                    rank_position:
                                                        candidate.rank_position,

                                                    resume_id:
                                                        candidate.resume_id,

                                                    candidate_name:
                                                        candidate.name,

                                                    email:
                                                        candidate.email,

                                                    final_score:
                                                        Number(
                                                            candidate.ats_score
                                                        ),

                                                    status:
                                                        candidate.status,

                                                    skill_match_pct:
                                                        Number(
                                                            candidate.skill_match_pct
                                                        ),

                                                    keyword_match_pct:
                                                        Number(
                                                            candidate.keyword_match_pct
                                                        ),

                                                    experience_match_pct:
                                                        Number(
                                                            candidate.experience_match_pct
                                                        ),

                                                    education_match_pct:
                                                        Number(
                                                            candidate.education_match_pct
                                                        ),

                                                    project_relevance_pct:
                                                        Number(
                                                            candidate.project_relevance_pct
                                                        ),

                                                    missing_skills:
                                                        candidate.missing_skills,

                                                    recommendations:
                                                        candidate.recommendations
                                                }))
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );

    } catch (error) {
        console.error("Ranking error:", error);

        return res.status(500).json({
            message: "Candidate ranking failed"
        });
    }
};
exports.getAllJobs = (req, res) => {
    const sql = `
        SELECT
            jd_id,
            title,
            created_at
        FROM JobDescriptions
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(
                "Fetch jobs error:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch jobs"
            });
        }

        return res.status(200).json({
            total_jobs: results.length,
            jobs: results
        });
    });
};
exports.getAllJobs = (req, res) => {
  const sql = `
    SELECT
      jd_id,
      title,
      raw_text,
      created_at
    FROM JobDescriptions
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch jobs error:", err);

      return res.status(500).json({
        message: "Failed to fetch jobs",
      });
    }

    return res.status(200).json({
      total_jobs: results.length,
      jobs: results,
    });
  });
};
exports.getMyJobs = (req, res) => {
  try {
    const hrId = req.user.user_id;

    const sql = `
      SELECT
        jd_id,
        title,
        raw_text,
        created_at
      FROM JobDescriptions
      WHERE hr_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [hrId], (err, results) => {
      if (err) {
        console.error("Fetch HR jobs error:", err);

        return res.status(500).json({
          message: "Failed to fetch your jobs",
        });
      }

      return res.status(200).json({
        total_jobs: results.length,
        jobs: results,
      });
    });
  } catch (error) {
    console.error("Get HR jobs error:", error);

    return res.status(500).json({
      message: "Failed to fetch your jobs",
    });
  }
};