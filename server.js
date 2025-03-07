const express = require("express");
const path = require('path');
const app = express();
const cors = require("cors");

app.use(cors()); // Enable CORS for frontend-backend communication
app.use(express.json()); // Parse incoming JSON requests

app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'frontend', 'admin_dashboard')));
app.use(express.static(path.join(__dirname, 'frontend', 'admin_form')));
app.use(express.static(path.join(__dirname, 'frontend', 'icon-images')));
app.use(express.static(path.join(__dirname, 'frontend', 'Login')));
app.use(express.static(path.join(__dirname, 'frontend', 'usermanageprofile')));
app.use(express.static(path.join(__dirname, 'frontend', 'volunteer')));

const apiEndpoints = require("./backend/api/loginRoutes.js");
app.use("/api", apiEndpoints);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "Login", "index.html", "sign-up.html"));
});

app.use((req, res) => {
    res.status(404);
    res.send('<h1>Error 404; Resource not found</h1>')
})

app.listen(process.env.PORT || 3000, () => console.log("App available on http://localhost:3000"));

/*
const { readFile } = require("fs").promises;
app.use(express.json()); // Allows backend to parse JSON data

// Serve frontend files (for Login page)
app.get("/", async (req, res) => {
    res.send(await readFile("./Login/index.html", "utf-8"));
});

// Import routes
const adminRoutes = require("./routes/adminRoutes");

// Use routes
app.use("/api/admin", adminRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App available on http://localhost:${PORT}`));
*/