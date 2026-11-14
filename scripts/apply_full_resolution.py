import io
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
HTML_FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    html = f.read()

print("Original HTML length:", len(html))

# -------------------------------------------------------------
# 1. Update Master Wealth Executive Cockpit (Image 1 fix)
# -------------------------------------------------------------
old_cockpit_regex = re.compile(
    r'<div class="kpi-master-wealth-cockpit" id="topKpiThreeStrip">.*?<!-- الفاصل الرأسي الزجاجي الفاخر المتوهج -->\s*<div class="cockpit-divider"></div>\s*<!-- الجانب الأيسر: كبسولات التدفقات النقدية التوأم \(إيداعات \+ مصروفات\) -->\s*<div class="cockpit-flow-side">.*?</div>\s*</div>\s*</div>',
    re.DOTALL
)

new_cockpit_html = '''<div class="kpi-master-wealth-cockpit" id="topKpiThreeStrip">
          
          <!-- الجانب الأيمن: بطل الشاشة المالي (الرصيد الفعلي المتاح) -->
          <div class="cockpit-hero-side" onclick="openActualBalanceAuditModal()" title="الرصيد الفعلي والتدقيق المالي" style="cursor: pointer;">
            <div class="cockpit-hero-label">
              <div class="hero-wallet-icon-badge">
                <i class="fa-solid fa-wallet"></i>
              </div>
              <span class="hero-title-text">الرصيد الفعلي الحالي</span>
              <button type="button" class="cockpit-privacy-btn" id="btnToggleBalancePrivacy" onclick="event.stopPropagation(); toggleBalancePrivacy();" title="إخفاء / إظهار الرصيد">
                <i class="fa-solid fa-eye" id="iconBalancePrivacy"></i>
              </button>
            </div>
            <div class="cockpit-hero-value" id="topCardBalance" style="font-size: clamp(1.65rem, 5.2vw, 2.20rem) !important; font-weight: 950 !important; letter-spacing: -0.3px; text-shadow: 0 2px 18px rgba(56, 189, 248, 0.65); margin: auto 0; color: #38bdf8;">+ 0.00 ج.م</div>
            <div class="hero-liquidity-subtitle" style="font-size: clamp(0.58rem, 1.8vw, 0.66rem); color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 1px;">
              <i class="fa-solid fa-shield-halved" style="color: #34d399; font-size: 0.72rem;"></i>
              <span>صافي السيولة المعتمدة للمحافظ</span>
            </div>
          </div>

          <!-- الفاصل الرأسي الزجاجي الفاخر المتوهج -->
          <div class="cockpit-divider"></div>

          <!-- الجانب الأيسر: كبسولات التدفقات النقدية التوأم (إيداعات + مصروفات) -->
          <div class="cockpit-flow-side">
            <!-- كبسولة إجمالي الإيداعات -->
            <div class="cockpit-flow-pill inflow" onclick="openModal('incomeChoiceModal')" title="الإيداعات والدخل" style="cursor: pointer;">
              <div class="flow-pill-left-group">
                <div class="flow-icon-badge inflow-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="8 12 12 16 16 12"></polyline>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                  </svg>
                </div>
                <span class="flow-title inflow-color">إيداعات</span>
              </div>
              <span class="flow-amount inflow-color" id="topCardIncome">+ 0.00 ج.م</span>
            </div>

            <!-- كبسولة إجمالي المصروفات -->
            <div class="cockpit-flow-pill outflow" onclick="openOperationsFiltered({ type: 'expense' })" title="المصروفات والسحوبات" style="cursor: pointer;">
              <div class="flow-pill-left-group">
                <div class="flow-icon-badge outflow-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="16 12 12 8 8 12"></polyline>
                    <line x1="12" y1="16" x2="12" y2="8"></line>
                  </svg>
                </div>
                <span class="flow-title outflow-color">مصروفات</span>
              </div>
              <span class="flow-amount outflow-color" id="topCardExpense">- 0.00 ج.م</span>
            </div>
          </div>

        </div>'''

