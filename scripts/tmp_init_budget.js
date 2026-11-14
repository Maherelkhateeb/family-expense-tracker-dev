function initMonthlyBudgetUI() {
      const stored = localStorage.getItem('family_monefy_monthly_budgets');
      if (stored) {
        try { state.monthlyBudgets = JSON.parse(stored); } catch(e) { state.monthlyBudgets = []; }
      }

      if (!state.monthlyBudgets || !Array.isArray(state.monthlyBudgets) || state.monthlyBudgets.length === 0) {
        state.monthlyBudgets = generateRichDemoBudgets();
        try {
          localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
        } catch(e) {}
      }

      // ترقية وتأكيد سلامة كل خطة
      state.monthlyBudgets.forEach((b, idx) => {
        if (!b.id) b.id = 'bgt-' + (b.month || 'plan') + '-' + (idx + 1);
        if (!b.name) b.name = b.title || (`ميزانية شهر ${b.month || 'الحالي'}`);
        if (!b.month) b.month = '2026-11';
        if (!b.categories) b.categories = {};
        if (!b.incomes) b.incomes = [];
        ensureBudgetItems(b);
      });

      if (!state.activeBudgetId || !state.monthlyBudgets.some(b => b.id === state.activeBudgetId)) {
        state.activeBudgetId = state.monthlyBudgets[0].id;
      }

      populateBudgetPlanSelector();
      renderBudgetMembersMultiPicker();
    }

    // ضمان وجود قائمة بنود ديناميكية وترحيل التصنيفات القديمة إن وجدت
    function ensureBudgetItems(b) {
      if (!b.items || !Array.isArray(b.items)) {
        b.items = [];
        const catMap = {
          food: 'طعام ومشتريات',
          daily: 'مصروف يومي',
          bills: 'فواتير والتزامات',
          transport: 'مواصلات وبنزين',
          house: 'مستلزمات منزل',
          health: 'صحة وعلاج',
          clothes: 'ملابس وأحذية',
          education: 'تعليم ودروس',
          other: 'أخرى ونثريات'
        };
        Object.keys(b.categories || {}).forEach((catId, idx) => {
          const amt = Number(b.categories[catId]) || 0;
          if (amt > 0) {
            b.items.push({
              id: 'item-' + catId + '-' + (idx + 1),
              category: catId,
    