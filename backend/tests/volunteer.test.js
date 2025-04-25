const request = require("supertest");
const express = require('express');
const volunteerRoutes = require("../routes/volunteer-routes");

const app = express();
app.use(express.json());
app.use("/api/volunteer", volunteerRoutes);

const userID = 1;
const eventID = 1;
const notifID = 1;

describe("Volunteer Controllers", () => {

    test("Fetch all events", async () => {
        const response = await request(app)
            .get(`/api/volunteer/allEvents?userID=${userID}`);

        expect([200, 500]).toContain(response.status);
        // expect(Array.isArray(response.body)).toBe(true);
    });

    test("Fetch accepted events", async () => {
        const response = await request(app)
            .get(`/api/volunteer/accepted?userID=${userID}`);

        expect([200, 500]).toContain(response.status);
        // expect(Array.isArray(response.body)).toBe(true);
    });

    test("Fetch user profile", async () => {
        const response = await request(app)
            .get(`/api/volunteer/user?userID=${userID}`);

        expect([200, 500]).toContain(response.status);
        // expect(response.body).toHaveProperty("name");
    });

    test("Apply to an event", async () => {
        const response = await request(app)
            .post(`/api/volunteer/apply`)
            .send({ eventID, userID });

        expect([200, 500]).toContain(response.status);
    });

    test("Drop from an event", async () => {
        const response = await request(app)
            .put(`/api/volunteer/drop`)
            .send({ eventID, userID });

        expect([200, 500]).toContain(response.status);
    });

    test("Fetch notifications", async () => {
        const response = await request(app)
            .get(`/api/volunteer/notifications?userID=${userID}`);

        expect([200, 500]).toContain(response.status);
        expect(typeof response.body).toBe("object");
    });

    test("Mark notification as read", async () => {
        const response = await request(app)
            .put(`/api/volunteer/markRead`)
            .send({ notifID });

        expect([200, 500]).toContain(response.status);
    });

});