cockpit_start = html.find('id="topKpiThreeStrip"')
if cockpit_start != -1:
    div_start = html.rfind('<div class="kpi-master-wealth-cockpit"', 0, cockpit_start)
    cockpit_end = html.find('<!-- أدوات سريعة متناسقة ومريحة', div_start)
    if cockpit_end != -1:
        # replace cleanly
        html = html[:div_start] + new_cockpit_html + '\n\n        ' + html[cockpit_end:]
        print("✓ Cockpit markup successfully updated with verified inline SVGs & subtitle")
    else:
        print("! Could not locate cockpit end marker")
else:
    print("! Could not find topKpiThreeStrip")

# -------------------------------------------------------------
# 2. Update Commitment 4 Cards (Image 2 fix)
# -------------------------------------------------------------
new_commitments_kpi_card = '''<!-- بطاقة المؤشرات والمركز المالي الذكية (4 كروت تنفيذية متناسقة) -->
          <div class="expected-kpi-master-card" id="commitmentKpiMasterCard" style="background: rgba(15, 23, 42, 0.88); border: 1.2px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 10px 12px; margin-bottom: 10px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);">
            <!-- الشريط العلوي للصافي -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 0.80rem; font-weight: 900; color: #cbd5e1;">
                <i class="fa-solid fa-scale-balanced" id="kpiNetIconCommitments" style="color: #38bdf8;"></i>
                <span id="kpiNetLabelCommitments">صافي الالتزامات المالية المطلوب تدبيرها:</span>
              </div>
              <div id="kpiNetValueCommitments" style="font-size: 0.95rem; font-weight: 950; font-family: var(--font-numbers); direction: ltr; color: #ff4d6d;">
                - 0.00 ج.م
              </div>
            </div>

            <!-- الكروت الرباعية التنفيذية المتناسقة (عدد البنود أسفل اسم البند تماماً) -->
            <div class="commitments-4cards-grid" id="commitmentsExecutiveCardsStrip" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
              
              <!-- كارت 1: مصاريف دورية / قادمة (أصفر) -->
              <div class="com-kpi-card card-bills-upcoming" id="cardComBills" onclick="setCommitmentsSubFilter('bills')" title="فواتير ومصاريف دورية قادمة" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(15, 23, 42, 0.92)); border: 1.4px solid rgba(245, 158, 11, 0.45); border-radius: 12px; padding: 7px 4px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; cursor: pointer; text-align: center; transition: all 0.2s ease; min-height: 74px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%;">
                  <i class="fa-solid fa-clock" style="color: #fbbf24; font-size: 0.72rem;"></i>
                  <span style="font-size: clamp(0.64rem, 1.9vw, 0.74rem); font-weight: 900; color: #fde047; white-space: nowrap;">مصاريف دورية</span>
                </div>
                <div style="margin: 3px 0 2px;">
                  <span id="kpiCap1Count" style="font-size: 0.58rem; background: rgba(245, 158, 11, 0.22); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 1px 6px; border-radius: 5px; font-weight: 800; display: inline-block;">0 بند</span>
                </div>
                <div id="kpiCap1Amount" style="font-size: clamp(0.72rem, 2.2vw, 0.88rem); font-weight: 950; color: #fbbf24; font-family: var(--font-numbers); direction: rtl; line-height: 1.1;">0.00 ج.م</div>
              </div>

              <!-- كارت 2: ديون علينا (أحمر) -->
              <div class="com-kpi-card card-debts-on-us" id="cardComDebtsOnUs" onclick="setCommitmentsSubFilter('debts_on_us')" title="ديون والتزامات علينا للغير" style="background: linear-gradient(135deg, rgba(244, 63, 94, 0.14), rgba(15, 23, 42, 0.92)); border: 1.4px solid rgba(244, 63, 94, 0.45); border-radius: 12px; padding: 7px 4px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; cursor: pointer; text-align: center; transition: all 0.2s ease; min-height: 74px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%;">
                  <i class="fa-solid fa-handshake-angle" style="color: #fb7185; font-size: 0.72rem;"></i>
                  <span style="font-size: clamp(0.64rem, 1.9vw, 0.74rem); font-weight: 900; color: #fda4af; white-space: nowrap;">ديون علينا</span>
                </div>
                <div style="margin: 3px 0 2px;">
                  <span id="kpiCap2Count" style="font-size: 0.58rem; background: rgba(244, 63, 94, 0.22); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.4); padding: 1px 6px; border-radius: 5px; font-weight: 800; display: inline-block;">0 بند</span>
                </div>
                <div id="kpiCap2Amount" style="font-size: clamp(0.72rem, 2.2vw, 0.88rem); font-weight: 950; color: #fb7185; font-family: var(--font-numbers); direction: rtl; line-height: 1.1;">- 0.00 ج.م</div>
              </div>

              <!-- كارت 3: ديون لنا (أخضر) -->
              <div class="com-kpi-card card-debts-for-us" id="cardComDebtsForUs" onclick="setCommitmentsSubFilter('debts_for_us')" title="ديون ومستحقات لنا عند الغير" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(15, 23, 42, 0.92)); border: 1.4px solid rgba(16, 185, 129, 0.45); border-radius: 12px; padding: 7px 4px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; cursor: pointer; text-align: center; transition: all 0.2s ease; min-height: 74px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%;">
                  <i class="fa-solid fa-sack-dollar" style="color: #34d399; font-size: 0.72rem;"></i>
                  <span style="font-size: clamp(0.64rem, 1.9vw, 0.74rem); font-weight: 900; color: #6ee7b7; white-space: nowrap;">ديون لنا</span>
                </div>
                <div style="margin: 3px 0 2px;">
                  <span id="kpiCap3Count" style="font-size: 0.58rem; background: rgba(16, 185, 129, 0.22); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 1px 6px; border-radius: 5px; font-weight: 800; display: inline-block;">0 بند</span>
                </div>
                <div id="kpiCap3Amount" style="font-size: clamp(0.72rem, 2.2vw, 0.88rem); font-weight: 950; color: #34d399; font-family: var(--font-numbers); direction: rtl; line-height: 1.1;">+ 0.00 ج.م</div>
              </div>

              <!-- كارت 4: تم السداد بالكامل (أزرق) -->
              <div class="com-kpi-card card-settled" id="cardComSettled" onclick="setCommitmentsSubFilter('settled')" title="الفواتير والديون المسددة بالكامل" style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.14), rgba(15, 23, 42, 0.92)); border: 1.4px solid rgba(2, 132, 199, 0.45); border-radius: 12px; padding: 7px 4px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; cursor: pointer; text-align: center; transition: all 0.2s ease; min-height: 74px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%;">
                  <i class="fa-solid fa-circle-check" style="color: #38bdf8; font-size: 0.72rem;"></i>
                  <span style="font-size: clamp(0.64rem, 1.9vw, 0.74rem); font-weight: 900; color: #7dd3fc; white-space: nowrap;">تم السداد</span>
                </div>
                <div style="margin: 3px 0 2px;">
                  <span id="kpiCapSettledCount" style="font-size: 0.58rem; background: rgba(2, 132, 199, 0.22); color: #38bdf8; border: 1px solid rgba(2, 132, 199, 0.4); padding: 1px 6px; border-radius: 5px; font-weight: 800; display: inline-block;">0 مكتمل</span>
                </div>
                <div id="kpiCapSettledAmount" style="font-size: clamp(0.72rem, 2.2vw, 0.88rem); font-weight: 950; color: #38bdf8; font-family: var(--font-numbers); direction: rtl; line-height: 1.1;">0.00 ج.م</div>
              </div>

            </div>
          </div>'''

