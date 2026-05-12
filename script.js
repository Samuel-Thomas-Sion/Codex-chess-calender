const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");

const closeModal =
document.getElementById("closeModal");

let currentDate = new Date();

let events = [];

async function loadEvents(){

events = [];

const snapshot =
await db.collection("events").get();

snapshot.forEach((doc)=>{

events.push(doc.data());

});

renderCalendar();

}

function renderCalendar(){

calendar.innerHTML = "";

const year = currentDate.getFullYear();
const month = currentDate.getMonth();

monthTitle.textContent =
currentDate.toLocaleString("default",{
month:"long",
year:"numeric"
});

const firstDay = new Date(year,month,1);

const lastDay =
new Date(year,month+1,0);

let startDay = firstDay.getDay();

if(startDay===0){
startDay=7;
}

for(let i=1;i<startDay;i++){

const empty =
document.createElement("div");

calendar.appendChild(empty);

}

for(let day=1;day<=lastDay.getDate();day++){

const dayBox =
document.createElement("div");

dayBox.className = "day";

const dateString =
`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

dayBox.innerHTML =
`<div class="day-number">${day}</div>`;

const dayEvents =
events.filter(event=>event.date===dateString);

if(dayEvents.length>0){

const dot =
document.createElement("div");

dot.classList.add("event-dot");

dot.classList.add(dayEvents[0].priority);

dayBox.appendChild(dot);

}

dayBox.addEventListener("click",()=>{

openModal(dateString);

});

calendar.appendChild(dayBox);

}

}

function openModal(dateString){

const dayEvents =
events.filter(event=>event.date===dateString);

if(dayEvents.length===0){
return;
}

modalBody.innerHTML =
`<h2>${dateString}</h2>`;

dayEvents.forEach(event=>{

modalBody.innerHTML += `

<div class="event-card">

<div class="event-title">
${event.title}
</div>

<div class="event-info">
Type: ${event.type}
</div>

<div class="event-info">
Priority: ${event.priority}
</div>

<div class="event-notes">
${event.notes}
</div>

</div>

`;

});

modal.classList.remove("hidden");

}

closeModal.onclick=()=>{

modal.classList.add("hidden");

};

document.getElementById("prevMonth")
.onclick=()=>{

currentDate.setMonth(
currentDate.getMonth()-1
);

renderCalendar();

};

document.getElementById("nextMonth")
.onclick=()=>{

currentDate.setMonth(
currentDate.getMonth()+1
);

renderCalendar();

};

loadEvents();
