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

describe("Takes correct header/description attributes to create a notification.", () => {

    //  Creating mock notification
    test("Create a new notification", async () => {
        const response = await request(app)
            .post("/api/admin/notifications")
            .send(mockNotification);
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe(mockNotification.name);
    });
    
    // No header/description provided for notification

    test("Should throw error if no header/description provided.", async () => {

        const response = await request(app).post("/api/admin/notifications").send({});
        expect(response.status).toBe(400);  // 400: bad request error
        expect(response.body.errors).toBe("Missing required fields.");

    });

});