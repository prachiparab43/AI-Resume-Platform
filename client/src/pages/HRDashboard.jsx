import { useEffect, useState } from "react";
import api from "../services/api";

function HRDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const [createdJD, setCreatedJD] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [rankings, setRankings] = useState([]);
  const [loadingRankings, setLoadingRankings] =
    useState(false);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoadingJobs(true);

      const response = await api.get("/jd/my-jobs");

      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error("Fetch HR jobs error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load your jobs"
      );
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleCreateJD = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setMessage(
        "Please enter job title and description"
      );
      return;
    }

    try {
      const response = await api.post("/jd", {
        title,
        raw_text: description,
      });

      setCreatedJD(response.data);

      setMessage(
        "Job description created successfully"
      );

      setTitle("");
      setDescription("");

      await fetchMyJobs();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create job description"
      );
    }
  };

  const handleGetRankings = async () => {
    if (!selectedJobId) {
      setMessage("Please select a job first");
      return;
    }

    try {
      setLoadingRankings(true);
      setMessage("");

      const response = await api.get(
        `/jd/${selectedJobId}/rankings`
      );

      setRankings(response.data.rankings || []);
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);

      setRankings([]);

      setMessage(
        error.response?.data?.message ||
          "Failed to load rankings"
      );
    } finally {
      setLoadingRankings(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  const selectedJob = jobs.find(
    (job) =>
      String(job.jd_id) ===
      String(selectedJobId)
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>HR Dashboard</h1>

          <p>
            Create jobs and review ranked candidates.
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Create Job */}

      <div className="dashboard-card">
        <h2>1. Create Job Description</h2>

        <form onSubmit={handleCreateJD}>
          <input
            className="form-input"
            type="text"
            placeholder="Job Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <textarea
            className="form-textarea"
            placeholder="Enter complete job description..."
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <button
            className="primary-btn no-margin"
            type="submit"
          >
            Create & Analyze JD
          </button>
        </form>

        {message && (
          <p className="message">{message}</p>
        )}
      </div>

      {/* Created Job */}

      {createdJD && (
        <div className="dashboard-card">
          <h2>Job Created</h2>

          <p>
            <strong>JD ID:</strong>{" "}
            {createdJD.jd_id}
          </p>

          <p>
            <strong>Title:</strong>{" "}
            {createdJD.title}
          </p>

          <h3>Required Skills</h3>

          <div className="skills-container">
            {createdJD.skills?.length > 0 ? (
              createdJD.skills.map(
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

      {/* My Jobs */}

      <div className="dashboard-card">
        <h2>2. My Job Descriptions</h2>

        <p>
          Select one of your jobs to view candidate
          rankings.
        </p>

        <select
          className="job-select"
          value={selectedJobId}
          onChange={(e) => {
            setSelectedJobId(e.target.value);
            setRankings([]);
          }}
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
          onClick={handleGetRankings}
          disabled={
            loadingRankings ||
            !selectedJobId
          }
        >
          {loadingRankings
            ? "Loading..."
            : "View Rankings"}
        </button>

        {!loadingJobs && jobs.length === 0 && (
          <p>
            You have not created any jobs yet.
          </p>
        )}
      </div>

      {/* Rankings */}

      {rankings.length > 0 && (
        <div className="dashboard-card">
          <h2>Ranked Candidates</h2>

          <div className="table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>ATS Score</th>
                  <th>Skill Match</th>
                  <th>Keyword Match</th>
                  <th>Experience</th>
                  <th>Education</th>
                  <th>Projects</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
  {rankings.map((candidate) => (
    <tr key={candidate.resume_id}>

      <td>
        #{candidate.rank_position}
      </td>

      <td>
        {candidate.candidate_name}
      </td>

      <td>
        {candidate.email}
      </td>

      <td>
        {candidate.final_score}%
      </td>

      <td>
        {candidate.skill_match_pct}%
      </td>

      <td>
        {candidate.keyword_match_pct}%
      </td>

      <td>
        {candidate.experience_match_pct}%
      </td>

      <td>
        {candidate.education_match_pct}%
      </td>

      <td>
        {candidate.project_relevance_pct}%
      </td>

      <td>
        <span
          className={`status-badge ${candidate.status}`}
        >
          {candidate.status}
        </span>
      </td>

      <td>
        <details>
          <summary className="details-link">
            View
          </summary>

          <div className="candidate-details">

            <p>
              <strong>Missing Skills:</strong>
            </p>

            {candidate.missing_skills ? (
              <p>{candidate.missing_skills}</p>
            ) : (
              <p>None</p>
            )}

            <p>
              <strong>Recommendations:</strong>
            </p>

            {candidate.recommendations ? (
              <p>{candidate.recommendations}</p>
            ) : (
              <p>No recommendations</p>
            )}

          </div>
          </details>
        </td>

            </tr>
            ))}
            </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default HRDashboard;