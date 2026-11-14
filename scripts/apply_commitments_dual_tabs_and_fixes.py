import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Loaded index.html: {len(content)} characters.")

# =========================================================================
# 1. تحديث صفحة الالتزامات (Commitments Page Reorganization)
# زران علويان: [ الفواتير والديون ] / [ الميزانيات ]
# =========================================================================

# البحث عن شريط التبويب القديم في viewExpected
old_tabs_pattern = re.compile(
    r'<div class="expected-main-tabs-strip" id="commitmentsMasterTabStrip".*?</div>\s*</div>\s*<!-- \*\*\*\*\* 1\. قسم الالتزامات والديون والفواتير',
    re.DOTALL
)

# سنبحث عن viewExpected ونستبدل الهيكل العلوي وشريط التبويب
idx_view_expected = content.find('id="viewExpected"')
if idx_view_expected == -1:
    print("ERROR: id='viewExpected' not found!")
    sys.exit(1)

# دعنا نفحص ما بين id="viewExpected" وحتى subViewCommitments
idx_subview_comm = content.find('id="subViewCommitments"')
print(f"viewExpected at {idx_view_expected}, subViewCommitments at {idx_subview_comm}")

# سنستبدل الشريط العلوي في viewExpected ليحتوي على الزرين العلويين المطلوبين بدقة:
# 1. زر علوي بإسم الفواتير والديون
# 2. زر أخر بإسم الميزانيات
new_top_two_tabs_html = '''        <!-- ========================================================
             الهيدر الاستراتيجي لصفحة الالتزامات: زران علويان رئيسيان
             [ 📄 الفواتير والديون ] | [ 🧮 الميزانيات ]
             ======================================================== -->
        <div class="expected-top-hero" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98)); border: 1.2px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 12px 14px; margin-bottom: 12px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: nowrap; gap: 8px;">
            <!-- العنوان والرمز -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 38px; height: 38px; border-radius: 11px; background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(14, 165, 233, 0.1)); border: 1.2px solid rgba(56, 189, 248, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.15rem; color: #38bdf8; flex-shrink: 0;">
                <i class="fa-solid fa-scale-balanced"></i>
              </div>
              <div>
                <h2 style="font-size: 1.0rem; font-weight: 900; color: #f8fafc; margin: 0; display: flex; align-items: center; gap: 6px;">
                  <span id="txtExpectedPageMainHeader">الفواتير والديون والميزانيات</span>
                </h2>
                <div style="font-size: 0.68rem; color: #94a3b8;" id="txtExpectedPageSubHeader">متابعة الفواتير والديون وإدارة الخطط والميزانيات الشهرية</div>
              </div>
            </div>
            <!-- أزرار الإجراءات السريعة -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" id="btnTopAddCommitmentAction" onclick="handleExpectedTopAddAction()" class="btn-wallet-action-pill" style="height: 34px; font-size: 0.76rem; padding: 0 12px; background: linear-gradient(135deg, #0284c7, #10b981); border: 1px solid rgba(56, 189, 248, 0.45); color: #fff; font-weight: 900; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 10px rgba(2, 132, 199, 0.35);">
                <i class="fa-solid fa-plus"></i> <span id="lblTopAddCommitmentAction">إضافة التزام</span>
              </button>
              <button type="button" onclick="openNotesModal()" class="btn-wallet-action-pill" style="height: 34px; width: 34px; padding: 0; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: #94a3b8; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" title="ملاحظات">
                <i class="fa-solid fa-book-open"></i>
              </button>
            </div>
          </div>

          <!-- شريط التبويب العلوي الثنائي الرئيسي: [ الفواتير والديون ] | [ الميزانيات ] -->
          <div class="expected-dual-master-tabs" id="commitmentsTopTwoTabsStrip" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(15, 23, 42, 0.95); padding: 5px; border-radius: 13px; border: 1.2px solid rgba(56, 189, 248, 0.25); box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
            <!-- الزر العلوي 1: الفواتير والديون -->
            <button type="button" id="tabExpectedBillsAndDebts" onclick="switchExpectedTopSection('bills_and_debts')" class="exp-dual-top-btn active" style="padding: 10px 8px; border-radius: 10px; font-weight: 900; font-size: 0.85rem; color: #fff; background: linear-gradient(135deg, #0284c7, #0369a1); border: 1px solid rgba(56, 189, 248, 0.5); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; box-shadow: 0 3px 12px rgba(2, 132, 199, 0.4); transition: all 0.25s ease;">
              <i class="fa-solid fa-file-invoice-dollar" style="font-size: 1rem; color: #38bdf8;"></i>
              <span>الفواتير والديون</span>
              <span id="badgeCountBillsAndDebts" style="background: rgba(255,255,255,0.25); font-size: 0.68rem; padding: 2px 7px; border-radius: 10px; font-weight: 900;">0</span>
            </button>
            
            <!-- الزر العلوي 2: الميزانيات -->
            <button type="button" id="tabExpectedBudgets" onclick="switchExpectedTopSection('budgets')" class="exp-dual-top-btn" style="padding: 10px 8px; border-radius: 10px; font-weight: 900; font-size: 0.85rem; color: #94a3b8; background: transparent; border: 1px solid transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all 0.25s ease;">
              <i class="fa-solid fa-chart-pie" style="font-size: 1rem; color: #34d399;"></i>
              <span>الميزانيات</span>
              <span id="badgeCountBudgets" style="background: rgba(255,255,255,0.12); font-size: 0.68rem; padding: 2px 7px; border-radius: 10px; font-weight: 900;">الشهر</span>
            </button>
          </div>
        </div>
'''

