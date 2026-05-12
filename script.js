const calendar = document.getElementById("calendar");

for(let i=1;i<=31;i++){

    const day=document.createElement("div");

    day.className="day";

    day.innerHTML=i;

    calendar.appendChild(day);

}
