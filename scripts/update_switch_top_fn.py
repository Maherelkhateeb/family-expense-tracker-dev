import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_fn_start = "function switchExpectedTopSection(sec) {"
idx = content.find(old_fn_start)
idx_end = content.find("function switchBudgetSubTab(tab) {", idx)

new_fn = """function switchExpectedTopSection(sec) {
      activeExpectedTopSection = sec;
      const btnBillsDebts = document.getElementById('tabExpectedBillsAndDebts');
      const btnBudgets = document.getElementById('tabExpectedBudgets');

      const secBillsDebts = document.getElementById('subViewCommitments');
      const secBudgetsSection = document.getElementById('secBudgetsSection');
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
        if (secBudgetsSection) secBudgetsSection.style.display = 'none';

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
          btnBillsDebts.classList.remove('active');
          btnBillsDebts.style.background = 'transparent';
          btnBillsDebts.style.color = '#94a3b8';
          btnBillsDebts.style.border = '1px solid transparent';
          btnBillsDebts.style.boxShadow = 'none';
        }

        if (secBillsDebts) secBillsDebts.style.display = 'none';
        if (secBudgetsSection) {
          secBudgetsSection.style.display = 'flex';
          secBudgetsSection.style.flexDirection = 'column';
          secBudgetsSection.style.gap = '10px';
        }

        if (budgetSubTabs) budgetSubTabs.style.display = 'flex';

        if (activeBudgetSubTab === 'history') {
          if (secBudgetsCurrent) secBudgetsCurrent.style.display = 'none';
          if (secBudgetsHistory) secBudgetsHistory.style.display = 'block';
        } else {
          if (secBudgetsCurrent) secBudgetsCurrent.style.display = 'block';
          if (secBudgetsHistory) secBudgetsHistory.style.display = 'none';
        }

        if (headerTitle) headerTitle.textContent = 'الميزانيات التقديرية والتاريخية';
        if (headerSub) headerSub.textContent = 'تخطيط الميزانيات الشهرية ومتابعة الفعلي وسجل الميزانيات السابقة';
        if (topAddBtnLbl) topAddBtnLbl.textContent = 'خطة جديدة';

        if (!state.monthlyBudgets || state.monthlyBudgets.length === 0) {
          state.monthlyBudgets = [{
            id: 'plan_default_nov2026',
            name: 'ميزانية نوفمبر 2026 التقديرية',
            month: '2026-11',
            targetIncome: 80000,
            active: true,
            items: [
              { id: 'bi_1', category: 'food', title: 'طعام ومشتريات', amount: 15000, members: ['البيت'] },
              { id: 'bi_2', category: 'bills', title: 'فواتير واشتراكات', amount: 6500, members: ['البيت'] },
              { id: 'bi_3', category: 'health', title: 'صحة وعلاج', amount: 4000, members: ['البيت'] },
              { id: 'bi_4', category: 'education', title: 'تعليم ومدارس', amount: 10000, members: ['محمد', 'مريم'] },
              { id: 'bi_5', category: 'transport', title: 'مواصلات وبنزين', amount: 5000, members: ['ماهر'] }
            ]
          }];
        }
        if (typeof renderMonthlyBudgetPlan === 'function') renderMonthlyBudgetPlan();
        if (typeof updateBudgetKpis === 'function') updateBudgetKpis();
      }
    }
"""

content = content[:idx] + new_fn + "\n    " + content[idx_end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated switchExpectedTopSection successfully.")
