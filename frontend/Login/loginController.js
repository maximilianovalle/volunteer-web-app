let users = []; // In-memory storage for users (for demo purposes)

// Sign Up User (POST)
exports.signUpUser = (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = {
        id: users.length + 1,
        firstName,
        lastName,
        email,
        password, 
    };

    users.push(newUser);

    // Respond with the new user data
    res.status(201).json({
        message: "User registered successfully",
        user: { id: newUser.id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email }
    });
};

// Log In User (POST)
exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // Respond with a success message and the user data
    res.json({
        message: "Login successful",
        user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }
    });
};