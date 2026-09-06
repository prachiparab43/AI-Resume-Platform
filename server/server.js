const fs = require("fs");
const path = require("path");
require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const jdRoutes = require("./routes/jdRoutes");

const app = express();

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://ai-resume-platform-kohl.vercel.app",
    ],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jd", jdRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "AI Resume Platform API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});