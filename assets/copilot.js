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

  function matchIntent(query) {
    const q = (query || '').toLowerCase().trim();

    if (q.includes('inbox') || q.includes('message') || q.includes('chat') || q.includes('text') || q.includes('dm') || q.includes('talk') || q.includes('conversation')) {
      return {
        text: "Opening your **Direct Inbox**! 💬\n\nHere you can text your selected teammates in real time, check unread replies, and coordinate your hackathon sprint plans. Real teammates will receive your messages directly on the website.",
        actionText: "Open Direct Inbox →",
        actionUrl: "inbox.html"
      };
    }

    if (q.includes('profile') || q.includes('id card') || q.includes('roll') || q.includes('usn') || q.includes('photo') || q.includes('badge') || q.includes('college') || q.includes('easwari') || q.includes('srm') || q.includes('vit') || q.includes('branch')) {
      return {
        text: "Taking you to the **Digital Profile Builder**! 🚀\n\nCraft your 3D holographic Student ID, select your engineering college, pick your core dev & design skills, and generate your live node on the campus talent graph.",
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

    if (q.includes('mesh') || q.includes('graph') || q.includes('network') || q.includes('node') || q.includes('visualize') || q.includes('cluster')) {
      return {
        text: "Visualizing the **Interactive Campus Talent Mesh**! 🕸️\n\nExplore live student nodes connected by shared frameworks, complementary skills, and college clusters powered by real-time force physics.",
        actionText: "View Interactive Mesh →",
        actionUrl: "dashboard.html#mesh-graph"
      };
    }

    if (q.includes('synthesizer') || q.includes('synthesize') || q.includes('auto team') || q.includes('trio') || q.includes('3-person') || q.includes('form team')) {
      return {
        text: "⚡ **AI Team Synthesizer Studio**:\n\nOur matchmaking engine automatically balances 3-person hackathon teams combining **1 ML/Backend Engineer + 1 React Full-Stack Builder + 1 UI/UX Product Designer** to eliminate skill blind spots.",
        actionText: "Launch Team Synthesizer →",
        actionUrl: "index.html#synthesizer"
      };
    }

    if (q.includes('hackathon') || q.includes('sih') || q.includes('smart india') || q.includes('hacknorth') || q.includes('devfest') || q.includes('competition') || q.includes('event')) {
      return {
        text: "🏆 **Upcoming Campus & National Hackathons**:\n\n• **Smart India Hackathon (SIH 2026)** — National tier, Software & Hardware editions\n• **HackNorth AI 2026** — Generative AI & Autonomous Agent track\n• **Campus DevFest Hack** — Web3, Full-Stack & IoT tracks\n\nNeed teammates before the deadline?",
        actionText: "Explore Hackathons →",
        actionUrl: "index.html#hackathons"
      };
    }

    if (q.includes('idea') || q.includes('project') || q.includes('problem') || q.includes('statement') || q.includes('what to build') || q.includes('build')) {
      return {
        text: "💡 Top trending hackathon problems this term:\n\n1. **Campus Bus ETA & GPS Predictor** (Python, FastAPI, Live WebSockets)\n2. **Smart Attendance & Defaulter Intelligence** (Face/QR embeddings + automated alerts)\n3. **Peer Skill Barter Platform** (React, Supabase, Escrow logic)\n\nWant full architecture breakdowns?",
        actionText: "Open Project Idea Studio →",
        actionUrl: "ideas.html"
      };
    }

    if (q.includes('synergy') || q.includes('algorithm') || q.includes('how does it work') || q.includes('jaccard') || q.includes('score')) {
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

    if (q.includes('dashboard') || q.includes('match') || q.includes('search') || q.includes('find') || q.includes('explore')) {
      return {
        text: "Navigating to your **Campus Matchmaking Dashboard**! ⚡\n\nFilter students by college, search by framework (PyTorch, Figma, React, Flutter), inspect compatibility vectors, and click 'Add to my team'!",
        actionText: "Explore Dashboard Matches →",
        actionUrl: "dashboard.html"
      };
    }

    return {
      text: "👋 I'm **MeshAI**, your campus talent copilot! I know every corner of MindMesh. I can navigate you to:\n\n• **Profile Builder**: create your 3D Student ID\n• **Direct Inbox**: message your squad\n• **My Team**: review squad synergy & roster\n• **Mesh Graph**: view connected student nodes\n• **Project Ideas**: brainstorm hackathon concepts",
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
          <button type="button" class="copilot-chip" data-query="take me to profile">👤 Build / Edit Profile</button>
          <button type="button" class="copilot-chip" data-query="take me to inbox">💬 Open Direct Inbox</button>
          <button type="button" class="copilot-chip" data-query="show my squad">👥 View My Squad</button>
          <button type="button" class="copilot-chip" data-query="open talent mesh graph">🕸️ Talent Mesh Graph</button>
          <button type="button" class="copilot-chip" data-query="suggest hackathon project">💡 Project Ideas</button>
          <button type="button" class="copilot-chip" data-query="find teammate for hacknorth">🚀 SIH / HackNorth Matches</button>
        </div>

        <form class="copilot-input-row" id="copilot-form">
          <input type="text" id="copilot-input" autocomplete="off">
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

    function handleUserQuery(userText) {
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

      const resp = matchIntent(userText);

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
