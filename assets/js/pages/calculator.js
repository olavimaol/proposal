/* Weight calculator component. Mounts into every [data-calc]; the home page uses the compact variant.
   Theoretical mass, steel density 7850 kg/m³ (the standard GOST formulas):
   profile tube  m [kg/m] = 0.0157 · s · (a + b − 2.86 · s)
   round tube    m [kg/m] = 0.02466 · s · (D − s)
   sheet         m [kg]   = t · w · l · 7.85 / 1 000 000   (mm) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fmt = (n, d = 2) => (isFinite(n) ? n.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');
  const range = (n) => n.toLocaleString('ru-RU', { maximumFractionDigits: 2 });

  const TYPES = {
    profile: {
      label: 'Профильная труба', icon: 'i-sec-square', art: 'rect',
      fields: [
        { k: 'a', label: 'Сторона A', unit: 'мм', v: 40, min: 10, max: 400 },
        { k: 'b', label: 'Сторона B', unit: 'мм', v: 40, min: 10, max: 400 },
        { k: 's', label: 'Толщина стенки', unit: 'мм', v: 2, min: 0.5, max: 20, step: 0.1 },
        { k: 'l', label: 'Длина', unit: 'м', v: 6, min: 0.1, max: 100, step: 0.1 },
        { k: 'n', label: 'Количество', unit: 'шт', v: 1, min: 1, max: 100000, step: 1 },
      ],
      calc: (f) => { const pm = 0.0157 * f.s * (f.a + f.b - 2.86 * f.s); return { perMeter: pm, total: pm * f.l * f.n, perTon: pm > 0 ? 1000 / pm : NaN }; },
    },
    round: {
      label: 'Круглая труба', icon: 'i-sec-round', art: 'round',
      fields: [
        { k: 'd', label: 'Наружный диаметр', unit: 'мм', v: 57, min: 5, max: 1420 },
        { k: 's', label: 'Толщина стенки', unit: 'мм', v: 3, min: 0.5, max: 40, step: 0.1 },
        { k: 'l', label: 'Длина', unit: 'м', v: 6, min: 0.1, max: 100, step: 0.1 },
        { k: 'n', label: 'Количество', unit: 'шт', v: 1, min: 1, max: 100000, step: 1 },
      ],
      calc: (f) => { const pm = 0.02466 * f.s * (f.d - f.s); return { perMeter: pm, total: pm * f.l * f.n, perTon: pm > 0 ? 1000 / pm : NaN }; },
    },
    sheet: {
      label: 'Лист г/к', icon: 'i-sec-sheet', art: 'sheet',
      fields: [
        { k: 't', label: 'Толщина', unit: 'мм', v: 2, min: 0.5, max: 200, step: 0.1 },
        { k: 'w', label: 'Ширина', unit: 'мм', v: 1250, min: 100, max: 4000 },
        { k: 'l', label: 'Длина', unit: 'мм', v: 2500, min: 100, max: 12000 },
        { k: 'n', label: 'Количество', unit: 'шт', v: 1, min: 1, max: 100000, step: 1 },
      ],
      calc: (f) => { const one = f.t * f.w * f.l * 7.85 / 1e6; return { perSheet: one, total: one * f.n, perTon: one > 0 ? 1000 / one : NaN, area: (f.w * f.l * f.n) / 1e6 }; },
    },
  };

  const icon = (id) => `<svg class="ic" aria-hidden="true"><use href="assets/img/icons.svg#${id}"/></svg>`;

  $$('[data-calc]').forEach((mount, idx) => {
    const compact = mount.dataset.calc === 'compact';
    const uid = `calc${idx}`;
    const keys = Object.keys(TYPES);
    mount.classList.add('calc', compact ? 'calc--compact' : 'calc--full');
    const out = (key, unit) => `<span data-out="${key}">—</span><small class="calc__unit">${unit}</small>`;
    const note = '<p class="calc__note small">Расчёт теоретический, по стандартным формулам ГОСТ при плотности стали 7&nbsp;850&nbsp;кг/м³. Фактический вес партии уточняется по сертификату.</p>';
    mount.innerHTML = `
      <div class="calc__tabs tabs" role="tablist" aria-label="Тип проката">
        ${keys.map((k, i) => `<button class="tab" role="tab" type="button" id="${uid}-tab-${k}" aria-controls="${uid}-panel-${k}" aria-selected="${i === 0}">${icon(TYPES[k].icon)}<span>${TYPES[k].label}</span></button>`).join('')}
      </div>
      ${keys.map((k) => {
        const t = TYPES[k];
        return `<div class="calc__panel tabpanel" role="tabpanel" id="${uid}-panel-${k}" aria-labelledby="${uid}-tab-${k}" tabindex="0" data-type="${k}">
          <div class="calc__grid">
            <div class="calc__in">
              <form class="calc__form" novalidate>
                ${t.fields.map((f) => `
                  <label class="calc__field">
                    <span class="calc__label">${f.label}</span>
                    <span class="calc__control"><input class="input calc__input" type="number" inputmode="decimal" name="${f.k}" value="${f.v}" min="${f.min}" max="${f.max}" step="${f.step || 1}" aria-describedby="${uid}-${k}-${f.k}-h"><span class="calc__suffix">${f.unit}</span></span>
                    <span class="calc__hint" id="${uid}-${k}-${f.k}-h">от ${range(f.min)} до ${range(f.max)} ${f.unit}</span>
                  </label>`).join('')}
              </form>
              ${note}
            </div>
            <div class="calc__out" aria-live="polite">
              <div class="calc__art art--metal" data-art="${t.art}" data-weld></div>
              <dl class="calc__result">
                ${k === 'sheet'
                  ? `<div><dt>Вес одного листа</dt><dd>${out('perSheet', 'кг')}</dd></div>
                     <div><dt>Площадь</dt><dd>${out('area', 'м²')}</dd></div>`
                  : `<div><dt>Вес одного метра</dt><dd>${out('perMeter', 'кг')}</dd></div>
                     <div><dt>Метров в тонне</dt><dd>${out('perTon', 'м')}</dd></div>`}
                <div class="calc__total"><dt>Общий вес</dt><dd>${out('total', 'кг')}</dd></div>
              </dl>
              ${compact ? '' : `<a class="btn btn--sm btn--outline calc__send" href="contacts.html#request">Отправить расчёт менеджеру ${icon('i-arrow-right')}</a>`}
            </div>
          </div>
        </div>`;
      }).join('')}`;

    // Live results
    $$('.calc__panel', mount).forEach((panel) => {
      const type = TYPES[panel.dataset.type];
      const form = $('form', panel);
      const outs = $$('[data-out]', panel);
      const update = () => {
        const f = {};
        let ok = true;
        $$('input', form).forEach((inp) => {
          const v = parseFloat(String(inp.value).replace(',', '.'));
          const bad = !isFinite(v) || v < +inp.min || v > +inp.max;
          inp.setAttribute('aria-invalid', bad ? 'true' : 'false');
          if (bad) ok = false;
          f[inp.name] = v;
        });
        const r = ok ? type.calc(f) : {};
        outs.forEach((o) => {
          const key = o.dataset.out;
          const v = ok ? fmt(r[key], key === 'perTon' ? 0 : 2) : '—';
          if (o.textContent === v) return;
          o.textContent = v;
          // a short fade on the total says "recalculated" (opacity only, so reduced motion keeps it)
          if (key === 'total') { o.classList.remove('is-tick'); void o.offsetWidth; o.classList.add('is-tick'); }
        });
        panel.classList.toggle('is-invalid', !ok);
      };
      form.addEventListener('input', update);
      form.addEventListener('submit', (e) => e.preventDefault());
      update();
    });

    if (window.FM && window.FM.mountArt) window.FM.mountArt(mount);
    // Tab wiring lives in main.js ([role=tablist]); re-run it for markup inserted after load
    if (window.FM && window.FM.initTabs) window.FM.initTabs(mount);
  });
})();
