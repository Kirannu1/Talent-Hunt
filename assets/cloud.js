// ============================================================================
// MindMesh — cloud storage layer (Firestore, with local fallback)
// ============================================================================
// This module is the only place that talks to the database. Every page
// imports functions from here instead of touching Firestore or
// localStorage directly.
//
// If assets/firebase-config.js hasn't been filled in yet, every function
// here quietly falls back to this browser's localStorage, so the site
// still works end-to-end for one student on one device — it just won't
// sync across devices or show other students until the config is set.
// ============================================================================

import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, deleteField,
  collection, getDocs, addDoc, query, where, orderBy, onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

const PROFILES_COLLECTION = 'mindmesh_profiles';
const LOCAL_KEY = 'mindmesh_profile';
const UID_KEY = 'mindmesh_uid';

let db = null;
let cloudReady = false;

try {
  const configured = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.indexOf('PASTE_') === -1;
  if (configured) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    cloudReady = true;
  }
} catch (err) {
  console.warn('MindMesh: Firebase did not initialize, falling back to local storage only.', err);
  cloudReady = false;
}

export function isCloudReady() {
  return cloudReady;
}

// ----------------------------------------------------------------------
// Auth — Google sign-in. Free on any Firebase plan (unlike phone/SMS).
// A signed-in Google account becomes the student's permanent identity:
// it replaces the random per-browser ID, so the same profile follows
// them to a new browser or device, not just a reopened tab.
// ----------------------------------------------------------------------
let authInstance = null;
let cachedUser = null;
const authListeners = new Set();

function loadPersistedGoogleUser() {
  try {
    const raw = localStorage.getItem('mindmesh_google_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function notifyAuthChange(user) {
  cachedUser = user;
  authListeners.forEach(cb => {
    try { cb(user); } catch (e) { console.error(e); }
  });
}

function ensureAuth() {
  if (!cloudReady) return null;
  if (!authInstance) {
    try { authInstance = getAuth(); } catch (err) {
      console.error('MindMesh: auth init failed', err);
      return null;
    }
  }
  return authInstance;
}

// Resolves once Firebase has finished restoring any existing session, or
// restores saved Google identity from local cache.
export function whenAuthReady() {
  const persisted = loadPersistedGoogleUser();
  if (persisted) {
    cachedUser = persisted;
  }
  const auth = ensureAuth();
  if (!auth) return Promise.resolve(cachedUser);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        cachedUser = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        };
        try { localStorage.setItem('mindmesh_google_user', JSON.stringify(cachedUser)); } catch (e) {}
      } else if (!persisted) {
        cachedUser = null;
      }
      unsub();
      resolve(cachedUser);
    });
  });
}

export function onAuthChange(callback) {
  authListeners.add(callback);
  const auth = ensureAuth();
  let unsubFirebase = () => {};
  if (auth) {
    unsubFirebase = onAuthStateChanged(auth, (user) => {
      if (user) {
        cachedUser = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        };
        try { localStorage.setItem('mindmesh_google_user', JSON.stringify(cachedUser)); } catch (e) {}
        notifyAuthChange(cachedUser);
      }
    });
  }
  return function unsubscribe() {
    authListeners.delete(callback);
    unsubFirebase();
  };
}

export function getCurrentGoogleUser() {
  return cachedUser;
}

export function setSimulatedGoogleUser(user) {
  cachedUser = {
    uid: user.uid || ('g_' + Math.random().toString(36).slice(2, 9)),
    displayName: user.displayName || 'Google Student',
    email: user.email || 'student@campus.edu',
    photoURL: user.photoURL || ''
  };
  try {
    localStorage.setItem('mindmesh_google_user', JSON.stringify(cachedUser));
  } catch (e) {}
  notifyAuthChange(cachedUser);
  return { ok: true, user: cachedUser };
}

export async function signInWithGoogle() {
  // If running on file://, inform that a web origin is required for Google OAuth
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return {
      ok: false,
      reason: 'file-protocol',
      message: 'Google OAuth requires a web origin (http://localhost:3000) rather than file://.'
    };
  }

  const auth = ensureAuth();
  if (!auth) return { ok: false, reason: 'not-configured' };
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    cachedUser = {
      uid: result.user.uid,
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL
    };
    try { localStorage.setItem('mindmesh_google_user', JSON.stringify(cachedUser)); } catch (e) {}
    notifyAuthChange(cachedUser);
    return { ok: true, user: cachedUser };
  } catch (err) {
    console.error('MindMesh: Real Google sign-in failed', err);
    return { ok: false, reason: 'error', error: err };
  }
}

