function initMonthlyBudgetUI() {
      const stored = localStorage.getItem('family_monefy_monthly_budgets');
      if (stored) {
        try { state.monthlyBudgets = JSON.parse(stored); } catch(e) { state.monthlyBudgets = []; }
      }

      if (!state.monthlyBudgets || !Array.isArray(state.monthlyBudgets) || state.monthlyBudgets.length === 0) {
        state.monthlyBudgets = generateRichDemoBudgets();
        try {
          localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
        } catch(e) {}
      }

      // ترقية وتأكيد سلامة كل خطة
      state.monthlyBudgets.forEach((b, idx) => {
        if (!b.id) b.id = 'bgt-' + (b.month || 'plan') + '-' + (idx + 1);
        if (!b.name) b.name = b.title || (`ميزانية شهر ${b.month || 'الحالي'}`);
        if (!b.month) b.month = '2026-11';
        if (!b.categories) b.categories = {};
        if (!b.incomes) b.incomes = [];
        ensureBudgetItems(b);
      });

      if (!state.activeBudgetId || !state.monthlyBudgets.some(b => b.id === state.activeBudgetId)) {
        state.activeBudgetId = state.monthlyBudgets[0].id;
      }

      populateBudgetPlanSelector();
      renderBudgetMembersMultiPicker();
    }

    // ضمان وجود قائمة بنود ديناميكية وترحيل التصنيفات القديمة إن وجدت
    function ensureBudgetItems(b) {
      if (!b.items || !Array.isArray(b.items)) {
        b.items = [];
        const catMap = {
          food: 'طعام ومشتريات',
          daily: 'مصروف يومي',
          bills: 'فواتير والتزامات',
          transport: 'مواصلات وبنزين',
          house: 'مستلزمات منزل',
          health: 'صحة وعلاج',
          clothes: 'ملابس وأحذية',
          education: 'تعليم ودروس',
          other: 'أخرى ونثريات'
        };
        Object.keys(b.categories || {}).forEach((catId, idx) => {
          const amt = Number(b.categories[catId]) || 0;
          if (amt > 0) {
            b.items.push({
              id: 'item-' + catId + '-' + (idx + 1),
              category: catId,
              title: catMap[catId] || catId,
              amount: amt,
              members: ['البيت'],
              notes: ''
            });
          }
        });
      }
      syncBudgetCategoriesMap(b);
    }

    // مزامنة خريطة categories القديمة لمنع كسر أي كود يعتمد عليها
    function syncBudgetCategoriesMap(b) {
      if (!b) return;
      b.categories = {};
      (b.items || []).forEach(it => {
        const cat = it.category || 'other';
        b.categories[cat] = (b.categories[cat] || 0) + (Number(it.amount) || 0);
      });
    }

    function populateBudgetPlanSelector() {
      const sel = document.getElementById('budgetPlanSelector');
      if (!sel) return;
      if (!state.monthlyBudgets) state.monthlyBudgets = [];

      sel.innerHTML = state.monthlyBudgets.map(b => {
        const totalExp = (b.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
        return `<option value="${b.id}" ${b.id === state.activeBudgetId ? 'selected' : ''}>📋 ${escapeHtml(b.name)} [${b.month}] - مقدر: ${formatMoney(totalExp)}</option>`;
      }).join('');
    }

    function loadActiveBudgetPlan() {
      if (!state.monthlyBudgets || state.monthlyBudgets.length === 0) {
        initMonthlyBudgetUI();
      }

      let activePlan = state.monthlyBudgets.find(b => b.id === state.activeBudgetId);
      if (!activePlan) {
        activePlan = state.monthlyBudgets[0];
        state.activeBudgetId = activePlan.id;
      }

      currentBudgetMonthData = activePlan;
      ensureBudgetItems(currentBudgetMonthData);

      const inpName = document.getElementById('inpBudgetName');
      const inpMonth = document.getElementById('inpBudgetMonth');

      if (inpName) inpName.value = activePlan.name || '';
      if (inpMonth) inpMonth.value = activePlan.month || '2026-11';

      populateBudgetPlanSelector();
      renderBudgetMembersMultiPicker();
      renderMonthlyBudgetAllocations();
    }

    function loadMonthlyBudget() {
      loadActiveBudgetPlan();
    }

    function onBudgetPlanSelect(budgetId) {
      state.activeBudgetId = budgetId;
      loadActiveBudgetPlan();
      showToast(`📂 تم فتح الميزانية: (${currentBudgetMonthData.name})`);
    }

    function onBudgetNameChange(val) {
      if (currentBudgetMonthData) {
        currentBudgetMonthData.name = val;
      }
    }

    function onBudgetMonthChange(val) {
      if (currentBudgetMonthData) {
        currentBudgetMonthData.month = val;
        renderMonthlyBudgetAllocations();
      }
    }

    function onBudgetItemCategorySelect(catId) {
      const titleInp = document.getElementById('inpBudgetItemTitle');
      if (titleInp && !titleInp.value) {
        const cat = EXPENSE_CATEGORIES.find(c => c.id === catId);
        if (cat) titleInp.placeholder = `مثال: ${cat.name}...`;
      }
    }

    // رسم شريط تحديد أفراد الأسرة المتعدد للبند الجديد
    function renderBudgetMembersMultiPicker() {
      const container = document.getElementById('budgetMembersMultiPicker');
      if (!container) return;

      const members = typeof FAMILY_MEMBERS !== 'undefined' ? FAMILY_MEMBERS : ['البيت', 'ماهر', 'أية', 'محمد', 'مريم', 'الحاجة', 'النونو', 'أخرى'];
      
      container.innerHTML = members.map(m => {
        const isSelected = selectedBudgetItemMembers.includes(m);
        const avatar = (typeof MEMBER_AVATARS !== 'undefined' && MEMBER_AVATARS[m]) ? MEMBER_AVATARS[m] : '';
        const bg = isSelected ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(30, 41, 59, 0.7)';
        const border = isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)';
        const color = isSelected ? '#ffffff' : '#cbd5e1';
        const shadow = isSelected ? '0 3px 10px rgba(56, 189, 248, 0.35)' : 'none';

        return `
          <button type="button" onclick="toggleBudgetItemMember('${m}')" 
                  style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 9px; border: 1.4px solid ${border}; background: ${bg}; color: ${color}; font-size: 0.74rem; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: ${shadow};">
            ${avatar ? `<img src="${avatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">` : ''}
            <span>${m}</span>
            ${isSelected ? '<i class="fa-solid fa-check" style="font-size: 0.65rem; margin-right: 2px;"></i>' : ''}
          </button>
        `;
      }).join('');

      const textEl = document.getElementById('budgetSelectedMembersText');
      if (textEl) {
        textEl.textContent = selectedBudgetItemMembers.length > 0 ? selectedBudgetItemMembers.join(' + ') : 'البيت (مشترك)';
      }
    }

    // التبديل بين تحديد/إلغاء تحديد فرد للبند الجديد (اختيار فرد أو أكثر)
    function toggleBudgetItemMember(name) {
      if (name === 'البيت') {
        selectedBudgetItemMembers = ['البيت'];
      } else {
        // إزالة البيت إن وُجد اختيار فردي محدد
        selectedBudgetItemMembers = selectedBudgetItemMembers.filter(m => m !== 'البيت');
        if (selectedBudgetItemMembers.includes(name)) {
          selectedBudgetItemMembers = selectedBudgetItemMembers.filter(m => m !== name);
        } else {
          selectedBudgetItemMembers.push(name);
        }
        if (selectedBudgetItemMembers.length === 0) {
          selectedBudgetItemMembers = ['البيت'];
        }
      }
      renderBudgetMembersMultiPicker();
    }

    // إضافة بند مصروف جديد للخطة التقديرية بديناميكية وربط متعدد بالأفراد
    function addBudgetItemToCurrentPlan() {
      if (!currentBudgetMonthData) return;

      const catSel = document.getElementById('inpBudgetItemCategory');
      const amtInp = document.getElementById('inpBudgetItemAmount');
      const titleInp = document.getElementById('inpBudgetItemTitle');

      const catId = catSel ? catSel.value : 'other';
      const amt = parseFloat(amtInp ? amtInp.value : 0);
      let title = titleInp ? titleInp.value.trim() : '';

      if (isNaN(amt) || amt <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ تقديري صحيح للبند');
        if (amtInp) amtInp.focus();
        return;
      }

      if (!title) {
        const catObj = EXPENSE_CATEGORIES.find(c => c.id === catId);
        title = catObj ? catObj.name : 'بند مصروف';
      }

      if (!currentBudgetMonthData.items) currentBudgetMonthData.items = [];

      const newItem = {
        id: 'b-item-' + Date.now(),
        category: catId,
        title: title,
        amount: amt,
        members: selectedBudgetItemMembers.length > 0 ? [...selectedBudgetItemMembers] : ['البيت'],
        notes: ''
      };

      currentBudgetMonthData.items.push(newItem);
      syncBudgetCategoriesMap(currentBudgetMonthData);

      // تنظيف الخانات بعد الإضافة
      if (amtInp) amtInp.value = '';
      if (titleInp) titleInp.value = '';
      selectedBudgetItemMembers = ['البيت'];
      renderBudgetMembersMultiPicker();

      renderMonthlyBudgetAllocations();
      showToast(`➕ تم إضافة بند (${title} - ${formatMoney(amt)}) بنجاح! ✨`);
    }

    // حذف بند مصروف من الميزانية
    function deleteBudgetItem(itemId) {
      if (!currentBudgetMonthData || !currentBudgetMonthData.items) return;
      const it = currentBudgetMonthData.items.find(i => i.id === itemId);
      const title = it ? it.title : 'هذا البند';
      currentBudgetMonthData.items = currentBudgetMonthData.items.filter(i => i.id !== itemId);
      syncBudgetCategoriesMap(currentBudgetMonthData);
      renderMonthlyBudgetAllocations();
      showToast(`🗑️ تم حذف بند: ${title}`);
    }

    // تعديل مبلغ بند مصروف
    function editBudgetItemAmount(itemId) {
      if (!currentBudgetMonthData || !currentBudgetMonthData.items) return;
      const it = currentBudgetMonthData.items.find(i => i.id === itemId);
      if (!it) return;

      const newAmtStr = prompt(`تعديل المبلغ التقديري لبند "${it.title}" (ج.م):`, it.amount);
      if (newAmtStr === null) return;
      const newAmt = parseFloat(newAmtStr);
      if (isNaN(newAmt) || newAmt <= 0) {
        showToast('⚠️ تم إلغاء التعديل: المبلغ غير صالح');
        return;
      }
      it.amount = newAmt;
      syncBudgetCategoriesMap(currentBudgetMonthData);
      renderMonthlyBudgetAllocations();
      showToast(`✏️ تم تعديل بند "${it.title}" إلى ${formatMoney(newAmt)}`);
    }

    // رسم كافة بنود الميزانية التقديرية الحالية
    function renderMonthlyBudgetAllocations() {
      if (!currentBudgetMonthData) return;
      ensureBudgetItems(currentBudgetMonthData);

      const itemsContainer = document.getElementById('budgetItemsListContainer');
      const incCont = document.getElementById('budgetIncomeRowsContainer');
      const countBadge = document.getElementById('budgetItemsCountBadge');

      const targetMonth = currentBudgetMonthData.month || '2026-11';
      const monthExpenses = (state.transactions || []).filter(t => t.type === 'expense' && t.date && t.date.startsWith(targetMonth));
      const totalActualMonth = monthExpenses.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const totalBudgetMonth = (currentBudgetMonthData.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);

      // تحديث شريط الرقابة المالية الإجمالي (الفعلي مقابل المقدر)
      const summaryTxt = document.getElementById('budgetActualSummaryTxt');
      const progBar = document.getElementById('budgetActualProgressBar');
      if (summaryTxt) {
        const overallPct = totalBudgetMonth > 0 ? ((totalActualMonth / totalBudgetMonth) * 100).toFixed(1) : 0;
        summaryTxt.innerHTML = `المنصرف الفعلي لشهر (${targetMonth}): <strong>${formatMoney(totalActualMonth)}</strong> من أصل مقدر <strong>${formatMoney(totalBudgetMonth)}</strong> (${overallPct}%)`;
      }
      if (progBar) {
        const pctVal = totalBudgetMonth > 0 ? Math.min(100, (totalActualMonth / totalBudgetMonth) * 100) : 0;
        progBar.style.width = pctVal + '%';
        progBar.style.background = (totalActualMonth > totalBudgetMonth) ? '#ef4444' : '#38bdf8';
      }

      if (countBadge) {
        countBadge.textContent = `${(currentBudgetMonthData.items || []).length} بند`;
      }

      // رسم كروت بنود المصروفات التقديرية
      if (itemsContainer) {
        const items = currentBudgetMonthData.items || [];
        if (items.length === 0) {
          itemsContainer.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.6); border: 1.5px dashed rgba(255,255,255,0.1); border-radius: 12px; padding: 18px; text-align: center; color: #94a3b8;">
              <i class="fa-solid fa-clipboard-list" style="font-size: 1.8rem; color: #38bdf8; margin-bottom: 6px;"></i>
              <div style="font-size: 0.85rem; font-weight: 800; color: #cbd5e1;">لا توجد بنود مصروفات مضافة بعد</div>
              <div style="font-size: 0.72rem; margin-top: 3px;">اختر نوع المصروف وحدد الأفراد والمبلغ من الأعلى، ثم انقر "إضافة البند للميزانية"</div>
            </div>
          `;
        } else {
          itemsContainer.innerHTML = items.map((it, idx) => {
            const cat = EXPENSE_CATEGORIES.find(c => c.id === it.category) || { name: 'أخرى', icon: 'fa-cube', color: '#38bdf8', emoji: '📦' };
            
            // حساب المنصرف الفعلي في هذا التصنيف للشهر
            const catActual = monthExpenses.filter(t => t.category === it.category).reduce((s, t) => s + (Number(t.amount) || 0), 0);
            const isOver = catActual > it.amount;

            // شارات أفراد الأسرة المرتبطين بهذا البند
            const memberChips = (it.members || ['البيت']).map(m => {
              const avatar = (typeof MEMBER_AVATARS !== 'undefined' && MEMBER_AVATARS[m]) ? MEMBER_AVATARS[m] : '';
              return `
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; padding: 2px 7px; border-radius: 6px; font-size: 0.68rem; font-weight: 800;">
                  ${avatar ? `<img src="${avatar}" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;">` : ''}
                  ${m}
                </span>
              `;
            }).join(' ');

            return `
              <div style="background: rgba(30, 41, 59, 0.82); border: 1.4px solid ${cat.color}45; border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
                <!-- سطر العنوان والتصنيف والأفراد -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                    <div style="width: 32px; height: 32px; border-radius: 8px; background: ${cat.color}25; border: 1px solid ${cat.color}50; color: ${cat.color}; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
                      <i class="fa-solid ${cat.icon}"></i>
                    </div>
                    <div>
                      <div style="font-size: 0.86rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <span>${escapeHtml(it.title)}</span>
                        <span style="font-size: 0.65rem; background: ${cat.color}20; color: ${cat.color}; border: 1px solid ${cat.color}40; padding: 1px 6px; border-radius: 5px;">${cat.name}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px; margin-top: 3px; flex-wrap: wrap;">
                        <span style="font-size: 0.66rem; color: #94a3b8; font-weight: 700;">يخص:</span>
                        ${memberChips}
                      </div>
                    </div>
                  </div>

                  <!-- المبلغ وأزرار التعديل والحذف -->
                  <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                    <div style="font-size: 1.05rem; font-weight: 900; color: #f87171; direction: ltr;">
                      - ${formatMoney(it.amount)}
                    </div>
                    <div style="display: flex; gap: 5px;">
                      <button type="button" onclick="editBudgetItemAmount('${it.id}')" title="تعديل المبلغ" style="padding: 2px 7px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 0.68rem; font-weight: 800; cursor: pointer;">
                        <i class="fa-solid fa-pencil"></i> تعديل
                      </button>
                      <button type="button" onclick="deleteBudgetItem('${it.id}')" title="حذف البند" style="padding: 2px 7px; border-radius: 6px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; font-size: 0.68rem; font-weight: 800; cursor: pointer;">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- شريط المقارنة الحية الفعلية للتصنيف -->
                <div style="background: rgba(15, 23, 42, 0.7); border-radius: 6px; padding: 4px 8px; font-size: 0.68rem; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #94a3b8;">إجمالي منصرف تصنيف (${cat.name}) فعلياً: <strong style="color: #cbd5e1;">${formatMoney(catActual)}</strong></span>
                  <span style="font-weight: 800; color: ${isOver ? '#f87171' : '#34d399'};">
                    ${isOver ? '⚠️ تجاوز التقدير' : '✅ ضمن الميزانية'}
                  </span>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      // رسم صفوف مصادر الدخل
      if (incCont) {
        const incomes = currentBudgetMonthData.incomes || [];
        incCont.innerHTML = incomes.map((inc, idx) => `
          <div style="display: grid; grid-template-columns: 2fr 1.5fr 1fr auto; gap: 6px; align-items: center; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 9px; padding: 6px 8px;">
            <input type="text" class="form-input-custom" value="${escapeHtml(inc.name || '')}" placeholder="مصدر الدخل" onchange="updateBudgetIncome(${idx}, 'name', this.value)" style="height: 32px; font-size: 0.76rem; font-weight: 800;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <input type="number" step="500" class="form-input-custom" value="${inc.amount || 0}" oninput="updateBudgetIncome(${idx}, 'amount', this.value)" style="height: 32px; font-size: 0.84rem; font-weight: 900; text-align: center; color: #34d399; flex: 1;">
              <span style="font-size: 0.68rem; color: #94a3b8;">ج.م</span>
            </div>
            <select class="form-select-custom" onchange="updateBudgetIncome(${idx}, 'member', this.value)" style="height: 32px; font-size: 0.74rem; font-weight: 800;">
              ${(typeof FAMILY_MEMBERS !== 'undefined' ? FAMILY_MEMBERS : ['ماهر', 'أية', 'محمد', 'مريم', 'الحاجة', 'النونو', 'البيت']).map(m => `<option value="${m}" ${inc.member === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
            <button type="button" onclick="removeBudgetIncome(${idx})" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; border-radius: 6px; width: 30px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              <i class="fa-solid fa-trash-can" style="font-size: 0.75rem;"></i>
            </button>
          </div>
        `).join('');
      }

      updateBudgetKpis();
    }

    function addBudgetIncomeRow() {
      if (!currentBudgetMonthData) return;
      if (!currentBudgetMonthData.incomes) currentBudgetMonthData.incomes = [];
      currentBudgetMonthData.incomes.push({
        id: 'inc-' + Date.now(),
        name: 'مصدر دخل جديد',
        amount: 10000,
        member: 'ماهر'
      });
      renderMonthlyBudgetAllocations();
    }

    function updateBudgetIncome(idx, field, val) {
      if (!currentBudgetMonthData || !currentBudgetMonthData.incomes || !currentBudgetMonthData.incomes[idx]) return;
      if (field === 'amount') val = parseFloat(val) || 0;
      currentBudgetMonthData.incomes[idx][field] = val;
      updateBudgetKpis();
    }

    function removeBudgetIncome(idx) {
      if (!currentBudgetMonthData || !currentBudgetMonthData.incomes) return;
      currentBudgetMonthData.incomes.splice(idx, 1);
      renderMonthlyBudgetAllocations();
    }

    function updateBudgetKpis() {
      if (!currentBudgetMonthData) return;

      const totalIncome = (currentBudgetMonthData.incomes || []).reduce((s, inc) => s + (Number(inc.amount) || 0), 0);
      const totalExpense = (currentBudgetMonthData.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
      const surplus = totalIncome - totalExpense;

      const incEl = document.getElementById('budgetKpiIncome');
      const expEl = document.getElementById('budgetKpiExpense');
      const surEl = document.getElementById('budgetKpiSurplus');

      if (incEl) incEl.textContent = `+ ${formatMoney(totalIncome)}`;
      if (expEl) expEl.textContent = `- ${formatMoney(totalExpense)}`;
      if (surEl) {
        surEl.textContent = (surplus >= 0 ? '+ ' : '- ') + formatMoney(Math.abs(surplus));
        surEl.style.color = (surplus >= 0) ? '#34d399' : '#f87171';
      }
    }

    function saveMonthlyBudget() {
      if (!currentBudgetMonthData) return;
      currentBudgetMonthData.updatedAt = new Date().toISOString();
      syncBudgetCategoriesMap(currentBudgetMonthData);

      const idx = state.monthlyBudgets.findIndex(b => b.id === currentBudgetMonthData.id);
      if (idx >= 0) {
        state.monthlyBudgets[idx] = currentBudgetMonthData;
      } else {
        state.monthlyBudgets.push(currentBudgetMonthData);
      }

      try {
        localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
      } catch(e) {}

      populateBudgetPlanSelector();
      playNotificationChime();
      showToast(`💾 تم حفظ وتثبيت خطة (${currentBudgetMonthData.name}) بنجاح! ✨`);
      triggerDriveAutoSync();
    }

    function openNewBudgetPlanModal() {
      const monthInp = document.getElementById('newPlanMonthInput');
      const nameInp = document.getElementById('newPlanNameInput');
      const incInp = document.getElementById('newPlanTargetIncomeInput');
      const cloneSel = document.getElementById('newPlanCloneSourceSelect');

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const yyyyMm = nextMonth.toISOString().slice(0, 7);

      if (monthInp) monthInp.value = yyyyMm;
      if (nameInp) nameInp.value = `ميزانية شهر ${yyyyMm} التقديرية`;
      if (incInp) incInp.value = 85000;

      if (cloneSel) {
        cloneSel.innerHTML = '<option value="none">✨ خطة فارغة جديدة (قيم افتراضية متوازنة)</option>' +
          (state.monthlyBudgets || []).map(b => `<option value="${b.id}">📑 استنساخ من: ${escapeHtml(b.name)} [${b.month}]</option>`).join('');
      }

      openModal('newBudgetPlanModal');
    }

    function submitNewBudgetPlan() {
      const monthInp = document.getElementById('newPlanMonthInput');
      const nameInp = document.getElementById('newPlanNameInput');
      const incInp = document.getElementById('newPlanTargetIncomeInput');
      const cloneSel = document.getElementById('newPlanCloneSourceSelect');

      const month = monthInp && monthInp.value ? monthInp.value : '2026-12';
      const name = nameInp && nameInp.value.trim() ? nameInp.value.trim() : `ميزانية شهر ${month}`;
      const targetIncome = parseFloat(incInp ? incInp.value : 85000) || 85000;
      const cloneFromId = cloneSel ? cloneSel.value : 'none';

      let items = [];
      let incomes = [
        { id: 'inc-' + Date.now(), name: 'راتب ماهر الأساسي', amount: targetIncome, member: 'ماهر' }
      ];

      if (cloneFromId !== 'none') {
        const src = (state.monthlyBudgets || []).find(b => b.id === cloneFromId);
        if (src) {
          ensureBudgetItems(src);
          items = JSON.parse(JSON.stringify(src.items || []));
          incomes = JSON.parse(JSON.stringify(src.incomes || []));
        }
      } else {
        items = [
          { id: 'it-1', category: 'food', title: 'طعام ومشتريات وسوبرماركت', amount: 20000, members: ['البيت'], notes: '' },
          { id: 'it-2', category: 'bills', title: 'فواتير والتزامات شهرية', amount: 8000, members: ['البيت'], notes: '' },
          { id: 'it-3', category: 'transport', title: 'مواصلات وبنزين سيارة', amount: 6000, members: ['ماهر'], notes: '' },
          { id: 'it-4', category: 'education', title: 'تعليم ودروس سناتر ومذكرات', amount: 15000, members: ['محمد', 'مريم'], notes: '' },
          { id: 'it-5', category: 'daily', title: 'مصروف يومي شخصي', amount: 4000, members: ['ماهر', 'أية'], notes: '' }
        ];
      }

      const newPlan = {
        id: 'bgt-' + month + '-' + Date.now(),
        name: name,
        month: month,
        items: items,
        incomes: incomes,
        categories: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      syncBudgetCategoriesMap(newPlan);

      if (!state.monthlyBudgets) state.monthlyBudgets = [];
      state.monthlyBudgets.unshift(newPlan);
      state.activeBudgetId = newPlan.id;

      try {
        localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
      } catch(e) {}

      closeModal('newBudgetPlanModal');
      loadActiveBudgetPlan();
      showToast(`🎉 تم إنشاء وتفعيل الخطة التقديرية الجديدة: (${name})`);
      triggerDriveAutoSync();
    }

    function cloneCurrentBudgetPlan() {
      if (!currentBudgetMonthData) return;
      ensureBudgetItems(currentBudgetMonthData);

      const clone = JSON.parse(JSON.stringify(currentBudgetMonthData));
      clone.id = 'bgt-copy-' + Date.now();
      clone.name = clone.name + ' (نسخة)';
      clone.createdAt = new Date().toISOString();
      clone.updatedAt = new Date().toISOString();

      state.monthlyBudgets.unshift(clone);
      state.activeBudgetId = clone.id;

      try {
        localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
      } catch(e) {}

      loadActiveBudgetPlan();
      showToast(`📑 تم استنساخ الخطة بنجاح`);
    }

    function deleteCurrentBudgetPlan() {
      if (!currentBudgetMonthData) return;
      if ((state.monthlyBudgets || []).length <= 1) {
        showToast('⚠️ لا يمكن حذف الخطة الوحيدة المتبقية في النظام');
        return;
      }

      if (confirm(`هل أنت متأكد من حذف خطة "${currentBudgetMonthData.name}" نهائياً؟`)) {
        state.monthlyBudgets = state.monthlyBudgets.filter(b => b.id !== currentBudgetMonthData.id);
        state.activeBudgetId = state.monthlyBudgets[0].id;
        try {
          localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
        } catch(e) {}
        loadActiveBudgetPlan();
        showToast('🗑️ تم حذف الخطة بنجاح');
      }
    }

    function renderBudgetHistory() {
      const container = document.getElementById('budgetHistoryListContainer');
      if (!container) return;

      if (!state.monthlyBudgets || state.monthlyBudgets.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px;">لا توجد خطط سابقة محفوظة</div>';
        return;
      }

      container.innerHTML = state.monthlyBudgets.map(b => {
        ensureBudgetItems(b);
        const totalInc = (b.incomes || []).reduce((s, inc) => s + (Number(inc.amount) || 0), 0);
        const totalExp = (b.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
        const surplus = totalInc - totalExp;
        const isActive = (b.id === state.activeBudgetId);

        return `
          <div style="background: rgba(30, 41, 59, 0.85); border: 1.4px solid ${isActive ? '#38bdf8' : 'rgba(255,255,255,0.08)'}; border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 0.90rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
                  <span>${escapeHtml(b.name)}</span>
                  ${isActive ? '<span style="font-size: 0.65rem; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 1px 6px; border-radius: 5px;">الخطة النشطة</span>' : ''}
                </div>
                <div style="font-size: 0.70rem; color: #94a3b8; margin-top: 2px;">
                  الشهر: <strong style="color: #cbd5e1;">${b.month}</strong> • عدد البنود: <strong style="color: #38bdf8;">${(b.items || []).length} بند</strong>
                </div>
              </div>

              <div style="display: flex; gap: 6px;">
                <button type="button" onclick="restoreBudgetForView('${b.id}')" style="padding: 6px 12px; border-radius: 8px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; color: #fff; font-size: 0.74rem; font-weight: 800; cursor: pointer;">
                  <i class="fa-solid fa-folder-open"></i> عرض وتعديل
                </button>
                <button type="button" onclick="deleteBudgetFromHistory('${b.id}')" style="padding: 6px 8px; border-radius: 8px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; font-size: 0.74rem; font-weight: 800; cursor: pointer;" title="حذف">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; background: rgba(15, 23, 42, 0.6); border-radius: 8px; padding: 6px 8px; text-align: center; font-size: 0.74rem;">
              <div>
                <div style="font-size: 0.64rem; color: #34d399;">دخل متوقع</div>
                <div style="font-weight: 900; color: #34d399;">+ ${formatMoney(totalInc)}</div>
              </div>
              <div>
                <div style="font-size: 0.64rem; color: #f87171;">مصروفات مقدرة</div>
                <div style="font-weight: 900; color: #f87171;">- ${formatMoney(totalExp)}</div>
              </div>
              <div>
                <div style="font-size: 0.64rem; color: #38bdf8;">فائض / عجز</div>
                <div style="font-weight: 900; color: ${surplus >= 0 ? '#34d399' : '#f87171'};">${(surplus >= 0 ? '+ ' : '- ') + formatMoney(Math.abs(surplus))}</div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function restoreBudgetForView(budgetId) {
      state.activeBudgetId = budgetId;
      switchExpectedMainTab('monthly_budget');
    }

    function deleteBudgetFromHistory(budgetId) {
      if ((state.monthlyBudgets || []).length <= 1) {
        showToast('⚠️ لا يمكن حذف الخطة الوحيدة المتبقية في النظام');
        return;
      }
      if (confirm('هل أنت متأكد من حذف هذه الخطة من السجل؟')) {
        state.monthlyBudgets = state.monthlyBudgets.filter(b => b.id !== budgetId);
        if (state.activeBudgetId === budgetId) {
          state.activeBudgetId = state.monthlyBudgets[0].id;
        }
        try {
          localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
        } catch(e) {}
        renderBudgetHistory();
        showToast('🗑️ تم حذف الخطة من السجل');
      }
    }

    function getProratedBudgetForPeriod(periodStr) {
      if (!currentBudgetMonthData) return 0;
      ensureBudgetItems(currentBudgetMonthData);
      const totalBudget = (currentBudgetMonthData.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
      if (periodStr === 'month') return totalBudget;
      if (periodStr === 'week') return Math.round(totalBudget * (7 / 30));
      if (periodStr === 'day' || periodStr === 'today') return Math.round(totalBudget / 30);
      return totalBudget;
    }
    // -------------------------------------------------------------------------
    // 7. تبديل أشكال شارت التحليل (أعمدة - دونات - دائري - قطبي)
    // -------------------------------------------------------------------------
    
    // دالة التبديل بين أشكال شارت أفراد الأسرة (أعمدة، دونات، قطبي)
    function switchMemberChartFormat(format, btnEl) {
      state.activeMemberChartFormat = format;
      document.querySelectorAll('#paneMembers .chart-format-switcher-strip .btn-export-tool').forEach(b => {
        b.classList.remove('active');
        b.style.background = '';
        b.style.color = '';
      });
      if (btnEl) {
        btnEl.classList.add('active');
        btnEl.style.background = 'rgba(56, 189, 248, 0.2)';
        btnEl.style.color = '#38bdf8';
      }
      if (typeof renderMembersChart === 'function') {
        renderMembersChart();
      }
    }

function switchCategoryChartFormat(format, btnEl) {
      state.activeCategoryChartFormat = format;
      execCatChartType = format;
      document.querySelectorAll('#paneCategories .chart-format-switcher-strip .btn-export-tool').forEach(b => {
        b.classList.remove('active');
        b.style.background = '';
        b.style.color = '';
      });
      if (btnEl) {
        btnEl.classList.add('active');
        btnEl.style.background = 'rgba(56, 189, 248, 0.2)';
        btnEl.style.color = '#38bdf8';
      }

      if (typeof renderCategoryChart === 'function') {
        renderCategoryChart();
      }
    }
