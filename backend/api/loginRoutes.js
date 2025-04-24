const express = require("express");
const router = express.Router();
const connection = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'helo';

router.post("/signin", (req, res) => {
    const { email, password, role } = req.body;

    // Determine the table to query based on the role
    let tableName;
    if (role === "admin") {
        tableName = "credentials_admin";
    } else if (role === "volunteer") {
        tableName = "credentials_user";
    } else {
        return res.status(400).json({ message: "Invalid role provided" });
    }

    // Query the appropriate table
    const query = `SELECT * FROM ${tableName} WHERE Email = ? AND Password = ?`;
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign(
                { id: user.id, email: user.Email, role: role }, 
                JWT_SECRET, 
                { expiresIn: '1h' } 
            );
            return res.status(200).cookie("access-token", token, { maxAge: 1000000 }).send({ message: "Login successful", token });
        } else {
            return res.status(401).json({ message: "Invalid email or password" });
        }
    });
});



router.post("/signup", (req, res) => {
    const { email, password, role } = req.body;

    // Determine the table to insert into based on the role
    let tableName;
    let idColumn;
    if (role === "admin") {
        tableName = "credentials_admin";
        idColumn = "AdminID";
    } else if (role === "volunteer") {
        tableName = "credentials_user";
        idColumn = "UserID";
    } else {
        return res.status(400).json({ message: "Invalid role provided" });
    }

    // Check if user already exists
    const checkQuery = `SELECT * FROM ${tableName} WHERE Email = ?`;
    connection.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error("Error checking existing user:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length > 0) {
            return res.status(200).json({ message: "User already exists" });
        }

        // Generate a new ID manually
        const idQuery = `SELECT MAX(${idColumn}) AS maxId FROM ${tableName}`;
        connection.query(idQuery, (err, results) => {
            if (err) {
                console.error("Error generating new ID:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            const newId = results[0].maxId ? results[0].maxId + 1 : 1; // Increment max ID or start from 1

            const insertQuery = `INSERT INTO ${tableName} (${idColumn}, Email, Password) VALUES (?, ?, ?)`;
            connection.query(insertQuery, [newId, email, password], (err, result) => {
                if (err) {
                    console.error("Error inserting new user:", err);
                    return res.status(500).json({ message: "Internal server error" });
                }
                console.log("User signup");
                return res.status(200).json({ message: "User added successfully" });
            });
        });
    });
});

module.exports = router;
