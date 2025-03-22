const express = require("express");
const { validateProfile, handleProfileSubmission } = require("../controllers/profileController");
const router = express.Router();

router.post("/user/profile", validateProfile, handleProfileSubmission);

router.get("/test", (req, res) => {
    res.json({ status: "API is working" });
});

// testing if profile was received
router.post("/test/profile", (req, res) => {
    console.log("Received test profile data:", req.body);
    res.json({ 
        message: "Profile data received successfully", 
        data: req.body 
    });
});
module.exports = router;