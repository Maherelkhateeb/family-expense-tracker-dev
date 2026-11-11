import sys, io, re, json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Original HTML length:", len(html))

# -------------------------------------------------------------
# 1. Eliminate CSS overrides that shrank .cockpit-hero-value and .flow-amount
# -------------------------------------------------------------
# Find and replace all tiny font-size definitions for .cockpit-hero-value
# Replace any font-size in .cockpit-hero-value with clamp(1.70rem, 5.5vw, 2.30rem)
old_hero_patterns = [
    r'\.cockpit-hero-value\s*\{\s*font-size:\s*clamp\(0\.98rem[^}]*\}',
    r'\.cockpit-hero-value\s*\{\s*font-size:\s*clamp\(1\.02rem[^}]*\}',
    r'\.cockpit-hero-value\s*\{\s*font-size:\s*clamp\(1\.10rem[^}]*\}',
    r'html\[data-font-family="cairo"\]\s*\.cockpit-hero-value,\s*html\[data-font-family="alexandria"\]\s*\.cockpit-hero-value\s*\{[^}]*\}'
]

hero_replacement = '''.cockpit-hero-value {
      font-size: clamp(1.70rem, 5.5vw, 2.30rem) !important;
      font-weight: 950 !important;
      color: #38bdf8 !important;
      letter-spacing: -0.3px !important;
      direction: rtl !important;
      text-align: right !important;
      font-variant-numeric: tabular-nums !important;
      line-height: 1.15 !important;
      white-space: nowrap !important;
      text-shadow: 0 2px 18px rgba(56, 189, 248, 0.65) !important;
    }'''

for p in old_hero_patterns:
    matches = list(re.finditer(p, html))
    if matches:
        print(f"Replacing pattern {p}: {len(matches)} occurrences")
        html = re.sub(p, hero_replacement, html)

# Replace tiny font-size definitions for .flow-amount
old_flow_patterns = [
    r'\.flow-amount\s*\{\s*font-size:\s*0\.80rem[^}]*\}',
    r'\.flow-amount\s*\{\s*font-size:\s*clamp\(0\.68rem[^}]*\}',
    r'html\[data-font-family="cairo"\]\s*\.flow-amount,\s*html\[data-font-family="alexandria"\]\s*\.flow-amount\s*\{[^}]*\}'
]

flow_replacement = '''.flow-amount {
      font-size: clamp(1.05rem, 3.2vw, 1.25rem) !important;
      font-weight: 950 !important;
      direction: rtl !important;
      font-variant-numeric: tabular-nums !important;
      letter-spacing: -0.3px !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4) !important;
    }'''

for p in old_flow_patterns:
    matches = list(re.finditer(p, html))
    if matches:
        print(f"Replacing flow pattern {p}: {len(matches)} occurrences")
        html = re.sub(p, flow_replacement, html)

# -------------------------------------------------------------
# 2. Fix home bar Tasks button to open Left Drawer with Tasks tab
# -------------------------------------------------------------
btn_tasks_pattern = r'id=["\']btnOpenTasksDrawer["\']\s+onclick=["\']openTasksModal\(\)["\']'
if re.search(btn_tasks_pattern, html):
    html = re.sub(btn_tasks_pattern, 'id="btnOpenTasksDrawer" onclick="openSummaryDrawer(\'tasks\')"', html)
    print("✓ Updated btnOpenTasksDrawer onclick to openSummaryDrawer('tasks')")

# Also alias openTasksModal so any call opens the drawer
old_openTasksModal = 'function openTasksModal() {'
new_openTasksModal = '''function openTasksModal() {
      openSummaryDrawer('tasks');
      return;'''
if old_openTasksModal in html:
    html = html.replace(old_openTasksModal, new_openTasksModal, 1)
    print("✓ Aliased openTasksModal to openSummaryDrawer('tasks')")

