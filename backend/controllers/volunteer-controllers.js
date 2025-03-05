//  Controller: responsible for handling incoming requests and sending responses back to the client - act as intermediaries between routes and application logic. They receive requests, process them using models or services, and then return the appropriate response.

// ! - Controllers get the requested data from the models, create an HTML page displaying the data, and return it to the user.


const errorMsg = response.json({ my: "Error: page not found." });
const successMsg = response.json({ my: "Successfully completed." });
let notifications = [];


// Navigate to Pages

Exports.openEventPage = (request, response) => {
    readFile("../frontend/volunteer/event-page.html", "utf-8", (err, html) => { // reads file and saves it to 'html'

        if (err) {                                      // if error
            response.status(500).json(errorMsg);         // provide error screen
        }

        response.send(html);                            // else return file
    });
};

Exports.openNotificationPage = (request, response) => {
    // readFile("../frontend/volunteer/notification-page.html", "utf-8", (err, html) => {

    //     if (err) {
    //         response.status(500).json(errorMsg);
    //     }

    //     response.send(html);
    // });
    response.json(notifications);
};

Exports.openVolunteerDashboard = (request, response) => {
    // readFile("../frontend/volunteer/volunteer-dashboard.html", "utf-8", (err, html) => {

    //     if (err) {
    //         response.status(500).json(errorMsg);
    //     }

    //     response.send(html);
    // });
    response.json(adminEvents); // shows events created by admins from adminController.js
};

Exports.openVolunteerHistory = (request, response) => {
    readFile("../frontend/volunteer/volunteer-history.html", "utf-8", (err, html) => {

        if (err) {
            response.status(500).json(errorMsg);
        }

        response.send(html);
    });
};



// Apply for an Event by ID

Exports.applyToEvent = (request, response) => {
    const eventID = request.params.id;
    const volunteerID = request.params.id;

    const myEvent = findByID(eventID);
    myEvent.volunteer_list.append(volunteerID);
    response.json(successMsg);
};


// Create Notification (Admins)

const crypto = Require("crypto");  // generates unique id

Exports.createNotification = (request, response) => {
    const { header, description } = req.body;

    const newNotification = {
        id: crypto.randomBytes(16).toString("hex"), // unique id
        header,
        description,
    };

    notifications.push(newNotification);
    response.status(201).json(newNotification); // 201: indicates that an HTTP request was successful and created a new resource
}