/* Mobile-first compact settings. Structure-only enhancement: keep all existing
 * buttons/handlers and local data untouched. */
(function () {
  'use strict';

  function initCompactAppearance() {
    var root = document.getElementById('settingsSec_appearance');
    if (!root || root.dataset.compactReady === 'true') return;

    var paletteGroup = root.querySelector('.appearance-settings-block');
    var iconGroup = paletteGroup && paletteGroup.nextElementSibling;
    var mode = root.querySelector('.appearance-mode-row');
    var preview = root.querySelector('#settingsThemePreview');
    var palettes = root.querySelector('.appearance-palette-grid');
    var icons = root.querySelector('.appearance-icon-grid');
    var fonts = root.querySelector('.settings-font-grid');
    var sizeStyle = root.querySelector('.settings-size-style-grid');
    var cardButtons = root.querySelector('#cardStyleButtonsContainer');
    var paletteBadge = root.querySelector('#activeThemeBadge');
    var iconBadge = root.querySelector('#activeIconThemeBadge');
    var fontBadge = root.querySelector('#activeFontBadge');
    var sizeBadge = root.querySelector('#activeFontSizeBadge');

    // Stop rather than damaging an older or unexpected layout.
    if (![paletteGroup, iconGroup, mode, preview, palettes, icons,
          fonts, sizeStyle, cardButtons, paletteBadge, iconBadge, fontBadge,
          sizeBadge].every(Boolean) || sizeStyle.children.length !== 2) return;

    var fontGroup = fonts.parentElement;
    var sizeTile = sizeStyle.children[0];
    var styleTile = sizeStyle.children[1];

    function makeSection(name, label, icon, selected) {
      var section = document.createElement('section');
      section.className = 'compact-appearance-section';
      section.dataset.appearanceSection = name;

      var heading = document.createElement('h4');
      heading.className = 'compact-appearance-heading';
      heading.id = 'compactAppearanceHeading-' + name;
      heading.innerHTML =
        '<i class="compact-appearance-heading-icon fa-solid ' + icon + '" aria-hidden="true"></i>' +
        '<span class="compact-appearance-title">' + label + '</span>';

      var summary = selected || document.createElement('span');
      summary.classList.add('compact-appearance-summary');
      heading.appendChild(summary);

      var panel = document.createElement('div');
      panel.className = 'compact-appearance-panel compact-appearance-' + name + '-panel';
      panel.id = 'compactAppearancePanel-' + name;
      section.setAttribute('aria-labelledby', heading.id);

      section.append(heading, panel);
      return { section: section, panel: panel, summary: summary };
    }

    var basics = makeSection('basics', 'الوضع والمعاينة', 'fa-circle-half-stroke');
    var colors = makeSection('colors', 'ألوان التطبيق', 'fa-palette', paletteBadge);
    var iconColors = makeSection('icons', 'ألوان الأيقونات', 'fa-icons', iconBadge);
    var typography = makeSection('font', 'الخط وحجم النص', 'fa-font', fontBadge);
    var cards = makeSection('cards', 'تصميم الكروت', 'fa-layer-group');

    // Move rather than recreate: the original inline onClick handlers and IDs survive.
    basics.panel.append(mode, preview);
    colors.panel.append(palettes);
    iconColors.panel.append(icons);
    typography.panel.append(fontGroup, sizeTile);
    cards.panel.append(styleTile);
    root.replaceChildren(
      basics.section, colors.section, iconColors.section,
      typography.section, cards.section
    );
    root.dataset.compactReady = 'true';

    var fontTitle = fontGroup.querySelector(':scope > div:first-child');
    if (fontTitle) fontTitle.hidden = true;

    var cardNames = {
      glass:'زجاجي', minimal:'بسيط', neumorphic:'مجسّم', neon:'نيون',
      clear:'واضح', elevated:'مرتفع', outlined:'محدّد',
      gradient:'متدرّج', flat:'مسطح', facebook:'فيسبوك', compact:'مدمج', soft:'ناعم'
    };
    function updateSummaries() {
      basics.summary.textContent = document.body.classList.contains('light-theme') ? 'فاتح' : 'داكن';
      var chosen = document.body.getAttribute('data-card-style') || 'glass';
      cards.summary.textContent = cardNames[chosen] || 'زجاجي';
      // Keep the existing app-maintained font badge and expose size in its tooltip.
      typography.summary.title = 'حجم الخط: ' + (sizeBadge.textContent || '').trim();
    }

    root.addEventListener('click', function (event) {
      if (event.target.closest('.appearance-mode-button, .font-size-pill, .appearance-palette-grid button, .appearance-icon-grid button, #cardStyleButtonsContainer button, .settings-font-grid button')) {
        requestAnimationFrame(updateSummaries);
      }
    });
    new MutationObserver(updateSummaries).observe(document.body, {
      attributes: true, attributeFilter: ['data-card-style', 'data-color-mode']
    });
    updateSummaries();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCompactAppearance, {once: true});
  } else {
    initCompactAppearance();
  }
}());


