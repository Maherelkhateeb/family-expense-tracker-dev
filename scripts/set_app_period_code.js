function setAppPeriod(p) {
      state.period = p;

      // 1. تحديث أزرار شريط الفترات في صفحة المصاريف الأولى
      const periodIds = {
        'today': 'pillPeriodToday',
        'day': 'pillPeriodToday',
        'week': 'pillPeriodWeek',
        'month': 'pillPeriodMonth',
        'all': 'pillPeriodAll',
        'custom': 'pillPeriodCustom'
      };
      document.querySelectorAll('.period-filter-pill').forEach(b => b.classList.remove('active'));
      const activePill = document.getElementById(periodIds[p]);
      if (activePill) activePill.classList.add('active');

      // 2. تحديث أزرار الفترات في شاشة التحليلات
      document.querySelectorAll('.ops-period-pill, .archive-period-pill').forEach(b => {
        const btnP = b.getAttribute('data-period');
        if (btnP === p || (p === 'today' && btnP === 'day') || (p === 'day' && btnP === 'today')) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      document.querySelectorAll('.analytics-period-btn').forEach(b => {
        const btnP = b.getAttribute('data-period');
        if (btnP === p || (p === 'today' && btnP === 'day') || (p === 'day' && btnP === 'day')) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // 3. تحديث شارة اسم الفترة المعروضة فوق بنود المصاريف
      const todayDate = new Date();
      const periodLabels = {
        'today': 'اليوم (' + todayDate.toLocaleDateS