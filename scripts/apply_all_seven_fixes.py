import sys
import os
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

INDEX_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
SW_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\sw.js'
VER_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\version.json'

NEW_VERSION = '5.0.4'
NEW_BUILD_ID = 202611081000
NEW_DATE = '2026-11-08T10:00:00+03:00'

print("Reading index.html...")
with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

initial_len = len(content)

# ---------------------------------------------------------------------------
# 1. FIX COMMITMENTS PAGE (Remove unclosed div in panelBillsExpected)
# ---------------------------------------------------------------------------
pattern_bills = r'</div><!-- replaced single submit -->\s*<div style="display:none;"><button type="button">[^<]*</button>\s*</form>'
if re.search(pattern_bills, content):
    content = re.sub(pattern_bills, '</div><!-- replaced single submit -->\n            </form>', content, count=1)
    print("[OK] Fix 1 applied: Unclosed div in panelBillsExpected removed successfully.")
else:
    print("! Warning: unclosed div pattern not found in panelBillsExpected.")

# Also update switchAppPage for 'expected' to guarantee commitments view is active
expected_switch_old = '''      if (pageId === 'expected') {
        if (typeof renderExpectedList === 'function') {
          renderExpectedList();
        }
        if (typeof renderMemberPhotoPickers === 'function') {
          renderMemberPhotoPickers();
        }
      }'''

expected_switch_new = '''      if (pageId === 'expected') {
        if (typeof switchExpectedMainTab === 'function') switchExpectedMainTab('commitments');
        if (typeof switchExpectedTab === 'function') switchExpectedTab('list');
        if (typeof renderExpectedList === 'function') {
          renderExpectedList();
        }
        if (typeof renderMemberPhotoPickers === 'function') {
          renderMemberPhotoPickers();
        }
      }'''

if expected_switch_old in content:
    content = content.replace(expected_switch_old, expected_switch_new, 1)
    print("[OK] Fix 1.2 applied: switchAppPage('expected') switches to commitments list.")
else:
    print("! Warning: expected_switch_old not found.")

# ---------------------------------------------------------------------------
# 2. FIX CURRENCY TOGGLE (Remove duplicate safeEvent & add debounce)
# ---------------------------------------------------------------------------
old_currency_event = "safeEvent('btnToggleCurrency', 'click', toggleCurrency);"
if old_currency_event in content:
    content = content.replace(old_currency_event, "// safeEvent btnToggleCurrency removed to prevent double-click skip (onclick handles it)", 1)
    print("[OK] Fix 2 applied: Duplicate safeEvent for btnToggleCurrency removed.")
else:
    print("! Warning: old_currency_event not found.")

# Add debounce in toggleCurrency function
old_toggle_curr_fn = '''    function toggleCurrency() {
      // دورة العملات الأربعة: جنيه -> دولار -> ريال -> ذهب عيار 21 -> جنيه
      if (state.currency === 'EGP') state.currency = 'USD';
      else if (state.currency === 'USD') state.currency = 'SAR';
      else if (state.currency === 'SAR') state.currency = 'GOLD21';
      else state.currency = 'EGP';'''

new_toggle_curr_fn = '''    let lastCurrencyToggleTime = 0;
    function toggleCurrency() {
      const now = Date.now();
      if (now - lastCurrencyToggleTime < 220) return;
      lastCurrencyToggleTime = now;
      // دورة العملات الأربعة: جنيه -> دولار -> ريال -> ذهب عيار 21 -> جنيه
      if (state.currency === 'EGP') state.currency = 'USD';
      else if (state.currency === 'USD') state.currency = 'SAR';
      else if (state.currency === 'SAR') state.currency = 'GOLD21';
      else state.currency = 'EGP';'''

if old_toggle_curr_fn in content:
    content = content.replace(old_toggle_curr_fn, new_toggle_curr_fn, 1)
    print("[OK] Fix 2.2 applied: toggleCurrency debounce protection added.")
else:
    print("! Warning: old_toggle_curr_fn not found.")

# ---------------------------------------------------------------------------
# 3. FIX LIGHTBOX MODAL Z-INDEX (Must be > 10500 so it appears over audit modal)
# ---------------------------------------------------------------------------
old_lightbox_tag = '<div class="modal-overlay modal-overlay-custom" id="receiptLightboxModal">'
new_lightbox_tag = '<div class="modal-overlay modal-overlay-custom" id="receiptLightboxModal" style="z-index: 120000 !important;">'

if old_lightbox_tag in content:
    content = content.replace(old_lightbox_tag, new_lightbox_tag, 1)
    print("[OK] Fix 3 applied: receiptLightboxModal z-index set to 120000.")
else:
    print("! Warning: old_lightbox_tag not found.")

# ---------------------------------------------------------------------------
# 4. FIX OPERATIONS CATEGORY DROPDOWN (Add income categories)
# ---------------------------------------------------------------------------
old_ops_cat_dropdown = '''              <select id="opsFilterCategory" class="form-input-custom" onchange="filterOperationsList()" style="width: 100%; height: 36px; padding: 4px 8px; font-size: 0.78rem; font-weight: 800; border-radius: 10px;">
                <option value="all">📁 كافة أنواع وبنود المصروفات</option>
                <option value="food">🛒 طعام ومشتريات</option>
                <option value="daily">☕ مصروف يومي</option>
                <option value="bills">⚡ فواتير والتزامات</option>
                <option value="transport">🚗 مواصلات وبنزين</option>
                <option value="house">🛋️ مستلزمات منزل</option>
                <option value="health">💊 صحة وعلاج</option>
                <option value="clothes">👔 ملابس وأحذية</option>
                <option value="education">🎓 تعليم ودروس</option>
                <option value="other">🎁 أخرى ونثريات</option>
              </select>'''

