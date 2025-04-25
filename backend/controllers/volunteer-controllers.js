//  Controller: responsible for handling incoming requests and sending responses back to the client - act as intermediaries between routes and application logic. They receive requests, process them using models or services, and then return the appropriate response.

const db_con = require("../db");

exports.fetchAcceptedEvents = async (req, res) => {
    const { userID } = req.query;

    try {
        const [appliedEvents] = await db_con.query("SELECT events.* FROM event_details AS events, volunteers_list AS list WHERE list.UserID = ? AND list.Status = 'Accepted' AND list.EventID = events.EventID AND events.Event_Date > NOW() ORDER BY events.Event_Date ASC", [userID]);

        const appliedEventsArr = appliedEvents.map(event => ({
            eventID: event.EventID,
            name: event.Event_Name,
            description: event.Description,
            city: event.Location_City,
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
    const { userID } = req.query;

    try {
        const [user] = await db_con.query("SELECT * FROM profile_user WHERE UserID = ?", [userID]);

        if (!user || user.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

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
    const { eventID, userID } = req.body;

    try {
        await db_con.query("UPDATE volunteers_list SET Status = 'Dropped' WHERE UserID = ? AND EventID = ?", [userID, eventID]);

        res.status(200).json({ message: "Dropped from event successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

exports.markRead = async (req, res) => {
    const { notifID } = req.body;

    try {
        await db_con.query("UPDATE notification SET Is_Read = '1' WHERE NotificationID = ?", [notifID]);

        res.status(200).json({ message: "Marked notification as read." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

exports.fetchNotifications = async (req, res) => {
    const { userID } = req.query;

    try {
        // get all unread notifs + 10 most recent read notifs
        const [notifications] = await db_con.query("( SELECT * FROM notification WHERE UserID = ? AND Is_Read = '0' ) UNION ALL ( SELECT * FROM notification WHERE UserID = ? AND Is_Read = '1' ORDER BY Created_At DESC LIMIT 10 ) ORDER BY Created_At DESC", [userID, userID]);

        if (!notifications || notifications.length === 0) {
            return res.status(200).json({ message: "No notifications found." });
        }

        const notificationArray = notifications.map(notification => ({
            id: notification.NotificationID,
            type: notification.Type,
            text: notification.Notification_Text,
            date: notification.Created_At,
            isRead: notification.Is_Read,
        }))

        res.json(notificationArray);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}