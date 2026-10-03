/* Fair Metal — core behaviour shared by every page.
   Conventions (see DESIGN.md): nothing here is required to read the page; without JS all content is
   visible. Hover rules live in CSS inside @media (hover: hover). Reduced motion renders final states. */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = window.matchMedia('(min-width: 900px)');
  const richMotion = () => !reduceMotion.matches && desktop.matches && finePointer.matches;
  const icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="assets/img/icons.svg#${id}"/></svg>`;

  const FM = (window.FM = window.FM || {});
  FM.icon = icon;

  /* ---------- Header: solid after scroll, hides on scroll down, shows on scroll up ---------- */
  const header = $('.header');
  if (header) {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      const menuOpen = document.body.classList.contains('menu-open');
      if (!menuOpen) {
        if (y > lastY + 6 && y > 240) header.classList.add('is-hidden');
        else if (y < lastY - 6 || y < 240) header.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
    // keep the header visible while something inside it has focus (keyboard users)
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  }

  /* ---------- Active navigation (a product page lights up «Каталог») ---------- */
  {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const parent = { 'product.html': 'catalog.html' }[file];
    $$('.nav__link, .menu__link').forEach((a) => {
      const href = (a.getAttribute('href') || '').split('?')[0].split('#')[0].toLowerCase();
      if (!href) return;
      if (href === file) a.setAttribute('aria-current', 'page');
      else if (href === parent) a.setAttribute('aria-current', 'true');
    });
  }

  /* ---------- Russian typography: short words stick to the next word, dashes to the previous one,
     numbers keep their thousands and units together. Runs on text nodes only; FM.typo(el) for injected content. ---------- */
  const NB = '\u00a0';
  const SHORT = /(?<=^|[\s«„"(])(в|во|с|со|к|ко|и|а|о|об|у|я|из|на|по|от|до|за|не|но|ни|для|при|без|под|над)[ \t\r\n]+(?=\S|$)/giu;
  const typo = (scope = document.body) => {
    if (!scope) return;
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (!/\S/.test(n.nodeValue) || (n.parentElement && n.parentElement.closest('script, style, textarea, svg, code, pre')) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const v = n.nodeValue
        .replace(SHORT, `$1${NB}`)
        .replace(/[ \t\r\n]+(?=[—–] )/g, NB)
        .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NB}`)
        .replace(/(\d)[ \t\r\n]+(?=(?:кг|т|тонн|тонны|мм|м|м²|м³|шт|км|%)(?![\p{L}\d]))/gu, `$1${NB}`);
      if (v !== n.nodeValue) n.nodeValue = v;
    });
  };
  FM.typo = typo;
  typo(document.body);

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  const menu = $('.menu');
  if (burger && menu) {
    const focusables = () => $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', menu);
    const setOpen = (open, { focus = true } = {}) => {
      burger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      if (open) { header && header.classList.remove('is-hidden'); if (focus) { const f = focusables()[0]; f && f.focus({ preventScroll: true }); } }
      else if (focus) burger.focus({ preventScroll: true });
    };
    burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a[href]')) setOpen(false, { focus: false }); });
    document.addEventListener('keydown', (e) => {
      if (!menu.classList.contains('is-open')) return;
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return; }
      if (e.key === 'Tab') {
        const f = focusables(); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); burger.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); burger.focus(); }
        else if (!e.shiftKey && document.activeElement === burger) { e.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', (e) => { if (e.matches) setOpen(false, { focus: false }); });
  }
  // Coming back through the back/forward cache: close menus, drop stuck focus/hover states
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    document.body.classList.remove('menu-open');
    menu && menu.classList.remove('is-open');
    burger && burger.setAttribute('aria-expanded', 'false');
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  });

  /* ---------- Cross-section art (placeholders for product photos) ----------
     Each drawing: the front face (section) is drawn first, then the extrusion lines run back and up-right,
     then the faces fill. Coordinates share a 240x200 box; depth runs to (+62, -52). */
  const DX = 62, DY = -52;
  /* Dimension marks for metal drawings (the calculator), as on a technical drawing: extension lines, dimension lines
     with arrowheads, letter labels that match the calculator fields (A, B, S, D). */
  const f1 = (n) => n.toFixed(1);
  const seg = (x1, y1, x2, y2) => `M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}`;
  const tip = (x, y, a, l = 6) => `M${f1(x - l * Math.cos(a - 0.45))} ${f1(y - l * Math.sin(a - 0.45))}L${f1(x)} ${f1(y)}L${f1(x - l * Math.cos(a + 0.45))} ${f1(y - l * Math.sin(a + 0.45))}`;
  const span = (x1, y1, x2, y2) => { const a = Math.atan2(y2 - y1, x2 - x1); return seg(x1, y1, x2, y2) + tip(x2, y2, a) + tip(x1, y1, a + Math.PI); };
  const pointer = (x1, y1, x2, y2) => seg(x1, y1, x2, y2) + tip(x2, y2, Math.atan2(y2 - y1, x2 - x1)); // tip at (x2, y2)
  const label = (x, y, t) => `<text x="${f1(x)}" y="${f1(y)}">${t}</text>`;
  // fs: the label size in drawing units, so the letters come out about the same size on every drawing
  const dims = (d, labels, axis = '', fs = 12) => `<g class="art__dims" font-size="${fs}"><path d="${d}"/>${axis ? `<path class="art__axis" d="${axis}"/>` : ''}${labels}</g>`;
  // box section: A along the bottom, B on the left, S across the left wall
  const boxDims = (x, y, w, h, t) => {
    const ys = y + h * 0.7;
    return dims(
      seg(x, y + h + 4, x, y + h + 26) + seg(x + w, y + h + 4, x + w, y + h + 26) + span(x, y + h + 20, x + w, y + h + 20)
      + seg(x - 4, y, x - 26, y) + seg(x - 4, y + h, x - 26, y + h) + span(x - 20, y, x - 20, y + h)
      + pointer(x - 14, ys, x, ys) + pointer(x + t + 14, ys, x + t, ys),
      label(x + w / 2, y + h + 37, 'A') + label(x - 32, y + h / 2 + 5, 'B') + label(x + t + 22, ys + 5, 'S'), '', 16);
  };
  // round section: D on the diagonal through the centre (dashed axis), S across the wall at the lower left
  const roundDims = (cx, cy, r, ri) => {
    const u = Math.SQRT1_2, o = r + 16;
    return dims(
      pointer(cx - u * o, cy - u * o, cx - u * r, cy - u * r) + pointer(cx + u * o, cy + u * o, cx + u * r, cy + u * r)
      + pointer(cx - u * o, cy + u * o, cx - u * r, cy + u * r) + pointer(cx - u * (ri - 14), cy + u * (ri - 14), cx - u * ri, cy + u * ri),
      label(cx - u * (r + 24), cy - u * (r + 24), 'D') + label(cx - u * (r + 26), cy + u * (r + 26) + 6, 'S'),
      seg(cx - u * o, cy - u * o, cx + u * o, cy + u * o), 16);
  };
  // sheet: A along the front edge, B along the side, S across the thickness at the left end
  const sheetDims = (x, y, w, h, dx, dy) => {
    const L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L; // perpendicular to the side, pointing down-right
    const bx = x + w, by = y + h;
    return dims(
      seg(x, by + 4, x, by + 26) + seg(bx, by + 4, bx, by + 26) + span(x, by + 20, bx, by + 20)
      + seg(bx + nx * 3, by + ny * 3, bx + nx * 20, by + ny * 20) + seg(bx + dx + nx * 3, by + dy + ny * 3, bx + dx + nx * 20, by + dy + ny * 20)
      + span(bx + nx * 14, by + ny * 14, bx + dx + nx * 14, by + dy + ny * 14)
      + seg(x - 3, y, x - 22, y) + seg(x - 3, by, x - 22, by) + pointer(x - 12, y - 16, x - 12, y) + pointer(x - 12, by + 16, x - 12, by),
      label(x + w / 2, by + 35, 'A') + label(bx + dx / 2 + nx * 26, by + dy / 2 + ny * 26 + 4, 'B') + label(x - 12, y - 20, 'S'));
  };
  const ART = {
    round(d) {
      const cx = 92, cy = 122, r = 54, ri = 42;
      const bx = cx + DX, by = cy + DY;
      // tangent points of the two circles along the depth direction
      const a = Math.atan2(DY, DX) + Math.PI / 2;
      const t = (x, y, rad) => [x + rad * Math.cos(a), y + rad * Math.sin(a)];
      const [x1, y1] = t(cx, cy, r), [x2, y2] = t(bx, by, r), [x3, y3] = t(cx, cy, -r), [x4, y4] = t(bx, by, -r);
      // art__body: the tube's side surface (fill only; shown on metal drawings), under the outlines
      return `
        <path class="art__body" d="M${x1} ${y1}L${x2} ${y2}A${r} ${r} 0 0 0 ${x4} ${y4}L${x3} ${y3}Z"/>
        <path class="art__depth" pathLength="1" style="--o:2" d="M${x1} ${y1}L${x2} ${y2}"/>
        <path class="art__depth" pathLength="1" style="--o:2" d="M${x3} ${y3}L${x4} ${y4}"/>
        <path class="art__depth" pathLength="1" style="--o:3" d="M${x2} ${y2}A${r} ${r} 0 0 0 ${x4} ${y4}"/>
        <circle class="art__face" pathLength="1" style="--o:0" cx="${cx}" cy="${cy}" r="${r}"/>
        <circle class="art__hole" pathLength="1" style="--o:1" cx="${cx}" cy="${cy}" r="${ri}"/>
        ${d ? roundDims(cx, cy, r, ri) : `<path class="art__dim" pathLength="1" style="--o:4" d="M${cx - r} ${cy + r + 18}H${cx + r}"/>`}`;
    },
    square(d) {
      const x = 40, y = 70, s = 104, w = 14;
      return `
        <path class="art__edge" pathLength="1" style="--o:2" d="M${x} ${y}L${x + DX} ${y + DY}H${x + s + DX}L${x + s} ${y}Z"/>
        <path class="art__edge" pathLength="1" style="--o:2" d="M${x + s} ${y}L${x + s + DX} ${y + DY}V${y + s + DY}L${x + s} ${y + s}Z"/>
        <rect class="art__face" pathLength="1" style="--o:0" x="${x}" y="${y}" width="${s}" height="${s}" rx="4"/>
        <rect class="art__hole" pathLength="1" style="--o:1" x="${x + w}" y="${y + w}" width="${s - 2 * w}" height="${s - 2 * w}" rx="2"/>
        ${d ? boxDims(x, y, s, s, w) : `<path class="art__dim" pathLength="1" style="--o:4" d="M${x} ${y + s + 18}H${x + s}"/>`}`;
    },
    rect(d) {
      const x = 30, y = 86, w = 150, h = 86, t = 13;
      return `
        <path class="art__edge" pathLength="1" style="--o:2" d="M${x} ${y}L${x + DX} ${y + DY}H${x + w + DX}L${x + w} ${y}Z"/>
        <path class="art__edge" pathLength="1" style="--o:2" d="M${x + w} ${y}L${x + w + DX} ${y + DY}V${y + h + DY}L${x + w} ${y + h}Z"/>
        <rect class="art__face" pathLength="1" style="--o:0" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>
        <rect class="art__hole" pathLength="1" style="--o:1" x="${x + t}" y="${y + t}" width="${w - 2 * t}" height="${h - 2 * t}" rx="2"/>
        ${d ? boxDims(x, y, w, h, t) : `<path class="art__dim" pathLength="1" style="--o:4" d="M${x} ${y + h + 18}H${x + w}"/>`}`;
    },
    sheet(d) {
      const x = 22, y = 150, w = 150, h = 9, dx = 70, dy = -58;
      return `
        <path class="art__edge" pathLength="1" style="--o:1" d="M${x} ${y}L${x + dx} ${y + dy}H${x + w + dx}L${x + w} ${y}Z"/>
        <path class="art__edge" pathLength="1" style="--o:2" d="M${x + w} ${y}L${x + w + dx} ${y + dy}V${y + dy + h}L${x + w} ${y + h}Z"/>
        <rect class="art__face" pathLength="1" style="--o:0" x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5"/>
        ${d ? sheetDims(x, y, w, h, dx, dy) : `<path class="art__dim" pathLength="1" style="--o:3" d="M${x} ${y + h + 18}H${x + w}"/>`}`;
    },
    angle() {
      const x = 56, y = 60, L = 110, t = 16;
      const face = `M${x} ${y}H${x + t}V${y + L - t}H${x + L}V${y + L}H${x}Z`;
      const top = `M${x} ${y}L${x + DX} ${y + DY}H${x + t + DX}L${x + t} ${y}Z`;
      const inner = `M${x + t} ${y + L - t}L${x + t + DX} ${y + L - t + DY}H${x + L + DX}L${x + L} ${y + L - t}Z`;
      const side = `M${x + L} ${y + L - t}L${x + L + DX} ${y + L - t + DY}V${y + L + DY}L${x + L} ${y + L}Z`;
      return `
        <path class="art__edge" pathLength="1" style="--o:2" d="${top}"/>
        <path class="art__edge" pathLength="1" style="--o:2" d="${inner}"/>
        <path class="art__edge" pathLength="1" style="--o:2" d="${side}"/>
        <path class="art__face" pathLength="1" style="--o:0" d="${face}"/>
        <path class="art__dim" pathLength="1" style="--o:4" d="M${x} ${y + L + 18}H${x + L}"/>`;
    },
    rebar() {
      const cx = 92, cy = 122, r = 46;
      const bx = cx + DX, by = cy + DY;
      const a = Math.atan2(DY, DX) + Math.PI / 2;
      const t = (x, y, rad) => [x + rad * Math.cos(a), y + rad * Math.sin(a)];
      const [x1, y1] = t(cx, cy, r), [x2, y2] = t(bx, by, r), [x3, y3] = t(cx, cy, -r), [x4, y4] = t(bx, by, -r);
      let ribs = '';
      for (let i = 1; i <= 5; i++) { const k = i / 6; ribs += `<path class="art__rib" pathLength="1" style="--o:3" d="M${x1 + (x2 - x1) * k} ${y1 + (y2 - y1) * k}L${x3 + (x4 - x3) * k} ${y3 + (y4 - y3) * k}"/>`; }
      return `
        <path class="art__depth" pathLength="1" style="--o:2" d="M${x1} ${y1}L${x2} ${y2}"/>
        <path class="art__depth" pathLength="1" style="--o:2" d="M${x3} ${y3}L${x4} ${y4}"/>
        ${ribs}
        <path class="art__depth" pathLength="1" style="--o:3" d="M${x2} ${y2}A${r} ${r} 0 0 0 ${x4} ${y4}"/>
        <circle class="art__face" pathLength="1" style="--o:0" cx="${cx}" cy="${cy}" r="${r}"/>
        <path class="art__dim" pathLength="1" style="--o:4" d="M${cx - r} ${cy + r + 18}H${cx + r}"/>`;
    },
    rod() {
      const cx = 92, cy = 122, r = 46;
      const bx = cx + DX, by = cy + DY;
      const a = Math.atan2(DY, DX) + Math.PI / 2;
      const t = (x, y, rad) => [x + rad * Math.cos(a), y + rad * Math.sin(a)];
      const [x1, y1] = t(cx, cy, r), [x2, y2] = t(bx, by, r), [x3, y3] = t(cx, cy, -r), [x4, y4] = t(bx, by, -r);
      return `
        <path class="art__depth" pathLength="1" style="--o:2" d="M${x1} ${y1}L${x2} ${y2}"/>
        <path class="art__depth" pathLength="1" style="--o:2" d="M${x3} ${y3}L${x4} ${y4}"/>
        <path class="art__depth" pathLength="1" style="--o:3" d="M${x2} ${y2}A${r} ${r} 0 0 0 ${x4} ${y4}"/>
        <circle class="art__face" pathLength="1" style="--o:0" cx="${cx}" cy="${cy}" r="${r}"/>
        <path class="art__dim" pathLength="1" style="--o:4" d="M${cx - r} ${cy + r + 18}H${cx + r}"/>`;
    },
  };
  const VIEW = { round: '28 6 190 196', square: '30 8 186 192', rect: '20 24 232 174', sheet: '12 82 240 104', angle: '46 0 192 196', rebar: '36 14 174 180', rod: '36 14 174 180' };
  // with dimension marks the box grows to hold the extension lines and labels
  const VIEW_D = { round: '26 10 188 182', square: '2 12 210 202', rect: '-8 28 254 184', sheet: '-4 86 266 114' };
  FM.art = (type, { dims: withDims = false } = {}) => {
    const t = ART[type] ? type : 'square';
    const d = withDims && !!VIEW_D[t];
    return `<svg viewBox="${d ? VIEW_D[t] : VIEW[t]}" aria-hidden="true" focusable="false">${ART[t](d)}</svg>`;
  };
  // Steel shading for metal drawings (.art--metal, the calculator): gradients shared by every drawing on the page
  const steelDefs = () => {
    if (document.getElementById('fm-steel')) return;
    document.body.insertAdjacentHTML('beforeend', '<svg id="fm-steel" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'
      + '<linearGradient id="fm-steel-face" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f4f6"/><stop offset=".42" stop-color="#b3babf"/><stop offset=".55" stop-color="#cfd4d7"/><stop offset="1" stop-color="#7d858a"/></linearGradient>'
      + '<linearGradient id="fm-steel-top" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#9aa1a6"/><stop offset=".6" stop-color="#d3d8db"/><stop offset="1" stop-color="#aab1b6"/></linearGradient>'
      + '<linearGradient id="fm-steel-side" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b7378"/><stop offset="1" stop-color="#3f464b"/></linearGradient>'
      + '<linearGradient id="fm-steel-tube" x1="0" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="#dfe3e6"/><stop offset=".3" stop-color="#a3aaaf"/><stop offset=".7" stop-color="#4f565b"/><stop offset="1" stop-color="#737b80"/></linearGradient>'
      + '<radialGradient id="fm-steel-bore" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#2a3034"/><stop offset="1" stop-color="#0d1012"/></radialGradient>'
      + '</defs></svg>');
  };
  const mountArt = (scope = document) => {
    $$('[data-art]', scope).forEach((el) => {
      if (el.dataset.mounted) return;
      el.dataset.mounted = '1';
      if (el.classList.contains('art--metal')) steelDefs();
      el.classList.add('art');
      el.innerHTML = FM.art(el.dataset.art, { dims: el.classList.contains('art--metal') });
      if (FM.observe) FM.observe(el);
    });
  };
  FM.mountArt = mountArt;
  mountArt();

  /* ---------- Phrase masks: wrap words of [data-lines] headings ---------- */
  $$('[data-lines]').forEach((el) => {
    if (el.dataset.linesDone) return;
    el.dataset.linesDone = '1';
    // keep the green closing phrase (<span class="hl">) while splitting into word masks
    const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const words = [];
    el.childNodes.forEach((n) => {
      const accent = n.nodeType === 1 && n.classList.contains('hl');
      (n.textContent || '').split(/[ \t\r\n]+/).filter(Boolean).forEach((w) => words.push({ w, accent }));
    });
    el.innerHTML = words.map((p, i) => `<span class="line" style="--i:${i}"><span${p.accent ? ' class="hl"' : ''}>${esc(p.w)}</span></span>`).join(' ');
    el.classList.add('reveal', 'reveal--lines');
  });

  /* ---------- Counters ---------- */
  const formatNum = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion.matches || !isFinite(target)) { el.textContent = formatNum(target) + suffix; return; }
    const dur = 1300, start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(target * e) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- Welding: sparks, and the torch pass over a drawing ---------- */
  // one spark from (x, y) inside a positioned, clipped box; k scales speed and fall (smaller for small drawings)
  const spark = (box, x, y, k = 1) => {
    const s = document.createElement('i');
    s.className = 'weld__spark';
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6; // a wide fan, mostly upwards
    const v = (80 + Math.random() * 280) * k; // px/s
    const life = (300 + Math.random() * 520) * (0.6 + 0.4 * k); // ms
    const pos = (q) => { const t = (life * q) / 1000; return `translate(${(x + Math.cos(a) * v * t - 30 * k * t).toFixed(1)}px, ${(y + Math.sin(a) * v * t + 550 * k * t * t).toFixed(1)}px)`; };
    box.appendChild(s);
    s.animate([
      { transform: pos(0), opacity: 1, background: '#fff4cf' },
      { transform: pos(0.35), opacity: 1, background: '#ffd27a' },
      { transform: pos(0.7), opacity: 0.7, background: '#ff9a2e' },
      { transform: pos(1), opacity: 0, background: '#ff5a00' },
    ], { duration: life, easing: 'linear', fill: 'forwards' }).onfinish = () => s.remove();
  };
  // A cross-section marked [data-weld] (the calculator) is welded instead of drawn: a torch runs along every outline
  // in turn (face, hole, extrusion) with a hot trail that cools to lime; then the faces fill and the dimension line draws.
  let weldId = 0;
  const weldArt = (el) => {
    const svg = el.querySelector('svg');
    const order = (p) => parseFloat(p.style.getPropertyValue('--o')) || 0;
    const parts = svg ? $$('path, circle, rect, line, polyline', svg).filter((p) => !p.matches('.art__dim, .art__body') && !p.closest('.art__dims') && typeof p.getTotalLength === 'function').sort((a, b) => order(a) - order(b)) : [];
    if (!parts.length) { el.classList.add('is-in'); return; }
    const id = `art-hot${++weldId}`;
    svg.insertAdjacentHTML('beforeend', `<defs><filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
      + `<g class="art__weld" filter="url(#${id})"><circle class="art__torch-halo" r="7"/><circle class="art__torch" r="2.4"/></g>`);
    const g = svg.lastElementChild, halo = g.children[0], torch = g.children[1];
    const lens = parts.map((p) => p.getTotalLength());
    const speed = lens.reduce((sum, l) => sum + l, 0) / 2400; // user units per ms: the whole drawing takes about 2.4 s
    parts.forEach((p) => { p.style.transition = 'none'; p.style.strokeDashoffset = '1'; });
    const hot = (p, cls) => { const c = p.cloneNode(false); c.removeAttribute('style'); c.setAttribute('class', `art__hot ${cls}`); c.setAttribute('pathLength', '1'); g.insertBefore(c, halo); return c; };
    let i = 0, t0 = 0, layers = [];
    const frame = (now) => {
      const p = parts[i], L = lens[i];
      if (!t0) { t0 = now; layers = [['art__hot--trail', 0.35], ['art__hot--mid', 0.14], ['art__hot--core', 0.05]].map(([cls, len]) => [hot(p, cls), len]); }
      const k = Math.min(1, (now - t0) / Math.max(180, L / speed));
      p.style.strokeDashoffset = String(1 - k);
      layers.forEach(([c, len]) => { c.style.strokeDashoffset = String(len - k); }); // each hot layer shows [k - len, k]
      const pt = p.getPointAtLength(k * L);
      [torch, halo].forEach((c) => { c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1)); });
      halo.style.opacity = (0.55 + Math.random() * 0.45).toFixed(2);
      const ctm = p.getScreenCTM();
      if (ctm && Math.random() < 0.75) { const r = el.getBoundingClientRect(); const sp = new DOMPoint(pt.x, pt.y).matrixTransform(ctm); spark(el, sp.x - r.left, sp.y - r.top, 0.45); }
      if (k < 1) { requestAnimationFrame(frame); return; }
      // this outline is done: its hot trail cools, the torch moves on to the next one
      const done = layers.map(([c]) => c);
      done.forEach((c) => c.classList.add('is-cool'));
      setTimeout(() => done.forEach((c) => c.remove()), 700);
      i += 1; t0 = 0;
      if (i < parts.length) { requestAnimationFrame(frame); return; }
      g.classList.add('is-done');
      setTimeout(() => g.remove(), 800);
      parts.forEach((q) => { q.style.removeProperty('stroke-dashoffset'); q.style.removeProperty('transition'); });
      el.classList.add('is-in'); // the faces fill and the dimension line draws (CSS)
    };
    requestAnimationFrame(frame);
  };

  /* ---------- Reveal on scroll ---------- */
  const onIn = (el) => {
    if (el.matches('.art[data-weld]') && !reduceMotion.matches) { if (!el.dataset.welded) { el.dataset.welded = '1'; weldArt(el); } return; }
    el.classList.add('is-in');
    $$('[data-count]', el).forEach(runCounter);
    if (el.dataset.count !== undefined) runCounter(el);
  };
  const revealTargets = () => $$('.reveal, [data-count], .art');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { onIn(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealTargets().forEach((el) => io.observe(el));
    FM.observe = (el) => io.observe(el);
  } else {
    revealTargets().forEach(onIn);
    FM.observe = onIn;
  }
  /* Saw-cut seams are welded once their edge is on screen: a torch runs left to right along the cut with a hot
     trail and sparks, and the lime hairline (::before, revealed by --wp) stays behind it. One pass of 1.4–2.6 s;
     with reduced motion (or no IntersectionObserver) the line is simply shown. Only seams between two dark blocks are
     welded; where a light block ends above the cut, and above the footer, the line is shown without the pass. */
  {
    const darkSeam = (el) => { if (el.matches('.footer')) return false; const prev = el.previousElementSibling; return !!prev && !prev.classList.contains('band--light'); };
    const all = $$('.band--cut:not(.band--light), .footer');
    all.filter((el) => !darkSeam(el)).forEach((el) => el.classList.add('is-cut'));
    const seams = all.filter(darkSeam);
    let uid = 0;
    const weld = (band) => {
      const r = band.getBoundingClientRect();
      const W = r.width;
      const cut = parseFloat(getComputedStyle(band, '::before').height) || 40;
      const PAD = 150; // room for the glow and the sparks above and below the seam; the layer clips them
      const H = cut + PAD * 2;
      const yAt = (x) => PAD + cut - (cut * x) / W; // the seam runs from (0, PAD + cut) to (W, PAD)
      const id = `weld-g${++uid}`;
      const box = document.createElement('div');
      box.className = 'weld';
      box.setAttribute('aria-hidden', 'true');
      Object.assign(box.style, { left: `${r.left + window.scrollX}px`, top: `${r.top + window.scrollY - PAD}px`, width: `${W}px`, height: `${H}px` });
      box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">`
        + '<stop offset="0" stop-color="#ff5a00" stop-opacity="0"/><stop offset=".45" stop-color="#ff6a00" stop-opacity=".45"/><stop offset=".8" stop-color="#ffa23a"/>'
        + '<stop offset=".95" stop-color="#fff1c6"/><stop offset=".99" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'
        + `<line x1="0" y1="${PAD + cut}" x2="${W}" y2="${PAD}" stroke="url(#${id})" stroke-width="2.4" stroke-linecap="round"/></svg><span class="weld__head"></span>`;
      document.body.appendChild(box);
      const svg = box.firstElementChild, grad = box.querySelector('linearGradient'), head = box.querySelector('.weld__head');
      const dur = Math.min(2600, Math.max(1400, W / 0.75));
      const trail = Math.max(110, W * 0.16);
      let start = 0;
      const frame = (now) => {
        if (!start) start = now;
        const p = Math.min(1, (now - start) / dur);
        const x = p * W, y = yAt(x);
        band.style.setProperty('--wp', p.toFixed(4));
        grad.setAttribute('x1', (x - trail).toFixed(1));
        grad.setAttribute('x2', (x + 1).toFixed(1));
        head.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(0.8 + Math.random() * 0.45).toFixed(2)})`;
        head.style.opacity = (0.82 + Math.random() * 0.18).toFixed(2);
        spark(box, x, y); if (Math.random() < 0.45) spark(box, x, y);
        if (p < 1) { requestAnimationFrame(frame); return; }
        // the seam cools: the hot trail and the torch fade, the lime line stays
        band.style.removeProperty('--wp');
        svg.style.opacity = '0';
        head.style.transition = 'opacity .35s ease';
        head.style.opacity = '0';
        setTimeout(() => box.remove(), 1300);
      };
      requestAnimationFrame(frame);
    };
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const band = en.target;
          cio.unobserve(band);
          band.style.setProperty('--wp', '0');
          band.classList.add('is-cut');
          // let the hero entrance finish before the first pass
          setTimeout(() => weld(band), Math.max(150, 1400 - performance.now()));
        });
      }, { rootMargin: '0px 0px -15% 0px' });
      seams.forEach((el) => cio.observe(el));
    } else seams.forEach((el) => el.classList.add('is-cut'));
  }
  // The hero (above the fold) plays its sequence right after fonts settle, not on scroll
  const hero = $('[data-hero]');
  if (hero) {
    const start = () => $$('.reveal, .art', hero).forEach((el) => onIn(el));
    if (document.fonts && document.fonts.status !== 'loaded') Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(start);
    else setTimeout(start, 60);
  }

  /* ---------- Scroll-linked scene: writes --p (0..1) on [data-scene] ---------- */
  {
    const scenes = $$('[data-scene]');
    const parallax = $$('[data-parallax]');
    if (scenes.length || parallax.length) {
      let raf = false;
      const tick = () => {
        raf = false;
        const vh = window.innerHeight;
        scenes.forEach((s) => {
          const r = s.getBoundingClientRect();
          const total = r.height - vh;
          const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : (r.top < vh * 0.5 ? 1 : 0);
          s.style.setProperty('--p', p.toFixed(4));
        });
        parallax.forEach((f) => {
          const r = f.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          const amt = parseFloat(f.dataset.parallax) || 0.08;
          const rel = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
          const child = f.firstElementChild;
          if (child) child.style.transform = `translate3d(0, ${(-rel * amt * 100).toFixed(2)}%, 0) scale(${1 + amt * 2})`;
        });
      };
      const request = () => { if (!raf) { raf = true; requestAnimationFrame(tick); } };
      const enable = () => {
        if (richMotion()) { root.classList.add('rich-motion'); window.addEventListener('scroll', request, { passive: true }); window.addEventListener('resize', request); request(); }
        else { root.classList.remove('rich-motion'); window.removeEventListener('scroll', request); scenes.forEach((s) => s.style.setProperty('--p', '1')); parallax.forEach((f) => { const c = f.firstElementChild; if (c) c.style.transform = ''; }); }
      };
      enable();
      [reduceMotion, desktop, finePointer].forEach((m) => m.addEventListener('change', enable));
    }
  }

  /* ---------- Background video ([data-video]): plays only where motion is welcome and only while it is on screen;
     a real pause button; phones get the lighter file. The visitor's choice (pause / play) wins over the defaults. ---------- */
  $$('[data-video]').forEach((wrap) => {
    const video = $('video', wrap);
    const btn = $('[data-video-toggle]', wrap);
    if (!video) return;
    video.muted = true;
    const small = window.matchMedia('(max-width: 899px)');
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    let wanted = !reduceMotion.matches && !saveData;
    let visible = true;
    const label = (playing) => {
      if (!btn) return;
      btn.setAttribute('aria-label', playing ? 'Остановить видео' : 'Включить видео');
      btn.dataset.state = playing ? 'playing' : 'paused';
    };
    const load = () => {
      const src = (small.matches && video.dataset.srcSmall) || video.dataset.src;
      if (src && !video.getAttribute('src')) { video.src = src; video.load(); }
    };
    const sync = () => {
      if (wanted && visible && !document.hidden) {
        load();
        const p = video.play();
        if (p && p.catch) p.catch(() => { wanted = false; label(false); });
      } else if (!video.paused) video.pause();
      label(wanted);
    };
    // the still frame stays until the video really plays, then the video fades in over it
    video.addEventListener('playing', () => wrap.classList.add('is-playing'));
    btn && btn.addEventListener('click', () => { wanted = !wanted; sync(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync(); }).observe(wrap);
    document.addEventListener('visibilitychange', sync);
    reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) { wanted = false; sync(); } });
    sync();
  });

  /* ---------- Tabs ---------- */
  const initTabs = (scope = document) => $$('[role="tablist"]', scope).forEach((list) => {
    if (list.dataset.tabsDone) return;
    list.dataset.tabsDone = '1';
    const tabs = $$('[role="tab"]', list);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const select = (i, focus = false) => {
      tabs.forEach((t, k) => { const on = k === i; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (panels[k]) panels[k].hidden = !on; });
      if (focus) tabs[i].focus();
      list.dispatchEvent(new CustomEvent('tabchange', { detail: { index: i, id: tabs[i].id } }));
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        const n = tabs.length;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select((i + 1) % n, true); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select((i - 1 + n) % n, true); }
        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        if (e.key === 'End') { e.preventDefault(); select(n - 1, true); }
      });
    });
    const initial = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
    select(initial);
  });
  FM.initTabs = initTabs;
  initTabs();

  /* ---------- Phone numbers (Uzbekistan): +998 and 9 digits, the first two an operator or a city code ----------
     The same rules run on the server (server/telegram-form/worker.js); keep UZ_CODES in sync (tools/form-test.mjs checks). */
  const UZ_CODES = ['20', '33', '50', '55', '61', '62', '65', '66', '67', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '88', '90', '91', '93', '94', '95', '97', '98', '99'];
  // digits after +998: understands «+998 93 166 04 40», «998931660440», «8 (93) 166-04-40», «93 166 04 40»
  const phoneDigits = (value) => {
    const s = String(value || '').trim();
    let d = s.replace(/\D/g, '');
    if ((s.startsWith('+') || d.length > 10) && d.startsWith('998')) d = d.slice(3);
    if (d.length === 10 && /^[08]/.test(d)) d = d.slice(1);
    return d;
  };
  const phoneError = (value) => {
    const d = phoneDigits(value);
    if (!d) return 'Укажите номер телефона';
    if (d.length < 9) return 'Не хватает цифр: +998 XX XXX XX XX';
    if (d.length > 9) return 'Лишние цифры: +998 XX XXX XX XX';
    if (!UZ_CODES.includes(d.slice(0, 2))) return 'Проверьте код оператора: 90, 93, 97…';
    return '';
  };
  const phoneFormat = (d) => '+998 ' + [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
  FM.phone = { digits: phoneDigits, error: phoneError, format: phoneFormat, codes: UZ_CODES };

  /* ---------- Phone input: keeps the +998 format while typing ---------- */
  $$('input[type="tel"]').forEach((input) => {
    input.addEventListener('input', () => {
      const d = phoneDigits(input.value).slice(0, 9);
      input.value = d ? phoneFormat(d) : '';
    });
    input.addEventListener('focus', () => { if (!input.value) input.value = '+998 '; });
    input.addEventListener('blur', () => { if (input.value.trim() === '+998') input.value = ''; });
  });

  /* ---------- Request form ---------- */
  const CONFIG = window.FM_CONFIG || {};
  const DATA = window.FM_DATA || {};
  const contactsFallback = () => {
    const c = DATA.contacts || {};
    return `Позвоните нам: <a href="${c.phoneHref || '#'}">${c.phone || ''}</a> или напишите в <a href="${c.telegram || '#'}" target="_blank" rel="noopener">Telegram</a>.`;
  };
  $$('form[data-form]').forEach((form) => {
    const status = $('.form__status', form);
    const submit = $('[type="submit"]', form);
    const fields = $$('.field', form);
    const setStatus = (kind, html) => {
      if (!status) return;
      status.className = 'form__status is-visible ' + (kind === 'ok' ? 'form__status--ok' : 'form__status--err');
      status.innerHTML = icon(kind === 'ok' ? 'i-check' : 'i-alert') + '<span>' + html + '</span>';
    };
    const validateField = (field) => {
      const input = $('.input', field); const msg = $('.field__msg', field);
      if (!input) return true;
      let error = '';
      const v = input.value.trim();
      if (input.type === 'tel' && (input.required || (v && v !== '+998'))) error = phoneError(v);
      else if (input.required && !v) error = input.name === 'name' ? 'Укажите, как к вам обращаться' : 'Заполните это поле';
      else if (input.name === 'name' && (v.match(/\p{L}/gu) || []).length < 2) error = 'Имя — хотя бы две буквы';
      else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) error = 'Проверьте адрес почты';
      field.classList.toggle('is-invalid', !!error);
      input.setAttribute('aria-invalid', error ? 'true' : 'false');
      if (msg) msg.textContent = error;
      return !error;
    };
    // each message is tied to its field for screen readers
    fields.forEach((f, n) => { const i = $('.input', f), m = $('.field__msg', f); if (i && m) { m.id = m.id || `${i.id || 'f' + n}-msg`; i.setAttribute('aria-describedby', m.id); } });
    fields.forEach((f) => { const i = $('.input', f); i && i.addEventListener('blur', () => { if (f.classList.contains('is-invalid') || i.value) validateField(f); }); i && i.addEventListener('input', () => { if (f.classList.contains('is-invalid')) validateField(f); }); });
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const ok = fields.map(validateField).every(Boolean);
      if (!ok) { const bad = $('.field.is-invalid .input', form); bad && bad.focus(); return; }
      const cfg = CONFIG.FORM || {};
      const fd = new FormData(form);
      if (String(fd.get('website') || '').trim()) return; // honeypot
      const val = (k, max) => String(fd.get(k) || '').trim().slice(0, max);
      const company = val('company', 120), comment = val('message', 2000);
      const parts = [];
      if (company) parts.push('Компания: ' + company);
      if (comment) parts.push(comment);
      parts.push('Страница: ' + location.href);
      // the server (server/telegram-form) reads the separate fields; message keeps the older single-text format
      const payload = {
        name: val('name', 80), phone: phoneFormat(phoneDigits(fd.get('phone'))), company, comment,
        page: location.href, title: document.title, elapsed: Math.round(performance.now()), website: val('website', 200),
        message: parts.join('\n'), timestamp: new Date().toISOString(), domain: location.hostname,
      };
      if (!cfg.url) { setStatus('err', 'Отправка с сайта пока не подключена. ' + contactsFallback()); return; }
      form.classList.add('is-sending'); submit && (submit.disabled = true);
      const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), cfg.timeoutMs || 12000);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (cfg.key) headers[cfg.keyHeader || 'X-API-Key'] = cfg.key;
        const res = await fetch(cfg.url, { method: 'POST', headers, body: JSON.stringify(payload), signal: ctrl.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        setStatus('ok', 'Заявка отправлена. Менеджер свяжется с вами в рабочее время: ' + ((DATA.contacts || {}).hours || '') + '.');
      } catch (err) {
        setStatus('err', 'Не удалось отправить заявку. ' + contactsFallback());
      } finally {
        clearTimeout(timer); form.classList.remove('is-sending'); submit && (submit.disabled = false);
      }
    });
  });

  /* ---------- Copy buttons ([data-copy]): the check mark and the announcement appear only after the clipboard accepted the text ---------- */
  {
    const buttons = $$('[data-copy]');
    if (buttons.length && navigator.clipboard && window.isSecureContext) {
      const status = document.createElement('p');
      status.className = 'visually-hidden'; status.setAttribute('role', 'status');
      document.body.appendChild(status);
      buttons.forEach((b) => {
        b.hidden = false;
        b.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(b.dataset.copy);
            b.classList.add('is-done'); status.textContent = b.dataset.copied || 'Скопировано';
            clearTimeout(b._t); b._t = setTimeout(() => { b.classList.remove('is-done'); status.textContent = ''; }, 1800);
          } catch (e) { /* the link next to it still works */ }
        });
      });
    } else buttons.forEach((b) => { b.hidden = true; });
  }

  /* ---------- Small shared bits ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  // External links open safely
  $$('a[target="_blank"]').forEach((a) => { if (!/noopener/.test(a.rel)) a.rel = (a.rel + ' noopener').trim(); });
})();
