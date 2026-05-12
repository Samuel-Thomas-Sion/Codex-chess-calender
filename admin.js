console.log(firebase);

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

let currentUser = null;

// 🔐 AUTH CONTROL
auth.onAuthStateChanged(async (user) => {
  if (user) {

    if (user.email !== "samuel.thomas@gmail.com") {
      document.body.innerHTML = "<h1>ACCESS DENIED</h1>";
      await auth.signOut();
      return;
    }

    currentUser = user;
    console.log("Logged in:", user.email);

    renderEvents();

  } else {
    console.log("Not logged in");
  }
});

// 🔑 LOGIN BUTTON (MUST BE MANUAL, NOT AUTO)
document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    await auth.signInWithPopup(provider);
  } catch (err) {
    console.warn("Popup failed, using redirect:", err);
    auth.signInWithRedirect(provider);
  }
});
auth.getRedirectResult().then((result) => {
  if (result.user) {
    console.log("Redirect login success:", result.user.email);
  }
});

// 💾 SAVE EVENT
document.getElementById("saveBtn").addEventListener("click", async () => {
  if (!currentUser) {
    alert("Not authenticated");
    return;
  }

  const date = document.getElementById("eventDate").value;
  const title = document.getElementById("eventTitle").value;
  const type = document.getElementById("eventType").value;
  const priority = document.getElementById("eventPriority").value;
  const notes = document.getElementById("eventNotes").value;

  await db.collection("events").add({
    date,
    title,
    type,
    priority,
    notes,
    createdBy: currentUser.email,
    createdAt: new Date()
  });

  alert("Event Saved");
  renderEvents();
});

// 🗑 DELETE EVENT
window.deleteEvent = async function(id) {
  await db.collection("events").doc(id).delete();
  renderEvents();
};

// 📋 RENDER EVENTS (MINIMAL VERSION)
async function renderEvents() {
  const container = document.getElementById("eventList");
  container.innerHTML = "";

  const snapshot = await db.collection("events").get();

  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.innerHTML = `
      <p><b>${data.title}</b> (${data.date})</p>
      <button onclick="deleteEvent('${doc.id}')">Delete</button>
      <hr>
    `;

    container.appendChild(div);
  });
}