new_ops_cat_dropdown = '''              <select id="opsFilterCategory" class="form-input-custom" onchange="filterOperationsList()" style="width: 100%; height: 36px; padding: 4px 8px; font-size: 0.78rem; font-weight: 800; border-radius: 10px;">
                <option value="all">📁 كافة البنود (المصروفات والدخل)</option>
                <optgroup label="── بنود المصروفات ──">
                  <option value="food">🛒 طعام ومشتريات</option>
                  <option value="daily">☕ مصروف يومي</option>
                  <option value="bills">⚡ فواتير والتزامات</option>
                  <option value="transport">🚗 مواصلات وبنزين</option>
                  <option value="house">🛋️ مستلزمات منزل</option>
                  <option value="health">💊 صحة وعلاج</option>
                  <option value="clothes">👔 ملابس وأحذية</option>
                  <option value="education">🎓 تعليم ودروس</option>
                  <option value="other">🎁 أخرى ونثريات</option>
                </optgroup>
                <optgroup label="── بنود الدخل والإيرادات ──">
                  <option value="salary">💵 راتب شهري</option>
                  <option value="bonus">🎁 مكافآت وحوافز</option>
                  <option value="invest">📈 أرباح واستثمارات</option>
                  <option value="business">💼 أعمال وتجارة</option>
                  <option value="other_inc">➕ دخل إضافي آخر</option>
                </optgroup>
              </select>'''

if old_ops_cat_dropdown in content:
    content = content.replace(old_ops_cat_dropdown, new_ops_cat_dropdown, 1)
    print("[OK] Fix 4 applied: opsFilterCategory dropdown enriched with income options.")
else:
    print("! Warning: old_ops_cat_dropdown not found.")

# ---------------------------------------------------------------------------
# 5. HIGH-SPEED, FILTER-ACCURATE OPERATIONS RENDERING ENGINE
# ---------------------------------------------------------------------------
old_ops_block_match = re.search(r'function renderOperationsList\(filtered,\s*appendMore\s*=\s*false\)\s*\{[\s\S]*?function filterOperationsList\(\)\s*\{[\s\S]*?renderOperationsList\(state\.transactions \|\| \[\]\);\s*\}', content)

