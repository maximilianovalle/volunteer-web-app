const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const loginRouter = require("../api/loginRoutes");

jest.mock("../db.js", () => {
    const mockQuery = jest.fn();
    return { query: mockQuery };
});
const db = require("../db.js");

const JWT_SECRET = process.env.JWT_SECRET || 'helo';

const app = express();
app.use(express.json());
app.use("/", loginRouter);

describe("Login Routes", () => {
    beforeEach(() => {
        db.query.mockClear();
    });

    describe("POST /signin", () => {
        it("should login a volunteer successfully", async () => {
            const email = "test@gmail.com";
            const password = "123";
            const role = "volunteer";

            db.query.mockResolvedValueOnce([[{ UserID: 1, Email: email, Password: password }]]);

            const response = await request(app)
                .post("/signin")
                .send({ email, password, role });

            const decoded = jwt.verify(response.body.token, JWT_SECRET);
            expect(decoded).toMatchObject({ id: 1, email, role });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Login successful");
            expect(response.body).toHaveProperty("token");
        });

        it("should fail login with wrong credentials", async () => {
            db.query.mockResolvedValueOnce([[]]);

            const response = await request(app)
                .post("/signin")
                .send({
                    email: "fake@gmail.com",
                    password: "wrong",
                    role: "admin"
                });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid email or password" });
        });

        it("should return 400 for invalid role", async () => {
            const response = await request(app)
                .post("/signin")
                .send({
                    email: "test@gmail.com",
                    password: "123",
                    role: "invalid"
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Invalid role provided" });
            expect(db.query).not.toHaveBeenCalled();
        });

        it("should return 500 on database error", async () => {
            db.query.mockRejectedValueOnce(new Error("DB error"));

            const response = await request(app)
                .post("/signin")
                .send({
                    email: "error@gmail.com",
                    password: "err",
                    role: "volunteer"
                });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error" });
        });
    });

    describe("POST /signup", () => {
        it("should signup a new volunteer", async () => {
            const email = "newuser@gmail.com";
            const password = "456";
            const role = "volunteer";

            db.query
                .mockResolvedValueOnce([[]]) // No existing user
                .mockResolvedValueOnce([[{ maxId: 1 }]]) // Get max id
                .mockResolvedValueOnce([]); // Insert success

            const response = await request(app)
                .post("/signup")
                .send({ email, password, role });

            const decoded = jwt.verify(response.body.token, JWT_SECRET);
            expect(decoded).toMatchObject({ id: 2, email, role });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("User added and logged in");
        });

        it("should not signup if user already exists", async () => {
            db.query.mockResolvedValueOnce([[{ Email: "existing@gmail.com" }]]);

            const response = await request(app)
                .post("/signup")
                .send({
                    email: "existing@gmail.com",
                    password: "pass",
                    role: "admin"
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "User already exists" });
        });

        it("should return 400 for invalid role", async () => {
            const response = await request(app)
                .post("/signup")
                .send({
                    email: "invalid@gmail.com",
                    password: "pass",
                    role: "unknown"
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Invalid role provided" });
        });

        it("should return 500 if DB throws error", async () => {
            db.query.mockRejectedValueOnce(new Error("DB error"));

            const response = await request(app)
                .post("/signup")
                .send({
                    email: "fail@gmail.com",
                    password: "failpass",
                    role: "volunteer"
                });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error" });
        });
    });
});
