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

    function makeSection(name, label, icon, selected, initiallyOpen) {
      var section = document.createElement('section');
      section.className = 'compact-appearance-section' + (initiallyOpen ? ' is-open' : '');
      section.dataset.appearanceSection = name;

      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'compact-appearance-toggle';
      toggle.id = 'compactAppearanceToggle-' + name;
      toggle.setAttribute('aria-controls', 'compactAppearancePanel-' + name);
      toggle.setAttribute('aria-expanded', initiallyOpen ? 'true' : 'false');
      toggle.innerHTML =
        '<i class="compact-appearance-heading-icon fa-solid ' + icon + '" aria-hidden="true"></i>' +
        '<span class="compact-appearance-title">' + label + '</span>';

      var summary = selected || document.createElement('span');
      summary.classList.add('compact-appearance-summary');
      toggle.appendChild(summary);

      var chevron = document.createElement('i');
      chevron.className = 'compact-appearance-chevron fa-solid fa-chevron-down';
      chevron.setAttribute('aria-hidden', 'true');
      toggle.appendChild(chevron);

      var panel = document.createElement('div');
      panel.className = 'compact-appearance-panel compact-appearance-' + name + '-panel';
      panel.id = 'compactAppearancePanel-' + name;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', toggle.id);
      panel.hidden = !initiallyOpen;

      toggle.addEventListener('click', function () {
        var shouldOpen = panel.hidden;
        panel.hidden = !shouldOpen;
        section.classList.toggle('is-open', shouldOpen);
        toggle.setAttribute('aria-expanded', String(shouldOpen));
      });

      section.append(toggle, panel);
      return { section: section, panel: panel, summary: summary, toggle: toggle };
    }

    var basics = makeSection('basics', 'الوضع والمعاينة', 'fa-circle-half-stroke', null, true);
    var colors = makeSection('colors', 'ألوان التطبيق', 'fa-palette', paletteBadge, false);
    var iconColors = makeSection('icons', 'ألوان الأيقونات', 'fa-icons', iconBadge, false);
    var typography = makeSection('font', 'الخط وحجم النص', 'fa-font', fontBadge, false);
    var cards = makeSection('cards', 'تصميم الكروت', 'fa-layer-group', null, false);

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
      gradient:'متدرّج', compact:'مدمج', soft:'ناعم'
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
