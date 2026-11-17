/* Budget comparisons — explicit discoverable route. No financial data is modified. */
(function () {
  'use strict';
  function openComparison(opts) {
    opts = opts || {};
    if (typeof window.switchAppPage !== 'function' || typeof window.switchBudgetSubTab !== 'function') {
      return false;
    }
    // The bottom navigation previously reset this selection to the default tab.
    window.activeBudgetSubTab = 'comparisons';
    window.switchAppPage('budgets', false);
    window.switchBudgetSubTab('comparisons');
    const panel = document.getElementById('panelBudgetComparisons');
    if (!panel) return false;
    if (window.FamilyBudgetComparison && window.state &&
        !panel.querySelector('.fbc')) {
      window.FamilyBudgetComparison.render(panel, window.state);
    }
    const tab = document.getElementById('btnBudgetSubComparisons');
    tab?.setAttribute('aria-pressed', 'true');
    requestAnimationFrame(() => {
      const budget = document.getElementById('viewBudgets');
      const scrollArea = document.getElementById('appScrollBody');
      if (budget?.classList.contains('active') && panel.isConnected) {
        const heading = panel.querySelector('.fbc-intro h2');
        (opts.scroll === false ? null : (heading || tab || panel))?.scrollIntoView?.({block:'start',behavior:'instant'});
      }
      if (scrollArea && opts.scroll === false) scrollArea.scrollTop = 0;
    });
    return true;
  }
  window.openBudgetComparisonDashboard = openComparison;

  function isLink() {
    const params = new URLSearchParams(location.search);
    return params.get('view') === 'comparisons' ||
      params.get('view') === 'budget-comparisons' ||
      params.get('comparison') === '1';
  }
  if (!isLink()) return;
  function start() {
    if (openComparison({scroll:false})) return;
    if (!window.__budgetComparisonRouteAttempts) window.__budgetComparisonRouteAttempts = 0;
    if (++window.__budgetComparisonRouteAttempts < 30) setTimeout(start,100);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(start,0), {once:true});
  } else {
    setTimeout(start,0);
  }
})();