# استبدال الجزء العلوي من viewExpected
# دعنا نجد بداية viewExpected حتى subViewCommitments
slice_view_expected_top = content[idx_view_expected:idx_subview_comm]
# نحافظ على <div class="page-view" id="viewExpected" style="display: none;">
view_expected_open_tag = '<div class="page-view" id="viewExpected" style="display: none;">'
idx_tag_end = content.find('>', idx_view_expected) + 1

content = content[:idx_tag_end] + "\n" + new_top_two_tabs_html + "\n" + content[idx_subview_comm:]
print("Updated top two tabs in viewExpected successfully.")

# الآن في قسم الفواتير والديون: إضافة شريط الفلاتر السريع المدمج تحت الفواتير والديون:
# [ الكل ] [ 📄 الفواتير ] [ 🤝 ديون علينا ] [ 💰 ديون لنا ] [ ✅ المسدد والأرشيف ]
subfilter_pills_html = '''
        <!-- شريط الفلاتر السريعة المنسق تحت الفواتير والديون -->
        <div class="commitments-subfilter-bar" style="display: flex; gap: 5px; overflow-x: auto; padding: 4px 0 8px; margin-bottom: 6px;" class="custom-scrollbar" id="commitmentsSubFilterStrip">
          <button type="button" class="com-subfilter-pill active" id="pillSubFilterAll" onclick="setCommitmentsSubFilter('all')" style="padding: 6px 12px; border-radius: 9px; font-size: 0.74rem; font-weight: 900; background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; border: 1px solid rgba(56, 189, 248, 0.4); cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;">
            <i class="fa-solid fa-layer-group"></i> <span>الكل</span>
            <span id="subCntAll" style="background: rgba(255,255,255,0.2); padding: 1px 5px; border-radius: 6px; font-size: 0.64rem;">0</span>
          </button>
          <button type="button" class="com-subfilter-pill" id="pillSubFilterBills" onclick="setCommitmentsSubFilter('bills')" style="padding: 6px 12px; border-radius: 9px; font-size: 0.74rem; font-weight: 900; background: rgba(15, 23, 42, 0.85); color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;">
            <i class="fa-solid fa-file-invoice" style="color: #38bdf8;"></i> <span>الفواتير والاشتراكات</span>
            <span id="subCntBills" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 1px 5px; border-radius: 6px; font-size: 0.64rem;">0</span>
          </button>
          <button type="button" class="com-subfilter-pill" id="pillSubFilterDebtsOnUs" onclick="setCommitmentsSubFilter('debts_on_us')" style="padding: 6px 12px; border-radius: 9px; font-size: 0.74rem; font-weight: 900; background: rgba(15, 23, 42, 0.85); color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;">
            <i class="fa-solid fa-handshake-angle" style="color: #f87171;"></i> <span>ديون علينا</span>
            <span id="subCntDebtsOnUs" style="background: rgba(239, 68, 68, 0.15); color: #f87171; padding: 1px 5px; border-radius: 6px; font-size: 0.64rem;">0</span>
          </button>
          <button type="button" class="com-subfilter-pill" id="pillSubFilterDebtsForUs" onclick="setCommitmentsSubFilter('debts_for_us')" style="padding: 6px 12px; border-radius: 9px; font-size: 0.74rem; font-weight: 900; background: rgba(15, 23, 42, 0.85); color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;">
            <i class="fa-solid fa-hand-holding-dollar" style="color: #34d399;"></i> <span>ديون لنا</span>
            <span id="subCntDebtsForUs" style="background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 1px 5px; border-radius: 6px; font-size: 0.64rem;">0</span>
          </button>
          <button type="button" class="com-subfilter-pill" id="pillSubFilterSettled" onclick="setCommitmentsSubFilter('settled')" style="padding: 6px 12px; border-radius: 9px; font-size: 0.74rem; font-weight: 900; background: rgba(15, 23, 42, 0.85); color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;">
            <i class="fa-solid fa-circle-check" style="color: #38bdf8;"></i> <span>المسددة والأرشيف</span>
            <span id="subCntSettled" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 1px 5px; border-radius: 6px; font-size: 0.64rem;">0</span>
          </button>
        </div>
'''

