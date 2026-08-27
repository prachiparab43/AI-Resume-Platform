require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const jdRoutes = require("./routes/jdRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jd", jdRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "AI Resume Platform API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});