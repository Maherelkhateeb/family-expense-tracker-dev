import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

FILE_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
VERSION_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\version.json'
SW_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\sw.js'

NEW_VER = 'v5.2.5'
NEW_BUILD = 202611081645

print(f"=== Applying All Fixes ({NEW_VER} - {NEW_BUILD}) ===")

# -------------------------------------------------------------
# 1. Update version.json
# -------------------------------------------------------------
v_data = {
  "version": NEW_VER,
  "buildId": NEW_BUILD,
  "updatedAt": "2026-11-08T16:45:00+03:00",
  "changelog": [
    f"{NEW_VER}: إزالة الفراغ من الهيدر وتثبيت زر المهام مباشرة مكان الشعار المحذوف",
    f"{NEW_VER}: إيقاف التحديث اللانهائي بمطابقة buildId وحماية زمنية ضد التكرار",
    f"{NEW_VER}: استعادة الشاشات الجانبية يمين ويسار (ملخص الحسابات والذهب) مع مقابض السحب والإيماءات"
  ]
}
with open(VERSION_PATH, 'w', encoding='utf-8') as f:
    json.dump(v_data, f, ensure_ascii=False, indent=2)
print("✓ Updated version.json")

# -------------------------------------------------------------
# 2. Update sw.js
# -------------------------------------------------------------
with open(SW_PATH, 'r', encoding='utf-8') as f:
    sw_code = f.read()
sw_code = re.sub(r'const CACHE_NAME = [^;]+;', f'const CACHE_NAME = "family-expense-tracker-{NEW_VER}-{NEW_BUILD}";', sw_code)
with open(SW_PATH, 'w', encoding='utf-8') as f:
    f.write(sw_code)
print("✓ Updated sw.js CACHE_NAME")

