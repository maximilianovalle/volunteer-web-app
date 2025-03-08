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

// Notification verification

describe("Takes correct header/description attributes to create a notification", () => {

    // Validating notification

    test("Should throw error if invalid or missing header/description inputs", async () => {
        const response = await request(app)
            .post("/api/admin/notifications")
            .send(invalidNotification);

        expect(response.status).toBe(400);
        // expect(response.body.errors).toBeDefined();
    });

    //  Creating mock notification

    test("Create a new notification", async () => {
        const response = await request(app)
            .post("/api/admin/notifications")
            .send(mockNotification);
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe(mockNotification.name);
    });

});

// Apply for an Event by ID

// describe("Adds user to event volunteer_list", () => {
        
// })