export async function signOutUser() {
  try { localStorage.removeItem('mindmesh_google_user'); } catch (e) {}
  const auth = ensureAuth();
  if (auth) {
    try { await signOut(auth); } catch (err) { console.error('MindMesh: sign-out failed', err); }
  }
  cachedUser = null;
  notifyAuthChange(null);
  return { ok: true };
}

export function getMyUid() {
  if (cachedUser) return 'g_' + cachedUser.uid;
  let uid = localStorage.getItem(UID_KEY);
  if (!uid) {
    uid = 'stu_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
    localStorage.setItem(UID_KEY, uid);
  }
  return uid;
}

export async function saveProfileCloud(profile) {
  const uid = getMyUid();
  const withMeta = Object.assign({}, profile, { uid, updatedAt: Date.now() });

  localStorage.setItem(LOCAL_KEY, JSON.stringify(withMeta));

  // Sync to local server API for cross-browser / cross-device network testing
  if (typeof fetch !== 'undefined') {
    fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withMeta)
    }).catch(() => {});
  }

  if (!cloudReady) return { ok: true, reason: 'local-saved' };
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, uid), withMeta);
    return { ok: true };
  } catch (err) {
    console.error('MindMesh: cloud save failed', err);
    return { ok: true, reason: 'error', error: err };
  }
}

export async function loadMyProfileCloud() {
  const uid = getMyUid();
  if (cloudReady) {
    try {
      const snap = await getDoc(doc(db, PROFILES_COLLECTION, uid));
      if (snap.exists()) return snap.data();
    } catch (err) {
      console.error('MindMesh: cloud load failed, falling back to local copy', err);
    }
  }
  const local = localStorage.getItem(LOCAL_KEY);
  return local ? JSON.parse(local) : null;
}

export async function loadAllProfilesCloud() {
  const map = {};

  // 1. Try local server API
  if (typeof fetch !== 'undefined') {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.profiles)) {
        data.profiles.forEach(p => { if (p && p.uid) map[p.uid] = p; });
      }
    } catch (e) {}
  }

  // 2. Try Firestore
  if (cloudReady) {
    try {
      const snap = await getDocs(collection(db, PROFILES_COLLECTION));
      snap.docs.forEach(d => {
        const p = d.data();
        if (p && p.uid) map[p.uid] = p;
      });
    } catch (err) {
      console.error('MindMesh: cloud list failed', err);
    }
  }

  // 3. Merge self if present in localStorage
  const myProfile = JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null');
  if (myProfile && myProfile.uid) {
    map[myProfile.uid] = myProfile;
  }

  return Object.values(map);
}

export function subscribeAllProfiles(callback) {
  let unsubFirestore = () => {};
  if (cloudReady) {
    unsubFirestore = onSnapshot(
      collection(db, PROFILES_COLLECTION),
      () => {
        loadAllProfilesCloud().then(callback);
      },
      err => console.error('MindMesh: live subscription failed', err)
    );
  }

  // Also background poll local server every 3s so multi-device testing syncs automatically
  const pollTimer = setInterval(() => {
    loadAllProfilesCloud().then(callback);
  }, 3000);

  return function unsubscribe() {
    clearInterval(pollTimer);
    unsubFirestore();
  };
}

// ----------------------------------------------------------------------
// Team roster — teammates a student has picked out of their matches.
// Stored as a map on the student's own profile doc (team.<uid> = snapshot).
// ----------------------------------------------------------------------
export async function addTeammate(teammate) {
  const myUid = getMyUid();
  const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  local.team = local.team || {};
  local.team[teammate.uid] = teammate;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(local));

  if (!cloudReady) {
    return { ok: true };
  }
  try {
    await updateDoc(doc(db, PROFILES_COLLECTION, myUid), { [`team.${teammate.uid}`]: teammate });
    return { ok: true };
  } catch (err) {
    console.error('MindMesh: add teammate failed', err);
    return { ok: true }; // Local copy succeeded
  }
}

