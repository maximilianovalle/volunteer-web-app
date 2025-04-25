let allEventData = [];
let allParticipationData = [];

// Helper to format date to MM/DD/YYYY
function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US");
}

// Helper to normalize date to yyyy-mm-dd for comparison
function normalizeDateOnly(date) {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Soft delete event
function deleteEvent(eventId, buttonElement) {
  if (confirm("Are you sure you want to hide this event?")) {
    fetch(`/api/admin/events/${eventId}/soft-delete`, {
      method: 'PATCH'
    })    
      .then(res => {
        if (res.ok) {
          buttonElement.closest("tr").remove();
        } else {
          alert("Failed to hide the event.");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Something went wrong.");
      });
  }
}

// Format each event assignment row
function formatEventRow(event) {
  return `
    <tr>
      <td>${event.Event_Name}</td>
      <td>${formatDate(event.Event_Date)}</td>
      <td>${event.Location_City || 'N/A'}, ${event.Location_State_Code}</td>
      <td>${event.Type}</td>
      <td>${event.Required_Skills}</td>
      <td>${event.Urgency}</td>
      <td>${event.Volunteer_Names || '—'}</td>
      <td><button class="delete-btn" onclick="deleteEvent('${event.EventID}', this)">Delete</button></td>
    </tr>`;
}

// Format each volunteer participation row
function formatVolunteerRow(volunteer) {
  return `
    <tr>
      <td>${volunteer.name}</td>
      <td>${volunteer.email}</td>
      <td>${volunteer.city || 'N/A'}, ${volunteer.state || ''}</td>
      <td>${volunteer.event}</td>
      <td>${formatDate(volunteer.date)}</td>
    </tr>`;
}

// Populate a table body with the formatted data
function populateTable(tableId, data, rowFormatter) {
  const tableBody = document.querySelector(`#${tableId} tbody`);
  if (tableBody) {
    tableBody.innerHTML = data.length > 0
      ? data.map(rowFormatter).join('')
      : `<tr><td colspan="8">No data available</td></tr>`;
  } else {
    console.error(`❌ Table body not found for #${tableId}`);
  }
}

// Populate location dropdown dynamically from data
function populateLocationDropdown(data) {
  const dropdown = document.getElementById("participationLocationFilter");
  if (!dropdown) return;

  const locations = Array.from(new Set(
    data.map(v => `${v.city || "N/A"}, ${v.state || ""}`).filter(loc => loc.trim() !== ",")
  )).sort();

  dropdown.innerHTML = `<option value="">All</option>`;
  locations.forEach(loc => {
    dropdown.innerHTML += `<option value="${loc}">${loc}</option>`;
  });
}

// Toggle visibility between sections
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

// Filter Event Assignments
function filterEvents() {
  const typeFilter = document.getElementById("typeFilter").value;
  const urgencyFilter = document.getElementById("urgencyFilter").value;
  const searchInput = document.getElementById("searchInput").value.toLowerCase();
  const dateInput = document.getElementById("dateFilter")?.value;
  const filterDate = normalizeDateOnly(dateInput);

  const filtered = allEventData.filter(event => {
    const eventDate = normalizeDateOnly(event.Event_Date);
    const typeMatch = typeFilter === "All" || event.Type === typeFilter;
    const urgencyMatch = urgencyFilter === "All" || event.Urgency === urgencyFilter;
    const nameMatch = !searchInput || event.Event_Name.toLowerCase().includes(searchInput);
    const dateMatch = !filterDate || (eventDate && eventDate >= filterDate);

    return typeMatch && urgencyMatch && nameMatch && dateMatch;
  });

  populateTable("eventTable", filtered, formatEventRow);
}

// Filter Volunteer Participation
function filterParticipation() {
  const searchInput = document.getElementById("participationSearchInput").value.toLowerCase();
  const locationFilter = document.getElementById("participationLocationFilter").value;
  const dateInput = document.getElementById("participationDateFilter")?.value;
  const filterDate = normalizeDateOnly(dateInput);

  const filtered = allParticipationData.filter(v => {
    const participationDate = normalizeDateOnly(v.date);
    const nameMatch = v.name.toLowerCase().includes(searchInput);
    const eventMatch = v.event.toLowerCase().includes(searchInput);
    const location = `${v.city}, ${v.state}`;
    const locationMatch = !locationFilter || location === locationFilter;
    const dateMatch = !filterDate || (participationDate && participationDate >= filterDate);

    return (nameMatch || eventMatch) && locationMatch && dateMatch;
  });

  populateTable("volunteerTable", filtered, formatVolunteerRow);
}

// Trigger file download
function downloadFile(url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Fetch and render data
async function fetchAndDisplayData() {
  try {
    const [eventsRes, volunteersRes] = await Promise.all([
      fetch("/api/admin/event-assignments"),
      fetch("/api/admin/participation-history")
    ]);

    if (!eventsRes.ok || !volunteersRes.ok) {
      throw new Error("Failed to fetch one or more data sources");
    }

    const events = await eventsRes.json();
    const volunteers = await volunteersRes.json();

    allEventData = events;
    allParticipationData = volunteers;

    populateTable("eventTable", events, formatEventRow);
    populateTable("volunteerTable", volunteers, formatVolunteerRow);
    populateLocationDropdown(volunteers);
  } catch (error) {
    console.error("❌ Error loading admin report data:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayData();
  setupViewToggle();

  document.getElementById("generateReportBtn")?.addEventListener("click", filterEvents);
  document.getElementById("participationFilterBtn")?.addEventListener("click", filterParticipation);

  document.getElementById("downloadCsvBtn")?.addEventListener("click", () => downloadFile("/api/admin/export-assignments/csv"));
  document.getElementById("downloadPdfBtn")?.addEventListener("click", () => downloadFile("/generate-event-pdf"));

  document.getElementById("participationDownloadCsvBtn")?.addEventListener("click", () =>
    downloadFile("/api/admin/export/participation-history/csv")
  );
  document.getElementById("participationDownloadPdfBtn")?.addEventListener("click", () =>
    downloadFile("/generate-participation-pdf")
  );
});