# إضافة subfilter_pills_html قبل قائمة الفواتير والديون
idx_panel_add = content.find('id="panelUnifiedAddCommitment"')
if idx_panel_add != -1:
    # نبحث عن نهاية panelUnifiedAddCommitment
    idx_end_panel = content.find('</div>', content.find('btnSubmitUnifiedCommitmentText', idx_panel_add))
    # دعنا نضيف شريط الفلاتر بعد لوحة الإضافة مباشرة
    idx_view_bills_list = content.find('id="viewCommitmentsBillsList"')
    if idx_view_bills_list != -1:
        content = content[:idx_view_bills_list] + subfilter_pills_html + "\n" + content[idx_view_bills_list:]
        print("Added subfilter pills under bills and debts.")

# =========================================================================
# 2. تحديث قسم الميزانيات ليشمل كل ما يخص الميزانيات بشكل مرتب
# =========================================================================
# في الميزانيات سنضع شريط تبويب داخلي أنيق للميزانية: [ 🧮 ميزانية الشهر ] | [ 🕒 أرشيف وسجل الميزانيات ]
budget_sub_tabs_html = '''
        <!-- شريط تبويب داخلي منسق لقسم الميزانيات -->
        <div class="budgets-sub-tab-strip" id="budgetsSubTabStrip" style="display: flex; gap: 6px; background: rgba(15, 23, 42, 0.85); padding: 4px; border-radius: 11px; border: 1px solid rgba(56, 189, 248, 0.25); margin-bottom: 10px;">
          <button type="button" id="btnBudgetSubCurrent" onclick="switchBudgetSubTab('current')" style="flex: 1; padding: 8px 10px; border-radius: 8px; font-size: 0.78rem; font-weight: 900; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);">
            <i class="fa-solid fa-chart-pie"></i> <span>ميزانية الشهر النشطة</span>
          </button>
          <button type="button" id="btnBudgetSubHistory" onclick="switchBudgetSubTab('history')" style="flex: 1; padding: 8px 10px; border-radius: 8px; font-size: 0.78rem; font-weight: 900; background: transparent; color: #94a3b8; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <i class="fa-solid fa-clock-rotate-left"></i> <span>أرشيف وسجل الميزانيات</span>
          </button>
        </div>
'''

idx_panel_monthly = content.find('id="panelMonthlyBudget"')
if idx_panel_monthly != -1:
    content = content[:idx_panel_monthly] + budget_sub_tabs_html + "\n" + content[idx_panel_monthly:]
    print("Added budget sub tabs inside budgets section.")

