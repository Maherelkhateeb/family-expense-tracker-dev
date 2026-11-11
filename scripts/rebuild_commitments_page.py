#!/usr/bin/env python3
"""
Rebuild the Commitments & Debts page (صفحة الالتزامات والديون) completely:
1. Replace verbose, clunky top hero & duplicate tabs with sleek, compact FinTech header.
2. Replace 4 giant vertical KPI boxes + net banner with a single unified, elegant Financial Position Card.
3. Keep all IDs intact for JS (cardExpUpcoming, expectedCountUpcoming, expectedTotalUpcoming, etc.).
4. Add Member Filter dropdown to filter commitments by family member.
5. Rebuild renderExpectedList() to output gorgeous, compact FinTech cards with correct currency-left layout.
"""
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

path = 'index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

orig_len = len(content)

# ── 1. Locate start of viewExpected and subViewCommitments ─────────────────────
idx_hero_start = content.find('class="expected-top-hero"')
idx_hero_end = content.find('id="subViewCommitments"')
idx_new_panel = content.find('id="panelNewExpected"')

if idx_hero_start == -1 or idx_hero_end == -1 or idx_new_panel == -1:
    print("Error: Could not locate sections in index.html")
    sys.exit(1)

# Find the start tag of <div class="expected-top-hero"
div_hero_start = content.rfind('<div', 0, idx_hero_start)

# Find where subViewCommitments starts
div_subview_start = content.rfind('<div', 0, idx_hero_end)
# Everything between div_subview_start and idx_new_panel contains the old 4 KPI cards and the 3 action tabs
# We will replace that with the new unified hero + card + filter strip!

