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
        'today': 'اليوم (' + todayDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) + ')',
        'day': 'اليوم (' + todayDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) + ')',
        'week': 'الأسبوع الحالي (آخر 7 أيام)',
        'month': 'الشهر الحالي (' + todayDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }) + ')',
        'all': 'كافة الفترات (سجل العائلة بالكامل)',
        'custom': 'فترة مخصصة'
      };

      const hintEl = document.getElementById('activeCategoryPeriodHint');
      if (hintEl) hintEl.textContent = periodLabels[p] || p;

      const anaPill = document.getElementById('analyticsPeriodActivePill');
      if (anaPill) anaPill.textContent = periodLabels[p] || p;

      // 4. إعادة رسم الحسابات وتحديث بنود المصاريف فوراً
      renderUI();
      if (typeof filterOperationsList === "function") filterOperationsList();
      showToast(`📅 تم تطبيق الفترة: ${periodLabels[p] || p}`);
    }

    // =========================================================================

    // =========================================================================
    // مساعدات التواريخ الصارمة بتوقيت المتصفح المحلي (تمنع فارق التوقيت UTC)
    // =========================================================================
    function getLocalDateStr(d = new Date()) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    
function generat