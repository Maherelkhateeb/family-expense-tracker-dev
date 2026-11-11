# -*- coding: utf-8 -*-
import os
import re

INDEX_PATH = 'index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    text = f.read()

orig_len = len(text)
print(f"Original length: {orig_len}")

# =========================================================================
# 1. Cockpit SVGs explicit stroke and dimensions
# =========================================================================
old_inflow_svg = text.find('<div class="flow-icon-badge inflow-badge">')
if old_inflow_svg != -1:
    inflow_close = text.find('</div>', old_inflow_svg)
    new_inflow_badge = """<div class="flow-icon-badge inflow-badge" style="width: 22px; height: 22px; min-width: 22px; border-radius: 7px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(5, 150, 105, 0.2)); border: 1px solid rgba(16, 185, 129, 0.6); box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                    <circle cx="12" cy="12" r="10" stroke="#10b981"></circle>
                    <polyline points="8 12 12 16 16 12" stroke="#10b981"></polyline>
                    <line x1="12" y1="8" x2="12" y2="16" stroke="#10b981"></line>
                  </svg>"""
    text = text[:old_inflow_svg] + new_inflow_badge + text[inflow_close:]
    print("1. Cockpit inflow SVG updated with explicit stroke #10b981.")

old_outflow_svg = text.find('<div class="flow-icon-badge outflow-badge">')
if old_outflow_svg != -1:
    outflow_close = text.find('</div>', old_outflow_svg)
    new_outflow_badge = """<div class="flow-icon-badge outflow-badge" style="width: 22px; height: 22px; min-width: 22px; border-radius: 7px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(244, 63, 94, 0.35), rgba(225, 29, 72, 0.2)); border: 1px solid rgba(244, 63, 94, 0.6); box-shadow: 0 0 8px rgba(244, 63, 94, 0.3);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                    <circle cx="12" cy="12" r="10" stroke="#f43f5e"></circle>
                    <polyline points="16 12 12 8 8 12" stroke="#f43f5e"></polyline>
                    <line x1="12" y1="16" x2="12" y2="8" stroke="#f43f5e"></line>
                  </svg>"""
    text = text[:old_outflow_svg] + new_outflow_badge + text[outflow_close:]
    print("1b. Cockpit outflow SVG updated with explicit stroke #f43f5e.")

# =========================================================================
# 2. Commitment Cards 4-grid overhaul
# =========================================================================
p_bills = text.find('cardComBills')
if p_bills != -1:
    grid_start = text.rfind('<div', 0, p_bills)
    p_settled = text.find('cardComSettled', p_bills)
    p_amt = text.find('kpiCapSettledAmount', p_settled)
    c4_end = text.find('</div>', text.find('</div>', p_amt) + 1) + 6
    grid_end = text.find('</div>', c4_end) + 6

    new_cards_grid = """<div class="com-kpi-cards-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; width: 100%; box-sizing: border-box;">
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
    text = text[:grid_start] + new_cards_grid + text[grid_end:]
    print("2. Commitment cards grid replaced with 3-tier vertical stack.")

# =========================================================================
# 3. Overhaul renderMonthlyBudgetAllocations
# =========================================================================
p3 = text.find('function renderMonthlyBudgetAllocations')
if p3 != -1:
    next_fn = text.find('function addBudgetIncomeRow', p3)
    if next_fn != -1:
        new_alloc_block = """// حساب المصروفات الفعلية المطابقة للبند بدقة مع مراعاة تخصيص الأفراد
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

      if (typeof updateBudgetKpis === 'function') updateBudgetKpis();
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
    window.saveEditedBudgetItem = saveEditedBudgetItem;

    """
        text = text[:p3] + new_alloc_block + text[next_fn:]
        print("3. renderMonthlyBudgetAllocations replaced with per-person allocation engine.")

# =========================================================================
# 4. Overhaul switchExpectedTopSection
# =========================================================================
p2 = text.find('function switchExpectedTopSection')
if p2 != -1:
    next_fn2 = text.find('function switchBudgetSubTab', p2)
    if next_fn2 != -1:
        new_switch_block = """function switchExpectedTopSection(sec) {
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
    };

    """
        text = text[:p2] + new_switch_block + text[next_fn2:]
        print("4. switchExpectedTopSection replaced and openBudgetsDirectly defined.")

# =========================================================================
# 5. Version Bump to v5.2.8
# =========================================================================
text = text.replace("var APP_VERSION = 'v5.2.7';", "var APP_VERSION = 'v5.2.8';")
text = text.replace("window.APP_VERSION = 'v5.2.7';", "window.APP_VERSION = 'v5.2.8';")
text = text.replace("var APP_BUILD_ID = 202611081730;", "var APP_BUILD_ID = 202611081800;")
text = text.replace("window.APP_BUILD_ID = 202611081730;", "window.APP_BUILD_ID = 202611081800;")

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(text)

print(f"File updated successfully! New length: {len(text)}")
