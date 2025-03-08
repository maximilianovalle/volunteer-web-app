// tests/profileController.test.js
const request = require("supertest");
const express = require("express");
const profileRoutes = require("../routes/profileRoutes");

const app = express();
app.use(express.json());
app.use("/api", profileRoutes);

describe("Profile Validation Tests", () => {
    test("Should return 400 if required fields are missing", async () => {
        const response = await request(app).post("/api/user/profile").send({});
        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

    test("Should return 400 if name exceeds character limit", async () => {
        const response = await request(app).post("/api/user/profile").send({
            name: "A".repeat(51),
            address1: "123 Main St",
            city: "Sample City",
            state: "CA",
            zipcode: "12345",
            skills: ["programming"],
            availabilityDates: ["2025-03-01"]
        });
        expect(response.status).toBe(400);
        expect(response.body.errors).toContain("Name is required and should be at most 50 characters.");
    });

    test("Should return 200 if valid profile data is provided", async () => {
        const response = await request(app).post("/api/user/profile").send({
            name: "John Doe",
            address1: "123 Main St",
            city: "Sample City",
            state: "CA",
            zipcode: "12345",
            skills: ["programming"],
            availabilityDates: ["2025-03-01"]
        });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Profile submitted successfully!");
    });
});
