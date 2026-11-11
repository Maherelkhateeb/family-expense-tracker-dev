import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

FILE_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update version v5.2.3 -> v5.2.4
print("1. Updating version to v5.2.4...")
content = content.replace("var APP_VERSION = 'v5.2.3';", "var APP_VERSION = 'v5.2.4';")
content = content.replace("window.APP_VERSION = 'v5.2.3';", "window.APP_VERSION = 'v5.2.4';")
content = content.replace("const APP_VERSION = 'v5.2.3';", "const APP_VERSION = 'v5.2.4';")
content = content.replace("version: 'v5.2.3',", "version: 'v5.2.4',")
content = content.replace("APP_VERSION : 'v5.2.3'", "APP_VERSION : 'v5.2.4'")

# 2. Add CSS styles for ops-view-mode-bar and ops-view-mode-btn
css_target = """    /* أزرار التبديل المقسمة لصفحة العمليات والأرشيف */
    .segmented-tabs-bar {"""

css_replacement = """    /* شريط التبديل بين نمطي عرض العمليات: تجميع باليوم / مجمع */
    .ops-view-mode-bar {
      position: sticky;
      top: 0;
      z-index: 15;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin: 4px 12px 8px;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 4px;
      border-radius: 13px;
      border: 1.2px solid rgba(56, 189, 248, 0.25);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    }
    .ops-view-mode-btn {
      height: 36px;
      border: 1.5px solid transparent;
      border-radius: 9px;
      background: transparent;
      color: #94a3b8;
      font-weight: 850;
      font-size: 0.80rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }
    .ops-view-mode-btn:hover {
      color: #f1f5f9;
      background: rgba(255, 255, 255, 0.05);
    }
    .ops-view-mode-btn.active {
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.38), rgba(56, 189, 248, 0.22)) !important;
      color: #ffffff !important;
      border-color: #38bdf8 !important;
      box-shadow: 0 2px 10px rgba(56, 189, 248, 0.35) !important;
    }

    /* أزرار التبديل المقسمة لصفحة العمليات والأرشيف */
    .segmented-tabs-bar {"""

if css_target in content:
    content = content.replace(css_target, css_replacement, 1)
    print("✓ CSS styles inserted successfully.")
else:
    print("❌ Failed to find css_target!")

# 3. Add the HTML for the two buttons directly above .segmented-tabs-bar in #viewOperations
html_target = """      <div class="page-view" id="viewOperations" style="display: none;">
        
        <!-- أزرار التبديل المقسمة: العمليات المسجلة (الافتراضي) / الأرشيف -->
        <div class="segmented-tabs-bar">"""

html_replacement = """      <div class="page-view" id="viewOperations" style="display: none;">
        
        <!-- شريط التبديل بين نمطي عرض العمليات: تجميع باليوم / مجمع (فوق العمليات المسجلة والأرشيف) -->
        <div class="ops-view-mode-bar" id="opsViewModeToggleBar">
          <button type="button" class="ops-view-mode-btn active" id="btnOpsModeDaily" onclick="setOperationsViewMode('daily')">
            <i class="fa-solid fa-calendar-day"></i>
            <span>تجميع باليوم</span>
          </button>
          <button type="button" class="ops-view-mode-btn" id="btnOpsModeFlat" onclick="setOperationsViewMode('flat')">
            <i class="fa-solid fa-layer-group"></i>
            <span>مجمع</span>
          </button>
        </div>

        <!-- أزرار التبديل المقسمة: العمليات المسجلة (الافتراضي) / الأرشيف -->
        <div class="segmented-tabs-bar">"""

if html_target in content:
    content = content.replace(html_target, html_replacement, 1)
    print("✓ HTML toggle buttons inserted successfully above segmented-tabs-bar.")
else:
    print("❌ Failed to find html_target!")

# 4. Update state to include opsViewMode
state_target = """    var state = window.state = {
      expectedTypeFilter: null,"""

state_replacement = """    var state = window.state = {
      opsViewMode: (function() { try { return localStorage.getItem('family_monefy_ops_view_mode') || 'daily'; } catch(e) { return 'daily'; } })(),
      expectedTypeFilter: null,"""

if state_target in content:
    content = content.replace(state_target, state_replacement, 1)
    print("✓ state.opsViewMode initialized successfully.")
else:
    print("❌ Failed to find state_target!")

