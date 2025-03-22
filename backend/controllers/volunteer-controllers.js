//  Controller: responsible for handling incoming requests and sending responses back to the client - act as intermediaries between routes and application logic. They receive requests, process them using models or services, and then return the appropriate response.

// ! - Controllers get the requested data from the models, create an HTML page displaying the data, and return it to the user.

const db_con = require("../db");

// defines getPastEvents and exports it immediately
exports.getPastEvents = async (req, res) => {
    try {
        const [pastEvents] = await db_con.query("SELECT * FROM event_details WHERE Event_Date < CURDATE()");

        res.json(pastEvents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error." });
    }
};

// defines getCurrentEvents and exports it immediately
exports.getCurrentEvents = async (req, res) => {
    try {
        const [currentEvents] = await db_con.query("SELECT * FROM event_details WHERE Event_Date > CURDATE()");

        res.json(currentEvents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error." });
    }
}




const crypto = require("crypto");  // generates unique id

// Validate + Create a Notification

let notifications = [
    {id: 1, header: "This is a test", description: "Can you see me?", read_status: 0},  // read_status -- 0: unread, 1: read
];

exports.validateCreateNotification = (request, response) => {
    const { header, description } = request.body;

    if (!header || !description) {
        return response.status(400).json({ message: "Missing required fields." });
    }

    else if (header.length > 70) {
        return response.status(400).json({ message: "Header exceeds 70 characters." });
    }

    else if (description.length > 900) {
        return response.status(400).json({ message: "Description exceeds 900 characters." });
    }

    const newNotification = {
        id: crypto.randomBytes(16).toString("hex"), // unique id
        header,
        description,
        read_status: 0,
    };

    notifications.push(newNotification);
    response.status(201).json(newNotification);
};


// Apply for an Event by ID

// exports.applyToEvent = (request, response) => {
//     const eventID = request.params.id;
//     const volunteerID = request.params.id;

//     const myEvent = findByID(eventID);
//     myEvent.volunteer_list.append(volunteerID);
//     response.json({ my: "Successfully completed." });
// };


// Show All Notifications

exports.showNotifications = (request, response) => {
    response.json(notifications);
}


// Read Notification

exports.readNotification = (request, response) => {
    const notifID = parseInt(request.params.id);
    let myNotification = notifications.find(myNotif => myNotif.id === id);
    myNotification.read_status = 1;
    response.json({ msg: "Notification read." });
}