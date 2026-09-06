const express = require("express");
const multer = require("multer");
const path = require("path");

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
    uploadResume,
    analyzeResume,
    getCandidateHistory
} = require("../controllers/resumeController");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(
            null,
            uniqueName + path.extname(file.originalname)
        );
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Only PDF and DOCX files are allowed"),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter
});

router.post(
    "/upload",
    authMiddleware,
    allowRoles("candidate"),
    upload.single("resume"),
    uploadResume
);

router.get(
    "/history",
    authMiddleware,
    allowRoles("candidate"),
    getCandidateHistory
);

router.post(
    "/:id/analyze",
    authMiddleware,
    allowRoles("candidate"),
    analyzeResume
);

module.exports = router;