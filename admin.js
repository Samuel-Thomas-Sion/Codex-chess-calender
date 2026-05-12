// =====================
// Firebase references
// =====================
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// =====================
// DOM elements (cached after DOMContentLoaded)
// =====================
let loginBtn = null;
let saveBtn = null;
let eventList = null;

// =====================
// Initialize DOM elements
// =====================
function initializeDOMElements() {
  loginBtn = document.getElementById("loginBtn");
  saveBtn = document.getElementById("saveBtn");
  eventList = document.getElementById("eventList");

  if (!loginBtn || !saveBtn || !eventList) {
    console.error("Critical DOM elements missing:", {
      loginBtn: !!loginBtn,
      saveBtn: !!saveBtn,
      eventList: !!eventList
    });
    return false;
  }

  // disable save until login
  saveBtn.disabled = true;

  // Attach event listeners
  attachEventListeners();

  return true;
}

// =====================
// Attach event listeners
// =====================
function attachEventListeners() {
  if (!loginBtn || !saveBtn) {
    console.error("Cannot attach listeners: DOM elements not initialized");
    return;
  }

  // LOGIN BUTTON
  loginBtn.addEventListener("click", handleLogin);

  // SAVE EVENT BUTTON
  saveBtn.addEventListener("click", handleSaveEvent);

  console.log("Event listeners attached successfully");
}

// =====================
// AUTH STATE LISTENER
// =====================
auth.onAuthStateChanged(async (user) => {
  console.log("Auth state changed:", user?.email || "No user");

  if (user) {
    // ADMIN LOCK (your email only)
    if (user.email !== "samuel.thomas@gmail.com") {
      console.warn("Unauthorized access attempt:", user.email);
      alert("ACCESS DENIED");
      document.body.innerHTML = "<h1>ACCESS DENIED</h1>";

      try {
        await auth.signOut();
      } catch (err) {
        console.error("Failed to sign out unauthorized user:", err);
      }
      return;
    }

    console.log("✓ Authenticated as admin:", user.email);

    // Enable save button only when authenticated
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Event";
    }

    // Load events
    await renderEvents();

  } else {
    console.log("User logged out or not authenticated");

    // Disable save button
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Save Event (Login required)";
    }

    // Clear event list
    if (eventList) {
      eventList.innerHTML = "";
    }
  }
});

// =====================
// LOGIN HANDLER
// =====================
async function handleLogin() {
  if (!loginBtn) {
    console.error("Login button not found");
    return;
  }

  try {
    console.log("Starting Google Sign-In...");
    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in...";

    const result = await auth.signInWithPopup(provider);

    console.log("✓ Login success:", result.user.email);
    loginBtn.textContent = "Logged In";

  } catch (err) {
    console.error("❌ Login failed:", err.code, err.message);

    if (err.code === "auth/popup-blocked") {
      alert("Popup was blocked. Please allow popups for this site.");
    } else if (err.code === "auth/cancelled-popup-request") {
      console.log("User cancelled login");
    } else {
      alert(`Login failed: ${err.message}`);
    }

  } finally {
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login with Google";
    }
  }
}

// =====================
// SAVE EVENT HANDLER
// =====================
async function handleSaveEvent() {
  try {
    // Verify authentication using single source of truth
    const user = auth.currentUser;

    if (!user) {
      alert("Not logged in. Please log in first.");
      console.warn("Save attempted without authentication");
      return;
    }

    if (user.email !== "samuel.thomas@gmail.com") {
      alert("Unauthorized: Admin access required");
      console.warn("Unauthorized save attempt by:", user.email);
      return;
    }

    // Validate form fields
    const eventDate = document.getElementById("eventDate")?.value;
    const eventTitle = document.getElementById("eventTitle")?.value;
    const eventType = document.getElementById("eventType")?.value;
    const eventPriority = document.getElementById("eventPriority")?.value;
    const eventNotes = document.getElementById("eventNotes")?.value;

    if (!eventDate || !eventTitle) {
      alert("Please fill in Date and Title");
      return;
    }

    // Disable button during save
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
    }

    const data = {
      date: eventDate,
      title: eventTitle,
      type: eventType || "",
      priority: eventPriority || "",
      notes: eventNotes || "",
      createdBy: user.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    console.log("Writing to Firestore:", data);

    const docRef = await db.collection("events").add(data);

    console.log("✓ Event saved successfully:", docRef.id);

    alert("Event saved successfully!");

    // Clear form
    document.getElementById("eventDate").value = "";
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventType").value = "";
    document.getElementById("eventPriority").value = "";
    document.getElementById("eventNotes").value = "";

    // Refresh event list
    await renderEvents();

  } catch (err) {
    console.error("❌ Save failed:", err.code || err.message, err);

    if (err.code === "permission-denied") {
      alert("Permission denied. Contact administrator.");
    } else if (err.code === "unauthenticated") {
      alert("Session expired. Please log in again.");
    } else {
      alert(`Save failed: ${err.message}`);
    }

  } finally {
    if (saveBtn) {
      saveBtn.disabled = !auth.currentUser;
      saveBtn.textContent = "Save Event";
    }
  }
}

