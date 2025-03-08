const express = require('express');
const { createAdminEvent, getAdminEvents, deleteAdminEvent, matchVolunteersToEvent, getVolunteers } = require("../controllers/adminController");


const router = express.Router();

// Create an event (for Admin)
router.post('/events', createAdminEvent);

// Get all events created by Admin
router.get('/events', getAdminEvents);

// Delete an event by ID
router.delete('/events/:id', deleteAdminEvent);

// Match volunteers to an event
router.post("/match-volunteer", matchVolunteersToEvent);

router.get("/volunteers", getVolunteers);


module.exports = router;