new_hero_html = '''<div class="expected-top-hero" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98)); border: 1.2px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 10px 12px; margin-bottom: 8px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: nowrap; gap: 8px;">
            <!-- العنوان والرمز -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.1)); border: 1.2px solid rgba(56, 189, 248, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.05rem; color: #38bdf8;">
                <i class="fa-solid fa-scale-balanced"></i>
              </div>
              <div>
                <h2 style="font-size: 0.96rem; font-weight: 900; color: #f8fafc; margin: 0; display: flex; align-items: center; gap: 6px;">
                  <span>الالتزامات والديون</span>
                </h2>
              </div>
            </div>
            <!-- أزرار الإجراءات السريعة -->
            <div style="display: flex; align-items: center; gap: 5px;">
              <button type="button" onclick="switchExpectedTab('new')" class="btn-wallet-action-pill" style="height: 30px; font-size: 0.72rem; padding: 0 9px; background: linear-gradient(135deg, #0284c7, #0369a1); border: 1px solid rgba(56, 189, 248, 0.4); color: #fff; font-weight: 900; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35);">
                <i class="fa-solid fa-plus"></i> <span>إضافة التزام</span>
              </button>
              <button type="button" onclick="switchExpectedTab('bills')" class="btn-wallet-action-pill" style="height: 30px; font-size: 0.72rem; padding: 0 9px; background: linear-gradient(135deg, #f59e0b, #d97706); border: 1px solid rgba(245, 158, 11, 0.4); color: #fff; font-weight: 900; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);">
                <i class="fa-solid fa-file-invoice"></i> <span>فواتير</span>
              </button>
              <button type="button" onclick="openNotesModal()" class="btn-wallet-action-pill" style="height: 30px; width: 30px; padding: 0; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: #94a3b8; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" title="الملاحظات">
                <i class="fa-solid fa-book-open"></i>
              </button>
            </div>
          </div>

          <!-- شريط التبويب الرئيسي: الالتزامات والديون / الميزانية التقديرية / سجل الميزانيات -->
          <div class="expected-main-tabs-strip" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; background: rgba(15, 23, 42, 0.92); padding: 4px; border-radius: 11px; border: 1px solid rgba(255, 255, 255, 0.08);">
            <button type="button" id="tabExpectedCommitments" onclick="switchExpectedMainTab('commitments')" class="exp-main-tab-btn active" style="padding: 6px 3px; border-radius: 8px; font-weight: 900; font-size: 0.73rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.2s; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35);">
              <i class="fa-solid fa-thumbtack"></i> <span>الالتزامات والديون</span>
            </button>
            <button type="button" id="tabExpectedMonthlyBudget" onclick="switchExpectedMainTab('monthly_budget')" class="exp-main-tab-btn" style="padding: 6px 3px; border-radius: 8px; font-weight: 900; font-size: 0.73rem; border: 1px solid rgba(255, 255, 255, 0.06); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.2s; background: rgba(255, 255, 255, 0.03); color: #94a3b8;">
              <i class="fa-solid fa-calculator"></i> <span>الميزانية التقديرية</span>
            </button>
            <button type="button" id="tabExpectedBudgetHistory" onclick="switchExpectedMainTab('budget_history')" class="exp-main-tab-btn" style="padding: 6px 3px; border-radius: 8px; font-weight: 900; font-size: 0.73rem; border: 1px solid rgba(255, 255, 255, 0.06); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 0.2s; background: rgba(255, 255, 255, 0.03); color: #94a3b8;">
              <i class="fa-solid fa-clock-rotate-left"></i> <span>سجل الميزانيات</span>
            </button>
          </div>
        </div>

        <!-- ==========================================================
             قسم الالتزامات والديون (subViewCommitments)
             ========================================================== -->
        <div id="subViewCommitments">
          <!-- بطاقة المركز المالي الموحدة الذكية (تجمع صافي الالتزامات والمؤشرات في بطاقة واحدة راقية) -->
          <div class="commitments-kpi-unified-card" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.92)); border: 1.2px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 10px 12px; margin-bottom: 8px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);">
            <!-- شريط صافي الالتزامات -->
            <div class="expected-net-position-banner" id="expectedNetPositionBanner" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.07);">
              <div style="display: flex; align-items: center; gap: 7px;">
                <div style="width: 26px; height: 26px; border-radius: 7px; background: rgba(56, 189, 248, 0.15); display: flex; align-items: center; justify-content: center; color: #38bdf8; font-size: 0.82rem;">
                  <i class="fa-solid fa-scale-balanced"></i>
                </div>
                <div>
                  <span id="expectedNetPositionLabel" style="font-size: 0.73rem; font-weight: 800; color: #cbd5e1;">صافي الالتزامات المطلوب تدبيرها</span>
                </div>
              </div>
              <div id="expectedNetPositionVal" style="font-size: 1.05rem; font-weight: 950; color: #f43f5e; font-variant-numeric: tabular-nums; direction: rtl; text-align: left;">
                - 0.00 ج.م
              </div>
            </div>

            <!-- مصفوفة المؤشرات المالية الأربعة (أزرار تصفية تفاعلية سريعة) -->
            <div class="expected-kpi-cockpit" id="expectedKpiCockpit" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding-top: 8px;">
              <!-- 1. فواتير ومصاريف قادمة -->
              <div class="exp-kpi-card exp-card-amber" id="cardExpUpcoming" onclick="toggleExpectedFilter('upcoming_bill')" title="تصفية فواتير قادمة" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 9px; padding: 5px 3px; text-align: center; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 0.65rem; font-weight: 800; color: #fbbf24;">
                  <i class="fa-solid fa-clock"></i> <span>قادمة</span>
                </div>
                <div class="exp-kpi-val" id="expectedTotalUpcoming" style="font-size: 0.76rem; font-weight: 900; color: #fde047; margin: 2px 0 1px; font-variant-numeric: tabular-nums;">0.00</div>
                <span class="exp-kpi-badge" id="expectedCountUpcoming" style="font-size: 0.58rem; background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 1px 4px; border-radius: 5px; font-weight: 800;">0</span>
              </div>

              <!-- 2. ديون علينا للغير -->
              <div class="exp-kpi-card exp-card-rose" id="cardExpDebtsOnUs" onclick="toggleExpectedFilter('debt_on_us')" title="تصفية ديون علينا" style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 9px; padding: 5px 3px; text-align: center; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 0.65rem; font-weight: 800; color: #f43f5e;">
                  <i class="fa-solid fa-hand-holding-dollar"></i> <span>علينا</span>
                </div>
                <div class="exp-kpi-val" id="expectedTotalDebtsOnUs" style="font-size: 0.76rem; font-weight: 900; color: #fca5a5; margin: 2px 0 1px; font-variant-numeric: tabular-nums;">- 0.00</div>
                <span class="exp-kpi-badge" id="expectedCountDebtsOnUs" style="font-size: 0.58rem; background: rgba(244, 63, 94, 0.2); color: #f43f5e; padding: 1px 4px; border-radius: 5px; font-weight: 800;">0</span>
              </div>

              <!-- 3. ديون لنا عند الغير -->
              <div class="exp-kpi-card exp-card-emerald" id="cardExpDebtsForUs" onclick="toggleExpectedFilter('debt_for_us')" title="تصفية ديون لنا" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 9px; padding: 5px 3px; text-align: center; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 0.65rem; font-weight: 800; color: #34d399;">
                  <i class="fa-solid fa-sack-dollar"></i> <span>لنا</span>
                </div>
                <div class="exp-kpi-val" id="expectedTotalDebtsForUs" style="font-size: 0.76rem; font-weight: 900; color: #86efac; margin: 2px 0 1px; font-variant-numeric: tabular-nums;">+ 0.00</div>
                <span class="exp-kpi-badge" id="expectedCountDebtsForUs" style="font-size: 0.58rem; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 1px 4px; border-radius: 5px; font-weight: 800;">0</span>
              </div>

              <!-- 4. تم سداده / تحصيله -->
              <div class="exp-kpi-card exp-card-cyan" id="cardExpPaid" onclick="toggleExpectedFilter('paid')" title="تصفية المسددة" style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 9px; padding: 5px 3px; text-align: center; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 0.65rem; font-weight: 800; color: #38bdf8;">
                  <i class="fa-solid fa-circle-check"></i> <span>مسددة</span>
                </div>
                <div class="exp-kpi-val" id="expectedTotalPaid" style="font-size: 0.76rem; font-weight: 900; color: #7dd3fc; margin: 2px 0 1px; font-variant-numeric: tabular-nums;">0.00</div>
                <span class="exp-kpi-badge" id="expectedCountPaid" style="font-size: 0.58rem; background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 1px 4px; border-radius: 5px; font-weight: 800;">0</span>
              </div>
            </div>
          </div>

          <!-- عناصر توافق برمجية مخفية للحفاظ على عمل دوال switchExpectedTab -->
          <div style="display: none;">
            <button type="button" id="btnTabNewExpected" onclick="switchExpectedTab('new')"></button>
            <button type="button" id="btnTabBillsExpected" onclick="switchExpectedTab('bills')"><span id="billsCountBadgeTab">0</span></button>
            <button type="button" id="btnTabListExpected" onclick="switchExpectedTab('list')"><span id="expectedPendingBadgeTab">0</span></button>
          </div>
'''