new_ops_block = '''function renderOperationsList(filtered, appendMore = false) {
      const container = document.getElementById('txOperationsList');
      if (!container) return;

      if (!appendMore) {
        opsRenderLimit = 40;
      }

      // 1. مصدر الحركات الأساسي
      let list = (filtered && Array.isArray(filtered) && filtered.length > 0) 
        ? [...filtered] 
        : [...(state.transactions || [])];

      // 2. تطبيق فلترة الفترة الزمنية بدقة تامة (اليوم / الأسبوع / الشهر / الكل / مخصص)
      const p = state.period || 'month';
      const now = new Date();
      const todayStr = getLocalDateStr(now);

      if (p === 'day' || p === 'today') {
        list = list.filter(t => t.date === todayStr);
      } else if (p === 'week') {
        const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const sevenDaysAgoStr = getLocalDateStr(sevenDaysAgo);
        list = list.filter(t => t.date && t.date >= sevenDaysAgoStr && t.date <= todayStr);
      } else if (p === 'month') {
        const curYearMonth = todayStr.slice(0, 7);
        list = list.filter(t => t.date && t.date.startsWith(curYearMonth));
      } else if (p === 'custom' && state.customDateRange) {
        const { from, to } = state.customDateRange;
        if (from && to) {
          list = list.filter(t => t.date && t.date >= from && t.date <= to);
        } else if (from) {
          list = list.filter(t => t.date && t.date >= from);
        } else if (to) {
          list = list.filter(t => t.date && t.date <= to);
        }
      }

      // 3. تطبيق تصفية النوع على العمليات (المصروفات / الدخل / الكل)
      if (opsTypeFilterState === 'expense') {
        list = list.filter(t => t.type === 'expense');
      } else if (opsTypeFilterState === 'income') {
        list = list.filter(t => t.type === 'income');
      }

      // 4. تطبيق فلترة التصنيف في صفحة العمليات (Category Filter)
      const catFilter = document.getElementById('opsFilterCategory')?.value || 'all';
      if (catFilter && catFilter !== 'all') {
        list = list.filter(t => {
          const c = (t.category || '').toLowerCase();
          if (catFilter === 'food') return c === 'food' || c === 'supermarket';
          if (catFilter === 'daily') return c === 'daily' || c === 'cafe';
          if (catFilter === 'bills') return c === 'bills' || c === 'utilities';
          if (catFilter === 'transport') return c === 'transport' || c === 'fuel';
          if (catFilter === 'house') return c === 'house' || c === 'home';
          if (catFilter === 'health') return c === 'health' || c === 'medical' || c === 'pharmacy';
          if (catFilter === 'clothes') return c === 'clothes' || c === 'shopping';
          if (catFilter === 'education') return c === 'education' || c === 'school';
          if (catFilter === 'other') return c === 'other' || c === 'others' || c === 'gifts';
          // بنود الدخل
          if (catFilter === 'salary') return c === 'salary';
          if (catFilter === 'bonus') return c === 'bonus';
          if (catFilter === 'invest') return c === 'invest';
          if (catFilter === 'business') return c === 'business';
          if (catFilter === 'other_inc') return c === 'other_inc' || c === 'income';
          return c === catFilter;
        });
      }

      // 5. تطبيق فلترة العضو في صفحة العمليات (Member Filter)
      let memFilter = document.getElementById('opsFilterMember')?.value || 'all';
      if (memFilter === 'all' && state.currentMemberFilter && state.currentMemberFilter !== 'الكل') {
        memFilter = state.currentMemberFilter;
      }
      if (memFilter && memFilter !== 'all') {
        list = list.filter(t => {
          const m = t.member || 'البيت';
          if (memFilter === 'البيت') return m === 'البيت' || m === 'العائلة' || !t.member;
          if (memFilter === 'آية' || memFilter === 'أية') return m === 'آية' || m === 'أية';
          return m === memFilter;
        });
      }

      // 6. تطبيق نص البحث إذا وجد
      const searchInp = document.getElementById('opsSearchInput');
      const q = searchInp ? searchInp.value.trim().toLowerCase() : '';
      if (q) {
        list = list.filter(t => {
          const l = (t.label || '').toLowerCase();
          const c = (t.category || '').toLowerCase();
          const cName = (typeof getCategoryName === 'function' ? (getCategoryName(t.category, t.type) || '') : '').toLowerCase();
          const m = (t.member || '').toLowerCase();
          const a = String(t.amount || '');
          const w = (typeof getWalletName === 'function' ? getWalletName(t.walletId) : '').toLowerCase();
          const d = (t.date || '').toLowerCase();
          return l.includes(q) || c.includes(q) || cName.includes(q) || m.includes(q) || a.includes(q) || w.includes(q) || d.includes(q);
        });
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 30px 10px; text-align: center;">
            <i class="fa-solid fa-receipt" style="color: #64748b; font-size: 2.2rem; margin-bottom: 10px;"></i>
            <div class="empty-title" style="color: #cbd5e1; font-weight: 800; font-size: 0.95rem;">لا توجد عمليات مطابقة للفترة أو الفلاتر</div>
            <div class="empty-desc" style="color: #64748b; font-size: 0.8rem; margin-top: 4px;">جرّب اختيار فترة زمنية أخرى (الشهر / الكل) أو إعادة ضبط الفلاتر</div>
          </div>
        `;
        return;
      }

      const totalCount = list.length;
      const todayIso = getLocalDateStr(new Date());
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayIso = getLocalDateStr(yesterdayDate);

      // ترتيب الحركات تنازلياً حسب التاريخ والوقت
      list.sort((a, b) => {
        const da = (a.date || '') + ' ' + (a.time || '');
        const db = (b.date || '') + ' ' + (b.time || '');
        return db.localeCompare(da);
      });

      // تجميع العمليات بحسب التاريخ
      const groupedByDate = {};
      const itemsToRender = list.slice(0, opsRenderLimit);

      itemsToRender.forEach(tx => {
        const d = tx.date || todayIso;
        if (!groupedByDate[d]) groupedByDate[d] = [];
        groupedByDate[d].push(tx);
      });

      // بناء مخرجات البطاقات ككتلة HTML موحدة وسريعة جداً (Single Batch DOM Update)
      let cardsHtml = '';
      for (const [dateStr, txs] of Object.entries(groupedByDate)) {
        let groupTitle = dateStr;
        if (dateStr === todayIso) groupTitle = 'اليوم (Today) - ' + dateStr;
        else if (dateStr === yesterdayIso) groupTitle = 'الأمس (Yesterday) - ' + dateStr;

        let dayExpSum = 0, dayIncSum = 0;
        txs.forEach(t => {
          const amt = Number(t.amount) || 0;
          if (t.type === 'expense') dayExpSum += amt;
          else dayIncSum += amt;
        });

        let subtotalBadge = '';
        if (dayExpSum > 0 && dayIncSum > 0) {
          subtotalBadge = `${formatMoneyWithSignHtml(dayExpSum, '-', 'ops-date-subtotal exp')} ${formatMoneyWithSignHtml(dayIncSum, '+', 'ops-date-subtotal inc')}`;
        } else if (dayExpSum > 0) {
          subtotalBadge = `<span style="font-size: 0.70rem; color: #94a3b8; margin-left: 3px;">إجمالي المنصرف:</span> ${formatMoneyWithSignHtml(dayExpSum, '-', 'ops-date-subtotal exp')}`;
        } else {
          subtotalBadge = `<span style="font-size: 0.70rem; color: #94a3b8; margin-left: 3px;">إجمالي الدخل:</span> ${formatMoneyWithSignHtml(dayIncSum, '+', 'ops-date-subtotal inc')}`;
        }

        cardsHtml += `
          <div class="ops-date-group-header">
            <div class="ops-date-title"><i class="fa-regular fa-calendar"></i> ${groupTitle}</div>
            <div>${subtotalBadge}</div>
          </div>
        `;

        // كروت الحركات
        txs.forEach(tx => {
          const cat = getCategoryObj(tx.category, tx.type);
          const isExp = tx.type === 'expense';
          const amt = Number(tx.amount) || 0;
          const sign = isExp ? '- ' : '+ ';
          const memberAvatar = MEMBER_AVATARS[tx.member] || null;

          let avatarHtml = memberAvatar
            ? `<img src="${memberAvatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">`
            : `<i class="fa-solid fa-user" style="font-size: 0.7rem; color: #38bdf8;"></i>`;

          let receiptBadge = '';
          if (tx.receipt) {
            receiptBadge = `
              <span class="ops-tx-chip" onclick="event.stopPropagation(); openReceiptLightbox('${tx.receipt}', 'فاتورة: ${escapeHtml(tx.label || cat.name)}')" style="background: rgba(236, 72, 153, 0.18); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.35); cursor: pointer;" title="عرض الفاتورة المرفقة">
                <i class="fa-solid fa-file-invoice"></i> فاتورة
              </span>
            `;
          }

          let typePill = !isExp ? `
            <span class="ops-tx-chip" style="background: rgba(16, 185, 129, 0.18); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); font-weight: 800;">
              <i class="fa-solid fa-arrow-down-left"></i> إيداع ودخل
            </span>
          ` : '';

          cardsHtml += `
            <div class="ops-tx-card-lux" data-tx-id="${tx.id}" ondblclick="openEditTxModal('${tx.id}')" title="اضغط مرتين لعرض التفاصيل والتعديل">
              <div class="ops-tx-right-cluster">
                <div class="ops-tx-icon-bubble" style="background: linear-gradient(135deg, ${cat.color || '#38bdf8'}, ${(cat.color || '#38bdf8')}99); color: #ffffff;">
                  <i class="fa-solid ${cat.icon || 'fa-receipt'}"></i>
                </div>
                <div class="ops-tx-info-block">
                  <div class="ops-tx-label-text" title="${escapeHtml(tx.label || cat.name)}">
                    ${escapeHtml(tx.label || cat.name)}
                  </div>
                  <div class="ops-tx-meta-chips">
                    <span class="ops-tx-chip" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25);">
                      ${avatarHtml}
                      <span>${tx.member || 'العائلة'}</span>
                    </span>
                    <span class="ops-tx-chip" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25);">
                      <i class="fa-solid fa-vault"></i>
                      <span>${getWalletName(tx.walletId)}</span>
                    </span>
                    ${typePill}
                    ${receiptBadge}
                  </div>
                </div>
              </div>
              <div class="ops-tx-left-cluster">
                ${formatMoneyWithSignHtml(amt, sign, 'ops-tx-amount-text')}
                <button class="ops-tx-edit-btn" onclick="openEditTxModal('${tx.id}')" title="تعديل وتفاصيل الحركة" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 4px; transition: all 0.2s;">
                  <i class="fa-solid fa-pen-to-square" style="font-size: 0.76rem;"></i>
                </button>
                <button class="ops-tx-del-btn" onclick="deleteTx('${tx.id}')" title="حذف الحركة">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          `;
        });
      }

      // زر عرض المزيد إن وجد حركات إضافية
      if (totalCount > opsRenderLimit) {
        const remaining = totalCount - opsRenderLimit;
        cardsHtml += `
          <div id="btnLoadMoreOps" style="text-align: center; margin: 16px 0 24px;">
            <button type="button" class="btn-export-tool" onclick="loadMoreOperations()" style="padding: 10px 24px; font-size: 0.82rem; font-weight: 800; background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
              <i class="fa-solid fa-angles-down"></i> عرض 40 حركة إضافية (المتبقي: ${remaining.toLocaleString()} عملية)
            </button>
          </div>
        `;
      }

      container.innerHTML = cardsHtml;
    }

    function loadMoreOperations() {
      opsRenderLimit = (opsRenderLimit || 40) + 40;
      renderOperationsList(null, true);
    }

    function filterOperationsList() {
      const inp = document.getElementById('opsSearchInput');
      state.searchQuery = inp ? inp.value.trim() : '';
      renderOperationsList(state.transactions || []);
    }'''

