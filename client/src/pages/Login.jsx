import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
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
      const response = await api.post("/auth/login", form);

      const { token, user } = response.data;

      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      setMessage("Login successful");

      if (user?.role === "hr") {
        navigate("/hr");
      } else {
        navigate("/candidate");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>AI Resume Platform</h1>

        <h2>Login</h2>

        <form onSubmit={handleSubmit}>

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

          <button type="submit">
            Login
          </button>

        </form>

        {message && (
          <p className="message">{message}</p>
        )}

        <p>
          Don't have an account?{" "}
          <span
            className="link"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;