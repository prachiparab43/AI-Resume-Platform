const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const caPath = path.join(__dirname, "../certs/isrgrootx1.pem");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  },
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("MySQL connected successfully");
});

module.exports = db;