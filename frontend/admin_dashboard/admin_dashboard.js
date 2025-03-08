function redirectTo(page) {
    window.location.href = page;
}

// Display Current Time
function updateTime() {
    let now = new Date();
    let formattedTime = now.toLocaleString();
    document.getElementById("current-time").innerText = formattedTime;
}
setInterval(updateTime, 1000);
updateTime();

// Event Attendance Chart
const eventCtx = document.getElementById('eventChart').getContext('2d');
new Chart(eventCtx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [{
            label: 'Event Attendance',
            data: [10, 25, 30, 45, 60, 55, 75, 90],
            backgroundColor: 'rgba(255, 107, 0, 0.2)',
            borderColor: 'rgba(255, 107, 0, 1)',
            borderWidth: 2
        }]
    }
});

// Volunteer Activity Chart
const volunteerCtx = document.getElementById('volunteerChart').getContext('2d');
new Chart(volunteerCtx, {
    type: 'doughnut',
    data: {
        labels: ['Checked In', 'No Show', 'Dismissed'],
        datasets: [{
            data: [75, 10, 15],
            backgroundColor: ['#2ecc71', '#e74c3c', '#f1c40f']
        }]
    }
});

function openManageEvents() {
    document.getElementById("eventPopup").style.display = "block";
    loadAdminEvents(); 
}

function closePopup() {
    document.getElementById("eventPopup").style.display = "none";
}

// Fetch and display events inside the popup
async function loadAdminEvents() {
    try {
        const response = await fetch("http://localhost:3000/api/admin/events");
        const events = await response.json();

        const eventList = document.getElementById("eventList");
        eventList.innerHTML = ""; 

        events.forEach(event => {
            const eventItem = document.createElement("li");
            eventItem.innerHTML = `
                <strong>${event.name}</strong> - ${event.location} - ${event.date}
                <button onclick="deleteEvent(${event.id})">❌ Delete</button>
            `;
            eventList.appendChild(eventItem);
        });
    } catch (error) {
        console.error("Error loading events:", error);
    }
}

// Delete event function
async function deleteEvent(eventId) {
    try {
        await fetch(`http://localhost:3000/api/admin/events/${eventId}`, { method: "DELETE" });
        loadAdminEvents(); 
    } catch (error) {
        console.error("Error deleting event:", error);
    }
}
