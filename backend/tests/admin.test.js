require("dotenv").config({ path: __dirname + "/../.env.test" });
jest.setTimeout(20000);

jest.mock("../db", () => ({
  query: jest.fn(),
  end: jest.fn()
}));

const request = require("supertest");
const express = require("express");
const adminRoutes = require("../routes/adminRoutes");
const db = require("../db");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

let validSkill = "Technical Skills";
let existingVolunteer = "Test Volunteer";
let testEvent;

beforeEach(() => {
  testEvent = {
    Managed_By: 1,
    name: "Test Event " + Date.now(),
    description: "Automated test event",
    Location_City: "Dallas",
    Location_State_Code: "TX",
    required_skills: [validSkill],
    urgency: "Medium",
    event_date: "2025-05-01",
    type: "Education"
  };

  jest.clearAllMocks();
});

afterAll(async () => {
  await db.end();
});

describe("Admin API - Event Management", () => {
  it("should create a new event", async () => {
    db.query.mockResolvedValueOnce([{ insertId: 123 }]);
    const res = await request(app).post("/api/admin/events").send(testEvent);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("eventId", 123);
  });

  it("should return 400 for missing required fields", async () => {
    const res = await request(app).post("/api/admin/events").send({ Managed_By: 1 });
    expect(res.status).toBe(400);
  });

  it("should return 400 for invalid urgency", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .send({ ...testEvent, urgency: "Extreme" });
    expect(res.status).toBe(400);
  });

  it("should return 400 for invalid type", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .send({ ...testEvent, type: "Unknown" });
    expect(res.status).toBe(400);
  });

  it("should return 400 for invalid skills", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .send({ ...testEvent, required_skills: ["BadSkill"] });
    expect(res.status).toBe(400);
  });

  it("should retrieve all events", async () => {
    db.query.mockResolvedValueOnce([
      [{ EventID: 1, Event_Name: "Sample", Event_Date: "2025-01-01", is_deleted: false }]
    ]);
    const res = await request(app).get("/api/admin/events");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should handle DB error in getAdminEvents", async () => {
    db.query.mockRejectedValueOnce(new Error("DB failed"));
    const res = await request(app).get("/api/admin/events");
    expect(res.status).toBe(500);
  });

  it("should soft delete an event", async () => {
    db.query
      .mockResolvedValueOnce([[{ EventID: 1 }]])
      .mockResolvedValueOnce([{}]);
    const res = await request(app).delete("/api/admin/events/1");
    expect(res.status).toBe(200);
  });

  it("should return 404 if event not found to delete", async () => {
    db.query.mockResolvedValueOnce([[]]);
    const res = await request(app).delete("/api/admin/events/999");
    expect(res.status).toBe(404);
  });
});

describe("Admin API - Volunteer Matching", () => {
  it("should return matches", async () => {
    db.query
      .mockResolvedValueOnce([[{ UserID: 1, Skills: "Technical Skills", Availability: "" }]])
      .mockResolvedValueOnce([
        [{ EventID: 1, Event_Name: "Event", Required_Skills: "Technical Skills" }]
      ]);
    const res = await request(app)
      .post("/api/admin/match-volunteer")
      .send({ volunteerName: existingVolunteer });
    expect(res.status).toBe(200);
  });

  it("should return empty match if no skills overlap", async () => {
    db.query
      .mockResolvedValueOnce([[{ UserID: 1, Skills: "Gardening" }]])
      .mockResolvedValueOnce([
        [{ EventID: 1, Event_Name: "Event", Required_Skills: "Medical" }]
      ]);
    const res = await request(app)
      .post("/api/admin/match-volunteer")
      .send({ volunteerName: existingVolunteer });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.matchedEvents)).toBe(true);
  });

  it("should return 400 if volunteerName missing", async () => {
    const res = await request(app).post("/api/admin/match-volunteer").send({});
    expect(res.status).toBe(400);
  });

  it("should return 404 if volunteer not found", async () => {
    db.query.mockResolvedValueOnce([[]]);
    const res = await request(app)
      .post("/api/admin/match-volunteer")
      .send({ volunteerName: "Ghost" });
    expect(res.status).toBe(404);
  });

  it("should handle DB error in matchVolunteersToEvent", async () => {
    db.query.mockRejectedValueOnce(new Error("Query fail"));
    const res = await request(app)
      .post("/api/admin/match-volunteer")
      .send({ volunteerName: existingVolunteer });
    expect(res.status).toBe(500);
  });
});

describe("Admin API - Volunteer Assignment", () => {
  it("should assign volunteer", async () => {
    db.query
      .mockResolvedValueOnce([[{ UserID: 1 }]])
      .mockResolvedValueOnce([{}]);
    const res = await request(app)
      .post("/api/admin/assign-volunteer")
      .send({ volunteerName: existingVolunteer, eventId: 1 });
    expect(res.status).toBe(200);
  });

  it("should return 400 if volunteerName or eventId missing", async () => {
    let res = await request(app).post("/api/admin/assign-volunteer").send({ eventId: 1 });
    expect(res.status).toBe(400);

    res = await request(app).post("/api/admin/assign-volunteer").send({ volunteerName });
    expect(res.status).toBe(400);
  });

  it("should return 404 if volunteer not found", async () => {
    db.query.mockResolvedValueOnce([[]]);
    const res = await request(app)
      .post("/api/admin/assign-volunteer")
      .send({ volunteerName: "Nobody", eventId: 1 });
    expect(res.status).toBe(404);
  });

  it("should handle DB error in assignVolunteerToEvent", async () => {
    db.query.mockRejectedValueOnce(new Error("Assign failed"));
    const res = await request(app)
      .post("/api/admin/assign-volunteer")
      .send({ volunteerName, eventId: 1 });
    expect(res.status).toBe(500);
  });
});

describe("Admin API - Participation and CSV", () => {
  it("should return all volunteers", async () => {
    db.query.mockResolvedValueOnce([[{ Full_Name: "Test" }]]);
    const res = await request(app).get("/api/admin/volunteers");
    expect(res.status).toBe(200);
  });

  it("should handle error in getVolunteers", async () => {
    db.query.mockRejectedValueOnce(new Error("fail"));
    const res = await request(app).get("/api/admin/volunteers");
    expect(res.status).toBe(500);
  });

  it("should return event assignments", async () => {
    db.query.mockResolvedValueOnce([[{ EventID: 1 }]]);
    const res = await request(app).get("/api/admin/event-assignments");
    expect(res.status).toBe(200);
  });

  it("should export assignments CSV", async () => {
    db.query.mockResolvedValueOnce([[{ Event_Name: "E", Volunteer_Names: "V" }]]);
    const res = await request(app).get("/api/admin/export/event-assignments/csv");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/csv/);
  });

  it("should handle export assignment CSV error", async () => {
    db.query.mockRejectedValueOnce(new Error("fail"));
    const res = await request(app).get("/api/admin/export/event-assignments/csv");
    expect(res.status).toBe(500);
  });

  it("should return volunteer participation", async () => {
    db.query.mockResolvedValueOnce([[{ name: "V" }]]);
    const res = await request(app).get("/api/admin/participation-history");
    expect(res.status).toBe(200);
  });

  it("should export participation CSV", async () => {
    db.query.mockResolvedValueOnce([[{ name: "V" }]]);
    const res = await request(app).get("/api/admin/export/participation-history/csv");
    expect(res.status).toBe(200);
  });

  it("should handle export participation CSV error", async () => {
    db.query.mockRejectedValueOnce(new Error("fail"));
    const res = await request(app).get("/api/admin/export/participation-history/csv");
    expect(res.status).toBe(500);
  });
});
