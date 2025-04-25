require('dotenv').config({ path: __dirname + '/../.env.test' });

const request = require("supertest");
const express = require("express");
const adminRoutes = require("../routes/adminRoutes");
const db = require("../db");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

let validSkill;
let existingVolunteer;
let testEvent;

beforeAll(async () => {
    const [events] = await db.query("SELECT Required_Skills FROM event_details WHERE Required_Skills IS NOT NULL LIMIT 1");
    validSkill = events.length ? events[0].Required_Skills.split(",")[0].trim() : "Technical Skills";

    const [volunteers] = await db.query("SELECT Full_Name, Skills FROM profile_user LIMIT 1");
    existingVolunteer = volunteers.length ? volunteers[0].Full_Name : "Test Volunteer";

    if (!existingVolunteer) {
        await db.query("INSERT INTO profile_user (Full_Name, Skills) VALUES ('Test Volunteer', ?)", [validSkill]);
        existingVolunteer = "Test Volunteer";
    }
});

beforeEach(() => {
    testEvent = {
        Managed_By: 1,
        name: "Test Event " + Date.now(),
        description: "Testing automation",
        location_state: "TX",
        required_skills: [validSkill],
        urgency: "Medium",
        event_date: "2025-04-10",
        type: "Education"
    };
});

afterAll(async () => {
    await db.end();
});

describe("Admin Events API", () => {

    it("should create a valid event", async () => {
        const res = await request(app).post("/api/admin/events").send(testEvent);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("eventId");
    });

    it("should fail to create event with missing fields", async () => {
        const invalidEvent = { ...testEvent };
        delete invalidEvent.name;

        const res = await request(app).post("/api/admin/events").send(invalidEvent);
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/missing required fields/i);
    });

    it("should fail with invalid urgency", async () => {
        const res = await request(app)
            .post("/api/admin/events")
            .send({ ...testEvent, urgency: "Extreme" });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/invalid urgency/i);
    });

    it("should retrieve all admin-created events", async () => {
        const res = await request(app).get("/api/admin/events");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("should delete an existing event", async () => {
        const createRes = await request(app).post("/api/admin/events").send(testEvent);
        const id = createRes.body.eventId;

        const res = await request(app).delete(`/api/admin/events/${id}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted successfully/i);
    });

    it("should return 404 when deleting non-existing event", async () => {
        const res = await request(app).delete("/api/admin/events/99999999");
        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/event not found/i);
    });
});

describe("Volunteer Matching API", () => {
    it("should match an existing volunteer to an event", async () => {
        const res = await request(app)
            .post("/api/admin/match-volunteer")
            .send({ volunteerName: existingVolunteer });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("matchedEvent");
    });

    it("should return 404 if volunteer doesn't exist", async () => {
        const res = await request(app)
            .post("/api/admin/match-volunteer")
            .send({ volunteerName: "Non Existent Volunteer" });

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/volunteer not found/i);
    });

    it("should return 400 if name is not provided", async () => {
        const res = await request(app)
            .post("/api/admin/match-volunteer")
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/volunteer name is required/i);
    });
});

describe("Get Volunteers API", () => {
    it("should fetch all volunteers", async () => {
        const res = await request(app).get("/api/admin/volunteers");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("volunteers");
        expect(Array.isArray(res.body.volunteers)).toBe(true);
    });
});

it("should fail with invalid type", async () => {
    const res = await request(app)
        .post("/api/admin/events")
        .send({ ...testEvent, type: "UnknownType" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid type/i);
});

it("should handle DB error in getVolunteers", async () => {
    const originalQuery = db.query;
    db.query = jest.fn().mockRejectedValue(new Error("Simulated DB error"));

    const res = await request(app).get("/api/admin/volunteers");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Database error");

    db.query = originalQuery;
});

