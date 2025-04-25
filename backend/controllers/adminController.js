const db = require("../db");
const { createObjectCsvStringifier } = require("csv-writer");
const PDFDocument = require("pdfkit");
// const { Writable } = require("stream");
const fs = require("fs");
const path = require("path");

// Get All Admin-Created Events
exports.getAdminEvents = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM event_details WHERE is_deleted = FALSE ORDER BY Event_Date DESC");

        // ✅ Convert Event_Date to "YYYY-MM-DD" format
        rows.forEach(event => {
            event.Event_Date = new Date(event.Event_Date).toISOString().split("T")[0];
        });

        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching events:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};



// Create an Event (Admin Only)
const validSkills = [
    "Varied",
    "Animal Care",
    "Community Outreach",
    "Nature",
    "Medical",
    "Teaching",
    "Communication",
    "Leadership",
    "Technical Skills",
    "Organization"
  ];  
const validUrgencies = ["Low", "Medium", "High"];
const validTypes = ["All", "Animal Shelter", "Community Service", "Environment", "Healthcare", "Education"];

exports.createAdminEvent = async (req, res) => {
    const {
        Managed_By,
        name,
        description,
        Location_City,
        Location_State_Code,
        required_skills,
        urgency,
        event_date,
        type
    } = req.body;

    if (!Managed_By || !name || !description || !Location_City || !Location_State_Code || !event_date || !type || !urgency) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (!validUrgencies.includes(urgency)) {
        return res.status(400).json({ message: `Invalid urgency. Allowed values: ${validUrgencies.join(", ")}` });
    }

    if (!validTypes.includes(type)) {
        return res.status(400).json({ message: `Invalid type. Allowed values: ${validTypes.join(", ")}` });
    }

    try {
        const skillsArray = Array.isArray(required_skills) ? required_skills : [required_skills];
        const sanitizedSkills = skillsArray
            .filter(skill => validSkills.includes(skill.trim()))
            .join(",");

        if (!sanitizedSkills) {
            return res.status(400).json({ message: "Invalid Required_Skills provided" });
        }

        const [result] = await db.query(
            `INSERT INTO event_details 
            (Managed_By, Event_Name, Description, Location_City, Location_State_Code, Required_Skills, Urgency, Event_Date, Type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [Managed_By, name, description, Location_City, Location_State_Code, sanitizedSkills, urgency, event_date, type]
        );

        res.status(201).json({ message: "Event created successfully", eventId: result.insertId });
    } catch (error) {
        console.error("❌ Error creating event:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};





// Soft Delete (Mark is_deleted = true)
exports.softDeleteEvent = async (req, res) => {
    const eventId = req.params.id;

    try {
        const [existing] = await db.query("SELECT * FROM event_details WHERE EventID = ?", [eventId]);

        if (!existing.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        await db.query("UPDATE event_details SET is_deleted = TRUE WHERE EventID = ?", [eventId]);

        res.json({ message: "Event marked as deleted (soft delete)" });
    } catch (error) {
        console.error("❌ Error soft deleting event:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};




// Match volunteers to an event
exports.matchVolunteersToEvent = async (req, res) => {
    const { volunteerName } = req.body;

    if (!volunteerName) {
        return res.status(400).json({ message: "Volunteer name is required" });
    }

    try {
        // Step 1: Get volunteer's info
        const [volunteers] = await db.query(
            "SELECT UserID, Skills, Availability FROM profile_user WHERE Full_Name = ?",
            [volunteerName]
        );

        if (!Array.isArray(volunteers) || volunteers.length === 0) {
            return res.status(404).json({ message: "Volunteer not found" });
        }

        const volunteer = volunteers[0];
        const volunteerSkills = volunteer.Skills ? volunteer.Skills.split(",").map(s => s.trim()) : ["Varied"];
        const userId = volunteer.UserID;

        // Step 2: Get all events
        const [events] = await db.query(`
            SELECT EventID, Event_Name, IFNULL(Required_Skills, '') AS Required_Skills
            FROM event_details
        `);

        // Step 3: Filter matching events
        const matchedEvents = events.filter(event => {
            const eventSkills = event.Required_Skills.split(",").map(s => s.trim());

            if (volunteerSkills.includes("Varied")) return true;

            return eventSkills.some(skill => volunteerSkills.includes(skill));
        });

        // Step 4: Return all matches to the frontend (NOT assigning yet)
        if (!matchedEvents.length) {
            return res.json({ matchedEvents: [] });
        }

        return res.json({
            matchedEvents: matchedEvents.map(event => ({
                id: event.EventID,
                name: event.Event_Name
            }))
        });
    } catch (error) {
        console.error("❌ Error matching volunteer to events:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

exports.assignVolunteerToEvent = async (req, res) => {
    const { volunteerName, eventId } = req.body;

    if (!volunteerName || !eventId) {
        return res.status(400).json({ message: "Volunteer name and event ID are required" });
    }

    try {
        const [users] = await db.query(
            "SELECT UserID FROM profile_user WHERE Full_Name = ?",
            [volunteerName]
        );

        if (!users.length) {
            return res.status(404).json({ message: "Volunteer not found" });
        }

        const userId = users[0].UserID;

        await db.query(
            `INSERT INTO volunteers_list (UserID, EventID, Status) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE Status = 'Accepted'`,
            [userId, eventId, "Accepted"]
        );

        res.json({ message: "Volunteer assigned successfully" });
    } catch (error) {
        console.error("❌ Error assigning volunteer:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};


// Get All Volunteers
exports.getVolunteers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM profile_user");
        res.json({ volunteers: rows });
    } catch (error) {
        console.error("Error fetching volunteers:", error);
        res.status(500).json({ message: "Database error" });
    }
};











// Get Event Assignments
exports.getEventAssignments = async (req, res) => {
    try {
        const [rows] = await db.query(`
SELECT 
    e.EventID,
    e.Event_Name,
    e.Event_Date,
    e.Description,
    e.Location_City,
    e.Location_State_Code,
    e.Required_Skills,
    e.Urgency,
    e.Type,
    GROUP_CONCAT(p.Full_Name ORDER BY p.Full_Name SEPARATOR ', ') AS Volunteer_Names
FROM event_details e
LEFT JOIN volunteers_list v ON e.EventID = v.EventID AND v.Status = 'Accepted'
LEFT JOIN profile_user p ON v.UserID = p.UserID
WHERE e.is_deleted = 0
GROUP BY e.EventID
ORDER BY e.Event_Date DESC;


        `);

        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching volunteer assignments:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

// Generate CSV Export for Event Assignments
exports.exportAssignmentsCSV = async (req, res) => {
    try {
      const [data] = await db.query(`
        SELECT 
            e.Event_Name,
            e.Event_Date,
            e.Location_City,
            e.Location_State_Code,
            e.Type,
            e.Required_Skills,
            e.Urgency,
            GROUP_CONCAT(p.Full_Name ORDER BY p.Full_Name SEPARATOR ', ') AS Volunteer_Names
        FROM event_details e
        LEFT JOIN volunteers_list v ON e.EventID = v.EventID AND v.Status = 'Accepted'
        LEFT JOIN profile_user p ON v.UserID = p.UserID
        GROUP BY e.EventID
        ORDER BY e.Event_Date DESC;
      `);
  
      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: "Event_Name", title: "Event Name" },
          { id: "Event_Date", title: "Date" },
          { id: "Location_City", title: "City" },
          { id: "Location_State_Code", title: "State" },
          { id: "Type", title: "Type" },
          { id: "Required_Skills", title: "Skills" },
          { id: "Urgency", title: "Urgency" },
          { id: "Volunteer_Names", title: "Volunteers" }
        ]
      });
  
      const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=event_assignments.csv");
      res.send(csv);
    } catch (error) {
      console.error("❌ Error generating CSV:", error);
      res.status(500).json({ message: "Failed to generate CSV", error: error.message });
    }
  };
  
  











// Get Volunteer Participation History
exports.getVolunteerParticipationHistory = async (req, res) => {
    try {
        const [rows] = await db.query(`
    SELECT 
        p.Full_Name AS name,
        h.Email AS email,
        p.City AS city,
        p.State_Code AS state,
        e.Event_Name AS event,
        h.Participation_Date AS date
    FROM history_user h
    JOIN profile_user p ON h.UserID = p.UserID
    JOIN event_details e ON h.EventID = e.EventID
    ORDER BY h.Participation_Date DESC;
        `);

        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching participation history:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};


// Export Volunteer Participation as CSV
exports.exportParticipationCSV = async (req, res) => {
  try {
    const [data] = await db.query(`
    SELECT 
        p.Full_Name AS name,
        h.Email AS email,
        p.City AS city,
        p.State_Code AS state,
        e.Event_Name AS event,
        h.Participation_Date AS date
    FROM history_user h
    JOIN profile_user p ON h.UserID = p.UserID
    JOIN event_details e ON h.EventID = e.EventID
    ORDER BY h.Participation_Date DESC;
    `);

    const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: "name", title: "Volunteer Name" },
          { id: "email", title: "Email" },
          { id: "city", title: "City" },
          { id: "state", title: "State" },
          { id: "event", title: "Event Name" },
          { id: "date", title: "Participation Date" }
        ]
      });

    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=volunteer_participation.csv");
    res.send(csv);
  } catch (error) {
    console.error("❌ Error generating CSV:", error);
    res.status(500).json({ message: "Failed to generate CSV", error: error.message });
  }
};

