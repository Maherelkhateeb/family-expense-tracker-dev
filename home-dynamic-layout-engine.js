/* Mobile home layout measurement engine.
 * Deliberately scoped to the expense home; never changes transaction data or other pages.
 * Integration with the home renderer is a separate step.
 */
(function (root) {
  'use strict';
  const PROFILES = Object.freeze({
    1: { columns: 2, gapRatio: .018, minGap: 5, maxGap: 14, rows: 5 },
    2: { columns: 2, gapRatio: .019, minGap: 5, maxGap: 14, rows: 5 },
    3: { columns: 2, gapRatio: .013, minGap: 4, maxGap: 10, rows: 5 },
    4: { columns: 2, gapRatio: .019, minGap: 5, maxGap: 14, rows: 5 },
    5: { columns: 3, gapRatio: .014, minGap: 4, maxGap: 11, rows: 4 }
  });
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function create(options) {
    const opts = options || {};
    const view = opts.view || document.getElementById('viewExpenses');
    const host = opts.host || document.getElementById('homeInterfaces');
    const header = opts.header || document.querySelector('.app-header');
    const footer = opts.footer || document.getElementById('appBottomNav');
    if (!view || !host) return null;
    let stopped = false, frame = 0, observer = null;
    // Preserve existing inline display rules so non-reference screens are untouched.
    const floatingControls = new Map();
    function reconcileFloatingControls(hideEdgeHandles,hideFloatingMic) {
      for (const id of ['leftScreenEdgeHandle','rightScreenEdgeHandle','btnVoiceAssistantFab']) {
        const element = document.getElementById(id);
        if (!element) continue;
        // The in-card voice button is the only speech entry point whenever
        // a selected home design supplies its own voice action. Do not show
        // a second microphone over spending amounts, even while recording.
        const hide = id === 'btnVoiceAssistantFab' ? hideFloatingMic : hideEdgeHandles;
        if (hide) {
          if (!floatingControls.has(id)) floatingControls.set(id, {
            value: element.style.getPropertyValue('display'),
            priority: element.style.getPropertyPriority('display')
          });
          if (element.style.getPropertyValue('display') !== 'none' ||
              element.style.getPropertyPriority('display') !== 'important') {
            element.style.setProperty('display','none','important');
          }
        } else if (floatingControls.has(id)) {
          const former = floatingControls.get(id);
          if (former.value) element.style.setProperty('display',former.value,former.priority);
          else element.style.removeProperty('display');
          floatingControls.delete(id);
        }
      }
    }
    function measure() {
      if (stopped || !view.isConnected || !host.isConnected) return;
      const design = Number(host.dataset.design);
      const homeIsActive = view.classList.contains('active');
      const hasVoiceCard = homeIsActive && (
        design === 1
          ? !!host.querySelector('.reference-one-card[data-ref-category="voice"]')
          : design > 1 && !!host.querySelector('.home-design-card [data-voice]')
      );
      reconcileFloatingControls(design === 1 && homeIsActive,hasVoiceCard);
      // The legacy renderer sets inline !important orders. CSS cannot beat
      // them, so reconcile only this home's five quick actions here.
      if (view.classList.contains('active')) {
        const desired = design === 1
          ? {btnHomeDesign: 0, btnOpenGold: 1, walletSelectCluster: 2, btnToggleCurrency: 3, btnOpenSummaryQuick: 4}
          : {btnHomeDesign: 0, btnOpenGold: 1, walletSelectCluster: 2, btnOpenSummaryQuick: 3, btnToggleCurrency: 4};
        for (const [id, order] of Object.entries(desired)) {
          const element = document.getElementById(id);
          if (!element || !view.contains(element)) continue;
          if (element.style.getPropertyValue('order') !== String(order) ||
              element.style.getPropertyPriority('order') !== 'important') {
            element.style.setProperty('order', String(order), 'important');
          }
        }
      }
      // Preserve the requested two-column RTL reference order without
      // changing the underlying expense categories or click targets.
      if (design === 1 && view.classList.contains('active')) {
        const visualOrder = ['daily','bills','food','house','transport',
          'education','other','health','voice','clothes'];
        const positions = new Map(visualOrder.map((category, index) => [category, index]));
        for (const card of host.querySelectorAll('.reference-one-grid > .reference-one-card')) {
          const position = positions.get(card.dataset.refCategory);
          if (position !== undefined && (card.style.getPropertyValue('order') !== String(position) ||
              card.style.getPropertyPriority('order') !== 'important')) {
            card.style.setProperty('order', String(position), 'important');
          }
        }
      }
      const profile = PROFILES[design];
      if (!profile || !view.classList.contains('active')) {
        host.style.removeProperty('--dynamic-home-available-height');
        host.style.removeProperty('--dynamic-home-card-height');
        host.style.removeProperty('--dynamic-home-gap');
        host.style.removeProperty('--dynamic-home-columns');
        ['--dynamic-home-content-min','--dynamic-home-font-family','--dynamic-home-font-scale',
          '--dynamic-home-title-size','--dynamic-home-amount-size','--dynamic-home-detail-size',
          '--dynamic-home-alt-title-size','--dynamic-home-alt-amount-size',
          '--dynamic-home-alt-detail-size'].forEach(key=>host.style.removeProperty(key));
        delete host.dataset.dynamicHomeMeasured;
        delete host.dataset.dynamicHomeFit;
        return;
      }
      const vv = root.visualViewport;
      const viewportTop = vv ? vv.offsetTop : 0;
      const viewportBottom = viewportTop + (vv ? vv.height : root.innerHeight);
      const navRect = footer && footer.getBoundingClientRect();
      const navTop = navRect && navRect.height ? navRect.top : viewportBottom;
      const scroll = document.getElementById('appScrollBody');
      const scrollRect = scroll && scroll.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      // Respect the actual scroll viewport and the fixed footer.
      const visibleBottom = Math.min(viewportBottom, navTop, scrollRect ? scrollRect.bottom : viewportBottom);
      // Keep geometry stable if a viewport resize happens mid-scroll.
      const hostAtRest = hostRect.top + (scroll ? scroll.scrollTop : 0);
      const footerClearance = 10;
      const available = Math.max(0, visibleBottom - hostAtRest - footerClearance);
      const width = Math.max(0, hostRect.width);
      const gap = clamp(width * profile.gapRatio, profile.minGap, profile.maxGap);
      const grid = host.querySelector('.reference-one-grid, .home-design-grid');
      const gridTop = grid ? Math.max(0, grid.getBoundingClientRect().top - hostRect.top) : 0;
      const cardCount = grid ? Array.from(grid.children).filter(el => el.getClientRects().length).length : 0;
      const rows = cardCount ? Math.ceil(cardCount / profile.columns) : profile.rows;
      const usable = Math.max(0, available - gridTop);
      const calculated = (usable - Math.max(0, rows - 1) * gap) / Math.max(rows, 1);
      // Font controls can change independently of the screen dimensions.
      // Read effective values, not stored settings, so theme/class changes,
      // Arabic typeface switching and accessibility font scaling all work.
      const typography = root.getComputedStyle(view);
      const bodyTypography = root.getComputedStyle(document.body);
      const viewFontSize = parseFloat(typography.fontSize) || 16;
      const bodyFontSize = parseFloat(bodyTypography.fontSize) || viewFontSize;
      const fontScale = clamp(Math.max(viewFontSize,bodyFontSize) / 16, .85, 2.5);
      const fontFamily = typography.fontFamily || bodyTypography.fontFamily || 'sans-serif';
      const sizePx = (base, min, max) => clamp(base * fontScale,min,max).toFixed(2) + 'px';
      // Increase content minimum before truncating text; on short devices
      // keep the normal scroll fallback instead of overlapping amount
      // information with the add-expense button or hiding the last row.
      const minimum = design === 1 ? 68 : 76;
      const contentMinimum = Math.ceil(minimum + Math.max(0,fontScale - 1) *
        (design === 1 ? 63 : 60));
      const cardHeight = Math.max(contentMinimum, calculated);
      const properties = {
        '--dynamic-home-available-height': available.toFixed(2) + 'px',
        '--dynamic-home-card-height': cardHeight.toFixed(2) + 'px',
        '--dynamic-home-content-min': contentMinimum + 'px',
        '--dynamic-home-font-family': fontFamily,
        '--dynamic-home-font-scale': fontScale.toFixed(3),
        '--dynamic-home-title-size': sizePx(clamp(width * .0295,10,20),9,42),
        '--dynamic-home-amount-size': sizePx(clamp(width * .0285,10,19),9,40),
        '--dynamic-home-detail-size': sizePx(clamp(width * .022,8,15),8,31),
        '--dynamic-home-alt-title-size': sizePx(14,10,35),
        '--dynamic-home-alt-amount-size': sizePx(13,10,34),
        '--dynamic-home-alt-detail-size': sizePx(10,8,27),
        '--dynamic-home-gap': gap.toFixed(2) + 'px',
        '--dynamic-home-columns': String(profile.columns)
      };
      for (const [key, value] of Object.entries(properties)) {
        if (host.style.getPropertyValue(key) !== value) host.style.setProperty(key, value);
      }
      host.dataset.dynamicHomeFit = calculated >= minimum ? 'fit' : 'scroll';
      host.dataset.dynamicHomeMeasured = 'true';
    }
    function schedule() {
      if (!stopped && !frame) frame = root.requestAnimationFrame(() => { frame = 0; measure(); });
    }
    if (typeof root.ResizeObserver === 'function') {
      observer = new root.ResizeObserver(schedule);
      [view, host, header, footer, document.getElementById('appScrollBody')].filter(Boolean).forEach(node => observer.observe(node));
    }
    root.addEventListener('resize', schedule, { passive: true });
    if (root.visualViewport) {
      root.visualViewport.addEventListener('resize', schedule, { passive: true });
      root.visualViewport.addEventListener('scroll', schedule, { passive: true });
    }
    const mutations = new MutationObserver(records => {
      // A design switch must reconcile inline quick-tool orders before the
      // next browser measurement, not one animation frame later.
      if (records.some(record => record.target === host && record.attributeName === 'data-design')) {
        // The legacy home renderer can update toolbar inline styles after
        // changing data-design; perform both immediate and post-paint checks.
        measure();
      }
      schedule();
    });
    // A design's voice tile can be mounted after its data-design attribute.
    // Reconcile the floating mic as soon as the card is inserted.
    mutations.observe(host, {
      attributes:true,attributeFilter:['data-design','class'],childList:true,subtree:true
    });
    mutations.observe(view, { attributes: true, attributeFilter: ['class','style'] });
    // App appearance controls change font family/size through style or
    // theme classes without resizing the viewport. Listen to those roots.
    for (const node of [document.documentElement, document.body,
      document.getElementById('appFrame')]) {
      if (node) mutations.observe(node, {
        attributes:true, attributeFilter:['class','style']
      });
    }
    // Watch only the five quick-action style attributes. Legacy responsive
    // re-renders can reset their inline !important order after our first pass.
    // Self-generated changes settle because measure() writes only if different.
    for (const id of ['btnHomeDesign','btnOpenGold','walletSelectCluster',
      'btnOpenSummaryQuick','btnToggleCurrency']) {
      const control=document.getElementById(id);
      if (control && view.contains(control)) {
        mutations.observe(control, { attributes:true, attributeFilter:['style'] });
      }
    }
    const fonts = document.fonts;
    if(fonts && typeof fonts.addEventListener === 'function'){
      fonts.addEventListener('loadingdone',schedule);
      fonts.addEventListener('loadingerror',schedule);
      fonts.ready.then(schedule).catch(()=>{});
    }
    schedule();
    return {
      refresh: schedule,
      destroy() {
        reconcileFloatingControls(false,false);
        stopped = true;
        if (frame) root.cancelAnimationFrame(frame);
        if (observer) observer.disconnect();
        mutations.disconnect();
        if(fonts && typeof fonts.removeEventListener === 'function'){
          fonts.removeEventListener('loadingdone',schedule);
          fonts.removeEventListener('loadingerror',schedule);
        }
        root.removeEventListener('resize', schedule);
        if (root.visualViewport) {
          root.visualViewport.removeEventListener('resize', schedule);
          root.visualViewport.removeEventListener('scroll', schedule);
        }
        ['--dynamic-home-available-height','--dynamic-home-card-height','--dynamic-home-gap',
          '--dynamic-home-columns','--dynamic-home-content-min','--dynamic-home-font-family',
          '--dynamic-home-font-scale','--dynamic-home-title-size','--dynamic-home-amount-size',
          '--dynamic-home-detail-size','--dynamic-home-alt-title-size',
          '--dynamic-home-alt-amount-size','--dynamic-home-alt-detail-size']
          .forEach(key => host.style.removeProperty(key));
        delete host.dataset.dynamicHomeMeasured;
        delete host.dataset.dynamicHomeFit;
      }
    };
  }
  root.HomeDynamicLayoutEngine = Object.freeze({ create, profiles: PROFILES });
})(window);