if old_ops_block_match:
    content = content[:old_ops_block_match.start()] + new_ops_block + content[old_ops_block_match.end():]
    print("[OK] Fix 5 applied: renderOperationsList and filterOperationsList replaced with high-speed filter-accurate engine.")
else:
    print("! Error: Could not regex-match old renderOperationsList block.")

# ---------------------------------------------------------------------------
# 6. STANDALONE FULL-SCREEN TASKS MODAL (#tasksFullScreenModal)
# ---------------------------------------------------------------------------
# Update home screen button #btnOpenTasksDrawer to call openTasksFullScreenModal()
old_btn_tasks = 'id="btnOpenTasksDrawer" onclick="openSummaryDrawer(\'tasks\')"'
new_btn_tasks = 'id="btnOpenTasksDrawer" onclick="openTasksFullScreenModal()"'
if old_btn_tasks in content:
    content = content.replace(old_btn_tasks, new_btn_tasks, 1)
    print("[OK] Fix 6.1 applied: Home button opens openTasksFullScreenModal().")
else:
    print("! Warning: old_btn_tasks not found.")

# Add tasksFullScreenModal HTML
tasks_fullscreen_html = '''
  <!-- =========================================================================
       شاشة المهام الكاملة المنفصلة (Full-Screen Dedicated Tasks & To-Do Workspace)
       تفتح بعرض وارتفاع الشاشة بالكامل عند الضغط على زر المهام من الشاشة الرئيسية
       ========================================================================= -->
  <div id="tasksFullScreenModal" style="display: none; position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 100050; background: var(--bg-main, #0b1329); overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 0; margin: 0; box-sizing: border-box; direction: rtl;" dir="rtl">
    
    <!-- شريط علوي زجاجي مثبت للشاشة الكاملة -->
    <header style="position: sticky; top: 0; z-index: 100; background: rgba(11, 19, 41, 0.95); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1.2px solid rgba(168, 85, 247, 0.35); padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
      <div style="display: flex; align-items: center; gap: 12px;">
        <button type="button" onclick="closeTasksFullScreenModal()" style="height: 38px; padding: 0 14px; border-radius: 10px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.18); color: #cbd5e1; font-size: 0.82rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s ease;">
          <i class="fa-solid fa-arrow-right"></i>
          <span>الرئيسية</span>
        </button>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, #a855f7, #6366f1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.15rem; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.35);">
            <i class="fa-solid fa-list-check"></i>
          </div>
          <div>
            <div style="font-size: 1.02rem; font-weight: 900; color: #f8fafc;">إدارة المهام والخطوات الذكية</div>
            <div style="font-size: 0.70rem; color: #c084fc; font-weight: 700;">مهام عيلة ماهر ❤️ أية ومتابعة الإنجاز والمسؤوليات</div>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" onclick="openNewTaskDrawerModal()" style="height: 40px; padding: 0 18px; border-radius: 12px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.85rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 16px rgba(168, 85, 247, 0.45); transition: transform 0.12s ease;">
          <i class="fa-solid fa-circle-plus" style="font-size: 1.1rem;"></i>
          <span>+ مهمة جديدة</span>
        </button>
      </div>
    </header>

    <!-- المحتوى الداخلي بمساحة رحبة ومركزية متجاوبة -->
    <main style="max-width: 920px; margin: 0 auto; padding: 18px 16px 80px; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- شريط مؤشرات إنجاز المهام الذكي (KPIs & Metrics) -->
      <div class="task-kpi-strip" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('all')" style="cursor: pointer; background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(56, 189, 248, 0.35); border-radius: 14px; padding: 12px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3);" title="عرض كافة المهام">
          <span class="task-kpi-num" id="kpiTasksTotalFull" style="color: #38bdf8; font-size: 1.35rem; font-weight: 900; display: block; font-family: var(--font-numbers);">0</span>
          <span class="task-kpi-label" style="font-size: 0.72rem; color: #94a3b8; font-weight: 800;">إجمالي المهام</span>
        </div>
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('my_day')" style="cursor: pointer; background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(192, 132, 252, 0.35); border-radius: 14px; padding: 12px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3);" title="عرض مهام اليوم">
          <span class="task-kpi-num" id="kpiTasksActiveFull" style="color: #c084fc; font-size: 1.35rem; font-weight: 900; display: block; font-family: var(--font-numbers);">0</span>
          <span class="task-kpi-label" style="font-size: 0.72rem; color: #94a3b8; font-weight: 800;">قيد التنفيذ</span>
        </div>
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('overdue')" style="cursor: pointer; background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(239, 68, 68, 0.35); border-radius: 14px; padding: 12px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3);" title="عرض المهام المتأخرة">
          <span class="task-kpi-num" id="kpiTasksOverdueFull" style="color: #ef4444; font-size: 1.35rem; font-weight: 900; display: block; font-family: var(--font-numbers);">0</span>
          <span class="task-kpi-label" style="font-size: 0.72rem; color: #94a3b8; font-weight: 800;">متأخرة ⚠️</span>
        </div>
        <div class="task-kpi-card" onclick="switchDrawerTodoSection('completed')" style="cursor: pointer; background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(52, 211, 153, 0.35); border-radius: 14px; padding: 12px; text-align: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3);" title="عرض المهام المكتملة">
          <span class="task-kpi-num" id="kpiTasksDoneFull" style="color: #34d399; font-size: 1.35rem; font-weight: 900; display: block; font-family: var(--font-numbers);">0</span>
          <span class="task-kpi-label" style="font-size: 0.72rem; color: #94a3b8; font-weight: 800;">مكتملة ✅</span>
        </div>
      </div>

      <!-- شريط نسبة الإنجاز التراكمي للمهام -->
      <div style="background: rgba(15, 23, 42, 0.85); border-radius: 14px; padding: 12px 16px; border: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-chart-line" style="color: #a855f7; font-size: 1.05rem;"></i>
          <span style="font-size: 0.78rem; font-weight: 800; color: #cbd5e1;">معدل إنجاز المهام التراكمي:</span>
        </div>
        <div style="flex: 1; max-width: 320px; height: 9px; background: rgba(30, 41, 59, 0.9); border-radius: 6px; overflow: hidden;">
          <div id="tasksOverallProgressBarFull" style="width: 0%; height: 100%; background: linear-gradient(90deg, #a855f7, #10b981); transition: width 0.4s ease;"></div>
        </div>
        <span id="tasksOverallProgressPctFull" style="font-size: 0.88rem; font-weight: 900; color: #10b981; font-family: var(--font-numbers);">0%</span>
      </div>

      <!-- تبويبات أقسام المهام الستة: يومي / هام / مخطط / متأخرة / الكل / المكتملة -->
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
        <button type="button" class="exp-tab-btn active" id="btnFullTodoMyDay" onclick="switchDrawerTodoSection('my_day')" style="padding: 10px 4px; border-radius: 12px; font-weight: 800; font-size: 0.78rem; background: rgba(168, 85, 247, 0.25); color: #c084fc; border: 1.2px solid rgba(168, 85, 247, 0.45); cursor: pointer; text-align: center;">يومي</button>
        <button type="button" class="exp-tab-btn" id="btnFullTodoImportant" onclick="switchDrawerTodoSection('important')" style="padding: 10px 4px; border-radius: 12px; font-weight: 800; font-size: 0.78rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">هام ⭐</button>
        <button type="button" class="exp-tab-btn" id="btnFullTodoPlanned" onclick="switchDrawerTodoSection('planned')" style="padding: 10px 4px; border-radius: 12px; font-weight: 800; font-size: 0.78rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">مخطط</button>
        <button type="button" class="exp-tab-btn" id="btnFullTodoOverdue" onclick="switchDrawerTodoSection('overdue')" style="padding: 10px 4px; border-radius: 12px; font-weight: 800; font-size: 0.78rem; background: transparent; color: #ef4444; border: 1px solid rgba(239,68,68,0.25); cursor: pointer; text-align: center;">متأخرة ⚠️</button>
        <button type="button" class="exp-tab-btn" id="btnFullTodoAll" onclick="switchDrawerTodoSection('all')" style="padding: 10px 4px; border-radius: 12px; font-weight: 800; font-size: 0.78rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">الكل</button>
        <button type="button" class="exp-tab-btn" id="btnFullTodoCompleted" onclick="switchDrawerTodoSection('completed')" style="padding: 10px 4px; border-radius: 12px; font-weight: 800; font-size: 0.78rem; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-align: center;">المكتملة</button>
      </div>

      <!-- قائمة المهام الكاملة -->
      <div id="tasksFullScreenContainerList" style="display: flex; flex-direction: column; gap: 12px;"></div>
    </main>
  </div>
'''

