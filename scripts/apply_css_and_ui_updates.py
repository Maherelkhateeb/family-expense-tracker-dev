import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إضافة قواعد CSS الشاملة للأيقونات والفونتات
css_palettes = '''
    /* =========================================================================
       منظومة أنماط وألوان الأيقونات الفاخرة (Comprehensive Icon Palettes)
       ========================================================================= */
    /* 1. ذهبي ملكي (Royal Gold) */
    html[data-icon-theme="gold"] .cat-card i,
    html[data-icon-theme="gold"] .cat-card svg,
    html[data-icon-theme="gold"] .category-icon,
    html[data-icon-theme="gold"] .nav-tab-item.active i,
    html[data-icon-theme="gold"] .nav-tab-item.active .nav-tab-svg,
    html[data-icon-theme="gold"] .nav-tab-item i,
    html[data-icon-theme="gold"] .ops-tx-card-clean i,
    html[data-icon-theme="gold"] .expected-clean-card i,
    html[data-icon-theme="gold"] .header-action-btn i,
    html[data-icon-theme="gold"] .quick-action-pill i,
    html[data-icon-theme="gold"] .category-circle-icon i {
      color: #fbbf24 !important;
      filter: drop-shadow(0 0 7px rgba(251, 191, 36, 0.6)) !important;
    }
    html[data-icon-theme="gold"] .cat-card {
      border-color: rgba(251, 191, 36, 0.45) !important;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25) !important;
    }

    /* 2. زمردي فاخر (Imperial Emerald) */
    html[data-icon-theme="emerald"] .cat-card i,
    html[data-icon-theme="emerald"] .cat-card svg,
    html[data-icon-theme="emerald"] .category-icon,
    html[data-icon-theme="emerald"] .nav-tab-item.active i,
    html[data-icon-theme="emerald"] .nav-tab-item.active .nav-tab-svg,
    html[data-icon-theme="emerald"] .nav-tab-item i,
    html[data-icon-theme="emerald"] .ops-tx-card-clean i,
    html[data-icon-theme="emerald"] .expected-clean-card i,
    html[data-icon-theme="emerald"] .header-action-btn i,
    html[data-icon-theme="emerald"] .quick-action-pill i,
    html[data-icon-theme="emerald"] .category-circle-icon i {
      color: #34d399 !important;
      filter: drop-shadow(0 0 7px rgba(52, 211, 153, 0.6)) !important;
    }
    html[data-icon-theme="emerald"] .cat-card {
      border-color: rgba(16, 185, 129, 0.45) !important;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25) !important;
    }

    /* 3. سماوي بحري (Ocean Sapphire) */
    html[data-icon-theme="ocean"] .cat-card i,
    html[data-icon-theme="ocean"] .cat-card svg,
    html[data-icon-theme="ocean"] .category-icon,
    html[data-icon-theme="ocean"] .nav-tab-item.active i,
    html[data-icon-theme="ocean"] .nav-tab-item.active .nav-tab-svg,
    html[data-icon-theme="ocean"] .nav-tab-item i,
    html[data-icon-theme="ocean"] .ops-tx-card-clean i,
    html[data-icon-theme="ocean"] .expected-clean-card i,
    html[data-icon-theme="ocean"] .header-action-btn i,
    html[data-icon-theme="ocean"] .quick-action-pill i,
    html[data-icon-theme="ocean"] .category-circle-icon i {
      color: #38bdf8 !important;
      filter: drop-shadow(0 0 7px rgba(56, 189, 248, 0.6)) !important;
    }
    html[data-icon-theme="ocean"] .cat-card {
      border-color: rgba(56, 189, 248, 0.45) !important;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.25) !important;
    }

    /* 4. ياقوتي ملكي (Royal Purple Amethyst) */
    html[data-icon-theme="purple"] .cat-card i,
    html[data-icon-theme="purple"] .cat-card svg,
    html[data-icon-theme="purple"] .category-icon,
    html[data-icon-theme="purple"] .nav-tab-item.active i,
    html[data-icon-theme="purple"] .nav-tab-item.active .nav-tab-svg,
    html[data-icon-theme="purple"] .nav-tab-item i,
    html[data-icon-theme="purple"] .ops-tx-card-clean i,
    html[data-icon-theme="purple"] .expected-clean-card i,
    html[data-icon-theme="purple"] .header-action-btn i,
    html[data-icon-theme="purple"] .quick-action-pill i,
    html[data-icon-theme="purple"] .category-circle-icon i {
      color: #c084fc !important;
      filter: drop-shadow(0 0 7px rgba(192, 132, 252, 0.6)) !important;
    }
    html[data-icon-theme="purple"] .cat-card {
      border-color: rgba(168, 85, 247, 0.45) !important;
      box-shadow: 0 4px 14px rgba(168, 85, 247, 0.25) !important;
    }

    /* 5. بلاتيني مونوكروم (Platinum Chrome Monochrome) */
    html[data-icon-theme="silver"] .cat-card i,
    html[data-icon-theme="silver"] .cat-card svg,
    html[data-icon-theme="silver"] .category-icon,
    html[data-icon-theme="silver"] .nav-tab-item.active i,
    html[data-icon-theme="silver"] .nav-tab-item.active .nav-tab-svg,
    html[data-icon-theme="silver"] .nav-tab-item i,
    html[data-icon-theme="silver"] .ops-tx-card-clean i,
    html[data-icon-theme="silver"] .expected-clean-card i,
    html[data-icon-theme="silver"] .header-action-btn i,
    html[data-icon-theme="silver"] .quick-action-pill i,
    html[data-icon-theme="silver"] .category-circle-icon i {
      color: #e2e8f0 !important;
      filter: drop-shadow(0 0 6px rgba(226, 232, 240, 0.5)) !important;
    }
    html[data-icon-theme="silver"] .cat-card {
      border-color: rgba(203, 213, 225, 0.35) !important;
      box-shadow: 0 4px 14px rgba(148, 163, 184, 0.2) !important;
    }

    /* =========================================================================
       منظومة الخطوط العربية والمصرفية الرائدة (Typography Engine)
       ========================================================================= */
    html[data-font-family="alexandria"], html[data-font-family="alexandria"] body, html[data-font-family="alexandria"] button, html[data-font-family="alexandria"] input, html[data-font-family="alexandria"] select, html[data-font-family="alexandria"] textarea, html[data-font-family="alexandria"] div, html[data-font-family="alexandria"] span {
      font-family: 'Alexandria', 'Tajawal', sans-serif !important;
    }
    html[data-font-family="cairo"], html[data-font-family="cairo"] body, html[data-font-family="cairo"] button, html[data-font-family="cairo"] input, html[data-font-family="cairo"] select, html[data-font-family="cairo"] textarea, html[data-font-family="cairo"] div, html[data-font-family="cairo"] span {
      font-family: 'Cairo', 'Tajawal', sans-serif !important;
    }
    html[data-font-family="ibm"], html[data-font-family="ibm"] body, html[data-font-family="ibm"] button, html[data-font-family="ibm"] input, html[data-font-family="ibm"] select, html[data-font-family="ibm"] textarea, html[data-font-family="ibm"] div, html[data-font-family="ibm"] span {
      font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif !important;
    }
    html[data-font-family="almarai"], html[data-font-family="almarai"] body, html[data-font-family="almarai"] button, html[data-font-family="almarai"] input, html[data-font-family="almarai"] select, html[data-font-family="almarai"] textarea, html[data-font-family="almarai"] div, html[data-font-family="almarai"] span {
      font-family: 'Almarai', 'Tajawal', sans-serif !important;
    }
    html[data-font-family="readex"], html[data-font-family="readex"] body, html[data-font-family="readex"] button, html[data-font-family="readex"] input, html[data-font-family="readex"] select, html[data-font-family="readex"] textarea, html[data-font-family="readex"] div, html[data-font-family="readex"] span {
      font-family: 'Readex Pro', 'Tajawal', sans-serif !important;
    }
    html[data-font-family="tajawal"], html[data-font-family="tajawal"] body, html[data-font-family="tajawal"] button, html[data-font-family="tajawal"] input, html[data-font-family="tajawal"] select, html[data-font-family="tajawal"] textarea, html[data-font-family="tajawal"] div, html[data-font-family="tajawal"] span {
      font-family: 'Tajawal', sans-serif !important;
    }
    .fa, .fas, .far, .fal, .fad, .fab, .fa-solid, .fa-regular, .fa-brands, i[class*="fa-"] {
      font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands" !important;
    }
'''

