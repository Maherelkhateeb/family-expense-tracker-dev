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


/* v5.3.92 — Live settings preview: previous settings modal was styled with
   fixed !important colors and fixed card radii, unrelated to the app theme. */
(function () {
  'use strict';
  const palette = {
    facebook:['#0866ff','#102c55','#edf3ff'],
    navy:['#2563eb','#0c2145','#f1f6ff'],
    emerald:['#059669','#0b3635','#ebfaf4'],
    purple:['#7c3aed','#30164f','#f5efff'],
    rose:['#be123c','#441626','#fff0f4'],
    ocean:['#0891b2','#0b3444','#effbfe'],
    gold:['#b45309','#462b12','#fff6e8'],
    slate:['#64748b','#253345','#f0f4f7'],
    midnight:['#4338ca','#1f1c4a','#f0efff'],
    sapphire:['#2563eb','#112c57','#eff6ff']
  };
  const iconColors = {vibrant:'#0284c7',gold:'#b45309',emerald:'#059669',
    ocean:'#0891b2',purple:'#7c3aed',ruby:'#be123c',amber:'#c2410c',
    indigo:'#4338ca',rose:'#db2777',silver:'#64748b'};
  const presets = {
    glass:['15px','0 5px 15px rgba(15,23,42,.14)'],
    minimal:['7px','none'],
    neumorphic:['19px','5px 5px 12px rgba(15,23,42,.19), -3px -3px 12px rgba(255,255,255,.10)'],
    neon:['12px','0 0 14px rgba(56,189,248,.42)'],
    clear:['11px','none'],elevated:['19px','0 10px 22px rgba(15,23,42,.24)'],
    outlined:['9px','none'],gradient:['17px','0 7px 18px rgba(15,23,42,.16)'],
    flat:['3px','none'],facebook:['8px','0 1px 4px rgba(0,0,0,.15)']
  };
  let queued = false;
  function apply() {
    queued = false;
    const root = document.getElementById('settingsModal');
    if (!root) return;
    const theme = document.querySelector('#settingsModal .theme-pill-option.active')?.dataset.theme ||
      (typeof state !== 'undefined' ? state.appTheme : '') ||
      localStorage.getItem('family_monefy_app_theme') || 'emerald';
    const icon = document.querySelector('#settingsModal .icon-theme-pill.active')?.dataset.iconTheme ||
      (typeof state !== 'undefined' ? state.iconTheme : '') || 'emerald';
    const style = document.querySelector('#settingsModal [data-card-style].active')?.dataset.cardStyle ||
      document.body.getAttribute('data-card-style') || 'glass';
    const colors = palette[theme] || palette.emerald, card = presets[style] || presets.glass;
    root.dataset.settingsActiveTheme = theme;
    root.dataset.settingsCardStyle = style;
    root.style.setProperty('--settings-accent', colors[0]);
    root.style.setProperty('--settings-icon', iconColors[icon] || colors[0]);
    root.style.setProperty('--settings-card-radius',card[0]);
    root.style.setProperty('--settings-card-shadow',card[1]);
    root.style.setProperty('--settings-card-border',colors[0]+'75');
    root.style.setProperty('--settings-card-surface-dark',
      style==='gradient' ? 'linear-gradient(132deg,'+colors[1]+',#24365a)' :
      'linear-gradient(145deg,'+colors[1]+',#17243a)');
    root.style.setProperty('--settings-card-surface-light',
      style==='gradient' ? 'linear-gradient(125deg,'+colors[2]+',#e0ebff)' :
      'linear-gradient(145deg,#ffffff,'+colors[2]+')');
    root.style.setProperty('--settings-shell-dark','linear-gradient(165deg,'+colors[1]+',#101b2d)');
    root.style.setProperty('--settings-shell-light','linear-gradient(165deg,#ffffff,'+colors[2]+')');
    root.style.setProperty('--settings-head-dark','linear-gradient(135deg,'+colors[1]+',#1d2940)');
    root.style.setProperty('--settings-head-light','linear-gradient(135deg,#ffffff,'+colors[2]+')');
    // Legacy inline !important styles otherwise leave the actual modal shell
    // white/dark-navy regardless of the selected application palette.
    const light=document.body.classList.contains('light-theme');
    const shell=root.querySelector('.settings-modal-shell.antigravity-settings-shell');
    const head=root.querySelector('.antigravity-settings-head');
    if(shell){
      shell.style.setProperty('background',light
        ? 'linear-gradient(165deg,#ffffff,'+colors[2]+')'
        : 'linear-gradient(165deg,'+colors[1]+',#101b2d)','important');
      shell.style.setProperty('border-color',colors[0]+'75','important');
    }
    if(head)head.style.setProperty('background',light
      ? 'linear-gradient(135deg,#ffffff,'+colors[2]+')'
      : 'linear-gradient(135deg,'+colors[1]+',#1d2940)','important');
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {requestAnimationFrame(apply);});
  }
  function init() {
    const root = document.getElementById('settingsModal');
    if (!root || root.dataset.liveSettingsPreviewReady==='1') return;
    root.dataset.liveSettingsPreviewReady='1';
    root.addEventListener('click',function(e){
      if (e.target.closest('.theme-pill-option,.icon-theme-pill,[data-card-style],.appearance-mode-button')) schedule();
    });
    const appearance = document.getElementById('settingsSec_appearance') || root;
    new MutationObserver(schedule).observe(appearance,{
      subtree:true,attributes:true,attributeFilter:['class','aria-pressed','data-theme','data-card-style']
    });
    new MutationObserver(schedule).observe(document.body,{
      attributes:true,attributeFilter:['class','data-card-style','data-color-mode','data-theme']
    });
    apply();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
}());

