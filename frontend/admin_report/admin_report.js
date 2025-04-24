// Format each event assignment (left table)
function formatEventRow(event) {
  return `
    <tr>
      <td>${event.name}</td>
      <td>${event.event}</td>
      <td>${event.status}</td>
      <td>${event.date}</td>
    </tr>`;
}

// Format each volunteer participation (right table)
function formatVolunteerRow(volunteer) {
  return `
    <tr>
      <td>${volunteer.name}</td>
      <td>${volunteer.event}</td>
      <td>${volunteer.date}</td>
    </tr>`;
}

// Populate a table body with data
function populateTable(tableId, data, rowFormatter) {
  const tableBody = document.querySelector(`#${tableId} tbody`);
  if (tableBody) {
    tableBody.innerHTML = data.map(rowFormatter).join('');
  } else {
    console.error(`❌ Table body not found for #${tableId}`);
  }
}

// Toggle section views
function setupViewToggle() {
  const eventBtn = document.getElementById("showAssignmentsBtn");
  const volunteerBtn = document.getElementById("showParticipationBtn");
  const eventSection = document.getElementById("assignmentsSection");
  const volunteerSection = document.getElementById("participationSection");

  eventBtn?.addEventListener("click", () => {
    eventSection.style.display = "block";
    volunteerSection.style.display = "none";
  });

  volunteerBtn?.addEventListener("click", () => {
    eventSection.style.display = "none";
    volunteerSection.style.display = "block";
  });
}

// Fetch data and populate tables
async function fetchAndDisplayData() {
  try {
    const [eventsRes, volunteersRes] = await Promise.all([
      fetch("/api/admin/volunteer-assignments"),
      fetch("/api/admin/participation-history")
    ]);

    if (!eventsRes.ok || !volunteersRes.ok) {
      throw new Error("Failed to fetch one or more data sources");
    }

    const events = await eventsRes.json();
    const volunteers = await volunteersRes.json();

    populateTable("eventTable", events, formatEventRow);
    populateTable("volunteerTable", volunteers, formatVolunteerRow);
  } catch (error) {
    console.error("❌ Error loading admin report data:", error);
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayData();
  setupViewToggle();
});
