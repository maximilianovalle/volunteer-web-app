
function toggleDropdown() {
    document.getElementById("dropdown-content").classList.toggle("show");
}

function updateSelection() {
    const checkboxes = document.querySelectorAll(".dropdown-content input[type='checkbox']");
    let selectedValues = [];
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            selectedValues.push(checkbox.value);
        }
    });

    const displayText = selectedValues.length > 0 ? selectedValues.join(", ") : "Select skills";
    document.getElementById("selected-values").textContent = displayText;
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
    const dropdown = document.querySelector(".custom-dropdown");
    if (!dropdown.contains(event.target)) {
        document.getElementById("dropdown-content").classList.remove("show");
    }
});

document.getElementById("adminEventForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const eventData = {
        Managed_By: 1, // or dynamically get admin ID if logged in
        // Managed_By: localStorage.getItem("adminID"),
        name: document.getElementById("eventName").value,
        description: document.getElementById("eventDescription").value,
        location_state: document.getElementById("eventLocation").value,
        required_skills: document.getElementById("selected-values").textContent.split(",").map(skill => skill.trim()),
        urgency: document.getElementById("urgency").value, 
        event_date: document.getElementById("eventDate").value,
        type: document.getElementById("eventType").value
    };
    
    console.log("🚨 Urgency being sent:", `"${eventData.urgency}"`);

    try {
        const response = await fetch("http://localhost:3000/api/admin/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();
        console.log("📩 Server Response:", result);

        if (response.ok) {
            alert("Event created successfully!");
            document.getElementById("adminEventForm").reset();
            document.getElementById("selected-values").textContent = "Select skills";
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error creating event:", error);
    }
});


async function matchVolunteersForEvent() {
    try {
        // Get the volunteer name from the input field
        const volunteerName = document.getElementById("volunteer-name").value.trim();

        if (!volunteerName) {
            alert("Please enter a volunteer name.");
            return;
        }

        // Send request to backend to match this volunteer to an event
        const response = await fetch("http://localhost:3000/api/admin/match-volunteer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ volunteerName })
        });

        const data = await response.json();

        if (!data.matchedEvent || data.matchedEvent === "No matching event found") {
            alert("No events found matching this volunteer's skills.");
            document.getElementById("matched-event").value = "No match found";
            return;
        }

        document.getElementById("matched-event").value = data.matchedEvent;

    } catch (error) {
        console.error("Error matching volunteer:", error);
    }
}

async function loadVolunteers() {
    try {
        const response = await fetch("http://localhost:3000/api/admin/volunteers");
        const data = await response.json();

        const volunteerDropdown = document.getElementById("volunteer-name");
        volunteerDropdown.innerHTML = "<option value=''>Select Volunteer</option>";

        data.volunteers.forEach(volunteer => {
            const option = document.createElement("option");
            option.value = volunteer.Full_Name;
            option.textContent = volunteer.Full_Name;          
            volunteerDropdown.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading volunteers:", error);
    }
}

// Load volunteers when the page loads
document.addEventListener("DOMContentLoaded", loadVolunteers);
