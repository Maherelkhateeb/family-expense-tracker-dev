# -*- coding: utf-8 -*-
"""
apply_master_budgets_and_cockpit_fix.py
Applies all 5 components of the fix to index.html with precision.
"""

import re
import sys

def apply_fixes():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    orig_len = len(html)
    print(f"Original file length: {orig_len}")

    # =========================================================================
    # 1. INJECT MASTER CSS
    # =========================================================================
    master_css = """
    /* =========================================================================
       Master Luxury Segmented Strip for Commitments & Budgets (v5.2.8)
       ========================================================================= */
    .luxury-master-segment-strip {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 8px !important;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95)) !important;
      padding: 6px !important;
      border-radius: 14px !important;
      border: 1.5px solid rgba(56, 189, 248, 0.28) !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
      box-sizing: border-box !important;
      margin-bottom: 12px !important;
    }
    .lux-segment-btn {
      padding: 8px 10px !important;
      border-radius: 11px !important;
      border: 1.2px solid transparent !important;
      background: transparent !important;
      color: #94a3b8 !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 8px !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      user-select: none !important;
    }
    .lux-segment-btn:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      color: #f1f5f9 !important;
    }
    .lux-segment-btn.active#tabExpectedBillsAndDebts {
      background: linear-gradient(135deg, #0284c7, #0369a1) !important;
      border-color: #38bdf8 !important;
      color: #ffffff !important;
      box-shadow: 0 4px 16px rgba(2, 132, 199, 0.45) !important;
    }
    .lux-segment-btn.active#tabExpectedBudgets {
      background: linear-gradient(135deg, #059669, #0d9488) !important;
      border-color: #34d399 !important;
      color: #ffffff !important;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.45) !important;
    }
    .lux-segment-icon {
      width: 32px !important;
      height: 32px !important;
      border-radius: 8px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 0.95rem !important;
      flex-shrink: 0 !important;
    }
    .lux-segment-btn.active .lux-segment-icon.bills-icon {
      background: rgba(255, 255, 255, 0.2) !important;
      color: #ffffff !important;
    }
    .lux-segment-btn:not(.active) .lux-segment-icon.bills-icon {
      background: rgba(56, 189, 248, 0.15) !important;
      color: #38bdf8 !important;
    }
    .lux-segment-btn.active .lux-segment-icon.budgets-icon {
      background: rgba(255, 255, 255, 0.2) !important;
      color: #ffffff !important;
    }
    .lux-segment-btn:not(.active) .lux-segment-icon.budgets-icon {
      background: rgba(16, 185, 129, 0.15) !important;
      color: #34d399 !important;
    }
    .lux-segment-info {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      text-align: right !important;
      flex: 1 !important;
      min-width: 0 !important;
    }
    .lux-segment-title {
      font-size: clamp(0.72rem, 2.1vw, 0.82rem) !important;
      font-weight: 900 !important;
      white-space: nowrap !important;
      line-height: 1.2 !important;
    }
    .lux-segment-sub {
      font-size: 0.60rem !important;
      opacity: 0.8 !important;
      white-space: nowrap !important;
    }
    .lux-segment-badge {
      font-size: 0.62rem !important;
      font-weight: 900 !important;
      padding: 2px 7px !important;
      border-radius: 8px !important;
      white-space: nowrap !important;
      flex-shrink: 0 !important;
    }
    .lux-segment-btn.active .lux-segment-badge {
      background: rgba(255, 255, 255, 0.25) !important;
      color: #ffffff !important;
    }
    .lux-segment-btn:not(.active) .lux-segment-badge {
      background: rgba(255, 255, 255, 0.08) !important;
      color: #94a3b8 !important;
    }

    /* --- Commitment Cards 3-tier Non-Truncating Grid --- */
    .com-kpi-cards-grid {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 6px !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .com-kpi-card {
      border-radius: 12px !important;
      padding: 6px 3px 5px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: space-between !important;
      cursor: pointer !important;
      text-align: center !important;
      min-height: 72px !important;
      box-sizing: border-box !important;
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
      overflow: hidden !important;
    }
    .com-card-header {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 3px !important;
      width: 100% !important;
      flex-wrap: nowrap !important;
    }
    .com-card-icon {
      font-size: 0.68rem !important;
      flex-shrink: 0 !important;
    }
    .com-card-title {
      font-size: clamp(0.58rem, 1.75vw, 0.68rem) !important;
      font-weight: 900 !important;
      white-space: nowrap !important;
      line-height: 1.15 !important;
      overflow: visible !important;
      text-overflow: clip !important;
    }
    .com-card-badge-wrap {
      margin: 2px 0 1px !important;
      width: 100% !important;
      display: flex !important;
      justify-content: center !important;
    }
    .com-card-count-badge {
      font-size: clamp(0.52rem, 1.5vw, 0.58rem) !important;
      padding: 1px 5px !important;
      border-radius: 5px !important;
      font-weight: 850 !important;
      white-space: nowrap !important;
      line-height: 1.2 !important;
      display: inline-block !important;
    }
    .com-card-amount {
      font-size: clamp(0.66rem, 1.95vw, 0.80rem) !important;
      font-weight: 950 !important;
      font-family: var(--font-numbers) !important;
      direction: rtl !important;
      line-height: 1.15 !important;
      white-space: nowrap !important;
    }

    /* شريط فلترة أفراد الميزانية المخصصين */
    .budget-member-filter-strip {
      display: flex;
      gap: 5px;
      overflow-x: auto;
      padding: 4px 2px 8px;
      margin-bottom: 8px;
      scrollbar-width: none;
    }
    .budget-member-filter-strip::-webkit-scrollbar { display: none; }
    .btn-budget-member-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 9px;
      font-size: 0.72rem;
      font-weight: 850;
      white-space: nowrap;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(30, 41, 59, 0.7);
      color: #94a3b8;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-budget-member-pill:hover {
      background: rgba(56, 189, 248, 0.15);
      color: #f1f5f9;
      border-color: rgba(56, 189, 248, 0.35);
    }
    .btn-budget-member-pill.active {
      background: linear-gradient(135deg, #0284c7, #0369a1) !important;
      color: #ffffff !important;
      border-color: #38bdf8 !important;
      box-shadow: 0 2px 10px rgba(2, 132, 199, 0.4);
      font-weight: 950;
    }
    """

    if '.luxury-master-segment-strip' not in html:
        style_idx = html.find('</style>')
        if style_idx != -1:
            html = html[:style_idx] + master_css + '\n' + html[style_idx:]
            print("1. Master CSS injected successfully.")

    # =========================================================================
    # 2. OVERHAUL DUAL TAB STRIP HTML
    # =========================================================================
    # Replace #commitmentsTopTwoTabsStrip
    old_tabs_pattern = r'<div class="expected-dual-master-tabs" id="commitmentsTopTwoTabsStrip"[\s\S]*?</div>\s*</div>\s*<div id="subViewCommitments">'
    new_tabs_html = """<div class="luxury-master-segment-strip" id="commitmentsTopTwoTabsStrip">
            <!-- الزر 1: الفواتير والديون -->
            <button type="button" id="tabExpectedBillsAndDebts" onclick="switchExpectedTopSection('bills_and_debts')" class="lux-segment-btn active" title="الفواتير والأقساط والديون">
              <div class="lux-segment-icon bills-icon">
                <i class="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <div class="lux-segment-info">
                <div class="lux-segment-title">الفواتير والديون</div>
                <div class="lux-segment-sub">الالتزامات الدورية</div>
              </div>
              <span class="lux-segment-badge" id="badgeCountBillsAndDebts">0 التزام</span>
            </button>
            
            <!-- الزر 2: الميزانيات التقديرية -->
            <button type="button" id="tabExpectedBudgets" onclick="switchExpectedTopSection('budgets')" class="lux-segment-btn" title="الميزانيات التقديرية والرقابة الشهرية">
              <div class="lux-segment-icon budgets-icon">
                <i class="fa-solid fa-chart-pie"></i>
              </div>
              <div class="lux-segment-info">
                <div class="lux-segment-title">الميزانيات التقديرية</div>
                <div class="lux-segment-sub">التخطيط والرقابة</div>
              </div>
              <span class="lux-segment-badge" id="badgeCountBudgets">0 بند</span>
            </button>
          </div>
        </div>

        <div id="subViewCommitments">"""

    if re.search(old_tabs_pattern, html):
        html = re.sub(old_tabs_pattern, new_tabs_html, html, count=1)
        print("2. Dual tab strip HTML updated to luxury segmented strip.")
    else:
        print("WARNING: old_tabs_pattern not matched!")

    # =========================================================================
    # 3. OVERHAUL COMMITMENT CARDS GRID HTML
    # =========================================================================
    old_cards_pattern = r'<div class="com-kpi-cards-grid"[\s\S]*?id="kpiCapSettledAmount"[\s\S]*?</div>\s*</div>\s*</div>'
    new_cards_html = """<div class="com-kpi-cards-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; width: 100%; box-sizing: border-box;">
                <!-- كارت 1: مصاريف دورية (أصفر) -->
                <div class="com-kpi-card card-bills" id="cardComBills" onclick="setCommitmentsSubFilter('bills')" title="فواتير ومصاريف دورية قادمة" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(15, 23, 42, 0.92)); border: 1.4px solid rgba(245, 158, 11, 0.45);">
                  <div class="com-card-header">
                    <i class="fa-solid fa-clock com-card-icon" style="color: #fbbf24;"></i>
                    <span class="com-card-title" style="color: #fde047;">مصاريف دورية</span>
                  </div>
                  <div class="com-card-badge-wrap">
                    <span id="kpiCap1Count" class="com-card-count-badge" style="background: rgba(245, 158, 11, 0.22); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);">0 بند</span>
                  </div>
                  <div id="kpiCap1Amount" class="com-card-amount" style="color: #fbbf24;">0.00 ج.م</div>
                </div>

                <!-- كارت 2: ديون علينا (أحمر) -->
                <div class="com-kpi-card card-debts-on-us" id="cardComDebtsOnUs" onclick="setCommitmentsSubFilter('debts_on_us')" title="ديون والتزامات علينا للغير" style="background: linear-gradient(135deg, rgba(244, 63, 94, 0.14), rgba(15, 23, 42, 0.92)); border: 1.4px solid rgba(244, 63, 94, 0.45);">
                  <div class="com-card-header">
                    <i class="fa-solid fa-handshake-angle com-card-icon" style="color: #fb7185;"></i>
                    <span class="com-card-title" style="color: #fda4af;">ديون علينا</span>
                  </div>
                  <div class="com-card-badge-wrap">
                    <span id="kpiCap2Count" class="com-card-count-badge" style="background: rgba(244, 63, 94, 0.22); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.4);">0 بند</span>
                  </div>
                  <div id="kpiCap2Amount" class="com-card-amount" style="color: #fb7185;">- 0.00 ج.م</div>
                </div>

                <!-- كارت 3: ديون لنا (أخضر) -->
                <div class="com-kpi-card card-debts-for-us" id="cardComDebtsForUs" onclick="setCommitmentsSubFilter('debts_for_us')" title="ديون ومستحقات لنا عند الغير" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(15, 23, 42, 0.92)); border: 1.4px solid rgba(16, 185, 129, 0.45);">
                  <div class="com-card-header">
                    <i class="fa-solid fa-sack-dollar com-card-icon" style="color: #34d399;"></i>
                    <span class="com-card-title" style="color: #6ee7b7;">ديون لنا</span>
                  </div>
                  <div class="com-card-badge-wrap">
                    <span id="kpiCap3Count" class="com-card-count-badge" style="background: rgba(16, 185, 129, 0.22); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);">0 بند</span>
                  </div>
                  <div id="kpiCap3Amount" class="com-card-amount" style="color: #34d399;">+ 0.00 ج.م</div>
                </div>

                <!-- كارت 4: تم السداد (أزرق) -->
                <div class="com-kpi-card card-settled" id="cardComSettled" onclick="setCommitmentsSubFilter('settled')" title="الالتزامات التي تم سدادها بالكامل" style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.14), rgba(15, 23, 42, 0.92)); border: 1.4px solid rgba(56, 189, 248, 0.45);">
                  <div class="com-card-header">
                    <i class="fa-solid fa-circle-check com-card-icon" style="color: #38bdf8;"></i>
                    <span class="com-card-title" style="color: #7dd3fc;">تم السداد</span>
                  </div>
                  <div class="com-card-badge-wrap">
                    <span id="kpiCapSettledCount" class="com-card-count-badge" style="background: rgba(2, 132, 199, 0.22); color: #38bdf8; border: 1px solid rgba(2, 132, 199, 0.4);">0 مكتمل</span>
                  </div>
                  <div id="kpiCapSettledAmount" class="com-card-amount" style="color: #38bdf8;">0.00 ج.م</div>
                </div>
              </div>"""

    if re.search(old_cards_pattern, html):
        html = re.sub(old_cards_pattern, new_cards_html, html, count=1)
        print("3. Commitment cards grid HTML updated with stacked badges.")
    else:
        print("WARNING: old_cards_pattern not matched!")

    # =========================================================================
    # 4. INJECT MEMBER FILTER STRIP IN PANEL MONTHLY BUDGET
    # =========================================================================
    target_budget_filter = '<div id="budgetItemsListContainer"'
    if 'id="budgetMemberFilterStrip"' not in html and target_budget_filter in html:
        filter_strip_html = """<!-- شريط فلترة أفراد الميزانية المخصصين -->
          <div class="budget-member-filter-strip" id="budgetMemberFilterStrip">
            <!-- تتولد شارات الأفراد ديناميكياً بواسطة renderBudgetMemberFilterPills() -->
          </div>

          <div id="budgetItemsListContainer\""""
        html = html.replace(target_budget_filter, filter_strip_html, 1)
        print("4. Budget Member Filter Strip injected.")

    # =========================================================================
    # 5. INJECT EDIT BUDGET ITEM MODAL BEFORE </body>
    # =========================================================================
    modal_edit_html = """
  <!-- نافذة تعديل بند الميزانية وربطه بالأفراد والبيانات -->
  <div id="modalEditBudgetItem" class="custom-modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.78); backdrop-filter: blur(8px); z-index: 2000000; align-items: center; justify-content: center; padding: 14px;">
    <div class="custom-modal-content" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.96)); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 18px; width: 100%; max-width: 440px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); overflow: hidden; animation: popIn 0.25s ease;">
      <!-- الهيدر -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(15, 23, 42, 0.6);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
            <i class="fa-solid fa-pen-to-square"></i>
          </div>
          <h3 style="margin: 0; font-size: 0.95rem; font-weight: 900; color: #f8fafc;">تعديل بند المصروف التقديري</h3>
        </div>
        <button type="button" onclick="closeEditBudgetItemModal()" style="background: none; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer; padding: 4px;">&times;</button>
      </div>

      <!-- الجسم -->
      <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
        <input type="hidden" id="editBudgetItemId">
        <div>
          <label style="display: block; font-size: 0.74rem; font-weight: 800; color: #94a3b8; margin-bottom: 4px;">مسمى البند:</label>
          <input type="text" id="editBudgetItemTitle" class="form-control-custom" style="width: 100%; height: 38px; border-radius: 8px; font-weight: 800; font-size: 0.85rem;" placeholder="مثال: ملابس أية، مصروف المدرسة...">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="display: block; font-size: 0.74rem; font-weight: 800; color: #94a3b8; margin-bottom: 4px;">التصنيف:</label>
            <select id="editBudgetItemCategory" class="form-select-custom" style="width: 100%; height: 38px; border-radius: 8px; font-weight: 800; font-size: 0.82rem;">
              <!-- يتولد ديناميكياً -->
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.74rem; font-weight: 800; color: #94a3b8; margin-bottom: 4px;">المبلغ المقدر (ج.م):</label>
            <input type="number" step="any" id="editBudgetItemAmount" class="form-control-custom" style="width: 100%; height: 38px; border-radius: 8px; font-weight: 950; font-size: 0.92rem; color: #38bdf8;" placeholder="0.00">
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.74rem; font-weight: 800; color: #94a3b8; margin-bottom: 6px;">مخصص لمن من أفراد الأسرة؟ (ربط المصروف بشخص):</label>
          <div id="editBudgetItemMembersGrid" style="display: flex; flex-wrap: wrap; gap: 6px;">
            <!-- تتولد ديناميكياً بواسطة renderEditBudgetMembersGrid() -->
          </div>
        </div>
      </div>

      <!-- الأزرار -->
      <div style="display: flex; gap: 8px; justify-content: flex-end; padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(15, 23, 42, 0.4);">
        <button type="button" onclick="closeEditBudgetItemModal()" class="btn-wallet-action-pill" style="height: 36px; padding: 0 14px; background: rgba(255,255,255,0.08); color: #94a3b8; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; font-weight: 800; cursor: pointer;">إلغاء</button>
        <button type="button" onclick="saveEditedBudgetItem()" class="btn-wallet-action-pill" style="height: 36px; padding: 0 16px; background: linear-gradient(135deg, #0284c7, #10b981); color: #fff; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 8px; font-weight: 900; cursor: pointer; box-shadow: 0 3px 12px rgba(2, 132, 199, 0.4);">حفظ التعديلات ✨</button>
      </div>
    </div>
  </div>
"""

    if 'id="modalEditBudgetItem"' not in html:
        body_close = html.rfind('</body>')
        if body_close != -1:
            html = html[:body_close] + modal_edit_html + '\n' + html[body_close:]
            print("5. Edit Budget Item Modal injected before </body>.")

    # =========================================================================
    # 6. REPLACE SWITCH EXPECTED TOP SECTION FUNCTION
    # =========================================================================
    old_switch_pattern = r'function switchExpectedTopSection\(sec\) \{[\s\S]*?renderBudgetHistory\(\);\s*\}\s*else\s*\{[\s\S]*?topAddBtnLbl\.textContent = \'خطة جديدة\';\s*\}\s*\}'
    new_switch_fn = """function switchExpectedTopSection(sec) {
      activeExpectedTopSection = sec;
      try { localStorage.setItem('family_monefy_expected_top_section', sec); } catch(e) {}

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
        if (btnBillsDebts) btnBillsDebts.classList.add('active');
        if (btnBudgets) btnBudgets.classList.remove('active');

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
        if (btnBudgets) btnBudgets.classList.add('active');
        if (btnBillsDebts) btnBillsDebts.classList.remove('active');

        if (secBillsDebts) secBillsDebts.style.display = 'none';
        if (budgetSubTabs) budgetSubTabs.style.display = 'flex';

        if (activeBudgetSubTab === 'history') {
          if (secBudgetsCurrent) secBudgetsCurrent.style.display = 'none';
          if (secBudgetsHistory) secBudgetsHistory.style.display = 'block';
          renderBudgetHistory();
        } else {
          if (secBudgetsCurrent) secBudgetsCurrent.style.display = 'block';
          if (secBudgetsHistory) secBudgetsHistory.style.display = 'none';
          loadActiveBudgetPlan();
        }

        if (headerTitle) headerTitle.textContent = 'الميزانيات والخطط الشهرية';
        if (headerSub) headerSub.textContent = 'التخطيط المالي وتوزيع الميزانيات والرقابة على المصروفات';
        if (topAddBtnLbl) topAddBtnLbl.textContent = 'خطة جديدة';

        // تحديث شارة عدد البنود على زر الميزانيات
        const bBadge = document.getElementById('badgeCountBudgets');
        if (bBadge && currentBudgetMonthData && currentBudgetMonthData.items) {
          bBadge.textContent = `${currentBudgetMonthData.items.length} بند`;
        }
      }
    }
    window.switchExpectedTopSection = switchExpectedTopSection;

    // اختصار فتح الميزانيات مباشرة من أي مكان
    window.openBudgetsDirectly = function() {
      switchAppPage('expected');
      switchExpectedTopSection('budgets');
    };"""

    if re.search(old_switch_pattern, html):
        html = re.sub(old_switch_pattern, new_switch_fn, html, count=1)
        print("6. switchExpectedTopSection overhauled and exported.")
    else:
        print("WARNING: old_switch_pattern not matched!")

    # =========================================================================
    # 7. UPDATE INIT MONTHLY BUDGET UI & LOAD ACTIVE PLAN
    # =========================================================================
    # Ensure initMonthlyBudgetUI calls loadActiveBudgetPlan()
    old_init_bgt = r'populateBudgetPlanSelector\(\);\s*renderBudgetMembersMultiPicker\(\);\s*\}'
    new_init_bgt = """populateBudgetPlanSelector();
      renderBudgetMembersMultiPicker();
      loadActiveBudgetPlan();
    }"""
    if re.search(old_init_bgt, html):
        html = re.sub(old_init_bgt, new_init_bgt, html, count=1)
        print("7. initMonthlyBudgetUI updated to load active plan immediately.")

    # =========================================================================
    # 8. PER-PERSON EXPENSE MATCHING & FULL ALLOCATIONS RENDERER
    # =========================================================================
    old_alloc_pattern = r'function renderMonthlyBudgetAllocations\(\) \{[\s\S]*?syncBudgetCategoriesMap\(currentBudgetMonthData\);\s*renderMonthlyBudgetAllocations\(\);\s*\}'
    
    new_alloc_engine = """// حساب المصروفات الفعلية المطابقة للبند بدقة مع مراعاة تخصيص الأفراد
    function getExpensesForBudgetItem(it, allMonthExpenses, allBudgetItems) {
      const itemMembers = Array.isArray(it.members) && it.members.length > 0 ? it.members : ['البيت'];
      const isSharedHouse = itemMembers.includes('البيت') || itemMembers.includes('الكل') || itemMembers.includes('عائلة ماهر واية');

      return allMonthExpenses.filter(t => {
        if (t.category !== it.category) return false;
        const tMember = (t.member || t.author || 'البيت').trim();

        if (!isSharedHouse) {
          // البند مخصص لأفراد محددين بالاسم (مثل أية، ماهر، محمد، ...)
          return itemMembers.includes(tMember);
        }

        // إذا كان البند مشترك للبيت/الكل:
        // نتحقق إذا كان هناك بند آخر منفصل في نفس الخطة ونفس التصنيف مخصص تحديداً لهذا الفرد
        const hasDedicatedItem = (allBudgetItems || []).some(other => {
          if (other.id === it.id || other.category !== it.category) return false;
          const otherMems = Array.isArray(other.members) ? other.members : [];
          return otherMems.includes(tMember) && !otherMems.includes('البيت') && !otherMems.includes('الكل');
        });

        // إذا وجد بند مخصص له، لا نخصمه من ميزانية البيت العامة
        if (hasDedicatedItem) return false;

        return true;
      });
    }
    window.getExpensesForBudgetItem = getExpensesForBudgetItem;

    var currentBudgetMemberFilter = 'all';

    function setBudgetMemberFilter(member, btn) {
      currentBudgetMemberFilter = member;
      const pills = document.querySelectorAll('#budgetMemberFilterStrip button');
      pills.forEach(p => p.classList.remove('active'));
      if (btn) btn.classList.add('active');
      renderMonthlyBudgetAllocations();
    }
    window.setBudgetMemberFilter = setBudgetMemberFilter;

    function renderBudgetMemberFilterPills() {
      const strip = document.getElementById('budgetMemberFilterStrip');
      if (!strip) return;

      const membersList = [
        { name: 'الكل', val: 'all', icon: 'fa-solid fa-users' },
        { name: 'البيت', val: 'البيت', icon: 'fa-solid fa-house' },
        { name: 'ماهر', val: 'ماهر', icon: 'fa-solid fa-user-tie' },
        { name: 'أية', val: 'أية', icon: 'fa-solid fa-user-nurse' },
        { name: 'محمد', val: 'محمد', icon: 'fa-solid fa-child' },
        { name: 'مريم', val: 'مريم', icon: 'fa-solid fa-child-dress' },
        { name: 'الحاجة', val: 'الحاجة', icon: 'fa-solid fa-person-cane' },
        { name: 'النونو', val: 'النونو', icon: 'fa-solid fa-baby' }
      ];

      strip.innerHTML = membersList.map(m => {
        const isActive = (currentBudgetMemberFilter === m.val);
        const avatar = (typeof MEMBER_AVATARS !== 'undefined' && MEMBER_AVATARS[m.val]) ? MEMBER_AVATARS[m.val] : '';
        const imgTag = avatar ? `<img src="${avatar}" style="width: 17px; height: 17px; border-radius: 50%; object-fit: cover;">` : `<i class="${m.icon}"></i>`;
        return `
          <button type="button" class="btn-budget-member-pill ${isActive ? 'active' : ''}" onclick="setBudgetMemberFilter('${m.val}', this)">
            ${imgTag} <span>${m.name}</span>
          </button>
        `;
      }).join('');
    }
    window.renderBudgetMemberFilterPills = renderBudgetMemberFilterPills;

    function renderMonthlyBudgetAllocations() {
      if (!currentBudgetMonthData) return;
      ensureBudgetItems(currentBudgetMonthData);

      const itemsContainer = document.getElementById('budgetItemsListContainer');
      const countBadge = document.getElementById('budgetItemsCountBadge');
      const bBadge = document.getElementById('badgeCountBudgets');

      renderBudgetMemberFilterPills();

      const targetMonth = currentBudgetMonthData.month || '2026-11';
      const monthExpenses = (state.transactions || []).filter(t => t.type === 'expense' && t.date && t.date.startsWith(targetMonth));
      const allItems = currentBudgetMonthData.items || [];

      // فلترة البنود بحسب العضو المحدد إن لم يكن "الكل"
      const filteredItems = (currentBudgetMemberFilter === 'all')
        ? allItems
        : allItems.filter(it => (it.members || ['البيت']).includes(currentBudgetMemberFilter));

      // حساب الإجماليات بدقة
      let totalBudgetFiltered = 0;
      let totalActualFiltered = 0;

      filteredItems.forEach(it => {
        totalBudgetFiltered += (Number(it.amount) || 0);
        const matches = getExpensesForBudgetItem(it, monthExpenses, allItems);
        totalActualFiltered += matches.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      });

      // تحديث شريط الرقابة المالية الإجمالي
      const summaryTxt = document.getElementById('budgetActualSummaryTxt');
      const progBar = document.getElementById('budgetActualProgressBar');
      if (summaryTxt) {
        const overallPct = totalBudgetFiltered > 0 ? ((totalActualFiltered / totalBudgetFiltered) * 100).toFixed(1) : 0;
        const filterLabel = (currentBudgetMemberFilter === 'all') ? 'كافة بنود الخطة' : `مخصصات (${currentBudgetMemberFilter})`;
        summaryTxt.innerHTML = `منصرف ${filterLabel} لشهر (${targetMonth}): <strong>${formatMoney(totalActualFiltered)}</strong> من أصل مقدر <strong>${formatMoney(totalBudgetFiltered)}</strong> (${overallPct}%)`;
      }
      if (progBar) {
        const pctVal = totalBudgetFiltered > 0 ? Math.min(100, (totalActualFiltered / totalBudgetFiltered) * 100) : 0;
        progBar.style.width = pctVal + '%';
        progBar.style.background = (totalActualFiltered > totalBudgetFiltered) ? '#ef4444' : '#10b981';
      }

      if (countBadge) {
        countBadge.textContent = `${filteredItems.length} من أصل ${allItems.length} بند`;
      }
      if (bBadge) {
        bBadge.textContent = `${allItems.length} بند`;
      }

      // رسم كروت بنود المصروفات التقديرية المربوطة بالأفراد
      if (itemsContainer) {
        if (filteredItems.length === 0) {
          itemsContainer.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.6); border: 1.5px dashed rgba(255,255,255,0.12); border-radius: 12px; padding: 18px; text-align: center; color: #94a3b8;">
              <i class="fa-solid fa-clipboard-list" style="font-size: 1.8rem; color: #38bdf8; margin-bottom: 6px;"></i>
              <div style="font-size: 0.85rem; font-weight: 800; color: #cbd5e1;">لا توجد بنود مصروفات مخصصة لـ (${currentBudgetMemberFilter})</div>
              <div style="font-size: 0.72rem; margin-top: 3px;">اختر فرداً آخر من الشريط العلوي أو أضف بنداً جديداً مخصصاً له</div>
            </div>
          `;
        } else {
          itemsContainer.innerHTML = filteredItems.map((it, idx) => {
            const cat = EXPENSE_CATEGORIES.find(c => c.id === it.category) || { name: 'أخرى', icon: 'fa-cube', color: '#38bdf8', emoji: '📦' };

            // حساب المنصرف الفعلي الخاص بهذا البند وهذا الشخص
            const matchingExpenses = getExpensesForBudgetItem(it, monthExpenses, allItems);
            const catActual = matchingExpenses.reduce((s, t) => s + (Number(t.amount) || 0), 0);
            const isOver = catActual > it.amount;
            const diff = it.amount - catActual;
            const pct = it.amount > 0 ? Math.min(100, Math.round((catActual / it.amount) * 100)) : 0;

            const itemMembers = (it.members && it.members.length > 0) ? it.members : ['البيت'];
            const isHouse = itemMembers.includes('البيت') || itemMembers.includes('الكل');

            // شارات أفراد الأسرة المرتبطين بهذا البند
            const memberChips = itemMembers.map(m => {
              const avatar = (typeof MEMBER_AVATARS !== 'undefined' && MEMBER_AVATARS[m]) ? MEMBER_AVATARS[m] : '';
              return `
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; padding: 2px 7px; border-radius: 6px; font-size: 0.68rem; font-weight: 800;">
                  ${avatar ? `<img src="${avatar}" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;">` : `<i class="fa-solid fa-user" style="font-size: 0.6rem;"></i>`}
                  <span>${m}</span>
                </span>
              `;
            }).join('');

            return `
              <div class="budget-item-card" style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid ${isOver ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.08)'}; border-radius: 12px; padding: 10px 12px; transition: all 0.2s ease;">
                <!-- الصف العلوي: العنوان والتصنيف والأفراد وأزرار التحكم -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 1.0rem; flex-shrink: 0;">
                      ${cat.emoji || `<i class="fa-solid ${cat.icon}" style="color: ${cat.color};"></i>`}
                    </div>
                    <div>
                      <div style="font-weight: 900; font-size: 0.86rem; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
                        <span>${escapeHtml(it.title || cat.name)}</span>
                        <span style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">(${cat.name})</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px; margin-top: 3px; flex-wrap: wrap;">
                        <span style="font-size: 0.64rem; color: #94a3b8;">${isHouse ? '🏠 ميزانية مشتركة:' : '👤 مخصص لـ:'}</span>
                        ${memberChips}
                      </div>
                    </div>
                  </div>

                  <!-- أزرار الإجراءات (تعديل + حذف) -->
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <button type="button" onclick="openEditBudgetItemModal('${it.id}')" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;" title="تعديل البند وربط الأفراد">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" onclick="deleteBudgetItem('${it.id}')" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;" title="حذف البند">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>

                <!-- شريط المقارنة المالي والتفاصيل -->
                <div style="background: rgba(30, 41, 59, 0.6); padding: 6px 10px; border-radius: 8px; margin-bottom: 6px; font-size: 0.72rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;">
                  <div>
                    <span style="color: #94a3b8;">المنصرف الفعلي لـ (${itemMembers.join(' + ')}): </span>
                    <strong style="color: ${isOver ? '#f87171' : '#34d399'}; font-weight: 900;">${formatMoney(catActual)}</strong>
                    <span style="color: #64748b; margin: 0 3px;">من أصل</span>
                    <strong style="color: #38bdf8; font-weight: 900;">${formatMoney(it.amount)}</strong>
                  </div>
                  <div style="font-weight: 850; color: ${isOver ? '#ef4444' : '#10b981'}; font-size: 0.70rem;">
                    ${isOver ? `⚠️ تجاوز: -${formatMoney(Math.abs(diff))}` : `متبقي: +${formatMoney(diff)}`} (${pct}%)
                  </div>
                </div>

                <!-- شريط التقدم المرئي -->
                <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden;">
                  <div style="width: ${pct}%; height: 100%; background: ${isOver ? 'linear-gradient(90deg, #f43f5e, #ef4444)' : 'linear-gradient(90deg, #38bdf8, #10b981)'}; transition: width 0.3s ease;"></div>
                </div>
              </div>
            `;
          }).join('');
        }
      }
    }
    window.renderMonthlyBudgetAllocations = renderMonthlyBudgetAllocations;

    // دوال نافذة تعديل بند الميزانية المخصص
    var editingBudgetItemRef = null;
    var editBudgetItemMembersSelected = [];

    function openEditBudgetItemModal(itemId) {
      if (!currentBudgetMonthData || !currentBudgetMonthData.items) return;
      const it = currentBudgetMonthData.items.find(i => i.id === itemId);
      if (!it) return;

      editingBudgetItemRef = it;
      editBudgetItemMembersSelected = Array.isArray(it.members) && it.members.length > 0 ? [...it.members] : ['البيت'];

      const inpId = document.getElementById('editBudgetItemId');
      const inpTitle = document.getElementById('editBudgetItemTitle');
      const inpAmt = document.getElementById('editBudgetItemAmount');
      const selCat = document.getElementById('editBudgetItemCategory');

      if (inpId) inpId.value = it.id;
      if (inpTitle) inpTitle.value = it.title || '';
      if (inpAmt) inpAmt.value = it.amount || '';

      if (selCat) {
        selCat.innerHTML = EXPENSE_CATEGORIES.map(c => `
          <option value="${c.id}" ${c.id === it.category ? 'selected' : ''}>${c.emoji || '📦'} ${c.name}</option>
        `).join('');
      }

      renderEditBudgetMembersGrid();

      const modal = document.getElementById('modalEditBudgetItem');
      if (modal) modal.style.display = 'flex';
    }
    window.openEditBudgetItemModal = openEditBudgetItemModal;

    function closeEditBudgetItemModal() {
      const modal = document.getElementById('modalEditBudgetItem');
      if (modal) modal.style.display = 'none';
      editingBudgetItemRef = null;
    }
    window.closeEditBudgetItemModal = closeEditBudgetItemModal;

    function renderEditBudgetMembersGrid() {
      const grid = document.getElementById('editBudgetItemMembersGrid');
      if (!grid) return;

      const membersList = [
        { name: 'البيت', icon: 'fa-solid fa-house' },
        { name: 'ماهر', icon: 'fa-solid fa-user-tie' },
        { name: 'أية', icon: 'fa-solid fa-user-nurse' },
        { name: 'محمد', icon: 'fa-solid fa-child' },
        { name: 'مريم', icon: 'fa-solid fa-child-dress' },
        { name: 'الحاجة', icon: 'fa-solid fa-person-cane' },
        { name: 'النونو', icon: 'fa-solid fa-baby' }
      ];

      grid.innerHTML = membersList.map(m => {
        const isSelected = editBudgetItemMembersSelected.includes(m.name);
        const avatar = (typeof MEMBER_AVATARS !== 'undefined' && MEMBER_AVATARS[m.name]) ? MEMBER_AVATARS[m.name] : '';
        const imgTag = avatar ? `<img src="${avatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">` : `<i class="${m.icon}"></i>`;
        const activeStyle = isSelected
          ? 'background: linear-gradient(135deg, #0284c7, #0369a1); border-color: #38bdf8; color: #fff; font-weight: 900;'
          : 'background: rgba(30, 41, 59, 0.7); border-color: rgba(255,255,255,0.12); color: #94a3b8;';

        return `
          <button type="button" onclick="toggleEditBudgetItemMember('${m.name}')" style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 8px; font-size: 0.72rem; cursor: pointer; border: 1px solid; transition: all 0.2s; ${activeStyle}">
            ${imgTag} <span>${m.name}</span>
          </button>
        `;
      }).join('');
    }
    window.renderEditBudgetMembersGrid = renderEditBudgetMembersGrid;

    function toggleEditBudgetItemMember(name) {
      if (name === 'البيت') {
        editBudgetItemMembersSelected = ['البيت'];
      } else {
        editBudgetItemMembersSelected = editBudgetItemMembersSelected.filter(m => m !== 'البيت');
        if (editBudgetItemMembersSelected.includes(name)) {
          editBudgetItemMembersSelected = editBudgetItemMembersSelected.filter(m => m !== name);
        } else {
          editBudgetItemMembersSelected.push(name);
        }
        if (editBudgetItemMembersSelected.length === 0) {
          editBudgetItemMembersSelected = ['البيت'];
        }
      }
      renderEditBudgetMembersGrid();
    }
    window.toggleEditBudgetItemMember = toggleEditBudgetItemMember;

    function saveEditedBudgetItem() {
      if (!editingBudgetItemRef || !currentBudgetMonthData) return;

      const inpTitle = document.getElementById('editBudgetItemTitle');
      const inpAmt = document.getElementById('editBudgetItemAmount');
      const selCat = document.getElementById('editBudgetItemCategory');

      const title = inpTitle ? inpTitle.value.trim() : '';
      const amt = parseFloat(inpAmt ? inpAmt.value : 0);
      const cat = selCat ? selCat.value : 'other';

      if (isNaN(amt) || amt <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ تقديري صحيح للبند');
        return;
      }

      editingBudgetItemRef.title = title || (EXPENSE_CATEGORIES.find(c => c.id === cat) || {}).name || 'بند مصروف';
      editingBudgetItemRef.amount = amt;
      editingBudgetItemRef.category = cat;
      editingBudgetItemRef.members = editBudgetItemMembersSelected.length > 0 ? [...editBudgetItemMembersSelected] : ['البيت'];

      syncBudgetCategoriesMap(currentBudgetMonthData);
      renderMonthlyBudgetAllocations();
      closeEditBudgetItemModal();
      showToast('✨ تم حفظ تعديلات البند وربطه بالأفراد بنجاح!');
    }
    window.saveEditedBudgetItem = saveEditedBudgetItem;"""

    if re.search(old_alloc_pattern, html):
        html = re.sub(old_alloc_pattern, new_alloc_engine, html, count=1)
        print("8. Per-person expense matching & full allocations engine injected.")
    else:
        print("WARNING: old_alloc_pattern not matched!")

    # =========================================================================
    # 9. UPDATE SWITCH APP PAGE ('expected') TO PRESERVE TOP SECTION
    # =========================================================================
    old_switch_page_exp = r'if \(pageId === \'expected\'\) \{[\s\S]*?renderMemberPhotoPickers\(\);\s*\}\s*\}'
    new_switch_page_exp = """if (pageId === 'expected') {
        const savedSec = localStorage.getItem('family_monefy_expected_top_section') || 'bills_and_debts';
        if (typeof switchExpectedTopSection === 'function') {
          switchExpectedTopSection(savedSec);
        }
        if (typeof renderExpectedList === 'function') {
          renderExpectedList();
        }
        if (typeof renderMemberPhotoPickers === 'function') {
          renderMemberPhotoPickers();
        }
      }"""

    if re.search(old_switch_page_exp, html):
        html = re.sub(old_switch_page_exp, new_switch_page_exp, html, count=1)
        print("9. switchAppPage('expected') updated to preserve active top section.")
    else:
        print("WARNING: old_switch_page_exp not matched!")

    # =========================================================================
    # 10. BUMP VERSION TO v5.2.8
    # =========================================================================
    html = html.replace("var APP_VERSION = 'v5.2.7';", "var APP_VERSION = 'v5.2.8';")
    html = html.replace("window.APP_VERSION = 'v5.2.7';", "window.APP_VERSION = 'v5.2.8';")
    html = html.replace("var APP_BUILD_ID = 202611081730;", "var APP_BUILD_ID = 202611081755;")
    html = html.replace("window.APP_BUILD_ID = 202611081730;", "window.APP_BUILD_ID = 202611081755;")

    with open(INDEX_PATH, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"Update complete! New file length: {len(html)}")

if __name__ == '__main__':
    apply_fixes()