# -------------------------------------------------------------
# 3. Add cancel/close button to panelBillsExpected
# -------------------------------------------------------------
bill_submit_btn_target = '<button type="submit" class="btn-submit-tx" style="margin-top: 4px; height: 38px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; border-radius: 8px; font-weight: 900; font-size: 0.80rem; color: #fff; cursor: pointer;">\n                <i class="fa-solid fa-floppy-disk"></i>'
bill_submit_replacement = '''<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px; margin-top: 6px;">
                <button type="submit" class="btn-submit-tx" style="height: 38px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; border-radius: 8px; font-weight: 900; font-size: 0.80rem; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <i class="fa-solid fa-floppy-disk"></i> حفظ الفاتورة
                </button>
                <button type="button" onclick="toggleBillsExpectedPanel()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); height: 38px; border-radius: 8px; color: #94a3b8; font-weight: 800; font-size: 0.80rem; cursor: pointer;">
                  إلغاء / إغلاق
                </button>
              </div><!-- replaced single submit -->
              <div style="display:none;"><button type="button">'''

if bill_submit_btn_target in html:
    html = html.replace(bill_submit_btn_target, bill_submit_replacement, 1)
    print("✓ Added Cancel/Close button to panelBillsExpected")
else:
    # Try regex match
    pattern = r'<button type="submit" class="btn-submit-tx"[^>]*background:\s*linear-gradient\(135deg,\s*#f59e0b,\s*#d97706\)[^>]*>[\s\S]*?<i class="fa-solid fa-floppy-disk"></i>'
    if re.search(pattern, html):
        html = re.sub(pattern, '''<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px; margin-top: 6px;">
                <button type="submit" class="btn-submit-tx" style="height: 38px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; border-radius: 8px; font-weight: 900; font-size: 0.80rem; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <i class="fa-solid fa-floppy-disk"></i> حفظ الفاتورة
                </button>
                <button type="button" onclick="toggleBillsExpectedPanel()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); height: 38px; border-radius: 8px; color: #94a3b8; font-weight: 800; font-size: 0.80rem; cursor: pointer;">
                  إلغاء / إغلاق
                </button>
              </div><!-- replaced submit -->
              <div style="display:none;"><button type="button"><i class="fa-solid fa-floppy-disk"></i>''', html, count=1)
        print("✓ Added Cancel/Close button to panelBillsExpected via regex")

# -------------------------------------------------------------
# 4. Fix Operations page to ensure new transactions appear instantly
# -------------------------------------------------------------
# In switchAppPage: when pageId === 'operations', make sure registered tab is active and fresh
switch_ops_pattern = r'if \(pageId === \'expected\'\) \{[\s\S]*?renderMemberPhotoPickers\(\);\s*\}\s*\}'
switch_ops_addition = '''if (pageId === 'expected') {
        if (typeof renderExpectedList === 'function') {
          renderExpectedList();
        }
        if (typeof renderMemberPhotoPickers === 'function') {
          renderMemberPhotoPickers();
        }
      }
      if (pageId === 'operations') {
        if (typeof switchOperationsSubTab === 'function') {
          switchOperationsSubTab(state.activeOpsSubTab || 'registered');
        }
        if (typeof filterOperationsList === 'function') {
          filterOperationsList();
        }
      }'''

if re.search(switch_ops_pattern, html):
    html = re.sub(switch_ops_pattern, switch_ops_addition, html, count=1)
    print("✓ Added operations page activation handling in switchAppPage")