idx_style_end = content.find('</style>')
if idx_style_end != -1:
    content = content[:idx_style_end] + "\n" + css_palettes + "\n" + content[idx_style_end:]
    print("Injected comprehensive icon palettes and font CSS rules.")

# 2. تحديث دالة renderCommitmentsPageUI لتدعم الفلتر الجديد وتحديث شارات العدادات
old_render_ui_decl = "function renderCommitmentsPageUI() {"
idx_rc_ui = content.find(old_render_ui_decl)
if idx_rc_ui != -1:
    # نبحث عن نهايتها
    idx_rc_ui_end = content.find('function toggleSelectCommitmentRow(', idx_rc_ui)
    new_render_commitments_ui_code = '''function renderCommitmentsPageUI() {
      if (!state.expectedExpenses || !Array.isArray(state.expectedExpenses)) {
        state.expectedExpenses = [];
      }

      const allItems = state.expectedExpenses;
      const nowStr = getLocalDateStr(new Date());

      // فصل الفواتير عن الديون
      const bills = allItems.filter(e => e.type === 'upcoming_bill' || e.type === 'bill' || e.isBill);
      const debts = allItems.filter(e => e.type === 'debt_on_us' || e.type === 'debt_for_us' || e.type === 'debt');

      const pendingBills = bills.filter(b => b.status !== 'paid');
      const pendingDebts = debts.filter(d => d.status !== 'paid');
      const pendingDebtsOnUs = pendingDebts.filter(d => d.type === 'debt_on_us' || d.type === 'debt');
      const pendingDebtsForUs = pendingDebts.filter(d => d.type === 'debt_for_us');
      const settledItems = allItems.filter(i => i.status === 'paid');

      // تحديث عداد الزر العلوي الرئيسي للفواتير والديون
      const bBillsAndDebtsBadge = document.getElementById('badgeCountBillsAndDebts');
      if (bBillsAndDebtsBadge) {
        bBillsAndDebtsBadge.textContent = pendingBills.length + pendingDebts.length;
      }

      // تحديث عدادات شريط الفلاتر السريعة تحت الفواتير والديون
      const elAll = document.getElementById('subCntAll');
      const elBills = document.getElementById('subCntBills');
      const elOnUs = document.getElementById('subCntDebtsOnUs');
      const elForUs = document.getElementById('subCntDebtsForUs');
      const elSettled = document.getElementById('subCntSettled');

      if (elAll) elAll.textContent = pendingBills.length + pendingDebts.length;
      if (elBills) elBills.textContent = pendingBills.length;
      if (elOnUs) elOnUs.textContent = pendingDebtsOnUs.length;
      if (elForUs) elForUs.textContent = pendingDebtsForUs.length;
      if (elSettled) elSettled.textContent = settledItems.length;

      const curr = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : (state.currency || 'ج.م');

      // حساب المبالغ المالية
      let sumBills = 0;
      pendingBills.forEach(b => sumBills += (Number(b.amount) || 0));

      let sumDebtsOnUs = 0;
      pendingDebtsOnUs.forEach(d => sumDebtsOnUs += (Number(d.amount) || 0));

      let sumDebtsForUs = 0;
      pendingDebtsForUs.forEach(d => sumDebtsForUs += (Number(d.amount) || 0));

      let sumSettled = 0;
      settledItems.forEach(s => sumSettled += (Number(s.amount) || 0));

      // صافي الالتزامات المطلوب تدبيرها = الفواتير + الديون علينا - الديون لنا
      const netCommitmentsToPrepare = sumBills + sumDebtsOnUs - sumDebtsForUs;

      const netIcon = document.getElementById('kpiNetIconCommitments');
      const netLabel = document.getElementById('kpiNetLabelCommitments');
      const netValue = document.getElementById('kpiNetValueCommitments');

      const c1Title = document.getElementById('kpiCap1Title');
      const c1Amt = document.getElementById('kpiCap1Amount');
      const c1Cnt = document.getElementById('kpiCap1Count');

      const c2Title = document.getElementById('kpiCap2Title');
      const c2Amt = document.getElementById('kpiCap2Amount');
      const c2Cnt = document.getElementById('kpiCap2Count');

      const c3Title = document.getElementById('kpiCap3Title');
      const c3Amt = document.getElementById('kpiCap3Amount');
      const c3Cnt = document.getElementById('kpiCap3Count');

      if (netIcon) netIcon.className = 'fa-solid fa-scale-balanced';
      if (netLabel) netLabel.textContent = 'صافي الالتزامات المالية المطلوب تدبيرها:';
      if (netValue) {
        const netColor = (netCommitmentsToPrepare > 0) ? '#ff4d6d' : '#34d399';
        const netSign = (netCommitmentsToPrepare > 0) ? '-' : '+';
        netValue.innerHTML = `<span style="color: ${netColor}; direction: rtl; display: inline-flex; align-items: center; gap: 4px;">${netSign} ${formatMoneyVal(Math.abs(netCommitmentsToPrepare))} <span style="font-size: 0.74rem;">${curr}</span></span>`;
      }

      if (c1Title) c1Title.textContent = '📄 فواتير قادمة';
      if (c1Amt) c1Amt.textContent = formatMoneyVal(sumBills);
      if (c1Cnt) c1Cnt.textContent = `${pendingBills.length} فاتورة`;

      if (c2Title) c2Title.textContent = '🔻 ديون علينا';
      if (c2Amt) c2Amt.textContent = formatMoneyVal(sumDebtsOnUs);
      if (c2Cnt) c2Cnt.textContent = `${pendingDebtsOnUs.length} التزام`;

      if (c3Title) c3Title.textContent = '🔺 ديون لنا';
      if (c3Amt) c3Amt.textContent = formatMoneyVal(sumDebtsForUs);
      if (c3Cnt) c3Cnt.textContent = `${pendingDebtsForUs.length} مستحق`;

      // التحكم في إظهار القوائم بناءً على الفلتر السريع
      const vBills = document.getElementById('viewCommitmentsBillsList');
      const vDebts = document.getElementById('viewCommitmentsDebtsList');

      if (activeCommitmentSubFilter === 'bills') {
        if (vBills) vBills.style.display = 'block';
        if (vDebts) vDebts.style.display = 'none';
      } else if (activeCommitmentSubFilter === 'debts_on_us' || activeCommitmentSubFilter === 'debts_for_us') {
        if (vBills) vBills.style.display = 'none';
        if (vDebts) vDebts.style.display = 'block';
      } else if (activeCommitmentSubFilter === 'settled') {
        if (vBills) vBills.style.display = 'block';
        if (vDebts) vDebts.style.display = 'block';
      } else {
        // all
        if (vBills) vBills.style.display = 'block';
        if (vDebts) vDebts.style.display = 'block';
      }

      renderCommitmentsBillsList();
      renderCommitmentsDebtsList();
    }
'''
    content = content[:idx_rc_ui] + new_render_commitments_ui_code + "\n    " + content[idx_rc_ui_end:]
    print("Upgraded renderCommitmentsPageUI with unified multi-level KPI calculations.")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: index.html fully updated.")
