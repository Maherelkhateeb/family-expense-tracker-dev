function populateBudgetPlanSelector() {
      const sel = document.getElementById('budgetPlanSelector');
      if (!sel) return;
      if (!state.monthlyBudgets) state.monthlyBudgets = [];

      sel.innerHTML = state.monthlyBudgets.map(b => {
        const totalExp = (b.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
        return `<option value="${b.id}" ${b.id === state.activeBudgetId ? 'selected' : ''}>📋 ${escapeHtml(b.name)} [${b.month}] - مقدر: ${formatMoney(totalExp)}</option>`;
      }).join('');
    }

    function loadActiveBudgetPlan() {
      if (!state.monthlyBudgets || state.monthlyBudgets.length === 0) {
        initMonthlyBudgetUI();
      }

      let activePlan = state.monthlyBudgets.find(b => b.id === state.activeBudgetId);
      if (!activePlan) {
        activePlan = state.monthlyBudgets[0];
        state.activeBudgetId = activePlan.id;
      }

      currentBudgetMonthData = activePlan;
      ensureBudgetItems(currentBudgetMonthData);

      const inpName = document.getElementById('inpBudgetName');
      const inpMonth = document.getElementById('inpBudgetMonth');

      if (inpName) inpName.value = activePlan.name || '';
      if (inpMonth) inpMonth.value = activePlan.month || '2026-11';

      populateBudgetPlanSelector();
      renderBudgetMembersMultiPicker();
      renderMonthlyBudgetAllocations();
    }

    function loadMonthlyBudget() {
      loadActiveBudgetPlan();
    }

    function onBudgetPlanSelect(budgetId) {
      state.a