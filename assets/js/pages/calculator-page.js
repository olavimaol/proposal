/* Calculator page: the hero shortcuts open the matching calculator tab, then the anchor scrolls to it;
   the shortcut of the open tab is marked. Tabs are rendered by pages/calculator.js and wired by main.js,
   both loaded before this file. */
(() => {
  'use strict';
  const links = Array.from(document.querySelectorAll('[data-calc-type]'));
  links.forEach((link) => {
    link.addEventListener('click', () => {
      const tab = document.querySelector(`[role="tab"][id$="-tab-${link.dataset.calcType}"]`);
      if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();
    });
  });
  const mark = (id) => links.forEach((l) => { if (id && id.endsWith('-tab-' + l.dataset.calcType)) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
  const list = document.querySelector('.calcp-tool [role="tablist"]');
  if (list) {
    list.addEventListener('tabchange', (e) => mark(e.detail.id));
    const sel = list.querySelector('[aria-selected="true"]');
    mark(sel && sel.id);
  }
})();
