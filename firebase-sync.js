const firebaseConfig = {
  apiKey: "AIzaSyAeKwKCQgAdaU2j1eh-z01-71nxUv6UKB4",
  authDomain: "egsl-draftboard.firebaseapp.com",
  projectId: "egsl-draftboard",
  storageBucket: "egsl-draftboard.firebasestorage.app",
  messagingSenderId: "94820544899",
  appId: "1:94820544899:web:7a6dc8a4452d56002086b6",
  measurementId: "G-WRLT69YGSE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// ---------------------------------------------------------
// firebase-sync.js
// Lightweight live-sync module for the EGSL Draft Board
// ---------------------------------------------------------

// --- Firebase Initialization ---
let firebaseApp = null;
let firebaseDb  = null;

let isHost = false;
let isSpectatorMode = false;

let lastRemoteTimestamp = 0;

// Initialize Firebase (call this once from your main app)
function initFirebase(config, { host = false } = {}) {
  isHost = host;
  isSpectatorMode = !host;

  firebaseApp = firebase.initializeApp(config);
  firebaseDb  = firebase.database();

  if (!isHost) {
    subscribeToRemoteUpdates();
  }
}

// ---------------------------------------------------------
// Host: Push snapshot to Firebase
// ---------------------------------------------------------
function syncWrite(snapshot) {
  if (!isHost) return;

  firebaseDb.ref("draftState").set({
    ...snapshot,
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

    // Apply snapshot to local app
    applyRemoteSnapshot(data);
  });
}

// ---------------------------------------------------------
// Apply remote snapshot to the local app
// (You define this in your main app)
// ---------------------------------------------------------
function applyRemoteSnapshot(data) {
  // Your main app will override this function.
  // Example implementation in your main script:
  //
  // board = data.board;
  // players = data.players;
  // draftOrder = data.draftOrder;
  // currentPickIndex = data.currentPickIndex;
  //
  // renderBoard();
  // renderSidebar();
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