# =========================================================================
# 3. تعديل شاشة إضافة مهمة جديدة وإزالة كلمة "قائمة المهام والتخطيط اليوم"
# دمج الإضافة وتحديد الساعة واليوم في شاشة واحدة متناسقة للهاتف
# =========================================================================
# إزالة "قائمة المهام والتخطيط اليومي" من هيدر المهام
old_tasks_header_title = '<div style="font-size: 0.94rem; font-weight: 900; color: #f8fafc;">قائمة المهام والتخطيط اليومي</div>'
if old_tasks_header_title in content:
    content = content.replace(old_tasks_header_title, '')
    print("Removed phrase 'قائمة المهام والتخطيط اليومي' from tasks header.")

# دمج شاشة الإضافة في شاشة واحدة منفصلة الصفوف (تاريخ منفصل + وقت منفصل لتفادي التداخل نهائياً)
# البحث عن quickTaskTitleInput وبلوك الإضافة
idx_quick_input = content.find('id="quickTaskTitleInput"')
if idx_quick_input != -1:
    # نبحث عن بداية البلوك الحاوي له
    idx_block_start = content.rfind('<div style="background: linear-gradient(135deg, rgba(30, 41, 59', 0, idx_quick_input)
    # ونبحث عن نهايته قبل كاروسيل الفئات الدائرية
    idx_carousel = content.find('id="tasksCategoryPillsStrip"')
    if idx_block_start != -1 and idx_carousel != -1:
        idx_block_end = content.rfind('</div>', 0, idx_carousel) + 6
        
        new_single_add_card_html = '''<!-- شاشة الإضافة الفورية الموحدة المتناسقة للموبايل (عنوان + يوم + ساعة بدون نوافذ منبثقة أو تداخل أرقام) -->
        <div class="tasks-mobile-single-add-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(168, 85, 247, 0.45); border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);">
          
          <!-- السطر 1: عنوان المهمة + زر الإضافة الفوري -->
          <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" id="quickTaskTitleInput" placeholder="+ اكتب مهمة جديدة واضغط إضافة..." style="flex: 1; height: 40px; border-radius: 10px; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 0.85rem; font-weight: 800; padding: 0 12px; outline: none; box-sizing: border-box;" onkeydown="if(event.key==='Enter') handleQuickTaskAdd()">
            <button type="button" onclick="handleQuickTaskAdd()" style="height: 40px; padding: 0 16px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.82rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.45); flex-shrink: 0;">
              <i class="fa-solid fa-plus"></i>
              <span>إضافة</span>
            </button>
          </div>

          <!-- السطر 2: اختيار اليوم والموعد (في سطر مستقل لمنع أي تداخل) -->
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 7px 10px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.72rem; font-weight: 850; color: #cbd5e1; display: flex; align-items: center; gap: 5px;">
                <i class="fa-regular fa-calendar" style="color: #c084fc;"></i>
                <span>اليوم والتاريخ:</span>
              </span>
              <span id="quickTaskSelectedDateLabel" style="font-size: 0.68rem; color: #c084fc; font-weight: 800;">اليوم</span>
            </div>
            <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn-quick-date-chip active" id="chipQuickDateToday" onclick="setInlineQuickTaskDate('today', this)" style="padding: 4px 8px; border-radius: 6px; font-size: 0.70rem; font-weight: 800; background: rgba(168, 85, 247, 0.25); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.45); cursor: pointer;">☀️ اليوم</button>
              <button type="button" class="btn-quick-date-chip" id="chipQuickDateTomorrow" onclick="setInlineQuickTaskDate('tomorrow', this)" style="padding: 4px 8px; border-radius: 6px; font-size: 0.70rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">🌅 غداً</button>
              <button type="button" class="btn-quick-date-chip" id="chipQuickDateAfter2" onclick="setInlineQuickTaskDate('after2', this)" style="padding: 4px 8px; border-radius: 6px; font-size: 0.70rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">📅 بعد يومين</button>
              <button type="button" class="btn-quick-date-chip" id="chipQuickDateFriday" onclick="setInlineQuickTaskDate('friday', this)" style="padding: 4px 8px; border-radius: 6px; font-size: 0.70rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">🕌 الجمعة</button>
              <button type="button" class="btn-quick-date-chip" id="chipQuickDateNone" onclick="setInlineQuickTaskDate('none', this)" style="padding: 4px 8px; border-radius: 6px; font-size: 0.70rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">بدون موعد</button>
              <!-- مدخل تاريخ مخصص واضح ومنفصل تماماً -->
              <input type="date" id="quickTaskInlineDate" onchange="onInlineQuickTaskCustomDate(this.value)" style="height: 28px; border-radius: 6px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(168, 85, 247, 0.35); color: #f8fafc; font-size: 0.72rem; font-weight: 800; padding: 0 6px; outline: none; margin-right: auto;">
            </div>
          </div>

          <!-- السطر 3: اختيار الساعة والتوقيت (في سطر مستقل تماماً لمنع أي تداخل أرقام) -->
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 7px 10px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.72rem; font-weight: 850; color: #cbd5e1; display: flex; align-items: center; gap: 5px;">
                <i class="fa-regular fa-clock" style="color: #38bdf8;"></i>
                <span>الساعة والتوقيت:</span>
              </span>
              <span id="quickTaskSelectedTimeLabel" style="font-size: 0.68rem; color: #38bdf8; font-weight: 800;">10:00 ص</span>
            </div>
            <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn-quick-time-chip active" onclick="setInlineQuickTaskTime('10:00', this)" style="padding: 4px 8px; border-radius: 6px; font-size: 0.70rem; font-weight: 800; background: rgba(56, 189, 248, 0.22); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.45); cursor: pointer;">☀️ 10:00 ص</button>
              <button type="button" class="btn-quick-time-chip" onclick="setInlineQuickTaskTime('14:00', this)" style="padding: 4px 8px; border-radius: 6px; font-size: 0.70rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">⛅ 02:00 م</button>
              <button type="button" class="btn-quick-time-chip" onclick="setInlineQuickTaskTime('18:00', this)" style="padding: 4px 8px; border-radius: 6px; font-size: 0.70rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">🌙 06:00 م</button>
              <button type="button" class="btn-quick-time-chip" onclick="setInlineQuickTaskTime('21:00', this)" style="padding: 4px 8px; border-radius: 6px; font-size: 0.70rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">🌃 09:00 م</button>
              <!-- مدخل وقت مخصص واضح ومنفصل -->
              <input type="time" id="quickTaskInlineTime" value="10:00" onchange="onInlineQuickTaskCustomTime(this.value)" style="height: 28px; border-radius: 6px; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(56, 189, 248, 0.35); color: #f8fafc; font-size: 0.72rem; font-weight: 800; padding: 0 6px; outline: none; margin-right: auto;">
            </div>
          </div>

          <!-- السطر 4: الفرد والأولوية والمبلغ والمرفقات -->
          <div style="display: flex; gap: 5px; align-items: center; flex-wrap: wrap; justify-content: space-between;">
            <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
              <select id="quickTaskMemberSelect" style="height: 28px; border-radius: 7px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 0.70rem; font-weight: 800; padding: 0 6px; outline: none;">
                <option value="البيت">🏠 البيت</option>
                <option value="ماهر">👤 ماهر</option>
                <option value="آية">👤 آية</option>
                <option value="محمد">👤 محمد</option>
                <option value="مريم">👤 مريم</option>
                <option value="الحاجة">👤 الحاجة</option>
                <option value="التونو">👤 التونو</option>
              </select>

              <select id="quickTaskPrioritySelect" style="height: 28px; border-radius: 7px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 0.70rem; font-weight: 800; padding: 0 6px; outline: none;">
                <option value="high">🔴 عاجل P1</option>
                <option value="medium">🟡 متوسطة P2</option>
                <option value="normal" selected>⚪ عادية P3</option>
                <option value="low">🔘 منخفضة P4</option>
              </select>

              <input type="number" id="quickTaskEstAmount" placeholder="مبلغ تقديري" style="width: 80px; height: 28px; border-radius: 7px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.15); color: #fbbf24; font-size: 0.70rem; font-weight: 800; padding: 0 6px; outline: none;">
            </div>

            <!-- زر إضافة صورة بالكاميرا أو المعرض -->
            <button type="button" onclick="document.getElementById('primaryTaskPhotoFileInput').click()" style="height: 28px; padding: 0 9px; border-radius: 7px; background: rgba(244, 114, 182, 0.15); border: 1px solid rgba(244, 114, 182, 0.35); color: #f472b6; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-camera"></i> <span id="lblQuickTaskPhoto">صورة</span>
            </button>
          </div>
        </div>
'''
        content = content[:idx_block_start] + new_single_add_card_html + "\n        " + content[idx_carousel:]
        print("Replaced quick task block with single mobile-first add card.")

