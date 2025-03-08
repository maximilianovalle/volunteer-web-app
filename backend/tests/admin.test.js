const request = require("supertest");
const express = require("express");
const adminRoutes = require("../routes/adminRoutes");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

// Mock Data for Testing
const testEvent = {
    name: "Test Event",
    location: "Test Location",
    date: "2025-04-10",
    skills_required: ["Leadership"]
};

describe("Admin API - Event Management", () => {

    // ✅ Test 1: Create an Event
    it("should create a new event", async () => {
        const response = await request(app)
            .post("/api/admin/events")
            .send(testEvent);
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe(testEvent.name);
    });

    // ✅ Test 2: Get All Events
    it("should retrieve all events", async () => {
        const response = await request(app).get("/api/admin/events");
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // ✅ Test 3: Delete an Event
    it("should delete an event", async () => {
        const response = await request(app)
            .post("/api/admin/events")
            .send(testEvent);

        const eventId = response.body.id;
        const deleteResponse = await request(app).delete(`/api/admin/events/${eventId}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.message).toBe("Event deleted successfully");
    });

});

describe("Admin API - Volunteer Matching", () => {

    // ✅ Test 4: Match a Volunteer to an Event
    it("should match a volunteer to an event", async () => {
        const matchResponse = await request(app)
            .post("/api/admin/match-volunteer")
            .send({ volunteerName: "John Doe" });

        expect(matchResponse.status).toBe(200);
        expect(matchResponse.body).toHaveProperty("matchedEvent");
    });

    // ✅ Test 5: Validation - Missing Event Name
    it("should return an error for missing event name", async () => {
        const response = await request(app)
            .post("/api/admin/events")
            .send({
                location: "No Name Location",
                date: "2025-04-10",
                skills_required: ["Leadership"]
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Missing required fields");
    });

});
