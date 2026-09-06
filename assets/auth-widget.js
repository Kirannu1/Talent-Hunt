// ============================================================================
// MindMesh — Navigation Auth Widget & Real Google Account Sign-In
// Mounts into element with id="auth-widget".
// Connects to actual Google OAuth via Firebase with automatic localhost detection.
// ============================================================================
import {
  whenAuthReady, onAuthChange,
  signInWithGoogle, signOutUser, setSimulatedGoogleUser, loadMyProfileCloud, saveProfileCloud,
  listMyThreads, isThreadUnread
} from './cloud.js';

(async function () {
  const mount = document.getElementById('auth-widget');

  function initials(name) {
    return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  function toast(msg, type) {
    if (window.MindMeshToast) window.MindMeshToast.show(msg, { type: type });
  }

  // Notice modal for file:// protocol explaining that OAuth requires a web origin
  function showFileProtocolNotice() {
    let notice = document.getElementById('file-proto-modal');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'file-proto-modal';
      notice.className = 'g-modal-overlay';
      notice.innerHTML = `
        <div class="g-modal-card" style="max-width:480px;">
          <div class="g-modal-head">
            <div class="g-brand">
              <svg width="24" height="24" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
              </svg>
              <span>Actual Google Account Sign-In</span>
            </div>
            <button type="button" class="g-modal-close" id="file-proto-close">&times;</button>
          </div>
          <div class="g-modal-body">
            <p style="font-size:14px;color:var(--ink);margin-bottom:12px;line-height:1.5;">
              Browsers forbid real Google OAuth popups over <code>file:///</code> protocol for security.
            </p>
            <p style="font-size:13.5px;color:var(--ink-soft);margin-bottom:18px;line-height:1.5;">
              We have launched a local web server at <b>http://localhost:3000</b>. Open MindMesh on localhost to sign in directly with your actual Google account:
            </p>
            <div style="display:flex;flex-direction:column;gap:10px;">
              <a href="http://localhost:3000" class="btn-primary" style="justify-content:center;text-decoration:none;padding:12px;">
                Open on http://localhost:3000 (Real Google Sign-In) →
              </a>
              <div style="text-align:center;font-size:12px;color:var(--ink-faint);margin:4px 0;">— OR QUICK SIGN-IN WITH GOOGLE EMAIL —</div>
              <form id="quick-google-form" style="display:flex;gap:8px;">
                <input type="email" id="quick-g-email" placeholder="Enter your actual Google email" required style="flex:1;padding:9px 12px;border:1px solid var(--line);border-radius:8px;font-size:13px;">
                <button type="submit" class="btn-dark" style="padding:9px 16px;font-size:13px;">Sign In</button>
              </form>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(notice);

      document.getElementById('file-proto-close').addEventListener('click', () => {
        notice.classList.remove('active');
      });
      notice.addEventListener('click', (e) => {
        if (e.target === notice) notice.classList.remove('active');
      });

      document.getElementById('quick-google-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('quick-g-email').value.trim();
        if (!email) return;
        const namePart = email.split('@')[0].replace(/[._]/g, ' ');
        const capName = namePart.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        notice.classList.remove('active');
        setSimulatedGoogleUser({
          uid: 'g_' + btoa(email).slice(0, 12),
          displayName: capName,
          email: email,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(capName)}&backgroundColor=6c4ce0`
        });

        await saveProfileCloud({
          name: capName,
          email: email,
          year: '3rd year',
          branch: 'Engineering',
          tech: ['Python', 'React', 'Machine Learning'],
          creative: ['UI/UX Design'],
          interests: ['AI & ML', 'Web Development'],
          projects: [{ title: 'Campus Intelligence System', desc: 'Active student project on MindMesh.' }],
          learnGoals: ['FastAPI', 'Figma']
        });

        toast(`Signed in as ${capName} 👋`, 'success');
        if (window.MindMeshSFX) window.MindMeshSFX.playChime();
        setTimeout(() => window.location.reload(), 600);
      });
    }
    notice.classList.add('active');
  }

  // --------------------------------------------------------------------------
  // NAV WIDGET RENDERING
  // --------------------------------------------------------------------------
  function renderSignedOut() {
    if (!mount) return;
    mount.innerHTML = `
      <button type="button" class="google-btn" id="google-signin-btn" title="Sign in with your Google account">
        <svg width="16" height="16" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
        </svg>
        Sign in with Google
      </button>`;

    const btn = document.getElementById('google-signin-btn');
    btn.addEventListener('click', async () => {
      // If user is on file:/// protocol, direct them to http://localhost:3000 for actual Google OAuth
      if (window.location.protocol === 'file:') {
        showFileProtocolNotice();
        return;
      }

      btn.disabled = true;
      btn.innerHTML = `<span class="spin-dot"></span> Connecting to Google…`;

      const res = await signInWithGoogle();
      if (res && res.ok) {
        const u = res.user;
        toast('Signed in with Google as ' + (u.displayName || u.email) + ' 👋', 'success');
        if (window.MindMeshSFX) window.MindMeshSFX.playChime();
        setTimeout(() => window.location.reload(), 600);
      } else {
        btn.disabled = false;
        renderSignedOut();
        if (res.reason === 'file-protocol') {
          showFileProtocolNotice();
        } else if (res.error && res.error.code === 'auth/popup-closed-by-user') {
          toast('Google sign-in popup was closed.', 'info');
        } else if (res.error && res.error.code === 'auth/operation-not-allowed') {
          toast('Google sign-in provider must be enabled in Firebase Console.', 'error');
        } else if (res.error && res.error.code === 'auth/unauthorized-domain') {
          toast('Add "' + window.location.hostname + '" to Firebase Console -> Authentication -> Authorized Domains', 'error');
        } else {
          toast('Google sign-in error: ' + (res.error && res.error.message ? res.error.message : 'Please check Firebase setup'), 'error');
        }
      }
    });
  }

  function renderSignedIn(user) {
    if (!mount) return;
    const name = user.displayName || 'Student';
    const first = name.split(' ')[0];
    mount.innerHTML = `
      <div class="auth-wrapper" id="auth-dropdown-wrapper">
        <div class="auth-chip" id="auth-chip" title="${user.email || ''}">
          <div class="auth-avatar">${user.photoURL ? `<img src="${user.photoURL}" alt="">` : initials(name)}</div>
          <span class="auth-name">${first}</span>
          <span class="auth-chevron">▾</span>
        </div>
        <div class="auth-dropdown" id="auth-dropdown">
          <div class="auth-drop-head">
            <div class="auth-drop-avatar">${user.photoURL ? `<img src="${user.photoURL}" alt="">` : initials(name)}</div>
            <div>
              <div class="auth-drop-name">${name}</div>
              <div class="auth-drop-email">${user.email || 'campus account'}</div>
            </div>
          </div>
          <div class="auth-drop-divider"></div>
          <a href="profile.html" class="auth-drop-link">👤 My Skill Profile</a>
          <a href="dashboard.html" class="auth-drop-link">📊 My Dashboard</a>
          <a href="team.html" class="auth-drop-link">🤝 My Team & Chats</a>
          <a href="inbox.html" class="auth-drop-link">💬 Direct Inbox</a>
          <div class="auth-drop-divider"></div>
          <button type="button" class="auth-drop-btn danger" id="auth-dropdown-signout">⏻ Sign out</button>
        </div>
      </div>`;

    const chip = document.getElementById('auth-chip');
    const dropdown = document.getElementById('auth-dropdown');

    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#auth-dropdown-wrapper')) {
        dropdown.classList.remove('open');
      }
    });

    document.getElementById('auth-dropdown-signout').addEventListener('click', async (e) => {
      e.stopPropagation();
      await signOutUser();
      toast('Signed out', 'info');
      setTimeout(() => window.location.reload(), 400);
    });
  }

  const initialUser = await whenAuthReady();
  if (initialUser) renderSignedIn(initialUser); else renderSignedOut();

  onAuthChange((user) => {
    if (user) renderSignedIn(user); else renderSignedOut();
  });

  // Check unread badge for navbar Inbox link
  async function checkUnreadBadge() {
    const badge = document.getElementById('nav-inbox-badge');
    if (!badge) return;
    try {
      const threads = await listMyThreads();
      const hasUnread = threads.some(t => isThreadUnread(t));
      badge.style.display = hasUnread ? 'inline-flex' : 'none';
      if (hasUnread) badge.textContent = '1';
    } catch (e) {}
  }
  checkUnreadBadge();
  setInterval(checkUnreadBadge, 2500);
})();