export async function removeTeammate(uid) {
  const myUid = getMyUid();
  const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  if (local.team) delete local.team[uid];
  localStorage.setItem(LOCAL_KEY, JSON.stringify(local));

  if (!cloudReady) {
    return { ok: true };
  }
  try {
    await updateDoc(doc(db, PROFILES_COLLECTION, myUid), { [`team.${uid}`]: deleteField() });
    return { ok: true };
  } catch (err) {
    console.error('MindMesh: remove teammate failed', err);
    return { ok: true };
  }
}

// ----------------------------------------------------------------------
// Direct messages — Hybrid Local & Cloud Real-time Messaging
// Delivers messages instantly, persists them locally & in Firestore,
// and features realistic teammate auto-receipt & context replies.
// ----------------------------------------------------------------------
function threadIdFor(uidA, uidB) {
  return [uidA, uidB].sort().join('__');
}

export function getThreadId(otherUid) {
  return threadIdFor(getMyUid(), otherUid);
}

const threadSubscribers = {}; // threadId -> Set of callbacks

function getLocalMessages(threadId) {
  try {
    const raw = localStorage.getItem('mm_msgs_' + threadId);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalMessage(threadId, msg, otherUid, customDetails) {
  const msgs = getLocalMessages(threadId);
  const exists = msgs.some(m => m.id === msg.id);
  if (!exists) {
    msgs.push(msg);
    try {
      localStorage.setItem('mm_msgs_' + threadId, JSON.stringify(msgs));
    } catch (e) {}
  }

  // Update thread directory in local storage
  const threads = getLocalThreads();
  const myUid = getMyUid();
  const existingIdx = threads.findIndex(t => t.id === threadId);
  
  const myProfile = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  const myName = (cachedUser && cachedUser.displayName) || myProfile.name || 'Student';
  const myPhoto = (cachedUser && cachedUser.photoURL) || myProfile.photo || null;
  const myCollege = myProfile.college || '';

  const threadObj = {
    id: threadId,
    participants: [myUid, otherUid],
    participantDetails: {
      [myUid]: { name: myName, photo: myPhoto, college: myCollege },
      ...(customDetails ? { [otherUid]: customDetails } : {})
    },
    updatedAt: msg.createdAt,
    lastMessage: msg
  };

  if (existingIdx >= 0) {
    threads[existingIdx] = Object.assign({}, threads[existingIdx], threadObj, {
      participantDetails: Object.assign({}, threads[existingIdx].participantDetails || {}, threadObj.participantDetails)
    });
  } else {
    threads.unshift(threadObj);
  }
  try {
    localStorage.setItem('mm_threads', JSON.stringify(threads));
  } catch (e) {}

  notifyThreadSubscribers(threadId, msgs);
  notifyMyThreadSubscribers();
}

function notifyThreadSubscribers(threadId, msgs) {
  if (threadSubscribers[threadId]) {
    threadSubscribers[threadId].forEach(cb => {
      try { cb(msgs); } catch (e) { console.error(e); }
    });
  }
}

const myThreadsSubscribers = new Set();
function notifyMyThreadSubscribers() {
  listMyThreads().then(threads => {
    myThreadsSubscribers.forEach(cb => {
      try { cb(threads); } catch (e) { console.error(e); }
    });
  });
}

// BroadcastChannel for instant zero-latency cross-tab/window live chatting
export const chatBroadcast = (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined')
  ? new BroadcastChannel('mindmesh_live_chat')
  : null;

if (chatBroadcast) {
  chatBroadcast.onmessage = (ev) => {
    const data = ev.data;
    if (!data || !data.msg) return;
    const threadId = data.threadId;
    const msg = data.msg;
    const currentMsgs = getLocalMessages(threadId);
    if (!currentMsgs.some(m => m.id === msg.id)) {
      currentMsgs.push(msg);
      currentMsgs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      try { localStorage.setItem('mm_msgs_' + threadId, JSON.stringify(currentMsgs)); } catch (e) {}
      notifyThreadSubscribers(threadId, currentMsgs);
      notifyMyThreadSubscribers();
    }

    const myUid = getMyUid();
    if (msg.to === myUid && msg.from !== myUid) {
      if (typeof window !== 'undefined') {
        if (window.MindMeshSFX) window.MindMeshSFX.playChime();
        if (window.MindMeshToast) {
          window.MindMeshToast.show(`💬 ${msg.senderName || 'Teammate'}: "${msg.text.slice(0, 48)}"`, { type: 'info' });
        }
        const badge = document.getElementById('nav-inbox-badge');
        if (badge) {
          badge.style.display = 'inline-flex';
          badge.textContent = '1';
        }
      }
    }
  };
}

// Listen to storage events across tabs as fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('mm_msgs_')) {
      const threadId = e.key.replace('mm_msgs_', '');
      const msgs = getLocalMessages(threadId);
      notifyThreadSubscribers(threadId, msgs);
    }
    if (e.key === 'mm_threads') {
      notifyMyThreadSubscribers();
    }
  });
}

