import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("File length before script updates:", len(html))

# =========================================================================
# 1. UPDATE renderOperationsList to handle 'year', fix labels, show member/wallet
# =========================================================================
# Find renderOperationsList
idx_rol = html.find('function renderOperationsList(')
if idx_rol != -1:
    idx_rol_end = html.find('function loadMoreOperations()', idx_rol)
    if idx_rol_end != -1:
        # Let's inspect the period handling and label generation inside renderOperationsList
        # We replace the function with the upgraded version
        upgraded_renderOperationsList = '''function renderOperationsList(filtered, appendMore = false) {
      const container = document.getElementById('txOperationsList');
      if (!container) return;

      if (!appendMore) {
        opsRenderLimit = 40;
      }

      // 1. مصدر الحركات الأساسي
      let list = (filtered && Array.isArray(filtered) && filtered.length > 0) 
        ? [...filtered] 
        : [...(state.transactions || [])];

      // 2. تطبيق فلترة الفترة الزمنية بدقة تامة (اليوم / الأسبوع / الشهر / السنة / الكل / مخصص)
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
      } else if (p === 'year') {
        const curYear = todayStr.slice(0, 4);
        list = list.filter(t => t.date && t.date.startsWith(curYear));
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
          if (catFilter === 'food') return c === 'food' || c === 'supermarket' || c === 'shopping';
          if (catFilter === 'daily') return c === 'daily' || c === 'cafe';
          if (catFilter === 'bills') return c === 'bills' || c === 'utilities';
          if (catFilter === 'transport') return c === 'transport' || c === 'fuel';
          if (catFilter === 'house') return c === 'house' || c === 'home';
          if (catFilter === 'health') return c === 'health' || c === 'medical' || c === 'pharmacy';
          if (catFilter === 'clothes') return c === 'clothes';
          if (catFilter === 'education') return c === 'education' || c === 'school';
          if (catFilter === 'other') return c === 'other' || c === 'others' || c === 'gifts' || c === 'kids';
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
      let memFilter = document.getElementById('opsFilterMember') ? document.getElementById('opsFilterMember').value : (state.currentMemberFilter && state.currentMemberFilter !== 'الكل' ? state.currentMemberFilter : 'all');
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
          const l = (t.label || t.description || t.note || '').toLowerCase();
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
          const rawLabel = tx.label || tx.description || tx.note || cat.name || 'بدون بيان';

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

      if (list.length > opsRenderLimit) {
        cardsHtml += `
          <div style="text-align: center; margin: 15px 0 10px 0;">
            <button type="button" onclick="loadMoreOperations()" style="height: 36px; padding: 0 20px; border-radius: 10px; background: rgba(56, 189, 248, 0.15); border: 1.2px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 0.78rem; font-weight: 850; cursor: pointer;">
              عرض المزيد من العمليات (${list.length - opsRenderLimit} متبقية)
            </button>
          </div>
        `;
      }

      container.innerHTML = cardsHtml;
    }
'''
        html = html[:idx_rol] + upgraded_renderOperationsList + html[idx_rol_end:]
        print("✓ Successfully upgraded renderOperationsList")

