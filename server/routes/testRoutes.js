const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.get(
    "/candidate",
    authMiddleware,
    allowRoles("candidate"),
    (req, res) => {
        res.json({
            message: "Candidate route accessed successfully",
            user: req.user
        });
    }
);

router.get(
    "/hr",
    authMiddleware,
    allowRoles("hr"),
    (req, res) => {
        res.json({
            message: "HR route accessed successfully",
            user: req.user
        });
    }
);

module.exports = router;