/* ==========================================================================
   MindMesh — toast notifications + particle burst
   Plain global (window.MindMeshToast), usable from classic scripts or
   ES modules without an import. Progressive: if this fails to load,
   nothing else on the site depends on it.
   ========================================================================== */
window.MindMeshToast = (function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stack = null;

  function ensureStack() {
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  function show(message, opts) {
    opts = opts || {};
    const type = opts.type || 'info';
    const icon = type === 'success' ? '✓' : type === 'error' ? '!' : '✦';
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg"></span>`;
    el.querySelector('.toast-msg').textContent = message;
    ensureStack().appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    const duration = opts.duration || 3000;
    setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hide');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  // small celebratory burst of dots from a given point on screen —
  // used for things like "added to team" to make the action feel real
  function burst(x, y, colors) {
    if (reduceMotion) return;
    colors = colors || ['#6C4CE0', '#FF9F45'];
    const holder = document.createElement('div');
    holder.className = 'burst-holder';
    holder.style.left = x + 'px';
    holder.style.top = y + 'px';
    document.body.appendChild(holder);
    const n = 12;
    for (let i = 0; i < n; i++) {
      const dot = document.createElement('span');
      dot.className = 'burst-dot';
      const angle = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 40 + Math.random() * 50;
      dot.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      dot.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      dot.style.background = colors[i % colors.length];
      dot.style.animationDelay = (Math.random() * 0.08) + 's';
      holder.appendChild(dot);
    }
    setTimeout(() => holder.remove(), 900);
  }

  return { show, burst };
})();