# 5. Clean up formatMoneyVal and toggleSelectOperationRow + add setOperationsViewMode
js_target = """        window.selectedOperationRowId = null;
    function formatMoneyVal(v) {
      const converted = typeof convertAmount === 'function' ? convertAmount(v) : v;
      const curr = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : (state.currency || 'ج.م');
      return Number(converted || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + curr;
    }
    window.selectedExpectedRowId = null;

    function toggleSelectOperationRow(txId) {
      if (window.selectedOperationRowId === txId) {
        window.selectedOperationRowId = null;
    function formatMoneyVal(v) {
      const converted = typeof convertAmount === 'function' ? convertAmount(v) : v;
      const curr = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : (state.currency || 'ج.م');
      return Number(converted || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + curr;
    }
      } else {
        window.selectedOperationRowId = txId;
      }
      const allActionDrawers = document.querySelectorAll('.ops-row-actions-drawer');
      allActionDrawers.forEach(d => {
        const id = d.getAttribute('data-drawer-tx-id');
        if (id === window.selectedOperationRowId) {
          d.style.display = 'flex';
        } else {
          d.style.display = 'none';
        }
      });
      document.querySelectorAll('.ops-tx-card-clean').forEach(c => {
        const id = c.getAttribute('data-tx-id');
        if (id === window.selectedOperationRowId) {
          c.style.borderColor = '#38bdf8';
          c.style.background = 'rgba(56, 189, 248, 0.08)';
        } else {
          c.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          c.style.background = 'rgba(15, 23, 42, 0.75)';
        }
      });
    }"""

js_replacement = """    window.selectedOperationRowId = null;
    window.selectedExpectedRowId = null;

    function formatMoneyVal(v) {
      const converted = typeof convertAmount === 'function' ? convertAmount(v) : v;
      const curr = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : (state.currency || 'ج.م');
      return Number(converted || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + curr;
    }

    // التبديل بين نمطي عرض العمليات: 'daily' (تجميع باليوم) أو 'flat' (مجمع بدون تجميع مع التاريخ أسفل بيان العملية)
    function setOperationsViewMode(mode, persist = true) {
      if (mode !== 'flat') mode = 'daily';
      state.opsViewMode = mode;
      if (persist) {
        try {
          localStorage.setItem('family_monefy_ops_view_mode', mode);
        } catch(e) {}
      }
      const btnDaily = document.getElementById('btnOpsModeDaily');
      const btnFlat = document.getElementById('btnOpsModeFlat');
      if (btnDaily) btnDaily.classList.toggle('active', mode === 'daily');
      if (btnFlat) btnFlat.classList.toggle('active', mode === 'flat');

      // إذا كان المستخدم في تبويب الأرشيف، تحويله تلقائياً لقائمة العمليات
      if (state.activeOpsSubTab === 'archive' && typeof switchOperationsSubTab === 'function') {
        switchOperationsSubTab('registered');
      } else {
        renderOperationsList(null, false);
      }
    }

    function toggleSelectOperationRow(txId) {
      if (window.selectedOperationRowId === txId) {
        window.selectedOperationRowId = null;
      } else {
        window.selectedOperationRowId = txId;
      }
      const allActionDrawers = document.querySelectorAll('.ops-row-actions-drawer');
      allActionDrawers.forEach(d => {
        const id = d.getAttribute('data-drawer-tx-id');
        if (id === window.selectedOperationRowId) {
          d.style.display = 'flex';
        } else {
          d.style.display = 'none';
        }
      });
      document.querySelectorAll('.ops-tx-card-clean').forEach(c => {
        const id = c.getAttribute('data-tx-id');
        if (id === window.selectedOperationRowId) {
          c.style.borderColor = '#38bdf8';
          c.style.background = 'rgba(56, 189, 248, 0.08)';
        } else {
          c.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          c.style.background = 'rgba(15, 23, 42, 0.75)';
        }
      });
    }"""

if js_target in content:
    content = content.replace(js_target, js_replacement, 1)
    print("✓ formatMoneyVal and toggleSelectOperationRow cleaned up + setOperationsViewMode added.")
else:
    print("❌ Failed to find js_target!")

