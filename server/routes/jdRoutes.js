const express = require("express");

const authMiddleware =
    require("../middleware/authMiddleware");

const allowRoles =
    require("../middleware/roleMiddleware");

const {
    createJD,
    getRankings,
    getAllJobs
} = require("../controllers/jdController");

const router = express.Router();


router.get(
    "/",
    authMiddleware,
    getAllJobs
);


router.post(
    "/",
    authMiddleware,
    allowRoles("hr"),
    createJD
);


router.get(
    "/:id/rankings",
    authMiddleware,
    allowRoles("hr"),
    getRankings
);


module.exports = router;