/* v5.3.92 — Exact transaction drill-through from monthly budget/comparison.
   Uses current transactions only; never persists demo data or mutates balances.
   Remembers the source view/scroll and restores the native operation filters. */
(function () {
  'use strict';
  let active = null;
  let originalRenderer = null;
  const pad = n => String(n).padStart(2,'0');
  const dateStr = d => [d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-');
  const categoryName = c => {
    try { return getCategoryName(c,'expense') || c; }catch(e){return c || 'كافة البنود';}
  };
  const monthRange = month => {
    if(!/^\d{4}-\d{2}$/.test(String(month||'')))return {from:'',to:''};
    const a=month.split('-').map(Number);
    return {from:month+'-01',to:dateStr(new Date(a[0],a[1],0))};
  };
  function getMonthlyRange(ctx, scope) {
    let month = ctx.month || dateStr(new Date()).slice(0,7);
    if(scope==='benchmark' && ctx.comparisonMode==='period')
      month=ctx.benchmarkMonth || month;
    if(scope==='previous' && ctx.comparisonMode!=='period'){
      const nums=month.split('-').map(Number);
      month=dateStr(new Date(nums[0],nums[1]-2,1)).slice(0,7);
    }
    const base=monthRange(month);
    if(scope==='benchmark'||scope==='previous'||scope==='fullmonth')return base;
    if(ctx.period==='all')return {from:'',to:''};
    if(ctx.period==='custom')return {from:ctx.customStart||base.from,to:ctx.customEnd||base.to};
    if(ctx.period==='today'){const d=dateStr(new Date());return {from:d,to:d};}
    if(ctx.period==='week'){
      const now=new Date();
      const sat=new Date(now.getFullYear(),now.getMonth(),now.getDate()-((now.getDay()+1)%7));
      return {from:dateStr(sat),to:dateStr(now)};
    }
    if(ctx.period==='prev_month'){
      const nums=month.split('-').map(Number);
      return monthRange(dateStr(new Date(nums[0],nums[1]-2,1)).slice(0,7));
    }
    return base;
  }
  function choices() {
    return ['opsFilterCategory','opsFilterMember','opsFilterProject']
      .reduce((result,id)=>{
        const select=document.getElementById(id);
        if(select)result[id]=(typeof getOperationFilterValues==='function')
          ? getOperationFilterValues(id) : Array.from(select.selectedOptions).map(o=>o.value);
        return result;
      },{});
  }
  function setChoices(id,values) {
    const select=document.getElementById(id);
    if(!select)return;
    if(typeof setOperationFilterValues==='function')setOperationFilterValues(id,values);
    else {
      Array.from(select.options).forEach(o=>o.selected=values.length?values.includes(o.value):o.value==='all');
      select.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }
  function preserveFilters() {
    let opsType = 'all';
    try{if(typeof opsTypeFilterState!=='undefined')opsType=opsTypeFilterState;}catch(e){}
    return {period:state.period,custom:state.customDateRange?{...state.customDateRange}:null,
      member:state.currentMemberFilter,wallet:state.currentWalletId,project:state.projectFilter,
      opsType,search:document.getElementById('opsSearchInput')?.value||'',
      choices:choices()};
  }
  function restoreFilters(snapshot) {
    if(!snapshot)return;
    state.period=snapshot.period;
    state.customDateRange=snapshot.custom;
    state.currentMemberFilter=snapshot.member;
    state.currentWalletId=snapshot.wallet;
    state.projectFilter=snapshot.project;
    try{if(typeof opsTypeFilterState!=='undefined')opsTypeFilterState=snapshot.opsType;}catch(e){}
    const search=document.getElementById('opsSearchInput');
    if(search)search.value=snapshot.search;
    Object.keys(snapshot.choices).forEach(id=>setChoices(id,snapshot.choices[id]));
    if(typeof filterOperationsList==='function')filterOperationsList();
  }
  function installRenderer() {
    if(originalRenderer||typeof window.renderOperationsList!=='function')return;
    originalRenderer=window.renderOperationsList;
    window.renderOperationsList=function(filtered,appendMore) {
      if(!active)return originalRenderer.apply(this,arguments);
      const initial=Array.isArray(filtered)?filtered:(state.transactions||[]);
      const exact=initial.filter(t=>active.ids.has(String(t.id)));
      if(!exact.length) {
        const host=document.getElementById('txOperationsList');
        if(host)host.innerHTML='<div class="empty-state" style="padding:25px;text-align:center">لا توجد عمليات فعلية مطابقة لهذا الرقم والفترة.</div>';
        return;
      }
      return originalRenderer.call(this,exact,appendMore);
    };
  }
  function showBanner(label,count) {
    const view=document.getElementById('viewOperations');
    if(!view)return;
    let banner=document.getElementById('budgetDrilldownBanner');
    if(!banner){banner=document.createElement('div');banner.id='budgetDrilldownBanner';view.prepend(banner);}
    banner.replaceChildren();
    const copy=document.createElement('div');copy.className='budget-drill-copy';
    const strong=document.createElement('strong');strong.textContent='تفاصيل موازنة الشهر: '+label;
    const span=document.createElement('span');span.textContent='عدد العمليات المطابقة: '+count+' · المصروفات الفعلية فقط';
    copy.append(strong,span);
    const btn=document.createElement('button');btn.type='button';
    btn.id='budgetDrilldownBack';btn.textContent='العودة إلى نفس المقارنة';
    btn.addEventListener('click',returnToBudget);
    banner.append(copy,btn);
  }
  function clear() {
    const banner=document.getElementById('budgetDrilldownBanner');
    if(banner)banner.remove();
    active=null;
  }
  function gotoBudgetTab(source) {
    if(typeof switchAppPage==='function')switchAppPage('budgets',true);
    if(typeof switchBudgetSubTab==='function') {
      try{switchBudgetSubTab(source==='executive'?'comparisons':'current');}catch(e){}
    }
    if(source==='compare'){
      if(typeof switchBudgetMonthView==='function')switchBudgetMonthView('compare');
      if(window.BudgetCompareEngine)try{BudgetCompareEngine.render();}catch(e){}
    }
    if(source!=='compare' && window.BudgetAuditEngine)
      try{BudgetAuditEngine.refreshActiveBudgetAudit();}catch(e){}
  }
  function returnToBudget() {
    if(!active)return;
    const origin=active.origin,previous=active.previous;
    clear();
    restoreFilters(previous);
    if(origin.budgetId && Array.isArray(state.monthlyBudgets) &&
       state.monthlyBudgets.some(b=>b.id===origin.budgetId)) {
      state.activeBudgetId=origin.budgetId;
    }
    gotoBudgetTab(origin.source);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      for(const rec of origin.scrollers){
        if(rec.el.isConnected)rec.el.scrollTop=rec.top;
      }
      window.scrollTo({top:origin.windowY,behavior:'instant'});
      let focus=origin.node.isConnected?origin.node:null;
      if(!focus&&origin.selector)focus=document.querySelector(origin.selector);
      if(focus && focus.isConnected){
        focus.scrollIntoView({block:'nearest',behavior:'instant'});
        if(focus.matches('button,[tabindex]'))focus.focus({preventScroll:true});
      }
    }));
  }
  function open(args) {
    if(typeof state==='undefined'||!Array.isArray(state.transactions))return;
    const source=args.source||'monthly';
    const ctx=source==='compare'
      ? {period:'custom',month:'',...((window.BudgetCompareEngine?.getNavigationRange?.())||{})}
      : (window.BudgetAuditEngine?.getNavigationContext?.()||{});
    const range=source==='compare'
      ? {from:ctx.from||'',to:ctx.to||''}
      : getMonthlyRange(ctx,args.scope||'actual');
    if(args.from!==undefined)range.from=args.from;
    if(args.to!==undefined)range.to=args.to;
    let candidates=state.transactions.filter(t=>t.type==='expense' &&
      (!range.from||String(t.date||'')>=range.from) &&
      (!range.to||String(t.date||'')<=range.to));
    if(args.category)candidates=candidates.filter(t=>String(t.category||'')===String(args.category));
    if(args.member)candidates=candidates.filter(t=>String(t.member||t.author||'')===String(args.member));
    const plan=(state.monthlyBudgets||[]).find(b=>b.id===state.activeBudgetId);
    if(Number.isInteger(args.itemIndex) && plan?.items?.[args.itemIndex]){
      const item=plan.items[args.itemIndex];
      const expenseCandidates=candidates;
      if(typeof getExpensesForBudgetItem==='function'){
        candidates=getExpensesForBudgetItem(item,expenseCandidates,plan.items);
      }else {
        candidates=expenseCandidates.filter(t=>t.budgetItemId===item.id ||
          (!t.budgetItemId&&t.category===item.category));
      }
    }
    if(args.onlyIds) {
      const allowed=new Set(args.onlyIds.map(String));
      candidates=candidates.filter(t=>allowed.has(String(t.id)));
    }
    if(active){clear();}
    const originNode=args.originNode||document.activeElement||document.body;
    const scrollers=[];
    for(let p=originNode;p&&p!==document.documentElement;p=p.parentElement){
      if(p.scrollHeight>p.clientHeight+5)scrollers.push({el:p,top:p.scrollTop});
    }
    active={ids:new Set(candidates.map(t=>String(t.id))),previous:preserveFilters(),
      origin:{source,node:originNode,windowY:window.scrollY,scrollers,
        selector:args.originSelector||'',
        budgetId:state.activeBudgetId}};
    installRenderer();
    if(typeof switchAppPage==='function')switchAppPage('operations',true);
    if(typeof switchOperationsSubTab==='function')switchOperationsSubTab('registered');
    state.period=(range.from||range.to)?'custom':'all';
    state.customDateRange={from:range.from,to:range.to};
    state.currentMemberFilter='الكل';
    state.currentWalletId='all';
    state.projectFilter='all';
    try{if(typeof opsTypeFilterState!=='undefined')opsTypeFilterState='expense';}catch(e){}
    const search=document.getElementById('opsSearchInput');if(search)search.value='';
    setChoices('opsFilterCategory',args.category?[String(args.category)]:[]);
    setChoices('opsFilterMember',args.member?[String(args.member)]:[]);
    setChoices('opsFilterProject',[]);
    if(typeof filterOperationsList==='function')filterOperationsList();
    showBanner(args.label||categoryName(args.category),candidates.length);
  }
  function onClick(event) {
    if(event.target.closest('#budgetDrilldownBack'))return;
    const scopeButton=event.target.closest('[data-budget-drill-scope]');
    const auditRow=event.target.closest('#budgetActualVsEstimatedContainer tbody tr[data-budget-item-index]');
    const compareRow=event.target.closest('#cmpTableBody tr');
    const week=event.target.closest('.monthly-week-line[data-budget-week]');
    const over=event.target.closest('[data-budget-cat]');
    const basic=event.target.closest('#budgetKpiActual,#budgetKpiExpense,#budgetKpiSurplus,#cmpKpiTotalActual,#cmpKpiTotalEstim,#cmpKpiTotalDiff');
    if(!scopeButton&&!auditRow&&!compareRow&&!week&&!over&&!basic)return;
    if(!document.getElementById('viewBudgets')?.contains(event.target) &&
       !document.getElementById('panelMonthlyBudget')?.contains(event.target) &&
       !document.getElementById('panelBudgetComparisons')?.contains(event.target))return;
    event.preventDefault();event.stopImmediatePropagation();
    const source=(compareRow || event.target.closest('#panelBudgetCompare')) ? 'compare' :
      (event.target.closest('#panelBudgetComparisons') ? 'executive' : 'monthly');
    const a={source,originNode:scopeButton||auditRow||compareRow||week||over||basic};
    if(auditRow){
      a.itemIndex=Number(auditRow.dataset.budgetItemIndex);
      const c=window.BudgetAuditEngine?.getNavigationContext?.()||{};
      const plan=(state.monthlyBudgets||[]).find(p=>p.id===state.activeBudgetId);
      const it=plan?.items?.[a.itemIndex];
      a.label=it?.title||'البند المختار';
      const cells=auditRow.querySelectorAll('td');
      if(event.target.closest('td')===cells[2] && c.comparisonMode==='period')a.scope='benchmark';
    }else if(compareRow){
      a.category=compareRow.dataset.budgetCategory||'';
      a.label=categoryName(a.category);
    }else if(over){
      a.category=over.dataset.budgetCat;
      a.scope='fullmonth';
      a.label='تجاوز '+categoryName(a.category);
    }else if(week){
      const ctx=window.BudgetAuditEngine?.getNavigationContext?.()||{};
      const n=Number(week.dataset.budgetWeek);
      const s=monthRange(ctx.month),m=ctx.month||'';
      if(m&&s.from){
        const first=m+'-'+pad(n*7+1),last=m+'-'+pad(Math.min(n*7+7,Number(s.to.slice(8))));
        a.from=first;a.to=last;
      }
      a.label='الأسبوع '+(n+1);
    }else if(scopeButton){
      const scope=scopeButton.dataset.budgetDrillScope;
      const ctx=window.BudgetAuditEngine?.getNavigationContext?.()||{};
      if(scope==='previous')a.scope='previous';
      if(scope==='highest-day')a.from=a.to=scopeButton.dataset.budgetDate;
      if(scope==='top-category')a.category=scopeButton.dataset.budgetCategory;
      if(scope==='unplanned')a.onlyIds=(state.transactions||[])
        .filter(t=>t.type==='expense' && !((state.monthlyBudgets||[])
          .find(b=>b.id===state.activeBudgetId)?.items||[])
          .some(it=>it.category===t.category)).map(t=>t.id);
      if(scope==='largest-transaction')a.onlyIds=[scopeButton.dataset.budgetTxId];
      a.label=scopeButton.querySelector('small')?.textContent||'مؤشر الموازنة';
    }else a.label='إجمالي المقارنة';
    open(a);
  }
  function init(){
    if(document.body.dataset.budgetDrillReady==='1')return;
    document.body.dataset.budgetDrillReady='1';
    document.addEventListener('click',onClick,true);
    installRenderer();
    window.BudgetDrilldownHub={open,returnToBudget,isActive:()=>!!active};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
}());
