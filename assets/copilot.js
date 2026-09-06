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

  const KNOWLEDGE_BASE = {
    hacknorth: {
      text: "Based on our campus talent graph, **Meera Sharma** (2nd yr, Design) and **Wei Chen** (3rd yr, React/Node) are the highest-scoring matches (96% synergy) for HackNorth's AI track! They cover Frontend and UI/UX design, eliminating the execution blind spot for ML models.",
      actionText: "View Team Matches →",
      actionUrl: "dashboard.html"
    },
    skills: {
      text: "Given a foundation in Python & Machine Learning, our AI talent analysis shows you have a 42% gap in **Interface Systems (UI/UX / Figma)** and **API Deployment (FastAPI/React)**. Learning these two makes you a self-sufficient full-stack AI builder for upcoming campus hackathons.",
      actionText: "See Skill Roadmap →",
      actionUrl: "dashboard.html#dash-gaps"
    },
    squad: {
      text: "⚡ **Optimal 3-Person Campus Squad synthesized:**\n• **Aran Rao** (3rd yr CS) — Machine Learning & Python\n• **Meera Sharma** (2nd yr Design) — Figma & Product Design\n• **Wei Chen** (3rd yr CS) — React & Full-Stack\n\n**Team Synergy Rating: 97%** — Zero skill overlaps, complete design-to-deployment capability!",
      actionText: "Launch Team Studio →",
      actionUrl: "index.html#synthesizer"
    },
    idea: {
      text: "Top trending campus problem this term: **'Smart Attendance & Defaulter Intelligence'** using facial/QR embeddings + automated alerts. High demand for 1 ML dev, 1 React developer, and 1 UI/UX designer.",
      actionText: "Open Idea Generator →",
      actionUrl: "ideas.html"
    },
    default: {
      text: "MindMesh has mapped over **12,400+ campus student nodes** and **40+ clubs**. I can analyze your skill compatibility, recommend hackathon teammates, or identify technologies to accelerate your projects.",
      actionText: "Explore My Dashboard →",
      actionUrl: "dashboard.html"
    }
  };

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
        <span class="copilot-badge">AI</span>
      </button>

      <!-- Chat Flyout Window -->
      <div class="copilot-panel" id="copilot-panel">
        <div class="copilot-head">
          <div class="copilot-title-row">
            <span class="copilot-status-dot"></span>
            <b>MeshAI Copilot</b>
            <span class="copilot-tag">Talent Intelligence</span>
          </div>
          <button type="button" class="copilot-close" id="copilot-close-btn">&times;</button>
        </div>

        <div class="copilot-messages" id="copilot-messages">
          <div class="copilot-msg bot">
            <div class="copilot-bubble">
              👋 Hi! I'm <b>MeshAI</b>, your campus matchmaking intelligence layer. Ask me anything about teammates, hackathon squads, or your next skill goals!
            </div>
          </div>
        </div>

        <div class="copilot-chips" id="copilot-chips">
          <button type="button" class="copilot-chip" data-query="hacknorth">🚀 Find teammate for HackNorth</button>
          <button type="button" class="copilot-chip" data-query="skills">🎯 What should I learn after Python?</button>
          <button type="button" class="copilot-chip" data-query="squad">👥 Form a 3-person squad</button>
          <button type="button" class="copilot-chip" data-query="idea">💡 Suggest a hackathon project</button>
        </div>

        <form class="copilot-input-row" id="copilot-form">
          <input type="text" id="copilot-input" placeholder="Ask MeshAI about skills, teams, hackathons..." autocomplete="off">
          <button type="submit" id="copilot-send-btn">
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
        const queryKey = chip.dataset.query;
        const queryText = chip.textContent.replace(/^[^\w]+/, '').trim();
        handleUserQuery(queryText, queryKey);
      });
    });

    // Handle form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      input.value = '';
      let key = 'default';
      const low = val.toLowerCase();
      if (low.includes('hack') || low.includes('team') || low.includes('match')) key = 'hacknorth';
      else if (low.includes('learn') || low.includes('skill') || low.includes('gap')) key = 'skills';
      else if (low.includes('squad') || low.includes('form') || low.includes('trio')) key = 'squad';
      else if (low.includes('idea') || low.includes('project')) key = 'idea';

      handleUserQuery(val, key);
    });

    function handleUserQuery(userText, key) {
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

      const resp = KNOWLEDGE_BASE[key] || KNOWLEDGE_BASE.default;

      setTimeout(() => {
        typing.remove();
        if (global.MindMeshSFX) global.MindMeshSFX.playScan();

        const botMsg = document.createElement('div');
        botMsg.className = 'copilot-msg bot';
        
        let htmlText = resp.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
        botMsg.innerHTML = `
          <div class="copilot-bubble">
            <div class="typewriter-content"></div>
            ${resp.actionText ? `<a href="${resp.actionUrl}" class="copilot-action-link">${resp.actionText}</a>` : ''}
          </div>
        `;
        messagesEl.appendChild(botMsg);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        // Typewriter animation
        const contentTarget = botMsg.querySelector('.typewriter-content');
        let charIdx = 0;
        const speed = 12;
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
      }, 550);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopilot);
  } else {
    initCopilot();
  }
})(window);
