/* ============== North Entrance ============== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const canvas = $('#fx-canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const spotlight = $('#spotlight');
  const enterBtn = $('#enterBtn');
  const veil = $('#veil');
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------- 調整畫布尺寸 ---------- */
  function resize() {
    const { innerWidth: w, innerHeight: h } = window;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---------- 滑鼠追光 ---------- */
  let mx = 0.5, my = 0.4;
  const onMove = (e) => {
    const x = e.clientX / innerWidth;
    const y = e.clientY / innerHeight;
    mx += (x - mx) * 0.2;
    my += (y - my) * 0.2;
    spotlight.style.setProperty('--mx', (mx * 100) + '%');
    spotlight.style.setProperty('--my', (my * 100) + '%');
  };
  window.addEventListener('mousemove', onMove);

  /* ---------- 粒子系統（連線 + 慣性） ---------- */
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COUNT = prefersReduced ? 40 : 100;
  const MAX_DIST = 140;
  const nodes = [];
  function rand(a, b) { return a + Math.random() * (b - a); }

  for (let i = 0; i < COUNT; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: rand(-0.2, 0.2),
      vy: rand(-0.2, 0.2),
      s: rand(0.6, 1.7)
    });
  }

  function step() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 背景微漸層霧
    const grd = ctx.createRadialGradient(
      w * 0.2, h * 0.15, 10,
      w * 0.2, h * 0.15, Math.max(w, h)
    );
    grd.addColorStop(0, 'rgba(130,189,204,0.05)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // 更新與渲染點
    ctx.lineWidth = 1 * DPR;
    for (let i = 0; i < COUNT; i++) {
      const p = nodes[i];

      // 輕微朝滑鼠方向偏移（視差感）
      const tx = mx * w - p.x;
      const ty = my * h - p.y;
      p.vx += (tx * 0.00002);
      p.vy += (ty * 0.00002);

      p.x += p.vx;
      p.y += p.vy;

      // 邊界回彈
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // 畫點
      ctx.beginPath();
      ctx.fillStyle = 'rgba(130,189,204,0.85)';
      ctx.arc(p.x, p.y, p.s * DPR, 0, Math.PI * 2);
      ctx.fill();
    }

    // 連線
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MAX_DIST * DPR) {
          const o = 1 - dist / (MAX_DIST * DPR);
          ctx.strokeStyle = `rgba(130,189,204,${0.18 * o})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    req = requestAnimationFrame(step);
  }

  let req = requestAnimationFrame(step);

  /* ---------- Enter 行為：磁吸＋轉場 ---------- */
  // 磁吸
  enterBtn.addEventListener('mousemove', (e) => {
    const r = enterBtn.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    enterBtn.style.transform = `translate(${x * 0.06}px, ${y * 0.06}px)`;
  });
  enterBtn.addEventListener('mouseleave', () => {
    enterBtn.style.transform = '';
  });

  // 點擊或按 Enter 轉場
  const go = () => {
    // 防重複
    if (veil.classList.contains('show')) return;
    veil.classList.add('show');
    // 暫停動畫、釋放資源
    cancelAnimationFrame(req);
    window.removeEventListener('mousemove', onMove);
    // 延遲一點點讓遮幕跑起來
    setTimeout(() => { window.location.href = 'north.html'; }, 520);
  };
  enterBtn.addEventListener('click', go);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') go();
  });

  /* ---------- 省電保護：切分頁時降低運算 ---------- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(req);
    } else {
      req = requestAnimationFrame(step);
    }
  });
})();