// Persona response generator for interactive teammate conversations
function generateTeammateReply(otherUid, userMessage) {
  const low = userMessage.toLowerCase();
  
  if (otherUid.includes('meera') || otherUid.includes('design')) {
    if (low.includes('figma') || low.includes('design') || low.includes('ui') || low.includes('ux') || low.includes('prototype')) {
      return "Hey! Yes, I just updated the Figma components and interactive flow. Sending you the prototype link right now! 🎨";
    }
    if (low.includes('hack') || low.includes('presentation') || low.includes('slide') || low.includes('deck')) {
      return "Awesome! I'm formatting our presentation slides with our MindMesh design palette. It's looking super clean!";
    }
    return "Hey! Great point. I'll test the UI layout for that right away and make sure our user experience is top-notch! 👍";
  }

  if (otherUid.includes('kabir') || otherUid.includes('backend') || otherUid.includes('ml')) {
    if (low.includes('model') || low.includes('ml') || low.includes('python') || low.includes('ai') || low.includes('api')) {
      return "Hey! Just deployed the model API with FastAPI and added automated batch inference. Endpoints are running at <50ms latency! ⚡";
    }
    if (low.includes('data') || low.includes('database') || low.includes('sql')) {
      return "Got it! Schema is indexed and caching is enabled. Database is ready for high query loads.";
    }
    return "Hey, got your message! Working on the cloud infrastructure and backend logic right now. Let's sync up after classes!";
  }

  if (otherUid.includes('wei') || otherUid.includes('react') || otherUid.includes('frontend')) {
    if (low.includes('react') || low.includes('component') || low.includes('frontend') || low.includes('web')) {
      return "Pushed the latest React components to our git branch! State management and real-time sockets are working smoothly. 🚀";
    }
    return "Hey! I'm on it — polishing the responsive layout and micro-animations so the judges get a 60fps experience!";
  }

  if (otherUid.includes('ananya') || otherUid.includes('pitch')) {
    return "Great timing! I've refined our pitch narrative to highlight our complementary skill synergy. Judges will love the problem-solution fit! 🎯";
  }

  if (otherUid.includes('dev') || otherUid.includes('iot')) {
    return "Hardware sensors are calibrated and the microcontroller firmware is transmitting telemetry packets cleanly! 🔧";
  }

  return "Hey! Received your message loud and clear. Let's push hard on this milestone — our team has great synergy! 🚀";
}

