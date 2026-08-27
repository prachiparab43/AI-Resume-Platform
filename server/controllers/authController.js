const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!["candidate", "hr"].includes(role)) {
            return res.status(400).json({
                message: "Role must be candidate or hr"
            });
        }

        const checkUserSql = "SELECT * FROM Users WHERE email = ?";

        db.query(checkUserSql, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertSql = `
                INSERT INTO Users (name, email, password_hash, role)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                insertSql,
                [name, email, hashedPassword, role],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Failed to register user"
                        });
                    }

                    res.status(201).json({
                        message: "User registered successfully",
                        user_id: result.insertId
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = "SELECT * FROM Users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
};