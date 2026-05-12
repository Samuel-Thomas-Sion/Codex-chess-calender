// =====================
// Firebase references
// =====================
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

let currentUser = null;

// =====================
// DOM elements
// =====================
const loginBtn = document.getElementById("loginBtn");
const saveBtn = document.getElementById("saveBtn");
const eventList = document.getElementById("eventList");

// disable save until login
saveBtn.disabled = true;

// =====================
// AUTH STATE LISTENER
// =====================
auth.onAuthStateChanged(async (user) => {
  console.log("Auth state changed:", user);

  if (user) {
    // ADMIN LOCK (your email only)
    if (user.email !== "samuel.thomas@gmail.com") {
      alert("ACCESS DENIED");

      document.body.innerHTML = "<h1>ACCESS DENIED</h1>";

      await auth.signOut();
      currentUser = null;

      return;
    }

    currentUser = user;
    saveBtn.disabled = false;

    console.log("Logged in as admin:", user.email);

    renderEvents();

  } else {
    currentUser = null;
    saveBtn.disabled = true;

    console.log("Not logged in");
  }
});

// =====================
// LOGIN (FIXED POPUP FLOW)
// =====================
loginBtn.addEventListener("click", async () => {
  try {
    console.log("Starting login...");

    const result = await auth.signInWithPopup(provider);

    console.log("Login success:", result.user.email);

  } catch (err) {
    console.error("Popup login failed:", err);

    alert("Login failed. Check console.");
  }
});

// =====================
// SAVE EVENT
// =====================
document.getElementById("saveBtn").addEventListener("click", async () => {
  try {
    console.log("SAVE CLICKED");

    const user = firebase.auth().currentUser;

    if (!user) {
      alert("Not logged in");
      console.log("No auth user");
      return;
    }

    const data = {
      date: document.getElementById("eventDate").value,
      title: document.getElementById("eventTitle").value,
      type: document.getElementById("eventType").value,
      priority: document.getElementById("eventPriority").value,
      notes: document.getElementById("eventNotes").value,
      createdBy: user.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    console.log("Writing to Firestore:", data);

    await firebase.firestore().collection("events").add(data);

    alert("Saved successfully!");

    console.log("SAVE SUCCESS");

  } catch (err) {
    console.error("SAVE FAILED:", err);
    alert("Save failed — check console");
  }
});

// =====================
// DELETE EVENT
// =====================
window.deleteEvent = async function (id) {
  if (!currentUser) return;

  try {
    await db.collection("events").doc(id).delete();
    renderEvents();
  } catch (err) {
    console.error("Delete failed:", err);
  }
};

// =====================
// RENDER EVENTS
// =====================
async function renderEvents() {
  eventList.innerHTML = "<p>Loading...</p>";

  try {
    const snapshot = await db.collection("events")
      .orderBy("createdAt", "desc")
      .get();

    eventList.innerHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();

      const div = document.createElement("div");
      div.style.border = "1px solid orange";
      div.style.margin = "10px";
      div.style.padding = "10px";

      div.innerHTML = `
        <h3>${data.title}</h3>
        <p>Date: ${data.date}</p>
        <p>Type: ${data.type}</p>
        <p>Priority: ${data.priority}</p>
        <button onclick="deleteEvent('${doc.id}')">Delete</button>
      `;

      eventList.appendChild(div);
    });

  } catch (err) {
    console.error("Render failed:", err);
    eventList.innerHTML = "<p>Error loading events</p>";
  }
}
