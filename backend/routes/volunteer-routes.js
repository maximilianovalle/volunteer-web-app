// Route: define how an application responds to client requests for specific endpoints.

// !- Routes map HTTP methods (like GET, POST, PUT, DELETE) and URL paths to handler functions, which execute when a matching request is received

// GET: request data.
// POST: create new data.
// PUT: update existing data.
// DELETE: removes existing data.


const express = require('express');
const router = express.Router();


// Create Notification

const { validateCreateNotification } = require('../controllers/volunteer-controllers');

router.post('/notifications', validateCreateNotification);


// Apply for an Event by ID

// const { applyToEvent } = require('../controllers/volunteer-controllers');

// router.put('/event/:id', applyToEvent);


// Show All Notifications

const { showNotifications } = require('../controllers/volunteer-controllers');

router.get('/notifications', showNotifications);


// Read Notification

const { readNotification } = require('../controllers/volunteer-controllers');

router.put('/notifications/:id', readNotification);


// Exporting

module.exports = router;