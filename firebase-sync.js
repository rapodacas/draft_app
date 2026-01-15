const firebaseConfig = {
  apiKey: "AIzaSyAeKwKCQgAdaU2j1eh-z01-71nxUv6UKB4",
  authDomain: "egsl-draftboard.firebaseapp.com",
  projectId: "egsl-draftboard",
  storageBucket: "egsl-draftboard.firebasestorage.app",
  messagingSenderId: "94820544899",
  appId: "1:94820544899:web:7a6dc8a4452d56002086b6",
  measurementId: "G-WRLT69YGSE",
  databaseURL: "https://egsl-draftboard-default-rtdb.firebaseio.com"
};

// ---------------------------------------------------------
// firebase-sync.js
// Lightweight live-sync module for the EGSL Draft Board
// ---------------------------------------------------------

/* global firebase */

// --- Firebase Initialization ---
let firebaseApp = null;
let firebaseDb  = null;


let lastRemoteTimestamp = 0;

// ---------------------------------------------------------
// Safe Firebase Initialization
// ---------------------------------------------------------
function initFirebase(config, { host = false } = {}) {
  // Wait until Firebase compat scripts have loaded
  if (!window.firebase || !firebase.initializeApp) {
    setTimeout(() => initFirebase(config, { host }), 30);
    return;
  }

  isHost = host;
  isSpectatorMode = !host;

  firebaseApp = firebase.initializeApp(config);
  firebaseDb  = firebase.database();

  if (!isHost) {
    subscribeToRemoteUpdates();
  }
}

// ---------------------------------------------------------
// Utility: Deep-clean snapshot (convert undefined → null)
// ---------------------------------------------------------
function cleanSnapshot(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}

// ---------------------------------------------------------
// Host: Push snapshot to Firebase
// ---------------------------------------------------------
function syncWrite(snapshot) {
  if (!isHost) return;

  const cleaned = cleanSnapshot(snapshot);

  firebaseDb.ref("draftState").set({
    ...cleaned,
    timestamp: Date.now()
  });
}

// ---------------------------------------------------------
// Spectator: Subscribe to updates
// ---------------------------------------------------------
function subscribeToRemoteUpdates() {
  firebaseDb.ref("draftState").on("value", snap => {
    if (!snap.exists()) return;

    const data = snap.val();

    // Ignore if this update is older than what we already have
    if (data.timestamp <= lastRemoteTimestamp) return;
    lastRemoteTimestamp = data.timestamp;

    applyRemoteSnapshot(data);
  });
}

// ---------------------------------------------------------
// Apply remote snapshot to the local app
// (Your main app overrides this)
// ---------------------------------------------------------
function applyRemoteSnapshot(data) {
  // Overridden in main app
}

// ---------------------------------------------------------
// Utility: Enable or disable spectator mode manually
// ---------------------------------------------------------
function setSpectatorMode(enabled) {
  isSpectatorMode = enabled;
}

// ---------------------------------------------------------
// Export module API
// ---------------------------------------------------------
window.FirebaseSync = {
  initFirebase,
  syncWrite,
  setSpectatorMode
};