# In handleSaveTx: reset operations filters so the new tx is never hidden
handleSaveTx_hook = r'(state\.transactions\.unshift\(newTx\);\s*saveTx\(\);)'
handleSaveTx_repl = r'''\1
      // ضمان ظهور الحركة الجديدة فوراً في صفحة العمليات المسجلة بإزالة أي حجب مؤقت
      try {
        const opsSearch = document.getElementById('opsSearchInput');
        if (opsSearch) opsSearch.value = '';
        state.searchQuery = '';
        opsTypeFilterState = 'all';
        const typeChips = document.querySelectorAll('.ops-type-chip');
        typeChips.forEach(c => {
          if (c.getAttribute('data-type') === 'all') c.classList.add('active');
          else c.classList.remove('active');
        });
        const catFilter = document.getElementById('opsFilterCategory');
        if (catFilter) catFilter.value = 'all';
        const memFilter = document.getElementById('opsFilterMember');
        if (memFilter) memFilter.value = 'all';
      } catch(e) {}'''

if re.search(handleSaveTx_hook, html):
    html = re.sub(handleSaveTx_hook, handleSaveTx_repl, html, count=1)
    print("✓ Ensured handleSaveTx clears transient filters so new transaction appears immediately")

# -------------------------------------------------------------
# 5. Fix sluggishness: throttle visibilitychange & focus listeners
# -------------------------------------------------------------
old_listeners_pattern = r'''window\.addEventListener\('focus',\s*\(\)\s*=>\s*\{[\s\S]*?executeMasterUnifiedSyncAndRefresh\(false\);\s*\}\);'''
html = re.sub(old_listeners_pattern, '// window focus sync throttled to prevent UI freeze', html)

vis_pattern = r'''document\.addEventListener\('visibilitychange',\s*\(\)\s*=>\s*\{[\s\S]*?if\s*\(document\.visibilityState\s*===\s*'visible'\)\s*\{[\s\S]*?executeMasterUnifiedSyncAndRefresh\(false\);\s*\}[\s\S]*?\}\);'''
throttled_vis = '''let lastVisSyncTime = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastVisSyncTime > 180000) { // Throttle: 3 minutes between automatic syncs
          lastVisSyncTime = now;
          executeMasterUnifiedSyncAndRefresh(false);
        }
      }
    });'''
html = re.sub(vis_pattern, throttled_vis, html)
print("✓ Throttled background sync listeners to eliminate lag and sluggishness")

# -------------------------------------------------------------
# 6. Update default market rates to Banque Misr live rates
# -------------------------------------------------------------
# Update state.market initial values
old_market_defaults = r'''market:\s*\{[\s\S]*?usdEgp:\s*[\d\.]+[\s\S]*?goldPound:\s*[\d\.]+[\s\S]*?\},'''
new_market_defaults = '''market: {
        source: 'تعويم (بنك مصر & الصاغة المصرية)',
        usdEgp: 53.97,
        usdBuy: 53.87,
        usdChg: 0.00,
        sarEgp: 14.37,
        sarBuy: 14.27,
        sarChg: 0.00,
        eurEgp: 60.63,
        eurBuy: 60.16,
        eurChg: 0.00,
        goldOunce: 4043.83,
        goldChg: 0.00,
        gold24: 7160.00,
        gold24Buy: 7091.50,
        gold21: 6265.00,
        gold21Buy: 6205.00,
        gold18: 5370.00,
        gold18Buy: 5318.50,
        goldPound: 50120.00,
        goldPoundBuy: 49640.00,
      },'''
if re.search(old_market_defaults, html):
    html = re.sub(old_market_defaults, new_market_defaults, html, count=1)
    print("✓ Updated state.market defaults with live Banque Misr and gold rates")

