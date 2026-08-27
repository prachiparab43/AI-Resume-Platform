import { useState } from "react";
import api from "../services/api";

function HRDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const [createdJD, setCreatedJD] = useState(null);

  const [jdId, setJdId] = useState("");
  const [rankings, setRankings] = useState([]);
  const [loadingRankings, setLoadingRankings] =
    useState(false);

  // Create Job Description
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
        title: title,
        raw_text: description,
      });

      setCreatedJD(response.data);

      setJdId(response.data.jd_id);

      setMessage(
        "Job description created successfully"
      );

      setTitle("");
      setDescription("");

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create job description"
      );
    }
  };

  // Get Candidate Rankings
  const handleGetRankings = async () => {
    if (!jdId) {
      setMessage(
        "Please enter a Job Description ID"
      );
      return;
    }

    try {
      setLoadingRankings(true);
      setMessage("");

      const response = await api.get(
        `/jd/${jdId}/rankings`
      );

      setRankings(
        response.data.rankings || []
      );

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

      {/* CREATE JD */}

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
          <p className="message">
            {message}
          </p>
        )}

      </div>

      {/* CREATED JD */}

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
                    key={index}
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

      {/* RANKINGS */}

      <div className="dashboard-card">

        <h2>2. Candidate Rankings</h2>

        <p>
          Enter one of your Job Description IDs.
        </p>

        <input
          className="jd-input"
          type="number"
          min="1"
          placeholder="JD ID"
          value={jdId}
          onChange={(e) =>
            setJdId(e.target.value)
          }
        />

        <button
          className="primary-btn"
          onClick={handleGetRankings}
          disabled={loadingRankings}
        >
          {loadingRankings
            ? "Loading..."
            : "View Rankings"}
        </button>

      </div>

      {/* RANKING TABLE */}

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
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {rankings.map(
                  (candidate) => (

                    <tr
                      key={
                        candidate.resume_id
                      }
                    >
                      <td>
                        #
                        {
                          candidate.rank_position
                        }
                      </td>

                      <td>
                        {
                          candidate.candidate_name
                        }
                      </td>

                      <td>
                        {candidate.email}
                      </td>

                      <td>
                        {
                          candidate.final_score
                        }
                        %
                      </td>

                      <td>
                        {
                          candidate.skill_match_pct
                        }
                        %
                      </td>

                      <td>
                        {
                          candidate.keyword_match_pct
                        }
                        %
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            candidate.status
                          }`}
                        >
                          {
                            candidate.status
                          }
                        </span>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
}

export default HRDashboard;