# =========================================================================
# 4. إصلاح مسمى الحركة النظيفة لمنع كلمة "بيان" العامة إطلاقاً
# =========================================================================
# في renderOperationsList:
old_raw_label = "const rawLabel = tx.label || tx.description || tx.note || cat.name || 'بدون بيان';"
new_raw_label = """let cleanLbl = (tx.label || tx.description || tx.note || '').trim();
          if (!cleanLbl || cleanLbl === 'بيان' || cleanLbl === 'بدون بيان') {
            cleanLbl = `${cat.name} (${memberName})`;
          }
          const rawLabel = cleanLbl;"""

if old_raw_label in content:
    content = content.replace(old_raw_label, new_raw_label, 1)
    print("Replaced rawLabel in renderOperationsList to eliminate generic 'بيان'.")

# =========================================================================
# 5. إضافة دوال JavaScript للتحكم في الشريط الثنائي لصفحة الالتزامات وشاشة المهام الموحدة
# =========================================================================
new_js_controllers = '''
    // =========================================================================
    // دوال التحكم الثنائية لصفحة الالتزامات: [ الفواتير والديون ] | [ الميزانيات ]
    // =========================================================================
    let activeExpectedTopSection = 'bills_and_debts'; // 'bills_and_debts' | 'budgets'
    let activeCommitmentSubFilter = 'all'; // 'all' | 'bills' | 'debts_on_us' | 'debts_for_us' | 'settled'
    let activeBudgetSubTab = 'current'; // 'current' | 'history'

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
          btnBillsDebts.classList.remove('active');
          btnBillsDebts.style.background = 'transparent';
          btnBillsDebts.style.color = '#94a3b8';
          btnBillsDebts.style.border = '1px solid transparent';
          btnBillsDebts.style.boxShadow = 'none';
        }

        if (secBillsDebts) secBillsDebts.style.display = 'none';
        if (budgetSubTabs) budgetSubTabs.style.display = 'flex';

        if (activeBudgetSubTab === 'history') {
          if (secBudgetsCurrent) secBudgetsCurrent.style.display = 'none';
          if (secBudgetsHistory) secBudgetsHistory.style.display = 'block';
        } else {
          if (secBudgetsCurrent) secBudgetsCurrent.style.display = 'block';
          if (secBudgetsHistory) secBudgetsHistory.style.display = 'none';
        }

        if (headerTitle) headerTitle.textContent = 'الميزانيات التقديرية الشهرية';
        if (headerSub) headerSub.textContent = 'تخطيط الميزانيات ومقارنة المستهدف بالمنصرف الفعلي';
        if (topAddBtnLbl) topAddBtnLbl.textContent = 'خطة جديدة';

        if (typeof renderMonthlyBudgetPlan === 'function') renderMonthlyBudgetPlan();
        if (typeof updateBudgetKpis === 'function') updateBudgetKpis();
      }
    }

    function switchBudgetSubTab(tab) {
      activeBudgetSubTab = tab;
      const bCurr = document.getElementById('btnBudgetSubCurrent');
      const bHist = document.getElementById('btnBudgetSubHistory');
      const secCurr = document.getElementById('panelMonthlyBudget');
      const secHist = document.getElementById('panelBudgetHistory');

      if (tab === 'current') {
        if (bCurr) {
          bCurr.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          bCurr.style.color = '#fff';
          bCurr.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.35)';
        }
        if (bHist) {
          bHist.style.background = 'transparent';
          bHist.style.color = '#94a3b8';
          bHist.style.boxShadow = 'none';
        }
        if (secCurr) secCurr.style.display = 'block';
        if (secHist) secHist.style.display = 'none';
        if (typeof renderMonthlyBudgetPlan === 'function') renderMonthlyBudgetPlan();
      } else {
        if (bHist) {
          bHist.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bHist.style.color = '#fff';
          bHist.style.boxShadow = '0 2px 8px rgba(2, 132, 199, 0.35)';
        }
        if (bCurr) {
          bCurr.style.background = 'transparent';
          bCurr.style.color = '#94a3b8';
          bCurr.style.boxShadow = 'none';
        }
        if (secCurr) secCurr.style.display = 'none';
        if (secHist) secHist.style.display = 'block';
        if (typeof renderBudgetHistoryList === 'function') renderBudgetHistoryList();
      }
    }

    function handleExpectedTopAddAction() {
      if (activeExpectedTopSection === 'budgets') {
        if (typeof openNewBudgetPlanModal === 'function') openNewBudgetPlanModal();
      } else {
        toggleUnifiedAddCommitmentPanel();
      }
    }

    function setCommitmentsSubFilter(filt) {
      activeCommitmentSubFilter = filt;
      const pills = [
        { id: 'pillSubFilterAll', key: 'all' },
        { id: 'pillSubFilterBills', key: 'bills' },
        { id: 'pillSubFilterDebtsOnUs', key: 'debts_on_us' },
        { id: 'pillSubFilterDebtsForUs', key: 'debts_for_us' },
        { id: 'pillSubFilterSettled', key: 'settled' }
      ];

      pills.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) {
          if (p.key === filt) {
            el.classList.add('active');
            el.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
            el.style.color = '#fff';
            el.style.borderColor = 'rgba(56, 189, 248, 0.5)';
          } else {
            el.classList.remove('active');
            el.style.background = 'rgba(15, 23, 42, 0.85)';
            el.style.color = '#94a3b8';
            el.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          }
        }
      });

      renderCommitmentsPageUI();
    }

    // =========================================================================
    // دوال إدارة شاشة المهام الموحدة للموبايل (Inline Date & Time Picker Handlers)
    // =========================================================================
    let inlineTaskDateVal = getLocalDateStr(new Date());
    let inlineTaskTimeVal = '10:00';

    function setInlineQuickTaskDate(preset, btn) {
      const now = new Date();
      const chips = document.querySelectorAll('.btn-quick-date-chip');
      chips.forEach(c => {
        c.classList.remove('active');
        c.style.background = 'transparent';
        c.style.color = '#94a3b8';
        c.style.borderColor = 'rgba(255,255,255,0.12)';
      });

      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'rgba(168, 85, 247, 0.25)';
        btn.style.color = '#c084fc';
        btn.style.borderColor = 'rgba(168, 85, 247, 0.45)';
      }

      const lbl = document.getElementById('quickTaskSelectedDateLabel');
      const dateInp = document.getElementById('quickTaskInlineDate');

      if (preset === 'today') {
        inlineTaskDateVal = getLocalDateStr(now);
        if (lbl) lbl.textContent = 'اليوم';
        if (dateInp) dateInp.value = inlineTaskDateVal;
      } else if (preset === 'tomorrow') {
        const tom = new Date(now);
        tom.setDate(now.getDate() + 1);
        inlineTaskDateVal = getLocalDateStr(tom);
        if (lbl) lbl.textContent = 'غداً';
        if (dateInp) dateInp.value = inlineTaskDateVal;
      } else if (preset === 'after2') {
        const aft = new Date(now);
        aft.setDate(now.getDate() + 2);
        inlineTaskDateVal = getLocalDateStr(aft);
        if (lbl) lbl.textContent = 'بعد يومين';
        if (dateInp) dateInp.value = inlineTaskDateVal;
      } else if (preset === 'friday') {
        const fri = new Date(now);
        const day = fri.getDay();
        const diff = (5 - day + 7) % 7 || 7;
        fri.setDate(fri.getDate() + diff);
        inlineTaskDateVal = getLocalDateStr(fri);
        if (lbl) lbl.textContent = 'الجمعة القادمة';
        if (dateInp) dateInp.value = inlineTaskDateVal;
      } else if (preset === 'none') {
        inlineTaskDateVal = '';
        if (lbl) lbl.textContent = 'بدون تاريخ';
        if (dateInp) dateInp.value = '';
      }
    }

    function onInlineQuickTaskCustomDate(val) {
      inlineTaskDateVal = val;
      const lbl = document.getElementById('quickTaskSelectedDateLabel');
      if (lbl) lbl.textContent = val || 'محدد';
      const chips = document.querySelectorAll('.btn-quick-date-chip');
      chips.forEach(c => {
        c.classList.remove('active');
        c.style.background = 'transparent';
        c.style.color = '#94a3b8';
        c.style.borderColor = 'rgba(255,255,255,0.12)';
      });
    }

    function setInlineQuickTaskTime(timeStr, btn) {
      inlineTaskTimeVal = timeStr;
      const chips = document.querySelectorAll('.btn-quick-time-chip');
      chips.forEach(c => {
        c.classList.remove('active');
        c.style.background = 'transparent';
        c.style.color = '#94a3b8';
        c.style.borderColor = 'rgba(255,255,255,0.12)';
      });

      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'rgba(56, 189, 248, 0.22)';
        btn.style.color = '#38bdf8';
        btn.style.borderColor = 'rgba(56, 189, 248, 0.45)';
      }

      const lbl = document.getElementById('quickTaskSelectedTimeLabel');
      const timeInp = document.getElementById('quickTaskInlineTime');
      if (timeInp) timeInp.value = timeStr;
      if (lbl) {
        const tMap = { '10:00': '10:00 ص', '14:00': '02:00 م', '18:00': '06:00 م', '21:00': '09:00 م' };
        lbl.textContent = tMap[timeStr] || timeStr;
      }
    }

    function onInlineQuickTaskCustomTime(val) {
      inlineTaskTimeVal = val;
      const lbl = document.getElementById('quickTaskSelectedTimeLabel');
      if (lbl) lbl.textContent = val;
      const chips = document.querySelectorAll('.btn-quick-time-chip');
      chips.forEach(c => {
        c.classList.remove('active');
        c.style.background = 'transparent';
        c.style.color = '#94a3b8';
        c.style.borderColor = 'rgba(255,255,255,0.12)';
      });
    }
'''

