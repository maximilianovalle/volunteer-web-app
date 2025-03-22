require('dotenv').config({ path: __dirname + '/../.env.test' });


const request = require("supertest");
const express = require("express");
const adminRoutes = require("../routes/adminRoutes");
const db = require("../db"); // Your DB connection

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

let validSkill;
let existingVolunteer;
let testEvent;

beforeAll(async () => {
    // Fetch a real skill from the DB (from any existing event)
    const [events] = await db.query("SELECT Required_Skills FROM event_details WHERE Required_Skills IS NOT NULL LIMIT 1");
    validSkill = events.length ? events[0].Required_Skills.split(",")[0].trim() : "Technical Skills";

    // Fetch a real volunteer name from the DB
    const [volunteers] = await db.query("SELECT Full_Name FROM profile_user LIMIT 1");
    existingVolunteer = volunteers.length ? volunteers[0].Full_Name : "Test Volunteer";

    // If DB has no data, insert some fallback seed data
    if (!existingVolunteer) {
        await db.query("INSERT INTO profile_user (Full_Name, Skills) VALUES ('Test Volunteer', ?)", [validSkill]);
        existingVolunteer = "Test Volunteer";
    }
});

beforeEach(() => {
    // Reset a fresh event before each test
    testEvent = {
        Managed_By: 1,
        name: "Test Event " + Date.now(), // Unique name per run
        description: "Automated test description",
        location_state: "TX",
        required_skills: [validSkill],
        urgency: "Medium",
        event_date: "2025-04-10",
        type: "Education"
    };
});

afterAll(async () => {
    await db.end(); // Close DB connection
});

describe("Admin API - Event Management", () => {

    it("should create a new event", async () => {
        const response = await request(app)
            .post("/api/admin/events")
            .send(testEvent);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("eventId");
    });

    it("should retrieve all events", async () => {
        const response = await request(app).get("/api/admin/events");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("should delete an event", async () => {
        const createRes = await request(app)
            .post("/api/admin/events")
            .send(testEvent);

        const eventId = createRes.body.eventId;

        const deleteRes = await request(app).delete(`/api/admin/events/${eventId}`);
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.message).toMatch(/deleted successfully/i);
    });

});

describe("Admin API - Volunteer Matching", () => {

    it("should match a volunteer to an event", async () => {
        const res = await request(app)
            .post("/api/admin/match-volunteer")
            .send({ volunteerName: existingVolunteer });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("matchedEvent");
    });

    it("should return an error for missing event name", async () => {
        const response = await request(app)
            .post("/api/admin/events")
            .send({
                Managed_By: 1,
                location_state: "TX",
                description: "Missing name test",
                required_skills: [validSkill],
                urgency: "Medium",
                event_date: "2025-04-10",
                type: "Education"
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/missing required fields/i);
    });

});