/* Contrast guard for dynamically rendered expense amounts.
 * The app rebuilds and recolors category cards when settings change.
 * Reassert accessible amount styles after those updates, without touching data. */
(function () {
  'use strict';
  function install() {
    const page = document.getElementById('viewExpenses');
    if (!page || page.dataset.expenseContrastGuard === '1') return;
    page.dataset.expenseContrastGuard = '1';
    let queued = false;
    function apply() {
      queued = false;
      const light = document.body.classList.contains('light-theme');
      page.querySelectorAll('.cat-card-bottom-half').forEach(footer => {
        const spent = footer.classList.contains('has-spent');
        const key = (light ? 'light' : 'dark') + ':' + (spent ? 'spent' : 'zero');
        const bg = light ? '#f8fafc' : '#111e34';
        const fg = spent ? (light ? '#b91c1c' : '#fecaca') : (light ? '#172033' : '#f8fafc');
        const fresh = footer.dataset.expenseContrastMode !== key;
        if (fresh || footer.style.getPropertyPriority('background') !== 'important') {
          footer.style.setProperty('background', bg, 'important');
          footer.style.setProperty('transition', 'none', 'important');
          footer.style.setProperty('border-top-color', light ? '#cbd5e1' : '#475569', 'important');
        }
        footer.dataset.expenseContrastMode = key;
        footer.querySelectorAll('.cat-amount-val, .cat-number-val, .cat-currency-label, .cat-amount-sign').forEach(el => {
          if (fresh || el.style.getPropertyPriority('color') !== 'important') {
            el.style.setProperty('color', fg, 'important');
            el.style.setProperty('opacity', '1', 'important');
          }
        });
      });
    }
    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    }
    new MutationObserver(schedule).observe(page, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['style', 'class']
    });
    new MutationObserver(schedule).observe(document.body, {
      attributes: true, attributeFilter: ['class', 'data-color-mode']
    });
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();


/* v5.3.90 — Live style bridge for lists and cards already rendered with inline
 * important styles. Never changes financial data or mutates transaction state.
 * CSS alone cannot override the inline important styles used by legacy cards. */
(function () {
  'use strict';
  const selector = [
    '#catGrid .cat-card', '.ops-tx-card-clean', '.expected-clean-card',
    '.budget-item-card', '.req-alloc-card-item', '.req-card-lux',
    '.app-card-panel', '.summary-card', '.summary-group-row',
    '.wallet-card-lux', '.gold-item-row', '.dashboard-card',
    '.ops-card', '.chart-glass-panel', '.note-item-card', '.project-budget-result'
  ].join(',');
  const original = new WeakMap();
  const props = ['border-radius','box-shadow','background','border-color','border-width','backdrop-filter'];
  let queued = false;

  function applyStyle() {
    queued = false;
    if (!document.body) return;
    const active = document.body.getAttribute('data-card-style') || 'glass';
    const light = document.body.classList.contains('light-theme');
    const base = light ? '#ffffff' : '#17243a';
    const muted = light ? '#f8fafc' : '#1d2d45';
    const border = light ? '#cbd5e1' : '#475569';
    const accent = light ? '#0284c7' : '#38bdf8';
    const presets = {
      glass: {radius:'16px',shadow: light ? '0 5px 16px rgba(15,23,42,.07)' : '0 6px 20px rgba(0,0,0,.24)', border: light ? '#d8e2ec' : '#475569',blur:'blur(10px)'},
      minimal: {radius:'8px',shadow:'none',background:base,border},
      neumorphic: {radius:'18px',shadow:light ? '7px 7px 17px #d7dde5,-7px -7px 17px #ffffff' : '6px 6px 14px #0b1524,-6px -6px 14px #273750',background:muted,border},
      neon: {radius:'14px',shadow:light ? '0 0 0 2px #0284c744,0 4px 16px #0284c722' : '0 0 0 2px #38bdf866,0 0 22px #38bdf844',border:accent,width:'2px'},
      clear: {radius:'12px',shadow:'none',background:base,border:light?'#94a3b8':'#94a3b8',width:'1.5px'},
      flat: {radius:'6px',shadow:'none',background:base,border},
      elevated: {radius:'20px',shadow:light?'0 12px 25px rgba(15,23,42,.15)':'0 14px 30px rgba(0,0,0,.48)',border},
      outlined: {radius:'10px',shadow:'none',border:accent,width:'2px'},
      gradient: {radius:'18px',shadow:light?'0 6px 17px #2563eb21':'0 8px 22px #0006',background:light?'linear-gradient(145deg,#fff,#e9f2ff)':'linear-gradient(145deg,#203c5c,#152338)',border},
      facebook: {radius:'8px',shadow:'0 1px 3px rgba(0,0,0,.10)',background:base,border:light?'#ced0d4':'#495466',width:'1px'}
    };
    const preset = presets[active] || presets.glass;
    document.querySelectorAll(selector).forEach(el => {
      const stamp = active + (light ? ':light' : ':dark');
      if (el.dataset.appearanceApplied === stamp) return;
      if (!original.has(el)) {
        original.set(el, Object.fromEntries(props.map(p => [p, {
          value:el.style.getPropertyValue(p), priority:el.style.getPropertyPriority(p)
        }])));
      }
      const initial = original.get(el);
      for (const property of props) {
        // Restore original properties before applying the new style.
        const orig = initial[property];
        if (orig.value) el.style.setProperty(property, orig.value, orig.priority);
        else el.style.removeProperty(property);
      }
      el.style.setProperty('border-radius',preset.radius,'important');
      el.style.setProperty('box-shadow',preset.shadow,'important');
      if (preset.background) el.style.setProperty('background',preset.background,'important');
      // Preserve warnings (red/orange expense and budget borders).
      if (!el.classList.contains('budget-pulse-alert') && !el.classList.contains('over-budget')) {
        el.style.setProperty('border-color',preset.border,'important');
        if (preset.width) el.style.setProperty('border-width',preset.width,'important');
      }
      if (preset.blur) el.style.setProperty('backdrop-filter',preset.blur,'important');
      el.dataset.appearanceApplied = stamp;
    });
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(applyStyle);
  }
  function init() {
    if (!document.body) return;
    new MutationObserver(schedule).observe(document.body, {
      attributes:true,attributeFilter:['data-card-style','class','data-color-mode']
    });
    // Renderers replace list/card nodes after changing periods or filters.
    for (const id of ['catGrid','viewOperations','viewExpected','panelMonthlyBudget','viewExpenses']) {
      const host = document.getElementById(id);
      if (host) new MutationObserver(schedule).observe(host,{childList:true,subtree:true});
    }
    schedule();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
