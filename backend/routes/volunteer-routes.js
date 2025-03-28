// Route: define how an application responds to client requests for specific endpoints.

// !- Routes map HTTP methods (like GET, POST, PUT, DELETE) and URL paths to handler functions, which execute when a matching request is received

// GET: request data.
// POST: create new data.
// PUT: update existing data.
// DELETE: removes existing data.

const express = require('express');
const router = express.Router();

const { getPastEvents, getCurrentEvents } = require("../controllers/volunteer-controllers");

// imports getPastEvents from volunteer-controllers & registers it w "/"
router.get("/past", getPastEvents);   // "/" or "/past" or ??

// imports getCurrentEvents from volunteer-controllers & registers it w "/"
router.get("/current", getCurrentEvents);   // "/" or "/past" or ??

// Exporting

module.exports = router;