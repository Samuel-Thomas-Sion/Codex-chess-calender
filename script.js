const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

let currentDate = new Date();

const events = {

"2026-5-12":[
{
title:"Codex Clash",
type:"Blitz 5|0",
priority:"high",
notes:"Main tournament operation."
}
],

"2026-5-18":[
{
title:"Daily Championship",
type:"Daily",
priority:"normal",
notes:"Long format tactical match."
}
],

"2026-5-25":[
{
title:"Critical Match",
type:"Bullet",
priority:"critical",
notes:"Elite operation event."
}
]

};

function renderCalendar(){

calendar.innerHTML = "";

const year = currentDate.getFullYear();
const month = currentDate.getMonth();

monthTitle.textContent = currentDate.toLocaleString(
"default",
{
month:"long",
year:"numeric"
}
);

const firstDay = new Date(year, month, 1);
const lastDay = new Date(year, month + 1, 0);

let startDay = firstDay.getDay();

if(startDay === 0){
startDay = 7;
}

for(let i = 1; i < startDay; i++){

const empty = document.createElement("div");

calendar.appendChild(empty);

}

for(let day = 1; day <= lastDay.getDate(); day++){

const dayBox = document.createElement("div");

dayBox.className = "day";

const dateKey = `${year}-${month+1}-${day}`;

dayBox.innerHTML =
`<div class="day-number">${day}</div>`;

if(events[dateKey]){

const dot = document.createElement("div");

dot.classList.add("event-dot");

dot.classList.add(events[dateKey][0].priority);

dayBox.appendChild(dot);

}

dayBox.addEventListener("click", function(){

openModal(dateKey);

});

calendar.appendChild(dayBox);

}

}

function openModal(dateKey){

if(!events[dateKey]){
return;
}

modalBody.innerHTML = `<h2>${dateKey}</h2>`;

events[dateKey].forEach(function(event){

modalBody.innerHTML += `

<div class="event-card">

<div class="event-title">
${event.title}
</div>

<div class="event-info">
Type: ${event.type}
</div>

<div class="event-info">
Priority: ${event.priority.toUpperCase()}
</div>

<div class="event-notes">
${event.notes}
</div>

</div>

`;

});

modal.classList.remove("hidden");

}

closeModal.addEventListener("click", function(){

modal.classList.add("hidden");

});

window.addEventListener("click", function(e){

if(e.target === modal){

modal.classList.add("hidden");

}

});

document.getElementById("prevMonth")
.addEventListener("click", function(){

currentDate.setMonth(currentDate.getMonth() - 1);

renderCalendar();

});

document.getElementById("nextMonth")
.addEventListener("click", function(){

currentDate.setMonth(currentDate.getMonth() + 1);

renderCalendar();

});

renderCalendar();
