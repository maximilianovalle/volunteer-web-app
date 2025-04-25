const express = require("express");
const path = require('path');
const app = express();
const cors = require("cors");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const db = require("./db");

// Generate PDF for event assignments
app.get("/generate-event-pdf", async (req, res) => {
    try {
      const [data] = await db.query(`
        SELECT 
            e.Event_Name,
            e.Event_Date,
            e.Location_City,
            e.Location_State_Code,
            e.Type,
            e.Required_Skills,
            e.Urgency,
            GROUP_CONCAT(p.Full_Name ORDER BY p.Full_Name SEPARATOR ', ') AS Volunteer_Names
        FROM event_details e
        LEFT JOIN volunteers_list v ON e.EventID = v.EventID AND v.Status = 'Accepted'
        LEFT JOIN profile_user p ON v.UserID = p.UserID
        GROUP BY e.EventID
        ORDER BY e.Event_Date DESC;
      `);
  
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const outputPath = path.join(__dirname, "event_assignments_direct.pdf");
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
  
      const fontPath = path.join(__dirname, "fonts", "Roboto-Regular.ttf");
      if (fs.existsSync(fontPath)) {
        doc.font(fontPath);
      } else {
        doc.font("Times-Roman");
      }
  
      doc.fontSize(18).text("Event Assignments Report", { align: "center" });
      doc.moveDown();
  
      if (!data || data.length === 0) {
        doc.fontSize(12).text("No event assignments found.");
      } else {
        data.forEach((event, index) => {
          doc
            .fontSize(12)
            .text(`Event: ${event.Event_Name}`)
            .text(`Date: ${new Date(event.Event_Date).toLocaleDateString("en-US")}`)
            .text(`Location: ${event.Location_City || "N/A"}, ${event.Location_State_Code || ""}`)
            .text(`Type: ${event.Type}`)
            .text(`Skills: ${event.Required_Skills || "—"}`)
            .text(`Urgency: ${event.Urgency}`)
            .text(`Volunteers: ${event.Volunteer_Names || "—"}`)
            .moveDown();
  
          if ((index + 1) % 6 === 0) {
            doc.addPage();
          }
        });
      }
  
      doc.end();
  
      stream.on("finish", () => {
        res.download(outputPath, "event_assignments.pdf", (err) => {
          if (err) {
            res.status(500).send("Could not download PDF.");
          } else {
            fs.unlinkSync(outputPath);
          }
        });
      });
  
    } catch (err) {
      res.status(500).send("PDF generation failed.");
    }
  });
  
// Generate PDF for volunteer participation history
  app.get("/generate-participation-pdf", async (req, res) => {
    try {
      const [data] = await db.query(`
    SELECT 
        p.Full_Name AS name,
        h.Email AS email,
        p.City AS city,
        p.State_Code AS state,
        e.Event_Name AS event,
        h.Participation_Date AS date
    FROM history_user h
    JOIN profile_user p ON h.UserID = p.UserID
    JOIN event_details e ON h.EventID = e.EventID
    ORDER BY h.Participation_Date DESC;
      `);
  
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const outputPath = path.join(__dirname, "volunteer_participation.pdf");
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
  
      const fontPath = path.join(__dirname, "fonts", "Roboto-Regular.ttf");
      if (fs.existsSync(fontPath)) {
        doc.font(fontPath);
      } else {
        doc.font("Times-Roman");
      }
  
      doc.fontSize(18).text("Volunteer Participation Report", { align: "center" });
      doc.moveDown();
  
      if (!data || data.length === 0) {
        doc.fontSize(12).text("No participation records found.");
      } else {
        data.forEach((entry, index) => {
          doc
            .fontSize(12)
            .text(`Name: ${entry.name}`)
            .text(`Event: ${entry.event}`)
            .text(`Location: ${entry.Location_City || "N/A"}, ${entry.Location_State_Code || ""}`)
            .text(`Date: ${new Date(entry.date).toLocaleDateString("en-US")}`)
            .moveDown();
  
          if ((index + 1) % 10 === 0) {
            doc.addPage();
          }
        });
      }
  
      doc.end();
  
      stream.on("finish", () => {
        res.download(outputPath, "volunteer_participation.pdf", (err) => {
          if (err) {
            res.status(500).send("Could not download PDF.");
          } else {
            fs.unlinkSync(outputPath);
          }
        });
      });
  
    } catch (err) {
      res.status(500).send("PDF generation failed.");
    }
  });
  




// live reload for frontend/backend
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

app.use(connectLivereload());

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "../frontend"));

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});




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

app.get("/admin-report", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/admin_report/admin_report.html"));
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