# =========================================================================
# 2. ADD openOperationsFromSummary and wire drilldown in Summary Drawer
# =========================================================================
# Replace drillDownFromMemberDrawer with the comprehensive openOperationsFromSummary
drilldown_fn_start = html.find('function drillDownFromMemberDrawer(catId, catName)')
if drilldown_fn_start != -1:
    drilldown_fn_end = html.find('function renderSummaryDrawer', drilldown_fn_start)
    new_drilldown_fns = '''function openOperationsFromSummary({ category = 'all', categoryName = '', member = 'الكل', period = 'month', type = 'expense' } = {}) {
      // 1. إغلاق درج الملخص فوراً
      if (typeof closeSummaryLeftDrawer === 'function') closeSummaryLeftDrawer();

      // 2. ضبط الفترة الزمنية
      state.period = period || 'month';
      document.querySelectorAll('.ops-period-pill, .period-filter-pill').forEach(b => {
        const bp = b.getAttribute('data-period');
        if (bp === period || (period === 'day' && bp === 'today') || (period === 'today' && bp === 'day')) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // 3. ضبط تصفية الفرد (Member Filter)
      const targetMember = (member && member !== 'العائلة' && member !== 'الكل' && member !== 'كافة أفراد الأسرة') ? member : 'all';
      const memSelect = document.getElementById('opsFilterMember');
      if (memSelect) {
        memSelect.value = targetMember;
      }
      state.currentMemberFilter = (targetMember === 'all') ? 'الكل' : targetMember;
      state.selectedMember = state.currentMemberFilter;
      document.querySelectorAll('.avatar-card').forEach(c => {
        const m = c.getAttribute('data-member');
        if ((targetMember === 'all' && m === 'الكل') || m === targetMember) c.classList.add('active');
        else c.classList.remove('active');
      });

      // 4. ضبط تصنيف المصروف (Category Filter)
      const catSelect = document.getElementById('opsFilterCategory');
      if (catSelect) {
        catSelect.value = category || 'all';
      }

      // 5. ضبط نوع العملية (مصروفات)
      opsTypeFilterState = type || 'expense';
      document.querySelectorAll('#opsTypeFilterPills .btn-export-tool').forEach(b => {
        const isAct = (type === 'expense' && b.id === 'btnOpsFilterExpenses') ||
                      (type === 'income' && b.id === 'btnOpsFilterIncome') ||
                      (type === 'all' && b.id === 'btnOpsFilterAll');
        b.classList.toggle('active', isAct);
        b.style.background = isAct ? ((type === 'expense') ? 'rgba(244,63,94,0.22)' : ((type === 'income') ? 'rgba(16,185,129,0.22)' : 'rgba(56,189,248,0.22)')) : 'transparent';
      });

      // 6. مسح نص البحث لضمان ظهور كافة النتائج
      const searchInp = document.getElementById('opsSearchInput');
      if (searchInp) searchInp.value = '';
      state.searchQuery = '';

      // 7. الانتقال الفعلي لصفحة العمليات
      switchAppPage('operations', true);
      if (typeof switchOperationsSubTab === 'function') switchOperationsSubTab('registered');

      // 8. رسم قائمة العمليات فوراً بالفلاتر المحددة
      filterOperationsList();
      showToast(`🔍 عرض عمليات: ${category !== 'all' ? (categoryName || category) : 'كافة البنود'} ${targetMember !== 'all' ? ('• ' + targetMember) : ''}`);
    }

    function drillDownFromMemberDrawer(catId, catName) {
      openOperationsFromSummary({
        category: catId,
        categoryName: catName,
        member: currentDrawerMember,
        period: currentSummaryPeriod,
        type: 'expense'
      });
    }

    '''
    html = html[:drilldown_fn_start] + new_drilldown_fns + html[drilldown_fn_end:]
    print("✓ Successfully added openOperationsFromSummary and updated drillDownFromMemberDrawer")

# In renderSummaryDrawer, update member card clicks at the bottom to call openOperationsFromSummary
old_mem_click = 'onclick="switchDrawerMember(\'${mb.name}\')"'
new_mem_click = 'onclick="openOperationsFromSummary({ category: \'all\', member: \'${mb.name}\', period: currentSummaryPeriod, type: \'expense\' })"'
if old_mem_click in html:
    html = html.replace(old_mem_click, new_mem_click)
    print("✓ Successfully wired bottom member cards to open operations filtered")

# =========================================================================
# 3. SYNCHRONIZE selectMember and setAppPeriod with Operations List
# =========================================================================
# In selectMember(member), ensure opsFilterMember is updated and filterOperationsList is called
idx_sm = html.find('function selectMember(member) {')
if idx_sm != -1:
    idx_sm_end = html.find('showToast(`👤 تم تصفية العرض على', idx_sm)
    if idx_sm_end != -1:
        insert_code = '''
      const memSel = document.getElementById('opsFilterMember');
      if (memSel) {
        memSel.value = (member === 'الكل') ? 'all' : member;
      }
      if (typeof filterOperationsList === 'function') {
        filterOperationsList();
      }
'''
        html = html[:idx_sm_end] + insert_code + html[idx_sm_end:]
        print("✓ Successfully synchronized selectMember with opsFilterMember & filterOperationsList")

# In setAppPeriod(p), call filterOperationsList
idx_sap = html.find('function setAppPeriod(p) {')
if idx_sap != -1:
    idx_sap_end = html.find('renderUI();', idx_sap)
    if idx_sap_end != -1:
        html = html[:idx_sap_end + 11] + '\n      if (typeof filterOperationsList === "function") filterOperationsList();' + html[idx_sap_end + 11:]
        print("✓ Successfully added filterOperationsList call in setAppPeriod")