pos_card = html.find('id="commitmentKpiMasterCard"')
if pos_card != -1:
    div_start = html.rfind('<div class="expected-kpi-master-card"', 0, pos_card)
    panel_add = html.find('id="panelUnifiedAddCommitment"', pos_card)
    if panel_add != -1:
        div_end = html.rfind('<!-- ========================================================', 0, panel_add)
        html = html[:div_start] + new_commitments_kpi_card + '\n\n          ' + html[div_end:]
        print("✓ Commitment 4-cards grid updated with item count below title")
    else:
        print("! Could not find panelUnifiedAddCommitment")
else:
    print("! Could not find commitmentKpiMasterCard")

# -------------------------------------------------------------
# 3. Inject newBudgetPlanModal before taskDateTimePickerModal
# -------------------------------------------------------------
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\modal_new_budget_plan.html", "r", encoding="utf-8") as mf:
    modal_html = mf.read()

pos_dt = html.find('id="taskDateTimePickerModal"')
if pos_dt != -1 and "id=\"newBudgetPlanModal\"" not in html:
    div_modal_start = html.rfind('<div class="modal-overlay', 0, pos_dt)
    html = html[:div_modal_start] + modal_html + '\n\n    ' + html[div_modal_start:]
    print("✓ newBudgetPlanModal successfully injected into HTML")
