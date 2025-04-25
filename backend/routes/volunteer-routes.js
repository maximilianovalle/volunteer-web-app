// Route: define how an application responds to client requests for specific endpoints.

// !- Routes map HTTP methods (like GET, POST, PUT, DELETE) and URL paths to handler functions, which execute when a matching request is received

// GET: request data.
// POST: create new data.
// PUT: update existing data.
// DELETE: removes existing data.

const express = require('express');
const router = express.Router();

const { fetchAcceptedEvents, fetchUser, dropEvent, fetchNotifications, markRead } = require("../controllers/volunteer-controllers");


router.get("/accepted", fetchAcceptedEvents);

router.get("/user", fetchUser);

router.put("/drop", dropEvent);

router.put("/markRead", markRead);

router.get("/notifications", fetchNotifications);


module.exports = router;