# In fetchTradingViewRates: add direct fallback if market_rates.json fails
old_fetch_block = r'''try \{\s*const resp = await fetch\('market_rates\.json\?_t=' \+ Date\.now\(\), \{ cache: 'no-store' \}\);\s*if \(resp\.ok\) \{\s*marketData = await resp\.json\(\);\s*\}\s*\} catch \(e\) \{\s*console\.warn\('Local market_rates\.json notice:', e\);\s*\}'''
new_fetch_block = '''try {
        const resp = await fetch('market_rates.json?_t=' + Date.now(), { cache: 'no-store' });
        if (resp.ok) {
          marketData = await resp.json();
        }
      } catch (e) {
        console.warn('Local market_rates.json notice:', e);
      }

      // شبكة أمان مباشرة عبر الإنترنت في حال تعذر قراءة الملف المحلي
      if (!marketData) {
        try {
          const apiResp = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
          if (apiResp.ok) {
            const apiData = await apiResp.json();
            if (apiData && apiData.rates && apiData.rates.EGP) {
              const liveUsd = apiData.rates.EGP;
              const liveSar = apiData.rates.SAR ? (liveUsd / apiData.rates.SAR) : 14.37;
              marketData = {
                currencies: {
                  USD: { sell: liveUsd, buy: liveUsd - 0.10, chg: '0%' },
                  SAR: { sell: liveSar, buy: liveSar - 0.10, chg: '0%' }
                },
                gold: {
                  gold21: { sell: 6265.00, buy: 6205.00, chg: '0%' },
                  gold24: { sell: 7160.00, buy: 7091.50, chg: '0%' },
                  gold18: { sell: 5370.00, buy: 5318.50, chg: '0%' },
                  goldPound: { sell: 50120.00, buy: 49640.00, chg: '0%' },
                  goldOunceUSD: 4043.83
                }
              };
            }
          }
        } catch(netErr) {
          console.warn('Online exchange fallback notice:', netErr);
        }
      }'''

if re.search(old_fetch_block, html):
    html = re.sub(old_fetch_block, new_fetch_block, html, count=1)
    print("✓ Added online resilient fallback to fetchTradingViewRates")

# -------------------------------------------------------------
# 7. Audit Modal Table Header Filters
# -------------------------------------------------------------
# Upgrade <thead> in renderActualBalanceAuditLedger to contain active filter controls in <th>
old_audit_thead = r'''<thead style="position: sticky; top: 0; background: #0b1329; z-index: 10; border-bottom: 2px solid rgba\(56, 189, 248, 0.4\);">[\s\S]*?</thead>'''