if 'id="tasksFullScreenModal"' not in content:
    insertion_marker = '<!-- عرض الفاتورة والصور المكبرة (Receipt Lightbox Modal) -->'
    if insertion_marker in content:
        content = content.replace(insertion_marker, tasks_fullscreen_html + '\n' + insertion_marker, 1)
        print("[OK] Fix 6.2 applied: tasksFullScreenModal inserted into HTML.")
    else:
        content = content.replace('</body>', tasks_fullscreen_html + '\n</body>', 1)
        print("[OK] Fix 6.2 applied: tasksFullScreenModal inserted before </body>.")

# Add JS functions openTasksFullScreenModal and closeTasksFullScreenModal, and sync in renderDrawerTasksList
tasks_js_helpers = '''
    function openTasksFullScreenModal() {
      const modal = document.getElementById('tasksFullScreenModal');
      if (modal) {
        modal.style.display = 'block';
        if (typeof pushModalState === 'function') pushModalState('tasksFullScreenModal');
      }
      renderDrawerTasksList();
    }

    function closeTasksFullScreenModal() {
      const modal = document.getElementById('tasksFullScreenModal');
      if (modal) modal.style.display = 'none';
    }
'''

if 'function openTasksFullScreenModal' not in content:
    content = content.replace('function renderDrawerTasksList() {', tasks_js_helpers + '\n    function renderDrawerTasksList() {', 1)
    print("[OK] Fix 6.3 applied: openTasksFullScreenModal and closeTasksFullScreenModal added.")

