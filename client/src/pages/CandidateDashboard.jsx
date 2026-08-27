import { useEffect, useState } from "react";
import api from "../services/api";

function CandidateDashboard() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jdId, setJdId] = useState("");
  const selectedJob = jobs.find(
  (job) => String(job.jd_id) === String(jdId)
  
);
  const getATSStatus = (score) => {
  const value = Number(score);

  if (value >= 75) {
    return {
      text: "Strong Match",
      className: "ats-strong",
    };
  }

  if (value >= 50) {
    return {
      text: "Moderate Match",
      className: "ats-moderate",
    };
  }

  return {
    text: "Needs Improvement",
    className: "ats-low",
  };
};


  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Load all available jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("/jd");

        setJobs(response.data.jobs || []);
      } catch (error) {
        console.error("Failed to load jobs:", error);

        setMessage(
          error.response?.data?.message ||
            "Failed to load available jobs"
        );
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setFile(selectedFile);
    setMessage("");
    setUploadResult(null);
    setAnalysis(null);
  };

  // Upload Resume
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a PDF or DOCX resume");
      return;
    }

    try {
      setMessage("Uploading and analyzing resume...");

      const formData = new FormData();

      formData.append("resume", file);

      const response = await api.post(
        "/resume/upload",
        formData
      );

      setUploadResult(response.data);
      setAnalysis(null);

      setMessage(
        "Resume uploaded and analyzed successfully"
      );
    } catch (error) {
      console.error("Resume upload error:", error);

      setMessage(
        error.response?.data?.message ||
          "Resume upload failed"
      );
    }
  };

  // ATS Analysis
  const handleAnalyze = async () => {
    if (!uploadResult?.resume_id) {
      setMessage("Please upload your resume first");
      return;
    }

    if (!jdId) {
      setMessage("Please select a job");
      return;
    }

    try {
      setAnalyzing(true);
      setMessage("");

      const response = await api.post(
        `/resume/${uploadResult.resume_id}/analyze`,
        {
          jd_id: Number(jdId),
        }
      );

      setAnalysis(response.data.analysis);

      setMessage(
        "ATS analysis completed successfully"
      );
    } catch (error) {
      console.error("ATS analysis error:", error);

      setMessage(
        error.response?.data?.message ||
          "ATS analysis failed"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      {/* Header */}

      <div className="dashboard-header">
        <div>
          <h1>Candidate Dashboard</h1>

          <p>
            Upload your resume and check your ATS match.
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Resume Upload */}

      <div className="dashboard-card">
        <h2>1. Upload Resume</h2>

        <p>Supported formats: PDF and DOCX</p>

        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />

          <button
            type="submit"
            className="primary-btn"
          >
            Upload Resume
          </button>
        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}
      </div>

      {/* Resume Details */}

      {uploadResult && (
        <div className="dashboard-card">
          <h2>2. Resume Details</h2>

          <p>
            <strong>Resume ID:</strong>{" "}
            {uploadResult.resume_id}
          </p>

          <p>
            <strong>Filename:</strong>{" "}
            {uploadResult.filename}
          </p>

          <p>
            <strong>Characters Extracted:</strong>{" "}
            {uploadResult.character_count}
          </p>

          <h3>Detected Skills</h3>

          <div className="skills-container">
            {uploadResult.skills?.length > 0 ? (
              uploadResult.skills.map(
                (skill, index) => (
                  <span
                    className="skill-tag"
                    key={`${skill.skill_name}-${index}`}
                  >
                    {skill.skill_name}
                  </span>
                )
              )
            ) : (
              <p>No skills detected.</p>
            )}
          </div>
        </div>
      )}

      {/* Job Selection */}

      {uploadResult && (
        <div className="dashboard-card">
          <h2>3. Check ATS Score</h2>

          <p>
            Select the job you want to compare your
            resume against.
          </p>

          <select
            className="job-select"
            value={jdId}
            onChange={(e) => setJdId(e.target.value)}
            disabled={loadingJobs}
          >
            <option value="">
              {loadingJobs
                ? "Loading jobs..."
                : "Select a job"}
            </option>

            {jobs.map((job) => (
              <option
                key={job.jd_id}
                value={job.jd_id}
              >
                {job.title}
              </option>
            ))}
          </select>
          {selectedJob && (
            <div className="job-preview">
              <h3>{selectedJob.title}</h3>

              <p>
                <strong>Job Description</strong>
              </p>

              <p className="job-description">
                {selectedJob.raw_text}
              </p>
            </div>
          )}

          <button
            className="primary-btn"
            onClick={handleAnalyze}
            disabled={
              analyzing ||
              loadingJobs ||
              !jdId
            }
          >
            {analyzing
              ? "Analyzing..."
              : "Analyze Resume"}
          </button>

          {!loadingJobs && jobs.length === 0 && (
            <p>
              No job descriptions are currently
              available.
            </p>
          )}
        </div>
      )}

      {/* ATS Results */}

      {analysis && (
        <div className="dashboard-card">
          <h2>ATS Analysis Result</h2>

          <div className="score-main">
            <h1>{analysis.ats_score ?? 0}%</h1>

            <p>Overall ATS Score</p>

            <span
              className={`ats-status ${
                getATSStatus(analysis.ats_score).className
              }`}
            >
              {getATSStatus(analysis.ats_score).text}
            </span>
          </div>

          <div className="score-grid">
            <ScoreCard
              title="Skill Match"
              score={analysis.skill_match_pct}
            />

            <ScoreCard
              title="Keyword Match"
              score={analysis.keyword_match_pct}
            />

            <ScoreCard
              title="Experience"
              score={
                analysis.experience_match_pct
              }
            />

            <ScoreCard
              title="Education"
              score={
                analysis.education_match_pct
              }
            />

            <ScoreCard
              title="Projects"
              score={
                analysis.project_relevance_pct
              }
            />

            <ScoreCard
              title="Completeness"
              score={analysis.completeness_pct}
            />
          </div>

          {/* Matched Skills */}

          <h3>Matched Skills</h3>

          <div className="skills-container">
            {analysis.matched_skills?.length > 0 ? (
              analysis.matched_skills.map(
                (skill, index) => (
                  <span
                    className="skill-tag"
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>
                )
              )
            ) : (
              <p>No matched skills.</p>
            )}
          </div>

          {/* Missing Skills */}

          <h3>Missing Skills</h3>

          <div className="skills-container">
            {analysis.missing_skills?.length > 0 ? (
              analysis.missing_skills.map(
                (skill, index) => (
                  <span
                    className="missing-skill"
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>
                )
              )
            ) : (
              <p>
                No missing skills detected.
              </p>
            )}
          </div>

          {/* Recommendations */}

          <h3>Recommendations</h3>

          {analysis.recommendations?.length > 0 ? (
            <ul>
              {analysis.recommendations.map(
                (recommendation, index) => (
                  <li key={index}>
                    {recommendation}
                  </li>
                )
              )}
            </ul>
          ) : (
            <p>No recommendations.</p>
          )}
        </div>
      )}
    </div>
  );
}
function ScoreCard({ title, score }) {
  const safeScore = Math.min(
    100,
    Math.max(0, Number(score) || 0)
  );

  return (
    <div className="score-card">
      <h3>{title}</h3>

      <p>{safeScore}%</p>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${safeScore}%`,
          }}
        />
      </div>
    </div>
  );
}

export default CandidateDashboard;