export async function sendMessage(otherUid, text) {
  if (!text || !text.trim()) return { ok: false, reason: 'empty' };
  const myUid = getMyUid();
  const threadId = threadIdFor(myUid, otherUid);
  const clean = text.trim();

  // Resolve sender info
  const myProfile = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  const senderName = (cachedUser && cachedUser.displayName) || myProfile.name || 'Student';
  const senderPhoto = (cachedUser && cachedUser.photoURL) || myProfile.photo || null;
  const senderCollege = myProfile.college || '';

  // Resolve recipient info
  let targetName = 'Teammate';
  let targetPhoto = null;
  let targetCollege = '';
  if (myProfile.team && myProfile.team[otherUid]) {
    targetName = myProfile.team[otherUid].name || targetName;
    targetPhoto = myProfile.team[otherUid].photo || null;
    targetCollege = myProfile.team[otherUid].college || '';
  } else if (typeof MindMesh !== 'undefined' && MindMesh.MOCK_STUDENTS) {
    const found = MindMesh.MOCK_STUDENTS.find(s => s.uid === otherUid);
    if (found) {
      targetName = found.name;
      targetPhoto = found.photo || null;
      targetCollege = found.college || '';
    }
  }

  const customTargetDetails = { name: targetName, photo: targetPhoto, college: targetCollege };

  const userMsg = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    threadId,
    from: myUid,
    to: otherUid,
    senderName,
    senderPhoto,
    senderCollege,
    text: clean,
    createdAt: Date.now()
  };

  // 1. Immediate local save & update
  saveLocalMessage(threadId, userMsg, otherUid, customTargetDetails);

  // 2. Broadcast across open tabs and windows with zero latency
  if (chatBroadcast) {
    chatBroadcast.postMessage({ threadId, msg: userMsg });
  }

  // 3. Sync to local backend API if available
  if (typeof fetch !== 'undefined') {
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userMsg)
    }).catch(() => {});
  }

  // 4. Cloud Firestore save if available
  if (cloudReady) {
    try {
      await setDoc(doc(db, 'mindmesh_threads', threadId), {
        id: threadId,
        participants: [myUid, otherUid],
        participantDetails: {
          [myUid]: { name: senderName, photo: senderPhoto, college: senderCollege },
          [otherUid]: customTargetDetails
        },
        updatedAt: Date.now(),
        lastMessage: userMsg
      }, { merge: true });
      await addDoc(collection(db, 'mindmesh_threads', threadId, 'messages'), userMsg);
    } catch (err) {
      console.warn('MindMesh: Firestore send message warning (using local delivery)', err);
    }
  }

  // 4. Teammate Receipt & Auto-Reply:
  // ONLY simulate replies if messaging a built-in mock bot student!
  // Real registered users will receive the actual message in their inbox on the website.
  const isMockStudent = otherUid.startsWith('s1_') || otherUid.startsWith('s2_') ||
                        otherUid.startsWith('s3_') || otherUid.startsWith('s4_') ||
                        otherUid.startsWith('s5_') || otherUid.startsWith('s6_') ||
                        otherUid.startsWith('mock_');

  if (isMockStudent) {
    setTimeout(() => {
      const replyText = generateTeammateReply(otherUid, clean);
      const replyMsg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        threadId,
        from: otherUid,
        to: myUid,
        senderName: targetName,
        senderPhoto: targetPhoto,
        senderCollege: targetCollege,
        text: replyText,
        createdAt: Date.now()
      };

      saveLocalMessage(threadId, replyMsg, otherUid, customTargetDetails);

      if (typeof fetch !== 'undefined') {
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(replyMsg)
        }).catch(() => {});
      }

      // If cloud ready, persist reply too
      if (cloudReady) {
        setDoc(doc(db, 'mindmesh_threads', threadId), {
          participants: [myUid, otherUid],
          updatedAt: Date.now(),
          lastMessage: replyMsg
        }, { merge: true }).catch(() => {});
        addDoc(collection(db, 'mindmesh_threads', threadId, 'messages'), replyMsg).catch(() => {});
      }

      // Audio & Toast notification of received reply
      if (typeof window !== 'undefined') {
        if (window.MindMeshSFX) window.MindMeshSFX.playChime();
        if (window.MindMeshToast) {
          window.MindMeshToast.show(`💬 ${targetName}: "${replyText.slice(0, 48)}..."`, { type: 'info' });
        }

        // Update inbox badge in nav
        const badge = document.getElementById('nav-inbox-badge');
        if (badge) {
          badge.style.display = 'inline-flex';
          badge.textContent = '1';
        }
      }
    }, 1500);
  }

  return { ok: true };
}

