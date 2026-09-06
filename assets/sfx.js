/* ==========================================================================
   MindMesh — Web Audio SFX & Haptics Engine
   Pure Web Audio API synthesizer — zero external audio files required.
   Lightweight, futuristic acoustic feedback for presentations & demos.
   ========================================================================== */
(function (global) {
  let audioCtx = null;
  let soundEnabled = localStorage.getItem('mindmesh_sound') !== 'false';

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const SFX = {
    isEnabled: function () {
      return soundEnabled;
    },
    toggle: function () {
      soundEnabled = !soundEnabled;
      localStorage.setItem('mindmesh_sound', soundEnabled ? 'true' : 'false');
      if (soundEnabled) SFX.playClick();
      updateUI();
      return soundEnabled;
    },

    // Subtle crisp UI tick
    playClick: function () {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.045);
      } catch (e) {}
    },

    // Radar scan sweep sound for AI Team Synthesizer
    playScan: function () {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {}
    },

    // Harmonious multi-tone chime for matches and team synthesis
    playChime: function () {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
          gain.gain.setValueAtTime(0.045, ctx.currentTime + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.07);
          osc.stop(ctx.currentTime + idx * 0.07 + 0.5);
        });
      } catch (e) {}
    },

    // Big milestone fanfare
    playCelebration: function () {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
          gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.55);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.09);
          osc.stop(ctx.currentTime + idx * 0.09 + 0.6);
        });
      } catch (e) {}
    }
  };

  function updateUI() {
    const btns = document.querySelectorAll('.sound-toggle-btn');
    btns.forEach(btn => {
      btn.innerHTML = soundEnabled
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      btn.title = soundEnabled ? 'Sound is on (Click to mute)' : 'Sound is muted (Click to unmute)';
    });
  }

  // Mount sound button into nav if available
  document.addEventListener('DOMContentLoaded', () => {
    const navRight = document.querySelector('.nav-right');
    if (navRight && !document.querySelector('.sound-toggle-btn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sound-toggle-btn';
      btn.addEventListener('click', () => SFX.toggle());
      navRight.insertBefore(btn, navRight.firstChild);
      updateUI();
    }
  });

  global.MindMeshSFX = SFX;
})(window);