# Update renderDrawerTasksList so it populates both containers (#drawerTasksContainerList and #tasksFullScreenContainerList)
old_tasks_sync_line = "container.innerHTML = cardsHtml;"
new_tasks_sync_line = '''container.innerHTML = cardsHtml;
      const fullContainer = document.getElementById('tasksFullScreenContainerList');
      if (fullContainer) {
        fullContainer.innerHTML = cardsHtml;
      }
      // تحديث شارات ونسبة الشاشة الكاملة
      const kpiTotF = document.getElementById('kpiTasksTotalFull');
      const kpiActF = document.getElementById('kpiTasksActiveFull');
      const kpiOvdF = document.getElementById('kpiTasksOverdueFull');
      const kpiDonF = document.getElementById('kpiTasksDoneFull');
      const barF = document.getElementById('tasksOverallProgressBarFull');
      const pctF = document.getElementById('tasksOverallProgressPctFull');
      if (kpiTotF) kpiTotF.textContent = totalCount;
      if (kpiActF) kpiActF.textContent = activeCount;
      if (kpiOvdF) kpiOvdF.textContent = overdueCount;
      if (kpiDonF) kpiDonF.textContent = doneCount;
      if (barF) barF.style.width = `${completionRate}%`;
      if (pctF) pctF.textContent = `${completionRate}%`;'''

if old_tasks_sync_line in content:
    content = content.replace(old_tasks_sync_line, new_tasks_sync_line, 1)
    print("[OK] Fix 6.4 applied: renderDrawerTasksList syncs full-screen container & KPIs.")

# Also update switchDrawerTodoSection so it updates tab buttons on both views
old_switch_section_tabs = '''      const tabIds = {
        'my_day': 'btnDrawerTodoMyDay',
        'important': 'btnDrawerTodoImportant',
        'planned': 'btnDrawerTodoPlanned',
        'overdue': 'btnDrawerTodoOverdue',
        'all': 'btnDrawerTodoAll',
        'completed': 'btnDrawerTodoCompleted'
      };
      Object.values(tabIds).forEach(id => {
        const b = document.getElementById(id);
        if (b) {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = '#94a3b8';
          b.style.borderColor = 'rgba(255,255,255,0.1)';
        }
      });'''

new_switch_section_tabs = '''      const tabIds = {
        'my_day': 'btnDrawerTodoMyDay',
        'important': 'btnDrawerTodoImportant',
        'planned': 'btnDrawerTodoPlanned',
        'overdue': 'btnDrawerTodoOverdue',
        'all': 'btnDrawerTodoAll',
        'completed': 'btnDrawerTodoCompleted'
      };
      const fullTabIds = {
        'my_day': 'btnFullTodoMyDay',
        'important': 'btnFullTodoImportant',
        'planned': 'btnFullTodoPlanned',
        'overdue': 'btnFullTodoOverdue',
        'all': 'btnFullTodoAll',
        'completed': 'btnFullTodoCompleted'
      };
      [...Object.values(tabIds), ...Object.values(fullTabIds)].forEach(id => {
        const b = document.getElementById(id);
        if (b) {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = '#94a3b8';
          b.style.borderColor = 'rgba(255,255,255,0.1)';
        }
      });
      const activeFullBtn = document.getElementById(fullTabIds[section]);
      if (activeFullBtn) {
        activeFullBtn.classList.add('active');
        activeFullBtn.style.background = 'rgba(168, 85, 247, 0.25)';
        activeFullBtn.style.color = '#c084fc';
        activeFullBtn.style.borderColor = 'rgba(168, 85, 247, 0.45)';
      }'''

if old_switch_section_tabs in content:
    content = content.replace(old_switch_section_tabs, new_switch_section_tabs, 1)
    print("[OK] Fix 6.5 applied: switchDrawerTodoSection syncs full-screen tabs.")

# ---------------------------------------------------------------------------
# 7. UPGRADE ACTUAL BALANCE AUDIT (Multi-select, Currency to Left, Lightbox)
# ---------------------------------------------------------------------------
# Replace amounts formatting in audit table rows to strictly enforce currency on the left
old_audit_row_amt = '''            <!-- المبلغ بتنسيق محاسبي دقيق -->
            <td style="padding: 9px 10px; white-space: nowrap; text-align: left; direction: ltr;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-weight: 900; font-size: 0.78rem; color: ${amtColor}; background: ${amtBg};">
                ${amtSign}${formatMoney(amt)}
              </span>
            </td>

            <!-- الرصيد التراكمي بعد الحركة -->
            <td style="padding: 9px 10px; white-space: nowrap; text-align: left; direction: ltr; font-size: 0.76rem; font-weight: 900; color: #e2e8f0; font-family: 'Courier New', monospace;">
              ${tx.runningBalAfter >= 0 ? '+' : '-'}${formatMoney(Math.abs(tx.runningBalAfter))}
            </td>'''

