// tests/profileController.test.js
const request = require("supertest");
const express = require("express");
const profileRoutes = require("../routes/profileRoutes");

const app = express();
app.use(express.json());
app.use("/api", profileRoutes);

describe("Additional Profile Validation Tests", () => {
    test("Should return 400 if address1 exceeds character limit", async () => {
      const response = await request(app).post("/api/user/profile").send({
        name: "John Doe",
        address1: "A".repeat(101),
        city: "Sample City",
        state: "CA",
        zipcode: "12345",
        skills: ["animalcare"],
        availabilityDates: ["2025-03-01"]
      });
      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("Address 1 is required and should be at most 100 characters.");
    });
  
    test("Should return 400 if city exceeds character limit", async () => {
      const response = await request(app).post("/api/user/profile").send({
        name: "John Doe",
        address1: "123 Main St",
        city: "A".repeat(101),
        state: "CA",
        zipcode: "12345",
        skills: ["animalcare"],
        availabilityDates: ["2025-03-01"]
      });
      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("City is required and should be at most 100 characters.");
    });
  
    test("Should return 400 if no availability dates are provided", async () => {
      const response = await request(app).post("/api/user/profile").send({
        name: "John Doe",
        address1: "123 Main St",
        city: "Sample City",
        state: "CA",
        zipcode: "12345",
        skills: ["animalcare"],
        availabilityDates: []
      });
      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("At least one availability date must be selected.");
    });
  
    test("Should accept multiple skills", async () => {
      const response = await request(app).post("/api/user/profile").send({
        name: "John Doe",
        address1: "123 Main St",
        city: "Sample City",
        state: "CA",
        zipcode: "12345",
        skills: ["animalcare", "gardening", "cleaning"],
        availabilityDates: ["2025-03-01"]
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Profile submitted successfully!");
    });
  
    test("Should accept multiple availability dates", async () => {
      const response = await request(app).post("/api/user/profile").send({
        name: "John Doe",
        address1: "123 Main St",
        city: "Sample City",
        state: "CA",
        zipcode: "12345",
        skills: ["animalcare"],
        availabilityDates: ["2025-03-01", "2025-03-15", "2025-04-01"]
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Profile submitted successfully!");
    });
  });
  
  // Mock the database connection for handleProfileSubmission tests
  jest.mock("../db", () => ({
    query: jest.fn((query, params, callback) => {
      // Mock successful database operation
      callback(null, { insertId: 123 });
    })
  }));
  
  const db = require("../db");
  
  describe("Profile Submission Tests", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test("Should handle database error gracefully", async () => {
      // Mock a database error for this specific test
      db.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error("Database connection failed"), null);
      });
  
      const response = await request(app).post("/api/user/profile").send({
        name: "John Doe",
        address1: "123 Main St",
        city: "Sample City",
        state: "CA",
        zipcode: "12345",
        skills: ["animalcare"],
        availabilityDates: ["2025-03-01"]
      });
  
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to save profile information");
      expect(response.body.details).toBe("Database connection failed");
    });
  
    test("Should process non-array skills correctly", async () => {
      await request(app).post("/api/user/profile").send({
        name: "John Doe",
        address1: "123 Main St",
        city: "Sample City",
        state: "CA",
        zipcode: "12345",
        skills: "animalcare", // String instead of array
        availabilityDates: ["2025-03-01"]
      });
  
      // Check that the db.query was called with the correct parameters
      expect(db.query).toHaveBeenCalled();
      const callParams = db.query.mock.calls[0][1];
      expect(callParams[7]).toBe("animalcare"); // The 8th parameter (index 7) should be the skills
    });
  
    test("Should handle null values for optional fields", async () => {
      await request(app).post("/api/user/profile").send({
        name: "John Doe",
        address1: "123 Main St",
        // address2 is omitted
        city: "Sample City",
        state: "CA",
        zipcode: "12345",
        skills: ["animalcare"],
        // preferences is omitted
        availabilityDates: ["2025-03-01"]
      });
  
      // Check that the db.query was called with the correct parameters
      expect(db.query).toHaveBeenCalled();
      const callParams = db.query.mock.calls[0][1];
      expect(callParams[3]).toBeNull(); // address2 should be null
      expect(callParams[8]).toBeNull(); // preferences should be null
    });
  });

  describe("Route Tests for profileRoutes.js", () => {
    test("GET /api/test should return API status", async () => {
      const response = await request(app).get("/api/test");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "API is working" });
    });
  
    test("POST /api/test/profile should echo back profile data", async () => {
      const testData = {
        name: "Jane Doe",
        address1: "456 Elm Street",
        city: "Cityville",
        state: "NY",
        zipcode: "54321",
        skills: ["cooking"],
        availabilityDates: ["2025-06-01"]
      };
  
      const response = await request(app).post("/api/test/profile").send(testData);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Profile data received successfully",
        data: testData
      });
    });
  
    test("POST /api/user/profile with all optional fields", async () => {
      const response = await request(app).post("/api/user/profile").send({
        name: "John Doe",
        address1: "123 Main St",
        address2: "Apt 4B",
        city: "Sample City",
        state: "CA",
        zipcode: "12345",
        skills: ["gardening"],
        preferences: "morning shifts only",
        availabilityDates: ["2025-03-01", "2025-03-05"]
      });
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Profile submitted successfully!");
    });
  
    test("GET /api/user/profile should return 404 (invalid method)", async () => {
      const response = await request(app).get("/api/user/profile");
      expect(response.status).toBe(404);
    });
  });
  
