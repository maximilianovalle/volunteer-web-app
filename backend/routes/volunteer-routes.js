// Route: define how an application responds to client requests for specific endpoints.

// !- Routes map HTTP methods (like GET, POST, PUT, DELETE) and URL paths to handler functions, which execute when a matching request is received

// GET: request data.
// POST: create new data.
// PUT: update existing data.
// DELETE: removes existing data.

const express = require('express');
const router = express.Router();

const { fetchAcceptedEvents, fetchUser, dropEvent, fetchNotifications, markAllRead } = require("../controllers/volunteer-controllers");


router.get("/accepted", fetchAcceptedEvents);

router.get("/user", fetchUser);

router.put("/drop", dropEvent)

router.get("/notifications", fetchNotifications);

// router.put("/markRead", markAllRead);


module.exports = router;