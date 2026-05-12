const saveBtn =
document.getElementById("saveBtn");

const eventList =
document.getElementById("eventList");

async function renderEvents(){

eventList.innerHTML = "";

const snapshot =
await db.collection("events").get();

snapshot.forEach((document)=>{

const event = document.data();

const card =
document.createElement("div");

card.style.marginBottom = "20px";
card.style.padding = "15px";
card.style.border = "1px solid orange";
card.style.borderRadius = "10px";
card.style.background = "#1b0d00";

card.innerHTML = `

<h3>${event.title}</h3>

<p>Date: ${event.date}</p>

<p>Type: ${event.type}</p>

<p>Priority: ${event.priority}</p>

<p>${event.notes}</p>

<button onclick="deleteEvent('${document.id}')">
DELETE
</button>

`;

eventList.appendChild(card);

});

}

window.deleteEvent = async function(id){

await db.collection("events")
.doc(id)
.delete();

renderEvents();

};

saveBtn.addEventListener("click", async function(){

const date =
document.getElementById("eventDate").value;

const title =
document.getElementById("eventTitle").value;

const type =
document.getElementById("eventType").value;

const priority =
document.getElementById("eventPriority").value;

const notes =
document.getElementById("eventNotes").value;

await db.collection("events").add({

date,
title,
type,
priority,
notes

});

alert("Event Saved");

renderEvents();

});

renderEvents();
