const express = require("express");
const { validateProfile, handleProfileSubmission } = require("../controllers/profileController");
const router = express.Router();

router.post("/user/profile", validateProfile, handleProfileSubmission);

module.exports = router;