# 6. Update renderOperationsList logic
# We target from `const groupedByDate = {};` up to `container.innerHTML = cardsHtml;`
ops_render_target = """      // تجميع العمليات بحسب التاريخ
      const groupedByDate = {};
      const itemsToRender = list.slice(0, opsRenderLimit);

      itemsToRender.forEach(tx => {
        const d = tx.date || todayIso;
        if (!groupedByDate[d]) groupedByDate[d] = [];
        groupedByDate[d].push(tx);
      });

      // بناء مخرجات البطاقات ككتلة HTML موحدة وسريعة جداً
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

        // بناء بطاقة الحركة النظيفة (العملية، البيان، الرقم، التاريخ فقط)
        txs.forEach(tx => {
          const cat = getCategoryObj(tx.category, tx.type);
          const isExp = tx.type === 'expense';
          const amt = Number(tx.amount) || 0;
          const sign = isExp ? '-' : '+';
          const amtColor = isExp ? '#ff4d6d' : '#34d399';
          const memberName = tx.member || 'العائلة';
          const walletName = typeof getWalletName === 'function' ? getWalletName(tx.walletId) : '';
          const isSelected = (window.selectedOperationRowId === tx.id);
          let cleanLbl = (tx.label || tx.description || tx.note || '').trim();
          if (!cleanLbl || cleanLbl === 'بيان' || cleanLbl === 'بدون بيان') {
            cleanLbl = `${cat.name} (${memberName})`;
          }
          const rawLabel = cleanLbl;

          cardsHtml += `
            <div class="ops-tx-card-clean" data-tx-id="${tx.id}" onclick="toggleSelectOperationRow('${tx.id}')" style="background: ${isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15, 23, 42, 0.75)'}; border: 1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 12px; padding: 10px 12px; margin-bottom: 7px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
              
              <!-- الصف الرئيسي النظيف: العملية والبيان على اليمين | الرقم والتاريخ على اليسار -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <!-- العملية + البيان -->
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                  <div style="width: 38px; height: 38px; border-radius: 10px; background: ${cat.color ? cat.color + '22' : 'rgba(56, 189, 248, 0.15)'}; border: 1px solid ${cat.color ? cat.color + '55' : 'rgba(56, 189, 248, 0.3)'}; color: ${cat.color || '#38bdf8'}; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; flex-shrink: 0;">
                    <i class="fa-solid ${cat.icon || 'fa-receipt'}"></i>
                  </div>
                  <div style="min-width: 0; flex: 1;">
                    <div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${escapeHtml(rawLabel)}
                    </div>
                    <div style="font-size: 0.70rem; color: #94a3b8; margin-top: 1px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                      <span style="color: ${cat.color || '#38bdf8'}; font-weight: 750;">${cat.name}</span>
                      <span style="color: #94a3b8; font-size: 0.65rem; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 6px;">👤 ${memberName}</span>
                      ${walletName ? `<span style="color: #cbd5e1; font-size: 0.65rem; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 6px;">💳 ${walletName}</span>` : ''}
                      ${tx.receipt ? '<span style="color: #f472b6; font-size: 0.65rem;"><i class="fa-solid fa-paperclip"></i> إيصال</span>' : ''}
                    </div>
                  </div>
                </div>

                <!-- الرقم + التاريخ -->
                <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0;">
                  <div style="color: ${amtColor}; font-weight: 950; font-size: 0.95rem; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate;">
                    ${sign} ${formatMoneyVal(amt)}
                  </div>
                  <div style="font-size: 0.65rem; color: #64748b; font-weight: 700; margin-top: 2px;">
                    ${tx.date || ''} ${tx.time ? '• ' + tx.time : ''}
                  </div>
                </div>
              </div>

              <!-- درج الإجراءات المخفي: يفتح حصرياً عند الضغط على العملية (تعديل، حذف، إيصال) -->
              <div class="ops-row-actions-drawer" data-drawer-tx-id="${tx.id}" style="display: ${isSelected ? 'flex' : 'none'}; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.12); animation: fadeIn 0.15s ease;">
                ${tx.receipt ? `
                  <button type="button" onclick="event.stopPropagation(); viewReceiptImage('${tx.receipt}')" style="height: 30px; padding: 0 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(236, 72, 153, 0.18); border: 1px solid rgba(236, 72, 153, 0.4); color: #f472b6; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-image"></i>
                    <span>عرض الإيصال</span>
                  </button>
                ` : ''}
                <button type="button" onclick="event.stopPropagation(); editTx('${tx.id}')" style="height: 30px; padding: 0 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                  <i class="fa-solid fa-pen-to-square"></i>
                  <span>تعديل</span>
                </button>
                <button type="button" onclick="event.stopPropagation(); deleteTx('${tx.id}')" style="height: 30px; padding: 0 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(244, 63, 94, 0.18); border: 1px solid rgba(244, 63, 94, 0.4); color: #f43f5e; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                  <i class="fa-solid fa-trash-can"></i>
                  <span>حذف</span>
                </button>
              </div>

            </div>
          `;
        });
      }"""