new_audit_row_amt = '''            <!-- المبلغ بتنسيق محاسبي دقيق مع رمز العملة يسار الرقم -->
            <td style="padding: 9px 10px; white-space: nowrap; text-align: center;">
              ${formatMoneyWithSignHtml(amt, isExp ? '-' : '+', 'audit-amount-val')}
            </td>

            <!-- الرصيد التراكمي بعد الحركة مع رمز العملة يسار الرقم -->
            <td style="padding: 9px 10px; white-space: nowrap; text-align: center;">
              ${formatMoneyWithSignHtml(Math.abs(tx.runningBalAfter), tx.runningBalAfter >= 0 ? '+' : '-', 'audit-running-bal-val')}
            </td>'''

if old_audit_row_amt in content:
    content = content.replace(old_audit_row_amt, new_audit_row_amt, 1)
    print("[OK] Fix 7.1 applied: Currency symbol placed strictly on left in audit table rows.")
else:
    print("! Warning: old_audit_row_amt not found.")

# Update audit KPI cards to use formatMoneyWithSignHtml so currency is on the left
old_audit_metrics_fn = '''      if (elInc) elInc.textContent = `+ ${formatMoney(totalInc)}`;
      if (elExp) elExp.textContent = `- ${formatMoney(totalExp)}`;
      if (elNet) elNet.textContent = `${netFlow >= 0 ? '+' : '-'}${formatMoney(Math.abs(netFlow))}`;
      if (elAct) elAct.textContent = `${actualBal >= 0 ? '+' : '-'}${formatMoney(Math.abs(actualBal))}`;'''

new_audit_metrics_fn = '''      if (elInc) elInc.innerHTML = formatMoneyWithSignHtml(totalInc, '+', 'audit-metric-cluster');
      if (elExp) elExp.innerHTML = formatMoneyWithSignHtml(totalExp, '-', 'audit-metric-cluster');
      if (elNet) elNet.innerHTML = formatMoneyWithSignHtml(Math.abs(netFlow), netFlow >= 0 ? '+' : '-', 'audit-metric-cluster');
      if (elAct) elAct.innerHTML = formatMoneyWithSignHtml(Math.abs(actualBal), actualBal >= 0 ? '+' : '-', 'audit-metric-cluster');'''

if old_audit_metrics_fn in content:
    content = content.replace(old_audit_metrics_fn, new_audit_metrics_fn, 1)
    print("[OK] Fix 7.2 applied: Audit summary KPI metrics format with currency on left.")
else:
    print("! Warning: old_audit_metrics_fn not found.")

# Implement Multi-Select in Actual Balance Audit
multi_select_logic_old = '''    function quickFilterAuditWallet(walletId) {
      const walSelect = document.getElementById('auditWalletFilter');
      if (!walSelect) return;

      if (walSelect.value === walletId) {
        walSelect.value = 'all';
      } else {
        walSelect.value = walletId;
      }

      renderAuditWalletsCards();
      renderActualBalanceAuditLedger();
    }'''

multi_select_logic_new = '''    let auditSelectedWallets = new Set();
    let auditSelectedCategories = new Set();
    let auditSelectedPeriods = new Set();

    function quickFilterAuditWallet(walletId) {
      if (auditSelectedWallets.has(walletId)) {
        auditSelectedWallets.delete(walletId);
      } else {
        auditSelectedWallets.add(walletId);
      }
      renderAuditWalletsCards();
      renderActualBalanceAuditLedger();
    }

    function toggleAuditCategoryFilter(catId) {
      if (catId === 'all') {
        auditSelectedCategories.clear();
      } else {
        if (auditSelectedCategories.has(catId)) {
          auditSelectedCategories.delete(catId);
        } else {
          auditSelectedCategories.add(catId);
        }
      }
      renderActualBalanceAuditLedger();
    }

    function toggleAuditPeriodFilter(periodId) {
      if (periodId === 'all') {
        auditSelectedPeriods.clear();
      } else {
        if (auditSelectedPeriods.has(periodId)) {
          auditSelectedPeriods.delete(periodId);
        } else {
          auditSelectedPeriods.add(periodId);
        }
      }
      renderActualBalanceAuditLedger();
    }'''

if multi_select_logic_old in content:
    content = content.replace(multi_select_logic_old, multi_select_logic_new, 1)
    print("[OK] Fix 7.3 applied: Multi-select wallet, category, and period filter helpers added.")
else:
    print("! Warning: multi_select_logic_old not found.")

# Update renderAuditWalletsCards to reflect multi-selected wallets
old_wal_render_selected = '''        const isSelected = selectedWalletId === w.id;'''
new_wal_render_selected = '''        const isSelected = auditSelectedWallets.has(w.id) || (selectedWalletId === w.id && auditSelectedWallets.size === 0);'''
if old_wal_render_selected in content:
    content = content.replace(old_wal_render_selected, new_wal_render_selected, 1)
    print("[OK] Fix 7.4 applied: Wallet cards reflect multi-select state.")

# Update renderActualBalanceAuditLedger filtering to support multi-select sets
old_audit_filter_check = '''        // 4. فلتر البند / التصنيف
        if (catVal !== 'all' && tx.category !== catVal) {
          return false;
        }

        // 5. فلتر المحفظة
        if (walletVal !== 'all') {
          const inWallet = tx.walletId === walletVal || (!tx.walletId && walletVal === 'wallet-cash-safe') || tx.toWalletId === walletVal || tx.fromWalletId === walletVal;
          if (!inWallet) return false;
        }'''

