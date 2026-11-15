/**
 * budget-audit-engine.js (v5.3.73 - Complete Financial Audit & Control Suite)
 * المعمارية الشاملة لمنظومة الموازنات والرقابة المالية والتدقيق الجنائي المحاسبي
 * Family Expense Tracker - Executive Budgeting, Forensic Audit & BI Engine
 */

window.BudgetAuditEngine = (() => {
  // الحالة الداخلية لمنظومة الرقابة المالية
  let activeTimePeriod = 'month'; // 'today', 'week', 'month', 'prev_month', 'all', 'custom'
  let customStartDate = null;
  let customEndDate = null;

  let activeProjectTimePeriod = 'all'; // 'all', 'month', 'week', 'today', 'custom'
  let projectCustomStart = null;
  let projectCustomEnd = null;

  let compPeriodA = null; // defaults to current month
  let compPeriodB = null; // defaults to previous month

  let activeHistoryArchiveTab = 'monthly'; // 'monthly', 'projects'

  function ensureBudgetItems(b) {
    if (!b) return;
    if (!b.items || !Array.isArray(b.items) || b.items.length === 0) {
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
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str || '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMoneyVal(num) {
    if (typeof formatMoney === 'function') {
      return formatMoney(num);
    }
    const n = Number(num) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م';
  }

  // =========================================================================
  // 1. خوارزمية الحساب التناسبي للفترة (Proration Engine)
  // =========================================================================

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function isFixedExpenseItem(item) {
    if (!item) return false;
    if (item.isFixed === true) return true;
    const cat = String(item.category || '').toLowerCase();
    const title = String(item.title || '').toLowerCase();
    return (
      cat === 'rent' ||
      cat === 'housing' ||
      cat === 'education' ||
      title.includes('إيجار') ||
      title.includes('قسط') ||
      title.includes('اشتراك') ||
      title.includes('سنوي') ||
      title.includes('مقطوع')
    );
  }

  function calculateProratedAmount(item, period, targetMonthStr, startD, endD) {
    const monthlyAmt = Number(item.amount) || 0;
    if (monthlyAmt === 0) return 0;

    // المصاريف الثابتة والمقطوعة تعرض بكامل قيمتها دون تقسيم
    if (isFixedExpenseItem(item)) {
      return monthlyAmt;
    }

    const [year, month] = (targetMonthStr || '2026-11').split('-').map(Number);
    const daysInMonth = getDaysInMonth(year, month) || 30;

    switch (period) {
      case 'today':
        return monthlyAmt / daysInMonth;
      case 'week':
        return (monthlyAmt / daysInMonth) * 7;
      case 'prev_month':
      case 'month':
      case 'all':
        return monthlyAmt;
      case 'custom': {
        if (!startD || !endD) return monthlyAmt;
        const d1 = new Date(startD);
        const d2 = new Date(endD);
        const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
        return (monthlyAmt / daysInMonth) * diffDays;
      }
      default:
        return monthlyAmt;
    }
  }

  function getTransactionsForPeriod(transactions, period, targetMonthStr, startD, endD) {
    if (!Array.isArray(transactions)) return [];
    const now = new Date();
    const todayStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(now) : now.toISOString().slice(0, 10);
    const [year, month] = (targetMonthStr || todayStr.slice(0, 7)).split('-').map(Number);

    switch (period) {
      case 'today':
        return transactions.filter(t => t.date === todayStr);
      case 'week': {
        const d = new Date(now);
        const day = d.getDay(); // 0 is Sunday
        const diffToSat = (day + 1) % 7; // Saturday as week start
        const sat = new Date(d);
        sat.setDate(d.getDate() - diffToSat);
        const satStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(sat) : sat.toISOString().slice(0, 10);
        return transactions.filter(t => t.date >= satStr && t.date <= todayStr);
      }
      case 'month':
        return transactions.filter(t => t.date && t.date.startsWith(targetMonthStr || todayStr.slice(0, 7)));
      case 'prev_month': {
        const prevMonthDate = new Date(year, month - 2, 1);
        const prevStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        return transactions.filter(t => t.date && t.date.startsWith(prevStr));
      }
      case 'custom':
        if (!startD || !endD) return transactions;
        return transactions.filter(t => t.date && t.date >= startD && t.date <= endD);
      case 'all':
      default:
        return transactions.filter(t => t.date && t.date.startsWith(targetMonthStr || todayStr.slice(0, 7)));
    }
  }

  // =========================================================================
  // 2. ترقية "موازنة الشهر النشطة" (Task 1)
  // =========================================================================

  function renderTimeFilterStrip(containerId, activeP, onSelectFnName, customStart, customEnd) {
    const periods = [
      { key: 'today', label: 'اليوم' },
      { key: 'week', label: 'هذا الأسبوع' },
      { key: 'month', label: 'هذا الشهر (افتراضي)' },
      { key: 'prev_month', label: 'الشهر السابق' },
      { key: 'all', label: 'الكل' },
      { 
        key: 'custom', 
        label: (activeP === 'custom' && customStart && customEnd) 
          ? `📅 مخصص (${customStart.slice(5)} إلى ${customEnd.slice(5)})` 
          : '📅 مخصص' 
      }
    ];

    return `
      <div class="budget-time-filter-strip" style="display: flex; gap: 5px; overflow-x: auto; padding: 4px 0 8px; margin-bottom: 10px; scrollbar-width: none;">
        ${periods.map(p => {
          const isActive = (p.key === activeP);
          const bg = isActive ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(15, 23, 42, 0.75)';
          const color = isActive ? '#fff' : '#94a3b8';
          const border = isActive ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.1)';
          return `
            <button type="button" onclick="${onSelectFnName}('${p.key}')" style="padding: 5px 11px; border-radius: 8px; font-size: 0.72rem; font-weight: 850; background: ${bg}; color: ${color}; border: 1px solid ${border}; cursor: pointer; white-space: nowrap; transition: all 0.2s;">
              ${p.label}
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderActualVsEstimatedTable(plan, targetTransactions, period) {
    if (!plan) return '';
    if (typeof ensureBudgetItems === 'function') {
      ensureBudgetItems(plan);
    }

    if (!plan.items || plan.items.length === 0) {
      return `
        <div style="text-align: center; padding: 18px; color: #94a3b8; font-size: 0.78rem; background: rgba(15, 23, 42, 0.4); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
          لا توجد بنود ميزانية مقدرة للشهر الحالي. أضف بنود الموازنة لتفعيل جدول الرقابة الفوري.
        </div>
      `;
    }

    const targetMonth = plan.month || '2026-11';
    const expenseTxs = targetTransactions.filter(t => t.type === 'expense');

    let totalEst = 0;
    let totalAct = 0;

    const rowsHtml = plan.items.map(it => {
      const cat = (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []).find(c => c.id === it.category) || { name: it.title || 'بند', icon: 'fa-tag', color: '#38bdf8' };
      const proratedEst = calculateProratedAmount(it, period, targetMonth, customStartDate, customEndDate);
      totalEst += proratedEst;

      // حساب الفعلي المسجل لهذا البند
      const matchingTxs = (typeof getExpensesForBudgetItem === 'function')
        ? getExpensesForBudgetItem(it, expenseTxs, plan.items)
        : expenseTxs.filter(t => (t.category === it.category || t.budgetItemId === it.id));
      const actualAmt = matchingTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      totalAct += actualAmt;

      const diff = proratedEst - actualAmt;
      const isOver = diff < 0;
      const usagePct = proratedEst > 0 ? (actualAmt / proratedEst) * 100 : (actualAmt > 0 ? 100 : 0);

      // Micro-Progress Bar color
      let barColor = '#10b981'; // Green < 85%
      if (usagePct >= 85 && usagePct <= 100) {
        barColor = '#f59e0b'; // Yellow
      } else if (usagePct > 100) {
        barColor = '#ef4444'; // Red
      }

      const diffColor = isOver ? '#f87171' : '#34d399';
      const diffSign = isOver ? '- ' : '+ ';

      return `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.74rem;">
          <td style="padding: 8px 6px; text-align: right;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid ${cat.icon}" style="color: ${cat.color || '#38bdf8'}; font-size: 0.8rem;"></i>
              <span style="font-weight: 850; color: #f1f5f9;">${escapeHtml(it.title || cat.name)}</span>
            </div>
            <div style="font-size: 0.64rem; color: #64748b; margin-top: 2px;">
              ${(it.members && it.members.length > 0) ? it.members.join(' · ') : 'البيت'}
            </div>
          </td>
          <td style="padding: 8px 4px; text-align: center; color: #93c5fd; font-weight: 800; font-family: var(--font-numbers); direction: ltr;">
            ${formatMoneyVal(proratedEst)}
          </td>
          <td style="padding: 8px 4px; text-align: center; color: #f8fafc; font-weight: 800; font-family: var(--font-numbers); direction: ltr;">
            ${formatMoneyVal(actualAmt)}
          </td>
          <td style="padding: 8px 4px; text-align: center; color: ${diffColor}; font-weight: 900; font-family: var(--font-numbers); direction: ltr;">
            ${diffSign}${formatMoneyVal(Math.abs(diff))}
          </td>
          <td style="padding: 8px 6px; text-align: center; min-width: 60px;">
            <div style="display: flex; align-items: center; gap: 4px; justify-content: center;">
              <div style="flex: 1; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; min-width: 40px;">
                <div style="width: ${Math.min(100, usagePct)}%; height: 100%; background: ${barColor}; border-radius: 4px;"></div>
              </div>
              ${isOver ? `<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; font-size: 0.65rem;" title="تجاوز الميزانية!"></i>` : ''}
            </div>
            <span style="font-size: 0.62rem; color: #94a3b8; font-weight: 700;">${usagePct.toFixed(0)}%</span>
          </td>
        </tr>
      `;
    }).join('');

    const totalDiff = totalEst - totalAct;
    const totalIsOver = totalDiff < 0;
    const totalDiffColor = totalIsOver ? '#f87171' : '#34d399';
    const totalSign = totalIsOver ? '- ' : '+ ';
    const totalPct = totalEst > 0 ? (totalAct / totalEst) * 100 : 0;

    return `
      <div style="background: rgba(15, 23, 42, 0.7); border: 1.2px solid rgba(56, 189, 248, 0.25); border-radius: 14px; overflow: hidden; margin-bottom: 14px;">
        <div style="padding: 8px 12px; background: rgba(30, 41, 59, 0.6); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="font-size: 0.80rem; font-weight: 850; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-table-list"></i>
            <span>ميزان المقارنة اللحظي (التقديري vs الفعلي)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 0.66rem; color: #94a3b8; background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 6px;">
              الفترة: ${getPeriodLabel(period)}
            </span>
            <button type="button" onclick="BudgetAuditEngine.exportBudgetToExcel()" style="padding: 2px 7px; border-radius: 6px; font-size: 0.64rem; font-weight: 850; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; cursor: pointer; display: flex; align-items: center; gap: 3px;" title="تصدير موازنة الشهر إلى Excel">
              <i class="fa-solid fa-file-excel"></i> <span>تصدير</span>
            </button>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: right;">
            <thead>
              <tr style="background: rgba(15, 23, 42, 0.9); font-size: 0.68rem; color: #94a3b8; border-bottom: 1.5px solid rgba(255, 255, 255, 0.1);">
                <th style="padding: 7px 6px;">التصنيف / البند</th>
                <th style="padding: 7px 4px; text-align: center;">التقديري</th>
                <th style="padding: 7px 4px; text-align: center;">الفعلي</th>
                <th style="padding: 7px 4px; text-align: center;">الفارق (الانحراف)</th>
                <th style="padding: 7px 6px; text-align: center;">الاستهلاك</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr style="background: rgba(15, 23, 42, 0.95); font-weight: 900; font-size: 0.76rem; border-top: 1.5px solid rgba(56, 189, 248, 0.3);">
                <td style="padding: 9px 6px; color: #cbd5e1;">الإجمالي للفترة:</td>
                <td style="padding: 9px 4px; text-align: center; color: #38bdf8; font-family: var(--font-numbers); direction: ltr;">${formatMoneyVal(totalEst)}</td>
                <td style="padding: 9px 4px; text-align: center; color: #f8fafc; font-family: var(--font-numbers); direction: ltr;">${formatMoneyVal(totalAct)}</td>
                <td style="padding: 9px 4px; text-align: center; color: ${totalDiffColor}; font-family: var(--font-numbers); direction: ltr;">${totalSign}${formatMoneyVal(Math.abs(totalDiff))}</td>
                <td style="padding: 9px 6px; text-align: center; color: #fbbf24;">${totalPct.toFixed(0)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  }

  // 3. قراءة أفراد الأسرة ديناميكياً ودقة المصاريف المشتركة
  function renderFamilyMemberBreakdown(plan, targetTransactions, period) {
    if (!plan) return '';
    if (typeof ensureBudgetItems === 'function') ensureBudgetItems(plan);
    if (!plan.items) return '';

    // سحب أفراد الأسرة ديناميكياً من بيانات التطبيق بدلاً من التثبيت
    let rawMembers = [];
    if (Array.isArray(state.members) && state.members.length > 0) {
      rawMembers = state.members.map(m => typeof m === 'string' ? m : (m.name || m.id));
    } else if (typeof DEFAULT_MEMBERS !== 'undefined' && Array.isArray(DEFAULT_MEMBERS)) {
      rawMembers = DEFAULT_MEMBERS.map(m => typeof m === 'string' ? m : (m.name || m.id));
    } else {
      rawMembers = ['ماهر', 'أية', 'محمد', 'مريم'];
    }

    // إزالة التكرار وإضافة بطاقة المصاريف العائلية المشتركة
    const membersList = Array.from(new Set(rawMembers.filter(m => m && !['البيت', 'العائلة', 'الكل'].includes(m))));
    membersList.push('مصاريف عائلية مشتركة');

    const expenseTxs = targetTransactions.filter(t => t.type === 'expense');

    const memberCards = membersList.map(m => {
      const isShared = (m === 'مصاريف عائلية مشتركة');

      let memberEst = 0;
      plan.items.forEach(it => {
        const itMems = (it.members && it.members.length > 0) ? it.members : ['البيت'];
        const isItemShared = itMems.includes('البيت') || itMems.includes('الكل') || itMems.includes('العائلة');
        
        if (isShared && isItemShared) {
          memberEst += calculateProratedAmount(it, period, plan.month, customStartDate, customEndDate);
        } else if (!isShared && itMems.includes(m)) {
          memberEst += calculateProratedAmount(it, period, plan.month, customStartDate, customEndDate) / itMems.length;
        }
      });

      // المصروف الفعلي المطابق
      const memberAct = expenseTxs.filter(t => {
        const tMem = (t.member || t.author || '').trim();
        if (isShared) {
          return !tMem || tMem === 'البيت' || tMem === 'العائلة' || !membersList.includes(tMem);
        }
        return tMem === m;
      }).reduce((s, t) => s + (Number(t.amount) || 0), 0);

      if (memberEst === 0 && memberAct === 0) return '';

      const diff = memberEst - memberAct;
      const isOver = diff < 0;
      const pct = memberEst > 0 ? (memberAct / memberEst) * 100 : (memberAct > 0 ? 100 : 0);

      return `
        <div style="background: rgba(15, 23, 42, 0.65); border: 1.2px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid ${isShared ? 'fa-house-chimney' : 'fa-user'}" style="color: ${isShared ? '#38bdf8' : '#a855f7'}; font-size: 0.8rem;"></i>
              <span style="font-size: 0.78rem; font-weight: 850; color: #f1f5f9;">${m}</span>
            </div>
            <span style="font-size: 0.68rem; font-weight: 850; color: ${isOver ? '#f87171' : '#34d399'};">
              ${isOver ? 'تجاوز' : 'وفر'}: ${(typeof formatMoneyVal === 'function') ? formatMoneyVal(Math.abs(diff)) : Math.abs(diff).toFixed(2)}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.70rem; color: #94a3b8;">
            <span>المقدر: <strong style="color: #cbd5e1;">${(typeof formatMoneyVal === 'function') ? formatMoneyVal(memberEst) : memberEst.toFixed(2)}</strong></span>
            <span>الفعلي: <strong style="color: #f8fafc;">${(typeof formatMoneyVal === 'function') ? formatMoneyVal(memberAct) : memberAct.toFixed(2)}</strong></span>
          </div>

          <div style="height: 5px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; margin-top: 2px;">
            <div style="width: ${Math.min(100, pct)}%; height: 100%; background: ${pct > 100 ? '#ef4444' : (pct >= 85 ? '#f59e0b' : '#10b981')}; border-radius: 4px;"></div>
          </div>
        </div>
      `;
    }).filter(Boolean).join('');

    return `
      <div style="margin-top: 14px; margin-bottom: 14px;">
        <div style="font-size: 0.80rem; font-weight: 850; color: #a855f7; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
          <i class="fa-solid fa-users-viewfinder"></i>
          <span>مقارنة وتوزيع أفراد الأسرة في الموازنة:</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;">
          ${memberCards}
        </div>
      </div>
    `;
  }

  function getPeriodLabel(period) {
    const map = {
      today: 'اليوم',
      week: 'هذا الأسبوع',
      month: 'هذا الشهر',
      prev_month: 'الشهر السابق',
      all: 'كامل الفترة',
      custom: 'فترة مخصصة'
    };
    return map[period] || 'الشهر الحالي';
  }

  // =========================================================================
  // 3. ترقية "موازنات المشاريع" (Task 2)
  // =========================================================================

  function renderProjectBudgetsAdvanced() {
    const container = document.getElementById('panelProjectBudgets');
    if (!container) return;

    const known = typeof getKnownProjects === 'function'
      ? getKnownProjects().filter(p => !['all', '__no_project__', '__new_project__'].includes(p))
      : [];
    (state.monthlyBudgets || []).forEach(b => {
      if (b.project && b.project.trim() && !known.includes(b.project)) known.push(b.project);
    });
    (state.transactions || []).forEach(t => {
      if (t.project && t.project.trim() && !['all', '__no_project__', '__new_project__'].includes(t.project) && !known.includes(t.project)) {
        known.push(t.project);
      }
    });

    if (known.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px 14px; color: #94a3b8; background: rgba(15, 23, 42, 0.5); border-radius: 14px; border: 1.5px dashed rgba(255,255,255,0.1);">
          <i class="fa-solid fa-trowel-bricks" style="font-size: 2rem; color: #38bdf8; margin-bottom: 8px;"></i>
          <div style="font-size: 0.90rem; font-weight: 850; color: #f1f5f9; margin-bottom: 4px;">لا توجد مشاريع مسجلة حالياً</div>
          <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 12px;">يمكنك ربط العمليات بمشاريع محددة (مثل: تشطيب شقة، صيانة سيارة) لرصد ميزانياتها ومتابعتها بدقة.</div>
        </div>
      `;
      return;
    }

    if (!window.selectedProjectBudgetName || !known.includes(window.selectedProjectBudgetName)) {
      window.selectedProjectBudgetName = known[0];
    }
    const curProject = window.selectedProjectBudgetName;

    // Plan for project
    let plan = (state.monthlyBudgets || []).find(b => b.project === curProject);
    const allProjectTxs = (state.transactions || []).filter(t => t.project === curProject && t.type === 'expense');
    const totalActAll = allProjectTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);

    // Selector buttons for projects
    const projectPills = known.map(p => {
      const isSel = (p === curProject);
      return `
        <button type="button" onclick="BudgetAuditEngine.selectProject('${p}')" style="padding: 5px 12px; border-radius: 9px; font-size: 0.74rem; font-weight: 850; background: ${isSel ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(15, 23, 42, 0.75)'}; color: ${isSel ? '#fff' : '#94a3b8'}; border: 1px solid ${isSel ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255,255,255,0.1)'}; cursor: pointer; white-space: nowrap;">
          ${escapeHtml(p)}
        </button>
      `;
    }).join('');

    // إذا لم يكن للمشروع ميزانية تقديرية مرصودة (إلغاء توليد الأرقام الوهمية العشوائية تماماً)
    if (!plan || !plan.items || plan.items.length === 0) {
      container.innerHTML = `
        <div style="margin-bottom: 12px;">
          <!-- شريط اختيار المشروع -->
          <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 10px; scrollbar-width: none;">
            ${projectPills}
          </div>

          <!-- بطاقة التنبيه الإرشادية الأنيقة بدون تزوير بيانات -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px dashed rgba(56, 189, 248, 0.4); border-radius: 14px; padding: 20px 16px; text-align: center; margin-bottom: 14px;">
            <i class="fa-solid fa-clipboard-list" style="font-size: 2.2rem; color: #38bdf8; margin-bottom: 10px;"></i>
            <div style="font-size: 0.94rem; font-weight: 900; color: #f8fafc; margin-bottom: 6px;">
              لم يتم رصد ميزانية تقديرية لمشروع (${escapeHtml(curProject)}) بعد
            </div>
            <div style="font-size: 0.76rem; color: #94a3b8; margin-bottom: 14px;">
              إجمالي المنصرف الفعلي المسجل لهذا المشروع حتى اللحظة: 
              <strong style="color: #f43f5e; font-size: 0.88rem; font-family: var(--font-numbers); direction: ltr;">
                ${formatMoneyVal(totalActAll)}
              </strong>
            </div>
            <button type="button" onclick="openNewBudgetPlanModal('${escapeHtml(curProject)}')" style="padding: 8px 18px; border-radius: 10px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; color: #fff; font-size: 0.78rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);">
              <i class="fa-solid fa-plus"></i> <span>+ رصد ميزانية تقديرية للمشروع</span>
            </button>
          </div>

          ${allProjectTxs.length > 0 ? `
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px;">
              <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px;">
                <i class="fa-solid fa-receipt"></i> تفصيل المنصرف الفعلي المسجل (${allProjectTxs.length} عمليات):
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${allProjectTxs.slice(0, 5).map(t => `
                  <div style="display: flex; justify-content: space-between; font-size: 0.72rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;">
                    <span style="color: #e2e8f0;">${escapeHtml(t.title || t.notes || t.category)}</span>
                    <strong style="color: #f87171; font-family: var(--font-numbers); direction: ltr;">-${formatMoneyVal(t.amount)}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
      return;
    }

    if (plan && typeof ensureBudgetItems === 'function') {
      ensureBudgetItems(plan);
    }

    // Filter project txs by project time period
    const filteredTxs = getTransactionsForPeriod(allProjectTxs, activeProjectTimePeriod, null, projectCustomStart, projectCustomEnd);

    const totalEst = (plan.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
    const totalActPeriod = filteredTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const remainingSafe = Math.max(0, totalEst - totalActAll);
    const overallPct = totalEst > 0 ? (totalActAll / totalEst) * 100 : 0;

    // Project items matrix
    const itemsMatrixHtml = (plan.items && plan.items.length > 0)
      ? plan.items.map(it => {
          const itemAct = filteredTxs.filter(t => t.category === it.category || t.budgetItemId === it.id).reduce((s, t) => s + (Number(t.amount) || 0), 0);
          const est = Number(it.amount) || 0;
          const diff = est - itemAct;
          const isOver = diff < 0;
          const pct = est > 0 ? Math.min(100, Math.round((itemAct / est) * 100)) : 0;

          return `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.74rem;">
              <td style="padding: 7px 6px; font-weight: 850; color: #f1f5f9;">${escapeHtml(it.title || 'بند المشروع')}</td>
              <td style="padding: 7px 4px; text-align: center; color: #93c5fd; font-family: var(--font-numbers); direction: ltr;">${formatMoneyVal(est)}</td>
              <td style="padding: 7px 4px; text-align: center; color: #f8fafc; font-family: var(--font-numbers); direction: ltr;">${formatMoneyVal(itemAct)}</td>
              <td style="padding: 7px 4px; text-align: center; color: ${isOver ? '#f87171' : '#34d399'}; font-family: var(--font-numbers); direction: ltr;">${isOver ? '- ' : '+ '}${formatMoneyVal(Math.abs(diff))}</td>
              <td style="padding: 7px 6px; text-align: center;">
                <div style="height: 5px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; min-width: 45px;">
                  <div style="width: ${pct}%; height: 100%; background: ${pct > 100 ? '#ef4444' : (pct >= 85 ? '#f59e0b' : '#10b981')};"></div>
                </div>
                <span style="font-size: 0.60rem; color: #94a3b8;">${pct}%</span>
              </td>
            </tr>
          `;
        }).join('')
      : `<tr><td colspan="5" style="text-align: center; padding: 14px; color: #94a3b8; font-size: 0.72rem;">لم يتم تحديد بنود مقدرة لهذا المشروع بعد</td></tr>`;

    // Member spending for project (Dynamic members)
    const membersList = Array.from(new Set(((state.members || []).map(m => typeof m === 'string' ? m : (m.name || m.id))).filter(m => m && !['البيت', 'العائلة'].includes(m))));
    membersList.push('البيت');

    const memberSpendHtml = membersList.map(m => {
      const isHouse = (m === 'البيت');
      const spent = filteredTxs.filter(t => {
        const tMem = (t.member || t.author || '').trim();
        if (isHouse) return !tMem || tMem === 'البيت' || tMem === 'العائلة';
        return tMem === m;
      }).reduce((s, t) => s + (Number(t.amount) || 0), 0);

      if (spent === 0) return '';
      return `
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 6px 10px; font-size: 0.70rem; display: flex; justify-content: space-between;">
          <span style="color: #cbd5e1; font-weight: 800;">👤 ${m}</span>
          <strong style="color: #38bdf8; font-family: var(--font-numbers); direction: ltr;">${formatMoneyVal(spent)}</strong>
        </div>
      `;
    }).filter(Boolean).join('');

    container.innerHTML = `
      <div style="margin-bottom: 12px;">
        <!-- شريط اختيار المشروع -->
        <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 10px; scrollbar-width: none;">
          ${projectPills}
        </div>

        <!-- بطاقة الإنجاز والمتبقي الآمن -->
        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.85)); border: 1.2px solid rgba(56, 189, 248, 0.35); border-radius: 14px; padding: 12px 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 0.86rem; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-chart-pie"></i>
              <span>مؤشر إنجاز ميزانية المشروع: (${curProject})</span>
            </div>
            <span style="font-size: 0.72rem; font-weight: 850; color: ${overallPct > 100 ? '#ef4444' : '#10b981'};">
              ${overallPct.toFixed(1)}% تم الصرف
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 8px;">
            <div style="background: rgba(15, 23, 42, 0.6); padding: 6px; border-radius: 8px; text-align: center;">
              <div style="font-size: 0.62rem; color: #94a3b8;">الميزانية المقدرة</div>
              <div style="font-size: 0.78rem; font-weight: 900; color: #38bdf8; direction: ltr;">${formatMoneyVal(totalEst)}</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); padding: 6px; border-radius: 8px; text-align: center;">
              <div style="font-size: 0.62rem; color: #94a3b8;">المنصرف الكلي</div>
              <div style="font-size: 0.78rem; font-weight: 900; color: #f43f5e; direction: ltr;">${formatMoneyVal(totalActAll)}</div>
            </div>
            <div style="background: rgba(15, 23, 42, 0.6); padding: 6px; border-radius: 8px; text-align: center;">
              <div style="font-size: 0.62rem; color: #94a3b8;">المتبقي الآمن</div>
              <div style="font-size: 0.78rem; font-weight: 900; color: #34d399; direction: ltr;">${formatMoneyVal(remainingSafe)}</div>
            </div>
          </div>

          <div style="height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden;">
            <div style="width: ${Math.min(100, overallPct)}%; height: 100%; background: ${overallPct > 100 ? '#ef4444' : (overallPct >= 85 ? '#f59e0b' : '#10b981')};"></div>
          </div>
        </div>

        <!-- شريط الفلاتر الزمنية للمشروع -->
        ${renderTimeFilterStrip('projectTimeFilters', activeProjectTimePeriod, 'BudgetAuditEngine.selectProjectPeriod', projectCustomStart, projectCustomEnd)}

        <!-- جدول بنود المشروع الثنائي (Project Items Matrix) -->
        <div style="background: rgba(15, 23, 42, 0.7); border: 1.2px solid rgba(255, 255, 255, 0.08); border-radius: 12px; overflow: hidden; margin-bottom: 12px;">
          <div style="padding: 7px 10px; background: rgba(30, 41, 59, 0.6); font-size: 0.78rem; font-weight: 850; color: #f1f5f9;">
            <i class="fa-solid fa-list-check" style="color: #38bdf8;"></i> مصفوفة بنود المشروع (المقدر vs الفعلي)
          </div>
          <table style="width: 100%; border-collapse: collapse; text-align: right;">
            <thead>
              <tr style="background: rgba(15, 23, 42, 0.85); font-size: 0.66rem; color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                <th style="padding: 6px;">البند</th>
                <th style="padding: 6px; text-align: center;">التقديري</th>
                <th style="padding: 6px; text-align: center;">الفعلي</th>
                <th style="padding: 6px; text-align: center;">الفارق</th>
                <th style="padding: 6px; text-align: center;">الإنجاز</th>
              </tr>
            </thead>
            <tbody>
              ${itemsMatrixHtml}
            </tbody>
          </table>
        </div>

        <!-- توزيع مهام الصرف حسب أفراد الأسرة -->
        ${memberSpendHtml ? `
          <div style="margin-top: 10px;">
            <div style="font-size: 0.76rem; font-weight: 850; color: #a855f7; margin-bottom: 6px;">
              <i class="fa-solid fa-user-gear"></i> توزيع الصرف في المشروع حسب أفراد الأسرة:
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 6px;">
              ${memberSpendHtml}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // =========================================================================
  // 4. بناء "ميزان المقارنات والرقابة المالية" والرادار الجنائي (Task 3)
  // =========================================================================

  function renderExecutiveComparisonsAudit() {
    const container = document.getElementById('panelBudgetComparisons');
    if (!container) return;

    const allTxs = state.transactions || [];
    const now = new Date();
    const curMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    // إعداد الشهور المتاحة ديناميكياً من العمليات والموازنات
    const availableMonths = Array.from(new Set(
      allTxs.map(t => t.date ? t.date.slice(0, 7) : null).concat(
        (state.monthlyBudgets || []).map(b => b.month)
      ).filter(Boolean)
    )).sort().reverse();
    if (availableMonths.length === 0) availableMonths.push(curMonthStr);

    if (!compPeriodA || !availableMonths.includes(compPeriodA)) compPeriodA = availableMonths[0];
    if (!compPeriodB || !availableMonths.includes(compPeriodB)) compPeriodB = availableMonths[1] || availableMonths[0];

    const monthOptionsA = availableMonths.map(m => `<option value="${m}" ${m === compPeriodA ? 'selected' : ''}>شهر ${m}</option>`).join('');
    const monthOptionsB = availableMonths.map(m => `<option value="${m}" ${m === compPeriodB ? 'selected' : ''}>شهر ${m}</option>`).join('');

    const txsA = allTxs.filter(t => t.date && t.date.startsWith(compPeriodA) && t.type === 'expense');
    const txsB = allTxs.filter(t => t.date && t.date.startsWith(compPeriodB) && t.type === 'expense');

    const totalA = txsA.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const totalB = txsB.reduce((s, t) => s + (Number(t.amount) || 0), 0);

    // Spending Growth Rate
    const growthRate = totalB > 0 ? (((totalA - totalB) / totalB) * 100) : 0;
    const isGrowthDown = growthRate <= 0;

    // Income
    const incomeTxs = allTxs.filter(t => t.date && t.date.startsWith(compPeriodA) && t.type === 'income');
    const totalIncome = incomeTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const netSavings = totalIncome - totalA;

    // Budget Adherence Score
    const activePlan = (state.monthlyBudgets || []).find(b => b.month === compPeriodA) || (state.monthlyBudgets || [])[0];
    if (activePlan && typeof ensureBudgetItems === 'function') {
      ensureBudgetItems(activePlan);
    }
    const planTotal = activePlan ? (activePlan.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0) : 0;
    let adherenceScore = 100;
    if (planTotal > 0) {
      const diffRatio = Math.abs(totalA - planTotal) / planTotal;
      adherenceScore = Math.max(0, Math.round((1 - diffRatio) * 100));
    }

    // تجميع المنصرف لكل تصنيف في الفترتين لبناء ميزان الفروقات الشامل
    const catMapA = {};
    const catMapB = {};
    txsA.forEach(t => { catMapA[t.category] = (catMapA[t.category] || 0) + (Number(t.amount) || 0); });
    txsB.forEach(t => { catMapB[t.category] = (catMapB[t.category] || 0) + (Number(t.amount) || 0); });

    const allCatKeys = Array.from(new Set([...Object.keys(catMapA), ...Object.keys(catMapB)]));
    const comparisonRows = allCatKeys.map(catId => {
      const catObj = (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []).find(c => c.id === catId) || { name: catId, icon: 'fa-tag', color: '#38bdf8' };
      const valA = catMapA[catId] || 0;
      const valB = catMapB[catId] || 0;
      const diff = valA - valB;
      const pctChange = valB > 0 ? ((diff / valB) * 100) : (valA > 0 ? 100 : 0);
      const isUp = diff > 0;

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
          <td style="padding: 7px 6px;">
            <i class="fa-solid ${catObj.icon || 'fa-tag'}" style="color: ${catObj.color || '#38bdf8'}; margin-left: 4px;"></i>
            <span style="font-weight: 800; color: #f1f5f9;">${catObj.name}</span>
          </td>
          <td style="padding: 7px 4px; text-align: center; color: #93c5fd; font-family: var(--font-numbers); direction: ltr;">${formatMoneyVal(valA)}</td>
          <td style="padding: 7px 4px; text-align: center; color: #cbd5e1; font-family: var(--font-numbers); direction: ltr;">${formatMoneyVal(valB)}</td>
          <td style="padding: 7px 4px; text-align: center; color: ${isUp ? '#f87171' : '#34d399'}; font-family: var(--font-numbers); direction: ltr;">
            ${isUp ? '+ ' : '- '}${formatMoneyVal(Math.abs(diff))}
          </td>
          <td style="padding: 7px 6px; text-align: center; font-weight: 850; color: ${isUp ? '#f87171' : '#34d399'};">
            ${isUp ? '📈 +' : '📉 '}${pctChange.toFixed(0)}%
          </td>
        </tr>
      `;
    }).join('');

    // 1. مصفوفة الأفراد المتقاطعة (Cross-Member Matrix)
    let rawMembers = [];
    if (Array.isArray(state.members) && state.members.length > 0) {
      rawMembers = state.members.map(m => typeof m === 'string' ? m : (m.name || m.id));
    } else {
      rawMembers = ['ماهر', 'أية', 'محمد', 'مريم'];
    }
    const crossMembers = Array.from(new Set(rawMembers.filter(m => m && !['البيت', 'العائلة'].includes(m))));
    crossMembers.push('البيت');

    const crossMemberRows = crossMembers.map(m => {
      const isHouse = (m === 'البيت');
      const spentA = txsA.filter(t => {
        const tMem = (t.member || t.author || '').trim();
        if (isHouse) return !tMem || tMem === 'البيت' || tMem === 'العائلة';
        return tMem === m;
      }).reduce((s, t) => s + (Number(t.amount) || 0), 0);

      const spentB = txsB.filter(t => {
        const tMem = (t.member || t.author || '').trim();
        if (isHouse) return !tMem || tMem === 'البيت' || tMem === 'العائلة';
        return tMem === m;
      }).reduce((s, t) => s + (Number(t.amount) || 0), 0);

      if (spentA === 0 && spentB === 0) return '';
      const mDiff = spentA - spentB;

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.72rem;">
          <td style="padding: 6px 8px; font-weight: 800; color: #f1f5f9;">
            <i class="fa-solid ${isHouse ? 'fa-house-chimney' : 'fa-user'}" style="color: ${isHouse ? '#38bdf8' : '#a855f7'}; margin-left: 4px;"></i>
            ${isHouse ? 'مصاريف مشتركة (البيت)' : m}
          </td>
          <td style="padding: 6px 4px; text-align: center; color: #93c5fd; font-family: var(--font-numbers); direction: ltr;">${formatMoneyVal(spentA)}</td>
          <td style="padding: 6px 4px; text-align: center; color: #cbd5e1; font-family: var(--font-numbers); direction: ltr;">${formatMoneyVal(spentB)}</td>
          <td style="padding: 6px 4px; text-align: center; color: ${mDiff > 0 ? '#f87171' : '#34d399'}; font-family: var(--font-numbers); direction: ltr;">
            ${mDiff > 0 ? '+ ' : '- '}${formatMoneyVal(Math.abs(mDiff))}
          </td>
        </tr>
      `;
    }).filter(Boolean).join('');

    // 2. رادار تركز المتاجر والمنصات (Merchant & Platform Concentration Radar)
    const merchantMap = {};
    txsA.forEach(t => {
      const store = (t.merchant || t.title || t.notes || t.category || 'متجر غير محدد').trim();
      merchantMap[store] = (merchantMap[store] || 0) + (Number(t.amount) || 0);
    });
    const topMerchants = Object.keys(merchantMap)
      .map(k => ({ name: k, amount: merchantMap[k], pct: totalA > 0 ? ((merchantMap[k] / totalA) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    // 3. قاعدة 50/30/20
    let needsTotal = 0;
    let wantsTotal = 0;
    let savingsTotal = Math.max(0, netSavings);

    txsA.forEach(t => {
      const cat = String(t.category || '').toLowerCase();
      if (['food', 'supermarket', 'house', 'bills', 'health', 'transport', 'education'].includes(cat)) {
        needsTotal += (Number(t.amount) || 0);
      } else {
        wantsTotal += (Number(t.amount) || 0);
      }
    });

    const totalBase = totalIncome > 0 ? totalIncome : (needsTotal + wantsTotal + savingsTotal || 1);
    const needsPct = Math.round((needsTotal / totalBase) * 100);
    const wantsPct = Math.round((wantsTotal / totalBase) * 100);
    const savingsPct = Math.round((savingsTotal / totalBase) * 100);

    // 4. كاشف المصاريف الدقيقة المتكررة (The Latte Effect)
    const smallTxs = txsA.filter(t => (Number(t.amount) || 0) <= 120);
    const latteMap = {};
    smallTxs.forEach(t => {
      const key = (t.notes || t.title || t.category || 'صرف متكرر').trim();
      latteMap[key] = (latteMap[key] || 0) + (Number(t.amount) || 0);
    });
    const latteItems = Object.keys(latteMap)
      .map(k => ({ name: k, amount: latteMap[k], annual: latteMap[k] * 12 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    // 5. كاشف العمليات المزدوجة والأخطاء الجنائية
    const duplicates = [];
    const seen = new Set();
    txsA.forEach(t => {
      const sig = `${t.date}_${Number(t.amount).toFixed(2)}_${t.category}`;
      if (seen.has(sig)) {
        duplicates.push(t);
      } else {
        seen.add(sig);
      }
    });

    // 6. مقياس ساعات العمل البديلة ومدرج الأمان
    const hourlyIncome = (totalIncome > 0 ? totalIncome : 35000) / 160;
    const workHoursCost = totalA > 0 ? (totalA / hourlyIncome).toFixed(1) : 0;
    const liquidCash = (state.wallets || []).reduce((s, w) => s + (Number(w.balance) || 0), 0);
    const monthlyRunway = needsTotal > 0 ? (liquidCash / needsTotal).toFixed(1) : 0;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        
        <!-- قائمتان منسدلتان لاختيار شهري المقارنة بحرية تامة -->
        <div style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(56, 189, 248, 0.35); border-radius: 14px; padding: 10px 14px;">
          <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-code-compare"></i> محرك المقارنة بين فترتين ماليتين:
          </div>
          <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: center;">
            <div>
              <label style="font-size: 0.62rem; color: #94a3b8; display: block; margin-bottom: 2px;">الفترة أ (الحالية):</label>
              <select id="compSelMonthA" onchange="BudgetAuditEngine.setComparisonPeriods(this.value, document.getElementById('compSelMonthB').value)" style="width: 100%; height: 32px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 8px; color: #38bdf8; font-weight: 850; font-size: 0.74rem; padding: 0 6px;">
                ${monthOptionsA}
              </select>
            </div>
            <div style="font-size: 1.1rem; color: #f59e0b; padding-top: 14px;">🆚</div>
            <div>
              <label style="font-size: 0.62rem; color: #94a3b8; display: block; margin-bottom: 2px;">الفترة ب (المقارن بها):</label>
              <select id="compSelMonthB" onchange="BudgetAuditEngine.setComparisonPeriods(document.getElementById('compSelMonthA').value, this.value)" style="width: 100%; height: 32px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #cbd5e1; font-weight: 850; font-size: 0.74rem; padding: 0 6px;">
                ${monthOptionsB}
              </select>
            </div>
          </div>
        </div>

        <!-- بطاقات الرقابة الثلاثية العليا -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
          <div style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(16, 185, 129, 0.4); border-radius: 12px; padding: 10px 8px; text-align: center;">
            <div style="font-size: 0.64rem; color: #94a3b8; font-weight: 800;">مؤشر الانضباط المالي</div>
            <div style="font-size: 1.05rem; font-weight: 950; color: #34d399; margin-top: 2px;">${adherenceScore}%</div>
            <div style="font-size: 0.60rem; color: #10b981; margin-top: 1px;">التزام بالميزانية</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 10px 8px; text-align: center;">
            <div style="font-size: 0.64rem; color: #94a3b8; font-weight: 800;">نمو المصروفات</div>
            <div style="font-size: 1.05rem; font-weight: 950; color: ${isGrowthDown ? '#34d399' : '#f43f5e'}; margin-top: 2px; direction: ltr;">
              ${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%
            </div>
            <div style="font-size: 0.60rem; color: #94a3b8; margin-top: 1px;">مقارنة بالسابق</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 10px 8px; text-align: center;">
            <div style="font-size: 0.64rem; color: #94a3b8; font-weight: 800;">صافي الوفر المحقق</div>
            <div style="font-size: 0.95rem; font-weight: 950; color: ${netSavings >= 0 ? '#34d399' : '#f87171'}; margin-top: 2px; direction: ltr;">
              ${netSavings >= 0 ? '+ ' : '- '}${formatMoneyVal(Math.abs(netSavings))}
            </div>
            <div style="font-size: 0.60rem; color: #94a3b8; margin-top: 1px;">فائض الشهر الحقيقي</div>
          </div>
        </div>

        <!-- جدول ميزان الفروقات الشامل (The Variance Matrix) -->
        <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(56, 189, 248, 0.25); border-radius: 14px; overflow: hidden;">
          <div style="padding: 8px 12px; background: rgba(30, 41, 59, 0.6); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <div style="font-size: 0.80rem; font-weight: 850; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-arrow-down-up-across-line"></i>
              <span>جدول ميزان الفروقات الشامل للتصنيفات</span>
            </div>
            <span style="font-size: 0.66rem; color: #94a3b8;">${compPeriodA} 🆚 ${compPeriodB}</span>
          </div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
              <thead>
                <tr style="background: rgba(15, 23, 42, 0.9); font-size: 0.66rem; color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                  <th style="padding: 7px 6px;">التصنيف</th>
                  <th style="padding: 7px 4px; text-align: center;">الفترة أ</th>
                  <th style="padding: 7px 4px; text-align: center;">الفترة ب</th>
                  <th style="padding: 7px 4px; text-align: center;">الفارق</th>
                  <th style="padding: 7px 6px; text-align: center;">التغير %</th>
                </tr>
              </thead>
              <tbody>
                ${comparisonRows || '<tr><td colspan="5" style="text-align: center; padding: 12px; color: #94a3b8;">لا توجد بيانات مقارنة كافية</td></tr>'}
              </tbody>
              <tfoot>
                <tr style="background: rgba(15, 23, 42, 0.95); font-weight: 900; font-size: 0.76rem; border-top: 1.5px solid rgba(56, 189, 248, 0.3);">
                  <td style="padding: 9px 6px; color: #cbd5e1;">إجمالي المصروفات:</td>
                  <td style="padding: 9px 4px; text-align: center; color: #93c5fd; font-family: var(--font-numbers); direction: ltr;">${formatMoneyVal(totalA)}</td>
                  <td style="padding: 9px 4px; text-align: center; color: #cbd5e1; font-family: var(--font-numbers); direction: ltr;">${formatMoneyVal(totalB)}</td>
                  <td style="padding: 9px 4px; text-align: center; color: ${totalA - totalB > 0 ? '#f87171' : '#34d399'}; font-family: var(--font-numbers); direction: ltr;">
                    ${totalA - totalB > 0 ? '+ ' : '- '}${formatMoneyVal(Math.abs(totalA - totalB))}
                  </td>
                  <td style="padding: 9px 6px; text-align: center; color: #fbbf24;">${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- مصفوفة الأفراد المتقاطعة ورادار تركز المتاجر -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <!-- مصفوفة الأفراد -->
          <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(168, 85, 247, 0.3); border-radius: 12px; overflow: hidden;">
            <div style="padding: 6px 10px; background: rgba(30, 41, 59, 0.6); font-size: 0.74rem; font-weight: 850; color: #c084fc; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-users-rays"></i>
              <span>مصفوفة الأفراد المتقاطعة</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
              <thead>
                <tr style="background: rgba(15, 23, 42, 0.85); font-size: 0.62rem; color: #94a3b8;">
                  <th style="padding: 5px 6px;">الفرد</th>
                  <th style="padding: 5px 3px; text-align: center;">فترة أ</th>
                  <th style="padding: 5px 3px; text-align: center;">فترة ب</th>
                  <th style="padding: 5px 3px; text-align: center;">الفارق</th>
                </tr>
              </thead>
              <tbody>
                ${crossMemberRows || '<tr><td colspan="4" style="text-align: center; padding: 8px; color: #94a3b8; font-size: 0.65rem;">لا توجد بيانات</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- رادار تركز المتاجر والمنصات -->
          <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 8px 10px;">
            <div style="font-size: 0.74rem; font-weight: 850; color: #fbbf24; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-store"></i>
              <span>رادار تركز المتاجر والمنصات</span>
            </div>
            ${topMerchants.length > 0 ? topMerchants.map(m => `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.66rem; margin-bottom: 4px; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 2px;">
                <span style="color: #e2e8f0; font-weight: 750;">${escapeHtml(m.name.slice(0, 14))}</span>
                <span style="color: ${m.pct > 20 ? '#f87171' : '#fbbf24'}; font-family: var(--font-numbers); direction: ltr;">
                  ${formatMoneyVal(m.amount)} (${m.pct.toFixed(0)}%)
                </span>
              </div>
            `).join('') : '<div style="font-size: 0.66rem; color: #94a3b8;">لا توجد بيانات متاجر كافية</div>'}
          </div>
        </div>

        <!-- تحليل قاعدة 50/30/20 الرقابية -->
        <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 0.82rem; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-pie-chart"></i>
              <span>تحليل قاعدة الرقابة الذكية (50 حتميات / 30 رغبات / 20 مدخرات)</span>
            </div>
          </div>
          <div style="display: flex; gap: 4px; height: 10px; border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${needsPct}%; background: #3b82f6;" title="الحتميات: ${needsPct}%"></div>
            <div style="width: ${wantsPct}%; background: #f59e0b;" title="الرغبات والكماليات: ${wantsPct}%"></div>
            <div style="width: ${savingsPct}%; background: #10b981;" title="المدخرات والوفر: ${savingsPct}%"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #cbd5e1;">
            <span><strong style="color: #60a5fa;">● حتميات:</strong> ${formatMoneyVal(needsTotal)} (${needsPct}%)</span>
            <span><strong style="color: #fbbf24;">● رغبات:</strong> ${formatMoneyVal(wantsTotal)} (${wantsPct}%)</span>
            <span><strong style="color: #34d399;">● وفر:</strong> ${formatMoneyVal(savingsTotal)} (${savingsPct}%)</span>
          </div>
        </div>

        <!-- رادار التدقيق الجنائي المزدوج (Latte Effect & Duplicate Detector) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <!-- أثر اللاتيه -->
          <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 10px 12px;">
            <div style="font-size: 0.76rem; font-weight: 850; color: #fbbf24; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-mug-hot"></i>
              <span>أثر اللاتيه (المصاريف الدقيقة)</span>
            </div>
            ${latteItems.length > 0 ? latteItems.map(it => `
              <div style="font-size: 0.66rem; display: flex; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 2px;">
                <span style="color: #e2e8f0;">${escapeHtml(it.name.slice(0, 14))}</span>
                <span style="color: #fbbf24; direction: ltr;">سنوياً: ${formatMoneyVal(it.annual)}</span>
              </div>
            `).join('') : '<div style="font-size: 0.66rem; color: #94a3b8;">لا توجد مصاريف دقيقة متكررة</div>'}
          </div>

          <!-- كاشف العمليات المزدوجة والشذوذ الجنائي -->
          <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 10px 12px;">
            <div style="font-size: 0.76rem; font-weight: 850; color: #f87171; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-shield-halved"></i>
              <span>كاشف التكرار الجنائي</span>
            </div>
            ${duplicates.length > 0 ? duplicates.slice(0, 2).map(d => `
              <div style="font-size: 0.66rem; color: #fecdd3; background: rgba(239, 68, 68, 0.12); padding: 4px 6px; border-radius: 6px; margin-bottom: 4px;">
                ⚠️ اشتباه عملية مكررة: <strong>${formatMoney(d.amount)}</strong> (${d.date})
              </div>
            `).join('') : '<div style="font-size: 0.66rem; color: #34d399;">✅ لا توجد عمليات مكررة مشبوهة</div>'}
          </div>
        </div>

        <!-- ساعات العمل البديلة ومدرج الأمان في الطوارئ -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 12px;">
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 800;">⏱️ ساعات العمل البديلة للمصروف:</div>
            <div style="font-size: 1rem; font-weight: 900; color: #38bdf8; margin-top: 3px;">${workHoursCost} ساعة عمل</div>
            <div style="font-size: 0.60rem; color: #64748b;">من عمر رب الأسرة لتمويل هذه الفترة</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 12px;">
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 800;">🛡️ مدرج الأمان في الطوارئ:</div>
            <div style="font-size: 1rem; font-weight: 900; color: #34d399; margin-top: 3px;">${monthlyRunway} أشهر أمان</div>
            <div style="font-size: 0.60rem; color: #64748b;">تغطية حتميات الأسرة في الطوارئ</div>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // 5. ترقية "الأرشيف والسجل" (Task 4)
  // =========================================================================

  function renderBudgetHistoryAdvanced() {
    const container = document.getElementById('panelBudgetHistory');
    if (!container) return;

    const monthlyPlans = state.monthlyBudgets || [];
    const knownProjects = typeof getKnownProjects === 'function'
      ? getKnownProjects().filter(p => !['all', '__no_project__', '__new_project__'].includes(p))
      : [];

    const isMonthly = (activeHistoryArchiveTab === 'monthly');

    const segmentedSwitcher = `
      <div style="display: flex; gap: 6px; background: rgba(15, 23, 42, 0.85); padding: 4px; border-radius: 12px; border: 1px solid rgba(56, 189, 248, 0.25); margin-bottom: 12px;">
        <button type="button" onclick="BudgetAuditEngine.switchArchiveTab('monthly')" style="flex: 1; height: 38px; border-radius: 9px; font-size: 0.78rem; font-weight: 900; background: ${isMonthly ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent'}; color: ${isMonthly ? '#fff' : '#94a3b8'}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
          <i class="fa-solid fa-calendar-check"></i> <span>📅 أرشيف الموازنات الشهرية (${monthlyPlans.length})</span>
        </button>
        <button type="button" onclick="BudgetAuditEngine.switchArchiveTab('projects')" style="flex: 1; height: 38px; border-radius: 9px; font-size: 0.78rem; font-weight: 900; background: ${!isMonthly ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent'}; color: ${!isMonthly ? '#fff' : '#94a3b8'}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
          <i class="fa-solid fa-folder-closed"></i> <span>📁 أرشيف المشاريع (${knownProjects.length})</span>
        </button>
      </div>
    `;

    let contentHtml = '';

    if (isMonthly) {
      if (monthlyPlans.length === 0) {
        contentHtml = '<div style="text-align: center; color: #94a3b8; padding: 20px;">لا توجد موازنات سابقة محفوظة في الأرشيف</div>';
      } else {
        contentHtml = monthlyPlans.map((b, idx) => {
          if (typeof ensureBudgetItems === 'function') {
            ensureBudgetItems(b);
          }
          const totalInc = (b.incomes || []).reduce((s, inc) => s + (Number(inc.amount) || 0), 0);
          const totalExp = (b.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
          const surplus = totalInc - totalExp;

          // Transactions for this month
          const monthTxs = (state.transactions || []).filter(t => t.date && t.date.startsWith(b.month || '2026-11') && t.type === 'expense');
          const actualSpent = monthTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
          const adherence = totalExp > 0 ? Math.min(100, Math.round((actualSpent / totalExp) * 100)) : 0;

          const bIdentifier = b.id || b.month || ('bgt-idx-' + idx);

          return `
            <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 12px 14px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.88rem; font-weight: 850; color: #f1f5f9; display: flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-calendar-days" style="color: #38bdf8;"></i>
                  <span>${escapeHtml(b.name || `موازنة ${b.month}`)}</span>
                </div>
                <span style="font-size: 0.70rem; font-weight: 800; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 6px;">
                  شهر: ${b.month}
                </span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; font-size: 0.72rem; text-align: center;">
                <div style="background: rgba(15, 23, 42, 0.5); padding: 5px; border-radius: 6px;">
                  <div style="color: #94a3b8; font-size: 0.60rem;">المقدر</div>
                  <strong style="color: #38bdf8; direction: ltr;">${formatMoneyVal(totalExp)}</strong>
                </div>
                <div style="background: rgba(15, 23, 42, 0.5); padding: 5px; border-radius: 6px;">
                  <div style="color: #94a3b8; font-size: 0.60rem;">الفعلي</div>
                  <strong style="color: #f8fafc; direction: ltr;">${formatMoneyVal(actualSpent)}</strong>
                </div>
                <div style="background: rgba(15, 23, 42, 0.5); padding: 5px; border-radius: 6px;">
                  <div style="color: #94a3b8; font-size: 0.60rem;">الالتزام</div>
                  <strong style="color: ${adherence > 100 ? '#ef4444' : '#10b981'};">${adherence}%</strong>
                </div>
              </div>

              <!-- أزرار الإجراءات الفورية -->
              <div style="display: flex; gap: 6px; margin-top: 4px;">
                <button type="button" onclick="BudgetAuditEngine.cloneBudget('${bIdentifier}')" style="flex: 2; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; color: #fff; font-size: 0.72rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                  <i class="fa-solid fa-copy"></i> إنشاء موازنة جديدة بنسخ هذا الشهر
                </button>
                <button type="button" onclick="onBudgetPlanSelect('${bIdentifier}'); switchBudgetSubTab('current');" style="flex: 1; height: 32px; border-radius: 8px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 0.72rem; font-weight: 800; cursor: pointer;">
                  استعراض
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    } else {
      // Projects Archive
      if (knownProjects.length === 0) {
        contentHtml = '<div style="text-align: center; color: #94a3b8; padding: 20px;">لا توجد مشاريع سابقة في الأرشيف</div>';
      } else {
        contentHtml = knownProjects.map(p => {
          const plan = (state.monthlyBudgets || []).find(b => b.project === p);
          const projectTxs = (state.transactions || []).filter(t => t.project === p && t.type === 'expense');
          const est = plan ? (plan.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0) : 0;
          const act = projectTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);

          // التمييز العادل بين المشاريع النشطة والمكتملة بدقة
          const isCompleted = (plan && plan.status === 'completed') || (typeof isProjectCompleted === 'function' && isProjectCompleted(p));

          return `
            <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 12px 14px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.88rem; font-weight: 850; color: #f1f5f9; display: flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-trowel-bricks" style="color: ${isCompleted ? '#34d399' : '#38bdf8'};"></i>
                  <span>${escapeHtml(p)}</span>
                </div>
                <span style="font-size: 0.68rem; font-weight: 800; color: ${isCompleted ? '#34d399' : '#38bdf8'}; background: ${isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)'}; padding: 2px 7px; border-radius: 6px;">
                  ${isCompleted ? '🏁 مكتمل ومؤرشف' : '🟢 نشط قيد التنفيذ'}
                </span>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #cbd5e1;">
                <span>المخطط: <strong style="color: #38bdf8; direction: ltr;">${formatMoneyVal(est)}</strong></span>
                <span>النهائي: <strong style="color: #f87171; direction: ltr;">${formatMoneyVal(act)}</strong></span>
              </div>

              <div style="display: flex; gap: 6px; margin-top: 4px;">
                <button type="button" onclick="BudgetAuditEngine.selectProject('${p}'); switchBudgetSubTab('projects');" style="flex: 1; height: 32px; border-radius: 8px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 0.72rem; font-weight: 800; cursor: pointer;">
                  تقرير المشروع ومتابعة الصرف
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    container.innerHTML = `
      <div>
        ${segmentedSwitcher}
        <div id="budgetHistoryContentBox">
          ${contentHtml}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 6. دوال الربط والأحداث العامة (Public API)
  // =========================================================================

  // 1. دعم الفلترة المخصصة بنافذة إدخال فورية
  function selectPeriod(period) {
    if (period === 'custom') {
      const defaultStart = customStartDate || new Date().toISOString().slice(0, 8) + '01';
      const defaultEnd = customEndDate || new Date().toISOString().slice(0, 10);
      const start = prompt('أدخل تاريخ بداية الفترة (YYYY-MM-DD):', defaultStart);
      if (!start) return;
      const end = prompt('أدخل تاريخ نهاية الفترة (YYYY-MM-DD):', defaultEnd);
      if (!end) return;
      if (start > end) {
        alert('تنبيه: تاريخ البداية يجب أن يسبق تاريخ النهاية!');
        return;
      }
      customStartDate = start;
      customEndDate = end;
    }
    activeTimePeriod = period;
    refreshActiveBudgetAudit();
  }

  function selectProject(projName) {
    window.selectedProjectBudgetName = projName;
    renderProjectBudgetsAdvanced();
  }

  function selectProjectPeriod(period) {
    if (period === 'custom') {
      const defaultStart = projectCustomStart || new Date().toISOString().slice(0, 8) + '01';
      const defaultEnd = projectCustomEnd || new Date().toISOString().slice(0, 10);
      const start = prompt('أدخل تاريخ بداية الفترة للمشروع (YYYY-MM-DD):', defaultStart);
      if (!start) return;
      const end = prompt('أدخل تاريخ نهاية الفترة للمشروع (YYYY-MM-DD):', defaultEnd);
      if (!end) return;
      if (start > end) {
        alert('تنبيه: تاريخ البداية يجب أن يسبق تاريخ النهاية!');
        return;
      }
      projectCustomStart = start;
      projectCustomEnd = end;
    }
    activeProjectTimePeriod = period;
    renderProjectBudgetsAdvanced();
  }

  function setComparisonPeriods(monthA, monthB) {
    if (monthA) compPeriodA = monthA;
    if (monthB) compPeriodB = monthB;
    renderExecutiveComparisonsAudit();
  }

  function switchArchiveTab(tab) {
    activeHistoryArchiveTab = tab;
    renderBudgetHistoryAdvanced();
  }

  function cloneBudget(budgetId) {
    // دعم البحث بالمعرف id أو باسم الشهر month لتفادي قيمة undefined
    const orig = (state.monthlyBudgets || []).find(b => b.id === budgetId || b.month === budgetId || (!budgetId && b));
    if (!orig) return;

    const now = new Date();
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const newPlan = JSON.parse(JSON.stringify(orig));
    newPlan.id = 'bgt-' + nextMonthStr + '-' + Date.now();
    newPlan.name = `ميزانية شهر ${nextMonthStr}`;
    newPlan.month = nextMonthStr;
    newPlan.createdAt = new Date().toISOString();
    newPlan.updatedAt = new Date().toISOString();

    state.monthlyBudgets.unshift(newPlan);
    state.activeBudgetId = newPlan.id;

    if (typeof saveMonthlyBudget === 'function') {
      window.currentBudgetMonthData = newPlan;
      saveMonthlyBudget();
    }
    if (typeof showToast === 'function') {
      showToast(`📋 تم استنساخ الميزانية بنجاح لشهر (${nextMonthStr})`);
    }

    switchBudgetSubTab('current');
    if (typeof loadActiveBudgetPlan === 'function') loadActiveBudgetPlan();
  }

  // 10. تصدير موازنة الشهر إلى Excel مع دعم كامل للغة العربية (RTL) والإشارات المحاسبية
  function exportBudgetToExcel() {
    if (typeof XLSX === 'undefined') {
      if (typeof showToast === 'function') showToast('⚠️ تعذر تحميل مكتبة تصدير Excel');
      return;
    }

    let plan = window.currentBudgetMonthData;
    if (!plan && state.monthlyBudgets && state.monthlyBudgets.length > 0) {
      plan = state.monthlyBudgets[0];
    }
    if (!plan) {
      if (typeof showToast === 'function') showToast('⚠️ لا توجد موازنة للتصدير');
      return;
    }
    if (typeof ensureBudgetItems === 'function') ensureBudgetItems(plan);

    const txs = getTransactionsForPeriod(state.transactions || [], activeTimePeriod, plan.month, customStartDate, customEndDate);
    const expenseTxs = txs.filter(t => t.type === 'expense');

    const headers = [
      'التصنيف / البند',
      'المبلغ المقدر الشهري (ج.م)',
      'التقديري للفترة المختارة (ج.م)',
      'الفعلي المنصرف (ج.م)',
      'الانحراف / الفارق (ج.م)',
      'نسبة الاستهلاك %',
      'الأفراد المعنيون بالبند',
      'ملاحظات'
    ];

    const rows = [headers];

    let sumEstMonthly = 0;
    let sumEstPeriod = 0;
    let sumActual = 0;

    (plan.items || []).forEach(it => {
      const monthlyAmt = Number(it.amount) || 0;
      const proratedEst = calculateProratedAmount(it, activeTimePeriod, plan.month, customStartDate, customEndDate);
      const cat = (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []).find(c => c.id === it.category) || { name: it.title || it.category };
      
      const matchingTxs = (typeof getExpensesForBudgetItem === 'function')
        ? getExpensesForBudgetItem(it, expenseTxs, plan.items)
        : expenseTxs.filter(t => t.category === it.category || t.budgetItemId === it.id);
      const actualAmt = matchingTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);

      const diff = proratedEst - actualAmt;
      const pct = proratedEst > 0 ? ((actualAmt / proratedEst) * 100).toFixed(1) + '%' : (actualAmt > 0 ? '100%' : '0%');
      const members = (it.members && it.members.length > 0) ? it.members.join('، ') : 'البيت';

      sumEstMonthly += monthlyAmt;
      sumEstPeriod += proratedEst;
      sumActual += actualAmt;

      // تطبيق المعيار المحاسبي العالمي: المصروف يحمل إشارة سالبة
      rows.push([
        it.title || cat.name,
        monthlyAmt,
        proratedEst,
        -actualAmt,
        diff,
        pct,
        members,
        it.notes || ''
      ]);
    });

    const totalDiff = sumEstPeriod - sumActual;
    const totalPct = sumEstPeriod > 0 ? ((sumActual / sumEstPeriod) * 100).toFixed(1) + '%' : '0%';
    rows.push([
      'الإجمالي العام',
      sumEstMonthly,
      sumEstPeriod,
      -sumActual,
      totalDiff,
      totalPct,
      'كافة أفراد الأسرة',
      `الفترة: ${getPeriodLabel(activeTimePeriod)}`
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!views'] = [{ RTL: true }];
    ws['!cols'] = [
      { wch: 28 }, // البند
      { wch: 22 }, // المقدر الشهري
      { wch: 22 }, // التقديري للفترة
      { wch: 20 }, // الفعلي المنصرف
      { wch: 20 }, // الانحراف
      { wch: 16 }, // نسبة الاستهلاك
      { wch: 24 }, // الأفراد
      { wch: 28 }  // ملاحظات
    ];

    const wb = XLSX.utils.book_new();
    const sheetName = `موازنة_${plan.month || 'الشهر'}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

    const fileName = `موازنة_العائلة_${plan.month || 'الشهر'}_${activeTimePeriod}.xlsx`;
    XLSX.writeFile(wb, fileName);

    if (typeof showToast === 'function') {
      showToast(`📊 تم تصدير كشف موازنة الشهر إلى Excel بنجاح`);
    }
  }

  // 2. تحديث متناغم لجميع بطاقات الصفحة العلوية والجدول
  function refreshActiveBudgetAudit() {
    let plan = window.currentBudgetMonthData;
    if (!plan && state.monthlyBudgets && state.monthlyBudgets.length > 0) {
      plan = state.monthlyBudgets[0];
      window.currentBudgetMonthData = plan;
    }
    if (plan && typeof ensureBudgetItems === 'function') {
      ensureBudgetItems(plan);
    }

    const txs = getTransactionsForPeriod(state.transactions || [], activeTimePeriod, plan ? plan.month : null, customStartDate, customEndDate);

    const stripEl = document.getElementById('budgetMonthlyTimeFiltersContainer');
    if (stripEl) {
      stripEl.innerHTML = renderTimeFilterStrip('budgetMonthlyTimeFilters', activeTimePeriod, 'BudgetAuditEngine.selectPeriod', customStartDate, customEndDate);
    }

    const tblContainer = document.getElementById('budgetActualVsEstimatedContainer');
    if (tblContainer) {
      tblContainer.innerHTML = renderActualVsEstimatedTable(plan, txs, activeTimePeriod);
    }

    const memContainer = document.getElementById('budgetMemberBreakdownContainer');
    if (memContainer) {
      memContainer.innerHTML = renderFamilyMemberBreakdown(plan, txs, activeTimePeriod);
    }

    // مزامنة الـ KPIs العلوية مع الفترة الزمنية المختارة لمنع أي تناقض بصري
    const periodExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    
    let totalProratedEst = 0;
    if (plan && plan.items) {
      totalProratedEst = plan.items.reduce((sum, it) => {
        return sum + calculateProratedAmount(it, activeTimePeriod, plan.month, customStartDate, customEndDate);
      }, 0);
    }

    const kpiAct = document.getElementById('budgetKpiActual');
    if (kpiAct) {
      kpiAct.textContent = (typeof formatMoneyVal === 'function') ? formatMoneyVal(periodExpense) : periodExpense.toLocaleString('en-US');
    }

    const kpiEst = document.getElementById('budgetKpiEstimated');
    if (kpiEst && activeTimePeriod !== 'month') {
      kpiEst.textContent = (typeof formatMoneyVal === 'function') ? formatMoneyVal(totalProratedEst) : totalProratedEst.toLocaleString('en-US');
    }

    const kpiSurplus = document.getElementById('budgetKpiSurplus');
    if (kpiSurplus && activeTimePeriod !== 'month') {
      const diff = totalProratedEst - periodExpense;
      kpiSurplus.textContent = (diff >= 0 ? '+ ' : '- ') + ((typeof formatMoneyVal === 'function') ? formatMoneyVal(Math.abs(diff)) : Math.abs(diff).toLocaleString('en-US'));
      kpiSurplus.style.color = diff >= 0 ? '#34d399' : '#f87171';
    }

    const progBar = document.getElementById('budgetProgressOverall');
    if (progBar && totalProratedEst > 0) {
      const pct = Math.min(100, Math.round((periodExpense / totalProratedEst) * 100));
      progBar.style.width = pct + '%';
      progBar.style.backgroundColor = (pct > 100) ? '#ef4444' : (pct >= 85 ? '#f59e0b' : '#10b981');
    }
  }

  return {
    selectPeriod,
    selectProject,
    selectProjectPeriod,
    setComparisonPeriods,
    switchArchiveTab,
    cloneBudget,
    exportBudgetToExcel,
    refreshActiveBudgetAudit,
    renderProjectBudgetsAdvanced,
    renderExecutiveComparisonsAudit,
    renderBudgetHistoryAdvanced
  };
})();
