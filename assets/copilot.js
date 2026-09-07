/* ==========================================================================
   MindMesh — MeshAI Campus Matchmaker Copilot
   Interactive floating AI assistant that assists students and judges with
   intelligent teammate recommendations, skill gap analysis, and instant squad synthesis.
   ========================================================================== */
(function (global) {
  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  const NAVIGATION_TARGETS = [
    { label: '👤 Profile', url: 'profile.html', hint: 'Build / Edit Profile & ID' },
    { label: '💬 Inbox', url: 'inbox.html', hint: 'Direct Real-time Messaging' },
    { label: '👥 Squad', url: 'team.html', hint: 'My Selected Teammates' },
    { label: '⚡ Dashboard', url: 'dashboard.html', hint: 'Matchmaking & Student Roster' },
    { label: '🕸️ Mesh Graph', url: 'dashboard.html#mesh-graph', hint: 'Interactive Talent Graph' },
    { label: '💡 Ideas', url: 'ideas.html', hint: 'Hackathon Project Ideas' },
    { label: '🏆 Hackathons', url: 'index.html#hackathons', hint: 'Upcoming Competitions & SIH' },
    { label: '🛠️ Synthesizer', url: 'index.html#synthesizer', hint: 'AI 3-Person Team Builder' }
  ];

  async function matchIntent(query) {
    const q = (query || '').toLowerCase().trim();

    // Fetch registered students from server or local cache
    let registeredProfiles = [];
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.profiles)) {
        registeredProfiles = data.profiles;
      }
    } catch (e) {}

    const myProfile = JSON.parse(localStorage.getItem('mindmesh_profile') || '{}');
    const others = registeredProfiles.filter(p => p && p.uid && p.uid !== myProfile.uid && p.name);

    // 1. Direct inquiry for registered students or specific skills/colleges
    const searchTerms = ['python', 'react', 'figma', 'design', 'ui/ux', 'ml', 'machine learning', 'pytorch', 'iot', 'arduino', 'fastapi', 'sql', 'easwari', 'srm', 'vit', 'who', 'find', 'coder', 'developer'];
    const hasSearchTerm = searchTerms.some(term => q.includes(term));
    const isTeammateSearch = (hasSearchTerm || q.includes('registered') || q.includes('available')) && !q.includes('inbox') && !q.includes('synthesizer') && !q.includes('profile builder');

    if (isTeammateSearch && others.length > 0) {
      const words = q.split(/\s+/).filter(w => w.length > 2);
      const matched = others.filter(s => {
        const skills = [...(s.tech || []), ...(s.creative || []), ...(s.interests || [])].map(sk => sk.toLowerCase());
        const name = (s.name || '').toLowerCase();
        const college = (s.college || '').toLowerCase();
        const branch = (s.branch || '').toLowerCase();
        return words.some(w => skills.some(sk => sk.includes(w)) || name.includes(w) || college.includes(w) || branch.includes(w));
      });

      const displayList = (matched.length > 0 ? matched : others).slice(0, 3);
      const studentCards = displayList.map(s => {
        const skillsSnippet = [...(s.tech || []), ...(s.creative || [])].slice(0, 3).join(', ');
        return `
          <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 12px;margin:8px 0;display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div style="min-width:0;flex:1;">
              <b style="font-size:13px;color:#fff;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(s.name)}</b>
              <div style="font-size:11px;color:#A4ACB8;margin-top:2px;">🏛️ ${escapeHtml(s.college ? s.college.split(' ')[0] : 'Campus')} ${s.year ? '· ' + escapeHtml(s.year) : ''}</div>
              <div style="font-size:10.5px;color:var(--amber);margin-top:2px;">${escapeHtml(skillsSnippet || 'Verified Node')}</div>
            </div>
            <a href="inbox.html?chat=${encodeURIComponent(s.uid)}" class="copilot-action-btn" style="margin-top:0;padding:6px 12px;font-size:11px;flex:none;white-space:nowrap;">💬 Message</a>
          </div>
        `;
      }).join('');

      return {
        text: `🎯 **Found ${matched.length > 0 ? matched.length : others.length} registered candidate${(matched.length > 0 ? matched.length : others.length) === 1 ? '' : 's'}** matching your inquiry:\n${studentCards}\nClick **Message** to open an instant live chat thread, or view all students in your dashboard!`,
        actionText: "View Available Teammates Slot →",
        actionUrl: "dashboard.html"
      };
    }

    if (q.includes('inbox') || q.includes('message') || q.includes('chat') || q.includes('text') || q.includes('dm') || q.includes('talk') || q.includes('conversation')) {
      return {
        text: "Opening your **Direct Messaging Inbox**! 💬\n\n• Chat with selected teammates in real-time\n• Receive instant chime & push notifications\n• Icebreaker starters for SIH 2026 and UI reviews\n• Zero glitch, in-place reply flow",
        actionText: "Open Direct Inbox →",
        actionUrl: "inbox.html"
      };
    }

    if (q.includes('profile') || q.includes('id card') || q.includes('roll') || q.includes('usn') || q.includes('photo') || q.includes('badge') || q.includes('college') || q.includes('branch')) {
      return {
        text: "Taking you to the **Digital Profile Builder**! 🚀\n\n• Holographic 3D Student ID card\n• College selection (Easwari, SRM, VIT, RVCE, etc.)\n• Verified technical & creative skill tags\n• Live photo upload & real-time campus mapping",
        actionText: "Go to Profile Builder →",
        actionUrl: "profile.html"
      };
    }

    if (q.includes('squad') || q.includes('my team') || q.includes('teammate') || q.includes('roster') || q.includes('member') || q.includes('group')) {
      return {
        text: "Heading to your **Squad Studio**! 👥\n\nView your current team roster, overall squad synergy score (target: 95%+), combined skill set, and send direct text messages to your teammates.",
        actionText: "Open My Squad →",
        actionUrl: "team.html"
      };
    }

    if (q.includes('synthesizer') || q.includes('synthesize') || q.includes('custom project') || q.includes('auto team') || q.includes('trio') || q.includes('form team')) {
      return {
        text: "⚡ **AI Team Synthesizer Studio**:\n\nOur matching engine scans all registered students to synthesize an optimal, complementary squad:\n\n• **Extra Real-World Missions**: SIH Cyber Defense, Rural MedTech, Web3 FinTech, AgriBot IoT\n• **Custom Projects**: Add your own project mission & stack\n• **Real Teammates**: Real registered nodes assigned to complementary roles",
        actionText: "Launch Team Synthesizer →",
        actionUrl: "index.html#synthesizer"
      };
    }

    if (q.includes('available') || q.includes('available teammates') || q.includes('other students')) {
      return {
        text: "👥 **Available Teammates Slot**:\n\nEven when AI complementary matching is calculating, you can explore **all registered students** who have built their profiles! Filter by college, branch, or technology, and add builders directly to your squad.",
        actionText: "View Available Teammates →",
        actionUrl: "dashboard.html"
      };
    }

    if (q.includes('hackathon') || q.includes('sih') || q.includes('smart india') || q.includes('hacknorth') || q.includes('competition')) {
      return {
        text: "🏆 **Smart India Hackathon (SIH 2026) Winning Formula**:\n\n1. **Team Size**: Exactly 6 members (mandatory: at least 1 female teammate)\n2. **Optimal Squad Synergy**:\n   • 2 Backend / ML Engineers (Python, FastAPI, SQL)\n   • 2 Frontend / Mobile Developers (React, Flutter)\n   • 1 UI/UX Product Designer (Figma, Design Systems)\n   • 1 Domain Specialist / Pitch Presenter\n3. **Deliverables**: Live prototype + measurable impact architecture\n\nNeed to complete your SIH team right now?",
        actionText: "Synthesize SIH Squad →",
        actionUrl: "index.html#synthesizer"
      };
    }

    if (q.includes('idea') || q.includes('project') || q.includes('problem') || q.includes('what to build')) {
      return {
        text: "💡 **Trending Hackathon Problem Statements**:\n\n1. **Smart Attendance & Defaulter Intelligence** (AI + QR embeddings)\n2. **SIH 2026 Cyber Threat Intelligence** (FastAPI, Anomaly Detection)\n3. **PulseAI Rural Triage Companion** (Offline-first Computer Vision)\n4. **MealQueue Smart Canteen Wait Predictor** (Live WebSockets)\n\nWant complete technical architectures?",
        actionText: "Open Project Idea Studio →",
        actionUrl: "ideas.html"
      };
    }

    if (q.includes('synergy') || q.includes('algorithm') || q.includes('jaccard') || q.includes('score')) {
      return {
        text: "🎯 **How MindMesh Synergy Works**:\n\nOur matchmaker combines **Jaccard skill complementarity** with domain coverage weights. If you are an ML developer, matching with a UI/UX designer and frontend engineer yields **97% squad synergy** because you achieve full design-to-deployment capability!",
        actionText: "See Skill Roadmap →",
        actionUrl: "dashboard.html#dash-gaps"
      };
    }

    if (q.includes('login') || q.includes('sign in') || q.includes('google') || q.includes('account') || q.includes('auth')) {
      return {
        text: "🔑 **Google Sign-In & Verification**:\n\nSign in with your Google account (top-right button) to sync your profile across browsers and devices. Your institutional domain will get verified automatically!",
        actionText: "Go to Profile to Sign In →",
        actionUrl: "profile.html"
      };
    }

    if (q.includes('dashboard') || q.includes('match') || q.includes('search') || q.includes('find')) {
      return {
        text: "Navigating to your **Campus Matchmaking Dashboard**! ⚡\n\n• Dual slot switching: **AI Matches** & **Available Teammates**\n• Search by college, branch, or verified framework\n• One-click squad additions with celebratory confetti",
        actionText: "Explore Dashboard Matches →",
        actionUrl: "dashboard.html"
      };
    }

    return {
      text: "👋 I'm **MeshAI**, your campus talent copilot! I can guide you through every part of MindMesh:\n\n• **AI Team Synthesizer**: form squads for SIH & custom projects\n• **Available Teammates**: discover all registered students\n• **Direct Messaging**: text teammates in real-time\n• **Profile Studio**: build your 3D Student ID\n• **Idea Studio**: explore 20+ hackathon architectures",
      actionText: "Take Me to Dashboard →",
      actionUrl: "dashboard.html"
    };
  }

  function initCopilot() {
    if (document.getElementById('mesh-copilot-container')) return;

    const container = document.createElement('div');
    container.id = 'mesh-copilot-container';
    container.className = 'copilot-container';
    container.innerHTML = `
      <!-- Trigger Button -->
      <button type="button" class="copilot-btn" id="copilot-trigger" title="Ask MeshAI Copilot">
        <div class="copilot-pulse"></div>
        <svg class="copilot-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#aiG)" stroke="#fff" stroke-width="1.2"/>
          <defs>
            <linearGradient id="aiG" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FF9F45"/>
              <stop offset="1" stop-color="#6C4CE0"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="copilot-label">MeshAI Copilot</span>
        <span class="copilot-badge">AI Navigator</span>
      </button>

      <!-- Chat Flyout Window -->
      <div class="copilot-panel" id="copilot-panel">
        <div class="copilot-head">
          <div class="copilot-title-row">
            <span class="copilot-status-dot"></span>
            <b>MeshAI Copilot</b>
            <span class="copilot-tag">Campus Intelligence</span>
          </div>
          <button type="button" class="copilot-close" id="copilot-close-btn">&times;</button>
        </div>

        <!-- Quick Navigation Bar -->
        <div class="copilot-nav-bar" id="copilot-nav-bar">
          ${NAVIGATION_TARGETS.map(t => `
            <a href="${t.url}" class="copilot-nav-btn" title="${t.hint}">${t.label}</a>
          `).join('')}
        </div>

        <div class="copilot-messages" id="copilot-messages">
          <div class="copilot-msg bot">
            <div class="copilot-bubble">
              👋 Hi! I'm <b>MeshAI</b>. Where do you want to go, or what teammates are you looking for? Type anything or use the navigation buttons above!
            </div>
          </div>
        </div>

        <!-- Dynamic Suggestion Chips -->
        <div class="copilot-chips" id="copilot-chips">
          <button type="button" class="copilot-chip" data-query="synthesize team">⚡ Synthesize Team</button>
          <button type="button" class="copilot-chip" data-query="available teammates">👥 Available Teammates</button>
          <button type="button" class="copilot-chip" data-query="who knows python">🐍 Find Python Devs</button>
          <button type="button" class="copilot-chip" data-query="who knows figma">🎨 Find UI/UX Designers</button>
          <button type="button" class="copilot-chip" data-query="sih 2026 strategy">🏆 SIH 2026 Rules</button>
          <button type="button" class="copilot-chip" data-query="open direct inbox">💬 Direct Inbox</button>
          <button type="button" class="copilot-chip" data-query="suggest hackathon project">💡 Project Ideas</button>
          <button type="button" class="copilot-chip" data-query="take me to profile">👤 Build Profile</button>
        </div>

        <form class="copilot-input-row" id="copilot-form">
          <input type="text" id="copilot-input" autocomplete="off" placeholder="Ask MeshAI for teammates, navigation, SIH...">
          <button type="submit" id="copilot-send-btn" title="Send message">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(container);

    const trigger = document.getElementById('copilot-trigger');
    const panel = document.getElementById('copilot-panel');
    const closeBtn = document.getElementById('copilot-close-btn');
    const form = document.getElementById('copilot-form');
    const input = document.getElementById('copilot-input');
    const messagesEl = document.getElementById('copilot-messages');
    const chipsEl = document.getElementById('copilot-chips');

    function togglePanel() {
      const isOpen = panel.classList.toggle('open');
      if (isOpen) {
        if (global.MindMeshSFX) global.MindMeshSFX.playClick();
        setTimeout(() => input.focus(), 150);
      }
    }

    trigger.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', togglePanel);

    // Handle chips
    chipsEl.querySelectorAll('.copilot-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const queryText = chip.dataset.query || chip.textContent.trim();
        handleUserQuery(queryText);
      });
    });

    // Handle form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      input.value = '';
      handleUserQuery(val);
    });

    async function handleUserQuery(userText) {
      if (global.MindMeshSFX) global.MindMeshSFX.playClick();

      // Append user msg
      const userMsg = document.createElement('div');
      userMsg.className = 'copilot-msg user';
      userMsg.innerHTML = `<div class="copilot-bubble">${escapeHtml(userText)}</div>`;
      messagesEl.appendChild(userMsg);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      // Bot typing indicator
      const typing = document.createElement('div');
      typing.className = 'copilot-msg bot typing';
      typing.innerHTML = `<div class="copilot-bubble"><span class="copilot-dot"></span><span class="copilot-dot"></span><span class="copilot-dot"></span></div>`;
      messagesEl.appendChild(typing);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      const resp = await matchIntent(userText);

      setTimeout(() => {
        typing.remove();
        if (global.MindMeshSFX) global.MindMeshSFX.playScan();

        const botMsg = document.createElement('div');
        botMsg.className = 'copilot-msg bot';
        
        let htmlText = resp.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
        botMsg.innerHTML = `
          <div class="copilot-bubble">
            <div class="typewriter-content"></div>
            ${resp.actionText ? `<a href="${resp.actionUrl}" class="copilot-action-btn">${resp.actionText}</a>` : ''}
          </div>
        `;
        messagesEl.appendChild(botMsg);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        // Typewriter animation
        const contentTarget = botMsg.querySelector('.typewriter-content');
        let charIdx = 0;
        const speed = 10;
        function typeChar() {
          if (charIdx < htmlText.length) {
            if (htmlText[charIdx] === '<') {
              const closeTag = htmlText.indexOf('>', charIdx);
              if (closeTag !== -1) {
                contentTarget.innerHTML += htmlText.slice(charIdx, closeTag + 1);
                charIdx = closeTag + 1;
              } else {
                contentTarget.innerHTML += htmlText[charIdx++];
              }
            } else {
              contentTarget.innerHTML += htmlText[charIdx++];
            }
            messagesEl.scrollTop = messagesEl.scrollHeight;
            setTimeout(typeChar, speed);
          }
        }
        typeChar();
      }, 450);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopilot);
  } else {
    initCopilot();
  }
})(window);
