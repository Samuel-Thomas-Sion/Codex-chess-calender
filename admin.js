const saveBtn = document.getElementById("saveBtn");

const eventList = document.getElementById("eventList");

function getEvents(){

return JSON.parse(
localStorage.getItem("events")
) || {};

}

function saveEvents(events){

localStorage.setItem(
"events",
JSON.stringify(events)
);

}

function renderEvents(){

const events = getEvents();

eventList.innerHTML = "";

for(const date in events){

events[date].forEach((event,index)=>{

const card = document.createElement("div");

card.style.marginBottom = "20px";
card.style.padding = "15px";
card.style.border = "1px solid orange";
card.style.borderRadius = "10px";
card.style.background = "#1b0d00";

card.innerHTML = `

<h3>${event.title}</h3>

<p><strong>Date:</strong> ${date}</p>

<p><strong>Type:</strong> ${event.type}</p>

<p><strong>Priority:</strong> ${event.priority}</p>

<p>${event.notes}</p>

<button onclick="deleteEvent('${date}',${index})">
DELETE
</button>

`;

eventList.appendChild(card);

});

}

}

function deleteEvent(date,index){

const events = getEvents();

events[date].splice(index,1);

if(events[date].length===0){

delete events[date];

}

saveEvents(events);

renderEvents();

}

saveBtn.addEventListener("click",function(){

const rawDate =
document.getElementById("eventDate").value;

const title =
document.getElementById("eventTitle").value;

const type =
document.getElementById("eventType").value;

const priority =
document.getElementById("eventPriority").value;

const notes =
document.getElementById("eventNotes").value;

if(!rawDate || !title){

alert("Missing fields.");

return;

}

const splitDate = rawDate.split("-");

const formattedDate =
`${splitDate[0]}-${parseInt(splitDate[1])}-${parseInt(splitDate[2])}`;

const events = getEvents();

if(!events[formattedDate]){

events[formattedDate] = [];

}

events[formattedDate].push({

title,
type,
priority,
notes

});

saveEvents(events);

renderEvents();

alert("Event Saved.");

});

renderEvents();
