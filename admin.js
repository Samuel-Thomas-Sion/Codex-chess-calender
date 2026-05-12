console.log(firebase);
console.log(auth);

const provider = new firebase.auth.GoogleAuthProvider();

let currentUser = null;

auth.onAuthStateChanged(async function(user){

if(user){

if(user.email !== "samuel.thomas@gmail.com"){

document.body.innerHTML =
"<h1>ACCESS DENIED</h1>";

auth.signOut();

return;

}

currentUser = user;

renderEvents();

}
else{

try{

await auth.signInWithPopup(provider);

}
catch(error){

console.log(error);

}

}

});

}

window.deleteEvent = async function(id){

await db.collection("events")
.doc(id)
.delete();

renderEvents();

};
if(!currentUser){

alert("Not authenticated.");

return;

}
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
