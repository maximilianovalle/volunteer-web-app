//  Controller: responsible for handling incoming requests and sending responses back to the client - act as intermediaries between routes and application logic. They receive requests, process them using models or services, and then return the appropriate response.

// ! - Controllers get the requested data from the models, create an HTML page displaying the data, and return it to the user.


const crypto = require("crypto");  // generates unique id

// Validate + Create a Notification

let notifications = [];

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