// =====================
// DELETE EVENT
// =====================
window.deleteEvent = async function (id) {
  try {
    const user = auth.currentUser;

    if (!user) {
      alert("Not logged in");
      return;
    }

    if (user.email !== "samuel.thomas@gmail.com") {
      alert("Unauthorized");
      return;
    }

    if (!confirm("Delete this event?")) {
      return;
    }

    console.log("Deleting event:", id);

    await db.collection("events").doc(id).delete();

    console.log("✓ Event deleted successfully");

    await renderEvents();

  } catch (err) {
    console.error("❌ Delete failed:", err.code || err.message, err);
    alert(`Delete failed: ${err.message}`);
  }
};

// =====================
// RENDER EVENTS
// =====================
async function renderEvents() {
  if (!eventList) {
    console.error("Event list element not found");
    return;
  }

  eventList.innerHTML = "<p>Loading events...</p>";

  try {
    const user = auth.currentUser;

    if (!user) {
      eventList.innerHTML = "<p>Please log in to view events</p>";
      return;
    }

    const snapshot = await db.collection("events")
      .orderBy("createdAt", "desc")
      .get();

    eventList.innerHTML = "";

    if (snapshot.empty) {
      eventList.innerHTML = "<p>No events yet. Create one!</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Create div safely without innerHTML injection risk
      const div = document.createElement("div");
      div.style.border = "1px solid orange";
      div.style.margin = "10px";
      div.style.padding = "10px";

      // Create elements instead of using innerHTML for security
      const title = document.createElement("h3");
      title.textContent = data.title || "Untitled";

      const dateP = document.createElement("p");
      dateP.textContent = `Date: ${data.date || "N/A"}`;

      const typeP = document.createElement("p");
      typeP.textContent = `Type: ${data.type || "N/A"}`;

      const priorityP = document.createElement("p");
      priorityP.textContent = `Priority: ${data.priority || "N/A"}`;

      const notesP = document.createElement("p");
      notesP.textContent = `Notes: ${data.notes || "None"}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.marginTop = "10px";
      deleteBtn.style.backgroundColor = "#ff4444";
      deleteBtn.style.color = "white";
      deleteBtn.style.padding = "5px 10px";
      deleteBtn.style.border = "none";
      deleteBtn.style.borderRadius = "3px";
      deleteBtn.style.cursor = "pointer";

      deleteBtn.addEventListener("click", () => {
        window.deleteEvent(doc.id);
      });

      // Append all elements
      div.appendChild(title);
      div.appendChild(dateP);
      div.appendChild(typeP);
      div.appendChild(priorityP);
      div.appendChild(notesP);
      div.appendChild(deleteBtn);

      eventList.appendChild(div);
    });

    console.log(`✓ Rendered ${snapshot.size} events`);

  } catch (err) {
    console.error("❌ Render failed:", err.code || err.message, err);
    eventList.innerHTML = `<p style="color: red;">Error loading events: ${err.message}</p>`;
  }
}

// =====================
// Initialize when DOM is ready
// =====================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing...");
    initializeDOMElements();
  });
} else {
  // DOM already loaded
  console.log("DOM already loaded, initializing...");
  initializeDOMElements();
}