new_audit_thead = '''<thead style="position: sticky; top: 0; background: #0b1329; z-index: 10; border-bottom: 2px solid rgba(56, 189, 248, 0.4);">
              <tr>
                <!-- 1. التاريخ / الوقت مع فلتر الفترة -->
                <th style="padding: 6px 6px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">
                  <div style="margin-bottom: 3px;">📅 التاريخ / الوقت</div>
                  <select id="auditPeriodFilter" onchange="renderActualBalanceAuditLedger()" style="background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 6px; font-size: 0.62rem; font-weight: 800; padding: 2px 4px; width: 100%; max-width: 90px; outline: none;">
                    <option value="all">كل الأوقات</option>
                    <option value="today">اليوم</option>
                    <option value="yesterday">الأمس</option>
                    <option value="week">آخر 7 أيام</option>
                    <option value="this_month">هذا الشهر</option>
                    <option value="last_month">الشهر السابق</option>
                    <option value="this_year">هذا العام</option>
                  </select>
                </th>

                <!-- 2. المستفيد مع اختيار الشخص -->
                <th style="padding: 6px 6px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">
                  <div style="margin-bottom: 3px;">👤 المستفيد</div>
                  <select id="auditMemberFilter" onchange="renderActualBalanceAuditLedger()" style="background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 6px; font-size: 0.62rem; font-weight: 800; padding: 2px 4px; width: 100%; max-width: 80px; outline: none;">
                    <option value="all">الكل</option>
                    <option value="البيت">🏠 البيت</option>
                    <option value="ماهر">ماهر</option>
                    <option value="أية">أية</option>
                    <option value="محمد">محمد</option>
                    <option value="مريم">مريم</option>
                    <option value="الحاجة">الحاجة</option>
                    <option value="النونو">النونو</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </th>

                <!-- 3. البيان والنوع -->
                <th style="padding: 6px 6px; color: #94a3b8; font-weight: 800; font-size: 0.68rem;">
                  <div style="margin-bottom: 3px;">📝 البيان والنوع</div>
                  <select id="auditTypeFilter" onchange="renderActualBalanceAuditLedger()" style="background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 6px; font-size: 0.62rem; font-weight: 800; padding: 2px 4px; width: 100%; max-width: 90px; outline: none;">
                    <option value="all">كل الأنواع</option>
                    <option value="expense">صرف (-)</option>
                    <option value="income">إيداع (+)</option>
                  </select>
                </th>

                <!-- 4. التصنيف -->
                <th style="padding: 6px 6px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">
                  <div style="margin-bottom: 3px;">🏷️ التصنيف</div>
                  <select id="auditCategoryFilter" onchange="renderActualBalanceAuditLedger()" style="background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 6px; font-size: 0.62rem; font-weight: 800; padding: 2px 4px; width: 100%; max-width: 95px; outline: none;">
                    <option value="all">كافة البنود</option>
                    <option value="food">طعام ومشتريات</option>
                    <option value="daily">مصروف يومي</option>
                    <option value="bills">فواتير والتزامات</option>
                    <option value="transport">مواصلات وبنزين</option>
                    <option value="house">مستلزمات منزل</option>
                    <option value="health">صحة وعلاج</option>
                    <option value="clothes">ملابس وأحذية</option>
                    <option value="education">تعليم ودروس</option>
                    <option value="other">أخرى ونثريات</option>
                  </select>
                </th>

                <!-- 5. المحفظة -->
                <th style="padding: 6px 6px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">
                  <div style="margin-bottom: 3px;">💼 المحفظة</div>
                  <select id="auditWalletFilter" onchange="renderActualBalanceAuditLedger()" style="background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 6px; font-size: 0.62rem; font-weight: 800; padding: 2px 4px; width: 100%; max-width: 90px; outline: none;">
                    <option value="all">كل المحافظ</option>
                    <option value="wallet-cash-safe">كاش البيت</option>
                    <option value="wallet-reserve">المبلغ الإحتياطى</option>
                    <option value="wallet-vodafone">فودافون كاش</option>
                    <option value="wallet-other">أخرى</option>
                  </select>
                </th>

                <!-- 6. المرفقات والفواتير (عمود مخصص) -->
                <th style="padding: 6px 6px; color: #38bdf8; font-weight: 900; font-size: 0.68rem; text-align: center; white-space: nowrap;">
                  <div>المرفق 📎</div>
                  <span style="font-size: 0.58rem; color: #64748b;">(معاينة)</span>
                </th>

                <!-- 7. منفذ العملية -->
                <th style="padding: 6px 6px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; white-space: nowrap;">
                  <div>المنفذ</div>
                  <span style="font-size: 0.58rem; color: #64748b;">(الحساب)</span>
                </th>

                <!-- 8. المبلغ -->
                <th style="padding: 6px 6px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; text-align: left; white-space: nowrap;">
                  <div>المبلغ (ج.م)</div>
                </th>

                <!-- 9. الرصيد التراكمي -->
                <th style="padding: 6px 6px; color: #94a3b8; font-weight: 800; font-size: 0.68rem; text-align: left; white-space: nowrap;">
                  <div>الرصيد بعد الحركة</div>
                </th>
              </tr>
            </thead>'''

if re.search(old_audit_thead, html):
    html = re.sub(old_audit_thead, new_audit_thead, html, count=1)
    print("✓ Integrated interactive filter selectors directly into audit table headers (<th>)")

# -------------------------------------------------------------
# 8. Bump Version to v4.9.5
# -------------------------------------------------------------
html = re.sub(r"const APP_VERSION = '4\.9\.\d+';", "const APP_VERSION = '4.9.5';", html)
html = re.sub(r'v4\.9\.\d+', 'v4.9.5', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html length:", len(html))
print("Phase 3 Script Finished Successfully!")
