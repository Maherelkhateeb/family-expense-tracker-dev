/* Mobile home layout measurement engine.
 * Deliberately scoped to the expense home; never changes transaction data or other pages.
 * Integration with the home renderer is a separate step.
 */
(function (root) {
  'use strict';
  const PROFILES = Object.freeze({
    1: { columns: 2, gapRatio: .018, minGap: 5, maxGap: 14, rows: 5 },
    2: { columns: 2, gapRatio: .019, minGap: 5, maxGap: 14, rows: 5 },
    3: { columns: 1, gapRatio: .013, minGap: 4, maxGap: 10, rows: 10 },
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
    function measure() {
      if (stopped || !view.isConnected || !host.isConnected) return;
      const design = Number(host.dataset.design);
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
      const profile = PROFILES[design];
      // Inline important order values from the legacy renderer outrank the
      // reference stylesheet. Update only the two quick-tool positions, and
      // restore their standard order for other layouts.
      const setQuickOrder = (id, order) => {
        const el = document.getElementById(id);
        if (el && (el.style.getPropertyValue('order') !== order ||
            el.style.getPropertyPriority('order') !== 'important')) {
          el.style.setProperty('order', order, 'important');
        }
      };
      setQuickOrder('btnToggleCurrency', design === 1 ? '3' : '4');
      setQuickOrder('btnOpenSummaryQuick', design === 1 ? '4' : '3');
      if (!profile || !view.classList.contains('active')) {
        host.style.removeProperty('--dynamic-home-available-height');
        host.style.removeProperty('--dynamic-home-card-height');
        host.style.removeProperty('--dynamic-home-gap');
        host.style.removeProperty('--dynamic-home-columns');
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
      // Do not claim that ten touch targets fit by shrinking them below
      // their accessible content minimum. On short viewports, scroll instead.
      const minimum = design === 1 ? 68 : 76;
      const cardHeight = Math.max(minimum, calculated);
      const properties = {
        '--dynamic-home-available-height': available.toFixed(2) + 'px',
        '--dynamic-home-card-height': cardHeight.toFixed(2) + 'px',
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
    const mutations = new MutationObserver(schedule);
    mutations.observe(host, { attributes: true, attributeFilter: ['data-design', 'class'] });
    mutations.observe(view, { attributes: true, attributeFilter: ['class'] });
    schedule();
    return {
      refresh: schedule,
      destroy() {
        stopped = true;
        if (frame) root.cancelAnimationFrame(frame);
        if (observer) observer.disconnect();
        mutations.disconnect();
        root.removeEventListener('resize', schedule);
        if (root.visualViewport) {
          root.visualViewport.removeEventListener('resize', schedule);
          root.visualViewport.removeEventListener('scroll', schedule);
        }
        ['--dynamic-home-available-height','--dynamic-home-card-height','--dynamic-home-gap','--dynamic-home-columns'].forEach(key => host.style.removeProperty(key));
        delete host.dataset.dynamicHomeMeasured;
        delete host.dataset.dynamicHomeFit;
      }
    };
  }
  root.HomeDynamicLayoutEngine = Object.freeze({ create, profiles: PROFILES });
})(window);
