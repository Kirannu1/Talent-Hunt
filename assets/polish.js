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
})();