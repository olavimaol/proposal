/* Product template (product.html?cat=<id>): fills the static page from FM_DATA.products.
   Runs after main.js (window.FM, window.FM_DATA exist). Without JS the page keeps its static h1 and the full
   list of positions; with JS the hero, standards, the size table (assets/js/sizes.js), other positions and meta are
   filled in place. Prices are not published: they come by request. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const FM = window.FM || {};
  const DATA = window.FM_DATA || {};
  const products = Array.isArray(DATA.products) ? DATA.products : [];
  const page = $('[data-product-page]');
  if (!page || !products.length) return;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="assets/img/icons.svg#${id}"/></svg>`;
  const observe = (el) => { if (FM.observe) FM.observe(el); else el.classList.add('is-in'); };
  const setText = (el, text) => { if (el) el.textContent = text; };
  // The H1 keeps its phrase masks: words are re-wrapped the way main.js wraps [data-lines]
  const setLines = (el, text) => {
    if (!el) return;
    const words = String(text).trim().split(/[ \t\r\n]+/);
    el.innerHTML = words.map((w, i) => `<span class="line" style="--i:${i}"><span>${esc(w)}</span></span>`).join(' ');
  };
  const setMeta = ({ title, description, query, noindex }) => {
    document.title = title;
    const set = (sel, v) => { const m = $(sel); if (m) m.setAttribute('content', v); };
    set('meta[name="description"]', description);
    set('meta[property="og:title"]', title);
    set('meta[property="og:description"]', description);
    const canonical = $('link[rel="canonical"]');
    if (canonical) {
      try { const u = new URL(canonical.href); u.search = query ? '?cat=' + encodeURIComponent(query) : ''; canonical.href = u.href; set('meta[property="og:url"]', u.href); } catch (e) { /* keep the static canonical */ }
    }
    if (noindex && !$('meta[name="robots"]')) { const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, follow'; document.head.appendChild(m); }
  };

  const cat = (new URLSearchParams(location.search).get('cat') || '').trim().toLowerCase();
  const product = products.find((p) => p.id === cat) || null;
  // positions without their own page (sold from stock only) live in the catalog section
  if (product && product.page === false) { location.replace('catalog.html#more-products'); return; }
  const CALC = { 'profile-tube': 1, 'round-tube': 1, sheet: 1 }; // positions the weight calculator covers
  const TUBES = { 'profile-tube': 1, 'round-tube': 1 }; // tube can be made to the customer's length and wall thickness

  const crumb = $('[data-crumb]', page);
  const marker = $('[data-marker]', page);
  const markerText = $('[data-marker-text]', page);
  const h1 = $('#product-title', page);
  const lead = $('[data-lead]', page);
  const ctaMain = $('[data-cta-main]', page);
  const ctaAlt = $('[data-cta-alt]', page);
  const imgBox = $('[data-hero-img]', page);
  const gostName = $('[data-gost-name]', page);
  const gostList = $('[data-gost-list]', page);
  const gostNote = $('[data-gost-note]', page);
  const emptyTitle = $('[data-empty-title]', page);
  const emptyText = $('[data-empty-text]', page);
  const emptyCta = $('[data-empty-cta]', page);
  const othersTitle = $('[data-others-title]', page);
  const othersList = $('[data-others]', page);
  const heroFacts = $('[data-hero-facts]', page);
  const heroMedia = $('[data-hero-media]', page);

  // Swap the product image (renders in assets/img/products, two widths each)
  const setImage = (product) => {
    const img = imgBox && imgBox.querySelector('img');
    const set = product.img;
    if (!img || !set) return;
    img.src = set.src;
    img.srcset = set.srcset || '';
    if (set.w && set.h) { img.width = set.w; img.height = set.h; }
    img.alt = product.alt || product.name;
  };
  const setLink = (a, href, label, withArrow) => {
    if (!a) return;
    a.setAttribute('href', href);
    a.innerHTML = esc(label) + (withArrow ? ' ' + icon('i-arrow-right') : '');
  };
  // Other positions: photo cards for the positions with a page, one card for the stock-only group
  const imgTag = (set, sizes) => (set ? `<img src="${esc(set.src)}"${set.srcset ? ` srcset="${esc(set.srcset)}" sizes="${sizes}"` : ''}${set.w ? ` width="${set.w}" height="${set.h}"` : ''} alt="" loading="lazy" decoding="async">` : '');
  const renderOthers = (list, title) => {
    setText(othersTitle, title);
    if (!othersList) return;
    const pages = list.filter((p) => p.page !== false);
    const stock = list.filter((p) => p.page === false);
    const link = (href, label) => `<p class="card__foot"><a class="link card__link" href="${href}">${label} ${icon('i-arrow-right')}</a></p>`;
    let html = pages.map((p, i) => `<li class="reveal" style="--i:${i}"><article class="card card--hover others__card"><div class="shot others__media">${imgTag(p.img, '(min-width: 1100px) 330px, (min-width: 600px) 45vw, 100vw')}</div><div class="card__body"><h3 class="others__name">${esc(p.name)}</h3><p>${esc(p.short || '')}</p>${link(`product.html?cat=${encodeURIComponent(p.id)}`, 'Подробнее')}</div></article></li>`).join('');
    if (stock.length) {
      const names = stock.map((p) => p.name).join(', ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
      html += `<li class="reveal" style="--i:${pages.length}"><article class="card card--hover others__card others__card--stock"><div class="others__thumbs">${stock.map((p) => `<span class="shot">${imgTag(p.img && { src: p.img.src.replace('-640.', '-320.'), w: 320, h: 240 }, '')}</span>`).join('')}</div><div class="card__body"><h3 class="others__name">${esc(names)}</h3><p class="others__stock"><span class="status-chip__dot" aria-hidden="true"></span>В наличии</p>${link('catalog.html#more-products', 'В каталоге')}</div></article></li>`;
    }
    othersList.innerHTML = html;
    othersList.dataset.count = String(pages.length + (stock.length ? 1 : 0));
    $$('.reveal', othersList).forEach(observe);
  };
  const showGost = (list) => {
    const has = Array.isArray(list) && list.length > 0;
    setText(gostName, has ? 'Стандарты' : 'Документы');
    if (gostList) { gostList.innerHTML = has ? list.map((g) => `<li>${esc(g)}</li>`).join('') : ''; gostList.hidden = !has; }
    if (gostNote) gostNote.hidden = has;
  };


  /* ---------- Size table: a summary with a button; the table opens below it ---------- */
  const SIZES = window.FM_SIZES || {};
  const sizesBox = $('[data-sizes]', page);
  const emptyBox = $('[data-empty]', page);
  const toNum = (v) => parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
  // wall and sheet thickness: one decimal at least, so 1 and 1,0 never sit in one column
  const dec = (v) => { const n = toNum(v); return Number.isFinite(n) ? n.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '—'; };
  const fmt = (v, d) => { const n = toNum(v); return Number.isFinite(n) ? n.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—'; };
  const plain = (v) => { const n = toNum(v); return Number.isFinite(n) ? n.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : String(v || '—'); };
  const range = (list, f) => { const ns = list.map(f).map(toNum).filter(Number.isFinite); return ns.length ? [Math.min(...ns), Math.max(...ns)] : null; };
  const span = (r, unit = ' мм') => (r ? (r[0] === r[1] ? `${plain(r[0])}${unit}` : `${plain(r[0])}–${plain(r[1])}${unit}`) : '');
  const plural = (n, [one, few, many]) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; };
  const typeCell = (r) => (r.type ? `<span class="sizes__type">${esc(r.type)}</span>` : '—');
  const mass = (r) => fmt(1000 / toNum(r.mpt), 3);
  const TABLES = {
    'profile-tube': {
      cols: [['Сечение, мм', (r) => `${esc(r.a)}×${esc(r.b)}`], ['Стенка, мм', (r) => dec(r.t), 1], ['Прокат', typeCell], ['Масса 1 м, кг', mass, 1], ['Метров в тонне', (r) => fmt(r.mpt, 2), 1], ['Длина трубы, м', (r) => plain(r.length), 1], ['Метров в пачке', (r) => plain(r.bundle), 1]],
      key: (r) => `${r.a}×${r.b}×${r.t}`, group: (r) => `${r.a}×${r.b}`, hint: 'например 40×20',
      facts: (l) => [`сечение ${span(range(l, (r) => Math.max(toNum(r.a), toNum(r.b))))}`, `стенка ${span(range(l, (r) => r.t))}`],
    },
    'round-tube': {
      cols: [['Диаметр, мм', (r) => esc(r.d)], ['Стенка, мм', (r) => dec(r.t), 1], ['Ду', (r) => esc(r.du || '—')], ['Прокат', typeCell], ['Масса 1 м, кг', mass, 1], ['Метров в тонне', (r) => fmt(r.mpt, 2), 1], ['Длина трубы, м', (r) => plain(r.length), 1], ['Метров в пачке', (r) => plain(r.bundle), 1]],
      key: (r) => `${r.d}×${r.t}${r.du ? ' ду' + r.du : ''}`, group: (r) => r.d, hint: 'например 57×3',
      facts: (l) => [`диаметр ${span(range(l, (r) => r.d))}`, `стенка ${span(range(l, (r) => r.t))}`],
    },
    sheet: {
      cols: [['Толщина, мм', (r) => dec(r.t)], ['Ширина, мм', (r) => esc(r.w), 1], ['Длина, мм', (r) => esc(r.l), 1], ['Прокат', typeCell], ['Масса листа, кг', (r) => fmt(toNum(r.t) * toNum(r.w) * toNum(r.l) * 7.85 / 1e6, 1), 1], ['В пачке, т', (r) => plain(r.bundleT), 1]],
      key: (r) => `${r.t}×${r.w}×${r.l}`, group: null, hint: 'например 2×1250',
      facts: (l) => [`толщина ${span(range(l, (r) => r.t))}`, `форматы ${[...new Set(l.map((r) => `${r.w}×${r.l}`))].join(', ')}`],
    },
  };
  // the query understands 40×20, 40x20, 40х20, 40*20 and "40 20"; a dot works as a decimal comma
  const norm = (q) => String(q).toLowerCase().trim().replace(/\./g, ',').replace(/\s*[x×х*]\s*/g, '×').replace(/\s+/g, '×');

  const renderSizes = (id) => {
    const def = TABLES[id];
    const list = Array.isArray(SIZES[id]) ? SIZES[id] : [];
    if (!sizesBox || !def || !list.length) { if (sizesBox) sizesBox.hidden = true; return false; }
    sizesBox.hidden = false;
    if (emptyBox) emptyBox.hidden = true;
    const n = list.length;
    const facts = def.facts(list);
    $('[data-sizes-facts]', sizesBox).innerHTML = [`${n} ${plural(n, ['позиция', 'позиции', 'позиций'])}`, ...facts].map((f) => `<li>${esc(f)}</li>`).join('');
    // the same numbers, up in the hero: what the table holds, without opening it
    if (heroFacts) {
      const items = [['Размеров в таблице', String(n)], ...facts.map((f) => { const i = f.indexOf(' '); return [f.slice(0, i).replace(/^./, (c) => c.toUpperCase()), f.slice(i + 1)]; })];
      heroFacts.innerHTML = `<dl>${items.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl><a class="link link--row" href="#sizes">Таблица размеров ${icon('i-chevron-down')}</a>`;
      heroFacts.hidden = false;
    }
    const caption = $('[data-sizes-caption]', sizesBox); if (caption) caption.textContent = `Таблица размеров: ${products.find((p) => p.id === id)?.name || ''}`;

    const toggle = $('[data-sizes-toggle]', sizesBox), label = $('[data-sizes-toggle-label]', sizesBox), panel = $('[data-sizes-panel]', sizesBox);
    const head = $('[data-sizes-head]', sizesBox), body = $('[data-sizes-body]', sizesBox);
    const search = $('[data-sizes-search]', sizesBox), filter = $('[data-sizes-filter]', sizesBox), count = $('[data-sizes-count]', sizesBox);
    const scroll = $('.sizes__scroll', sizesBox), hint = $('.sizes__hint', sizesBox), empty = $('[data-sizes-empty]', sizesBox);
    const types = [...new Set(list.map((r) => r.type).filter(Boolean))];
    let type = '', built = false;
    if (def.hint) search.placeholder = def.hint.replace(/^./, (c) => c.toUpperCase());
    // the sideways hint shows only when the table really scrolls
    const syncHint = () => { if (hint && scroll) hint.hidden = !(scroll.scrollWidth > scroll.clientWidth + 2) || scroll.hidden; };

    const draw = () => {
      const q = norm(search.value);
      const rows = list.filter((r) => (!type || r.type === type) && (!q || norm(def.key(r)).includes(q)));
      let prev = null;
      // rows of one size form a group: a rule above it, the repeated size in a quieter tone
      body.innerHTML = rows.map((r) => {
        const g = def.group ? def.group(r) : null;
        const first = g === null || g !== prev;
        const cls = g !== null && prev !== null && g !== prev ? ' class="grp"' : '';
        prev = g;
        return `<tr${cls}>${def.cols.map(([, f, isNum], i) => `<td${isNum ? ' class="sizes__n"' : i === 0 && !first ? ' class="sizes__rep"' : ''}>${f(r)}</td>`).join('')}</tr>`;
      }).join('');
      scroll.hidden = !rows.length;
      empty.hidden = !!rows.length;
      if (!rows.length) empty.innerHTML = `${icon('i-search')}<span>${TUBES[id] ? 'Такого размера нет в таблице. Трубу можем изготовить в размер заказчика —' : 'Такого размера нет в таблице —'} <a class="link" href="#request">напишите, что нужно</a>.</span>`;
      count.textContent = rows.length === n ? `${n} ${plural(n, ['позиция', 'позиции', 'позиций'])}` : `Найдено ${rows.length} из ${n}`;
      syncHint();
    };
    const build = () => {
      if (built) return; built = true;
      head.innerHTML = `<tr>${def.cols.map(([t, , isNum]) => `<th scope="col"${isNum ? ' class="sizes__n"' : ''}>${esc(t)}</th>`).join('')}</tr>`;
      if (types.length > 1) {
        filter.innerHTML = [['', 'Все'], ...types.map((t) => [t, t])].map(([v, t]) => `<button class="sizes__seg" type="button" data-type="${esc(v)}" aria-pressed="${v === '' ? 'true' : 'false'}">${esc(t)}</button>`).join('');
        filter.addEventListener('click', (e) => { const b = e.target.closest('[data-type]'); if (!b) return; type = b.dataset.type; $$('[data-type]', filter).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
      } else filter.hidden = true;
      search.addEventListener('input', draw);
      window.addEventListener('resize', syncHint);
      draw();
    };
    const setOpen = (open) => {
      if (open) build();
      sizesBox.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Свернуть таблицу' : 'Показать таблицу';
      if (open) panel.removeAttribute('inert'); else { if (panel.contains(document.activeElement)) toggle.focus(); panel.setAttribute('inert', ''); }
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    // the whole summary bar opens the table; in-page links to #sizes land on an open table
    $('.sizes__bar', sizesBox).addEventListener('click', (e) => { if (!e.target.closest('button, a')) setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    $$('a[href="#sizes"]').forEach((a) => a.addEventListener('click', () => setOpen(true)));
    if (location.hash === '#sizes') setOpen(true);
    return true;
  };

  if (product) {
    page.dataset.state = 'product';
    setText(crumb, product.name);
    if (marker) marker.hidden = false;
    setText(markerText, 'В наличии');
    setLines(h1, product.name);
    setText(lead, product.lead || product.short || '');
    setLink(ctaMain, '#request', 'Запросить сортамент и цены', true);
    if (CALC[product.id]) setLink(ctaAlt, 'calculator.html', 'Рассчитать вес'); else setLink(ctaAlt, 'catalog.html', 'Весь каталог');
    setImage(product);
    showGost(product.gost);
    setText(emptyTitle, 'Характеристики и сортамент');
    setText(emptyText, TUBES[product.id]
      ? 'Таблицу размеров и толщин добавим, когда загрузим каталог. Трубу можем сделать в размер заказчика — по длине и толщине стенки; сортамент и цены высылаем по запросу.'
      : 'Таблицу размеров добавим, когда загрузим каталог. Пока сортамент и цены по этой позиции высылаем по запросу — ответим в рабочее время.');
    setLink(emptyCta, '#request', 'Запросить сортамент и цены');
    renderSizes(product.id);
    renderOthers(products.filter((p) => p.id !== product.id), 'Другие позиции');
    setMeta({
      title: `${product.name} — Fair Metal`,
      description: `${product.name}: ${product.lead || product.short || ''} Со склада в Ташкенте, продукция по ГОСТ. Сортамент и цены — по запросу.`,
      query: product.id,
    });
  } else {
    page.dataset.state = 'empty';
    setText(crumb, 'Позиция не найдена');
    setLines(h1, 'Позиция не найдена');
    // no product, no product photo and no standards band: the hero leads straight to the list
    if (heroMedia) heroMedia.hidden = true;
    const spec = $('.spec', page); if (spec) spec.hidden = true;
    setText(lead, 'Такой позиции в каталоге нет. Выберите нужную из списка ниже или напишите, что требуется, — подготовим предложение.');
    setLink(ctaMain, 'catalog.html', 'Открыть каталог', true);
    setLink(ctaAlt, '#request', 'Оставить заявку');
    showGost(null);
    setText(emptyTitle, 'Позиция не найдена');
    setText(emptyText, 'Проверьте адрес страницы или откройте каталог — там все позиции со склада в Ташкенте.');
    setLink(emptyCta, 'catalog.html', 'Перейти в каталог');
    renderOthers(products, 'Все позиции');
    setMeta({
      title: 'Позиция не найдена — Fair Metal',
      description: 'Такой позиции в каталоге нет. Все позиции со склада Fair Metal в Ташкенте — в каталоге.',
      query: '',
      noindex: true,
    });
  }
  if (FM.typo) FM.typo(page);
})();
