function switchExpectedTopSection(sec) {
      activeExpectedTopSection = sec;
      const btnBillsDebts = document.getElementById('tabExpectedBillsAndDebts');
      const btnBudgets = document.getElementById('tabExpectedBudgets');

      const secBillsDebts = document.getElementById('subViewCommitments');
      const secBudgetsCurrent = document.getElementById('panelMonthlyBudget');
      const secBudgetsHistory = document.getElementById('panelBudgetHistory');
      const budgetSubTabs = document.getElementById('budgetsSubTabStrip');

      const headerTitle = document.getElementById('txtExpectedPageMainHeader');
      const headerSub = document.getElementById('txtExpectedPageSubHeader');
      const topAddBtnLbl = document.getElementById('lblTopAddCommitmentAction');

      if (sec === 'bills_and_debts') {
        if (btnBillsDebts) {
          btnBillsDebts.classList.add('active');
          btnBillsDebts.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          btnBillsDebts.style.color = '#fff';
          btnBillsDebts.style.border = '1px solid rgba(56, 189, 248, 0.5)';
          btnBillsDebts.style.boxShadow = '0 3px 12px rgba(2, 132, 199, 0.4)';
        }
        if (btnBudgets) {
          btnBudgets.classList.remove('active');
          btnBudgets.style.background = 'transparent';
          btnBudgets.style.color = '#94a3b8';
          btnBudgets.style.border = '1px solid transparent';
          btnBudgets.style.boxShadow = 'none';
        }

        if (secBillsDebts) secBillsDebts.style.display = 'block';
        if (secBudgetsCurrent) secBudgetsCurrent.style.display = 'none';
        if (secBudgetsHistory) secBudgetsHistory.style.display = 'none';
        if (budgetSubTabs) budgetSubTabs.style.display = 'none';

        if (headerTitle) headerTitle.textContent = 'الفواتير والديون والمستحقات';
        if (headerSub) headerSub.textContent = 'متابعة سداد الفواتير الشهرية والديون المطلوبة والمستحقة';
        if (topAddBtnLbl) topAddBtnLbl.textContent = 'إضافة التزام';

        renderCommitmentsPageUI();
      } else {
        // sec === 'budgets'
        if (btnBudgets) {
          btnBudgets.classList.add('active');
          btnBudgets.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          btnBudgets.style.color = '#fff';
          btnBudgets.style.border = '1px solid rgba(16, 185, 129, 0.5)';
          btnBudgets.style.boxShadow = '0 3px 12px rgba(16, 185, 129, 0.4)';
        }
        if (btnBillsDebts) {
    