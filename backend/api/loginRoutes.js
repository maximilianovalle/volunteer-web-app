const express = require("express");
const router = express.Router();

db = [

    {
        "first": "john",
        "name": "doe",
        "email": "test@gmail.com",
        "pass": "123",  
        "role": "volunteer",
    }
]

router.post("/signin", (req, res) => {
    const { email, password, role } = req.body;

    for(let i=0; i < db.length; i++) {
        if (email == db[i].email && password == db[i].pass && role == db[i].role) {
            console.log("anyone");
            return res.json({ message: "Login successful", token: "your-jwt-token" });
        }
    }
    res.status(401).json({ message: "Invalid email or password" });
    
});

router.post("/signup", (req, res) => {
    const { first, last, email, password, role } = req.body;

    const existingUser = db.find(user => user.email === email);
    if (existingUser) {
        return res.status(200).json({ message: "User already exists" });
    }

    const newUser = {
        first: first,
        name: last,
        email: email,
        pass: password,
        role: role,
    };

    db.push(newUser);

    return res.status(200).json({ message: "User added successfully" });
});


module.exports = router;
