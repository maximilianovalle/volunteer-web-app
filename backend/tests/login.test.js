const request = require("supertest");
const express = require("express");
const loginRouter = require("../api/loginRoutes");

// Mock the database connection
jest.mock("../db.js", () => {
    const mockQuery = jest.fn();
    return {
        query: mockQuery,
    };
});

const db = require("../db.js");

const app = express();
app.use(express.json());
app.use("/", loginRouter);

describe("Login API Tests", () => {
    beforeEach(() => {
        db.query.mockClear();
    });

    describe("POST /signin", () => {
        it("should return a success message and token for valid user credentials", async () => {
            db.query.mockImplementationOnce((query, params, callback) => {
                callback(null, [{ UserID: 1, Email: "test@gmail.com", Password: "123" }]);
            });

            const response = await request(app)
                .post("/signin")
                .send({
                    email: "test@gmail.com",
                    password: "123",
                    role: "volunteer",
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Login successful");
            expect(response.body).toHaveProperty("token", "your-jwt-token");
            expect(db.query).toHaveBeenCalledWith(
                "SELECT * FROM credentials_user WHERE Email = ? AND Password = ?",
                ["test@gmail.com", "123"],
                expect.any(Function)
            );
        });

        it("should return a success message and token for valid admin credentials", async () => {
            db.query.mockImplementationOnce((query, params, callback) => {
                callback(null, [{ AdminID: 1, Email: "admin@gmail.com", Password: "123" }]);
            });

            const response = await request(app)
                .post("/signin")
                .send({
                    email: "admin@gmail.com",
                    password: "123",
                    role: "admin",
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Login successful");
            expect(response.body).toHaveProperty("token", "your-jwt-token");
            expect(db.query).toHaveBeenCalledWith(
                "SELECT * FROM credentials_admin WHERE Email = ? AND Password = ?",
                ["admin@gmail.com", "123"],
                expect.any(Function)
            );
        });

        it("should return an error for invalid credentials", async () => {
            db.query.mockImplementationOnce((query, params, callback) => {
                callback(null, []);
            });

            const response = await request(app)
                .post("/signin")
                .send({
                    email: "wrong@gmail.com",
                    password: "wrongpassword",
                    role: "volunteer",
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("message", "Invalid email or password");
            expect(db.query).toHaveBeenCalled();
        });

        it("should return an error for invalid role", async () => {
            const response = await request(app)
                .post("/signin")
                .send({
                    email: "test@gmail.com",
                    password: "123",
                    role: "invalid",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message", "Invalid role provided");
            expect(db.query).not.toHaveBeenCalled();
        });
    });

    describe("POST /signup", () => {
        it("should add a new user and return a success message", async () => {
            // Mock the database queries
            db.query.mockImplementationOnce((query, params, callback) => {
                // Mock the check for existing user query
                callback(null, []);
            });

            // Mock the ID query
            db.query.mockImplementationOnce((query, callback) => {
                // Mock the select max(id) query
                callback(null, [{ maxId: 1 }]); // Simulate max ID as 1
            });

            db.query.mockImplementationOnce((query, params, callback) => {
                // Mock the insert query
                callback(null, { insertId: 2 });
            });

            const newUser = {
                email: "jane.doe@gmail.com",
                password: "456",
                role: "volunteer",
            };

            const response = await request(app)
                .post("/signup")
                .send(newUser);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "User added successfully");
            expect(db.query).toHaveBeenCalledWith(
                "SELECT * FROM credentials_user WHERE Email = ?",
                ["jane.doe@gmail.com"],
                expect.any(Function)
            );
            expect(db.query).toHaveBeenCalledWith(
                "SELECT MAX(UserID) AS maxId FROM credentials_user",
                expect.any(Function)
            );
            expect(db.query).toHaveBeenCalledWith(
                "INSERT INTO credentials_user (UserID, Email, Password) VALUES (?, ?, ?)",
                [2, "jane.doe@gmail.com", "456"],
                expect.any(Function)
            );
        });

        it("should add a new admin and return a success message", async () => {
            db.query.mockImplementationOnce((query, params, callback) => {
                callback(null, []);
            });

            // Mock the ID query
            db.query.mockImplementationOnce((query, callback) => {
                // Mock the select max(id) query
                callback(null, [{ maxId: 1 }]); // Simulate max ID as 1
            });

            db.query.mockImplementationOnce((query, params, callback) => {
                callback(null, { insertId: 2 });
            });

            const newUser = {
                email: "admin.doe@gmail.com",
                password: "456",
                role: "admin",
            };

            const response = await request(app)
                .post("/signup")
                .send(newUser);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "User added successfully");
            expect(db.query).toHaveBeenCalledWith(
                "SELECT * FROM credentials_admin WHERE Email = ?",
                ["admin.doe@gmail.com"],
                expect.any(Function)
            );
            expect(db.query).toHaveBeenCalledWith(
                "SELECT MAX(AdminID) AS maxId FROM credentials_admin",
                expect.any(Function)
            );
            expect(db.query).toHaveBeenCalledWith(
                "INSERT INTO credentials_admin (AdminID, Email, Password) VALUES (?, ?, ?)",
                [2, "admin.doe@gmail.com", "456"],
                expect.any(Function)
            );
        });

        it("should return an error if the user already exists", async () => {
            db.query.mockImplementationOnce((query, params, callback) => {
                // Simulate user already exists
                callback(null, [{ Email: "test@gmail.com" }]);
            });

            const existingUser = {
                email: "test@gmail.com",
                password: "123",
                role: "volunteer",
            };

            const response = await request(app)
                .post("/signup")
                .send(existingUser);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "User already exists");
            expect(db.query).toHaveBeenCalled();
        });

        it("should handle signup error", async () => {
            db.query.mockImplementationOnce((query, params, callback) => {
                callback(new Error("Database error"), null);
            });

            const newUser = {
                email: "error@gmail.com",
                password: "errorpassword",
                role: "volunteer",
            };

            const response = await request(app)
                .post("/signup")
                .send(newUser);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "Internal server error");
            expect(db.query).toHaveBeenCalled();
        });
    });
});
