const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", () => {

  const date = document.getElementById("eventDate").value;
  const title = document.getElementById("eventTitle").value;
  const type = document.getElementById("eventType").value;
  const priority = document.getElementById("eventPriority").value;
  const notes = document.getElementById("eventNotes").value;

  if (!date || !title) {
    alert("Missing fields.");
    return;
  }

  let events = JSON.parse(localStorage.getItem("events")) || {};

  if (!events[date]) {
    events[date] = [];
  }

  events[date].push({
    title,
    type,
    priority,
    notes
  });

  localStorage.setItem("events", JSON.stringify(events));

  alert("Event Saved.");

});
