//  Controller: responsible for handling incoming requests and sending responses back to the client - act as intermediaries between routes and application logic. They receive requests, process them using models or services, and then return the appropriate response.

// ! - Controllers get the requested data from the models, create an HTML page displaying the data, and return it to the user.


// Navigate to Pages

Exports.openEventPage = (request, response) => {
    readFile("../frontend/volunteer/event-page.html", "utf-8", (err, html) => { // reads file and saves it to 'html'

        if (err) {                                      // if error
            response.status(500).send("Oops!");         // provide error screen
        }

        response.send(html);                            // else return file
    });
};

Exports.openNotificationPage = (request, response) => {
    readFile("../frontend/volunteer/notification-page.html", "utf-8", (err, html) => {

        if (err) {
            response.status(500).send("Oops!");
        }

        response.send(html);
    });
};

Exports.openVolunteerDashboard = (request, response) => {
    readFile("../frontend/volunteer/volunteer-dashboard.html", "utf-8", (err, html) => {

        if (err) {
            response.status(500).send("Oops!");
        }

        response.send(html);
    });
};

Exports.openVolunteerHistory = (request, response) => {
    readFile("../frontend/volunteer/volunteer-history.html", "utf-8", (err, html) => {

        if (err) {
            response.status(500).send("Oops!");
        }

        response.send(html);
    });
};