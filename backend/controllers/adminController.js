let adminEvents = []; // Temporary in-memory storage for admin events

// Create an Event (Admin Only)
exports.createAdminEvent = (req, res) => {
    const { name, location, date, skills_required } = req.body;
    const volunteer_list = [];

    if (!name || !location || !date) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const newEvent = {
        id: adminEvents.length + 1,
        name,
        location,
        date,
        skills_required,
        volunteer_list
    };

    adminEvents.push(newEvent);
    res.status(201).json(newEvent);
};

// Get All Admin-Created Events
exports.getAdminEvents = (req, res) => {
    res.json(adminEvents);
};

// Delete an Event (Admin Only)
exports.deleteAdminEvent = (req, res) => {
    const eventId = parseInt(req.params.id);
    adminEvents = adminEvents.filter(event => event.id !== eventId);
    res.json({ message: "Event deleted successfully" });
};
