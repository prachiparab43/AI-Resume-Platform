import { useState } from "react";
import api from "../services/api";

function CandidateDashboard() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  const [jdId, setJdId] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  // Upload Resume
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a PDF or DOCX resume");
      return;
    }

    try {
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
      console.error(error);

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
      setMessage("Please enter a Job Description ID");
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

      setMessage("ATS analysis completed successfully");
    } catch (error) {
      console.error(error);

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
          <p className="message">{message}</p>
        )}
      </div>

      {/* Extracted Skills */}

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
              uploadResult.skills.map((skill, index) => (
                <span
                  className="skill-tag"
                  key={index}
                >
                  {skill.skill_name}
                </span>
              ))
            ) : (
              <p>No skills detected.</p>
            )}
          </div>
        </div>
      )}

      {/* Job Matching */}

      {uploadResult && (
        <div className="dashboard-card">
          <h2>3. Check ATS Score</h2>

          <p>
            Enter the Job Description ID you want to
            compare your resume against.
          </p>

          <input
            className="jd-input"
            type="number"
            min="1"
            placeholder="Example: 2"
            value={jdId}
            onChange={(e) => setJdId(e.target.value)}
          />

          <button
            className="primary-btn"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing
              ? "Analyzing..."
              : "Analyze Resume"}
          </button>
        </div>
      )}

      {/* ATS Results */}

      {analysis && (
        <div className="dashboard-card">
          <h2>ATS Analysis Result</h2>

          <div className="score-main">
            <h1>{analysis.ats_score}%</h1>
            <p>Overall ATS Score</p>
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
              score={analysis.experience_match_pct}
            />

            <ScoreCard
              title="Education"
              score={analysis.education_match_pct}
            />

            <ScoreCard
              title="Projects"
              score={analysis.project_relevance_pct}
            />

            <ScoreCard
              title="Completeness"
              score={analysis.completeness_pct}
            />
          </div>

          <h3>Matched Skills</h3>

          <div className="skills-container">
            {analysis.matched_skills?.length > 0 ? (
              analysis.matched_skills.map(
                (skill, index) => (
                  <span
                    className="skill-tag"
                    key={index}
                  >
                    {skill}
                  </span>
                )
              )
            ) : (
              <p>No matched skills.</p>
            )}
          </div>

          <h3>Missing Skills</h3>

          <div className="skills-container">
            {analysis.missing_skills?.length > 0 ? (
              analysis.missing_skills.map(
                (skill, index) => (
                  <span
                    className="missing-skill"
                    key={index}
                  >
                    {skill}
                  </span>
                )
              )
            ) : (
              <p>No missing skills detected.</p>
            )}
          </div>

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
  return (
    <div className="score-card">
      <h3>{title}</h3>
      <p>{score ?? 0}%</p>
    </div>
  );
}

export default CandidateDashboard;