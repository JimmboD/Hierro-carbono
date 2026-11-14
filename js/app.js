(() => {
  const D = window.DATA, K = D.kpis;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Fondo animado de partículas ---------- */
  const cv = $('#bg'), cx = cv.getContext('2d');
  let W, H, P = [], mouse = { x: -999, y: -999 };
  function size() { W = cv.width = innerWidth; H = cv.height = innerHeight;
    P = Array.from({ length: Math.min(90, W / 16) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 })); }
  addEventListener('resize', size); size();
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  (function loop() {
    cx.clearRect(0, 0, W, H);
    P.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      cx.fillStyle = 'rgba(56,189,248,.55)'; cx.beginPath(); cx.arc(p.x, p.y, 1.6, 0, 7); cx.fill();
      for (let j = i + 1; j < P.length; j++) { const q = P[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) { cx.strokeStyle = `rgba(129,140,248,${.14 * (1 - d / 120)})`; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); cx.stroke(); } }
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 150) { cx.strokeStyle = `rgba(52,211,153,${.3 * (1 - dm / 150)})`; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(mouse.x, mouse.y); cx.stroke(); }
    });
    requestAnimationFrame(loop);
  })();

  /* ---------- Contadores animados ---------- */
  function count(el) {
    const to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, t0 = performance.now(), dur = 1600;
    (function f(t) { const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 4);
      el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(f); })(t0);
  }

  /* ---------- Reveal al hacer scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); $$('[data-to]', e.target).forEach(count); io.unobserve(e.target); } }), { threshold: .15 });
  $$('.rv').forEach(el => io.observe(el));

  /* ---------- Nav activa ---------- */
  const secs = $$('section[id]');
  addEventListener('scroll', () => { let cur = '';
    secs.forEach(s => { if (scrollY >= s.offsetTop - 160) cur = s.id; });
    $$('nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur)); });

  /* ---------- Regresión lineal ---------- */
  function fit(pts) {
    const n = pts.length, sx = pts.reduce((a, p) => a + p[0], 0), sy = pts.reduce((a, p) => a + p[1], 0),
      sxy = pts.reduce((a, p) => a + p[0] * p[1], 0), sxx = pts.reduce((a, p) => a + p[0] * p[0], 0);
    const m = (n * sxy - sx * sy) / (n * sxx - sx * sx); return { m, b: (sy - m * sx) / n };
  }

  Chart.defaults.color = '#8b9bb4';
  Chart.defaults.borderColor = 'rgba(148,163,184,.1)';
  Chart.defaults.font.family = 'Inter, sans-serif';
  const tip = { backgroundColor: '#0b1220', borderColor: 'rgba(56,189,248,.4)', borderWidth: 1, padding: 12, titleColor: '#fff', cornerRadius: 10 };

  /* ---------- Dispersión interactiva ---------- */
  const active = new Set(Object.keys(D.procesos));
  let showFit = true;
  const chips = $('#chips');
  Object.entries(D.procesos).forEach(([name, o]) => {
    const b = document.createElement('button');
    b.className = 'chip on'; b.style.setProperty('--c', o.color); b.innerHTML = `<i></i>${name}`;
    b.onclick = () => { active.has(name) ? active.delete(name) : active.add(name); b.classList.toggle('on'); drawScatter(); };
    chips.appendChild(b);
  });
  $('#fitToggle').onchange = e => { showFit = e.target.checked; drawScatter(); };

  const scatter = new Chart($('#scatter'), {
    type: 'scatter', data: { datasets: [] },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 900, easing: 'easeOutQuart' },
      interaction: { mode: 'nearest', intersect: true },
      plugins: { legend: { display: false },
        tooltip: { ...tip, callbacks: { title: i => i[0].dataset.label,
          label: c => c.dataset.type === 'line' ? null : `%C: ${c.parsed.x}  ·  UTS: ${c.parsed.y} MPa` } } },
      scales: { x: { title: { display: true, text: 'Carbono (%)' }, min: 0, max: 1 }, y: { title: { display: true, text: 'UTS (MPa)' }, min: 300 } } }
  });
  function drawScatter() {
    const ds = []; let all = [];
    Object.entries(D.procesos).forEach(([n, o]) => { if (!active.has(n)) return; all = all.concat(o.pts);
      ds.push({ label: n, data: o.pts.map(([x, y]) => ({ x, y })), backgroundColor: o.color, pointRadius: 6, pointHoverRadius: 10, pointHoverBorderWidth: 3, pointHoverBorderColor: '#fff' }); });
    if (showFit && all.length > 1) { const { m, b } = fit(all);
      ds.push({ type: 'line', label: `Tendencia: UTS = ${m.toFixed(0)}·%C + ${b.toFixed(0)}`, data: [{ x: 0, y: b }, { x: 1, y: m + b }],
        borderColor: 'rgba(251,191,36,.8)', borderDash: [6, 6], pointRadius: 0, borderWidth: 2, tension: 0 }); }
    scatter.data.datasets = ds; scatter.update();
  }
  drawScatter();

  /* ---------- Barras ANOVA ---------- */
  new Chart($('#bars'), {
    type: 'bar',
    data: { labels: ['Recocido', 'Normalizado'], datasets: [
      { label: 'UTS promedio (MPa)', data: [K.utsRec, K.utsNorm], backgroundColor: '#38bdf8', borderRadius: 10 },
      { label: 'YS promedio (MPa)', data: [K.ysRec, K.ysNorm], backgroundColor: '#818cf8', borderRadius: 10 }] },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 1400, easing: 'easeOutBounce' },
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7 } }, tooltip: tip },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'MPa' } }, x: { grid: { display: false } } } }
  });

  /* ---------- Dona %C ---------- */
  new Chart($('#donut'), {
    type: 'doughnut',
    data: { labels: ['C promedio Recocido', 'C promedio Normalizado'], datasets: [{ data: [K.cRec, K.cNorm], backgroundColor: ['#fb7185', '#34d399'], borderWidth: 0, hoverOffset: 12 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '68%', animation: { animateRotate: true, duration: 1600 },
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7 } }, tooltip: { ...tip, callbacks: { label: c => ` ${c.parsed}% C` } } } }
  });

  /* ---------- Diagrama de fases Fe-Fe3C (esquemático) ---------- */
  const pc = $('#phase'), pctx = pc.getContext('2d');
  const XMAX = 1.4, TMIN = 400, TMAX = 1600;
  let lastC = 0.4;
  function drawPhase(c) {
    lastC = c;
    const dpr = devicePixelRatio || 1, w = pc.clientWidth, h = pc.clientHeight;
    if (!w) return;
    pc.width = w * dpr; pc.height = h * dpr; pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const L = 62, R = 16, T = 16, B = 46, pw = w - L - R, ph = h - T - B;
    const X = x => L + x / XMAX * pw, Y = t => T + (TMAX - t) / (TMAX - TMIN) * ph;
    const poly = (pts, fill) => { pctx.beginPath(); pts.forEach(([x, t], i) => i ? pctx.lineTo(X(x), Y(t)) : pctx.moveTo(X(x), Y(t))); pctx.closePath(); pctx.fillStyle = fill; pctx.fill(); };
    const line = (pts, col, wd = 2, dash = []) => { pctx.beginPath(); pctx.setLineDash(dash); pts.forEach(([x, t], i) => i ? pctx.lineTo(X(x), Y(t)) : pctx.moveTo(X(x), Y(t))); pctx.strokeStyle = col; pctx.lineWidth = wd; pctx.stroke(); pctx.setLineDash([]); };
    const acm = x => 727 + (x - 0.77) / (2.14 - 0.77) * (1147 - 727);
    const a3 = x => 912 - x / 0.77 * (912 - 727);
    const sol = x => x < .09 ? 1538 - x / .09 * 45 : x < .17 ? 1493 : 1493 - (x - .17) / (2.14 - .17) * 346;
    const liq = x => x < .53 ? 1538 - x / .53 * 45 : 1493 - (x - .53) / (4.3 - .53) * 346;
    const N = 40, xs = Array.from({ length: N + 1 }, (_, i) => i / N * XMAX);
    // regiones
    poly([[0, TMIN], [XMAX, TMIN], [XMAX, 727], [0, 727]], 'rgba(251,113,133,.10)');
    poly([[0, 727], [.77, 727], [0, 912]], 'rgba(129,140,248,.14)');
    poly([[0, 912], [.77, 727], [XMAX, acm(XMAX)], ...xs.slice().reverse().map(x => [x, sol(x)])], 'rgba(56,189,248,.12)');
    poly([...xs.map(x => [x, sol(x)]), ...xs.slice().reverse().map(x => [x, liq(x)])], 'rgba(251,191,36,.12)');
    poly([...xs.map(x => [x, liq(x)]), [XMAX, TMAX], [0, TMAX]], 'rgba(251,191,36,.05)');
    // rejilla y ejes
    pctx.font = '12px Inter'; pctx.fillStyle = '#8b9bb4'; pctx.strokeStyle = 'rgba(148,163,184,.12)'; pctx.lineWidth = 1; pctx.setLineDash([]);
    for (let t = 400; t <= 1600; t += 200) { pctx.beginPath(); pctx.moveTo(L, Y(t)); pctx.lineTo(L + pw, Y(t)); pctx.stroke(); pctx.textAlign = 'right'; pctx.fillText(t, L - 8, Y(t) + 4); }
    for (let x = 0; x <= 1.4001; x += .2) { pctx.textAlign = 'center'; pctx.fillText(x.toFixed(1), X(x), T + ph + 18); }
    pctx.fillText('Carbono (% en peso)', L + pw / 2, h - 8);
    pctx.save(); pctx.translate(14, T + ph / 2); pctx.rotate(-Math.PI / 2); pctx.fillText('Temperatura (°C)', 0, 0); pctx.restore();
    // líneas de transformación
    line([[0, 912], [.77, 727], [XMAX, acm(XMAX)]], '#38bdf8', 2.2);
    line([[0, 727], [XMAX, 727]], '#fb7185', 2.2);
    line(xs.map(x => [x, sol(x)]), '#fbbf24', 2); line(xs.map(x => [x, liq(x)]), '#fbbf24', 2);
    // etiquetas
    pctx.textAlign = 'center'; pctx.font = '600 12px Inter';
    const lab = (t, x, y, col = '#c3cee0') => { pctx.fillStyle = col; pctx.fillText(t, X(x), Y(y)); };
    lab('Austenita (γ)', .9, 1000, '#7dd3fc'); lab('α + γ', .15, 800, '#a5b4fc');
    lab('Ferrita + Perlita', .3, 560); lab('Perlita + Fe₃C', 1.1, 560); lab('γ + Fe₃C', 1.15, 800, '#7dd3fc');
    lab('Líquido', .7, 1560, '#fcd34d'); lab('L + γ', 1.05, 1440, '#fcd34d');
    pctx.font = '11px Inter'; pctx.textAlign = 'left';
    pctx.fillStyle = '#38bdf8'; pctx.fillText('A₃', X(.12), Y(870) - 4); pctx.fillText('Acm', X(1.0), Y(acm(1.0)) - 8);
    pctx.fillStyle = '#fb7185'; pctx.fillText('A₁ = 727 °C', X(1.03), Y(727) + 15);
    pctx.fillStyle = '#34d399'; pctx.fillText('Eutectoide 0.77 %', X(.77) + 6, Y(727) + 28);
    // marcador del %C
    const cx0 = X(c);
    pctx.setLineDash([6, 5]); pctx.strokeStyle = '#34d399'; pctx.lineWidth = 2; pctx.beginPath(); pctx.moveTo(cx0, T); pctx.lineTo(cx0, T + ph); pctx.stroke(); pctx.setLineDash([]);
    const tc = c <= .77 ? a3(c) : acm(c);
    [[tc, '#38bdf8'], [727, '#fb7185']].forEach(([t, col]) => { pctx.beginPath(); pctx.arc(cx0, Y(t), 6, 0, 7); pctx.fillStyle = col; pctx.fill(); pctx.strokeStyle = '#fff'; pctx.lineWidth = 2; pctx.stroke(); });
    pctx.fillStyle = '#34d399'; pctx.font = '700 12px Inter'; pctx.textAlign = c > 1 ? 'right' : 'left';
    pctx.fillText(`${c.toFixed(2)} % C · ${c <= .77 ? 'hipo' : 'hiper'}eutectoide`, cx0 + (c > 1 ? -10 : 10), T + 14);
    pctx.textAlign = c > 1 ? 'right' : 'left';
    pctx.fillStyle = '#7dd3fc'; pctx.font = '11px Inter'; pctx.fillText(`${c <= .77 ? 'A₃' : 'Acm'} ≈ ${Math.round(tc)} °C`, cx0 + (c > 1 ? -10 : 10), T + 30);
  }
  addEventListener('resize', () => drawPhase(lastC));

  /* ---------- Estimador interactivo ---------- */
  const sel = $('#proc'), rng = $('#carb');
  Object.keys(D.procesos).forEach(n => sel.add(new Option(n, n)));
  const fits = Object.fromEntries(Object.entries(D.procesos).map(([n, o]) => [n, fit(o.pts)]));
  const C = 2 * Math.PI * 90, fg = $('.gauge .fg');
  fg.style.strokeDasharray = C;
  function est() {
    const c = +rng.value, f = fits[sel.value], uts = Math.round(f.m * c + f.b);
    $('#cv').textContent = c.toFixed(2) + ' %';
    rng.style.setProperty('--p', ((c - rng.min) / (rng.max - rng.min) * 100) + '%');
    drawPhase(c);
    $('#utsOut').textContent = uts;
    fg.style.strokeDashoffset = C * (1 - Math.min(uts / 1000, 1));
    const fer = Math.max(0, Math.min(100, 100 - c / 0.77 * 100)), per = 100 - fer;
    $('#mat').innerHTML = c < .77 ? `Microestructura aprox.: <b>${fer.toFixed(0)}% ferrita</b> + <b>${per.toFixed(0)}% perlita</b> (hipoeutectoide)`
      : `Acero <b>hipereutectoide</b>: perlita + cementita proeutectoide`;
  }
  sel.onchange = rng.oninput = est; est();
  $('#estNote').textContent = 'Estimación lineal calculada sobre la muestra del tablero; no sustituye ensayos reales.';

  /* ---------- Pestañas ---------- */
  $$('.tab').forEach(t => t.onclick = () => {
    $$('.tab,.pane').forEach(e => e.classList.remove('on'));
    t.classList.add('on'); $('#' + t.dataset.p).classList.add('on'); });
})();
