//  Controller: responsible for handling incoming requests and sending responses back to the client - act as intermediaries between routes and application logic. They receive requests, process them using models or services, and then return the appropriate response.

// ! - Controllers get the requested data from the models, create an HTML page displaying the data, and return it to the user.


let notifications = [];


// Navigate to Pages

// exports.openEventPage = (request, response) => {
//     readFile("../frontend/volunteer/event-page.html", "utf-8", (err, html) => { // reads file and saves it to 'html'

//         if (err) {                                      // if error
//             response.status(500).json({ my: "Error: page not found." });         // provide error screen
//         }

//         response.send(html);                            // else return file
//     });
// };

// exports.openNotificationPage = (request, response) => {
//     // readFile("../frontend/volunteer/notification-page.html", "utf-8", (err, html) => {

//     //     if (err) {
//     //         response.status(500).json({ my: "Error: page not found." });
//     //     }

//     //     response.send(html);
//     // });
//     response.json(notifications);
// };

// exports.openVolunteerDashboard = (request, response) => {
//     // readFile("../frontend/volunteer/volunteer-dashboard.html", "utf-8", (err, html) => {

//     //     if (err) {
//     //         response.status(500).json({ my: "Error: page not found." });
//     //     }

//     //     response.send(html);
//     // });
//     response.json(adminEvents); // shows events created by admins from adminController.js
// };

// exports.openVolunteerHistory = (request, response) => {
//     readFile("../frontend/volunteer/volunteer-history.html", "utf-8", (err, html) => {

//         if (err) {
//             response.status(500).json({ my: "Error: page not found." });
//         }

//         response.send(html);
//     });
// };



// Apply for an Event by ID

exports.applyToEvent = (request, response) => {
    const eventID = request.params.id;
    const volunteerID = request.params.id;

    const myEvent = findByID(eventID);
    myEvent.volunteer_list.append(volunteerID);
    response.json({ my: "Successfully completed." });
};



// Create Notification (Admins)

const crypto = require("crypto");  // generates unique id

exports.createNotification = (request, response) => {
    const { header, description } = req.body;

    const newNotification = {
        id: crypto.randomBytes(16).toString("hex"), // unique id
        header,
        description,
    };

    notifications.push(newNotification);
    response.status(201).json(newNotification); // 201: indicates that an HTTP request was successful and created a new resource
}