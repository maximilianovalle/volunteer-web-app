const request = Require("supertest");
const express = Require('express');
const adminRoutes = Require("../routes/volunteer-routes");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("Takes correct header/description attributes to create a notification.", () => {

    // test("Should return 200 if valid profile data is provided", async () => {
    //     const response = await request(app).post("/api/user/profile").send({
    //         name: "John Doe",
    //         address1: "123 Main St",
    //         city: "Sample City",
    //         state: "CA",
    //         zipcode: "12345",
    //         skills: ["programming"],
    //         availabilityDates: ["2025-03-01"]
    //     });
    //     expect(response.status).toBe(200);
    //     expect(response.body.message).toBe("Profile submitted successfully!");
    // });

    // No header/description provided for notification

    test("Should throw error if no header/description provided.", async () => {

        const response = await request(app).post("/api/admin/notifications").send({});
        expect(response.status).toBe(400);  // 400: bad request error
        expect(response.body.errors).toBe("Missing required fields.");

    });

});