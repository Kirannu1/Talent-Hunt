/* ==========================================================================
   MindMesh — shared polish layer
   Scroll-reveal, animated counters, sticky-nav shrink. Pure progressive
   enhancement: every element this touches is already visible/correct in
   plain HTML+CSS, so nothing breaks if this script fails to run.
   ========================================================================== */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- sticky nav shrink / shadow on scroll ----
  const nav = document.querySelector('header.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (reduceMotion) return; // skip reveal + counters entirely; content is already visible

  // ---- magnetic tilt on feature cards ----
  const tiltEls = document.querySelectorAll('.feature-card');
  tiltEls.forEach(el => {
    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `translateY(-5px) perspective(600px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  // ---- scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    revealEls.forEach(el => el.classList.add('reveal-armed'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  // ---- animated number counters ----
  const counters = document.querySelectorAll('[data-count-to]');
  if (counters.length && 'IntersectionObserver' in window) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.countTo);
      const suffix = el.dataset.suffix || '';
      const duration = 1100;
      const startTime = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = val.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animate(entry.target); io2.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => io2.observe(el));
  }

  // ---- Mobile Navigation Drawer ----
  const navRight = document.querySelector('.nav-right');
  const navInner = document.querySelector('.nav-inner');
  if (navRight && navInner) {
    let toggleBtn = document.querySelector('.nav-toggle-btn');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'nav-toggle-btn';
      toggleBtn.setAttribute('aria-label', 'Toggle Menu');
      toggleBtn.innerHTML = '☰';
      navRight.appendChild(toggleBtn);
    }

    let drawer = document.querySelector('.mobile-nav-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.className = 'mobile-nav-drawer';
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      drawer.innerHTML = `
        <a href="index.html#how" class="mobile-nav-link ${currentPage === 'index.html' ? 'active' : ''}">⚡ How it works</a>
        <a href="index.html#synthesizer" class="mobile-nav-link">🤖 AI Team Studio</a>
        <a href="ideas.html" class="mobile-nav-link ${currentPage === 'ideas.html' ? 'active' : ''}">💡 Campus Ideas</a>
        <a href="dashboard.html" class="mobile-nav-link ${currentPage === 'dashboard.html' ? 'active' : ''}">📊 My Dashboard</a>
        <a href="team.html" class="mobile-nav-link ${currentPage === 'team.html' ? 'active' : ''}">🤝 My Team & Squads</a>
        <a href="inbox.html" class="mobile-nav-link ${currentPage === 'inbox.html' ? 'active' : ''}">💬 Direct Inbox</a>
        <a href="profile.html" class="mobile-nav-cta">+ Build Campus Profile ✦</a>
      `;
      document.body.appendChild(drawer);
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = drawer.classList.toggle('open');
      toggleBtn.innerHTML = open ? '✕' : '☰';
      if (window.MindMeshSFX) window.MindMeshSFX.playClick();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mobile-nav-drawer') && !e.target.closest('.nav-toggle-btn')) {
        drawer.classList.remove('open');
        toggleBtn.innerHTML = '☰';
      }
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggleBtn.innerHTML = '☰';
      });
    });
  }
})();