content = content[:div_hero_start] + new_hero_html + '\n          <!-- لوحة النموذج: تسجيل التزام مالي أو دين قادم -->\n          <div ' + content[idx_new_panel:]

# ── 2. Update panelListExpected to have the modern filter pills + Member Dropdown ─
idx_panel_list = content.find('id="panelListExpected"')
if idx_panel_list != -1:
    idx_list_container = content.find('id="expectedListContainer"', idx_panel_list)
    if idx_list_container != -1:
        # Find start of the filter div inside panelListExpected
        filter_start = content.find('<div style="display: flex; gap: 6px;', idx_panel_list)
        if filter_start != -1 and filter_start < idx_list_container:
            new_filter_html = '''<div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 8px; flex-wrap: nowrap;">
            <!-- فلاتر التصفية السريعة بالكبسولات -->
            <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px; flex: 1;" class="custom-scrollbar">
              <button type="button" class="btn-export-tool active exp-filter-pill" id="btnFilterExpAll" onclick="setExpectedPillFilter('all')" style="border-radius: 7px; padding: 4px 9px; font-size: 0.72rem; font-weight: 800; white-space: nowrap;">الكل</button>
              <button type="button" class="btn-export-tool exp-filter-pill" id="btnFilterExpUpcoming" onclick="setExpectedPillFilter('upcoming_bill')" style="border-radius: 7px; padding: 4px 9px; font-size: 0.72rem; font-weight: 800; white-space: nowrap; color: #fbbf24;">⚡ قادمة</button>
              <button type="button" class="btn-export-tool exp-filter-pill" id="btnFilterExpDebtsOnUs" onclick="setExpectedPillFilter('debt_on_us')" style="border-radius: 7px; padding: 4px 9px; font-size: 0.72rem; font-weight: 800; white-space: nowrap; color: #f43f5e;">🔻 ديون علينا</button>
              <button type="button" class="btn-export-tool exp-filter-pill" id="btnFilterExpDebtsForUs" onclick="setExpectedPillFilter('debt_for_us')" style="border-radius: 7px; padding: 4px 9px; font-size: 0.72rem; font-weight: 800; white-space: nowrap; color: #34d399;">🔺 ديون لنا</button>
              <button type="button" class="btn-export-tool exp-filter-pill" id="btnFilterExpPaid" onclick="setExpectedPillFilter('paid')" style="border-radius: 7px; padding: 4px 9px; font-size: 0.72rem; font-weight: 800; white-space: nowrap; color: #38bdf8;">✅ مسددة</button>
            </div>

            <!-- فلتر الفرد المالي -->
            <div style="flex-shrink: 0;">
              <select id="selExpectedMemberFilter" onchange="renderExpectedList()" style="height: 28px; font-size: 0.70rem; font-weight: 800; background: rgba(15, 23, 42, 0.9); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 7px; padding: 0 6px; cursor: pointer;">
                <option value="all">👥 الكل</option>
                <option value="البيت">🏠 البيت</option>
                <option value="ماهر">👤 ماهر</option>
                <option value="آية">👤 آية</option>
                <option value="محمد">👤 محمد</option>
                <option value="مريم">👤 مريم</option>
                <option value="الحاجة">👤 الحاجة</option>
                <option value="التونو">👤 التونو</option>
                <option value="أخرى">👤 أخرى</option>
              </select>
            </div>
          </div>
'''
            # Replace filter div up to container comment
            content = content[:filter_start] + new_filter_html + '\n            <!-- حاوية عرض كروت الالتزامات المفصولة بدقة ونقاء -->\n            ' + content[idx_list_container-80:]

