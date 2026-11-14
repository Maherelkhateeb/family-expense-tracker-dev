function setAnalyticsPeriod(period) {
      setAppPeriod(period === 'day' ? 'today' : period);
      const customBox = document.getElementById('analyticsCustomRangeBox');
      if (customBox) customBox.style.display = (period === 'custom') ? 'block' : 'none';
    }

    function toggleAnalyticsCustomRange() {
      const box = document.getElementById('analyticsCustomRangeBox');
      if (box) {
        box.style.display = (box.style.display === 'none' || !box.style.display) ? 'block' : 'none';
      }
    }

    function applyAnalyticsCustomDate() {
      const inpFrom = document.getElementById('inpAnalyticsDateFrom') || document.getElementById('inpAnaDateFrom');
      const inpTo = document.getElementById('inpAnalyticsDateTo') || document.getElementById('inpAnaDateTo');
      const dFrom = inpFrom ? inpFrom.value : '';
      const dTo = inpTo ? inpTo.value : '';

      if (!dFrom || !dTo) {
        showToast('يرجى تحديد تاريخ البداية والنهاية أولاً');
        return;
      }
      if (dFrom > dTo) {
        showToast('تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية');
        return;
      }
      state.period = 'custom';
      state.customDateRange = { from: dFrom, to: dTo };
      renderUI();
      updateAnalyticsChart();
      showToast(`✓ تم تطبيق فترة التحليل: من ${dFrom} إلى ${dTo}`);
    }

    // المحرك المالي الرئيسي لتحديث المؤشرات والتحليلات
    
    // =========================================================================
    // محرك صفحة المؤشرات والمقارنات المتطور (Indicators & Comparisons Suite)
    // =========================================================================
    let activeAnalyticsMainTab = 'actual'; // 'actual' | 'comparisons'
    let activeComparisonDimension = 'category'; // 'category' | 'member' | 'month'
    let threePillarChartInstance = null;
    let walletsDistChartInstance = null;

    function switchAnalyticsMainTab(tab) {
      activeAnalyticsMainTab = tab;
      const btnActual = document.getElementById('btnTabActualAnalytics');
      const btnComp = document.getElementById('btnTabComparisons');
      const secActual = document.getElementById('sectionActualAnalytics');
      const secComp = document.getElementById('sectionComparisons');

      if (tab === 'actual') {
        if (btnActual) btnActual.classList.add('active');
        if (btnComp) btnComp.classList.remove('active');
        if (secActual) secActual.style.display = 'block';
        if (secComp) secComp.style.display = 'none';
        updateA