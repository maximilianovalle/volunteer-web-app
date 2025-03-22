const express = require("express");
const path = require('path');
const app = express();
const cors = require("cors");



app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, "../frontend")));

const apiEndpoints = require("./api/loginRoutes.js");
app.use("/api", apiEndpoints);

const adminRoutes = require("./routes/adminRoutes"); 
app.use("/api/admin", adminRoutes);

const profileRoutes = require("./routes/profileRoutes"); //route is in controller file
app.use("/api/profile", profileRoutes);

const volunteerRoutes = require("./routes/volunteer-routes.js");
app.use("/api/volunteer", volunteerRoutes);



app.get("/admin-form", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/admin_form/admin_form.html"));
});

app.get("/admin-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/admin_dashboard/admin_dashboard.html"));
});

app.get("/volunteer-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/volunteer/volunteer-dashboard.html"));
});

// app.get("/volunteer-history", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend/volunteer/volunteer-history.html"));
// });

// app.get("/event-page", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend/volunteer/event-page.html"));
// });

// app.get("/notification-page", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend/volunteer/notification-page.html"));
// });

app.get("/user-manage-profile", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/usermanageprofile/usermanageprofile.html"));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/Login/index.html"));
});


app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/Login/sign-up.html"));
});


app.use((req, res) => {
    res.status(404);
    res.send('<h1>Error 404; Resource not found</h1>')
})

app.listen(process.env.PORT || 3000, () => console.log("App available on http://localhost:3000"));