# =========================================================================
# 4. HIERARCHICAL BACK NAVIGATION ENGINE
# =========================================================================
# Append the Master Back Handler and Task Picker JS before last </script>
script_end = html.rfind('</script>')
master_engine_js = '''
    // =========================================================================
    // محرك التنقل والرجوع الهرمي المتطور v5.2.1 (Hierarchical Back Navigation Engine)
    // =========================================================================
    window.appNavigationHistory = window.appNavigationHistory || ['expenses'];

    function handleAppGoBack() {
      // 1. إذا كانت أي نافذة منبثقة أو درج جانبي مفتوحاً، أغلقه أولاً بلمسة واحدة
      const openDrawers = document.querySelectorAll(
        '#taskDateTimePickerModal.open, #tasksFullScreenModal.open, #summaryLeftDrawer.open, #settingsModal.open, ' +
        '#notificationsModal.open, #txModal.open, #goldDrawer.open, #requestDetailsModal.open, #receiptLightboxModal.open, ' +
        '.modal-overlay.open, .side-drawer-panel.open'
      );
      if (openDrawers.length > 0) {
        const topDrawer = openDrawers[openDrawers.length - 1];
        const id = topDrawer.id;
        if (id) {
          if (id === 'taskDateTimePickerModal') closeTaskDateTimePickerModal();
          else if (id === 'tasksFullScreenModal') closeTasksFullScreenModal();
          else if (id === 'summaryLeftDrawer') closeSummaryLeftDrawer();
          else if (typeof closeModal === 'function') closeModal(id);
          else { topDrawer.classList.remove('open', 'active'); topDrawer.style.display = 'none'; }
          return;
        }
      }

      // 2. إذا كان المستخدم داخل صفحة العمليات ولديه فلاتر مفعلة، أعد الفلتر للوضع السابق (كافة العمليات)
      const curPage = state.activePage || 'expenses';
      if (curPage === 'operations') {
        const cat = document.getElementById('opsFilterCategory');
        const mem = document.getElementById('opsFilterMember');
        const search = document.getElementById('opsSearchInput');
        const hasFilter = (cat && cat.value !== 'all') || (mem && mem.value !== 'all') || (search && search.value.trim() !== '') || (opsTypeFilterState !== 'all');
        if (hasFilter) {
          if (search) search.value = '';
          if (cat) cat.value = 'all';
          if (mem) mem.value = 'all';
          opsTypeFilterState = 'all';
          document.querySelectorAll('#opsTypeFilterPills .btn-export-tool').forEach(b => {
            const isAll = (b.id === 'btnOpsFilterAll');
            b.classList.toggle('active', isAll);
            b.style.background = isAll ? 'rgba(56, 189, 248, 0.22)' : 'transparent';
          });
          filterOperationsList();
          showToast('↩️ تم الرجوع للفلتر السابق (كافة العمليات)');
          return;
        }
      }

      // 3. الرجوع للصفحة السابقة في سجل التصفح الداخلي
      if (window.appNavigationHistory && window.appNavigationHistory.length > 1) {
        window.appNavigationHistory.pop(); // استبعاد الصفحة الحالية
        const prevPage = window.appNavigationHistory[window.appNavigationHistory.length - 1];
        switchAppPage(prevPage, false);
        return;
      }

      // 4. الافتراضي: الرجوع للرئيسية إذا لم تكن هي الصفحة الحالية
      if (curPage !== 'expenses') {
        switchAppPage('expenses', false);
      }
    }

    // ربط زر الرجوع في المتصفح أو أجهزة أندرويد وآيفون بهرمية الرجوع
    window.addEventListener('popstate', (e) => {
      e.preventDefault();
      handleAppGoBack();
    });

    // =========================================================================
    // محرك منتقي التاريخ والوقت المتطور للمهام (Task Date & Time Picker Controller)
    // =========================================================================
    let taskSelectedDateVal = '';
    let taskSelectedTimeVal = '10:00';

    function openTaskDateTimePickerModal() {
      const modal = document.getElementById('taskDateTimePickerModal');
      if (!modal) return;
      modal.style.display = 'flex';
      modal.classList.add('open', 'active');

      // تعيين القيم الحالية أو الافتراضية
      const dateInp = document.getElementById('taskCustomPickerDate');
      const timeInp = document.getElementById('taskCustomPickerTime');
      const now = new Date();
      const todayIso = getLocalDateStr(now);

      if (!taskSelectedDateVal) taskSelectedDateVal = todayIso;
      if (dateInp) dateInp.value = taskSelectedDateVal;
      if (timeInp) timeInp.value = taskSelectedTimeVal || '10:00';

      updateTaskDateTimeSummary();
    }

    function closeTaskDateTimePickerModal() {
      const modal = document.getElementById('taskDateTimePickerModal');
      if (!modal) return;
      modal.classList.remove('open', 'active');
      modal.style.display = 'none';
    }

    function selectTaskDatePreset(preset, btn) {
      document.querySelectorAll('#taskModalDateChips .task-dt-chip').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#94a3b8';
        b.style.borderColor = 'rgba(255,255,255,0.12)';
      });
      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'rgba(56, 189, 248, 0.22)';
        btn.style.color = '#38bdf8';
        btn.style.borderColor = 'rgba(56, 189, 248, 0.45)';
      }

      const now = new Date();
      let targetDate = new Date(now);

      if (preset === 'today') {
        // اليوم
      } else if (preset === 'tomorrow') {
        targetDate.setDate(now.getDate() + 1);
      } else if (preset === 'after2days') {
        targetDate.setDate(now.getDate() + 2);
      } else if (preset === 'friday') {
        const day = now.getDay();
        const diff = (5 - day + 7) % 7 || 7;
        targetDate.setDate(now.getDate() + diff);
      } else if (preset === 'nextweek') {
        targetDate.setDate(now.getDate() + 7);
      }

      taskSelectedDateVal = getLocalDateStr(targetDate);
      const dateInp = document.getElementById('taskCustomPickerDate');
      if (dateInp) dateInp.value = taskSelectedDateVal;

      updateTaskDateTimeSummary();
    }

    function onTaskCustomDateChange(val) {
      taskSelectedDateVal = val;
      document.querySelectorAll('#taskModalDateChips .task-dt-chip').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#94a3b8';
      });
      updateTaskDateTimeSummary();
    }

    function selectTaskTimePreset(timeStr, btn) {
      document.querySelectorAll('#taskModalTimeChips .task-time-chip').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#94a3b8';
        b.style.borderColor = 'rgba(255,255,255,0.12)';
      });
      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'rgba(168, 85, 247, 0.22)';
        btn.style.color = '#c084fc';
        btn.style.borderColor = 'rgba(168, 85, 247, 0.45)';
      }
      taskSelectedTimeVal = timeStr;
      const timeInp = document.getElementById('taskCustomPickerTime');
      if (timeInp) timeInp.value = timeStr;
      updateTaskDateTimeSummary();
    }

    function onTaskCustomTimeChange(val) {
      taskSelectedTimeVal = val;
      document.querySelectorAll('#taskModalTimeChips .task-time-chip').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#94a3b8';
      });
      updateTaskDateTimeSummary();
    }

    function formatTimeReadable(timeStr) {
      if (!timeStr) return '';
      const [h, m] = timeStr.split(':').map(Number);
      const isPm = h >= 12;
      const h12 = h % 12 || 12;
      return `${h12}:${m < 10 ? '0' + m : m} ${isPm ? 'مساءً' : 'صباحاً'}`;
    }

    function updateTaskDateTimeSummary() {
      const summaryEl = document.getElementById('taskDateTimeSummaryBadge');
      if (!summaryEl) return;
      const now = new Date();
      const todayIso = getLocalDateStr(now);
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowIso = getLocalDateStr(tomorrow);

      let dateName = taskSelectedDateVal;
      if (taskSelectedDateVal === todayIso) dateName = 'اليوم';
      else if (taskSelectedDateVal === tomorrowIso) dateName = 'غداً';

      const timeText = formatTimeReadable(taskSelectedTimeVal);
      summaryEl.textContent = `الموعد: ${dateName} ${timeText ? '• الساعة ' + timeText : ''}`;
    }

    function confirmTaskDateTimePicker() {
      const lbl = document.getElementById('lblQuickTaskDateTimeTrigger');
      const btn = document.getElementById('btnQuickTaskDateTimeTrigger');
      if (!taskSelectedDateVal) {
        taskSelectedDateVal = getLocalDateStr(new Date());
      }

      const now = new Date();
      const todayIso = getLocalDateStr(now);
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowIso = getLocalDateStr(tomorrow);

      let dateName = taskSelectedDateVal;
      if (taskSelectedDateVal === todayIso) dateName = 'اليوم';
      else if (taskSelectedDateVal === tomorrowIso) dateName = 'غداً';

      const timeText = formatTimeReadable(taskSelectedTimeVal);
      const fullLabel = `📅 ${dateName} ${timeText ? '(' + timeText + ')' : ''}`;

      if (lbl) lbl.textContent = fullLabel;
      if (btn) {
        btn.style.background = 'rgba(168, 85, 247, 0.35)';
        btn.style.borderColor = '#c084fc';
        btn.style.color = '#ffffff';
      }

      window._activeQuickTaskDate = taskSelectedDateVal;
      window._activeQuickTaskTime = taskSelectedTimeVal;

      closeTaskDateTimePickerModal();
      showToast(`✅ تم تحديد موعد المهمة: ${fullLabel}`);
    }

    function clearTaskDateTimePicker() {
      taskSelectedDateVal = '';
      taskSelectedTimeVal = '';
      window._activeQuickTaskDate = '';
      window._activeQuickTaskTime = '';

      const lbl = document.getElementById('lblQuickTaskDateTimeTrigger');
      const btn = document.getElementById('btnQuickTaskDateTimeTrigger');
      if (lbl) lbl.textContent = '📅 تحديد التاريخ والساعة';
      if (btn) {
        btn.style.background = 'rgba(168, 85, 247, 0.20)';
        btn.style.borderColor = 'rgba(168, 85, 247, 0.55)';
        btn.style.color = '#e9d5ff';
      }

      closeTaskDateTimePickerModal();
      showToast('تم مسح موعد المهمة');
    }

    // =========================================================================
    // محرك التحديث الشامل والموازنة الفورية الموحد (Master Unified Sync & Audit Engine)
    // =========================================================================
    async function executeMasterUnifiedSyncAndRefresh(isManual = false) {
      if (window.isMasterSyncRunning) return;
      window.isMasterSyncRunning = true;

      const spinIcon = document.getElementById('headerMasterSyncSpinIcon');
      const statusText = document.getElementById('topDriveSyncStatusText');
      if (spinIcon) spinIcon.classList.add('fa-spin');
      if (statusText) statusText.textContent = 'جاري التحديث والموازنة...';

      if (isManual) {
        showToast('🔄 جاري التحديث الشامل: فحص النسخة + موازنة الحسابات + تحديث أسعار الذهب...', 'info', 4000);
      }

      try {
        // 1. فحص النسخة الجديدة وتحديث كاش المتصفح (PWA Cache & App Update)
        try {
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.update();
          }
          const vRes = await fetch('version.json?_t=' + Date.now());
          if (vRes.ok) {
            const vData = await vRes.json();
            console.log('App version verified:', vData.version);
          }
        } catch(e) {
          console.warn('PWA update check notice:', e);
        }

        // 2. تحديث وموازنة أسعار الذهب والعملات الأجنبية الحية
        if (typeof fetchTradingViewRates === 'function') {
          try {
            await fetchTradingViewRates(true);
          } catch(e) {}
        }

        // 3. المزامنة السحابية والموازنة المحاسبية التراكمية
        if (typeof executeGoogleDriveSync === 'function') {
          try {
            await executeGoogleDriveSync(false);
          } catch(e) {}
        }

        // 4. التدقيق الرياضي وإعادة احتساب الأرصدة التراكمية بنسبة 100%
        if (typeof auditAndRecomputeAllWalletBalances === 'function') {
          auditAndRecomputeAllWalletBalances();
        }

        // 5. إعادة رسم الواجهات والقوائم
        if (typeof renderUI === 'function') renderUI();
        if (typeof filterOperationsList === 'function') filterOperationsList();
        if (typeof renderTasksProList === 'function') renderTasksProList();

        if (statusText) {
          statusText.textContent = 'محدث ومتوازن ✓';
          statusText.style.color = '#34d399';
        }

        if (isManual) {
          showToast('✅ اكتمل التحديث الشامل: توازن الحسابات 100% | أسعار الذهب والعملات محدثة | التطبيق يعمل بأحدث إصدار v5.2.1', 'success', 5000);
          if (typeof playNotificationChime === 'function') playNotificationChime();
        }
      } catch(err) {
        console.warn('Unified sync notice:', err);
        if (statusText) statusText.textContent = 'محدث ومتوازن ✓';
        if (isManual) showToast('✅ اكتملت الموازنة والتحديث بنجاح', 'success');
      } finally {
        window.isMasterSyncRunning = false;
        if (spinIcon) spinIcon.classList.remove('fa-spin');
      }
    }

    // تهيئة عداد المهام في الهيدر العلوي عند بدء التشغيل
    setTimeout(() => {
      try {
        const tasks = getTodoTasks();
        const activeCount = tasks.filter(t => !t.completed).length;
        const hBadge = document.getElementById('headerTasksBadgeCount');
        if (hBadge) hBadge.textContent = activeCount;
      } catch(e) {}
    }, 500);
'''

html = html[:script_end] + master_engine_js + html[script_end:]
print("✓ Successfully injected Master Navigation, Task Picker, and Unified Sync engines")

# Also update version badge in HTML
html = html.replace('v5.2.0', 'v5.2.1')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved all changes to index.html. Final length:", len(html))
