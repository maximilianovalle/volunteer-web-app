// Toggle custom skills dropdown
function toggleDropdown() {
    document.getElementById("dropdown-content").classList.toggle("show");
}

// Show either Create Event or Manage Events view
function showView(view) {
    const createView = document.getElementById("createEvent");
    const manageView = document.getElementById("manageEvent");
    const createBtn = document.getElementById("createEventBtn");
    const manageBtn = document.getElementById("manageEventBtn");

    if (view === "createEvent") {
        createView.classList.remove("hidden");
        manageView.classList.add("hidden");
        createBtn.classList.add("active");
        manageBtn.classList.remove("active");
    } else {
        createView.classList.add("hidden");
        manageView.classList.remove("hidden");
        createBtn.classList.remove("active");
        manageBtn.classList.add("active");
    }
}

// Update selected skills label text
function updateSelection() {
    const checkboxes = document.querySelectorAll(".dropdown-content input[type='checkbox']");
    const selectedValues = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    document.getElementById("selected-values").textContent = selectedValues.length > 0
        ? selectedValues.join(", ")
        : "Select skills";
}

// Close custom dropdown when clicking outside
document.addEventListener("click", function (event) {
    const dropdown = document.querySelector(".custom-dropdown");
    if (!dropdown.contains(event.target)) {
        document.getElementById("dropdown-content").classList.remove("show");
    }
});

// Handle Create Event submission
document.getElementById("adminEventForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const eventData = {
        Managed_By: 1,
        name: document.getElementById("eventName").value,
        description: document.getElementById("eventDescription").value,
        Location_City: document.getElementById("eventCity").value,
        Location_State_Code: document.getElementById("eventState").value,
        required_skills: document.getElementById("selected-values").textContent.split(",").map(skill => skill.trim()),
        urgency: document.getElementById("urgency").value,
        event_date: document.getElementById("eventDate").value,
        type: document.getElementById("eventType").value
    };

    try {
        const response = await fetch("http://localhost:3000/api/admin/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();
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

// Populate volunteers dropdown on page load
async function loadVolunteers() {
    try {
        const response = await fetch("http://localhost:3000/api/admin/volunteers");
        const data = await response.json();

        const dropdown = document.getElementById("volunteer-name");
        dropdown.innerHTML = "<option value=''>Select Volunteer</option>";

        data.volunteers.forEach(volunteer => {
            const option = document.createElement("option");
            option.value = volunteer.Full_Name;
            option.textContent = volunteer.Full_Name;
            dropdown.appendChild(option);
        });

        // Attach change event to load matched events
        dropdown.addEventListener("change", loadMatchedEventsForVolunteer);

    } catch (error) {
        console.error("Error loading volunteers:", error);
    }
}

// Fetch matched events based on volunteer skills
async function loadMatchedEventsForVolunteer() {
    const volunteerName = document.getElementById("volunteer-name").value.trim();

    if (!volunteerName) return;

    try {
        const response = await fetch("http://localhost:3000/api/admin/match-volunteer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ volunteerName })
        });

        const data = await response.json();
        const matchedDropdown = document.getElementById("matched-event");
        matchedDropdown.innerHTML = "<option value=''>Select Matched Event</option>";

        if (!data.matchedEvents || data.matchedEvents.length === 0) {
            alert("No events found matching this volunteer's skills.");
            return;
        }

        data.matchedEvents.forEach(event => {
            const option = document.createElement("option");
            option.value = event.id;
            option.textContent = event.name;
            matchedDropdown.appendChild(option);
        });

    } catch (error) {
        console.error("Error fetching matched events:", error);
    }
}

// Assign volunteer to the selected event
async function assignVolunteerToEvent() {
    const volunteerName = document.getElementById("volunteer-name").value.trim();
    const eventId = document.getElementById("matched-event").value;

    if (!volunteerName || !eventId) {
        alert("Please select both a volunteer and a matched event.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/admin/assign-volunteer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ volunteerName, eventId })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Volunteer successfully assigned to the event.");
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error assigning volunteer:", error);
    }
}

// On page load
document.addEventListener("DOMContentLoaded", () => {
    loadVolunteers();
    showView("createEvent");
});
