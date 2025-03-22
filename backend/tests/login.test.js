const request = require("supertest");
const express = require("express");
const loginRouter = require("../api/loginRoutes"); 

const app = express();
app.use(express.json());
app.use("/", loginRouter);

describe("Login API Tests", () => {
  describe("POST /signin", () => {
    it("should return a success message and token for valid credentials", async () => {
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
    });

    it("should return an error for invalid credentials", async () => {
      const response = await request(app)
        .post("/signin")
        .send({
          email: "wrong@gmail.com",
          password: "wrongpassword",
          role: "volunteer",
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid email or password");
    });
  });

  describe("POST /signup", () => {
    it("should add a new user and return a success message", async () => {
      const newUser = {
        first: "Jane",
        last: "Doe",
        email: "jane.doe@gmail.com",
        password: "456",
        role: "admin",
      };

      const response = await request(app)
        .post("/signup")
        .send(newUser);

      expect(response.status).toBe(200);
      // Adjust this expectation based on your actual implementation
      expect(response.body).toHaveProperty("message", "User added successfully");
    });

    it("should return an error if the user already exists", async () => {
      const existingUser = {
        first: "john",
        last: "doe",
        email: "test@gmail.com",
        password: "123",
        role: "volunteer",
      };

      const response = await request(app)
        .post("/signup")
        .send(existingUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "User already exists");
    });
  });
});
