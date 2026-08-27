import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", form);

      setMessage("Registration successful");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Registration failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>AI Resume Platform</h1>
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="candidate">
              Candidate
            </option>

            <option value="hr">
              HR
            </option>
          </select>

          <button type="submit">
            Register
          </button>

        </form>

        {message && (
          <p className="message">{message}</p>
        )}

        <p>
          Already have an account?{" "}
          <span
            className="link"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;