ops_render_replacement = """      // التحقق من نمط العرض المختار: 'flat' (مجمع) أو 'daily' (تجميع باليوم)
      const curOpsMode = state.opsViewMode || (function() {
        try { return localStorage.getItem('family_monefy_ops_view_mode'); } catch(e) { return null; }
      })() || 'daily';
      state.opsViewMode = curOpsMode;

      // مزامنة حالة الأزرار العلوية
      const btnDaily = document.getElementById('btnOpsModeDaily');
      const btnFlat = document.getElementById('btnOpsModeFlat');
      if (btnDaily) btnDaily.classList.toggle('active', curOpsMode === 'daily');
      if (btnFlat) btnFlat.classList.toggle('active', curOpsMode === 'flat');

      const itemsToRender = list.slice(0, opsRenderLimit);
      let cardsHtml = '';

      if (curOpsMode === 'flat') {
        // =========================================================================
        // الوضع الجديد: "مجمع" (بدون تجميع لعمليات اليوم + التاريخ مدمج أسفل بيان العملية)
        // =========================================================================
        itemsToRender.forEach(tx => {
          const cat = getCategoryObj(tx.category, tx.type);
          const isExp = tx.type === 'expense';
          const amt = Number(tx.amount) || 0;
          const sign = isExp ? '-' : '+';
          const amtColor = isExp ? '#ff4d6d' : '#34d399';
          const memberName = tx.member || 'العائلة';
          const walletName = typeof getWalletName === 'function' ? getWalletName(tx.walletId) : '';
          const isSelected = (window.selectedOperationRowId === tx.id);
          let cleanLbl = (tx.label || tx.description || tx.note || '').trim();
          if (!cleanLbl || cleanLbl === 'بيان' || cleanLbl === 'بدون بيان') {
            cleanLbl = `${cat.name} (${memberName})`;
          }
          const rawLabel = cleanLbl;

          cardsHtml += `
            <div class="ops-tx-card-clean" data-tx-id="${tx.id}" onclick="toggleSelectOperationRow('${tx.id}')" style="background: ${isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15, 23, 42, 0.75)'}; border: 1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 12px; padding: 10px 12px; margin-bottom: 7px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
              
              <!-- الصف الرئيسي النظيف: العملية والبيان مع التاريخ المدمج أسفله على اليمين | الرقم والنوع على اليسار -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <!-- العملية + البيان وبأسفله التاريخ مباشرة -->
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                  <div style="width: 38px; height: 38px; border-radius: 10px; background: ${cat.color ? cat.color + '22' : 'rgba(56, 189, 248, 0.15)'}; border: 1px solid ${cat.color ? cat.color + '55' : 'rgba(56, 189, 248, 0.3)'}; color: ${cat.color || '#38bdf8'}; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; flex-shrink: 0;">
                    <i class="fa-solid ${cat.icon || 'fa-receipt'}"></i>
                  </div>
                  <div style="min-width: 0; flex: 1;">
                    <!-- بيان العملية -->
                    <div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(rawLabel)}">
                      ${escapeHtml(rawLabel)}
                    </div>
                    <!-- التاريخ مدمج أسفل بيان العملية مباشرة -->
                    <div class="ops-tx-date-inline" style="font-size: 0.69rem; color: #38bdf8; font-weight: 800; margin-top: 2px; display: inline-flex; align-items: center; gap: 4px;">
                      <i class="fa-regular fa-calendar-days" style="font-size: 0.64rem; color: #38bdf8;"></i>
                      <span>${tx.date || ''}</span>
                      ${tx.time ? `<span style="color: #94a3b8; font-size: 0.64rem; font-weight: 700;">• ${tx.time}</span>` : ''}
                    </div>
                    <!-- شريط البند والعضو والمحفظة والإيصال -->
                    <div style="font-size: 0.70rem; color: #94a3b8; margin-top: 1px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                      <span style="color: ${cat.color || '#38bdf8'}; font-weight: 750;">${cat.name}</span>
                      <span style="color: #94a3b8; font-size: 0.65rem; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 6px;">👤 ${memberName}</span>
                      ${walletName ? `<span style="color: #cbd5e1; font-size: 0.65rem; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 6px;">💳 ${walletName}</span>` : ''}
                      ${tx.receipt ? '<span style="color: #f472b6; font-size: 0.65rem;"><i class="fa-solid fa-paperclip"></i> إيصال</span>' : ''}
                    </div>
                  </div>
                </div>

                <!-- الرقم على اليسار بدون تكرار التاريخ -->
                <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end; justify-content: center; flex-shrink: 0;">
                  <div style="color: ${amtColor}; font-weight: 950; font-size: 0.96rem; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate;">
                    ${sign} ${formatMoneyVal(amt)}
                  </div>
                  <div style="font-size: 0.64rem; color: #64748b; font-weight: 700; margin-top: 2px;">
                    ${isExp ? 'منصرف' : 'إيداع'}
                  </div>
                </div>
              </div>

              <!-- درج الإجراءات المخفي: يفتح حصرياً عند الضغط على العملية (تعديل، حذف، إيصال) -->
              <div class="ops-row-actions-drawer" data-drawer-tx-id="${tx.id}" style="display: ${isSelected ? 'flex' : 'none'}; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.12); animation: fadeIn 0.15s ease;">
                ${tx.receipt ? `
                  <button type="button" onclick="event.stopPropagation(); viewReceiptImage('${tx.receipt}')" style="height: 30px; padding: 0 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(236, 72, 153, 0.18); border: 1px solid rgba(236, 72, 153, 0.4); color: #f472b6; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-image"></i>
                    <span>عرض الإيصال</span>
                  </button>
                ` : ''}
                <button type="button" onclick="event.stopPropagation(); editTx('${tx.id}')" style="height: 30px; padding: 0 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                  <i class="fa-solid fa-pen-to-square"></i>
                  <span>تعديل</span>
                </button>
                <button type="button" onclick="event.stopPropagation(); deleteTx('${tx.id}')" style="height: 30px; padding: 0 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(244, 63, 94, 0.18); border: 1px solid rgba(244, 63, 94, 0.4); color: #f43f5e; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                  <i class="fa-solid fa-trash-can"></i>
                  <span>حذف</span>
                </button>
              </div>

            </div>
          `;
        });
      } else {
        // =========================================================================
        // الوضع الحالي: "تجميع باليوم" (المجمّع بحسب التاريخ مع الترويسات والإجماليات)
        // =========================================================================
        const groupedByDate = {};
        itemsToRender.forEach(tx => {
          const d = tx.date || todayIso;
          if (!groupedByDate[d]) groupedByDate[d] = [];
          groupedByDate[d].push(tx);
        });

        // بناء مخرجات البطاقات ككتلة HTML موحدة وسريعة جداً
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

          // بناء بطاقة الحركة النظيفة (العملية، البيان، الرقم، التاريخ فقط)
          txs.forEach(tx => {
            const cat = getCategoryObj(tx.category, tx.type);
            const isExp = tx.type === 'expense';
            const amt = Number(tx.amount) || 0;
            const sign = isExp ? '-' : '+';
            const amtColor = isExp ? '#ff4d6d' : '#34d399';
            const memberName = tx.member || 'العائلة';
            const walletName = typeof getWalletName === 'function' ? getWalletName(tx.walletId) : '';
            const isSelected = (window.selectedOperationRowId === tx.id);
            let cleanLbl = (tx.label || tx.description || tx.note || '').trim();
            if (!cleanLbl || cleanLbl === 'بيان' || cleanLbl === 'بدون بيان') {
              cleanLbl = `${cat.name} (${memberName})`;
            }
            const rawLabel = cleanLbl;

            cardsHtml += `
              <div class="ops-tx-card-clean" data-tx-id="${tx.id}" onclick="toggleSelectOperationRow('${tx.id}')" style="background: ${isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15, 23, 42, 0.75)'}; border: 1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 12px; padding: 10px 12px; margin-bottom: 7px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
                
                <!-- الصف الرئيسي النظيف: العملية والبيان على اليمين | الرقم والتاريخ على اليسار -->
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                  <!-- العملية + البيان -->
                  <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: ${cat.color ? cat.color + '22' : 'rgba(56, 189, 248, 0.15)'}; border: 1px solid ${cat.color ? cat.color + '55' : 'rgba(56, 189, 248, 0.3)'}; color: ${cat.color || '#38bdf8'}; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; flex-shrink: 0;">
                      <i class="fa-solid ${cat.icon || 'fa-receipt'}"></i>
                    </div>
                    <div style="min-width: 0; flex: 1;">
                      <div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${escapeHtml(rawLabel)}
                      </div>
                      <div style="font-size: 0.70rem; color: #94a3b8; margin-top: 1px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <span style="color: ${cat.color || '#38bdf8'}; font-weight: 750;">${cat.name}</span>
                        <span style="color: #94a3b8; font-size: 0.65rem; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 6px;">👤 ${memberName}</span>
                        ${walletName ? `<span style="color: #cbd5e1; font-size: 0.65rem; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 6px;">💳 ${walletName}</span>` : ''}
                        ${tx.receipt ? '<span style="color: #f472b6; font-size: 0.65rem;"><i class="fa-solid fa-paperclip"></i> إيصال</span>' : ''}
                      </div>
                    </div>
                  </div>

                  <!-- الرقم + التاريخ -->
                  <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0;">
                    <div style="color: ${amtColor}; font-weight: 950; font-size: 0.95rem; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate;">
                      ${sign} ${formatMoneyVal(amt)}
                    </div>
                    <div style="font-size: 0.65rem; color: #64748b; font-weight: 700; margin-top: 2px;">
                      ${tx.date || ''} ${tx.time ? '• ' + tx.time : ''}
                    </div>
                  </div>
                </div>

                <!-- درج الإجراءات المخفي: يفتح حصرياً عند الضغط على العملية (تعديل، حذف، إيصال) -->
                <div class="ops-row-actions-drawer" data-drawer-tx-id="${tx.id}" style="display: ${isSelected ? 'flex' : 'none'}; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.12); animation: fadeIn 0.15s ease;">
                  ${tx.receipt ? `
                    <button type="button" onclick="event.stopPropagation(); viewReceiptImage('${tx.receipt}')" style="height: 30px; padding: 0 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(236, 72, 153, 0.18); border: 1px solid rgba(236, 72, 153, 0.4); color: #f472b6; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                      <i class="fa-solid fa-image"></i>
                      <span>عرض الإيصال</span>
                    </button>
                  ` : ''}
                  <button type="button" onclick="event.stopPropagation(); editTx('${tx.id}')" style="height: 30px; padding: 0 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-pen-to-square"></i>
                    <span>تعديل</span>
                  </button>
                  <button type="button" onclick="event.stopPropagation(); deleteTx('${tx.id}')" style="height: 30px; padding: 0 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(244, 63, 94, 0.18); border: 1px solid rgba(244, 63, 94, 0.4); color: #f43f5e; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-trash-can"></i>
                    <span>حذف</span>
                  </button>
                </div>

              </div>
            `;
          });
        }
      }"""

