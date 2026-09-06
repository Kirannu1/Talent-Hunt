/* ==========================================================================
   MindMesh — Enhanced Interactive Canvas Mesh Field
   Modes:
     "ambient" — dynamic constellation on hero with interactive mouse physics,
                 glowing data packets flowing across connections, and click ripples.
     "live"    — interactive skill graph orbiting a center student node for profile builder.
   ========================================================================== */
(function (global) {
  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function MeshField(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mode = (opts && opts.mode) || 'ambient';
    this.nodes = [];
    this.packets = [];
    this.ripples = [];
    this.mouse = { x: -9999, y: -9999, active: false };
    this.running = false;

    this._resizeBound = this.resize.bind(this);
    window.addEventListener('resize', this._resizeBound);

    this._initEvents();
    this.resize();
    if (this.mode === 'ambient') this._seedAmbient();
  }

  MeshField.prototype._initEvents = function () {
    const c = this.canvas;
    const parent = c.parentElement || c;

    const onMove = (e) => {
      const rect = c.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * devicePixelRatio;
      this.mouse.y = (e.clientY - rect.top) * devicePixelRatio;
      this.mouse.active = true;
    };

    const onLeave = () => {
      this.mouse.active = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    };

    const onClick = (e) => {
      const rect = c.getBoundingClientRect();
      const x = (e.clientX - rect.left) * devicePixelRatio;
      const y = (e.clientY - rect.top) * devicePixelRatio;
      this.ripples.push({ x, y, r: 4, maxR: 140 * devicePixelRatio, alpha: 0.8 });
      if (global.MindMeshSFX) global.MindMeshSFX.playClick();
    };

    parent.addEventListener('mousemove', onMove, { passive: true });
    parent.addEventListener('mouseleave', onLeave, { passive: true });
    parent.addEventListener('click', onClick, { passive: true });
  };

  MeshField.prototype.resize = function () {
    const c = this.canvas;
    this.w = c.width = c.offsetWidth * devicePixelRatio;
    this.h = c.height = c.offsetHeight * devicePixelRatio;
    if (this.mode === 'live') this._layout();
  };

  MeshField.prototype._seedAmbient = function () {
    const labels = [
      'Python', 'React', 'UI/UX', 'Machine Learning', 'Product Design',
      'Data Science', 'Node.js', 'Figma', 'Java', 'IoT / Robotics',
      'Public Speaking', 'Cloud / AWS', 'SQL', 'FastAPI', 'PyTorch'
    ];
    const count = Math.max(24, Math.floor((this.canvas.offsetWidth * this.canvas.offsetHeight) / 26000));
    this.nodes = [];
    for (let i = 0; i < count; i++) {
      this.nodes.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        ox: Math.random() * this.w,
        oy: Math.random() * this.h,
        vx: (Math.random() - 0.5) * 0.22 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.22 * devicePixelRatio,
        r: (Math.random() * 1.8 + 1.6) * devicePixelRatio,
        label: labels[i % labels.length],
        hue: i % 3 === 0 ? '#6C4CE0' : i % 3 === 1 ? '#FF9F45' : '#3FA772',
        pulse: Math.random() * Math.PI * 2
      });
    }
  };

  MeshField.prototype.setLiveNodes = function (labelList) {
    const prev = {};
    this.nodes.forEach(n => { if (!n.isHub) prev[n.label] = n; });

    this.nodes = [];
    // hub
    this.nodes.push({
      isHub: true,
      label: this.hubLabel || 'YOU',
      x: this.w / 2, y: this.h / 2, tx: this.w / 2, ty: this.h / 2,
      r: 10 * devicePixelRatio, hue: '#fff', floatSeed: 0
    });

    labelList.forEach((label, i) => {
      const existing = prev[label];
      this.nodes.push({
        label,
        x: existing ? existing.x : this.w / 2 + (Math.random() - 0.5) * 20,
        y: existing ? existing.y : this.h / 2 + (Math.random() - 0.5) * 20,
        tx: 0, ty: 0,
        r: 5 * devicePixelRatio,
        hue: i % 2 === 0 ? '#6C4CE0' : '#FF9F45',
        floatSeed: Math.random() * 1000
      });
    });
    this._layout();
  };

  MeshField.prototype.setHubLabel = function (label) {
    this.hubLabel = label;
    const hub = this.nodes.find(n => n.isHub);
    if (hub) hub.label = label;
  };

  MeshField.prototype.setHubImage = function (dataUrl) {
    if (!dataUrl) { this.hubImage = null; return; }
    const img = new Image();
    img.onload = () => { this.hubImage = img; };
    img.src = dataUrl;
  };

  MeshField.prototype._layout = function () {
    if (this.mode !== 'live') return;
    const hub = this.nodes.find(n => n.isHub);
    if (hub) { hub.tx = this.w / 2; hub.ty = this.h / 2; }
    const spokes = this.nodes.filter(n => !n.isHub);
    const radius = Math.min(this.w, this.h) * (spokes.length > 8 ? 0.42 : 0.34);
    spokes.forEach((n, i) => {
      const angle = (i / Math.max(spokes.length, 1)) * Math.PI * 2 - Math.PI / 2;
      n.tx = this.w / 2 + Math.cos(angle) * radius;
      n.ty = this.h / 2 + Math.sin(angle) * radius;
    });
  };

  MeshField.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    const loop = (t) => {
      if (!this.running) return;
      this._draw(t || 0);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  };

  MeshField.prototype.stop = function () {
    this.running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  };

  MeshField.prototype._draw = function (t) {
    const ctx = this.ctx, w = this.w, h = this.h;
    ctx.clearRect(0, 0, w, h);

    if (this.mode === 'ambient') {
      const linkDist = 160 * devicePixelRatio;
      const mouseDist = 170 * devicePixelRatio;

      // Update nodes
      if (!REDUCE_MOTION) {
        this.nodes.forEach(n => {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;

          // Interactive mouse gravity / elastic influence
          if (this.mouse.active) {
            const mdx = this.mouse.x - n.x;
            const mdy = this.mouse.y - n.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < mouseDist && mDist > 5) {
              const force = (1 - mDist / mouseDist) * 0.6;
              n.x += (mdx / mDist) * force * devicePixelRatio;
              n.y += (mdy / mDist) * force * devicePixelRatio;
            }
          }
        });
      }

      // Draw click ripples
      for (let r = this.ripples.length - 1; r >= 0; r--) {
        const rip = this.ripples[r];
        rip.r += 2.8 * devicePixelRatio;
        rip.alpha *= 0.94;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(108, 76, 224, ${rip.alpha})`;
        ctx.lineWidth = 2 * devicePixelRatio;
        ctx.stroke();
        if (rip.alpha < 0.02 || rip.r > rip.maxR) {
          this.ripples.splice(r, 1);
        }
      }

      // Draw links between nearby nodes
      const activeLinks = [];
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const a = this.nodes[i], b = this.nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.38;
            ctx.strokeStyle = `rgba(160, 172, 215, ${alpha})`;
            ctx.lineWidth = 1 * devicePixelRatio;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            activeLinks.push({ a, b, dist });
          }
        }
      }

      // Periodically spawn data packets travelling along links
      if (!REDUCE_MOTION && Math.random() < 0.07 && activeLinks.length > 0 && this.packets.length < 14) {
        const link = activeLinks[Math.floor(Math.random() * activeLinks.length)];
        this.packets.push({
          from: link.a,
          to: link.b,
          p: 0,
          speed: 0.012 + Math.random() * 0.018,
          color: Math.random() < 0.5 ? '#6C4CE0' : '#FF9F45'
        });
      }

      // Draw glowing data packets
      for (let p = this.packets.length - 1; p >= 0; p--) {
        const pkt = this.packets[p];
        pkt.p += pkt.speed;
        if (pkt.p >= 1) {
          this.packets.splice(p, 1);
          continue;
        }
        const px = pkt.from.x + (pkt.to.x - pkt.from.x) * pkt.p;
        const py = pkt.from.y + (pkt.to.y - pkt.from.y) * pkt.p;

        ctx.beginPath();
        ctx.arc(px, py, 2.8 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = pkt.color;
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 8 * devicePixelRatio;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // Draw nodes & labels
      ctx.font = `${11.5 * devicePixelRatio}px 'JetBrains Mono', monospace`;
      this.nodes.forEach(n => {
        const isHovered = this.mouse.active && Math.hypot(n.x - this.mouse.x, n.y - this.mouse.y) < 30 * devicePixelRatio;

        ctx.beginPath();
        ctx.fillStyle = n.hue;
        ctx.globalAlpha = isHovered ? 1 : 0.88;
        ctx.arc(n.x, n.y, isHovered ? n.r * 1.8 : n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 2.8, 0, Math.PI * 2);
          ctx.strokeStyle = n.hue;
          ctx.lineWidth = 1.5 * devicePixelRatio;
          ctx.stroke();
        }

        if (n.label) {
          ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(235, 238, 248, 0.65)';
          ctx.font = isHovered ? `bold ${12 * devicePixelRatio}px 'Space Grotesk', sans-serif` : `${11 * devicePixelRatio}px 'JetBrains Mono', monospace`;
          ctx.fillText(n.label, n.x + 8 * devicePixelRatio, n.y + 4 * devicePixelRatio);
        }
      });
      return;
    }

    // ---- live mode (Profile builder) ----
    this.nodes.forEach(n => {
      n.x += (n.tx - n.x) * 0.12;
      n.y += (n.ty - n.y) * 0.12;
    });

    const hub = this.nodes.find(n => n.isHub);
    const spokes = this.nodes.filter(n => !n.isHub);

    if (hub) {
      spokes.forEach(n => {
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1.2 * devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(hub.x, hub.y);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      });
    }

    for (let i = 0; i < spokes.length; i++) {
      for (let j = i + 1; j < spokes.length; j++) {
        ctx.strokeStyle = 'rgba(150,160,200,0.12)';
        ctx.lineWidth = 1 * devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(spokes[i].x, spokes[i].y);
        ctx.lineTo(spokes[j].x, spokes[j].y);
        ctx.stroke();
      }
    }

    ctx.font = `${11 * devicePixelRatio}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    spokes.forEach(n => {
      const bob = REDUCE_MOTION ? 0 : Math.sin(t / 700 + n.floatSeed) * 2.5 * devicePixelRatio;
      ctx.beginPath();
      ctx.fillStyle = n.hue;
      ctx.globalAlpha = 0.95;
      ctx.arc(n.x, n.y + bob, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(240,242,250,0.9)';
      ctx.fillText(n.label, n.x, n.y + bob - 10 * devicePixelRatio);
    });

    if (hub) {
      const pulse = REDUCE_MOTION ? 0 : Math.sin(t / 500) * 2 * devicePixelRatio;
      const grad = ctx.createRadialGradient(hub.x, hub.y, 0, hub.x, hub.y, (hub.r + 7 * devicePixelRatio + pulse));
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(hub.x, hub.y, hub.r + 7 * devicePixelRatio + pulse, 0, Math.PI * 2);
      ctx.fill();

      if (this.hubImage) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, hub.r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(this.hubImage, hub.x - hub.r, hub.y - hub.r, hub.r * 2, hub.r * 2);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(hub.x, hub.y, hub.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0E1116';
        ctx.font = `700 ${10 * devicePixelRatio}px 'Space Grotesk', sans-serif`;
        ctx.fillText(hub.label.slice(0, 2).toUpperCase(), hub.x, hub.y + 3.5 * devicePixelRatio);
      }
    }
    ctx.textAlign = 'left';
  };

  global.MeshField = MeshField;
})(window);