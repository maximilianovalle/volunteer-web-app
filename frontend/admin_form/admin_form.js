
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
        name: document.getElementById("eventName").value,
        location: document.getElementById("eventLocation").value,
        date: document.getElementById("eventDate").value,
        skills_required: document.getElementById("selected-values").textContent.split(", "),
    };

    try {
        // Send POST request to backend
        const response = await fetch("http://localhost:3000/api/admin/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Event created successfully!");
            document.getElementById("adminEventForm").reset();

            // Reset skills selection
            document.getElementById("selected-values").textContent = "Select skills";
            const checkboxes = document.querySelectorAll(".dropdown-content input[type='checkbox']");
            checkboxes.forEach(checkbox => checkbox.checked = false);
            
            if (typeof loadAdminEvents === "function") {
                loadAdminEvents();
            }
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
            body: JSON.stringify({ volunteerName }) // Use the volunteer's name
        });

        const data = await response.json();

        if (!data.matchedEvent || data.matchedEvent === "No matching event found") {
            alert("No events found matching this volunteer's skills.");
            document.getElementById("matched-event").value = "No match found";
            return;
        }

        // ✅ Auto-fill the "Matched Event" field with the matched event name
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
            option.value = volunteer.name;
            option.textContent = volunteer.name;
            volunteerDropdown.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading volunteers:", error);
    }
}

// Load volunteers when the page loads
document.addEventListener("DOMContentLoaded", loadVolunteers);