elif "id=\"newBudgetPlanModal\"" in html:
    print("✓ newBudgetPlanModal already present in HTML")
else:
    print("! Could not find taskDateTimePickerModal to inject budget modal")

# -------------------------------------------------------------
# 4. Inject Full Budget Engine JS
# -------------------------------------------------------------
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\budget_engine_full.js", "r", encoding="utf-8") as bf:
    budget_code = bf.read()

# Wrap and export functions to window
budget_wrapper = f'''
    // =========================================================================
    // محرك الميزانيات الشهرية والخطط التقديرية المتقدم (Budget Planning Engine)
    // =========================================================================
    let currentBudgetMonthData = null;
    let selectedBudgetItemMembers = ['البيت'];
    let activeBudgetSubTab = 'current';

{budget_code}

    // ربط كافة دوال الميزانيات بنافذة window لضمان عمل كافة الأزرار والتفاعلات
    window.initMonthlyBudgetUI = initMonthlyBudgetUI;
    window.loadActiveBudgetPlan = loadActiveBudgetPlan;
    window.renderMonthlyBudgetAllocations = renderMonthlyBudgetAllocations;
    window.renderMonthlyBudgetPlan = renderMonthlyBudgetAllocations;
    window.renderBudgetHistory = renderBudgetHistory;
    window.renderBudgetHistoryList = renderBudgetHistory;
    window.openNewBudgetPlanModal = openNewBudgetPlanModal;
    window.closeNewBudgetPlanModal = function() {{ closeModal('newBudgetPlanModal'); }};
    window.submitNewBudgetPlan = submitNewBudgetPlan;
    window.cloneCurrentBudgetPlan = cloneCurrentBudgetPlan;
    window.deleteCurrentBudgetPlan = deleteCurrentBudgetPlan;
    window.addBudgetItemToCurrentPlan = addBudgetItemToCurrentPlan;
    window.deleteBudgetItem = deleteBudgetItem;
    window.editBudgetItemAmount = editBudgetItemAmount;
    window.toggleBudgetItemMember = toggleBudgetItemMember;
    window.onBudgetPlanSelect = onBudgetPlanSelect;
    window.onBudgetNameChange = onBudgetNameChange;
    window.onBudgetMonthChange = onBudgetMonthChange;
    window.onBudgetItemCategorySelect = onBudgetItemCategorySelect;
    window.addBudgetIncomeRow = addBudgetIncomeRow;
    window.updateBudgetIncome = updateBudgetIncome;
    window.removeBudgetIncome = removeBudgetIncome;
    window.saveMonthlyBudget = saveMonthlyBudget;
    window.restoreBudgetForView = restoreBudgetForView;
    window.deleteBudgetFromHistory = deleteBudgetFromHistory;
'''

