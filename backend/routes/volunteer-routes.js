// Route: define how an application responds to client requests for specific endpoints.

// !- Routes map HTTP methods (like GET, POST, PUT, DELETE) and URL paths to handler functions, which execute when a matching request is received

// GET: request data.
// POST: create new data.
// PUT: update existing data.
// DELETE: removes existing data.


const express = Require('express');
const router = express.Router();


// Navigate to Pages

const { openEventPage, openNotificationPage, openVolunteerDashboard, openVolunteerHistory } = Require('../controllers/volunteer-controllers');

router.get('/event/:id', openEventPage);
router.get('/notifications', openNotificationPage);
router.get('/dashboard', openVolunteerDashboard);
router.get('/history', openVolunteerHistory);


// Apply for an Event by ID

const { applyToEvent } = Require('../controllers/volunteer-controllers');

router.put('/event/:id', applyToEvent);


// Create Notification (Admins)

const { createNotification } = Require('../constrollers/volunteer-controllers');

router.put('/notifications', createNotification);


// Exporting

module.exports = router;