export function subscribeThread(otherUid, callback) {
  const myUid = getMyUid();
  const threadId = threadIdFor(myUid, otherUid);

  if (!threadSubscribers[threadId]) threadSubscribers[threadId] = new Set();
  threadSubscribers[threadId].add(callback);

  // Deliver initial local messages immediately
  const localMsgs = getLocalMessages(threadId);
  callback(localMsgs);

  // Local server poll for multi-browser sync (1s interval)
  const pollInterval = setInterval(() => {
    if (typeof fetch !== 'undefined') {
      fetch(`/api/messages?threadId=${encodeURIComponent(threadId)}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.ok && Array.isArray(data.messages) && data.messages.length > 0) {
            const currentMsgs = getLocalMessages(threadId);
            let hasNew = false;
            data.messages.forEach(m => {
              if (!currentMsgs.some(c => c.id === m.id)) {
                currentMsgs.push(m);
                hasNew = true;
              }
            });
            if (hasNew) {
              currentMsgs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
              try { localStorage.setItem('mm_msgs_' + threadId, JSON.stringify(currentMsgs)); } catch (e) {}
              callback(currentMsgs);
            }
          }
        })
        .catch(() => {});
    }
  }, 1000);

  let unsubCloud = () => {};
  if (cloudReady) {
    const q = query(collection(db, 'mindmesh_threads', threadId, 'messages'), orderBy('createdAt', 'asc'));
    unsubCloud = onSnapshot(q,
      snap => {
        const cloudMsgs = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
        if (cloudMsgs.length > 0) {
          try {
            localStorage.setItem('mm_msgs_' + threadId, JSON.stringify(cloudMsgs));
          } catch (e) {}
          callback(cloudMsgs);
        }
      },
      err => console.warn('MindMesh: thread cloud subscribe warning', err)
    );
  }

  return function unsubscribe() {
    clearInterval(pollInterval);
    if (threadSubscribers[threadId]) threadSubscribers[threadId].delete(callback);
    unsubCloud();
  };
}

function getLocalThreads() {
  try {
    const raw = localStorage.getItem('mm_threads');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function listMyThreads() {
  const localThreads = getLocalThreads();
  const myUid = getMyUid();
  const map = {};
  localThreads.forEach(t => { map[t.id] = t; });

  // Try fetching from local server API
  try {
    const res = await fetch(`/api/threads?uid=${encodeURIComponent(myUid)}`);
    const data = await res.json();
    if (data && data.ok && Array.isArray(data.threads)) {
      data.threads.forEach(t => { map[t.id] = Object.assign({}, map[t.id] || {}, t); });
    }
  } catch (e) {}

  if (cloudReady) {
    try {
      const q = query(collection(db, 'mindmesh_threads'), where('participants', 'array-contains', myUid));
      const snap = await getDocs(q);
      const cloudThreads = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
      cloudThreads.forEach(t => { map[t.id] = Object.assign({}, map[t.id] || {}, t); });
    } catch (err) {
      console.warn('MindMesh: listMyThreads cloud warning', err);
    }
  }

  const merged = Object.values(map);
  merged.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return merged;
}

export function subscribeMyThreads(callback) {
  myThreadsSubscribers.add(callback);

  // Deliver current threads immediately
  listMyThreads().then(t => callback(t));

  // Regular poll for thread updates
  const pollTimer = setInterval(() => {
    listMyThreads().then(t => callback(t));
  }, 1200);

  let unsubCloud = () => {};
  if (cloudReady) {
    const myUid = getMyUid();
    const q = query(collection(db, 'mindmesh_threads'), where('participants', 'array-contains', myUid));
    unsubCloud = onSnapshot(q, snap => {
      const threads = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
      threads.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      callback(threads);
    }, err => console.warn('MindMesh: thread list cloud subscribe warning', err));
  }

  return function unsubscribe() {
    clearInterval(pollTimer);
    myThreadsSubscribers.delete(callback);
    unsubCloud();
  };
}

export function otherParticipant(thread) {
  const myUid = getMyUid();
  return (thread.participants || []).find(u => u !== myUid) || null;
}

export function isThreadUnread(thread) {
  const myUid = getMyUid();
  if (!thread.lastMessage || thread.lastMessage.from === myUid) return false;
  const lastRead = (thread.lastRead && thread.lastRead[myUid]) || 0;
  return thread.lastMessage.createdAt > lastRead;
}

export async function markThreadRead(otherUid) {
  const myUid = getMyUid();
  const threadId = threadIdFor(myUid, otherUid);

  // Update local unread state
  const threads = getLocalThreads();
  const t = threads.find(th => th.id === threadId);
  if (t) {
    t.lastRead = t.lastRead || {};
    t.lastRead[myUid] = Date.now();
    try { localStorage.setItem('mm_threads', JSON.stringify(threads)); } catch (e) {}
  }

  // Clear nav badge if no more unread threads
  const badge = document.getElementById('nav-inbox-badge');
  if (badge) {
    badge.style.display = 'none';
  }

  if (!cloudReady) return { ok: true };
  try {
    await setDoc(doc(db, 'mindmesh_threads', threadId), {
      lastRead: { [myUid]: Date.now() }
    }, { merge: true });
    return { ok: true };
  } catch (err) {
    return { ok: true };
  }
}