new_audit_filter_check = '''        // 4. فلتر البند / التصنيف مع دعم الاختيار المتعدد (Multi-Select)
        if (auditSelectedCategories.size > 0) {
          if (!auditSelectedCategories.has(tx.category)) return false;
        } else if (catVal !== 'all' && tx.category !== catVal) {
          return false;
        }

        // 5. فلتر المحفظة مع دعم الاختيار المتعدد (Multi-Select)
        if (auditSelectedWallets.size > 0) {
          const inAny = auditSelectedWallets.has(tx.walletId) || 
                        (!tx.walletId && auditSelectedWallets.has('wallet-cash-safe')) ||
                        auditSelectedWallets.has(tx.toWalletId) ||
                        auditSelectedWallets.has(tx.fromWalletId);
          if (!inAny) return false;
        } else if (walletVal !== 'all') {
          const inWallet = tx.walletId === walletVal || (!tx.walletId && walletVal === 'wallet-cash-safe') || tx.toWalletId === walletVal || tx.fromWalletId === walletVal;
          if (!inWallet) return false;
        }

        // 6. فلتر الفترات المتعددة إن تم تحديد أكثر من فترة
        if (auditSelectedPeriods.size > 0) {
          let matchPeriod = false;
          if (auditSelectedPeriods.has('today') && txDate === todayStr) matchPeriod = true;
          if (auditSelectedPeriods.has('yesterday') && txDate === yesterdayStr) matchPeriod = true;
          if (auditSelectedPeriods.has('week') && txDate >= weekAgoStr) matchPeriod = true;
          if (auditSelectedPeriods.has('this_month') && txDate.startsWith(thisMonthPrefix)) matchPeriod = true;
          if (auditSelectedPeriods.has('last_month') && txDate.startsWith(lastMonthPrefix)) matchPeriod = true;
          if (auditSelectedPeriods.has('last_30_days') && txDate >= thirtyDaysAgoStr) matchPeriod = true;
          if (auditSelectedPeriods.has('this_year') && txDate.startsWith(thisYearPrefix)) matchPeriod = true;
          if (!matchPeriod) return false;
        }'''

if old_audit_filter_check in content:
    content = content.replace(old_audit_filter_check, new_audit_filter_check, 1)
    print("[OK] Fix 7.5 applied: Ledger filtering supports multi-select wallets, categories, and periods.")
else:
    print("! Warning: old_audit_filter_check not found.")

# Update resetAuditFilters to clear multi-select sets
old_reset_filters = '''    function resetAuditFilters() {
      const sInput = document.getElementById('auditSearchInput');
      if (sInput) sInput.value = '';'''

new_reset_filters = '''    function resetAuditFilters() {
      if (typeof auditSelectedWallets !== 'undefined') auditSelectedWallets.clear();
      if (typeof auditSelectedCategories !== 'undefined') auditSelectedCategories.clear();
      if (typeof auditSelectedPeriods !== 'undefined') auditSelectedPeriods.clear();
      const sInput = document.getElementById('auditSearchInput');
      if (sInput) sInput.value = '';'''

if old_reset_filters in content:
    content = content.replace(old_reset_filters, new_reset_filters, 1)
    print("[OK] Fix 7.6 applied: resetAuditFilters clears multi-select sets.")

# ---------------------------------------------------------------------------
# 8. BUMP VERSION TO 5.0.4 BUILD 202611081000
# ---------------------------------------------------------------------------
content = re.sub(r'var APP_BUILD_ID\s*=\s*\d+;', f'var APP_BUILD_ID = {NEW_BUILD_ID};', content)
content = re.sub(r'window\.APP_BUILD_ID\s*=\s*\d+;', f'window.APP_BUILD_ID = {NEW_BUILD_ID};', content)
content = re.sub(r'const APP_BUILD_ID\s*=\s*\d+;', f'const APP_BUILD_ID = {NEW_BUILD_ID};', content)
content = re.sub(r'var APP_VERSION\s*=\s*[\'"][^\'"]+[\'"];', f"var APP_VERSION = '{NEW_VERSION}';", content)
content = re.sub(r'window\.APP_VERSION\s*=\s*[\'"][^\'"]+[\'"];', f"window.APP_VERSION = '{NEW_VERSION}';", content)
content = re.sub(r'const APP_VERSION\s*=\s*[\'"][^\'"]+[\'"];', f"const APP_VERSION = '{NEW_VERSION}';", content)

print("Writing updated index.html...")
with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"[OK] index.html updated successfully ({len(content)} bytes).")

# Update sw.js
with open(SW_PATH, 'r', encoding='utf-8') as f:
    sw_content = f.read()

sw_content = re.sub(r'family-expense-tracker-v[0-9.]*-\d*', f'family-expense-tracker-v{NEW_VERSION}-{NEW_BUILD_ID}', sw_content)
with open(SW_PATH, 'w', encoding='utf-8') as f:
    f.write(sw_content)
print(f"[OK] sw.js updated with cache family-expense-tracker-v{NEW_VERSION}-{NEW_BUILD_ID}.")

# Update version.json
ver_json = f'''{{
  "version": "{NEW_VERSION}",
  "buildId": {NEW_BUILD_ID},
  "updatedAt": "{NEW_DATE}",
  "releaseNotes": "إصلاح جذري لصفحة الالتزامات والفواتير، تسريع صفحة العمليات مع إظهار الدخل وفلاتر التواريخ والأشخاص والبنود، نقل المهام إلى شاشة كاملة متطورة ومستقلة، ترقية شاشة تدقيق الرصيد الفعلي بدعم الاختيار المتعدد وفتح مرفقات الفواتير، وضبط تبديل العملات الرباعي"
}}'''
with open(VER_PATH, 'w', encoding='utf-8') as f:
    f.write(ver_json)
print("[OK] version.json updated successfully.")
