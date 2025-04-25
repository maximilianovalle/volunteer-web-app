const express = require("express");
const router = express.Router();
const connection = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'helo';

router.post("/signin", async (req, res) => {
    const { email, password, role } = req.body;

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

    const query = `SELECT * FROM ${tableName} WHERE Email = ? AND Password = ?`;

    try {
        const [results] = await connection.query(query, [email, password]);

        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign(
                { id: user[idColumn], email: user.Email, role },
                JWT_SECRET,
                { expiresIn: '1h' }
            );
            return res
                .status(200)
                .cookie("access-token", token, { maxAge: 1000000 })
                .send({ message: "Login successful", token });
        } else {
            return res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});






router.post("/signup", async (req, res) => {
    const { email, password, role } = req.body;

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

    try {
        const [existingUsers] = await connection.query(`SELECT * FROM ${tableName} WHERE Email = ?`, [email]);
        if (existingUsers.length > 0) {
            return res.status(200).json({ message: "User already exists" });
        }

        const [idResult] = await connection.query(`SELECT MAX(${idColumn}) AS maxId FROM ${tableName}`);
        const newId = idResult[0].maxId ? idResult[0].maxId + 1 : 1;

        await connection.query(
            `INSERT INTO ${tableName} (${idColumn}, Email, Password) VALUES (?, ?, ?)`,
            [newId, email, password]
        );

        const token = jwt.sign(
            { id: newId, email, role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res
            .status(200)
            .cookie("access-token", token, { maxAge: 1000000 })
            .json({ message: "User added and logged in", token, role });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;