# ── 3. Overhaul renderExpectedList() in JS ─────────────────────────────────────
idx_func_start = content.find('function renderExpectedList()')
if idx_func_start != -1:
    idx_next_func = content.find('\n    function ', idx_func_start + 100)
    if idx_next_func == -1:
        idx_next_func = content.find('\n  function ', idx_func_start + 100)

    new_render_func = '''function renderExpectedList() {
      const container = document.getElementById('expectedListContainer');
      const elUp = document.getElementById('expectedTotalUpcoming');
      const elDebOnUs = document.getElementById('expectedTotalDebtsOnUs');
      const elDebForUs = document.getElementById('expectedTotalDebtsForUs');
      const elPaid = document.getElementById('expectedTotalPaid');

      const cntUp = document.getElementById('expectedCountUpcoming');
      const cntDebOnUs = document.getElementById('expectedCountDebtsOnUs');
      const cntDebForUs = document.getElementById('expectedCountDebtsForUs');
      const cntPaid = document.getElementById('expectedCountPaid');

      const badgeTab = document.getElementById('expectedPendingBadgeTab');
      const netLabel = document.getElementById('expectedNetPositionLabel');
      const netVal = document.getElementById('expectedNetPositionVal');

      if (!container) return;
      if (!state.expectedExpenses) state.expectedExpenses = [];

      state.expectedExpenses.forEach(e => {
        if (e.type === 'debt') e.type = 'debt_on_us';
        if (!e.status) e.status = 'upcoming';
      });

      const memberFilter = document.getElementById('selExpectedMemberFilter')?.value || 'all';

      // 1. حساب الإجماليات بدقة محاسبية صارمة 0.00
      let totUpcoming = 0, countUpcoming = 0;
      let totDebtsOnUs = 0, countDebtsOnUs = 0;
      let totDebtsForUs = 0, countDebtsForUs = 0;
      let totPaid = 0, countPaid = 0;

      state.expectedExpenses.forEach(e => {
        const amt = Number(e.amount) || 0;
        if (e.status === 'paid') {
          totPaid += amt;
          countPaid++;
        } else if (e.type === 'upcoming_bill') {
          totUpcoming += amt;
          countUpcoming++;
        } else if (e.type === 'debt_on_us') {
          totDebtsOnUs += amt;
          countDebtsOnUs++;
        } else if (e.type === 'debt_for_us') {
          totDebtsForUs += amt;
          countDebtsForUs++;
        }
      });

      const curr = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : (state.currency || 'ج.م');
      const isGold = state.currency === 'GOLD21';
      const fmtNum = (val) => {
        const converted = typeof convertAmount === 'function' ? convertAmount(val) : val;
        return converted.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: isGold ? 3 : 2
        });
      };

      if (elUp) elUp.textContent = fmtNum(totUpcoming);
      if (elDebOnUs) elDebOnUs.textContent = '- ' + fmtNum(totDebtsOnUs);
      if (elDebForUs) elDebForUs.textContent = '+ ' + fmtNum(totDebtsForUs);
      if (elPaid) elPaid.textContent = fmtNum(totPaid);

      if (cntUp) cntUp.textContent = `${countUpcoming}`;
      if (cntDebOnUs) cntDebOnUs.textContent = `${countDebtsOnUs}`;
      if (cntDebForUs) cntDebForUs.textContent = `${countDebtsForUs}`;
      if (cntPaid) cntPaid.textContent = `${countPaid}`;

      const totalPendingCount = countUpcoming + countDebtsOnUs + countDebtsForUs;
      if (badgeTab) badgeTab.textContent = totalPendingCount;

      // صافي الموقف المالي: (فواتير + ديون علينا) - ديون لنا
      const netDue = (totUpcoming + totDebtsOnUs) - totDebtsForUs;
      if (netVal) {
        if (netDue > 0.0001) {
          if (netLabel) netLabel.textContent = 'صافي الالتزامات المطلوب تدبيرها:';
          netVal.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px; direction: rtl; color: #f43f5e;"><span style="font-size: 0.9em;">-</span><span>${fmtNum(netDue)}</span><span style="font-size: 0.74rem; opacity: 0.9;">${curr}</span></span>`;
        } else if (netDue < -0.0001) {
          if (netLabel) netLabel.textContent = 'صافي الفائض (ديون مستحقة لنا):';
          netVal.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px; direction: rtl; color: #34d399;"><span style="font-size: 0.9em;">+</span><span>${fmtNum(Math.abs(netDue))}</span><span style="font-size: 0.74rem; opacity: 0.9;">${curr}</span></span>`;
        } else {
          if (netLabel) netLabel.textContent = 'الموقف المالي متزن:';
          netVal.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px; direction: rtl; color: #38bdf8;"><span>0.00</span><span style="font-size: 0.74rem; opacity: 0.9;">${curr}</span></span>`;
        }
      }

      // تمييز الكروت النشطة في الكوكتيل
      const cardUp = document.getElementById('cardExpUpcoming');
      const cardDebOnUs = document.getElementById('cardExpDebtsOnUs');
      const cardDebForUs = document.getElementById('cardExpDebtsForUs');
      const cardPaid = document.getElementById('cardExpPaid');

      if (cardUp) cardUp.classList.toggle('active-filter', state.expectedTypeFilter === 'upcoming_bill');
      if (cardDebOnUs) cardDebOnUs.classList.toggle('active-filter', state.expectedTypeFilter === 'debt_on_us');
      if (cardDebForUs) cardDebForUs.classList.toggle('active-filter', state.expectedTypeFilter === 'debt_for_us');
      if (cardPaid) cardPaid.classList.toggle('active-filter', state.expectedTypeFilter === 'paid');

      // 2. تطبيق التصفية
      let list = state.expectedExpenses.slice();

      const activeFilter = state.expectedTypeFilter || 'all';
      if (activeFilter === 'upcoming_bill') {
        list = list.filter(e => e.status !== 'paid' && e.type === 'upcoming_bill');
      } else if (activeFilter === 'debt_on_us') {
        list = list.filter(e => e.status !== 'paid' && e.type === 'debt_on_us');
      } else if (activeFilter === 'debt_for_us') {
        list = list.filter(e => e.status !== 'paid' && e.type === 'debt_for_us');
      } else if (activeFilter === 'paid') {
        list = list.filter(e => e.status === 'paid');
      }

      if (memberFilter !== 'all') {
        list = list.filter(e => e.member === memberFilter || (memberFilter === 'ماهر' && (e.member === 'ماهر' || e.member === 'أنا')));
      }

      // فرز حسب تاريخ الاستحقاق
      list.sort((a, b) => {
        if (a.status === 'paid' && b.status !== 'paid') return 1;
        if (a.status !== 'paid' && b.status === 'paid') return -1;
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      });

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 24px 10px; text-align: center; background: rgba(15, 23, 42, 0.4); border-radius: 14px; border: 1px dashed rgba(255, 255, 255, 0.1);">
            <i class="fa-solid fa-calendar-check" style="color: #38bdf8; font-size: 2rem; margin-bottom: 8px; opacity: 0.6;"></i>
            <div class="empty-title" style="font-weight: 800; color: #cbd5e1; font-size: 0.88rem;">لا توجد التزامات مسجلة في هذا القسم</div>
            <div class="empty-desc" style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">يمكنك إضافة مصروف قادم أو دين جديد بالضغط على زر "إضافة التزام"</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      list.forEach(item => {
        const card = document.createElement('div');
        const isPaid = item.status === 'paid';
        const isUpcoming = item.type === 'upcoming_bill';
        const isDebtOnUs = item.type === 'debt_on_us';
        const isDebtForUs = item.type === 'debt_for_us';

        let accentBorder = 'rgba(245, 158, 11, 0.35)';
        let accentGlow = 'rgba(245, 158, 11, 0.12)';
        let iconClass = 'fa-solid fa-receipt';
        let iconColor = '#fbbf24';
        let typeName = 'مصروف قادم';
        let sign = '-';
        let amtColor = '#fbbf24';

        if (isDebtOnUs) {
          accentBorder = 'rgba(244, 63, 94, 0.4)';
          accentGlow = 'rgba(244, 63, 94, 0.12)';
          iconClass = 'fa-solid fa-arrow-down-long';
          iconColor = '#f87171';
          typeName = 'دين علينا';
          sign = '-';
          amtColor = '#f87171';
        } else if (isDebtForUs) {
          accentBorder = 'rgba(16, 185, 129, 0.4)';
          accentGlow = 'rgba(16, 185, 129, 0.12)';
          iconClass = 'fa-solid fa-arrow-up-long';
          iconColor = '#34d399';
          typeName = 'دين لنا (تحصيل)';
          sign = '+';
          amtColor = '#34d399';
        }

        if (isPaid) {
          accentBorder = 'rgba(56, 189, 248, 0.3)';
          accentGlow = 'rgba(56, 189, 248, 0.08)';
          iconClass = 'fa-solid fa-circle-check';
          iconColor = '#38bdf8';
          typeName = 'مسدد';
        }

        card.style.cssText = `
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95));
          border: 1.2px solid ${accentBorder};
          border-radius: 13px;
          padding: 10px 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          gap: 7px;
          transition: all 0.2s ease;
        `;

        const numFormatted = fmtNum(Number(item.amount) || 0);

        // Due date tag
        let dueHtml = '';
        if (item.dueDate && !isPaid) {
          const today = new Date().toISOString().split('T')[0];
          const isOverdue = item.dueDate < today;
          if (isOverdue) {
            dueHtml = `<span style="font-size: 0.66rem; color: #f87171; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); padding: 2px 7px; border-radius: 6px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-triangle-exclamation"></i> متأخر: ${item.dueDate}</span>`;
          } else {
            dueHtml = `<span style="font-size: 0.66rem; color: #38bdf8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.25); padding: 2px 7px; border-radius: 6px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-calendar-day"></i> الاستحقاق: ${item.dueDate}</span>`;
          }
        }

        // Priority badge
        let priorityHtml = '';
        if (item.priority === 'urgent') {
          priorityHtml = `<span style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 2px 6px; border-radius: 6px; font-size: 0.63rem; font-weight: 800;"><i class="fa-solid fa-bolt"></i> عاجل</span>`;
        }

        // Receipt attachment button
        let receiptBtn = '';
        const photoUri = item.settleReceipt || item.photo;
        if (photoUri) {
          receiptBtn = `<button type="button" onclick="openReceiptLightbox('${photoUri}', 'مستند: ${escapeHtml(item.title)}')" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 6px; padding: 2px 7px; font-size: 0.66rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="عرض المستند أو الفاتورة"><i class="fa-solid fa-paperclip"></i> مستند 📷</button>`;
        }

        // Action buttons
        let actionButtons = '';
        if (!isPaid) {
          if (isDebtForUs) {
            actionButtons = `
              <button type="button" onclick="openPayExpectedModal('${item.id}')" style="flex: 1; height: 30px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 8px; color: #fff; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 5px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">
                <i class="fa-solid fa-hand-holding-dollar"></i> تحصيل وإيداع بالمحفظة
              </button>
              <button type="button" onclick="deleteExpected('${item.id}')" style="width: 30px; height: 30px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #f87171; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" title="حذف الالتزام">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            `;
          } else {
            actionButtons = `
              <button type="button" onclick="openPayExpectedModal('${item.id}')" style="flex: 1; height: 30px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; border-radius: 8px; color: #fff; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 5px; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);">
                <i class="fa-solid fa-circle-check"></i> سداد وصرف من المحفظة
              </button>
              <button type="button" onclick="deleteExpected('${item.id}')" style="width: 30px; height: 30px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #f87171; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" title="حذف الالتزام">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            `;
          }
        } else {
          actionButtons = `
            <div style="flex: 1; font-size: 0.70rem; color: #38bdf8; font-weight: 800; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-check-double"></i> تم السداد والتسوية
            </div>
            <button type="button" onclick="deleteExpected('${item.id}')" style="width: 30px; height: 30px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #f87171; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" title="حذف من السجل">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          `;
        }

        card.innerHTML = `
          <!-- الصف العلوي: الأيقونة والعنوان والمبلغ -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
              <div style="width: 30px; height: 30px; border-radius: 8px; background: ${accentGlow}; border: 1px solid ${accentBorder}; display: flex; align-items: center; justify-content: center; color: ${iconColor}; font-size: 0.82rem; flex-shrink: 0;">
                <i class="${iconClass}"></i>
              </div>
              <div style="min-width: 0;">
                <div style="font-weight: 800; font-size: 0.88rem; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${escapeHtml(item.title)}
                </div>
                <div style="font-size: 0.67rem; color: #94a3b8; display: flex; align-items: center; gap: 5px; margin-top: 1px;">
                  <span style="color: ${iconColor}; font-weight: 700;">${typeName}</span>
                  <span>•</span>
                  <span style="color: #cbd5e1;">👤 ${escapeHtml(item.member || 'البيت')}</span>
                </div>
              </div>
            </div>

            <!-- المبلغ: رمز العملة يسار الرقم وعلامة السالب/الموجب يمين الرقم -->
            <div style="text-align: left; flex-shrink: 0; direction: rtl; display: inline-flex; align-items: center; gap: 3px; font-weight: 950; font-size: 0.95rem; color: ${amtColor}; font-variant-numeric: tabular-nums;">
              <span style="font-size: 0.9em;">${sign}</span>
              <span>${numFormatted}</span>
              <span style="font-size: 0.70rem; opacity: 0.9; font-weight: 800;">${curr}</span>
            </div>
          </div>

          <!-- الصف الأوسط: شارات الاستحقاق والعاجل والمستند المرفق -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
              ${dueHtml}
              ${priorityHtml}
              ${receiptBtn}
            </div>
          </div>

          <!-- صف الأزرار والإجراءات -->
          <div style="display: flex; align-items: center; gap: 6px; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            ${actionButtons}
          </div>
        `;

        container.appendChild(card);
      });
    }
'''
    content = content[:idx_func_start] + new_render_func + '\n' + content[idx_next_func:]

# Write back
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Rebuild completed successfully!")
print(f"Original size: {orig_len:,} bytes")
print(f"New size:      {len(content):,} bytes")
print(f"Difference:    {len(content) - orig_len:,} bytes")