# إضافة new_js_controllers قبل نهاية السكريبت الرئيسي
idx_script_end = content.rfind('</script>')
if idx_script_end != -1:
    content = content[:idx_script_end] + "\n" + new_js_controllers + "\n" + content[idx_script_end:]
    print("Injected new JS controllers for commitments dual section and inline tasks.")

# =========================================================================
# 6. تحديث دالة handleQuickTaskAdd لتقرأ مباشرة من inlineTaskDateVal و inlineTaskTimeVal
# =========================================================================
old_h_quick_task = "function handleQuickTaskAdd() {"
idx_hq = content.find(old_h_quick_task)
if idx_hq != -1:
    # نبحث عن موضع إنشاء newDueDate
    idx_due_date = content.find('let newDueDate = null;', idx_hq)
    if idx_due_date != -1:
        idx_due_date_end = content.find('const newTask = {', idx_due_date)
        new_due_date_block = """let newDueDate = inlineTaskDateVal || getLocalDateStr(new Date());
      let newDueTime = inlineTaskTimeVal || '10:00';
"""
        content = content[:idx_due_date] + new_due_date_block + "\n      " + content[idx_due_date_end:]
        print("Updated handleQuickTaskAdd to read directly from inline date & time.")

# حفظ التعديلات على index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: index.html fully updated with Commitments Dual-Tabs and Mobile Tasks Single-Add.")
