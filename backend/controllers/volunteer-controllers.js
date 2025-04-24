//  Controller: responsible for handling incoming requests and sending responses back to the client - act as intermediaries between routes and application logic. They receive requests, process them using models or services, and then return the appropriate response.

// ! - Controllers get the requested data from the models, create an HTML page displaying the data, and return it to the user.

const db_con = require("../db");

const USER = 2;

exports.fetchAcceptedEvents = async (req, res) => {
    try {
        const [appliedEvents] = await db_con.query("SELECT events.* FROM event_details AS events, volunteers_list AS list WHERE list.UserID = ? AND list.Status = 'Accepted' AND list.EventID = events.EventID AND events.Event_Date > NOW() ORDER BY events.Event_Date ASC", [USER]);

        const appliedEventsArr = appliedEvents.map(event => ({
            eventID: event.EventID,
            name: event.Event_Name,
            description: event.Description,
            state: event.Location_State_Code,
            skill: event.Required_Skills,
            date: new Date(event.Event_Date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            }),
            type: event.Type,
        }))

        res.json(appliedEventsArr);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.fetchUser = async (req, res) => {
    try {
        const [user] = await db_con.query("SELECT * FROM profile_user WHERE UserID = ?", [USER]);

        const currUser = {
            name: user[0].Full_Name,
        };
        
        res.json(currUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

exports.dropEvent = async (req, res) => {
    const { eventID } = req.body;

    try {
        await db_con.query("UPDATE volunteers_list SET Status = 'Dropped' WHERE UserID = ? AND EventID = ?", [USER, eventID]);

        res.status(200).json({ message: "Dropped from event successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

exports.fetchNotifications = async (req, res) => {
    try {
        // get all unread notifs + 10 most recent read notifs
        const [notifications] = await db_con.query("( SELECT * FROM notification WHERE UserID = ? AND Is_Read = '0' ) UNION ALL ( SELECT * FROM notification WHERE UserID = 2 AND Is_Read = '1' ORDER BY Created_At DESC LIMIT 10 ) ORDER BY Created_At DESC", [USER]);

        const notificationArray = notifications.map(notification => ({
            type: notification.Type,
            text: notification.Notification_Text,
            date: notification.Created_At,
            isRead: notification.Is_Read,
        }))

        console.log("Notifications", notificationArray);

        res.json(notificationArray);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

// exports.markAllRead