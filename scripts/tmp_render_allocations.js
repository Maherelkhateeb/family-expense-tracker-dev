function renderMonthlyBudgetAllocations() {
      if (!currentBudgetMonthData) return;
      ensureBudgetItems(currentBudgetMonthData);

      const itemsContainer = document.getElementById('budgetItemsListContainer');
      const incCont = document.getElementById('budgetIncomeRowsContainer');
      const countBadge = document.getElementById('budgetItemsCountBadge');

      const targetMonth = currentBudgetMonthData.month || '2026-11';
      const monthExpenses = (state.transactions || []).filter(t => t.type === 'expense' && t.date && t.date.startsWith(targetMonth));
      const totalActualMonth = monthExpenses.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const totalBudgetMonth = (currentBudgetMonthData.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);

      // تحديث شريط الرقابة المالية الإجمالي (الفعلي مقابل المقدر)
      const summaryTxt = document.getElementById('budgetActualSummaryTxt');
      const progBar = document.getElementById('budgetActualProgressBar');
      if (summaryTxt) {
        const overallPct = totalBudgetMonth > 0 ? ((totalActualMonth / totalBudgetMonth) * 100).toFixed(1) : 0;
        summaryTxt.innerHTML = `المنصرف الفعلي لشهر (${targetMonth}): <strong>${formatMoney(totalActualMonth)}</strong> من أصل مقدر <strong>${formatMoney(totalBudgetMonth)}</strong> (${overallPct}%)`;
      }
      if (progBar) {
        const pctVal = totalBudgetMonth > 0 ? Math.min(100, (totalActualMonth / totalBudgetMonth) * 100) : 0;
        progBar.style.width = pctVal + '%';
        progBar.style.background = (totalActualMonth > totalBudgetMonth) ? '#ef4444' : '#38bdf8';
      }

      if (countBadge) {
        countBadge.textContent = `${(currentBudgetMonthData.items || []).length} بند`;
      }

      // رسم كروت بنود المصروفات التقديرية
      if (itemsContainer) {
        const items = currentBudgetMonthData.items || [];
        if (items.length === 0) {
          itemsContainer.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.6); border: 1.5px dashed rgba(255,255,255,0.1); border-radius: 12px; padding: 18px; text-align: center; color: #94a3b8;">
              <i class="fa-solid fa-clipboard-list" style="font-size: 1.8rem; color: #38bdf8; margin-bottom: 6px;"></i>
              <div style="font-size: 0.85rem; font-weight: 800; color: #cbd5e1;">لا توجد بنود مصروفات مضافة بعد</div>
              <div style="font-size: 0.72rem; margin-top: 3px;">اختر نوع المصروف وحدد الأفراد والمبلغ من الأعلى، ثم انقر "إضافة البند للميزانية"</div>
            </div>
          `;
        } else {
          itemsContainer.innerHTML = items.map((it, idx) => {
            const cat = EXPENSE_CATEGORIES.find(c => c.id === it.category) || { name: 'أخرى', icon: 'fa-cube', color: '#38bdf8', emoji: '📦' };
            
            // حساب المنصرف الفعلي في هذا التصنيف للشهر
            const catActual = monthExpenses.filter(t => t.category === it.category).reduce((s, t) => s + (Number(t.amount) || 0), 0);
            const isOver = catActual > it.amount;

            // شارات أفراد الأسرة المرتبطين بهذا البند
            const memberChips = (it.members || ['البيت']).map(m => {
              const avatar = (typeof MEMBER_AVATARS !== 'undefined' && MEMBER_AVATARS[m]) ? MEMBER_AVATARS[m] : '';
              return `
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; padding: 2px 7px; border-ra