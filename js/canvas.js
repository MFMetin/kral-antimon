/* ============================================================================
   ARKA PLAN — altın ok yağmuru + süzülen altın toz
   Saf canvas 2d. Harici kütüphane yok, video yok.
   ========================================================================== */

const BG = (function () {
  const canvas = document.getElementById('bg');
  // Saydam: taban gradient CSS'te (body), splash katmanı canvas'ın ALTINDA duruyor
  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let W = 0, H = 0, dpr = 1;
  let raf = 0, last = 0, running = false;
  let spawnTimer = 0, nextSpawn = 400;

  const dust = [];
  const arrows = [];

  // fare paralaksı (çok hafif)
  const px = { cur: 0, tgt: 0 }, py = { cur: 0, tgt: 0 };

  const cfg = () => (typeof CONFIG === 'object' ? CONFIG : {});
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------------------------------------------------------------- ölçüm */
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedDust();
    if (!running) drawFrame(16); // duruyorsa en azından bir kare çiz
  }

  /* ----------------------------------------------------------- altın toz */
  function dustCount() {
    const d = cfg().dustDensity == null ? 1 : cfg().dustDensity;
    return Math.round(Math.min(190, Math.max(35, (W * H) / 11000)) * d);
  }

  function makeMote(atRandomHeight) {
    return {
      x: Math.random() * W,
      y: atRandomHeight ? Math.random() * H : H + rnd(0, 60),
      r: rnd(0.6, 2.4),
      vy: rnd(0.10, 0.42),           // yukarı süzülme hızı
      sway: rnd(0.15, 0.7),
      phase: Math.random() * Math.PI * 2,
      freq: rnd(0.0006, 0.0018),
      a: rnd(0.18, 0.75),
      depth: rnd(0.3, 1),            // paralaks derinliği
    };
  }

  function seedDust() {
    const want = dustCount();
    while (dust.length > want) dust.pop();
    while (dust.length < want) dust.push(makeMote(true));
  }

  /* ------------------------------------------------------------------ ok */
  function spawnArrow(fast) {
    const dir = Math.random() < 0.5 ? 1 : -1;            // 1: sağa, -1: sola
    const t = -(0.14 + Math.random() * 0.24) * Math.PI;  // yukarı doğru açı
    const speed = rnd(0.55, 1.25) * (fast ? 1.35 : 1);   // px / ms
    const ux = dir * Math.cos(t), uy = Math.sin(t);      // birim vektör (uy < 0)
    arrows.push({
      x: dir === 1 ? rnd(-140, W * 0.25) : rnd(W * 0.75, W + 140),
      y: rnd(H * 0.55, H + 160),
      ux, uy,
      sp: speed,
      len: rnd(90, 230),
      w: rnd(1.1, 2.6),
      a: 0,                          // mevcut opaklık
      aMax: rnd(0.45, 1),
    });
  }

  function arrowInterval() {
    const d = cfg().arrowDensity == null ? 1 : cfg().arrowDensity;
    const base = W < 700 ? 1100 : 620;
    return rnd(base * 0.5, base * 1.4) / Math.max(0.2, d);
  }

  /* -------------------------------------------------------------- çizim */
  function drawDust(dt) {
    ctx.globalCompositeOperation = 'lighter';
    for (const m of dust) {
      if (!reduceMotion) {
        m.y -= m.vy * (dt / 16.67);
        m.phase += m.freq * dt;
        m.x += Math.sin(m.phase) * m.sway * (dt / 16.67) * 0.35;
        if (m.y < -12) Object.assign(m, makeMote(false));
      }
      const x = m.x + px.cur * m.depth;
      const y = m.y + py.cur * m.depth;
      const r = m.r * 4.5;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0.00, 'rgba(255,236,178,' + (m.a * 0.95).toFixed(3) + ')');
      g.addColorStop(0.35, 'rgba(255,190,86,' + (m.a * 0.32).toFixed(3) + ')');
      g.addColorStop(1.00, 'rgba(255,170,50,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawArrows(dt) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    for (let i = arrows.length - 1; i >= 0; i--) {
      const a = arrows[i];

      a.x += a.ux * a.sp * dt;
      a.y += a.uy * a.sp * dt;
      if (a.a < a.aMax) a.a = Math.min(a.aMax, a.a + dt / 240);

      if (a.y < -260 || a.x < -300 || a.x > W + 300) { arrows.splice(i, 1); continue; }

      // ekranın üstüne yaklaşınca sön
      const topFade = Math.max(0, Math.min(1, (a.y + 120) / (H * 0.45)));
      const alpha = a.a * topFade;
      if (alpha <= 0.01) continue;

      const hx = a.x + px.cur * 0.6;
      const hy = a.y + py.cur * 0.6;
      const tx = hx - a.ux * a.len;
      const ty = hy - a.uy * a.len;

      const g = ctx.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0.00, 'rgba(255,150,30,0)');
      g.addColorStop(0.55, 'rgba(255,188,74,' + (alpha * 0.22).toFixed(3) + ')');
      g.addColorStop(0.88, 'rgba(255,224,140,' + (alpha * 0.72).toFixed(3) + ')');
      g.addColorStop(1.00, 'rgba(255,250,222,' + alpha.toFixed(3) + ')');

      ctx.strokeStyle = g;
      ctx.lineWidth = a.w;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      // uç parıltısı
      const rr = a.w * 7;
      const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, rr);
      hg.addColorStop(0.0, 'rgba(255,248,214,' + (alpha * 0.55).toFixed(3) + ')');
      hg.addColorStop(0.4, 'rgba(255,196,90,' + (alpha * 0.22).toFixed(3) + ')');
      hg.addColorStop(1.0, 'rgba(255,170,50,0)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(hx, hy, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawFrame(dt) {
    // paralaksı yumuşat
    px.cur += (px.tgt - px.cur) * 0.05;
    py.cur += (py.tgt - py.cur) * 0.05;

    ctx.clearRect(0, 0, W, H);
    drawDust(dt);
    if (!reduceMotion) drawArrows(dt);
  }

  /* -------------------------------------------------------------- döngü */
  function tick(now) {
    if (!running) return;
    let dt = now - last;
    last = now;
    if (dt > 60) dt = 60;            // sekme arkadan dönünce sıçramasın

    spawnTimer += dt;
    if (!reduceMotion && spawnTimer >= nextSpawn) {
      spawnTimer = 0;
      nextSpawn = arrowInterval();
      spawnArrow(false);
    }

    drawFrame(dt);
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  /* ---------------------------------------------------------------- API */
  function boost(n) {
    if (reduceMotion) return;
    const count = n || 9;
    for (let i = 0; i < count; i++) setTimeout(() => spawnArrow(true), i * 70);
  }

  function init() {
    resize();

    let rt = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(resize, 150);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    if (fine && !reduceMotion) {
      window.addEventListener('pointermove', (e) => {
        px.tgt = (e.clientX / W - 0.5) * -26;
        py.tgt = (e.clientY / H - 0.5) * -18;
      }, { passive: true });
    }

    if (reduceMotion) { drawFrame(16); return; }
    start();
  }

  return { init, start, stop, boost };
})();

BG.init();