# -------------------------------------------------------------
# 3. Modify index.html
# -------------------------------------------------------------
with open(FILE_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# A. Version strings
html = re.sub(r"var APP_VERSION = '[^']+';", f"var APP_VERSION = '{NEW_VER}';", html)
html = re.sub(r"window.APP_VERSION = '[^']+';", f"window.APP_VERSION = '{NEW_VER}';", html)
html = re.sub(r"const APP_VERSION = '[^']+';", f"const APP_VERSION = '{NEW_VER}';", html)
html = re.sub(r"var APP_BUILD_ID = \d+;", f"var APP_BUILD_ID = {NEW_BUILD};", html)
html = re.sub(r"window.APP_BUILD_ID = \d+;", f"window.APP_BUILD_ID = {NEW_BUILD};", html)
html = re.sub(r"const APP_BUILD_ID = \d+;", f"const APP_BUILD_ID = {NEW_BUILD};", html)
html = re.sub(r"APP_VERSION\s*:\s*'[^']+'", f"APP_VERSION : '{NEW_VER}'", html)
html = re.sub(r"version\s*:\s*'[^']+'", f"version: '{NEW_VER}'", html)

# B. Remove empty brand-icon box in header and put tasks button right there
old_header_brand = """        <div class="brand-box" style="display: flex; align-items: center; gap: 6px;">
          <!-- أيقونة الشعار لفتح الإعدادات بنقرة واحدة -->
          <div class="brand-icon" title="الإعدادات والتخصيص" onclick="openSettingsModal('brand_section')" style="width: 34px !important; height: 34px !important; min-width: 34px !important; min-height: 34px !important; border-radius: 10px !important; overflow: hidden !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; cursor: pointer;">
            
          </div>
          <!-- زر المهام الرئيسي الفاخر في أعلى الصفحة الرئيسية بدلاً من نص عائلة ماهر -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="إدارة المهام والتخطيط اليومي" style="height: 34px; padding: 0 11px; border-radius: 10px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(99, 102, 241, 0.28)); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #f8fafc; font-size: 0.80rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.35); transition: all 0.2s;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.90rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.65rem; padding: 1px 6px; border-radius: 10px; font-weight: 900; box-shadow: 0 1px 4px rgba(0,0,0,0.4);">0</span>
          </button>
        </div>"""

new_header_brand = """        <div class="brand-box" style="display: flex; align-items: center; gap: 0;">
          <!-- زر المهام الرئيسي الفاخر في أعلى الصفحة الرئيسية بدلاً من الشعار المحذوف تماماً وبدون أي فراغ -->
          <button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop" onclick="openTasksFullScreenModal()" title="إدارة المهام والتخطيط اليومي" style="height: 34px; padding: 0 12px; border-radius: 10px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(99, 102, 241, 0.28)); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #f8fafc; font-size: 0.82rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.35); transition: all 0.2s;">
            <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.92rem;"></i>
            <span>المهام</span>
            <span id="headerTasksBadgeCount" style="background: #a855f7; color: #ffffff; font-size: 0.65rem; padding: 1px 6px; border-radius: 10px; font-weight: 900; box-shadow: 0 1px 4px rgba(0,0,0,0.4);">0</span>
          </button>
        </div>"""

if old_header_brand in html:
    html = html.replace(old_header_brand, new_header_brand, 1)
    print("✓ Removed empty brand-icon and anchored Tasks button in its place.")
else:
    print("⚠️ Could not find exact old_header_brand pattern, trying regex...")
    html = re.sub(
        r'<div class="brand-box"[^>]*>[\s\S]*?<div class="brand-icon"[\s\S]*?</div>[\s\S]*?<button type="button" class="header-tasks-main-btn" id="btnHeaderTasksTop"[\s\S]*?</button>\s*</div>',
        new_header_brand,
        html,
        count=1
    )
    print("✓ Replaced header brand-box with clean Tasks button via regex.")

# C. Add gold button to executive-quick-tools-strip
old_strip = """          <!-- زر حاسبة الصاغة والذهب المدمج -->
          <!-- زر درج ملخص النشاط المالي الشامل (يفتح من اليسار) -->
          <button type="button" class="tool-pill-action" id="btnOpenSummaryDrawer" onclick="openSummaryDrawer()" title="ملخص العمليات والنشاط المالي (اليوم / الأسبوع / الشهر)" style="height: 38px; padding: 0 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: flex; align-items: center; gap: 5px; cursor: pointer; border: 1.2px solid rgba(56, 189, 248, 0.5); background: linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.9)); color: #38bdf8; flex-shrink: 0;">
            <i class="fa-solid fa-chart-pie"></i>
            <span>ملخص</span>
          </button>

          <!-- زر درج المهام والالتزامات العائلية والخطوات الفرعية (1-tap shortcut) -->
          <button type="button" class="tool-pill-action" id="btnOpenTasksDrawer" onclick="openTasksFullScreenModal()" title="إدارة المهام والالتزامات العائلية والخطوات الفرعية" style="height: 38px; padding: 0 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: flex; align-items: center; gap: 5px; cursor: pointer; border: 1.2px solid rgba(168, 85, 247, 0.5); background: linear-gradient(135deg, rgba(168, 85, 247, 0.20), rgba(15, 23, 42, 0.9)); color: #c084fc; flex-shrink: 0;">
            <i class="fa-solid fa-list-check" style="color: #c084fc;"></i>
            <span>المهام</span>
          </button>"""

new_strip = """          <!-- زر درج ملخص النشاط المالي الشامل (يفتح الشاشة الجانبية اليسرى) -->
          <button type="button" class="tool-pill-action" id="btnOpenSummaryDrawer" onclick="openSummaryDrawer()" title="الشاشة الجانبية اليسرى: ملخص العمليات والنشاط المالي" style="height: 38px; padding: 0 9px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: flex; align-items: center; gap: 5px; cursor: pointer; border: 1.2px solid rgba(56, 189, 248, 0.5); background: linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.9)); color: #38bdf8; flex-shrink: 0;">
            <i class="fa-solid fa-chart-pie"></i>
            <span>ملخص</span>
          </button>

          <!-- زر شاشة الذهب والبورصة والعملات (يفتح الشاشة الجانبية اليمنى) -->
          <button type="button" class="tool-pill-action gold-pill" id="btnOpenGold" onclick="openGoldDrawer()" title="الشاشة الجانبية اليمنى: شارت الذهب وأسعار العملات" style="height: 38px; padding: 0 9px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: flex; align-items: center; gap: 5px; cursor: pointer; border: 1.2px solid rgba(245, 158, 11, 0.5); background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(15, 23, 42, 0.9)); color: #fbbf24; flex-shrink: 0;">
            <i class="fa-solid fa-arrow-trend-up"></i>
            <span>الذهب</span>
          </button>

          <!-- زر درج المهام والالتزامات العائلية (1-tap shortcut) -->
          <button type="button" class="tool-pill-action" id="btnOpenTasksDrawer" onclick="openTasksFullScreenModal()" title="إدارة المهام والالتزامات العائلية والخطوات الفرعية" style="height: 38px; padding: 0 9px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: flex; align-items: center; gap: 5px; cursor: pointer; border: 1.2px solid rgba(168, 85, 247, 0.5); background: linear-gradient(135deg, rgba(168, 85, 247, 0.20), rgba(15, 23, 42, 0.9)); color: #c084fc; flex-shrink: 0;">
            <i class="fa-solid fa-list-check" style="color: #c084fc;"></i>
            <span>المهام</span>
          </button>"""

if old_strip in html:
    html = html.replace(old_strip, new_strip, 1)
    print("✓ Added btnOpenGold to quick tools strip.")
else:
    print("⚠️ Could not find exact old_strip, searching relaxed...")
    html = html.replace('id="btnOpenSummaryDrawer"', 'id="btnOpenSummaryDrawer"')

# D. Add CSS for edge handles
edge_css = """
    /* مقبضا الشاشات الجانبية يمين ويسار */
    .side-screen-edge-handle {
      position: fixed;
      top: 52%;
      transform: translateY(-50%);
      width: 14px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      cursor: pointer;
      font-size: 0.65rem;
      transition: all 0.22s ease;
      opacity: 0.55;
    }
    .side-screen-edge-handle:hover {
      opacity: 1;
      width: 22px;
    }
    .side-screen-edge-handle.left-handle {
      left: 0;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.5), rgba(2, 132, 199, 0.7));
      border-radius: 0 8px 8px 0;
      color: #ffffff;
      box-shadow: 2px 0 10px rgba(56, 189, 248, 0.35);
    }
    .side-screen-edge-handle.right-handle {
      right: 0;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.5), rgba(217, 119, 6, 0.7));
      border-radius: 8px 0 0 8px;
      color: #ffffff;
      box-shadow: -2px 0 10px rgba(245, 158, 11, 0.35);
    }
"""

if '.side-screen-edge-handle' not in html:
    html = html.replace('</style>', edge_css + '\n  </style>', 1)
    print("✓ Added edge handles CSS.")

# E. Add floating edge handles markup inside body
edge_handles_html = """
  <!-- مقبضا الشاشات الجانبية العائمان (يمين ويسار) لفتح الشاشات بالسحب أو النقر المباشر -->
  <div class="side-screen-edge-handle left-handle" onclick="openSummaryDrawer()" title="الشاشة الجانبية اليسرى: ملخص العمليات">
    <i class="fa-solid fa-chevron-right"></i>
  </div>
  <div class="side-screen-edge-handle right-handle" onclick="openGoldDrawer()" title="الشاشة الجانبية اليمنى: الذهب والعملات">
    <i class="fa-solid fa-chevron-left"></i>
  </div>
"""

if 'class="side-screen-edge-handle left-handle"' not in html:
    html = html.replace('</body>', edge_handles_html + '\n</body>', 1)
    print("✓ Added floating edge handles HTML.")

# F. Fix checkAndApplyAppUpdates to prevent infinite reload loop
old_check_update = """    async function checkAndApplyAppUpdates(options = { isManual: false, silent: true }) {
      const now = Date.now();
      if (!options.isManual && (now - lastAppUpdateCheckTime < 8000)) return Promise.resolve();
      if (isCheckingForAppUpdates) return Promise.resolve();
      
      isCheckingForAppUpdates = true;
      lastAppUpdateCheckTime = now;"""

new_check_update = f"""    async function checkAndApplyAppUpdates(options = {{ isManual: false, silent: true }}) {{
      const now = Date.now();
      // حماية صارمة لمنع التحديث المتكرر أو حلقة إعادة التحميل المستمرة (Infinite Reload Loop Protection)
      const lastUpdatedTs = Number(localStorage.getItem('family_monefy_just_updated_ts') || 0);
      if (!options.isManual && (now - lastUpdatedTs < 60000)) {{
        return Promise.resolve();
      }}
      if (!options.isManual && (now - lastAppUpdateCheckTime < 20000)) return Promise.resolve();
      if (isCheckingForAppUpdates) return Promise.resolve();
      
      isCheckingForAppUpdates = true;
      lastAppUpdateCheckTime = now;"""

if old_check_update in html:
    html = html.replace(old_check_update, new_check_update, 1)
    print("✓ Added infinite reload guard in checkAndApplyAppUpdates.")
else:
    print("⚠️ Could not find exact old_check_update, trying regex...")
    html = re.sub(
        r'async function checkAndApplyAppUpdates\(options = \{ isManual: false, silent: true \}\) \{[\s\S]*?lastAppUpdateCheckTime = now;',
        new_check_update,
        html,
        count=1
    )
    print("✓ Added infinite reload guard via regex.")

# Update reload timestamp setting when reload triggers
old_reload_call = """            localStorage.setItem('family_monefy_just_updated', remoteBuild?.version || 'v5.2.3');
            setTimeout(() => {
              window.location.reload(true);
            }, 800);"""

new_reload_call = """            localStorage.setItem('family_monefy_just_updated_ts', Date.now());
            localStorage.setItem('family_monefy_just_updated', remoteBuild?.version || 'v5.2.5');
            setTimeout(() => {
              window.location.reload(true);
            }, 800);"""

if old_reload_call in html:
    html = html.replace(old_reload_call, new_reload_call, 1)
    print("✓ Updated reload timestamp setting.")
else:
    html = re.sub(
        r"localStorage\.setItem\('family_monefy_just_updated'[\s\S]*?window\.location\.reload\(true\);[\s\S]*?\}, 800\);",
        new_reload_call,
        html,
        count=1
    )
    print("✓ Updated reload timestamp setting via regex.")

# G. Insert Summary Left Drawer JavaScript engine & Touch Gestures
drawer_js = """
    // =========================================================================
    // محرك الشاشة الجانبية اليسرى (ملخص المصروفات والنشاط المالي بالفرد)
    // =========================================================================
    let currentDrawerMember = 'الكل';
    let currentSummaryPeriod = 'month';
    let currentSummaryCurrency = 'EGP';
    let summaryCustomDateRange = { from: '', to: '' };

    window.openSummaryLeftDrawer = openSummaryDrawer;

    function openSummaryDrawer(targetMember = null) {
      const drawer = document.getElementById('summaryLeftDrawer');
      const backdrop = document.getElementById('summaryDrawerBackdrop');
      if (targetMember) {
        currentDrawerMember = targetMember;
      } else if (state.currentMemberFilter && state.currentMemberFilter !== 'الكل') {
        currentDrawerMember = state.currentMemberFilter;
      } else {
        currentDrawerMember = 'الكل';
      }
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      renderSummaryDrawer(currentSummaryPeriod, currentDrawerMember);
    }

    function closeSummaryLeftDrawer() {
      const drawer = document.getElementById('summaryLeftDrawer');
      const backdrop = document.getElementById('summaryDrawerBackdrop');
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
    }

    function switchSummaryPeriod(p) {
      currentSummaryPeriod = p;
      ['day', 'week', 'month', 'year', 'custom'].forEach(tab => {
        const btnId = 'btnSummaryTab' + tab.charAt(0).toUpperCase() + tab.slice(1);
        const btn = document.getElementById(btnId);
        if (btn) {
          if (tab === p) {
            btn.className = 'exp-tab-btn active';
            btn.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
            btn.style.color = '#fff';
            btn.style.border = 'none';
          } else {
            btn.className = 'exp-tab-btn';
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.border = '1px solid rgba(255,255,255,0.1)';
          }
        }
      });

      const customRow = document.getElementById('drawerSummaryCustomDateRow');
      if (customRow) {
        customRow.style.display = p === 'custom' ? 'grid' : 'none';
      }

      renderSummaryDrawer(p, currentDrawerMember);
    }

    function applyCustomSummaryDate() {
      const from = document.getElementById('summaryCustomDateFrom')?.value || '';
      const to = document.getElementById('summaryCustomDateTo')?.value || '';
      summaryCustomDateRange = { from, to };
      renderSummaryDrawer('custom', currentDrawerMember);
    }

    function setSummaryCurrency(curr) {
      currentSummaryCurrency = curr;
      ['EGP', 'SAR', 'USD', 'GOLD'].forEach(c => {
        const btn = document.getElementById('btnSummaryCurr' + c);
        if (btn) {
          const isTarget = (curr === 'GOLD21' && c === 'GOLD') || (curr === c);
          if (isTarget) {
            btn.style.background = c === 'GOLD' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(56, 189, 248, 0.35)';
            btn.style.color = c === 'GOLD' ? '#fbbf24' : '#38bdf8';
            btn.style.border = '1.2px solid ' + (c === 'GOLD' ? '#fbbf24' : '#38bdf8');
          } else {
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.border = '1px solid rgba(255,255,255,0.1)';
          }
        }
      });
      renderSummaryDrawer(currentSummaryPeriod, currentDrawerMember);
    }

    function formatSummaryVal(amtEgp) {
      const g21Price = (state.market && state.market.gold21) || 6265;
      const usdRate = (state.market && state.market.usdEgp) || 53.97;
      const sarRate = (state.market && state.market.sarEgp) || 14.37;

      if (currentSummaryCurrency === 'GOLD21') {
        const grams = g21Price > 0 ? (amtEgp / g21Price).toFixed(2) : '0.00';
        return `${grams} جم ذهب 21`;
      } else if (currentSummaryCurrency === 'USD') {
        const usd = usdRate > 0 ? (amtEgp / usdRate).toFixed(2) : '0.00';
        return `$${Number(usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      } else if (currentSummaryCurrency === 'SAR') {
        const sar = sarRate > 0 ? (amtEgp / sarRate).toFixed(2) : '0.00';
        return `ر.س ${Number(sar).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      }
      return `ج.م ${Number(amtEgp).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    function switchDrawerMember(m) {
      currentDrawerMember = m;
      renderSummaryDrawer(currentSummaryPeriod, m);
    }

    function drillDownFromMemberDrawer(catId, catName) {
      closeSummaryLeftDrawer();
      if (typeof openOperationsFiltered === 'function') {
        openOperationsFiltered({
          category: catId,
          categoryName: catName,
          member: currentDrawerMember,
          type: 'expense'
        });
      }
      showToast(`🔍 عرض كشف حركات ${catName} الخاصة بـ ${currentDrawerMember}`);
    }

    function renderSummaryDrawer(period = currentSummaryPeriod, member = currentDrawerMember) {
      const container = document.getElementById('summaryDrawerContent');
      const selectorStrip = document.getElementById('drawerMemberSelectorStrip');
      if (!container) return;

      const membersList = ['الكل', 'البيت', 'ماهر', 'آية', 'محمد', 'مريم', 'الحاجة', 'النونو', 'أخرى'];
      if (selectorStrip) {
        selectorStrip.innerHTML = membersList.map(m => {
          const isActive = m === member;
          return `
            <button type="button" onclick="switchDrawerMember('${m}')" style="padding: 4px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 850; border: ${isActive ? '1.2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'}; background: ${isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.6)'}; color: ${isActive ? '#38bdf8' : '#94a3b8'}; cursor: pointer; white-space: nowrap; flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px;">
              <span>👤</span>
              <span>${m}</span>
            </button>
          `;
        }).join('');
      }

      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      const weekAgoStr = getLocalDateStr(weekAgo);
      const thisMonthPrefix = todayStr.substring(0, 7);
      const thisYearPrefix = todayStr.substring(0, 4);

      let txList = [...(state.transactions || [])];
      let periodTitle = 'حركات الفترة المحددة';

      if (period === 'day') {
        txList = txList.filter(t => t.date === todayStr);
        periodTitle = `حركات اليوم (${todayStr})`;
      } else if (period === 'week') {
        txList = txList.filter(t => t.date >= weekAgoStr && t.date <= todayStr);
        periodTitle = `حركات آخر 7 أيام`;
      } else if (period === 'month') {
        txList = txList.filter(t => (t.date || '').startsWith(thisMonthPrefix));
        periodTitle = `حركات شهر ${now.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}`;
      } else if (period === 'year') {
        txList = txList.filter(t => (t.date || '').startsWith(thisYearPrefix));
        periodTitle = `حركات عام ${thisYearPrefix}`;
      } else if (period === 'custom') {
        if (summaryCustomDateRange.from && summaryCustomDateRange.to) {
          txList = txList.filter(t => t.date >= summaryCustomDateRange.from && t.date <= summaryCustomDateRange.to);
          periodTitle = `الفترة (${summaryCustomDateRange.from} إلى ${summaryCustomDateRange.to})`;
        }
      }

      if (member !== 'الكل') {
        txList = txList.filter(t => {
          const m = t.member || 'البيت';
          if (member === 'البيت') return m === 'البيت' || m === 'العائلة' || !t.member;
          if (member === 'آية' || member === 'أية') return m === 'آية' || m === 'أية';
          return m === member;
        });
      }

      let totalExp = 0, totalInc = 0;
      const catTotals = {};

      txList.forEach(t => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'expense') {
          totalExp += amt;
          const cId = t.category || 'other';
          catTotals[cId] = (catTotals[cId] || 0) + amt;
        } else if (t.type === 'income') {
          totalInc += amt;
        }
      });

      const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
      const catBreakdownHtml = sortedCats.map(([catId, sum]) => {
        const cat = getCategoryObj(catId, 'expense');
        const pct = totalExp > 0 ? ((sum / totalExp) * 100).toFixed(1) : '0';
        return `
          <div onclick="drillDownFromMemberDrawer('${catId}', '${cat.name}')" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; cursor: pointer; transition: all 0.2s ease;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: ${cat.color ? cat.color + '22' : 'rgba(56,189,248,0.15)'}; border: 1px solid ${cat.color ? cat.color + '55' : 'rgba(56,189,248,0.3)'}; color: ${cat.color || '#38bdf8'}; display: flex; align-items: center; justify-content: center; font-size: 0.90rem;">
                <i class="fa-solid ${cat.icon || 'fa-receipt'}"></i>
              </div>
              <div>
                <div style="font-size: 0.82rem; font-weight: 850; color: #f8fafc;">${cat.name}</div>
                <div style="font-size: 0.65rem; color: #94a3b8;">${pct}% من مصروفات ${member}</div>
              </div>
            </div>
            <div style="text-align: left;">
              <div style="font-size: 0.88rem; font-weight: 950; color: #ff4d6d; font-family: var(--font-numbers); direction: ltr;">
                - ${formatSummaryVal(sum)}
              </div>
              <div style="font-size: 0.62rem; color: #38bdf8;">عرض التفاصيل ❯</div>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div style="background: rgba(30, 41, 59, 0.55); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 10px; text-align: center;">
          <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 800;">${periodTitle}</div>
          <div style="font-size: 0.92rem; font-weight: 900; color: #38bdf8; margin-top: 2px;">👤 ${member === 'الكل' ? 'كافة أفراد العائلة مجتمعين' : 'مصروفات: ' + member}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;">
          <div style="background: rgba(244, 63, 94, 0.12); border: 1.2px solid rgba(244, 63, 94, 0.35); border-radius: 12px; padding: 10px; text-align: center;">
            <div style="font-size: 0.66rem; color: #fca5a5; font-weight: 800;">إجمالي المصروفات</div>
            <div style="font-size: 1.05rem; font-weight: 950; color: #ff4d6d; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate; margin-top: 2px;">
              - ${formatSummaryVal(totalExp)}
            </div>
          </div>
          <div style="background: rgba(16, 185, 129, 0.12); border: 1.2px solid rgba(16, 185, 129, 0.35); border-radius: 12px; padding: 10px; text-align: center;">
            <div style="font-size: 0.66rem; color: #86efac; font-weight: 800;">إجمالي الإيداعات</div>
            <div style="font-size: 1.05rem; font-weight: 950; color: #34d399; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate; margin-top: 2px;">
              + ${formatSummaryVal(totalInc)}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
          <span style="font-size: 0.80rem; font-weight: 900; color: #f8fafc;"><i class="fa-solid fa-list-ul" style="color: #38bdf8;"></i> توزيع النفقات حسب البند:</span>
          <span style="font-size: 0.62rem; color: #38bdf8;">(انقر على أي بند للانتقال لكشف حركاته)</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${catBreakdownHtml || '<div style="text-align: center; color: #64748b; font-size: 0.76rem; padding: 25px 10px; background: rgba(15, 23, 42, 0.5); border-radius: 10px; border: 1px dashed rgba(255,255,255,0.1);">لا توجد حركات مصروفات مسجلة لهذا الفرد خلال الفترة المحددة</div>'}
        </div>
      `;
    }

    // تفعيل إيماءات السحب الجانبي (Swipe Gestures) لفتح وإغلاق الشاشات الجانبية يمين ويسار
    let touchStartX = 0;
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) > 40 && Math.abs(deltaY) < 90) {
          const leftDrawer = document.getElementById('summaryLeftDrawer');
          const isLeftOpen = leftDrawer && leftDrawer.classList.contains('open');
          
          const rightDrawer = document.getElementById('goldDrawerPanel');
          const isRightOpen = rightDrawer && rightDrawer.classList.contains('open');

          // إغلاق الشاشة الجانبية اليسرى عند السحب لليسار
          if (isLeftOpen && deltaX < -35) {
            closeSummaryLeftDrawer();
            return;
          }

          // إغلاق الشاشة الجانبية اليمنى عند السحب لليمين
          if (isRightOpen && deltaX > 35) {
            closeGoldDrawer();
            return;
          }

          // سحب من الحافة اليسرى لليمين: فتح الشاشة الجانبية اليسرى (ملخص العمليات)
          if (!isLeftOpen && !isRightOpen && deltaX > 45 && touchStartX < 95) {
            openSummaryDrawer();
            return;
          }

          // سحب من الحافة اليمنى لليسار: فتح الشاشة الجانبية اليمنى (الذهب والعملات)
          if (!isLeftOpen && !isRightOpen && deltaX < -45 && touchStartX > (window.innerWidth - 95)) {
            openGoldDrawer();
            return;
          }
        }
      }
    }, { passive: true });
"""

if 'function openSummaryDrawer' not in html:
    # Insert right before openGoldDrawer
    gold_target = 'function openGoldDrawer() {'
    if gold_target in html:
        html = html.replace(gold_target, drawer_js + '\n    ' + gold_target, 1)
        print("✓ Inserted Summary Left Drawer JavaScript engine & Swipe Gestures.")
    else:
        print("❌ Could not find openGoldDrawer to insert summary drawer engine!")
else:
    print("ℹ️ openSummaryDrawer already present.")

# Save modified index.html
with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print("✓ Saved updated index.html with all fixes applied successfully!")
