function updateAnalyticsChart() {
      const filtered = getFilteredTransactions();

      let totalInc = 0, totalExp = 0, incCount = 0, expCount = 0;
      const catTotals = {}, memberTotals = {}, dailyMap = {};
      let largestTx = null;

      filtered.forEach(tx => {
        const amt = parseFloat(tx.amount) || 0;
        if (tx.type === 'income') {
          totalInc += amt;
          incCount++;
        } else {
          totalExp += amt;
          expCount++;
          let cKey = tx.category;
          if (cKey === 'shopping' || cKey === 'supermarket') cKey = 'food';
          if (cKey === 'other') cKey = 'others';
          catTotals[cKey] = (catTotals[cKey] || 0) + amt;
          memberTotals[tx.member] = (memberTotals[tx.member] || 0) + amt;

          // تتبع اليوم الأكثر إنفاقاً
          const d = tx.date || '';
          dailyMap[d] = (dailyMap[d] || 0) + amt;

          // تتبع أكبر فاتورة
          if (!largestTx || amt > (parseFloat(largestTx.amount) || 0)) {
            largestTx = tx;
          }
        }
      });

      const netSavings = totalInc - totalExp;
      const p = state.period || 'month';
      const now = new Date();

      // حساب عدد الأيام المنقضية بدقة محاسبية بالغة لمنع أي تشويه للمعدل اليومي
      let daysCount = 1;
      if (p === 'today' || p === 'day') {
        daysCount = 1;
      } else if (p === 'week') {
        const dayOfWeek = (now.getDay() + 1) % 7;
        daysCount = Math.max(1, Math.min(7, dayOfWeek === 0 ? 7 : dayOfWeek));
      } else if (p === 'month') {
        daysCount = Math.max(1, now.getDate());
      } else if (p === 'custom' && state.customDateRange && state.customDateRange.from && state.customDateRange.to) {
        const d1 = new Date(state.customDateRange.from);
        const d2 = new Date(state.customDateRange.to);
        const diffTime = Math.abs(d2 - d1);
        daysCount = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
      } else if (p === 'all') {
        let minD = null, maxD = null;
        filtered.forEach(t => {
          if (t.date) {
            if (!minD || t.date < minD) minD = t.date;
            if (!maxD || t.date > maxD) maxD = t.date;
          }
        });
        if (minD && maxD) {
          const d1 = new Date(minD);
          const d2 = new Date(maxD);
          const diffTime = Math.abs(d2 - d1);
          daysCount = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
        } else {
          daysCount = Math.max(1, now.getDate());
        }
      }
      const dailyAverage = totalExp > 0 ? Math.round(totalExp / daysCount) : 0;

      // العثور على أعلى يوم إنفاقاً
      let maxDay = '-', maxDayAmt = 0;
      for (const [dayStr, dAmt] of Object.entries(dailyMap)) {
        if (dAmt > maxDayAmt) {
          maxDayAmt = dAmt;
          maxDay = dayStr;
        }
      }

      // إجمالي الرصيد الفعلي في المحافظ لتأكيد ملاءة الأمان وعدم إثارة أي هلع وهمي بالسيولة
      const actualLiquidity = (state.wallets && state.wallet