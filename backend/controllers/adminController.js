const db = require("../db");

// Get All Admin-Created Events
exports.getAdminEvents = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM event_details ORDER BY Event_Date DESC");

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
    const { Managed_By, name, description, location_state, required_skills, urgency, event_date, type } = req.body;

    // ✅ Ensure required fields are present
    if (!Managed_By || !name || !description || !location_state || !event_date || !type || !urgency) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Validate ENUM fields
    if (!validUrgencies.includes(urgency)) {
        return res.status(400).json({ message: `Invalid urgency. Allowed values: ${validUrgencies.join(", ")}` });
    }

    if (!validTypes.includes(type)) {
        return res.status(400).json({ message: `Invalid type. Allowed values: ${validTypes.join(", ")}` });
    }

    try {
        // ✅ Ensure `required_skills` is an array and filter only valid ENUM values
        const skillsArray = Array.isArray(required_skills) ? required_skills : [required_skills];
        const sanitizedSkills = skillsArray
            .filter(skill => validSkills.includes(skill.trim())) // Remove invalid skills
            .join(",");

        if (!sanitizedSkills) {
            return res.status(400).json({ message: "Invalid Required_Skills provided" });
        }

        const [result] = await db.query(
            `INSERT INTO event_details 
                (Managed_By, Event_Name, Description, Location_State_Code, Required_Skills, Urgency, Event_Date, Type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [Managed_By, name, description, location_state, sanitizedSkills, urgency, event_date, type]
        );

        res.status(201).json({ message: "Event created successfully", eventId: result.insertId });
    } catch (error) {
        console.error("❌ Error creating event:", error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};




// Delete an Event (Admin Only)
exports.deleteAdminEvent = async (req, res) => {
    const eventId = req.params.id;

    try {
        // Check if event exists before attempting to delete it
        const [eventCheck] = await db.query("SELECT EventID FROM event_details WHERE EventID = ?", [eventId]);

        if (!eventCheck.length) {
            return res.status(404).json({ message: "Event not found" });
        }

        // First, delete volunteers linked to this event
        await db.query("DELETE FROM volunteers_list WHERE EventID = ?", [eventId]);

        // Then delete the event itself
        await db.query("DELETE FROM event_details WHERE EventID = ?", [eventId]);

        res.json({ message: "Event and associated volunteers deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ message: "Database error" });
    }
};




// Match volunteers to an event
exports.matchVolunteersToEvent = async (req, res) => {
    const { volunteerName } = req.body;

    if (!volunteerName) {
        return res.status(400).json({ message: "Volunteer name is required" });
    }

    try {
        // Step 1: Find the volunteer's skills from the database
        const [volunteers] = await db.query(
            "SELECT UserID, Skills, Availability FROM profile_user WHERE Full_Name = ?",
            [volunteerName]
        );
        console.log("Raw Data from MySQL:", volunteers);
        
        
        // Ensure `volunteers` is an array before checking its length
        if (!Array.isArray(volunteers) || volunteers.length === 0) {
            return res.status(404).json({ message: "Volunteer not found" });
        }
        
        const volunteer = volunteers[0];
        const volunteerSkills = volunteer.Skills ? volunteer.Skills.split(",") : ["Varied"];
        const volunteerAvailability = volunteer.Availability || "Not provided";
        console.log(`Volunteer Skills: ${volunteerSkills}, Availability: ${volunteerAvailability}`);
        const userId = volunteer.UserID;
        

        // Step 2: Find events that require at least one of these skills
        const [events] = await db.query("SELECT EventID, Event_Name, IFNULL(Required_Skills, '') AS Required_Skills FROM event_details");

        // Step 3: Match volunteer skills to event requirements
        const matchedEvents = events.filter(event => {
            const eventSkills = (event.Required_Skills || "").split(",");
        
            // If volunteer has "Varied", they should match ANY event
            if (volunteerSkills.includes("Varied")) {
                return true;
            }
        
            // Standard matching for specific skills
            return eventSkills.some(skill => volunteerSkills.includes(skill));
        });
        
        
        if (matchedEvents.length === 0) {
            return res.json({ matchedEvent: "No matching event found" });
        }

        // Step 4: Assign the volunteer to the first matching event (or return all matches)
        const assignedEvent = matchedEvents[0];

        // Step 5: Save the volunteer's assignment in `volunteers_list`
        await db.query(
            `INSERT INTO volunteers_list (UserID, EventID, Status) 
             VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Status = 'Accepted'`,
            [userId, assignedEvent.EventID, "Accepted"]
        );

        res.json({ matchedEvent: assignedEvent.Event_Name });
    } catch (error) {
        console.error("Error matching volunteer to event:", error);
        res.status(500).json({ message: "Database error" });
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

