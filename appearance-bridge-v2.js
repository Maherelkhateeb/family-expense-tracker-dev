(function () {
  'use strict';
  const appearance = window.FamilyAppearanceV2;
  if (!appearance) { console.warn('Appearance v2 module is unavailable'); return; }
  const KEY = 'family_monefy_appearance_v2';
  const choices = {
    cardStyle: [
      ['classic', 'كلاسيكي'], ['facebook', 'فيسبوك'], ['modern', 'عصري'],
      ['flat', 'مسطح'], ['gradient', 'متدرج'], ['luxury', 'فاخر']
    ],
    mode: [['light', 'فاتح'], ['dark', 'داكن']]
  };
  const allowHex = value => /^#[0-9a-f]{6}$/i.test(value || '');
  // One-time reset for every installation: retire ALL earlier visual selections.
  // This affects appearance only, never transactions or financial data.
  const stored = (() => { try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch(e) { return {}; } })();
  const migrated = stored.appearanceDefaultVersion === 3;
  const data = {
    appearanceDefaultVersion: 3,
    palette: migrated && appearance.palettes.some(p => p.id === stored.palette) ? stored.palette : 'facebook',
    cardStyle: migrated && appearance.cardStyles.includes(stored.cardStyle) ? stored.cardStyle : 'facebook',
    cardColor: migrated && appearance.cardColors.some(c => c.id === stored.cardColor) ? stored.cardColor : 'auto',
    mode: migrated && ['light','dark'].includes(stored.mode) ? stored.mode : 'light',
    customBackground: migrated && allowHex(stored.customBackground) ? stored.customBackground : '#FFFFFF',
    customAccent: migrated && allowHex(stored.customAccent) ? stored.customAccent : '#0866FF'
  };
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e) { console.warn('Appearance preference could not be saved', e); }
  }
  function update(key, value) {
    data[key] = value; persist(); apply();
  }
  function styleVars(style, values) {
    Object.entries(values).forEach(([key, value]) => style.setProperty(key, value, 'important'));
  }
  function paletteOptions() {
    return appearance.palettes.map(p => [p.id, p.label, p.primary]);
  }
  function renderButtons(target, group, options) {
    if (!target) return;
    target.replaceChildren();
    for (const [value, label, swatch] of options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'family-appearance-choice';
      button.textContent = label;
      button.setAttribute('aria-pressed', value === data[group] ? 'true' : 'false');
      button.addEventListener('click', () => update(group, value));
      if (swatch) {
        const dot = document.createElement('span');
        dot.className = 'appearance-swatch';
        dot.style.backgroundColor = swatch;
        dot.setAttribute('aria-hidden', 'true');
        button.prepend(dot);
      }
      target.appendChild(button);
    }
  }
  function extraControls() {
    const panel = document.getElementById('cardStyleButtonsContainer');
    if (!panel || !panel.parentElement) return;
    let extra = document.getElementById('familyAppearanceV2Extra');
    if (!extra) {
      extra = document.createElement('div');
      extra.id = 'familyAppearanceV2Extra';
      extra.className = 'family-appearance-extra';
      panel.parentElement.appendChild(extra);
    }
    extra.replaceChildren();
    function addGroup(label, group, opts) {
      const title = document.createElement('label');
      title.textContent = label;
      const grid = document.createElement('div');
      grid.className = 'family-appearance-group';
      renderButtons(grid, group, opts);
      extra.append(title, grid);
    }
    addGroup('لون البطاقات', 'cardColor', appearance.cardColors.map(c => [c.id, c.label, c.background || '']));
    addGroup('وضع العرض', 'mode', choices.mode);
    if (data.cardColor === 'custom') {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '8px';
      for (const [key, label] of [['customBackground','خلفية البطاقة'], ['customAccent','لون التمييز']]) {
        const wrap = document.createElement('label');
        wrap.style.flex = '1';
        wrap.textContent = label + ' ';
        const input = document.createElement('input');
        input.type = 'color'; input.value = data[key];
        input.setAttribute('aria-label', label);
        input.addEventListener('input', () => { data[key] = input.value; persist(); apply(false); });
        wrap.appendChild(input); row.appendChild(wrap);
      }
      extra.appendChild(row);
    }
  }
  function render() {
    const oldPalette = document.getElementById('themeOptFacebook');
    const paletteGrid = oldPalette && oldPalette.parentElement;
    if (paletteGrid) {
      paletteGrid.id = 'familyAppearancePaletteGrid';
      renderButtons(paletteGrid, 'palette', paletteOptions());
      const settings = document.getElementById('settingsSec_appearance');
      if (settings) {
        const label = Array.from(settings.querySelectorAll('span')).find(e => e.textContent && e.textContent.includes('لون التطبيق ونمطه (16 سمة)'));
        if (label) label.textContent = 'ألوان التطبيق (6 لوحات)';
      }
    } else {
      renderButtons(document.getElementById('familyAppearancePaletteGrid'), 'palette', paletteOptions());
    }
    renderButtons(document.getElementById('themeCardsGrid'), 'palette', paletteOptions());
    renderButtons(document.getElementById('cardStyleButtonsContainer'), 'cardStyle', choices.cardStyle);
    extraControls();
    const activeBadge = document.getElementById('activeThemeBadge');
    const palette = appearance.palettes.find(p => p.id === data.palette);
    if (activeBadge && palette) activeBadge.textContent = palette.label;
  }
  function apply(rerender = true) {
    if (!document.body) return;
    const options = appearance.resolve(data);
    const dark = data.mode === 'dark';
    const bg = options.cardBackground;
    const accent = options.primary; // The chosen palette always controls app buttons and highlights.
    const primaryText = options.cardText;
    const accentText = appearance.readableText(accent);
    const neutral = dark ? '#242526' : '#FFFFFF';
    const input = dark ? '#30343A' : '#F7F8FA';
    const muted = options.secondaryText;
    const pageMuted = dark ? '#B0B3B8' : '#475569';
    const root = document.documentElement;
    root.dataset.appearanceV2 = 'true';
    root.dataset.appearanceCardStyle = data.cardStyle;
    root.setAttribute('data-app-theme', dark ? 'navy' : 'facebook');
    root.setAttribute('data-card-style', data.cardStyle);
    document.body.setAttribute('data-app-theme', dark ? 'navy' : 'facebook');
    document.body.setAttribute('data-card-style', data.cardStyle);
    document.body.classList.toggle('light-theme', !dark);
    if (window.state) window.state.appTheme = dark ? 'navy' : 'facebook';
    const vars = {
      '--v2-page': options.pageBackground, '--v2-card': bg,
      '--v2-card-alt': options.gradientEnd,
      '--v2-header': neutral, '--v2-input': input,
      '--v2-text': dark ? '#F9FAFB' : '#111827',
      '--v2-card-text': primaryText, '--v2-muted': muted,
      '--v2-page-muted': pageMuted, '--v2-card-icon': options.cardIcon,
      '--v2-card-accent': options.accent, '--v2-brand': accent,
      '--v2-border': dark ? '#596271' : '#CBD5E1',
      '--v2-accent': accent, '--v2-accent-text': accentText,
      '--bg-app': options.pageBackground, '--bg-card': bg,
      '--bg-card-sub': bg, '--accent': accent, '--primary': accent,
      '--text-main': dark ? '#F9FAFB' : '#111827', '--text-muted': pageMuted,
      '--border': dark ? '#596271' : '#CBD5E1',
      '--header-bg': neutral, '--nav-bg': neutral, '--body-bg': options.pageBackground
    };
    styleVars(root.style, vars);
    styleVars(document.body.style, vars);
    document.body.style.setProperty('background', options.pageBackground, 'important');
    root.style.setProperty('background', options.pageBackground, 'important');
    const frame = document.getElementById('appFrame');
    if (frame) frame.style.setProperty('background', options.pageBackground, 'important');
    if (rerender) render();
  }
  function init() {
    if (!migrated) persist(); // one-time Facebook default, including existing users
    apply();
    // Appearance is purely visual: never modify transactions, balances, wallets, or backup keys.
    window.FamilyAppearanceBridgeV2 = Object.freeze({
      getSettings: () => ({ ...data }), apply, set: (key, value) => {
        if (key === 'palette' && !appearance.palettes.some(p => p.id === value)) return;
        if (key === 'cardStyle' && !appearance.cardStyles.includes(value)) return;
        if (key === 'cardColor' && !appearance.cardColors.some(c => c.id === value)) return;
        if (key === 'mode' && !['light','dark'].includes(value)) return;
        if (['palette','cardStyle','cardColor','mode'].includes(key)) update(key, value);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  window.addEventListener('pageshow', () => apply());
})();