pos_switch = html.find('function switchExpectedTopSection')
if pos_switch != -1 and "محرك الميزانيات الشهرية والخطط التقديرية المتقدم" not in html:
    html = html[:pos_switch] + budget_wrapper + '\n\n    ' + html[pos_switch:]
    print("✓ Full Budget Engine JS successfully injected into script section")
elif "محرك الميزانيات الشهرية والخطط التقديرية المتقدم" in html:
    print("✓ Budget Engine JS already present")
else:
    print("! Could not find switchExpectedTopSection")

# -------------------------------------------------------------
# 5. Update renderCommitmentsPageUI for 4 cards active styling
# -------------------------------------------------------------
pos_rc = html.find('function renderCommitmentsPageUI()')
if pos_rc != -1:
    pos_c1 = html.find('if (c1Title) c1Title.textContent', pos_rc)
    if pos_c1 != -1:
        pos_after_c = html.find('// التحكم في إظهار القوائم بناءً على الفلتر السريع', pos_c1)
        if pos_after_c != -1:
            replacement_capsules_code = '''      if (c1Cnt) c1Cnt.textContent = `${pendingBills.length} بند`;
      if (c1Amt) c1Amt.textContent = formatMoneyVal(sumBills);

      if (c2Cnt) c2Cnt.textContent = `${pendingDebtsOnUs.length} بند`;
      if (c2Amt) c2Amt.textContent = (sumDebtsOnUs > 0 ? '- ' : '') + formatMoneyVal(sumDebtsOnUs);

      if (c3Cnt) c3Cnt.textContent = `${pendingDebtsForUs.length} بند`;
      if (c3Amt) c3Amt.textContent = (sumDebtsForUs > 0 ? '+ ' : '') + formatMoneyVal(sumDebtsForUs);

      const c4Cnt = document.getElementById('kpiCapSettledCount');
      const c4Amt = document.getElementById('kpiCapSettledAmount');
      if (c4Cnt) c4Cnt.textContent = `${settledItems.length} مكتمل`;
      if (c4Amt) c4Amt.textContent = formatMoneyVal(sumSettled);

      // تمييز الكارت النشط بحلقة توهج فخمة وتدرج لوني
      const cardBills = document.getElementById('cardComBills');
      const cardOnUs = document.getElementById('cardComDebtsOnUs');
      const cardForUs = document.getElementById('cardComDebtsForUs');
      const cardSettled = document.getElementById('cardComSettled');

      [cardBills, cardOnUs, cardForUs, cardSettled].forEach(c => {
        if (c) {
          c.style.transform = 'none';
          c.style.boxShadow = 'none';
        }
      });

      if (activeCommitmentSubFilter === 'bills' && cardBills) {
        cardBills.style.transform = 'translateY(-2px)';
        cardBills.style.boxShadow = '0 0 0 2px #fbbf24, 0 6px 18px rgba(245, 158, 11, 0.4)';
      } else if (activeCommitmentSubFilter === 'debts_on_us' && cardOnUs) {
        cardOnUs.style.transform = 'translateY(-2px)';
        cardOnUs.style.boxShadow = '0 0 0 2px #fb7185, 0 6px 18px rgba(244, 63, 94, 0.4)';
      } else if (activeCommitmentSubFilter === 'debts_for_us' && cardForUs) {
        cardForUs.style.transform = 'translateY(-2px)';
        cardForUs.style.boxShadow = '0 0 0 2px #34d399, 0 6px 18px rgba(16, 185, 129, 0.4)';
      } else if (activeCommitmentSubFilter === 'settled' && cardSettled) {
        cardSettled.style.transform = 'translateY(-2px)';
        cardSettled.style.boxShadow = '0 0 0 2px #38bdf8, 0 6px 18px rgba(2, 132, 199, 0.4)';
      }

      '''
            html = html[:pos_c1] + replacement_capsules_code + html[pos_after_c:]
            print("✓ renderCommitmentsPageUI successfully updated with 4th card (Settled) & active styling")

with open(HTML_FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved updated HTML. New length:", len(html))
