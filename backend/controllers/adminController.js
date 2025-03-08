let adminEvents = [
    { id: 1, name: "Community Cleanup", location: "Central Park", date: "2025-03-15", skills_required: ["Leadership"], volunteer_list: [] },
    { id: 2, name: "Food Drive", location: "City Hall", date: "2025-03-20", skills_required: ["Communication", "Organization"], volunteer_list: [] }
];

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
        volunteer_list,
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


// Temporary in-memory storage for volunteers
let volunteers = [
    { id: 1, name: "John Doe", skills: ["Teamwork", "Leadership"], availability: "Weekends" },
    { id: 2, name: "Jane Smith", skills: ["Communication", "Technical Skills"], availability: "Weekdays" },
    { id: 3, name: "Emily Johnson", skills: ["Leadership", "Organization"], availability: "Flexible" }
];

// Match volunteers to an event
exports.matchVolunteersToEvent = (req, res) => {
    const { volunteerName } = req.body;

    // Find volunteer
    const volunteer = volunteers.find(v => v.name === volunteerName);
    if (!volunteer) {
        return res.status(404).json({ message: "Volunteer not found" });
    }

    // Find events matching volunteer's skills
    const matchedEvents = adminEvents.filter(event =>
        event.skills_required.some(skill => volunteer.skills.includes(skill))
    );

    if (matchedEvents.length === 0) {
        return res.json({ matchedEvent: "No matching event found" });
    }

    res.json({ matchedEvent: matchedEvents[0].name }); 
};

// Get All Volunteers
exports.getVolunteers = (req, res) => {
    res.json({ volunteers });
};
