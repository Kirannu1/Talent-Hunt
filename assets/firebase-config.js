// ============================================================================
// MindMesh — Firebase project config
// ============================================================================
// This is the ONLY file you need to edit to turn on real, shared,
// cross-device storage (so your profile survives closing the site, and
// other students' profiles show up too).
//
// Setup (about 5 minutes, free, no credit card required):
//   1. Go to https://console.firebase.google.com and click "Add project".
//      Give it any name (e.g. "mindmesh"), you can skip Google Analytics.
//   2. Once the project opens, click the "</>" (Web) icon to register a web app.
//      Give it any nickname and click "Register app" — you do NOT need hosting.
//   3. Firebase will show you a `firebaseConfig` object. Copy those values
//      into the object below, replacing every "PASTE_..." placeholder.
//   4. In the left sidebar: Build → Firestore Database → Create database.
//      Choose "Start in test mode" (fine for a class project/prototype —
//      it means anyone with the link can read/write, so don't put real
//      sensitive data in it; tighten the rules before using this for real).
//   5. Save this file. Reload index.html / profile.html / dashboard.html.
//      That's it — no build step, no npm install.
//
// Until you fill this in, the site keeps working using only local storage
// on your own device (your profile persists for you, but nobody else will
// see it and you won't see anyone else's).
// ============================================================================

export const firebaseConfig = {
  apiKey: "AIzaSyDXysT9mNq9HfVwtBSQ_hw5wigG1jsPm6g",
  authDomain: "talent-hunt-6ff04.firebaseapp.com",
  projectId: "talent-hunt-6ff04",
  storageBucket: "talent-hunt-6ff04.firebasestorage.app",
  messagingSenderId: "630383410154",
  appId: "1:630383410154:web:a62669d9256c19101b1093",
};