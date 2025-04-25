const express = require('express');
const { createAdminEvent, 
    getAdminEvents, 
    deleteAdminEvent, 
    matchVolunteersToEvent,
    assignVolunteerToEvent, 
    getVolunteers,
    getVolunteerParticipationHistory,  
    getEventAssignments,
    exportAssignmentsCSV,
    exportParticipationCSV,
    softDeleteEvent
} = require("../controllers/adminController");


const router = express.Router();

// Create an event (for Admin)
router.post('/events', createAdminEvent);

// Get all events created by Admin
router.get('/events', getAdminEvents);



// Match volunteers to an event
router.post("/match-volunteer", matchVolunteersToEvent);
router.post("/assign-volunteer", assignVolunteerToEvent);

router.get("/volunteers", getVolunteers);

router.get("/participation-history", getVolunteerParticipationHistory);

router.get("/event-assignments", getEventAssignments);

router.get("/export/event-assignments/csv", exportAssignmentsCSV);
router.get("/export/participation-history/csv", exportParticipationCSV);

router.patch("/events/:id/soft-delete", softDeleteEvent);


module.exports = router;
