const request = require("supertest");
const express = require('express');
const volunteerRoutes = require("../routes/volunteer-routes");

const app = express();
app.use(express.json());
app.use("/api/admin", volunteerRoutes);

const mockNotification = {
    header: "Header test",
    description: "Description test",
}

const invalidNotification = {
    header: null,
    description: null,
}

const findMeNotif = {
    id: 1,
}

// Notifications

describe("Takes correct header/description attributes to create a notification", () => {

    // Validating Notifications

    test("Should throw error if invalid or missing header/description inputs", async () => {
        const response = await request(app)
            .post("/api/admin/notifications")
            .send(invalidNotification);

        expect(response.status).toBe(400);
        // expect(response.body.errors).toBeDefined();
    });

    //  Creating Mock Notification

    test("Create a new notification", async () => {
        const response = await request(app)
            .post("/api/admin/notifications")
            .send(mockNotification);
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe(mockNotification.name);
    });


    // Show All Events

    test("Show all notifications", async () => {
        const response = await request(app)
            .get("/api/admin/notifications");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    })

    // Read Notification

    // test("Mark notification as read", async () => {
    //     const response = await request(app)
    //         .get("/api/admin/notifications")
    //         .send(findMeNotif);
        
    //     const notifID = response.body.id;
    //     const readNotif = await request(app).get(`/api/admin/notifications/${notifID}`);
    //     readNotif.read_status = 1;

    //     expect(readNotif.status).toBe(200);
    //     expect(readNotif.body.message).toBe("Notification read.");
    // })

});


// Apply for an Event by ID

// describe("Adds user to event volunteer_list", () => {

// })