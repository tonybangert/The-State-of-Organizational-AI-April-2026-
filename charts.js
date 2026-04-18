/* ============================================================
   CHARTS.JS — Pure SVG data graphics for the field report
   All charts render into a target element by id or reference.
   They lazy-reveal via IntersectionObserver.
   ============================================================ */

(function () {
  const NAVY = '#102d50';
  const NAVY_LIGHT = '#2a4a73';
  const ORANGE = '#faa840';
  const ORANGE_DEEP = '#e8912a';
  const RED = '#ef4537';
  const CREAM = '#faf8f5';
  const GRAY_300 = '#cbd5e1';
  const GRAY_500 = '#64748b';
  const GRAY_700 = '#475569';
  const INK = '#0a1628';

  // --- Helpers ---
  const svgNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(svgNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function svg(w, h, parent) {
    const s = el('svg', {
      viewBox: `0 0 ${w} ${h}`,
      width: '100%',
      preserveAspectRatio: 'xMidYMid meet',
    });
    if (parent) parent.appendChild(s);
    return s;
  }
  function txt(parent, x, y, str, attrs = {}) {
    const t = el('text', { x, y, ...attrs }, parent);
    t.textContent = str;
    return t;
  }

  // =================================================================
  // HERO DIAGRAM — Adoption curve distribution
  // Horizontal axis: AI maturity (0–100)
  // Shows where organizations sit; majority clustered left-of-center
  // =================================================================
  function drawHeroDiagram(container) {
    // Headline/caption rendered as HTML above/below SVG for guaranteed readability
    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom:20px;';
    header.innerHTML = `
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#475569;font-weight:600;margin-bottom:8px;">Where organizations sit today</div>
      <div style="font-family:'DM Serif Display',serif;font-size:20px;color:#102d50;font-style:italic;line-height:1.2;">Distribution across AI maturity</div>
      <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#64748b;margin-top:4px;">Based on dozens of engagements, Q2 2026</div>
    `;
    container.appendChild(header);

    const W = 500, H = 260;
    const s = svg(W, H, container);

    const padL = 30, padR = 30, padT = 60, padB = 50;
    const x0 = padL, x1 = W - padR;
    const y0 = H - padB;

    // Data
    const points = [];
    const N = 80;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const base = Math.exp(-Math.pow((t - 0.32) * 3.2, 2));
      const tail = Math.exp(-Math.pow((t - 0.78) * 4.5, 2)) * 0.35;
      points.push({ t, y: base + tail });
    }
    const maxY = Math.max(...points.map(p => p.y));
    const px = t => x0 + t * (x1 - x0);
    const py = y => y0 - (y / maxY) * (y0 - padT);

    const defs = el('defs', {}, s);
    const grad = el('linearGradient', { id: 'heroGrad', x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': NAVY, 'stop-opacity': 0.85 }, grad);
    el('stop', { offset: 1, 'stop-color': NAVY, 'stop-opacity': 0.06 }, grad);

    // "Most orgs" zone
    const zoneX1 = px(0.18), zoneX2 = px(0.58);
    el('rect', { x: zoneX1, y: padT, width: zoneX2 - zoneX1, height: y0 - padT, fill: ORANGE, opacity: 0.08 }, s);

    // Area
    let d = `M ${px(0)} ${y0} `;
    points.forEach(p => { d += `L ${px(p.t)} ${py(p.y)} `; });
    d += `L ${px(1)} ${y0} Z`;
    el('path', { d, fill: 'url(#heroGrad)', opacity: 0.9 }, s);

    // Curve
    let ld = `M ${px(points[0].t)} ${py(points[0].y)} `;
    points.forEach(p => { ld += `L ${px(p.t)} ${py(p.y)} `; });
    el('path', { d: ld, fill: 'none', stroke: NAVY, 'stroke-width': 2, class: 'line-draw', style: `--len:${N * 8}` }, s);

    // Baseline
    el('line', { x1: x0, y1: y0, x2: x1, y2: y0, stroke: NAVY, 'stroke-width': 1 }, s);

    // Mode dot
    el('circle', { cx: px(0.32), cy: py(maxY), r: 5, fill: ORANGE_DEEP }, s);
    el('circle', { cx: px(0.32), cy: py(maxY), r: 10, fill: 'none', stroke: ORANGE_DEEP, 'stroke-width': 1, opacity: 0.4 }, s);

    // Frontier dot
    el('circle', { cx: px(0.88), cy: py(points[Math.round(0.88 * (N - 1))].y), r: 4, fill: RED }, s);

    // Axis ticks — larger, outside
    const ticks = [
      { t: 0.05, label: 'No strategy' },
      { t: 0.32, label: 'Assessing' },
      { t: 0.55, label: 'Piloting' },
      { t: 0.78, label: 'Integrated' },
      { t: 0.95, label: 'Frontier' },
    ];
    ticks.forEach(tk => {
      const x = px(tk.t);
      el('line', { x1: x, y1: y0, x2: x, y2: y0 + 5, stroke: NAVY, 'stroke-width': 1 }, s);
      txt(s, x, y0 + 20, tk.label, {
        'font-family': 'DM Sans, sans-serif', 'font-size': 12, fill: GRAY_700, 'text-anchor': 'middle', 'font-weight': 500,
      });
    });

    // Caption below — HTML, with orange/red dot legend mapping to chart points
    const caption = document.createElement('div');
    caption.style.cssText = 'margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:18px;';
    caption.innerHTML = `
      <div style="display:flex;gap:10px;align-items:flex-start;border-left:2px solid #e8912a;padding-left:12px;">
        <div>
          <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#102d50;font-weight:600;margin-bottom:2px;">Mode sits here</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:11.5px;color:#475569;line-height:1.4;">Strategy in flux, workforce already moving</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start;border-left:2px solid #ef4537;padding-left:12px;">
        <div>
          <div style="font-family:'DM Sans',sans-serif;font-size:12px;color:#102d50;font-weight:600;margin-bottom:2px;">A handful at the frontier</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:11.5px;color:#475569;line-height:1.4;">And the most worried of all</div>
        </div>
      </div>
    `;
    container.appendChild(caption);
  }

  // =================================================================
  // PATTERN MINI-DIAGRAMS (5 patterns, each a small conceptual viz)
  // =================================================================

  // P01: Title change vs mandate gap — labels above bars to prevent clipping
  function drawP01(container) {
    const W = 240, H = 140;
    const s = svg(W, H, container);
    const items = [
      { label: 'TITLE CHANGE', value: 0.92, color: NAVY },
      { label: 'MANDATE CLARITY', value: 0.22, color: ORANGE_DEEP },
      { label: 'ROADMAP', value: 0.14, color: RED },
    ];
    const barH = 14, rowH = 40;
    const x0 = 10, maxBar = W - 20;
    items.forEach((it, i) => {
      const yLabel = 14 + i * rowH;
      const yBar = yLabel + 8;
      txt(s, x0, yLabel, it.label, {
        'font-family': 'JetBrains Mono, monospace', 'font-size': 9, fill: GRAY_700, 'letter-spacing': 1.2, 'font-weight': 600,
      });
      el('rect', { x: x0, y: yBar, width: maxBar, height: barH, fill: 'none', stroke: GRAY_300, 'stroke-width': 1 }, s);
      const fg = el('g', { class: 'bar-fill' }, s);
      el('rect', { x: x0, y: yBar, width: maxBar * it.value, height: barH, fill: it.color }, fg);
    });
  }

  // P02: Two timelines — leadership slow, workforce fast
  function drawP02(container) {
    const W = 240, H = 120;
    const s = svg(W, H, container);
    const x0 = 10, x1 = W - 10;

    // Top line: leadership strategy (slow, stopped early)
    const y1 = 35;
    txt(s, x0, y1 - 10, 'LEADERSHIP', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, 'letter-spacing': 1.5, fill: GRAY_500, 'font-weight': 600,
    });
    el('line', { x1: x0, y1, x2: x1, y2: y1, stroke: GRAY_300, 'stroke-width': 1, 'stroke-dasharray': '2,3' }, s);
    const lg = el('g', { class: 'bar-fill' }, s);
    el('line', { x1: x0, y1, x2: x0 + (x1 - x0) * 0.28, y2: y1, stroke: NAVY, 'stroke-width': 3 }, lg);
    el('circle', { cx: x0 + (x1 - x0) * 0.28, cy: y1, r: 4, fill: NAVY }, s);
    txt(s, x0 + (x1 - x0) * 0.28 + 8, y1 + 4, 'Strategy', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 10, fill: GRAY_700,
    });

    // Bottom line: workforce usage (fast, already at end)
    const y2 = 85;
    txt(s, x0, y2 - 10, 'WORKFORCE', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, 'letter-spacing': 1.5, fill: ORANGE_DEEP, 'font-weight': 600,
    });
    el('line', { x1: x0, y1: y2, x2: x1, y2: y2, stroke: GRAY_300, 'stroke-width': 1, 'stroke-dasharray': '2,3' }, s);
    const wg = el('g', { class: 'bar-fill' }, s);
    el('line', { x1: x0, y1: y2, x2: x1, y2: y2, stroke: ORANGE_DEEP, 'stroke-width': 3 }, wg);
    el('circle', { cx: x1, cy: y2, r: 4, fill: ORANGE_DEEP }, s);

    // Gap bracket
    const bx = x0 + (x1 - x0) * 0.28 + 12;
    const bx2 = x1 - 8;
    el('path', {
      d: `M ${bx} 50 L ${bx} 58 L ${bx2} 58 L ${bx2} 50`,
      fill: 'none', stroke: RED, 'stroke-width': 1.2,
    }, s);
    txt(s, (bx + bx2) / 2, 70, 'GOVERNANCE GAP', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 8, 'letter-spacing': 1.5,
      fill: RED, 'text-anchor': 'middle', 'font-weight': 600,
    });
  }

  // P03: Productivity divergence — two lines diverging
  function drawP03(container) {
    const W = 240, H = 120;
    const s = svg(W, H, container);
    const x0 = 10, x1 = W - 10;
    const yMid = 60;

    el('line', { x1: x0, y1: yMid, x2: x1, y2: yMid, stroke: GRAY_300, 'stroke-width': 1, 'stroke-dasharray': '2,3' }, s);

    // Upper line — super-users, +9h
    const ptsUp = [[x0, yMid], [x0 + 50, yMid - 4], [x0 + 120, yMid - 18], [x1, yMid - 42]];
    let du = `M ${ptsUp[0][0]} ${ptsUp[0][1]} `;
    ptsUp.slice(1).forEach(p => du += `L ${p[0]} ${p[1]} `);
    el('path', { d: du, fill: 'none', stroke: ORANGE_DEEP, 'stroke-width': 2.5, 'stroke-linecap': 'round', class: 'line-draw', style: '--len:300' }, s);
    el('circle', { cx: x1, cy: yMid - 42, r: 4, fill: ORANGE_DEEP }, s);
    txt(s, x1 - 6, yMid - 50, '+9h/wk', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 10, fill: ORANGE_DEEP,
      'text-anchor': 'end', 'font-weight': 600,
    });
    txt(s, x0, 20, 'SUPER-USERS', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, 'letter-spacing': 1.5, fill: ORANGE_DEEP, 'font-weight': 600,
    });

    // Lower line — laggards
    const ptsDown = [[x0, yMid], [x0 + 50, yMid + 3], [x0 + 120, yMid + 8], [x1, yMid + 14]];
    let dd = `M ${ptsDown[0][0]} ${ptsDown[0][1]} `;
    ptsDown.slice(1).forEach(p => dd += `L ${p[0]} ${p[1]} `);
    el('path', { d: dd, fill: 'none', stroke: GRAY_500, 'stroke-width': 2, 'stroke-linecap': 'round', class: 'line-draw', style: '--len:300' }, s);
    el('circle', { cx: x1, cy: yMid + 14, r: 4, fill: GRAY_500 }, s);
    txt(s, x1 - 6, yMid + 28, '+2h/wk', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 10, fill: GRAY_700,
      'text-anchor': 'end', 'font-weight': 600,
    });
    txt(s, x0, H - 8, 'LAGGARDS', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, 'letter-spacing': 1.5, fill: GRAY_700, 'font-weight': 600,
    });
  }

  // P04: Single vendor vs coordination layer
  function drawP04(container) {
    const W = 240, H = 120;
    const s = svg(W, H, container);

    // Left: single monolithic block (ticked off)
    const lx = 30, ly = 28;
    el('rect', { x: lx, y: ly, width: 60, height: 60, fill: GRAY_300, opacity: 0.25, stroke: GRAY_500, 'stroke-width': 1.5, 'stroke-dasharray': '4,3' }, s);
    txt(s, lx + 30, ly + 38, 'ONE', {
      'font-family': 'DM Serif Display, serif', 'font-size': 15, fill: GRAY_500, 'text-anchor': 'middle',
    });
    txt(s, lx + 30, ly - 8, 'SaaS mindset', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, 'letter-spacing': 1.2, fill: GRAY_500, 'text-anchor': 'middle', 'font-weight': 600,
    });
    // Deprecation mark — small X in upper-right corner instead of diagonal through the word
    txt(s, lx + 60 + 4, ly + 4, '✕', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 12, fill: RED, 'font-weight': 700,
    });

    // Right: orchestration fan-out
    const rx = 165, ry = 58;
    const nodes = [
      { x: rx, y: ry },
      { x: rx - 40, y: ry - 28 },
      { x: rx - 40, y: ry + 28 },
      { x: rx + 22, y: ry - 28 },
      { x: rx + 22, y: ry + 28 },
    ];
    // Edges
    const fg = el('g', { class: 'bar-fill' }, s);
    nodes.slice(1).forEach(n => {
      el('line', { x1: rx, y1: ry, x2: n.x, y2: n.y, stroke: NAVY, 'stroke-width': 1.2 }, fg);
    });
    // Center node
    el('circle', { cx: rx, cy: ry, r: 10, fill: ORANGE_DEEP }, s);
    // Outer nodes
    nodes.slice(1).forEach(n => {
      el('circle', { cx: n.x, cy: n.y, r: 5, fill: NAVY }, s);
    });
    txt(s, rx, ry - 38, 'Orchestration', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, 'letter-spacing': 1.2, fill: NAVY, 'text-anchor': 'middle', 'font-weight': 600,
    });
    txt(s, rx, H - 8, 'Switch, combine, route', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 9.5, fill: GRAY_700, 'text-anchor': 'middle', 'font-style': 'italic',
    });
  }

  // P05: Exhaustion meter — zigzag line trending up
  function drawP05(container) {
    const W = 240, H = 120;
    const s = svg(W, H, container);
    const x0 = 10, x1 = W - 10, y0 = 95, y1 = 25;

    // baseline
    el('line', { x1: x0, y1: y0, x2: x1, y2: y0, stroke: GRAY_300, 'stroke-width': 1 }, s);

    // noisy upward line
    const pts = [];
    const N = 24;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const base = y0 - t * (y0 - y1);
      const noise = (Math.sin(i * 1.7) + Math.sin(i * 0.9)) * 5;
      pts.push([x0 + t * (x1 - x0), base + noise]);
    }
    let d = `M ${pts[0][0]} ${pts[0][1]} `;
    pts.slice(1).forEach(p => d += `L ${p[0]} ${p[1]} `);
    el('path', { d, fill: 'none', stroke: RED, 'stroke-width': 2, class: 'line-draw', style: '--len:400' }, s);
    el('circle', { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 4, fill: RED }, s);

    txt(s, x0, 18, 'VOLUME OF CHANGE', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, 'letter-spacing': 1.5, fill: GRAY_700, 'font-weight': 600,
    });
    txt(s, x1, pts[pts.length - 1][1] - 10, 'Next 90 days', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 10, fill: RED, 'text-anchor': 'end', 'font-weight': 600,
    });
    txt(s, x0, y0 + 14, 'Today', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 10, fill: GRAY_500,
    });
  }

  // =================================================================
  // RESEARCH CHARTS
  // =================================================================

  // R1: Executive overwhelm — labels above bars so long copy never clips
  function drawR_Overwhelm(container) {
    const W = 520, H = 260;
    const s = svg(W, H, container);
    const padL = 20, padR = 60, padT = 16;

    const items = [
      { label: 'Say adopting AI is "tearing their company apart"', value: 54 },
      { label: 'Admit peers lack the knowledge to make AI decisions', value: 58 },
      { label: 'Expect board intervention over botched AI strategy', value: 60 },
    ];

    const labelH = 20, barH = 22, rowGap = 24;
    const rowH = labelH + barH + rowGap;
    const trackW = W - padL - padR;
    const scale = trackW / 100;

    items.forEach((it, i) => {
      const yLabel = padT + i * rowH + 12;
      const yBar = yLabel + 10;
      txt(s, padL, yLabel, it.label, {
        'font-family': 'DM Sans, sans-serif', 'font-size': 13, fill: INK, 'font-weight': 500,
      });
      el('rect', { x: padL, y: yBar, width: trackW, height: barH, fill: NAVY, opacity: 0.08 }, s);
      const g = el('g', { class: 'bar-fill' }, s);
      el('rect', { x: padL, y: yBar, width: it.value * scale, height: barH, fill: NAVY }, g);
      el('rect', { x: padL + it.value * scale - 3, y: yBar, width: 3, height: barH, fill: ORANGE }, g);
      txt(s, padL + it.value * scale + 8, yBar + barH * 0.72, `${it.value}%`, {
        'font-family': 'DM Serif Display, serif', 'font-size': 20, fill: NAVY, 'font-weight': 400,
      });
    });

    const axisY = padT + items.length * rowH + 2;
    el('line', { x1: padL, y1: axisY, x2: padL + trackW, y2: axisY, stroke: NAVY, 'stroke-width': 1 }, s);
    [0, 25, 50, 75, 100].forEach(v => {
      const x = padL + v * scale;
      txt(s, x, axisY + 14, `${v}`, {
        'font-family': 'JetBrains Mono, monospace', 'font-size': 9.5, fill: GRAY_500, 'text-anchor': 'middle',
      });
    });
  }

  // R2: Execution gap — stacked bar / gauge comparison
  function drawR_ExecGap(container) {
    const W = 520, H = 220;
    const s = svg(W, H, container);

    const items = [
      { label: 'AI tool access, YoY', value: 50, unit: '+', color: ORANGE_DEEP, max: 60, good: true },
      { label: 'Pilots moved to production', value: 25, unit: '%', color: NAVY, max: 100 },
      { label: 'Governance readiness', value: 30, unit: '%', color: NAVY, max: 100 },
      { label: 'Talent readiness', value: 20, unit: '%', color: RED, max: 100 },
    ];

    const padL = 210, padR = 70, padT = 18;
    const barH = 24, gap = 16;
    const trackW = W - padL - padR;

    items.forEach((it, i) => {
      const y = padT + i * (barH + gap);
      const pct = it.value / it.max;
      // track
      el('rect', { x: padL, y, width: trackW, height: barH, fill: NAVY, opacity: 0.08 }, s);
      // bar
      const g = el('g', { class: 'bar-fill' }, s);
      el('rect', { x: padL, y, width: trackW * pct, height: barH, fill: it.color }, g);
      // label
      txt(s, padL - 12, y + barH * 0.68, it.label, {
        'font-family': 'DM Sans, sans-serif', 'font-size': 12.5, fill: INK, 'text-anchor': 'end',
      });
      // value
      txt(s, padL + trackW + 10, y + barH * 0.68, `${it.unit === '+' ? '+' : ''}${it.value}${it.unit === '%' ? '%' : it.unit === '+' ? '%' : ''}`, {
        'font-family': 'DM Serif Display, serif', 'font-size': 18, fill: NAVY,
      });
    });

    // Note line
    txt(s, padL, padT + items.length * (barH + gap) + 16, 'Governance and talent both declined year over year.', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 11, fill: GRAY_700, 'font-style': 'italic',
    });
  }

  // R3: Shadow AI — pictogram only; stats rendered as HTML below the SVG
  function drawR_ShadowAI(container) {
    const W = 560, H = 170;
    const s = svg(W, H, container);

    const cols = 20, total = 100;
    const startX = 30, startY = 40;
    const dx = 19, dy = 22;
    const filled = 67;

    txt(s, startX, 22, '67 of every 100 executives believe a breach has already happened', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 13, fill: INK, 'font-weight': 600,
    });

    // Base grid: all 100 empty outlines anchor the "67 out of 100" frame from the start
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      el('circle', {
        cx: startX + c * dx,
        cy: startY + r * dy,
        r: 5.5,
        fill: 'none',
        stroke: GRAY_300,
        'stroke-width': 1.2,
      }, s);
    }
    // Red overlays: the 67 "breach" dots fill in sequentially on reveal
    const stagger = 18;
    for (let i = 0; i < filled; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      el('circle', {
        cx: startX + c * dx,
        cy: startY + r * dy,
        r: 5.5,
        fill: RED,
        stroke: RED,
        'stroke-width': 1.2,
        class: 'shadow-dot',
        style: `transition: opacity 380ms ease ${i * stagger}ms;`,
      }, s);
    }

    // HTML stats below the SVG — reliable layout, no SVG overlap issues
    const stats = document.createElement('div');
    stats.style.cssText = 'margin-top:18px;display:flex;flex-direction:column;gap:14px;';
    stats.innerHTML = `
      <div style="display:flex;gap:16px;align-items:baseline;border-top:1px solid #102d50;padding-top:10px;">
        <div style="font-family:'DM Serif Display',serif;font-size:26px;color:#102d50;line-height:1;min-width:60px;">35%</div>
        <div style="font-family:'DM Sans',sans-serif;font-size:13px;color:#475569;line-height:1.4;">have entered proprietary info into public AI tools</div>
      </div>
      <div style="display:flex;gap:16px;align-items:baseline;border-top:1px solid #102d50;padding-top:10px;">
        <div style="font-family:'DM Serif Display',serif;font-size:26px;color:#102d50;line-height:1;min-width:60px;">55%</div>
        <div style="font-family:'DM Sans',sans-serif;font-size:13px;color:#475569;line-height:1.4;">describe their org's AI use as a "chaotic free-for-all"</div>
      </div>
    `;
    container.appendChild(stats);
  }

  // R4: Workforce split — dumbbell/range chart
  function drawR_Workforce(container) {
    const W = 520, H = 260;
    const s = svg(W, H, container);

    // Hero number: 9h vs 2h (super-users vs laggards)
    const padL = 60, padR = 60, y1 = 70;
    const scale = (W - padL - padR) / 12;

    // Axis
    el('line', { x1: padL, y1, x2: padL + 12 * scale, y2: y1, stroke: GRAY_300, 'stroke-width': 1 }, s);
    [0, 3, 6, 9, 12].forEach(v => {
      const x = padL + v * scale;
      el('line', { x1: x, y1: y1 - 3, x2: x, y2: y1 + 3, stroke: GRAY_500, 'stroke-width': 1 }, s);
      txt(s, x, y1 + 18, `${v}h`, {
        'font-family': 'JetBrains Mono, monospace', 'font-size': 10, fill: GRAY_500, 'text-anchor': 'middle',
      });
    });

    // Dumbbell
    const lagX = padL + 2 * scale;
    const superX = padL + 9 * scale;
    el('line', { x1: lagX, y1, x2: superX, y2: y1, stroke: ORANGE_DEEP, 'stroke-width': 3, class: 'bar-fill' }, s);
    el('circle', { cx: lagX, cy: y1, r: 7, fill: GRAY_500 }, s);
    el('circle', { cx: superX, cy: y1, r: 9, fill: ORANGE_DEEP }, s);
    txt(s, lagX, y1 - 14, 'Laggards', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 11, fill: GRAY_700, 'text-anchor': 'middle', 'font-weight': 600,
    });
    txt(s, superX, y1 - 14, 'Super-users', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 11, fill: ORANGE_DEEP, 'text-anchor': 'middle', 'font-weight': 600,
    });
    txt(s, lagX, y1 - 28, '2h', {
      'font-family': 'DM Serif Display, serif', 'font-size': 18, fill: GRAY_500, 'text-anchor': 'middle',
    });
    txt(s, superX, y1 - 28, '9h', {
      'font-family': 'DM Serif Display, serif', 'font-size': 22, fill: NAVY, 'text-anchor': 'middle',
    });

    txt(s, W / 2, 140, 'saved per week — a 4.5× productivity gap', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 13, fill: INK, 'text-anchor': 'middle',
    });

    // Two consequence stats — explicit line1/line2 so no fragile parsing
    const stats = [
      { v: '77%', l1: 'of execs say', l2: "AI-refusers won't be promoted" },
      { v: '60%', l1: 'of companies plan', l2: 'layoffs for non-adopters' },
    ];
    stats.forEach((st, i) => {
      const x = 30 + i * 230;
      const y = 200;
      const boxW = 220;
      el('rect', { x, y, width: boxW, height: 48, fill: NAVY, opacity: 0.04 }, s);
      el('rect', { x, y, width: 3, height: 48, fill: RED }, s);
      txt(s, x + 14, y + 30, st.v, {
        'font-family': 'DM Serif Display, serif', 'font-size': 22, fill: NAVY,
      });
      txt(s, x + 68, y + 20, st.l1, {
        'font-family': 'DM Sans, sans-serif', 'font-size': 11, fill: GRAY_700, 'font-weight': 600,
      });
      txt(s, x + 68, y + 36, st.l2, {
        'font-family': 'DM Sans, sans-serif', 'font-size': 11, fill: GRAY_700,
      });
    });
  }

  // R5: Multi-model sprawl — stacked bar, year over year
  function drawR_MultiModel(container) {
    const W = 520, H = 220;
    const s = svg(W, H, container);

    // Two years: 2025, 2026. Each shows % of enterprises running 1, 2, 3+ model families
    const years = [
      { label: '2025', segments: [{ v: 12, c: GRAY_300, l: '1 model' }, { v: 20, c: NAVY_LIGHT, l: '2 models' }, { v: 68, c: NAVY, l: '3+ models' }] },
      { label: '2026', segments: [{ v: 6, c: GRAY_300, l: '1 model' }, { v: 13, c: NAVY_LIGHT, l: '2 models' }, { v: 81, c: ORANGE_DEEP, l: '3+ models' }] },
    ];

    const padL = 60, padR = 30, padT = 40, padB = 40;
    const trackW = W - padL - padR;
    const barH = 40, gap = 36;

    years.forEach((yr, i) => {
      const y = padT + i * (barH + gap);
      // Year label
      txt(s, padL - 12, y + barH * 0.65, yr.label, {
        'font-family': 'JetBrains Mono, monospace', 'font-size': 12, fill: NAVY, 'text-anchor': 'end', 'font-weight': 600,
      });
      let xCursor = padL;
      yr.segments.forEach(seg => {
        const w = (seg.v / 100) * trackW;
        const g = el('g', { class: 'bar-fill' }, s);
        el('rect', { x: xCursor, y, width: w, height: barH, fill: seg.c }, g);
        if (seg.v >= 10) {
          txt(s, xCursor + w / 2, y + barH * 0.58, `${seg.v}%`, {
            'font-family': 'DM Serif Display, serif', 'font-size': 16, fill: seg.c === GRAY_300 ? GRAY_700 : CREAM, 'text-anchor': 'middle',
          });
          txt(s, xCursor + w / 2, y + barH * 0.85, seg.l, {
            'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, fill: seg.c === GRAY_300 ? GRAY_700 : 'rgba(250,248,245,0.8)', 'text-anchor': 'middle', 'letter-spacing': 1,
          });
        }
        xCursor += w;
      });
    });

    // Callout arrow showing 68→81 — positioned with room for "+13 pts" label
    const y1 = padT + barH + 10;
    const y2 = padT + barH + gap + barH / 2;
    const xTarget = padL + trackW - 60;
    el('path', {
      d: `M ${xTarget} ${y1 - 6} Q ${xTarget + 18} ${(y1 + y2) / 2} ${xTarget} ${y2}`,
      fill: 'none', stroke: ORANGE_DEEP, 'stroke-width': 1.5, 'marker-end': 'url(#arrowO)',
    }, s);
    const defs = el('defs', {}, s);
    const mk = el('marker', { id: 'arrowO', viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
    el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: ORANGE_DEEP }, mk);

    txt(s, xTarget + 24, (y1 + y2) / 2 + 4, '+13 pts', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 11, fill: ORANGE_DEEP, 'font-weight': 600,
    });

    // Bottom callout
    txt(s, padL, H - 12, '1,445% surge in multi-agent inquiries · Gartner, Q1 2024 → Q2 2025', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 11, fill: GRAY_700, 'font-style': 'italic',
    });
  }

  // =================================================================
  // FORECAST CHARTS
  // =================================================================

  // F1: Pricing inversion — line going from flat to steep
  function drawF_Pricing(container) {
    const W = 340, H = 200;
    const s = svg(W, H, container);
    const padL = 40, padR = 20, padT = 30, padB = 40;
    const x0 = padL, x1 = W - padR;
    const y0 = H - padB, y1 = padT;

    // Y axis label
    txt(s, padL, padT - 12, 'COST / USER', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 9, 'letter-spacing': 1.5, fill: GRAY_700, 'font-weight': 600,
    });

    // Horizontal baseline
    el('line', { x1: x0, y1: y0, x2: x1, y2: y0, stroke: NAVY, 'stroke-width': 1 }, s);
    // Vertical baseline
    el('line', { x1: x0, y1: y0, x2: x0, y2: y1, stroke: NAVY, 'stroke-width': 1 }, s);

    // Dashed "flat-rate" line
    const flatY = y0 - 25;
    el('line', {
      x1: x0, y1: flatY, x2: x1, y2: flatY,
      stroke: GRAY_500, 'stroke-width': 1.5, 'stroke-dasharray': '5,4',
    }, s);
    txt(s, x0 + 8, flatY - 6, 'Flat-rate (old)', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 10, fill: GRAY_500, 'font-style': 'italic',
    });

    // New "usage" line — flat then steep climb
    const pts = [
      [x0, y0 - 25],
      [x0 + 90, y0 - 28],
      [x0 + 150, y0 - 45],
      [x0 + 210, y0 - 90],
      [x1, y0 - 140],
    ];
    let d = `M ${pts[0][0]} ${pts[0][1]} `;
    pts.slice(1).forEach(p => d += `L ${p[0]} ${p[1]} `);
    el('path', { d, fill: 'none', stroke: RED, 'stroke-width': 2.5, class: 'line-draw', style: '--len:400' }, s);
    el('circle', { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 4, fill: RED }, s);

    txt(s, x1 - 6, pts[pts.length - 1][1] - 8, '2×–3×', {
      'font-family': 'DM Serif Display, serif', 'font-size': 22, fill: RED, 'text-anchor': 'end',
    });

    // X-axis
    txt(s, x0, y0 + 18, 'Q2 26', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 9.5, fill: GRAY_700,
    });
    txt(s, x1, y0 + 18, '2027+', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 9.5, fill: GRAY_700, 'text-anchor': 'end',
    });

    // Shift marker
    const shiftX = x0 + 120;
    el('line', { x1: shiftX, y1: padT - 6, x2: shiftX, y2: y0, stroke: ORANGE_DEEP, 'stroke-width': 1, 'stroke-dasharray': '2,3' }, s);
    txt(s, shiftX + 4, padT + 2, 'Apr 14, 2026', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 9, fill: ORANGE_DEEP, 'font-weight': 600,
    });
    txt(s, shiftX + 4, padT + 14, 'Anthropic shifts pricing', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 10, fill: NAVY, 'font-weight': 600,
    });
  }

  // F2: Governance risk matrix — 2x2 quadrant
  function drawF_Governance(container) {
    const W = 340, H = 220;
    const s = svg(W, H, container);
    // Leave room at the top for the events caption and on the left for the rotated y-axis label
    const padL = 56, padR = 20, padT = 40, padB = 36;
    const x0 = padL, x1 = W - padR;
    const y0 = H - padB, y1 = padT;
    const midX = (x0 + x1) / 2, midY = (y0 + y1) / 2;

    // Events header above plot — no longer collides with the "Most orgs" dot
    txt(s, x0, y1 - 14, 'SEC · EU AI Act · +56% incidents YoY', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 9, fill: NAVY, 'font-weight': 600, 'letter-spacing': 0.5,
    });

    // Quadrant fills
    el('rect', { x: x0, y: y1, width: midX - x0, height: midY - y1, fill: RED, opacity: 0.08 }, s);
    el('rect', { x: midX, y: y1, width: x1 - midX, height: midY - y1, fill: NAVY, opacity: 0.04 }, s);
    el('rect', { x: x0, y: midY, width: midX - x0, height: y0 - midY, fill: NAVY, opacity: 0.02 }, s);
    el('rect', { x: midX, y: midY, width: x1 - midX, height: y0 - midY, fill: ORANGE, opacity: 0.08 }, s);

    // Axes
    el('line', { x1: x0, y1: y0, x2: x1, y2: y0, stroke: NAVY, 'stroke-width': 1 }, s);
    el('line', { x1: x0, y1: y1, x2: x0, y2: y0, stroke: NAVY, 'stroke-width': 1 }, s);
    el('line', { x1: midX, y1: y1, x2: midX, y2: y0, stroke: NAVY, 'stroke-width': 0.5, 'stroke-dasharray': '2,3' }, s);
    el('line', { x1: x0, y1: midY, x2: x1, y2: midY, stroke: NAVY, 'stroke-width': 0.5, 'stroke-dasharray': '2,3' }, s);

    // Y-axis label — rotate around its own anchor point so the full word fits inside padL
    const yAxisX = padL - 18, yAxisY = midY;
    txt(s, yAxisX, yAxisY, 'REGULATORY PRESSURE', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, 'letter-spacing': 1.2, fill: GRAY_700, 'font-weight': 600, 'text-anchor': 'middle', transform: `rotate(-90, ${yAxisX}, ${yAxisY})`,
    });
    txt(s, midX, y0 + 20, 'ORG READINESS →', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, 'letter-spacing': 1.2, fill: GRAY_700, 'font-weight': 600, 'text-anchor': 'middle',
    });

    // "Most orgs" plotted high-pressure / low-readiness (upper-left danger zone)
    const danger = { x: x0 + (midX - x0) * 0.5, y: y1 + (midY - y1) * 0.55 };
    el('circle', { cx: danger.x, cy: danger.y, r: 12, fill: RED, opacity: 0.4 }, s);
    el('circle', { cx: danger.x, cy: danger.y, r: 6, fill: RED }, s);
    txt(s, danger.x, danger.y + 24, 'Most orgs', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 11, fill: RED, 'text-anchor': 'middle', 'font-weight': 700,
    });

    // "Leaders" plotted low-pressure / high-readiness
    const leaders = { x: midX + (x1 - midX) * 0.65, y: midY + (y0 - midY) * 0.35 };
    el('circle', { cx: leaders.x, cy: leaders.y, r: 8, fill: ORANGE_DEEP, opacity: 0.4 }, s);
    el('circle', { cx: leaders.x, cy: leaders.y, r: 4, fill: ORANGE_DEEP }, s);
    txt(s, leaders.x, leaders.y - 14, 'Leaders', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 11, fill: ORANGE_DEEP, 'text-anchor': 'middle', 'font-weight': 700,
    });
  }

  // F3: Coordination moat — agentic growth
  function drawF_Coord(container) {
    const W = 340, H = 200;
    const s = svg(W, H, container);
    const padL = 40, padR = 20, padT = 30, padB = 40;
    const x0 = padL, x1 = W - padR;
    const y0 = H - padB, y1 = padT;

    txt(s, padL, padT - 12, 'AUTONOMOUS DECISIONS / DAY', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 9, 'letter-spacing': 1.2, fill: GRAY_700, 'font-weight': 600,
    });

    // Axis
    el('line', { x1: x0, y1: y0, x2: x1, y2: y0, stroke: NAVY, 'stroke-width': 1 }, s);
    el('line', { x1: x0, y1: y0, x2: x0, y2: y1, stroke: NAVY, 'stroke-width': 1 }, s);

    // Data points 2026 -> 2028
    const pts = [
      { year: '2026', val: 0, pct: '~0%' },
      { year: '2027', val: 0.4, pct: '' },
      { year: '2028', val: 1.0, pct: '15%' },
    ];
    const px = i => x0 + (i / (pts.length - 1)) * (x1 - x0);
    const py = v => y0 - v * (y0 - y1) * 0.85;

    // Area
    let ad = `M ${px(0)} ${y0} `;
    pts.forEach((p, i) => ad += `L ${px(i)} ${py(p.val)} `);
    ad += `L ${px(pts.length - 1)} ${y0} Z`;
    el('path', { d: ad, fill: NAVY, opacity: 0.12, class: 'bar-fill' }, s);

    // Line
    let ld = '';
    pts.forEach((p, i) => ld += `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(p.val)} `);
    el('path', { d: ld, fill: 'none', stroke: NAVY, 'stroke-width': 2.5, class: 'line-draw', style: '--len:300' }, s);

    // Dots + labels
    pts.forEach((p, i) => {
      el('circle', { cx: px(i), cy: py(p.val), r: 5, fill: i === pts.length - 1 ? ORANGE_DEEP : NAVY }, s);
      txt(s, px(i), y0 + 18, p.year, {
        'font-family': 'JetBrains Mono, monospace', 'font-size': 10, fill: GRAY_700, 'text-anchor': 'middle',
      });
      if (p.pct) {
        txt(s, px(i), py(p.val) - 10, p.pct, {
          'font-family': 'DM Serif Display, serif', 'font-size': 18, fill: i === pts.length - 1 ? ORANGE_DEEP : NAVY, 'text-anchor': 'middle',
        });
      }
    });

    txt(s, x1 - 4, y0 - 10, 'Gartner', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 10, fill: GRAY_500, 'text-anchor': 'end', 'font-style': 'italic',
    });
  }

  // F4: Moral drift — two diverging lines (intended vs actual)
  function drawF_Drift(container) {
    const W = 340, H = 200;
    const s = svg(W, H, container);
    const padL = 30, padR = 20, padT = 30, padB = 35;
    const x0 = padL, x1 = W - padR;
    const y0 = H - padB, y1 = padT;
    const midY = (y0 + y1) / 2;

    txt(s, padL, padT - 12, 'AI BEHAVIOR OVER TIME', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 9, 'letter-spacing': 1.2, fill: GRAY_700, 'font-weight': 600,
    });

    // Intended line — flat
    el('line', {
      x1: x0, y1: midY, x2: x1, y2: midY,
      stroke: NAVY, 'stroke-width': 2, 'stroke-dasharray': '4,3', class: 'bar-fill',
    }, s);
    txt(s, x0 + 4, midY - 6, 'Intended behavior', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 10, fill: NAVY, 'font-weight': 600,
    });

    // Actual — drifts down/away
    const pts = [];
    const N = 30;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const base = midY + Math.pow(t, 2) * 45;
      const noise = Math.sin(i * 0.9) * 2 + Math.sin(i * 0.4) * 3;
      pts.push([x0 + t * (x1 - x0), base + noise]);
    }
    let d = `M ${pts[0][0]} ${pts[0][1]} `;
    pts.slice(1).forEach(p => d += `L ${p[0]} ${p[1]} `);
    el('path', { d, fill: 'none', stroke: RED, 'stroke-width': 2, class: 'line-draw', style: '--len:400' }, s);

    // Endpoint
    el('circle', { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 4, fill: RED }, s);
    txt(s, pts[pts.length - 1][0] - 6, pts[pts.length - 1][1] + 16, 'Actual drift', {
      'font-family': 'DM Sans, sans-serif', 'font-size': 10, fill: RED, 'text-anchor': 'end', 'font-weight': 600,
    });

    // Gap annotation
    const midPtX = pts[Math.floor(N * 0.75)][0];
    const midPtY = pts[Math.floor(N * 0.75)][1];
    el('line', { x1: midPtX, y1: midY, x2: midPtX, y2: midPtY, stroke: ORANGE_DEEP, 'stroke-width': 1.2 }, s);
    el('line', { x1: midPtX - 4, y1: midY, x2: midPtX + 4, y2: midY, stroke: ORANGE_DEEP, 'stroke-width': 1.2 }, s);
    el('line', { x1: midPtX - 4, y1: midPtY, x2: midPtX + 4, y2: midPtY, stroke: ORANGE_DEEP, 'stroke-width': 1.2 }, s);
    txt(s, midPtX + 8, (midY + midPtY) / 2 + 4, 'GAP', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 9, 'letter-spacing': 1.5, fill: ORANGE_DEEP, 'font-weight': 600,
    });

    // Timeline
    txt(s, x0, y0 + 18, 'Deploy', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 9, fill: GRAY_500,
    });
    txt(s, x1, y0 + 18, 'Customer notices', {
      'font-family': 'JetBrains Mono, monospace', 'font-size': 9, fill: GRAY_500, 'text-anchor': 'end',
    });
    el('line', { x1: x0, y1: y0, x2: x1, y2: y0, stroke: NAVY, 'stroke-width': 1 }, s);
  }

  // =================================================================
  // STAT STRIP — Big number with mini-context
  // =================================================================
  function drawStatContext_A(container) {
    // Pricing arrow
    const W = 200, H = 50;
    const s = svg(W, H, container);
    el('line', { x1: 10, y1: 40, x2: 30, y2: 40, stroke: GRAY_500, 'stroke-width': 2 }, s);
    el('line', { x1: 30, y1: 40, x2: 110, y2: 10, stroke: ORANGE, 'stroke-width': 2.5, class: 'line-draw', style: '--len:90' }, s);
    el('circle', { cx: 30, cy: 40, r: 3, fill: GRAY_500 }, s);
    el('circle', { cx: 110, cy: 10, r: 4, fill: ORANGE }, s);
    txt(s, 10, 20, 'FLAT', { 'font-family': 'JetBrains Mono, monospace', 'font-size': 9, fill: 'rgba(250,248,245,0.5)', 'letter-spacing': 1.5 });
    txt(s, 120, 14, 'USAGE', { 'font-family': 'JetBrains Mono, monospace', 'font-size': 9, fill: ORANGE, 'letter-spacing': 1.5, 'font-weight': 600 });
  }

  function drawStatContext_B(container) {
    // Multi-agent surge
    const W = 200, H = 50;
    const s = svg(W, H, container);
    const bars = [3, 6, 10, 18, 30, 45];
    bars.forEach((b, i) => {
      const x = 10 + i * 30;
      const h = b;
      const g = el('g', { class: 'bar-fill' }, s);
      el('rect', { x, y: 45 - h, width: 20, height: h, fill: i === bars.length - 1 ? ORANGE : 'rgba(250,248,245,0.4)' }, g);
    });
  }

  function drawStatContext_C(container) {
    // Silos — broken apart boxes
    const W = 200, H = 50;
    const s = svg(W, H, container);
    const boxes = [
      { x: 10, y: 14 }, { x: 48, y: 8 }, { x: 86, y: 18 }, { x: 124, y: 12 }, { x: 162, y: 22 },
    ];
    boxes.forEach((b, i) => {
      el('rect', { x: b.x, y: b.y, width: 24, height: 24, fill: 'none', stroke: i === 2 ? ORANGE : 'rgba(250,248,245,0.4)', 'stroke-width': 1.5 }, s);
    });
  }

  function drawStatContext_D(container) {
    // Readiness declining
    const W = 200, H = 54;
    const s = svg(W, H, container);
    el('line', { x1: 10, y1: 18, x2: 90, y2: 32, stroke: 'rgba(250,248,245,0.4)', 'stroke-width': 2 }, s);
    el('line', { x1: 90, y1: 32, x2: 190, y2: 42, stroke: ORANGE, 'stroke-width': 2.5, class: 'line-draw', style: '--len:110' }, s);
    el('circle', { cx: 10, cy: 18, r: 3, fill: 'rgba(250,248,245,0.4)' }, s);
    el('circle', { cx: 190, cy: 42, r: 4, fill: ORANGE }, s);
    txt(s, 10, 12, 'PRIOR', { 'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, fill: 'rgba(250,248,245,0.5)', 'letter-spacing': 1.5 });
    txt(s, 190, 12, 'NOW', { 'font-family': 'JetBrains Mono, monospace', 'font-size': 8.5, fill: ORANGE, 'letter-spacing': 1.5, 'text-anchor': 'end', 'font-weight': 600 });
  }

  // =================================================================
  // INIT — wire up to elements, observe for reveals
  // =================================================================
  function init() {
    const registry = [
      ['hero-diagram', drawHeroDiagram],
      ['chart-p01', drawP01],
      ['chart-p02', drawP02],
      ['chart-p03', drawP03],
      ['chart-p04', drawP04],
      ['chart-p05', drawP05],
      ['chart-r1', drawR_Overwhelm],
      ['chart-r2', drawR_ExecGap],
      ['chart-r3', drawR_ShadowAI],
      ['chart-r4', drawR_Workforce],
      ['chart-r5', drawR_MultiModel],
      ['chart-f1', drawF_Pricing],
      ['chart-f2', drawF_Governance],
      ['chart-f3', drawF_Coord],
      ['chart-f4', drawF_Drift],
      ['stat-ctx-a', drawStatContext_A],
      ['stat-ctx-b', drawStatContext_B],
      ['stat-ctx-c', drawStatContext_C],
      ['stat-ctx-d', drawStatContext_D],
    ];
    registry.forEach(([id, fn]) => {
      const n = document.getElementById(id);
      if (n) {
        try { fn(n); } catch (e) { console.error('chart fail', id, e); }
      }
    });

    // Intersection observer for reveals
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(n => io.observe(n));

    // Count-up animation
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.count-up').forEach(n => cio.observe(n));
  }

  function animateCount(node) {
    const target = parseFloat(node.dataset.target);
    const suffix = node.dataset.suffix || '';
    const prefix = node.dataset.prefix || '';
    const decimals = parseInt(node.dataset.decimals || '0', 10);
    const duration = 1400;
    const start = performance.now();
    const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = `${prefix}${fmt.format(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
