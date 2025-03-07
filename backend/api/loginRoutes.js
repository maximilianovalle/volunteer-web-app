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
    
    const user = {
        "first": first,
        "name": last,
        "email": email,
        "pass": password,  
        "role": role,
    }

    if (user in db) {
        return res.json({ message: "User already exists"});
    } else {
        console.log("anyone123");
        db.push(user)
        //PUSH TO DATABASE
        console.log(first);
        console.log(last);
        console.log(email);
        console.log(password);
        console.log(role);
        console.log("anyone1234");
    }

});

module.exports = router;