if ops_render_target in content:
    content = content.replace(ops_render_target, ops_render_replacement, 1)
    print("✓ renderOperationsList dual mode support applied successfully.")
else:
    print("❌ Failed to find ops_render_target!")

# 7. Sync buttons on switchAppPage('operations')
switch_ops_target = """      if (pageId === 'operations') {
        if (typeof switchOperationsSubTab === 'function') {
          switchOperationsSubTab(state.activeOpsSubTab || 'registered');
        }
        if (typeof filterOperationsList === 'function') {
          filterOperationsList();
        }
      }"""

switch_ops_replacement = """      if (pageId === 'operations') {
        const curMode = state.opsViewMode || 'daily';
        const btnDaily = document.getElementById('btnOpsModeDaily');
        const btnFlat = document.getElementById('btnOpsModeFlat');
        if (btnDaily) btnDaily.classList.toggle('active', curMode === 'daily');
        if (btnFlat) btnFlat.classList.toggle('active', curMode === 'flat');

        if (typeof switchOperationsSubTab === 'function') {
          switchOperationsSubTab(state.activeOpsSubTab || 'registered');
        }
        if (typeof filterOperationsList === 'function') {
          filterOperationsList();
        }
      }"""

if switch_ops_target in content:
    content = content.replace(switch_ops_target, switch_ops_replacement, 1)
    print("✓ switchAppPage operations mode sync applied successfully.")
else:
    print("❌ Failed to find switch_ops_target!")

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("All modifications written to index.html successfully.")
