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
      const profile = PROFILES[design];
      if (!profile || !view.classList.contains('active')) {
        host.style.removeProperty('--dynamic-home-available-height');
        host.style.removeProperty('--dynamic-home-card-height');
        host.style.removeProperty('--dynamic-home-gap');
        host.style.removeProperty('--dynamic-home-columns');
        return;
      }
      const vv = root.visualViewport;
      const viewportHeight = vv ? vv.height : root.innerHeight;
      const viewportTop = vv ? vv.offsetTop : 0;
      const footerTop = footer && footer.getBoundingClientRect().height
        ? footer.getBoundingClientRect().top : viewportTop + viewportHeight;
      const hostRect = host.getBoundingClientRect();
      const available = Math.max(0, Math.min(footerTop, viewportTop + viewportHeight) - hostRect.top);
      const width = Math.max(0, hostRect.width);
      const gap = clamp(width * profile.gapRatio, profile.minGap, profile.maxGap);
      const grid = host.querySelector('.reference-one-grid, .home-design-grid');
      const gridTop = grid ? Math.max(0, grid.getBoundingClientRect().top - hostRect.top) : 0;
      const usable = Math.max(0, available - gridTop);
      const cardHeight = Math.max(0, (usable - (profile.rows - 1) * gap) / profile.rows);
      host.style.setProperty('--dynamic-home-available-height', available.toFixed(2) + 'px');
      host.style.setProperty('--dynamic-home-card-height', cardHeight.toFixed(2) + 'px');
      host.style.setProperty('--dynamic-home-gap', gap.toFixed(2) + 'px');
      host.style.setProperty('--dynamic-home-columns', String(profile.columns));
      host.dataset.dynamicHomeMeasured = 'true';
    }
    function schedule() {
      if (!stopped && !frame) frame = root.requestAnimationFrame(() => { frame = 0; measure(); });
    }
    if (typeof root.ResizeObserver === 'function') {
      observer = new root.ResizeObserver(schedule);
      [view, host, header, footer].filter(Boolean).forEach(node => observer.observe(node));
    }
    root.addEventListener('resize', schedule, { passive: true });
    if (root.visualViewport) root.visualViewport.addEventListener('resize', schedule, { passive: true });
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
        if (root.visualViewport) root.visualViewport.removeEventListener('resize', schedule);
        ['--dynamic-home-available-height','--dynamic-home-card-height','--dynamic-home-gap','--dynamic-home-columns'].forEach(key => host.style.removeProperty(key));
        delete host.dataset.dynamicHomeMeasured;
      }
    };
  }
  root.HomeDynamicLayoutEngine = Object.freeze({ create, profiles: PROFILES });
})(window);
