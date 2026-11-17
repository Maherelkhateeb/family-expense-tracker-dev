/**
 * budget-audit-engine.js (v5.3.74 - Complete Financial Audit & Executive BI Suite)
 * المعمارية الشاملة لمنظومة الموازنات والرقابة المالية والتدقيق الجنائي المحاسبي
 * Family Expense Tracker - Executive Budgeting, Comparative Audit & BI Engine
 * 
 * الميزات الرئيسية:
 * 1. سحب التسجيلات الفعلية ديناميكياً للعمليات وتجميعها (اليوم، الأسبوع، الشهر، كل الفترات، فترة مخصصة).
 * 2. المقارنة في العمود المقابل على مستوى نفس البند (المقدر التقديري أو فترة أخرى كالشهر السابق).
 * 3. المقارنة الشاملة على مستوى أفراد الأسرة (كل فرد + المصاريف المشتركة للبيت).
 * 4. مؤشرات وتحليلات ورسوم بيانية أسفل الصفحة لتوضيح الفرق والنتيجة والتغير.
 * 5. تناغم بصري ومحاسبي كامل 100% بدون تثبيت أرقام وهمية وخالٍ من أخطاء prompt().
 */

window.BudgetAuditEngine = (() => {
  // ---------------------------------------------------------------------------
  // الحالة الداخلية لمحرك الرقابة والمقارنة الفعلية
  // ---------------------------------------------------------------------------
  let activeTimePeriod = 'month'; // 'today', 'week', 'month', 'prev_month', 'all', 'custom'
  let customStartDate = null;
  let customEndDate = null;
  let targetMonthStr = null; // شهر الخطة المستهدف (مثلاً: 2026-11)

  // وضع المقارنة في العمود المقابل:
  // 'budget' = المقارنة مع الميزانية التقديرية لنفس الفترة (الفعلي vs المقدر)
  // 'period' = المقارنة مع فترة أخرى في العمليات (شهر 🆚 شهر أو فترة 🆚 فترة)
  let comparisonMode = 'budget';
  let benchmarkMonthStr = null; // الشهر المقارن به في وضع period (افتراضياً الشهر السابق)
  let isCustomRangeBoxOpen = false;

  // للمشاريع
  let activeProjectTimePeriod = 'all';
  let projectCustomStart = null;
  let projectCustomEnd = null;

  // للأرشيف
  let activeHistoryArchiveTab = 'monthly';

  // مثيلات الرسوم البيانية لتفادي تراكم الذاكرة
  let barChartInstance = null;
  let doughnutChartInstance = null;

  // ---------------------------------------------------------------------------
  // الدوال المساعدة والتنسيق المحاسبي (RTL & Currency)
  // ---------------------------------------------------------------------------
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
            id: 'item-' + idx + '-' + Date.now(),
            title: catMap[catId] || catId,
            category: catId,
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
      .replace(/'/g, '&#39;');
  }

  function formatMoneyVal(num) {
    if (typeof formatMoney === 'function') {
      return formatMoney(num);
    }
    const n = Number(num) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م';
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function isFixedExpenseItem(item) {
    if (!item) return false;
    if (item.isFixed === true) return true;
    const cat = String(item.category || '').toLowerCase();
    const title = String(item.title || '').toLowerCase();
    return (
      cat === 'bills' ||
      title.includes('إيجار') ||
      title.includes('قسط') ||
      title.includes('فاتورة') ||
      title.includes('كهرباء') ||
      title.includes('غاز') ||
      title.includes('مياه') ||
      title.includes('نت') ||
      title.includes('انترنت') ||
      title.includes('سنوي') ||
      title.includes('مقطوع')
    );
  }

  function calculateProratedAmount(item, period, targetMonth, startD, endD) {
    const monthlyAmt = Number(item.amount) || 0;
    if (monthlyAmt === 0) return 0;

    // المصاريف الثابتة والمقطوعة تعرض بكامل قيمتها دون تقسيم
    if (isFixedExpenseItem(item)) {
      return monthlyAmt;
    }

    const mStr = targetMonth || new Date().toISOString().slice(0, 7);
    const [year, month] = mStr.split('-').map(Number);
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

  // ---------------------------------------------------------------------------
  // سحب التسجيلات الفعلية للعمليات بحسب الفترة المختارة بدقة تامة
  // ---------------------------------------------------------------------------
  function getTransactionsForPeriod(transactions, period, targetMonth, startD, endD) {
    if (!Array.isArray(transactions)) return [];
    const now = new Date();
    const todayStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(now) : now.toISOString().slice(0, 10);
    const mStr = targetMonth || todayStr.slice(0, 7);
    const [year, month] = mStr.split('-').map(Number);

    switch (period) {
      case 'today':
        return transactions.filter(t => t.date === todayStr);
      case 'week': {
        const d = new Date(now);
        const day = d.getDay(); // 0 = Sun, 6 = Sat
        const diffToSat = (day + 1) % 7; // السبت كبداية الأسبوع
        const sat = new Date(d);
        sat.setDate(d.getDate() - diffToSat);
        const satStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(sat) : sat.toISOString().slice(0, 10);
        return transactions.filter(t => t.date >= satStr && t.date <= todayStr);
      }
      case 'month':
        return transactions.filter(t => t.date && t.date.startsWith(mStr));
      case 'prev_month': {
        const prevMonthDate = new Date(year, month - 2, 1);
        const prevStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        return transactions.filter(t => t.date && t.date.startsWith(prevStr));
      }
      case 'custom':
        if (!startD || !endD) return transactions.filter(t => t.date && t.date.startsWith(mStr));
        return transactions.filter(t => t.date && t.date >= startD && t.date <= endD);
      case 'all':
      default:
        return transactions;
    }
  }

  // سحب تسجيلات الفترة المقابلة عند تفعيل مقارنة الفترات (شهر 🆚 شهر)
  function getBenchmarkTransactions(transactions, curMonthStr) {
    if (!Array.isArray(transactions)) return [];
    const now = new Date();
    const curM = curMonthStr || now.toISOString().slice(0, 7);
    const [year, month] = curM.split('-').map(Number);

    let bMonth = benchmarkMonthStr;
    if (!bMonth) {
      const prevDate = new Date(year, month - 2, 1);
      bMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      benchmarkMonthStr = bMonth;
    }

    return transactions.filter(t => t.date && t.date.startsWith(bMonth));
  }

  // ---------------------------------------------------------------------------
  // 1. شريط التحكم التفاعلي واختيار فترة المقارنة والعمود المقابل
  // ---------------------------------------------------------------------------
  function renderControlHeaderStrip(plan, allTxs) {
    const curMonth = plan ? plan.month : (targetMonthStr || new Date().toISOString().slice(0, 7));
    const [curYear, curMonthNum] = curMonth.split('-').map(Number);
    const defaultPrevDate = new Date(curYear, curMonthNum - 2, 1);
    const defaultPrevMonthStr = `${defaultPrevDate.getFullYear()}-${String(defaultPrevDate.getMonth() + 1).padStart(2, '0')}`;

    if (!benchmarkMonthStr) benchmarkMonthStr = defaultPrevMonthStr;

    // قائمة الشهور المتوفرة ديناميكياً من العمليات والموازنات
    const availableMonths = Array.from(new Set(
      allTxs.map(t => t.date ? t.date.slice(0, 7) : null).concat(
        (state.monthlyBudgets || []).map(b => b.month)
      ).filter(Boolean)
    )).sort().reverse();

    if (availableMonths.length === 0) availableMonths.push(curMonth);

    const periods = [
      { key: 'today', label: '📅 اليوم' },
      { key: 'week', label: '📅 هذا الأسبوع' },
      { key: 'month', label: `📅 شهر (${curMonth})` },
      { key: 'prev_month', label: '📅 الشهر السابق' },
      { key: 'all', label: '📅 كل الفترات' },
      { 
        key: 'custom', 
        label: (activeTimePeriod === 'custom' && customStartDate && customEndDate) 
          ? `⚙️ مخصص (${customStartDate.slice(5)} إلى ${customEndDate.slice(5)})` 
          : '⚙️ فترة مخصصة' 
      }
    ];

    const todayStr = new Date().toISOString().slice(0, 10);
    const defStart = customStartDate || (curMonth + '-01');
    const defEnd = customEndDate || todayStr;

    return `
      <div class="budget-audit-control-cockpit" style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(56, 189, 248, 0.35); border-radius: 14px; padding: 12px 14px; margin-bottom: 12px; box-shadow: 0 4px 18px rgba(0,0,0,0.35);">
        
        <!-- السطر الأول: عنوان المحرك واختيار الشهر المباشر -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <div style="font-size: 0.88rem; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-calculator"></i>
            <span>محرك الرقابة المالية وسحب التسجيلات الفعلية:</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <label style="font-size: 0.72rem; font-weight: 800; color: #94a3b8;">اختر الشهر:</label>
            <input type="month" id="budgetAuditMonthSelectInput" value="${curMonth}" onchange="BudgetAuditEngine.selectMonth(this.value)" style="height: 30px; font-size: 0.74rem; font-weight: 850; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); color: #f8fafc; border-radius: 7px; padding: 0 6px; text-align: center; cursor: pointer;">
          </div>
        </div>

        <!-- السطر الثاني: أزرار الفترات الزمنية السريعة -->
        <div style="display: flex; gap: 5px; overflow-x: auto; padding: 2px 0 8px; margin-bottom: 8px; scrollbar-width: none;">
          ${periods.map(p => {
            const isActive = (p.key === activeTimePeriod);
            const bg = isActive ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(30, 41, 59, 0.75)';
            const color = isActive ? '#fff' : '#cbd5e1';
            const border = isActive ? 'rgba(56, 189, 248, 0.6)' : 'rgba(255, 255, 255, 0.1)';
            const shadow = isActive ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none';
            return `
              <button type="button" onclick="BudgetAuditEngine.selectPeriod('${p.key}')" style="padding: 6px 12px; border-radius: 9px; font-size: 0.74rem; font-weight: 850; background: ${bg}; color: ${color}; border: 1px solid ${border}; box-shadow: ${shadow}; cursor: pointer; white-space: nowrap; transition: all 0.2s;">
                ${p.label}
              </button>
            `;
          }).join('')}
        </div>

        <!-- صندوق التاريخ المخصص الأنيق (بدون أي prompt) -->
        <div id="budgetCustomRangeBox" style="display: ${activeTimePeriod === 'custom' || isCustomRangeBoxOpen ? 'block' : 'none'}; background: rgba(30, 41, 59, 0.85); border: 1px dashed rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 8px 10px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; font-size: 0.74rem;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 800; color: #38bdf8;"><i class="fa-solid fa-calendar-days"></i> فترة مخصصة:</span>
              <label style="color: #94a3b8;">من:</label>
              <input type="date" id="inpAuditCustomStart" value="${defStart}" style="height: 28px; font-size: 0.72rem; font-weight: 800; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); color: #fff; border-radius: 6px; padding: 0 4px;">
              <label style="color: #94a3b8;">إلى:</label>
              <input type="date" id="inpAuditCustomEnd" value="${defEnd}" style="height: 28px; font-size: 0.72rem; font-weight: 800; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); color: #fff; border-radius: 6px; padding: 0 4px;">
            </div>
            <button type="button" onclick="BudgetAuditEngine.applyCustomRange()" style="height: 28px; padding: 0 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 0.74rem; font-weight: 900; border-radius: 7px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);">
              <i class="fa-solid fa-check"></i> تطبيق الفترة
            </button>
          </div>
        </div>

        <!-- السطر الثالث: تحديد محتوى العمود المقابل (المقارنة مع الميزانية أو فترة أخرى) -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="font-size: 0.74rem; font-weight: 850; color: #fbbf24; display: flex; align-items: center; gap: 5px;">
            <i class="fa-solid fa-table-columns"></i>
            <span>العمود المقابل للمقارنة:</span>
          </div>

          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="button" onclick="BudgetAuditEngine.setComparisonBenchmark('budget')" style="padding: 4px 10px; border-radius: 7px; font-size: 0.72rem; font-weight: 850; cursor: pointer; border: 1px solid; ${comparisonMode === 'budget' ? 'background: linear-gradient(135deg, #10b981, #059669); color: #fff; border-color: rgba(52, 211, 153, 0.6);' : 'background: rgba(30, 41, 59, 0.6); color: #94a3b8; border-color: rgba(255, 255, 255, 0.1);'}">
              🎯 الميزانية التقديرية
            </button>
            <button type="button" onclick="BudgetAuditEngine.setComparisonBenchmark('period')" style="padding: 4px 10px; border-radius: 7px; font-size: 0.72rem; font-weight: 850; cursor: pointer; border: 1px solid; ${comparisonMode === 'period' ? 'background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; border-color: rgba(245, 158, 11, 0.6);' : 'background: rgba(30, 41, 59, 0.6); color: #94a3b8; border-color: rgba(255, 255, 255, 0.1);'}">
              🔄 فترة سابقة / أخرى
            </button>

            ${comparisonMode === 'period' ? `
              <select id="budgetBenchmarkMonthSelect" onchange="BudgetAuditEngine.setBenchmarkMonth(this.value)" style="height: 28px; font-size: 0.72rem; font-weight: 850; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; border-radius: 6px; padding: 0 4px; cursor: pointer;">
                ${availableMonths.filter(m => m !== curMonth).map(m => `<option value="${m}" ${m === benchmarkMonthStr ? 'selected' : ''}>شهر ${m}</option>`).join('')}
              </select>
            ` : ''}
          </div>
        </div>

      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 2. جدول الرقابة والمقارنة على مستوى نفس البند والفترة المقابلة
  // ---------------------------------------------------------------------------
  function renderActualVsEstimatedTable(plan, targetTransactions, period) {
    if (!plan) return '';
    if (typeof ensureBudgetItems === 'function') ensureBudgetItems(plan);

    if (!plan.items || plan.items.length === 0) {
      return `
        <div style="text-align: center; padding: 18px; color: #94a3b8; font-size: 0.78rem; background: rgba(15, 23, 42, 0.4); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
          لا توجد بنود ميزانية مقدرة للشهر المحدد. أنشئ بنود الخطة لتفعيل جدول المقارنة الفورية.
        </div>
      `;
    }

    const curMonth = plan.month || (targetMonthStr || '2026-11');
    const expenseTxsA = targetTransactions.filter(t => t.type === 'expense');

    // سحب تسجيلات الفترة المقابلة عند تفعيل وضع مقارنة الفترات
    const expenseTxsB = (comparisonMode === 'period') 
      ? getBenchmarkTransactions(state.transactions || [], curMonth).filter(t => t.type === 'expense')
      : [];

    let totalActualA = 0;
    let totalBenchmark = 0;

    const rowsHtml = plan.items.map((it, budgetIndex) => {
      const cat = (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []).find(c => c.id === it.category) || { name: it.title || 'بند', icon: 'fa-tag', color: '#38bdf8' };

      // حساب المنصرف الفعلي المسجل لهذا البند في الفترة أ
      const matchingTxsA = (typeof getExpensesForBudgetItem === 'function')
        ? getExpensesForBudgetItem(it, expenseTxsA, plan.items)
        : expenseTxsA.filter(t => (t.category === it.category || t.budgetItemId === it.id));
      const valActualA = matchingTxsA.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      totalActualA += valActualA;

      let valBenchmark = 0;
      let diff = 0;
      let isOver = false;
      let usagePct = 0;
      let pctChangeLabel = '';

      if (comparisonMode === 'budget') {
        // المقارنة مع الميزانية التقديرية المقسمة زمنياً
        valBenchmark = calculateProratedAmount(it, period, curMonth, customStartDate, customEndDate);
        totalBenchmark += valBenchmark;

        diff = valBenchmark - valActualA;
        isOver = diff < 0;
        usagePct = valBenchmark > 0 ? (valActualA / valBenchmark) * 100 : (valActualA > 0 ? 100 : 0);
        pctChangeLabel = `${usagePct.toFixed(0)}% استهلاك`;
      } else {
        // المقارنة مع الفترة المقابلة (ب) لنفس البند
        const matchingTxsB = (typeof getExpensesForBudgetItem === 'function')
          ? getExpensesForBudgetItem(it, expenseTxsB, plan.items)
          : expenseTxsB.filter(t => (t.category === it.category || t.budgetItemId === it.id));
        valBenchmark = matchingTxsB.reduce((s, t) => s + (Number(t.amount) || 0), 0);
        totalBenchmark += valBenchmark;

        // في مقارنة الفترات: الفارق = المنصرف أ - المنصرف ب
        diff = valActualA - valBenchmark;
        isOver = diff > 0; // زيادة الصرف تعني نمو غير مرغوب
        const pctDiff = valBenchmark > 0 ? ((diff / valBenchmark) * 100) : (valActualA > 0 ? 100 : 0);
        pctChangeLabel = (diff > 0 ? `+${pctDiff.toFixed(0)}% 🔺` : `${pctDiff.toFixed(0)}% 🔻`);
        usagePct = valBenchmark > 0 ? (valActualA / valBenchmark) * 100 : (valActualA > 0 ? 100 : 0);
      }

      // لون شريط ومؤشر الحالة
      let barColor = '#10b981'; // أخضر = وفر واستقرار
      if (usagePct >= 85 && usagePct <= 100) {
        barColor = '#f59e0b'; // أصفر = حرج
      } else if (usagePct > 100) {
        barColor = '#ef4444'; // أحمر = تجاوز أو زيادة
      }

      const diffColor = isOver ? '#f87171' : '#34d399';
      const diffSign = isOver ? (comparisonMode === 'budget' ? '- ' : '+ ') : (comparisonMode === 'budget' ? '+ ' : '- ');

      return `
        <tr class="budget-audit-row" tabindex="0" role="button" aria-label="عرض عمليات هذا البند" data-budget-item-index="${budgetIndex}" style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.74rem;">
          <td style="padding: 8px 6px; text-align: right;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid ${cat.icon}" style="color: ${cat.color || '#38bdf8'}; font-size: 0.8rem;"></i>
              <span style="font-weight: 850; color: #f1f5f9;">${escapeHtml(it.title || cat.name)}</span>
            </div>
            <div style="font-size: 0.64rem; color: #64748b; margin-top: 2px;">
              ${(it.members && it.members.length > 0) ? it.members.join(' · ') : 'البيت'}
            </div>
          </td>
          <td style="padding: 8px 4px; text-align: center; color: #38bdf8; font-weight: 900; font-family: var(--font-numbers); direction: ltr;">
            ${formatMoneyVal(valActualA)}
          </td>
          <td style="padding: 8px 4px; text-align: center; color: #fbbf24; font-weight: 800; font-family: var(--font-numbers); direction: ltr;">
            ${formatMoneyVal(valBenchmark)}
          </td>
          <td style="padding: 8px 4px; text-align: center; color: ${diffColor}; font-weight: 900; font-family: var(--font-numbers); direction: ltr;">
            ${diffSign}${formatMoneyVal(Math.abs(diff))}
          </td>
          <td style="padding: 8px 6px; text-align: center; min-width: 65px;">
            <div style="display: flex; align-items: center; gap: 4px; justify-content: center;">
              <div style="flex: 1; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; min-width: 38px;">
                <div style="width: ${Math.min(100, usagePct)}%; height: 100%; background: ${barColor}; border-radius: 4px;"></div>
              </div>
              ${isOver ? `<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; font-size: 0.65rem;" title="تجاوز أو زيادة!"></i>` : ''}
            </div>
            <span style="font-size: 0.62rem; color: ${diffColor}; font-weight: 800;">${pctChangeLabel}</span>
          </td>
        </tr>
      `;
    }).join('');

    const netDiff = (comparisonMode === 'budget') ? (totalBenchmark - totalActualA) : (totalActualA - totalBenchmark);
    const isNetOver = (comparisonMode === 'budget') ? (netDiff < 0) : (netDiff > 0);
    const netColor = isNetOver ? '#f87171' : '#34d399';
    const netSign = isNetOver ? (comparisonMode === 'budget' ? '- ' : '+ ') : (comparisonMode === 'budget' ? '+ ' : '- ');

    const benchmarkHeaderTitle = (comparisonMode === 'budget') 
      ? 'المقدر للفترة' 
      : `الفترة المقارنة (${benchmarkMonthStr || 'السابق'})`;

    return `
      <div style="background: rgba(15, 23, 42, 0.7); border: 1.2px solid rgba(56, 189, 248, 0.25); border-radius: 14px; overflow: hidden; margin-bottom: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
        <div style="padding: 9px 12px; background: rgba(30, 41, 59, 0.65); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 0.82rem; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-table-list"></i>
            <span>جدول الرقابة والمقارنة الفعلية على مستوى البند:</span>
          </div>
          <span style="font-size: 0.68rem; font-weight: 850; color: #94a3b8;">
            ${comparisonMode === 'budget' ? 'الفعلي 🆚 المقدر' : `الفعلي 🆚 شهر ${benchmarkMonthStr}`}
          </span>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; min-width: 340px;">
            <thead>
              <tr style="background: rgba(15, 23, 42, 0.9); border-bottom: 1px solid rgba(56, 189, 248, 0.2); font-size: 0.70rem; color: #94a3b8;">
                <th style="padding: 8px 6px; text-align: right; font-weight: 850;">البند / التصنيف</th>
                <th style="padding: 8px 4px; text-align: center; font-weight: 850; color: #38bdf8;">المنصرف الفعلي</th>
                <th style="padding: 8px 4px; text-align: center; font-weight: 850; color: #fbbf24;">${benchmarkHeaderTitle}</th>
                <th style="padding: 8px 4px; text-align: center; font-weight: 850;">الفارق (النتيجة)</th>
                <th style="padding: 8px 6px; text-align: center; font-weight: 850;">التغير والرقابة</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr style="background: rgba(15, 23, 42, 0.95); border-top: 1.5px solid rgba(56, 189, 248, 0.4); font-size: 0.76rem; font-weight: 900;">
                <td style="padding: 10px 6px; text-align: right; color: #f8fafc;">الإجمالي العام:</td>
                <td style="padding: 10px 4px; text-align: center; color: #38bdf8; font-family: var(--font-numbers); direction: ltr;">
                  ${formatMoneyVal(totalActualA)}
                </td>
                <td style="padding: 10px 4px; text-align: center; color: #fbbf24; font-family: var(--font-numbers); direction: ltr;">
                  ${formatMoneyVal(totalBenchmark)}
                </td>
                <td style="padding: 10px 4px; text-align: center; color: ${netColor}; font-family: var(--font-numbers); direction: ltr;">
                  ${netSign}${formatMoneyVal(Math.abs(netDiff))}
                </td>
                <td style="padding: 10px 6px; text-align: center; color: ${netColor}; font-size: 0.70rem;">
                  ${isNetOver ? (comparisonMode === 'budget' ? '🚨 تجاوز سقف' : '🔺 زيادة إنفاق') : (comparisonMode === 'budget' ? '✅ وفر محقق' : '🟢 ترشيد ووفر')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 3. المقارنة والرقابة الشاملة على مستوى أفراد الأسرة
  // ---------------------------------------------------------------------------
  function renderFamilyMemberBreakdown(plan, targetTransactions, period) {
    if (!plan) return '';
    if (typeof ensureBudgetItems === 'function') ensureBudgetItems(plan);
    if (!plan.items) return '';

    // قراءة أفراد الأسرة ديناميكياً من بيانات التطبيق
    let rawMembers = [];
    if (Array.isArray(state.members) && state.members.length > 0) {
      rawMembers = state.members.map(m => typeof m === 'string' ? m : (m.name || m.id));
    } else if (typeof DEFAULT_MEMBERS !== 'undefined' && Array.isArray(DEFAULT_MEMBERS)) {
      rawMembers = DEFAULT_MEMBERS.map(m => typeof m === 'string' ? m : (m.name || m.id));
    } else {
      rawMembers = ['ماهر', 'أية', 'محمد', 'مريم'];
    }

    const membersList = Array.from(new Set(rawMembers.filter(m => m && !['البيت', 'العائلة', 'الكل'].includes(m))));
    membersList.push('مصاريف عائلية مشتركة');

    const curMonth = plan.month || (targetMonthStr || '2026-11');
    const expenseTxsA = targetTransactions.filter(t => t.type === 'expense');
    const expenseTxsB = (comparisonMode === 'period') 
      ? getBenchmarkTransactions(state.transactions || [], curMonth).filter(t => t.type === 'expense')
      : [];

    const memberCards = membersList.map(m => {
      const isShared = (m === 'مصاريف عائلية مشتركة');

      // 1. المنصرف الفعلي في الفترة أ
      const memberActA = expenseTxsA.filter(t => {
        const tMem = (t.member || t.author || '').trim();
        if (isShared) {
          return !tMem || tMem === 'البيت' || tMem === 'العائلة' || !membersList.includes(tMem);
        }
        return tMem === m;
      }).reduce((s, t) => s + (Number(t.amount) || 0), 0);

      // 2. العمود المقابل (المقدر أو الفترة ب)
      let memberBenchmark = 0;
      if (comparisonMode === 'budget') {
        plan.items.forEach(it => {
          const itMems = (it.members && it.members.length > 0) ? it.members : ['البيت'];
          const isItemShared = itMems.includes('البيت') || itMems.includes('الكل') || itMems.includes('العائلة');
          
          if (isShared && isItemShared) {
            memberBenchmark += calculateProratedAmount(it, period, curMonth, customStartDate, customEndDate);
          } else if (!isShared && itMems.includes(m)) {
            memberBenchmark += calculateProratedAmount(it, period, curMonth, customStartDate, customEndDate) / itMems.length;
          }
        });
      } else {
        memberBenchmark = expenseTxsB.filter(t => {
          const tMem = (t.member || t.author || '').trim();
          if (isShared) {
            return !tMem || tMem === 'البيت' || tMem === 'العائلة' || !membersList.includes(tMem);
          }
          return tMem === m;
        }).reduce((s, t) => s + (Number(t.amount) || 0), 0);
      }

      if (memberBenchmark === 0 && memberActA === 0) return '';

      const diff = (comparisonMode === 'budget') ? (memberBenchmark - memberActA) : (memberActA - memberBenchmark);
      const isOver = (comparisonMode === 'budget') ? (diff < 0) : (diff > 0);
      const pct = memberBenchmark > 0 ? (memberActA / memberBenchmark) * 100 : (memberActA > 0 ? 100 : 0);

      return `
        <div style="background: rgba(15, 23, 42, 0.7); border: 1.2px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 3px 12px rgba(0,0,0,0.25);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid ${isShared ? 'fa-house-chimney' : 'fa-user'}" style="color: ${isShared ? '#38bdf8' : '#a855f7'}; font-size: 0.8rem;"></i>
              <span style="font-size: 0.78rem; font-weight: 850; color: #f1f5f9;">${m}</span>
            </div>
            <span style="font-size: 0.68rem; font-weight: 850; color: ${isOver ? '#f87171' : '#34d399'};">
              ${isOver ? (comparisonMode === 'budget' ? 'تجاوز سقف' : 'زيادة إنفاق') : 'وفر محقق'}: ${formatMoneyVal(Math.abs(diff))}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.70rem; color: #94a3b8;">
            <span>الفعلي: <strong style="color: #38bdf8;">${formatMoneyVal(memberActA)}</strong></span>
            <span>المقابل: <strong style="color: #fbbf24;">${formatMoneyVal(memberBenchmark)}</strong></span>
          </div>

          <div style="height: 5px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden; margin-top: 2px;">
            <div style="width: ${Math.min(100, pct)}%; height: 100%; background: ${pct > 100 ? '#ef4444' : (pct >= 85 ? '#f59e0b' : '#10b981')}; border-radius: 4px;"></div>
          </div>
        </div>
      `;
    }).filter(Boolean).join('');

    return `
      <div style="margin-top: 14px; margin-bottom: 14px;">
        <div style="font-size: 0.82rem; font-weight: 850; color: #a855f7; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
          <i class="fa-solid fa-users-viewfinder"></i>
          <span>المقارنة والرقابة على مستوى أفراد الأسرة:</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;">
          ${memberCards}
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 4. أسفل الصفحة: مؤشرات وتحليلات ورسوم بيانية لتوضيح الفرق والنتيجة والتغير
  // ---------------------------------------------------------------------------
  function renderBottomAnalyticsAndCharts(plan, txsA, period) {
    const curMonth = plan ? plan.month : (targetMonthStr || '2026-11');
    const expenseA = txsA.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);

    let benchmarkAmt = 0;
    if (comparisonMode === 'budget') {
      if (plan && plan.items) {
        benchmarkAmt = plan.items.reduce((sum, it) => {
          return sum + calculateProratedAmount(it, period, curMonth, customStartDate, customEndDate);
        }, 0);
      }
    } else {
      const txsB = getBenchmarkTransactions(state.transactions || [], curMonth).filter(t => t.type === 'expense');
      benchmarkAmt = txsB.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    }

    // 1. مؤشر الانضباط المالي والنتيجة
    let adherenceScore = 100;
    if (benchmarkAmt > 0) {
      if (comparisonMode === 'budget') {
        const overRatio = Math.max(0, expenseA - benchmarkAmt) / benchmarkAmt;
        adherenceScore = Math.max(0, Math.round((1 - overRatio) * 100));
      } else {
        const growthRatio = ((expenseA - benchmarkAmt) / benchmarkAmt);
        adherenceScore = growthRatio <= 0 ? 100 : Math.max(0, Math.round((1 - growthRatio) * 100));
      }
    }

    // 2. معدل التغير ونمو الإنفاق
    const growthRate = benchmarkAmt > 0 ? (((expenseA - benchmarkAmt) / benchmarkAmt) * 100) : 0;
    const isGrowthDown = growthRate <= 0;

    // 3. صافي الفرق والنتيجة المالية
    const netDiff = (comparisonMode === 'budget') ? (benchmarkAmt - expenseA) : (expenseA - benchmarkAmt);
    const isNetSaved = (comparisonMode === 'budget') ? (netDiff >= 0) : (netDiff <= 0);

    // 4. أكبر البنود أثراً
    const catMapA = {};
    txsA.filter(t => t.type === 'expense').forEach(t => {
      catMapA[t.category] = (catMapA[t.category] || 0) + (Number(t.amount) || 0);
    });
    const sortedCats = Object.keys(catMapA).sort((a, b) => catMapA[b] - catMapA[a]);
    let topCatName = 'لا توجد مصاريف مسجلة';
    let topCatPct = 0;
    if (sortedCats.length > 0 && expenseA > 0) {
      const topCatObj = (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []).find(c => c.id === sortedCats[0]);
      topCatName = topCatObj ? topCatObj.name : sortedCats[0];
      topCatPct = Math.round((catMapA[sortedCats[0]] / expenseA) * 100);
    }

    return `
      <!-- ترويسة قسم التحليلات أسفل الصفحة -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 6px;">
        <div style="font-size: 0.88rem; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 7px;">
          <i class="fa-solid fa-chart-pie"></i>
          <span>مؤشرات وتحليلات الرقابة المالية والرسوم البيانية (الفرق والنتيجة والتغير):</span>
        </div>
        <span style="font-size: 0.68rem; font-weight: 850; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); padding: 3px 8px; border-radius: 8px;">
          تحليل فوري دقيق ✨
        </span>
      </div>

      <!-- شبكة المؤشرات الأربعة (BI KPI Cards) -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px;">
        <!-- كارت 1: مؤشر الانضباط والنتيجة -->
        <div style="background: rgba(16, 185, 129, 0.10); border: 1.2px solid rgba(16, 185, 129, 0.35); border-radius: 12px; padding: 8px 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.70rem; font-weight: 850; color: #34d399; margin-bottom: 2px;">
            <span>مؤشر الانضباط والنتيجة</span><i class="fa-solid fa-award"></i>
          </div>
          <div style="font-size: 1.15rem; font-weight: 900; color: #34d399;">${adherenceScore}%</div>
          <div style="font-size: 0.64rem; color: #94a3b8; margin-top: 1px;">
            ${adherenceScore >= 85 ? '✅ نتيجة ممتازة ضمن السقف' : (adherenceScore >= 60 ? '⚠️ انضباط متوسط' : '🚨 تجاوز غير منضبط')}
          </div>
        </div>

        <!-- كارت 2: معدل التغير ونمو الإنفاق -->
        <div style="background: ${isGrowthDown ? 'rgba(16, 185, 129, 0.10)' : 'rgba(239, 68, 68, 0.10)'}; border: 1.2px solid ${isGrowthDown ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}; border-radius: 12px; padding: 8px 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.70rem; font-weight: 850; color: ${isGrowthDown ? '#34d399' : '#f87171'}; margin-bottom: 2px;">
            <span>معدل التغير والنمو</span><i class="fa-solid fa-arrow-trend-${isGrowthDown ? 'down' : 'up'}"></i>
          </div>
          <div style="font-size: 1.15rem; font-weight: 900; color: ${isGrowthDown ? '#34d399' : '#f87171'}; direction: ltr;">
            ${isGrowthDown ? '🔻 ' : '🔺 +'}${growthRate.toFixed(1)}%
          </div>
          <div style="font-size: 0.64rem; color: #94a3b8; margin-top: 1px;">
            ${isGrowthDown ? 'ترشيد ووفر مقارنة بالمقابل' : 'زيادة في وتيرة الصرف'}
          </div>
        </div>

        <!-- كارت 3: صافي الفرق والوفر المحقق -->
        <div style="background: rgba(56, 189, 248, 0.10); border: 1.2px solid rgba(56, 189, 248, 0.35); border-radius: 12px; padding: 8px 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.70rem; font-weight: 850; color: #38bdf8; margin-bottom: 2px;">
            <span>صافي النتيجة (الفرق)</span><i class="fa-solid fa-scale-balanced"></i>
          </div>
          <div style="font-size: 0.95rem; font-weight: 900; color: ${isNetSaved ? '#34d399' : '#f87171'}; direction: rtl;">
            ${isNetSaved ? '+ ' : '- '}${formatMoneyVal(Math.abs(netDiff))}
          </div>
          <div style="font-size: 0.64rem; color: #94a3b8; margin-top: 1px;">
            ${isNetSaved ? 'وفر مالي صافي محقق' : 'عجز إجمالي وتجاوز'}
          </div>
        </div>

        <!-- كارت 4: أكبر البنود أثراً في الصرف -->
        <div style="background: rgba(245, 158, 11, 0.10); border: 1.2px solid rgba(245, 158, 11, 0.35); border-radius: 12px; padding: 8px 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.70rem; font-weight: 850; color: #fbbf24; margin-bottom: 2px;">
            <span>أعلى بند استهلاكاً</span><i class="fa-solid fa-fire"></i>
          </div>
          <div style="font-size: 0.88rem; font-weight: 900; color: #fbbf24; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(topCatName)} (${topCatPct}%)
          </div>
          <div style="font-size: 0.64rem; color: #94a3b8; margin-top: 1px;">
            يمثل الحصة الأكبر من المصروفات
          </div>
        </div>
      </div>

      <!-- الرسوم البيانية المتطورة (مخطط الأعمدة المقارن + مخطط الكعكة) -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
        
        <!-- 1. مخطط الأعمدة المقارن التفاعلي -->
        <div class="budget-chart-panel" style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(56, 189, 248, 0.3); border-radius: 14px; padding: 12px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <div style="font-size: 0.82rem; font-weight: 850; color: #38bdf8; display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
            <i class="fa-solid fa-chart-column"></i>
            <span>مخطط المقارنة الرقابية (المنصرف الفعلي 🔵 مقابل العمود المقابل 🟠):</span>
          </div>
          <div style="height: 230px; position: relative;">
            <canvas id="monthlyBudgetCompareChart"></canvas>
          </div>
        </div>

        <!-- 2. مخطط توزيع المصروفات الفعلية كعكة (Doughnut Chart) -->
        <div class="budget-chart-panel" style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 12px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <div style="font-size: 0.82rem; font-weight: 850; color: #34d399; display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
            <i class="fa-solid fa-chart-pie"></i>
            <span>مخطط توزيع المصروفات الفعلية على البنود (الأوزان النسبية):</span>
          </div>
          <div style="height: 220px; position: relative;">
            <canvas id="monthlyBudgetDistributionChart"></canvas>
          </div>
        </div>

      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 5. رسم وتحديث الشارتات بواسطة Chart.js بدقة وسلاسة
  // ---------------------------------------------------------------------------
  function renderCharts(plan, txsA, period) {
    if (typeof Chart === 'undefined') return;

    const curMonth = plan ? plan.month : (targetMonthStr || '2026-11');
    const expenseTxsA = txsA.filter(t => t.type === 'expense');
    const expenseTxsB = (comparisonMode === 'period') 
      ? getBenchmarkTransactions(state.transactions || [], curMonth).filter(t => t.type === 'expense')
      : [];

    const items = (plan && plan.items && plan.items.length > 0) ? plan.items : [];

    const labels = [];
    const actualData = [];
    const benchmarkData = [];
    const pieLabels = [];
    const pieData = [];
    const pieColors = [];

    const catColors = {
      food: '#38bdf8',
      daily: '#f59e0b',
      bills: '#ef4444',
      transport: '#10b981',
      house: '#8b5cf6',
      health: '#ec4899',
      clothes: '#14b8a6',
      education: '#f97316',
      other: '#64748b'
    };

    items.forEach(it => {
      const cat = (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []).find(c => c.id === it.category) || { name: it.title || 'بند', color: '#38bdf8' };
      labels.push(it.title || cat.name);

      const matchesA = (typeof getExpensesForBudgetItem === 'function')
        ? getExpensesForBudgetItem(it, expenseTxsA, items)
        : expenseTxsA.filter(t => (t.category === it.category || t.budgetItemId === it.id));
      const valA = matchesA.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      actualData.push(valA);

      if (comparisonMode === 'budget') {
        const valEst = calculateProratedAmount(it, period, curMonth, customStartDate, customEndDate);
        benchmarkData.push(valEst);
      } else {
        const matchesB = (typeof getExpensesForBudgetItem === 'function')
          ? getExpensesForBudgetItem(it, expenseTxsB, items)
          : expenseTxsB.filter(t => (t.category === it.category || t.budgetItemId === it.id));
        const valB = matchesB.reduce((s, t) => s + (Number(t.amount) || 0), 0);
        benchmarkData.push(valB);
      }

      if (valA > 0) {
        pieLabels.push(it.title || cat.name);
        pieData.push(valA);
        pieColors.push(catColors[it.category] || cat.color || '#38bdf8');
      }
    });

    // 1. شارت الأعمدة المقارن (Dual-Bar)
    const barCanvas = document.getElementById('monthlyBudgetCompareChart');
    if (barCanvas) {
      const existingChart = Chart.getChart(barCanvas);
      if (existingChart) existingChart.destroy();
      if (barChartInstance) {
        barChartInstance.destroy();
        barChartInstance = null;
      }
      const ctx = barCanvas.getContext('2d');
      const oppLabel = (comparisonMode === 'budget') ? 'المقدر للفترة' : `الفترة المقابلة (${benchmarkMonthStr || 'السابق'})`;

      barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels.slice(0, 10),
          datasets: [
            {
              label: 'المنصرف الفعلي 🔵',
              data: actualData.slice(0, 10),
              backgroundColor: 'rgba(2, 132, 199, 0.85)',
              borderColor: '#38bdf8',
              borderWidth: 1.5,
              borderRadius: 6
            },
            {
              label: oppLabel + ' 🟠',
              data: benchmarkData.slice(0, 10),
              backgroundColor: 'rgba(245, 158, 11, 0.85)',
              borderColor: '#fbbf24',
              borderWidth: 1.5,
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              rtl: true,
              labels: {
                color: '#cbd5e1',
                font: { family: 'Cairo', size: 10, weight: '700' },
                boxWidth: 12
              }
            },
            tooltip: {
              rtl: true,
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: ${formatMoneyVal(ctx.parsed.y)}`
              }
            }
          },
          scales: {
            x: {
              ticks: { color: '#94a3b8', font: { family: 'Cairo', size: 9 } },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
              ticks: { color: '#94a3b8', font: { family: 'Cairo', size: 9 } },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
          }
        }
      });
    }

    // 2. شارت التوزيع النسبي (Doughnut)
    const donutCanvas = document.getElementById('monthlyBudgetDistributionChart');
    if (donutCanvas) {
      const existingDonut = Chart.getChart(donutCanvas);
      if (existingDonut) existingDonut.destroy();
      if (doughnutChartInstance) {
        doughnutChartInstance.destroy();
        doughnutChartInstance = null;
      }
      const ctx2 = donutCanvas.getContext('2d');
      doughnutChartInstance = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: pieLabels.length > 0 ? pieLabels : ['لا توجد مصاريف'],
          datasets: [
            {
              data: pieData.length > 0 ? pieData : [1],
              backgroundColor: pieColors.length > 0 ? pieColors : ['#475569'],
              borderColor: 'rgba(15, 23, 42, 0.9)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              rtl: true,
              labels: {
                color: '#cbd5e1',
                font: { family: 'Cairo', size: 10, weight: '700' },
                boxWidth: 12
              }
            },
            tooltip: {
              rtl: true,
              callbacks: {
                label: ctx => ` ${ctx.label}: ${formatMoneyVal(ctx.parsed)}`
              }
            }
          }
        }
      });
    }
  }

  // Independent, read-only insights for the selected monthly plan.
  // Avoid contaminating monthly actuals with another month or saved projections.
  function renderMonthlyInsights(plan) {
    if (!plan || !/^\d{4}-\d{2}$/.test(String(plan.month || ''))) return '';
    const month = plan.month;
    const [year, mm] = month.split('-').map(Number);
    const days = new Date(year, mm, 0).getDate();
    const now = new Date();
    const todayMonth = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0')].join('-');
    const isCurrent = month === todayMonth;
    const isPast = month < todayMonth;
    const elapsed = isPast ? days : (isCurrent ? Math.min(days, now.getDate()) : 0);
    const monthlyPlan = (plan.items || []).reduce((a, it) => a + Math.max(0, Number(it.amount) || 0), 0);
    const txs = (typeof state !== 'undefined' && Array.isArray(state.transactions) ? state.transactions : []);
    const expenses = txs.filter(t => t.type === 'expense' && String(t.date || '').slice(0, 7) === month);
    const actual = expenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const percent = monthlyPlan > 0 ? actual / monthlyPlan * 100 : null;
    const daysRemaining = Math.max(0, days - elapsed);
    const perDay = elapsed > 0 ? actual / elapsed : null;
    const forecast = isCurrent && elapsed > 0 ? perDay * days : null;
    const plannedPerDay = monthlyPlan > 0 ? monthlyPlan / days : null;
    const permittedPerDay = isCurrent && daysRemaining > 0 && monthlyPlan > 0
      ? Math.max(0, monthlyPlan - actual) / daysRemaining : null;
    const prevDate = new Date(year, mm - 2, 1);
    const prevMonth = [prevDate.getFullYear(), String(prevDate.getMonth() + 1).padStart(2, '0')].join('-');
    const prevMonthDays = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0).getDate();
    const prevExpenses = txs.filter(t => t.type === 'expense' &&
      String(t.date || '').slice(0, 7) === prevMonth &&
      (!isCurrent || Number(String(t.date || '').slice(8, 10)) <= Math.min(elapsed, prevMonthDays)));
    const prevActual = prevExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const prevChange = prevActual > 0 ? (actual - prevActual) / prevActual * 100 : null;
    const cats = new Map();
    for (const it of plan.items || []) {
      const cat = it.category || 'other';
      const item = cats.get(cat) || {name:cat, planned:0, actual:0};
      item.planned += Math.max(0, Number(it.amount) || 0);
      item.name = it.title || cat;
      cats.set(cat, item);
    }
    for (const tx of expenses) {
      const cat = tx.category || 'other';
      const item = cats.get(cat) || {name:cat, planned:0, actual:0};
      item.actual += Number(tx.amount) || 0;
      cats.set(cat, item);
    }
    const over = Array.from(cats.entries()).map(([category, item]) => ({...item,category}))
      .filter(x => x.actual > x.planned && x.actual > 0)
      .sort((a, b) => (b.actual - b.planned) - (a.actual - a.planned)).slice(0, 4);
    const fmt = v => Number.isFinite(v) ? v.toLocaleString('ar-EG', {maximumFractionDigits:0}) : '—';
    const metric = (name, value, hint, scope = 'actual', details = '') =>
      '<button type="button" class="monthly-insight-card" data-budget-drill-scope="' + scope + '" ' + details + '><small>' + name + '</small><strong>' + value +
      '</strong><span>' + hint + ' · اضغط للتفاصيل</span></button>';
    const pct = value => value === null ? '—' : (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
    const variance = monthlyPlan - actual;
    const completionLabel = isCurrent ? ('حتى يوم ' + elapsed + ' من ' + days) : (isPast ? 'شهر مكتمل' : 'شهر لم يبدأ');
    const weekly = [0,0,0,0,0];
    for (const tx of expenses) {
      const day = Number(String(tx.date || '').slice(8,10));
      if (day >= 1 && day <= days) weekly[Math.min(4, Math.floor((day - 1) / 7))] += Number(tx.amount) || 0;
    }
    const largest = Math.max(1, ...weekly);
    const activeDays = new Set(expenses.map(t => t.date).filter(Boolean)).size;
    const avgTransaction = expenses.length ? actual / expenses.length : 0;
    const dailyTotals = new Map();
    for (const tx of expenses) dailyTotals.set(tx.date, (dailyTotals.get(tx.date) || 0) + (Number(tx.amount) || 0));
    const highestDay = [...dailyTotals.entries()].sort((a,b) => b[1] - a[1])[0] || ['',0];
    const largestTx = [...expenses].sort((a,b) => (Number(b.amount)||0) - (Number(a.amount)||0))[0] || null;
    const catsBySpend = [...cats.entries()].filter(([,item]) => item.actual>0)
      .sort((a,b) => b[1].actual - a[1].actual);
    const topCategory = catsBySpend[0] || ['',{name:'—',actual:0}];
    const topThreeShare = actual>0
      ? catsBySpend.slice(0,3).reduce((sum,[,item])=>sum+item.actual,0)/actual*100 : 0;
    const budgetCategoryIds = new Set((plan.items || []).map(it=>it.category || 'other'));
    const unplannedAmount = expenses.filter(t=>!budgetCategoryIds.has(t.category || 'other'))
      .reduce((sum,t)=>sum+(Number(t.amount)||0),0);
    const spentShare = monthlyPlan>0 ? actual/monthlyPlan*100 : null;
    const elapsedShare = elapsed>0 ? elapsed/days*100 : null;
    const paceDelta = (spentShare!==null && elapsedShare!==null)
      ? spentShare-elapsedShare : null;
    const daysWithoutSpend = Math.max(0, elapsed-activeDays);
    const realOverrunCategories = [...cats.values()].filter(x=>x.planned>0&&x.actual>x.planned).length;
    const safeAttr = v=>escapeHtml(String(v==null?'':v));
    return '<section class="monthly-insights" aria-label="تحليلات موازنة الشهر">' +
      '<h3>تحليل الموازنة والتوقعات • ' + month + '</h3>' +
      '<p>جميع الأرقام محسوبة من عمليات الشهر المختار؛ التوقع تقديري وليس عملية مسجلة. ' + completionLabel + '</p>' +
      '<div class="monthly-insight-grid">' +
        metric('المنصرف من الموازنة', percent === null ? 'غير متاح' : percent.toFixed(1) + '%', 'المخطط ' + fmt(monthlyPlan) + ' / الفعلي ' + fmt(actual)) +
        metric('وفر أو تجاوز الموازنة', (variance >= 0 ? '+' : '−') + fmt(Math.abs(variance)), variance >= 0 ? 'المتبقي من المخصص' : 'تجاوز المخطط') +
        metric('متوسط الإنفاق اليومي', perDay === null ? '—' : fmt(perDay), 'المخطط يوميًا ' + fmt(plannedPerDay)) +
        metric('التغير عن الشهر السابق', pct(prevChange), isCurrent ? 'لنفس عدد الأيام المنقضية' : 'مقارنة بالشهر السابق') +
        metric('توقع نهاية الشهر', forecast === null ? '—' : fmt(forecast), !isCurrent ? 'يظهر للشهر الجاري فقط' : (forecast > monthlyPlan && monthlyPlan > 0 ? 'تحذير: أعلى من المخطط' : 'بافتراض استمرار المعدل الحالي')) +
        metric('الحد اليومي المتاح', permittedPerDay === null ? '—' : fmt(permittedPerDay), 'للأيام المتبقية دون تجاوز الموازنة') +
        metric('عدد عمليات المصروفات', fmt(expenses.length), 'العمليات الفعلية في الشهر المحدد') +
        metric('متوسط قيمة العملية', fmt(avgTransaction), 'المنصرف ÷ عدد العمليات') +
        metric('أيام حدث فيها إنفاق', fmt(activeDays), 'من ' + elapsed + ' يومًا منقضيًا') +
        metric('أيام بدون مصروف', isPast || isCurrent ? fmt(daysWithoutSpend) : '—', 'أيام بدون عمليات حتى تاريخ التقرير') +
        metric('أعلى يوم إنفاق', fmt(highestDay[1]), highestDay[0] || 'لا توجد عمليات', 'highest-day',
          'data-budget-date="'+safeAttr(highestDay[0])+'"') +
        metric('أكبر عملية منفردة', largestTx ? fmt(Number(largestTx.amount)||0) : '—',
          largestTx ? (escapeHtml(largestTx.label || largestTx.date || '')) : 'لا توجد عمليات', 'largest-transaction',
          'data-budget-tx-id="'+safeAttr(largestTx?.id)+'"') +
        metric('أعلى تصنيف إنفاقًا', safeAttr(topCategory[1].name),
          fmt(topCategory[1].actual) + ' من المنصرف', 'top-category',
          'data-budget-category="'+safeAttr(topCategory[0])+'"') +
        metric('حصة أعلى 3 تصنيفات', topThreeShare.toFixed(1)+'%', 'مؤشر تركز الإنفاق') +
        metric('مصروفات خارج بنود الموازنة', fmt(unplannedAmount), 'فئات لم تدخل بالخطة', 'unplanned') +
        metric('فرق الإيقاع عن الوقت', paceDelta===null ? '—' :
          ((paceDelta>0?'+':'')+paceDelta.toFixed(1)+' نقطة'), 'المستهلك من الموازنة مقارنة بنسبة أيام الشهر') +
        metric('عدد التصنيفات المتجاوزة', fmt(realOverrunCategories), 'فئات تخطت سقفها التقديري') +
      '</div>' +
      '<div class="monthly-insight-details"><div><h4>توزيع المصروفات حسب أسابيع الشهر</h4><div class="monthly-week-bars">' +
        weekly.map((v, i) => '<div class="monthly-week-line" tabindex="0" role="button" data-budget-week="'+i+'"><span>أسبوع ' + (i + 1) + '</span><div class="monthly-week-track"><i style="width:' + (Math.max(0, v) / largest * 100).toFixed(1) + '%"></i></div><b>' + fmt(v) + '</b></div>').join('') +
      '</div></div><div><h4>أكبر تجاوزات البنود</h4>' +
        (over.length ? '<div class="monthly-overrun-list">' + over.map(x =>
          '<div tabindex="0" role="button" data-budget-cat="'+safeAttr(x.category)+'"><span>' + String(x.name).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])) +
          '</span><b>+' + fmt(x.actual - x.planned) + '</b></div>').join('') + '</div>' :
          '<p>لا توجد تجاوزات على البنود المسجلة لهذا الشهر.</p>') +
      '</div></div></section>';
  }

  // ---------------------------------------------------------------------------
  // 6. التحديث الشامل والمتناغم لمنظومة الموازنات (Master Synchronizer)
  // ---------------------------------------------------------------------------
  function refreshActiveBudgetAudit() {
    // Never use an old global plan after the user changes the selected budget.
    const plans = (typeof state !== 'undefined' && Array.isArray(state.monthlyBudgets))
      ? state.monthlyBudgets : [];
    const selected = plans.find(b => b && b.id === state.activeBudgetId);
    let plan = selected || (window.currentBudgetMonthData &&
      plans.find(b => b && b.id === window.currentBudgetMonthData.id)) ||
      plans[0] || null;
    if (plan) window.currentBudgetMonthData = plan;
    if (plan && typeof ensureBudgetItems === 'function') {
      ensureBudgetItems(plan);
    }

    const curMonth = plan ? plan.month : (targetMonthStr || new Date().toISOString().slice(0, 7));

    // سحب التسجيلات الفعلية للعمليات
    const txsA = getTransactionsForPeriod(state.transactions || [], activeTimePeriod, curMonth, customStartDate, customEndDate);

    // 1. حقن شريط التحكم وفترة المقارنة
    const stripEl = document.getElementById('budgetMonthlyTimeFiltersContainer');
    if (stripEl) {
      stripEl.innerHTML = renderControlHeaderStrip(plan, state.transactions || []);
    }

    // 2. حقن جدول الرقابة والمقارنة على مستوى البند
    const tblContainer = document.getElementById('budgetActualVsEstimatedContainer');
    if (tblContainer) {
      tblContainer.innerHTML = renderActualVsEstimatedTable(plan, txsA, activeTimePeriod);
    }

    // 3. حقن مصفوفة توزيع أفراد الأسرة
    const memContainer = document.getElementById('budgetMemberBreakdownContainer');
    if (memContainer) {
      memContainer.innerHTML = renderFamilyMemberBreakdown(plan, txsA, activeTimePeriod);
    }

    // 4. حقن قسم المؤشرات والتحليلات والرسوم البيانية أسفل الصفحة
    const bottomAnalytics = document.getElementById('budgetBottomAnalyticsSection');
    if (bottomAnalytics) {
      bottomAnalytics.innerHTML = renderBottomAnalyticsAndCharts(plan, txsA, activeTimePeriod);
      bottomAnalytics.insertAdjacentHTML('beforeend', renderMonthlyInsights(plan));
    } else {
      // The current unified monthly-budget panel uses its own DOM structure.
      // Create a dedicated analytics slot instead of silently skipping insights.
      const panel = document.getElementById('panelMonthlyBudget');
      if (panel) {
        let insightSlot = document.getElementById('budgetMonthlyInsights');
        if (!insightSlot) {
          insightSlot = document.createElement('div');
          insightSlot.id = 'budgetMonthlyInsights';
          panel.appendChild(insightSlot);
        }
        insightSlot.innerHTML = renderMonthlyInsights(plan);
      }
    }

    // 5. رسم الشارتات
    renderCharts(plan, txsA, activeTimePeriod);

    // 6. مزامنة بطاقات الـ KPIs العلوية مع الفترة المختارة لمنع التناقض
    const periodExpense = txsA.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    
    let totalProratedEst = 0;
    if (plan && plan.items) {
      totalProratedEst = plan.items.reduce((sum, it) => {
        return sum + calculateProratedAmount(it, activeTimePeriod, curMonth, customStartDate, customEndDate);
      }, 0);
    }

    const kpiAct = document.getElementById('budgetKpiActual');
    if (kpiAct) {
      kpiAct.textContent = formatMoneyVal(periodExpense);
    }

    const kpiEst = document.getElementById('budgetKpiExpense');
    if (kpiEst) {
      kpiEst.textContent = (activeTimePeriod !== 'month') ? formatMoneyVal(totalProratedEst) : formatMoneyVal(totalProratedEst);
    }

    const kpiSurplus = document.getElementById('budgetKpiSurplus');
    if (kpiSurplus) {
      const diff = totalProratedEst - periodExpense;
      kpiSurplus.textContent = (diff >= 0 ? '+ ' : '- ') + formatMoneyVal(Math.abs(diff));
      kpiSurplus.style.color = diff >= 0 ? '#34d399' : '#f87171';
    }

    const progBar = document.getElementById('budgetProgressOverall');
    if (progBar && totalProratedEst > 0) {
      const pct = Math.round((periodExpense / totalProratedEst) * 100);
      progBar.style.width = Math.max(0, Math.min(100, pct)) + '%';
      progBar.style.backgroundColor = (pct > 100) ? '#ef4444' : (pct >= 85 ? '#f59e0b' : '#10b981');
    }
  }

  // ---------------------------------------------------------------------------
  // 7. دوال التحكم والأحداث العامة (Public API)
  // ---------------------------------------------------------------------------
  function selectPeriod(period) {
    activeTimePeriod = period;
    if (period === 'custom') {
      isCustomRangeBoxOpen = true;
    } else {
      isCustomRangeBoxOpen = false;
    }
    refreshActiveBudgetAudit();
  }

  function selectMonth(monthVal) {
    if (!monthVal) return;
    targetMonthStr = monthVal;
    activeTimePeriod = 'month';

    // البحث عما إذا كانت هناك ميزانية محفوظة لهذا الشهر
    const foundPlan = (state.monthlyBudgets || []).find(b => b.month === monthVal);
    if (foundPlan) {
      state.activeBudgetId = foundPlan.id;
      window.currentBudgetMonthData = foundPlan;
      if (typeof loadActiveBudgetPlan === 'function') loadActiveBudgetPlan();
    }
    refreshActiveBudgetAudit();
  }

  function setComparisonBenchmark(mode) {
    comparisonMode = mode;
    refreshActiveBudgetAudit();
  }

  function setBenchmarkMonth(monthVal) {
    benchmarkMonthStr = monthVal;
    refreshActiveBudgetAudit();
  }

  function applyCustomRange() {
    const inpS = document.getElementById('inpAuditCustomStart');
    const inpE = document.getElementById('inpAuditCustomEnd');
    if (!inpS || !inpE) return;

    const s = inpS.value;
    const e = inpE.value;
    if (!s || !e) {
      if (typeof showToast === 'function') showToast('⚠️ يرجى تحديد تاريخي البداية والنهاية');
      return;
    }
    if (s > e) {
      if (typeof showToast === 'function') showToast('⚠️ تاريخ البداية يجب أن يسبق تاريخ النهاية');
      return;
    }

    customStartDate = s;
    customEndDate = e;
    activeTimePeriod = 'custom';
    isCustomRangeBoxOpen = true;
    refreshActiveBudgetAudit();
    if (typeof showToast === 'function') showToast(`📅 تم تطبيق الفترة: من ${s} إلى ${e}`);
  }

  function selectProject(projName) {
    window.selectedProjectBudgetName = projName;
    renderProjectBudgetsAdvanced();
  }

  function selectProjectPeriod(period) {
    activeProjectTimePeriod = period;
    renderProjectBudgetsAdvanced();
  }

  function setComparisonPeriods(monthA, monthB) {
    if (monthA) targetMonthStr = monthA;
    if (monthB) benchmarkMonthStr = monthB;
    comparisonMode = 'period';
    refreshActiveBudgetAudit();
  }

  function switchArchiveTab(tab) {
    activeHistoryArchiveTab = tab;
    renderBudgetHistoryAdvanced();
  }

  function cloneBudget(budgetId) {
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
    refreshActiveBudgetAudit();
    if (typeof showToast === 'function') showToast(`✨ تم استنساخ الخطة بنجاح لشهر (${nextMonthStr})`);
  }

  function exportBudgetToExcel() {
    if (typeof XLSX === 'undefined') {
      if (typeof showToast === 'function') showToast('⚠️ تعذر تحميل مكتبة تصدير Excel');
      return;
    }

    const plan = window.currentBudgetMonthData;
    if (!plan || !plan.items || plan.items.length === 0) {
      if (typeof showToast === 'function') showToast('⚠️ لا توجد بيانات ميزانية لتصديرها');
      return;
    }

    const curMonth = plan.month || (targetMonthStr || '2026-11');
    const txsA = getTransactionsForPeriod(state.transactions || [], activeTimePeriod, curMonth, customStartDate, customEndDate);
    const expenseA = txsA.filter(t => t.type === 'expense');

    const data = [
      ['كشف الرقابة والمقارنة المالية للميزانية'],
      ['الشهر / الفترة:', curMonth, 'الفترة النشطة:', activeTimePeriod],
      ['تاريخ الاستخراج:', new Date().toLocaleString('ar-EG')],
      [],
      ['البند / التصنيف', 'المنصرف الفعلي (ج.م)', (comparisonMode === 'budget' ? 'المقدر للفترة (ج.م)' : `الفترة المقابلة ${benchmarkMonthStr || 'السابق'}`), 'الفارق / النتيجة (ج.م)', 'نسبة التغير %']
    ];

    plan.items.forEach(it => {
      const matches = (typeof getExpensesForBudgetItem === 'function')
        ? getExpensesForBudgetItem(it, expenseA, plan.items)
        : expenseA.filter(t => t.category === it.category);
      const act = matches.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const est = (comparisonMode === 'budget')
        ? calculateProratedAmount(it, activeTimePeriod, curMonth, customStartDate, customEndDate)
        : 0;
      const diff = est - act;
      const pct = est > 0 ? ((act / est) * 100).toFixed(1) + '%' : '0%';

      data.push([
        it.title || it.category,
        act,
        est,
        diff,
        pct
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!views'] = [{ rightToLeft: true }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الموازنة والرقابة');
    XLSX.writeFile(wb, `budget_audit_${curMonth}_${Date.now()}.xlsx`);

    if (typeof showToast === 'function') {
      showToast(`📊 تم تصدير كشف الموازنة إلى Excel بنجاح`);
    }
  }

  // ---------------------------------------------------------------------------
  // 8. لوحة موازنات المشاريع المستقلة والأرشيف (Preserved & Enhanced)
  // ---------------------------------------------------------------------------
  function renderProjectBudgetsAdvanced() {
    if (typeof switchProjectView === 'function') {
      switchProjectView('compare');
    } else if (window.ProjectCompareEngine) {
      ProjectCompareEngine.render();
    }
  }

  function renderExecutiveComparisonsAudit() {
    // تبويب المقارنات والرقابة يتكامل مع نفس محرك المقارنات الشامل
    const container = document.getElementById('panelBudgetComparisons');
    if (!container) return;

    comparisonMode = 'period';
    container.innerHTML = `
      <div id="sectionComparisons" style="display: block; padding: 0 4px 10px;">
        <div id="budgetComparisonsDedicatedContainer"></div>
      </div>
    `;

    // توجيه العرض لمحرك الرقابة المقارن
    refreshActiveBudgetAudit();
  }

  function renderBudgetHistoryAdvanced() {
    const container = document.getElementById('panelBudgetHistory');
    if (!container) return;

    const monthlyPlans = (state.monthlyBudgets || []).filter(b => !b.project);
    const projectPlans = (state.monthlyBudgets || []).filter(b => b.project);

    container.innerHTML = `
      <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.88rem; font-weight: 900; color: #a855f7; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-box-archive"></i>
          <span>سجل وأرشيف الموازنات والخطط:</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${(activeHistoryArchiveTab === 'monthly' ? monthlyPlans : projectPlans).map(b => `
          <div style="background: rgba(15, 23, 42, 0.7); border: 1.2px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.82rem; font-weight: 900; color: #f8fafc;">${escapeHtml(b.name || b.month)}</div>
              <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px;">الشهر: ${b.month} · البنود: ${(b.items || []).length} بند</div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button type="button" onclick="BudgetAuditEngine.selectMonth('${b.month}')" style="padding: 4px 10px; background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.72rem; font-weight: 850; border-radius: 7px; cursor: pointer;">
                فتح ومقارنة
              </button>
              <button type="button" onclick="BudgetAuditEngine.cloneBudget('${b.id || b.month}')" style="padding: 4px 8px; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 0.72rem; font-weight: 850; border-radius: 7px; cursor: pointer;" title="استنساخ">
                <i class="fa-solid fa-copy"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // واجهة الربط العامة (Public API)
  // ---------------------------------------------------------------------------
  return {
    selectPeriod,
    selectMonth,
    setComparisonBenchmark,
    setBenchmarkMonth,
    applyCustomRange,
    selectProject,
    selectProjectPeriod,
    setComparisonPeriods,
    switchArchiveTab,
    cloneBudget,
    exportBudgetToExcel,
    getNavigationContext: () => ({period:activeTimePeriod,month:(state.monthlyBudgets||[]).find(b=>b.id===state.activeBudgetId)?.month || targetMonthStr,benchmarkMonth:benchmarkMonthStr,comparisonMode,customStart:customStartDate,customEnd:customEndDate}),
    refreshActiveBudgetAudit,
    renderProjectBudgetsAdvanced,
    renderExecutiveComparisonsAudit,
    renderBudgetHistoryAdvanced
  };
})();



// =============================================================================
// BudgetCompareEngine & BudgetArchiveEngine (v5.3.77 Advanced Comparison & Archive Suite)
// =============================================================================

const BudgetCompareEngine = (() => {
  let _actualPeriod = 'thisMonth';
  let _estimPeriod = 'thisMonth';
  let _actualFrom = null, _actualTo = null;
  let _estimFrom = null, _estimTo = null;
  let _chartDough = null, _chartBar = null, _chartLine = null;

  function pad(n) { return String(n).padStart(2, '0'); }

  function formatDateStr(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function dateDiffDays(d1, d2) {
    const t1 = new Date(d1).getTime();
    const t2 = new Date(d2).getTime();
    return Math.max(1, Math.round(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24)) + 1);
  }

  function periodToRange(period, customFrom, customTo) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const day = now.getDate();

    if (period === 'today') {
      const s = formatDateStr(now);
      return { from: s, to: s, label: 'اليوم' };
    }
    if (period === 'yesterday') {
      const yest = new Date(y, m, day - 1);
      const s = formatDateStr(yest);
      return { from: s, to: s, label: 'أمس' };
    }
    if (period === 'thisWeek') {
      const dayOfWeek = now.getDay(); // 0 is Sun, 6 is Sat. Saturday is week start in SA/Arab
      const diffToSat = (dayOfWeek + 1) % 7; 
      const start = new Date(y, m, day - diffToSat);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'الأسبوع الحالى' };
    }
    if (period === 'lastWeek') {
      const dayOfWeek = now.getDay();
      const diffToSat = (dayOfWeek + 1) % 7;
      const end = new Date(y, m, day - diffToSat - 1);
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'الأسبوع السابق' };
    }
    if (period === 'thisMonth') {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'الشهر الحالى' };
    }
    if (period === 'lastMonth') {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'الشهر السابق' };
    }
    if (period === 'thisYear') {
      const start = new Date(y, 0, 1);
      const end = new Date(y, 11, 31);
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'السنة الحالية' };
    }
    if (period === 'lastYear') {
      const start = new Date(y - 1, 0, 1);
      const end = new Date(y - 1, 11, 31);
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'السنة السابقة' };
    }
    if (period === 'custom') {
      const f = customFrom || formatDateStr(new Date(y, m, 1));
      const t = customTo || formatDateStr(now);
      return { from: f, to: t, label: 'فترة مخصصة' };
    }
    return { from: formatDateStr(new Date(y, m, 1)), to: formatDateStr(now), label: 'الشهر الحالى' };
  }

  function getActiveEstimBudgetTotal() {
    if (typeof state === 'undefined') return 0;
    const now = new Date();
    const curMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    const plans = state.monthlyBudgets || [];
    const activePlan = plans.find(p => p.month === curMonth) || plans[0];
    if (activePlan && Array.isArray(activePlan.items) && activePlan.items.length > 0) {
      return activePlan.items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
    }
    return 0;
  }

  function getActivePlanCategoryEstimMap() {
    if (typeof state === 'undefined') return {};
    const now = new Date();
    const curMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    const plans = state.monthlyBudgets || [];
    const activePlan = plans.find(p => p.month === curMonth) || plans[0];
    const map = {};
    if (activePlan && Array.isArray(activePlan.items)) {
      activePlan.items.forEach(it => {
        if (it.category) map[it.category] = (map[it.category] || 0) + (parseFloat(it.amount) || 0);
      });
    }
    return map;
  }

  function getActualsForRange(fromDate, toDate) {
    if (typeof state === 'undefined' || !Array.isArray(state.transactions)) return { items: [], total: 0, byMember: {}, byDate: {} };

    const catMap = {};
    const byMember = {};
    const byDate = {};
    let total = 0;

    state.transactions.forEach(tx => {
      if (tx.type !== 'expense') return;
      const d = (tx.date || '').slice(0, 10);
      if (!d || d < fromDate || d > toDate) return;

      const amt = parseFloat(tx.amount) || 0;
      total += amt;
      const cat = tx.category || 'other';
      const mem = tx.member || 'البيت';

      if (!catMap[cat]) catMap[cat] = { category: cat, total: 0, count: 0, members: {} };
      catMap[cat].total += amt;
      catMap[cat].count++;
      catMap[cat].members[mem] = (catMap[cat].members[mem] || 0) + amt;

      byMember[mem] = (byMember[mem] || 0) + amt;
      byDate[d] = (byDate[d] || 0) + amt;
    });

    const items = Object.values(catMap).sort((a, b) => b.total - a.total);
    return { items, total, byMember, byDate };
  }

  function buildEstimPeriodOptions(actPeriod) {
    const sel = document.getElementById('cmpEstimPeriod');
    if (!sel) return;

    let options = [];
    if (actPeriod === 'today' || actPeriod === 'yesterday') {
      options = [
        { val: actPeriod, label: (actPeriod === 'today' ? 'اليوم (متزامن مع الفعلية)' : 'أمس (متزامن مع الفعلية)') },
        { val: actPeriod === 'today' ? 'yesterday' : 'today', label: actPeriod === 'today' ? 'أمس' : 'اليوم' },
        { val: 'custom', label: 'منتقى بيوم محدد' }
      ];
    } else if (actPeriod === 'thisWeek' || actPeriod === 'lastWeek') {
      options = [
        { val: actPeriod, label: (actPeriod === 'thisWeek' ? 'الأسبوع الحالى (متزامن)' : 'الأسبوع السابق (متزامن)') },
        { val: actPeriod === 'thisWeek' ? 'lastWeek' : 'thisWeek', label: actPeriod === 'thisWeek' ? 'الأسبوع السابق' : 'الأسبوع الحالى' },
        { val: 'custom', label: 'منتقى بأسبوع' }
      ];
    } else if (actPeriod === 'thisMonth' || actPeriod === 'lastMonth') {
      options = [
        { val: actPeriod, label: (actPeriod === 'thisMonth' ? 'الشهر الحالى (متزامن)' : 'الشهر السابق (متزامن)') },
        { val: actPeriod === 'thisMonth' ? 'lastMonth' : 'thisMonth', label: actPeriod === 'thisMonth' ? 'الشهر السابق' : 'الشهر الحالى' },
        { val: 'custom', label: 'منتقى بشهر' }
      ];
    } else if (actPeriod === 'thisYear') {
      options = [
        { val: 'thisYear', label: 'السنة الحالية (متزامن)' },
        { val: 'lastYear', label: 'السنة السابقة' },
        { val: 'custom', label: 'منتقى بسنة' }
      ];
    } else {
      options = [
        { val: 'custom', label: 'منتقى التواريخ (مخصص)' }
      ];
    }

    sel.innerHTML = options.map(o => `<option value="${o.val}" ${o.val === _estimPeriod ? 'selected' : ''}>${o.label}</option>`).join('');
  }

  function onActualPeriodChange(val) {
    _actualPeriod = val;
    const customDiv = document.getElementById('cmpActualCustomRange');
    if (customDiv) customDiv.style.display = (val === 'custom') ? 'flex' : 'none';

    // Auto-sync estimated period
    _estimPeriod = val;
    buildEstimPeriodOptions(val);

    const estimCustomDiv = document.getElementById('cmpEstimCustomRange');
    if (estimCustomDiv) estimCustomDiv.style.display = (val === 'custom') ? 'flex' : 'none';

    render();
  }

  function onEstimPeriodChange(val) {
    _estimPeriod = val;
    const estimCustomDiv = document.getElementById('cmpEstimCustomRange');
    if (estimCustomDiv) estimCustomDiv.style.display = (val === 'custom') ? 'flex' : 'none';
    render();
  }

  function render() {
    const actInpFrom = document.getElementById('cmpActualFrom');
    const actInpTo = document.getElementById('cmpActualTo');
    const customActFrom = actInpFrom ? actInpFrom.value : null;
    const customActTo = actInpTo ? actInpTo.value : null;

    const actRange = periodToRange(_actualPeriod, customActFrom, customActTo);

    const estInpFrom = document.getElementById('cmpEstimFrom');
    const estInpTo = document.getElementById('cmpEstimTo');
    const customEstFrom = estInpFrom ? estInpFrom.value : null;
    const customEstTo = estInpTo ? estInpTo.value : null;

    const estRange = periodToRange(_estimPeriod, customEstFrom || actRange.from, customEstTo || actRange.to);

    const actData = getActualsForRange(actRange.from, actRange.to);
    const daysCount = dateDiffDays(estRange.from, estRange.to);
    const monthlyTotal = getActiveEstimBudgetTotal();
    const estimTotalScaled = Math.round((monthlyTotal / 30) * daysCount);

    const catEstimMap = getActivePlanCategoryEstimMap();

    // 1. Build Table Body
    const tbody = document.getElementById('cmpTableBody');
    const tfoot = document.getElementById('cmpTableFoot');

    // Merge categories from both actuals and plan items
    const allCatKeys = new Set(actData.items.map(it => it.category));
    Object.keys(catEstimMap).forEach(k => allCatKeys.add(k));

    const rowsData = [];
    allCatKeys.forEach(catKey => {
      const actItem = actData.items.find(i => i.category === catKey);
      const actualAmt = actItem ? actItem.total : 0;

      let estAmt = 0;
      if (catEstimMap[catKey]) {
        estAmt = Math.round((catEstimMap[catKey] / 30) * daysCount);
      } else {
        // distribute remaining
        const knownEstimSum = Object.values(catEstimMap).reduce((s, v) => s + v, 0);
        const remMonthly = Math.max(0, monthlyTotal - knownEstimSum);
        estAmt = Math.round((remMonthly / (allCatKeys.size || 1) / 30) * daysCount);
      }

      // Difference: Estimated - Actual (Positive = saving, Negative = overrun)
      const diff = estAmt - actualAmt;
      rowsData.push({
        catKey,
        actualAmt,
        estAmt,
        diff,
        count: actItem ? actItem.count : 0
      });
    });

    // Sort descending by actualAmt
    rowsData.sort((a, b) => b.actualAmt - a.actualAmt);

    const formatVal = (typeof formatMoneyVal === 'function') ? formatMoneyVal : (v) => (typeof formatMoney === 'function' ? formatMoney(v) : (v || 0).toLocaleString() + ' ج.م');

    if (tbody) {
      if (rowsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:16px;color:#94a3b8;">لا توجد مصروفات مسجلة لهذه الفترة</td></tr>`;
      } else {
        tbody.innerHTML = rowsData.map(r => {
          const catObj = (typeof getCategoryObj === 'function') ? getCategoryObj(r.catKey, 'expense') : { name: r.catKey, color: '#38bdf8', icon: 'fa-tag' };
          const isSave = r.diff >= 0;
          const diffSign = r.diff > 0 ? '+' : (r.diff < 0 ? '-' : '');
          const diffColor = isSave ? '#34d399' : '#f87171';
          const diffBg = isSave ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';

          // Percentage evaluated relative to estimated budget
          let pctStr = '';
          if (r.estAmt > 0) {
            const pctOfEst = Math.round((r.actualAmt / r.estAmt) * 100);
            if (isSave) {
              const savePct = Math.round((r.diff / r.estAmt) * 100);
              pctStr = `<div style="font-size:0.65rem;font-weight:800;color:#34d399;margin-top:2px;">وفر ${savePct}% (${pctOfEst}% مستهلك)</div>`;
            } else {
              const overPct = Math.round((Math.abs(r.diff) / r.estAmt) * 100);
              pctStr = `<div style="font-size:0.65rem;font-weight:800;color:#f87171;margin-top:2px;">تجاوز +${overPct}% (${pctOfEst}% من التقديري)</div>`;
            }
          } else {
            pctStr = r.actualAmt > 0 ? `<div style="font-size:0.64rem;color:#f87171;margin-top:2px;">بدون موازنة تقديرية</div>` : '';
          }

          return `
            <tr data-budget-category="${escapeHtml(r.catKey)}" style="border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: background 0.15s;"
                onclick="BudgetCompareEngine.drillDownToCategory('${r.catKey}')"
                title="اضغط لعرض كافة حركات ${catObj.name} المفلترة"
                onmouseover="this.style.background='rgba(56,189,248,0.08)'"
                onmouseout="this.style.background='transparent'">
              <td style="padding: 8px 10px; text-align: right; display: flex; align-items: center; gap: 7px;">
                <span style="display:inline-flex;width:24px;height:24px;border-radius:6px;background:${catObj.color || '#38bdf8'}26;color:${catObj.color || '#38bdf8'};align-items:center;justify-content:center;font-size:0.75rem;"><i class="fa-solid ${catObj.icon || 'fa-tag'}"></i></span>
                <div>
                  <div style="font-weight: 850; color: #f8fafc;">${catObj.name}</div>
                  ${r.count > 0 ? `<div style="font-size: 0.64rem; color: #94a3b8;">${r.count} حركة (اضغط للتفاصيل)</div>` : ''}
                </div>
              </td>
              <td style="padding: 8px 10px; text-align: center; font-weight: 900; color: #34d399; font-variant-numeric: tabular-nums; direction: ltr;">
                ${formatVal(r.actualAmt)}
              </td>
              <td style="padding: 8px 10px; text-align: center; font-weight: 900; color: #fbbf24; font-variant-numeric: tabular-nums; direction: ltr;">
                ${formatVal(r.estAmt)}
              </td>
              <td style="padding: 8px 10px; text-align: center;">
                <span style="display:inline-block;padding:3px 8px;border-radius:6px;font-size:0.78rem;font-weight:900;background:${diffBg};color:${diffColor};direction:ltr;font-variant-numeric: tabular-nums;">
                  ${diffSign}${formatVal(Math.abs(r.diff))}
                </span>
                ${pctStr}
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Foot (Totals)
    const totActual = actData.total;
    const totEstim = rowsData.reduce((s, r) => s + r.estAmt, 0) || estimTotalScaled;
    const totDiff = totEstim - totActual;
    const totIsSave = totDiff >= 0;

    if (tfoot) {
      tfoot.innerHTML = `
        <tr style="background: rgba(15,23,42,0.95); border-top: 2px solid rgba(56,189,248,0.3); font-weight: 950;">
          <td style="padding: 10px; text-align: right; color: #f8fafc;">الإجمالي الكلي</td>
          <td style="padding: 10px; text-align: center; color: #34d399; font-size: 0.86rem; font-variant-numeric: tabular-nums; direction: ltr;">${formatVal(totActual)}</td>
          <td style="padding: 10px; text-align: center; color: #fbbf24; font-size: 0.86rem; font-variant-numeric: tabular-nums; direction: ltr;">${formatVal(totEstim)}</td>
          <td style="padding: 10px; text-align: center; direction: ltr;">
            <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-weight: 950; font-size: 0.80rem; background: ${totIsSave ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${totIsSave ? '#34d399' : '#f87171'};">
              ${totDiff > 0 ? '+' : (totDiff < 0 ? '-' : '')}${formatVal(Math.abs(totDiff))}
            </span>
          </td>
        </tr>
      `;
    }

    // Update 3 KPI Cards
    const kpiAct = document.getElementById('cmpKpiTotalActual');
    const kpiEst = document.getElementById('cmpKpiTotalEstim');
    const kpiDiff = document.getElementById('cmpKpiTotalDiff');

    if (kpiAct) kpiAct.textContent = formatVal(totActual);
    if (kpiEst) kpiEst.textContent = formatVal(totEstim);
    if (kpiDiff) {
      kpiDiff.textContent = `${totDiff > 0 ? '+' : (totDiff < 0 ? '-' : '')}${formatVal(Math.abs(totDiff))}`;
      kpiDiff.style.color = totIsSave ? '#34d399' : '#f87171';
      const label = document.getElementById('cmpKpiDiffLabel');
      if (label) label.textContent = totIsSave ? 'وفر كلي في الموازنة 🎉' : 'عجز / تجاوز كلي ⚠️';
    }

    // Update Executive Analytics Cockpit
    const burnPctEl = document.getElementById('cmpBurnRatePct');
    const burnBarEl = document.getElementById('cmpBurnRateBar');
    const burnDescEl = document.getElementById('cmpBurnRateDesc');
    if (burnPctEl && burnBarEl) {
      const burnPct = totEstim > 0 ? Math.round((totActual / totEstim) * 100) : (totActual > 0 ? 100 : 0);
      burnPctEl.textContent = `${burnPct}%`;
      burnBarEl.style.width = `${Math.min(100, burnPct)}%`;
      if (burnPct > 100) {
        burnBarEl.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        burnPctEl.style.color = '#f87171';
        if (burnDescEl) burnDescEl.textContent = 'تجاوز السقف التقديري للموازنة!';
      } else if (burnPct >= 80) {
        burnBarEl.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        burnPctEl.style.color = '#fbbf24';
        if (burnDescEl) burnDescEl.textContent = 'اقتراب من سقف الموازنة المحددة';
      } else {
        burnBarEl.style.background = 'linear-gradient(90deg, #10b981, #0ea5e9)';
        burnPctEl.style.color = '#34d399';
        if (burnDescEl) burnDescEl.textContent = 'إنفاق صحي ضمن الحدود التقديرية';
      }
    }

    // Top Overrun and Top Saved categories
    const overruns = rowsData.filter(r => r.diff < 0).sort((a, b) => a.diff - b.diff); // most negative first
    const savings = rowsData.filter(r => r.diff > 0).sort((a, b) => b.diff - a.diff); // most positive first

    const topOverCatEl = document.getElementById('cmpTopOverrunCat');
    const topOverValEl = document.getElementById('cmpTopOverrunVal');
    if (topOverCatEl && topOverValEl) {
      if (overruns.length > 0) {
        const topO = overruns[0];
        const catObj = (typeof getCategoryObj === 'function') ? getCategoryObj(topO.catKey, 'expense') : { name: topO.catKey };
        topOverCatEl.textContent = catObj.name;
        topOverValEl.textContent = `-${formatVal(Math.abs(topO.diff))}`;
      } else {
        topOverCatEl.textContent = 'لا يوجد تجاوز 🌟';
        topOverValEl.textContent = '0.00 ج.م';
      }
    }

    const topSaveCatEl = document.getElementById('cmpTopSavedCat');
    const topSaveValEl = document.getElementById('cmpTopSavedVal');
    if (topSaveCatEl && topSaveValEl) {
      if (savings.length > 0) {
        const topS = savings[0];
        const catObj = (typeof getCategoryObj === 'function') ? getCategoryObj(topS.catKey, 'expense') : { name: topS.catKey };
        topSaveCatEl.textContent = catObj.name;
        topSaveValEl.textContent = `+${formatVal(topS.diff)}`;
      } else {
        topSaveCatEl.textContent = 'لا يوجد وفر حالياً';
        topSaveValEl.textContent = '0.00 ج.م';
      }
    }

    // Daily safe spending allowance
    const dailyAllowValEl = document.getElementById('cmpDailyAllowanceVal');
    const dailyAllowDaysEl = document.getElementById('cmpDailyAllowanceDays');
    if (dailyAllowValEl && dailyAllowDaysEl) {
      const now = new Date();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const remainingDays = Math.max(1, lastDayOfMonth - now.getDate() + 1);
      const remainingBudget = Math.max(0, totDiff);
      const dailySafe = Math.round(remainingBudget / remainingDays);
      dailyAllowValEl.textContent = formatVal(dailySafe);
      dailyAllowDaysEl.textContent = `متاح لـ ${remainingDays} يوم متبقية`;
    }


    // Extra verified actuals vs plan insights.
    renderExtraComparisonMetrics(rowsData, actRange, totEstim, totActual);
    // Render 3 Charts
    renderCharts(rowsData, actData, totEstim, actRange.from, actRange.to);
  }


  function renderExtraComparisonMetrics(rowsData, range, budgetAmount, actual) {
    const table = document.getElementById('cmpTableBody')?.closest('table');
    if (!table) return;
    let slot = document.getElementById('cmpExtraInsightGrid');
    if (!slot) {
      slot = document.createElement('div');
      slot.id = 'cmpExtraInsightGrid';
      table.parentElement.insertAdjacentElement('afterend',slot);
    }
    const transactions=(state.transactions||[]).filter(t=>t.type==='expense'&&
      String(t.date||'')>=range.from&&String(t.date||'')<=range.to);
    const daily=new Map();
    transactions.forEach(t=>daily.set(t.date,(daily.get(t.date)||0)+(Number(t.amount)||0)));
    const highest=[...daily.entries()].sort((a,b)=>b[1]-a[1])[0]||['',0];
    const avg=transactions.length?actual/transactions.length:0;
    const unplanned=rowsData.filter(x=>x.estAmt===0&&x.actualAmt>0);
    const top=rowsData.filter(x=>x.actualAmt>0).slice(0,3);
    const concentration=actual>0?top.reduce((sum,x)=>sum+x.actualAmt,0)/actual*100:0;
    const overCount=rowsData.filter(x=>x.actualAmt>x.estAmt).length;
    const covered=rowsData.filter(x=>x.estAmt>0).length;
    const fmt=n=>Number(n||0).toLocaleString('ar-EG',{maximumFractionDigits:0});
    const card=(name,value,hint,scope='actual',attrs='')=>
      '<button type="button" class="monthly-insight-card" data-budget-drill-scope="'+scope+'" '+attrs+
      '><small>'+name+'</small><strong>'+value+'</strong><span>'+hint+' · اضغط للتفاصيل</span></button>';
    slot.innerHTML='<div class="monthly-insights"><h3>مؤشرات إضافية للمقارنة</h3>'+
      '<p>تحليلات العمليات الفعلية المسجلة خلال '+escapeHtml(range.from)+' إلى '+escapeHtml(range.to)+'.</p>'+
      '<div class="monthly-insight-grid">'+
      card('عدد العمليات',fmt(transactions.length),'مصروفات الفترة المختارة')+
      card('متوسط العملية',fmt(avg),'متوسط قيمة المصروف المسجل')+
      card('أيام الإنفاق الفعلي',fmt(daily.size),'عدد الأيام ذات المصروف')+
      card('أعلى يوم إنفاق',fmt(highest[1]),escapeHtml(highest[0]),'highest-day','data-budget-date="'+escapeHtml(highest[0])+'"')+
      card('حصة أكبر 3 فئات',concentration.toFixed(1)+'%','تركز الإنفاق الفعلي')+
      card('الفئات المتجاوزة',fmt(overCount),'الأعلى من المقدر')+
      card('فئات دون موازنة',fmt(unplanned.length),'مصروفات دون تقدير معتمد')+
      card('الفئات ذات المخصص',fmt(covered),'المغطاة بموازنة تقديرية')+
      card('نسبة استخدام التقديري',budgetAmount>0?(actual/budgetAmount*100).toFixed(1)+'%':'—','الفعلي ÷ المقدر')+
      '</div></div>';
  }

  function renderCharts(rowsData, actData, totEstim, fromDate, toDate) {
    if (typeof Chart === 'undefined') return;

    // 1. Doughnut Chart (Distribution of actuals by category)
    const ctxDough = document.getElementById('cmpChartDoughnut');
    if (ctxDough) {
      if (_chartDough) { _chartDough.destroy(); _chartDough = null; }

      const filteredRows = rowsData.filter(r => r.actualAmt > 0);
      const labels = filteredRows.map(r => {
        const obj = (typeof getCategoryObj === 'function') ? getCategoryObj(r.catKey, 'expense') : { name: r.catKey };
        return obj.name;
      });
      const data = filteredRows.map(r => r.actualAmt);
      const colors = filteredRows.map(r => {
        const obj = (typeof getCategoryObj === 'function') ? getCategoryObj(r.catKey, 'expense') : { color: '#38bdf8' };
        return obj.color || '#38bdf8';
      });

      _chartDough = new Chart(ctxDough, {
        type: 'doughnut',
        data: {
          labels: labels.length ? labels : ['لا توجد بيانات'],
          datasets: [{
            data: data.length ? data : [1],
            backgroundColor: colors.length ? colors : ['rgba(255,255,255,0.1)'],
            borderWidth: 1.5,
            borderColor: '#0f172a'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { family: 'inherit', size: 11 } } }
          }
        }
      });
    }

    // 2. Horizontal Bar Chart (By Person / Member)
    const ctxBar = document.getElementById('cmpChartBar');
    if (ctxBar) {
      if (_chartBar) { _chartBar.destroy(); _chartBar = null; }

      const membersList = (typeof state !== 'undefined' && Array.isArray(state.members)) ? state.members.map(m => m.name || m) : Object.keys(actData.byMember);
      const memberNames = Array.from(new Set([...membersList, ...Object.keys(actData.byMember)]));
      const memberValues = memberNames.map(m => actData.byMember[m] || 0);

      _chartBar = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: memberNames,
          datasets: [{
            label: 'المصروف الفعلي',
            data: memberValues,
            backgroundColor: 'rgba(56, 189, 248, 0.75)',
            borderColor: '#38bdf8',
            borderWidth: 1.2,
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
            y: { ticks: { color: '#f8fafc', font: { weight: 'bold' } }, grid: { display: false } }
          }
        }
      });
    }

    // 3. Line Chart (Cumulative Daily Actual vs Cumulative Daily Budget)
    const ctxLine = document.getElementById('cmpChartLine');
    if (ctxLine) {
      if (_chartLine) { _chartLine.destroy(); _chartLine = null; }

      const start = new Date(fromDate);
      const end = new Date(toDate);
      const dayList = [];
      const cur = new Date(start);
      while (cur <= end) {
        dayList.push(formatDateStr(cur));
        cur.setDate(cur.getDate() + 1);
      }

      let cumAct = 0;
      const actPoints = [];
      const estimPoints = [];
      const dailyBudgetCap = (dayList.length > 0) ? (totEstim / dayList.length) : 0;
      let cumEst = 0;

      dayList.forEach(d => {
        cumAct += (actData.byDate[d] || 0);
        cumEst += dailyBudgetCap;
        actPoints.push(cumAct);
        estimPoints.push(Math.round(cumEst));
      });

      _chartLine = new Chart(ctxLine, {
        type: 'line',
        data: {
          labels: dayList.map(d => d.slice(5)), // MM-DD
          datasets: [
            {
              label: 'الفعلي التراكمي',
              data: actPoints,
              borderColor: '#f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              fill: true,
              tension: 0.25,
              borderWidth: 2.2,
              pointRadius: 2.5
            },
            {
              label: 'سقف التقديري التراكمي',
              data: estimPoints,
              borderColor: '#fbbf24',
              borderDash: [5, 5],
              fill: false,
              tension: 0,
              borderWidth: 2,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: '#cbd5e1', font: { size: 11 } } }
          },
          scales: {
            x: { ticks: { color: '#94a3b8', maxTicksLimit: 12 }, grid: { color: 'rgba(255,255,255,0.06)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      });
    }
  }

  function drillDownToCategory(catKey) {
    if (typeof switchAppPage === 'function') {
      switchAppPage('operations');
      setTimeout(() => {
        const catFilter = document.getElementById('filterCategory') || document.getElementById('txCategoryFilter');
        if (catFilter) {
          catFilter.value = catKey;
          catFilter.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (typeof renderTransactionsTable === 'function') renderTransactionsTable();
        if (typeof showToast === 'function') {
          const catObj = (typeof getCategoryObj === 'function') ? getCategoryObj(catKey, 'expense') : { name: catKey };
          showToast(`تمت فلترة الحركات على بند: ${catObj.name}`);
        }
      }, 100);
    }
  }

  return {
    render,
    onActualPeriodChange,
    onEstimPeriodChange,
    buildEstimPeriodOptions,
    getNavigationRange: () => periodToRange(_actualPeriod, document.getElementById('cmpActualFrom')?.value, document.getElementById('cmpActualTo')?.value),
    drillDownToCategory
  };
})();
window.BudgetCompareEngine = BudgetCompareEngine;


// =============================================================================
// BudgetArchiveEngine (v5.3.77 Prior Months Actuals & Estimations Archive)
// =============================================================================

const BudgetArchiveEngine = (() => {
  let _view = 'actual'; // 'actual' | 'estimations'
  let _expandedMonths = new Set();
  let _expandedPlans = new Set();

  function pad(n) { return String(n).padStart(2, '0'); }

  function switchView(v) {
    _view = v;
    const btnAct = document.getElementById('btnArchiveSubActual');
    const btnEst = document.getElementById('btnArchiveSubEstim');

    if (btnAct && btnEst) {
      if (v === 'actual') {
        btnAct.style.background = 'linear-gradient(135deg, #0ea5e9, #2563eb)';
        btnAct.style.color = '#fff';
        btnAct.style.boxShadow = '0 2px 8px rgba(14, 165, 233, 0.4)';
        btnEst.style.background = 'transparent';
        btnEst.style.color = '#94a3b8';
        btnEst.style.boxShadow = 'none';
      } else {
        btnEst.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)';
        btnEst.style.color = '#fff';
        btnEst.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.4)';
        btnAct.style.background = 'transparent';
        btnAct.style.color = '#94a3b8';
        btnAct.style.boxShadow = 'none';
      }
    }
    render();
  }

  function toggleMonthExpand(monthKey) {
    if (_expandedMonths.has(monthKey)) _expandedMonths.delete(monthKey);
    else _expandedMonths.add(monthKey);
    renderActualArchive();
  }
  window.toggleMonthArchiveExpand = toggleMonthExpand;

  function togglePlanExpand(planId) {
    if (_expandedPlans.has(planId)) _expandedPlans.delete(planId);
    else _expandedPlans.add(planId);
    renderEstimArchive();
  }
  window.togglePlanArchiveExpand = togglePlanExpand;

  function editMonthNote(monthKey) {
    const existing = localStorage.getItem(`budget_month_note_${monthKey}`) || '';
    const note = prompt(`ملاحظات أرشيف شهر ${monthKey}:`, existing);
    if (note !== null) {
      localStorage.setItem(`budget_month_note_${monthKey}`, note.trim());
      if (typeof showToast === 'function') showToast(`تم حفظ ملاحظات شهر ${monthKey} بنجاح ✓`);
      renderActualArchive();
    }
  }
  window.editMonthArchiveNote = editMonthNote;

  function getMonthNameArabic(ymStr) {
    const [y, m] = ymStr.split('-').map(Number);
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return `${monthsAr[m - 1] || ymStr} ${y}`;
  }

  function renderActualArchive() {
    const container = document.getElementById('archiveContentArea');
    if (!container) return;

    const now = new Date();
    const curMonthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    // Group transactions by month
    const monthMap = {};
    (state.transactions || []).forEach(tx => {
      if (tx.type !== 'expense') return;
      const d = tx.date || '';
      const mKey = d.slice(0, 7);
      if (!mKey || mKey >= curMonthKey) return; // Exclude current month and future

      const amt = parseFloat(tx.amount) || 0;
      const cat = tx.category || 'other';
      const mem = tx.member || 'البيت';

      if (!monthMap[mKey]) {
        monthMap[mKey] = {
          monthKey: mKey,
          total: 0,
          count: 0,
          categories: {},
          members: {}
        };
      }
      monthMap[mKey].total += amt;
      monthMap[mKey].count++;
      monthMap[mKey].categories[cat] = (monthMap[mKey].categories[cat] || 0) + amt;
      monthMap[mKey].members[mem] = (monthMap[mKey].members[mem] || 0) + amt;
    });

    const sortedMonths = Object.keys(monthMap).sort((a, b) => b.localeCompare(a));
    const formatVal = (typeof formatMoneyVal === 'function') ? formatMoneyVal : (v) => (typeof formatMoney === 'function' ? formatMoney(v) : (v || 0).toLocaleString() + ' ج.م');

    if (sortedMonths.length === 0) {
      container.innerHTML = `
        <div style="background: rgba(15,23,42,0.65); border: 1.2px dashed rgba(56,189,248,0.3); border-radius: 12px; padding: 20px; text-align: center; color: #94a3b8;">
          <i class="fa-solid fa-calendar-xmark" style="font-size: 1.8rem; color: #38bdf8; margin-bottom: 6px; display: block;"></i>
          لا توجد ميزانيات فعلية مسجلة لشهور سابقة حتى الآن.
        </div>
      `;
      return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 10px;">`;
    sortedMonths.forEach(mKey => {
      const item = monthMap[mKey];
      const isExpanded = _expandedMonths.has(mKey);
      const monthLabel = getMonthNameArabic(mKey);
      const note = localStorage.getItem(`budget_month_note_${mKey}`) || '';

      // Find top category
      const topCatEntry = Object.entries(item.categories).sort((a, b) => b[1] - a[1])[0];
      const topCatObj = topCatEntry ? ((typeof getCategoryObj === 'function') ? getCategoryObj(topCatEntry[0], 'expense') : { name: topCatEntry[0] }) : null;

      html += `
        <div class="budget-lux-card" style="background: ${document.body.classList.contains('light-theme') ? '#ffffff' : 'rgba(30, 41, 59, 0.75)'} !important; border: 1.2px solid ${isExpanded ? (document.body.classList.contains('light-theme') ? '#0284c7' : '#38bdf8') : (document.body.classList.contains('light-theme') ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)')} !important; box-shadow: ${document.body.classList.contains('light-theme') ? '0 3px 12px rgba(0,0,0,0.06)' : 'none'}; color: ${document.body.classList.contains('light-theme') ? '#0f172a' : '#f8fafc'}; border-radius: 14px; padding: 12px 14px; transition: all 0.2s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 32px; height: 32px; border-radius: 8px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 0.95rem;"><i class="fa-solid fa-calendar-days"></i></span>
              <div>
                <div style="font-size: 0.90rem; font-weight: 900; color: ${document.body.classList.contains('light-theme') ? '#0f172a' : '#f8fafc'};">🗓️ ${monthLabel}</div>
                <div style="font-size: 0.68rem; color: ${document.body.classList.contains('light-theme') ? '#475569' : '#94a3b8'}; display: flex; gap: 8px; margin-top: 1px;">
                  <span>إجمالي المصروف: <strong style="color: #f87171; font-family: var(--font-numbers); direction: ltr;">- ${formatVal(item.total)}</strong></span>
                  ${topCatObj ? `<span>• أعلى فئة: <strong style="color: #0284c7;">${topCatObj.name}</strong> (${formatVal(topCatEntry[1])})</span>` : ''}
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" onclick="editMonthArchiveNote('${mKey}')" title="تعديل ملاحظة الشهر" style="height: 28px; padding: 0 8px; border-radius: 6px; background: ${document.body.classList.contains('light-theme') ? '#f1f5f9' : 'rgba(255,255,255,0.08)'}; border: 1px solid ${document.body.classList.contains('light-theme') ? '#cbd5e1' : 'rgba(255,255,255,0.15)'}; color: ${document.body.classList.contains('light-theme') ? '#334155' : '#cbd5e1'}; font-size: 0.70rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-pencil"></i> ${note ? 'تعديل' : 'ملاحظة'}
              </button>
              <button type="button" onclick="toggleMonthArchiveExpand('${mKey}')" title="${isExpanded ? 'طي' : 'توسيع'}" style="width: 28px; height: 28px; border-radius: 6px; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.4); color: #0284c7; font-size: 0.78rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid ${isExpanded ? 'fa-minus' : 'fa-plus'}"></i>
              </button>
            </div>
          </div>

          ${note ? `<div style="margin-top: 6px; font-size: 0.70rem; color: ${document.body.classList.contains('light-theme') ? '#334155' : '#cbd5e1'}; background: ${document.body.classList.contains('light-theme') ? '#f8fafc' : 'rgba(15,23,42,0.6)'}; padding: 4px 8px; border-radius: 6px; border-right: 2px solid #0284c7;">📝 ${escapeHtml(note)}</div>` : ''}

          ${isExpanded ? `
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed ${document.body.classList.contains('light-theme') ? '#cbd5e1' : 'rgba(255,255,255,0.1)'};">
              <div style="font-size: 0.72rem; font-weight: 850; color: #0284c7; margin-bottom: 6px;"><i class="fa-solid fa-table-list"></i> تفاصيل بنود مصروفات ${monthLabel}:</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; direction: rtl;">
                <thead>
                  <tr style="background: ${document.body.classList.contains('light-theme') ? '#f1f5f9' : 'rgba(15,23,42,0.85)'}; color: ${document.body.classList.contains('light-theme') ? '#475569' : '#94a3b8'};">
                    <th style="padding: 6px; text-align: right;">فئة المصروف</th>
                    <th style="padding: 6px; text-align: center;">إجمالي</th>
                    <th style="padding: 6px; text-align: center;">العمليات</th>
                    <th style="padding: 6px; text-align: left;">الشخص المسؤول</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(item.categories).sort((a,b) => b[1] - a[1]).map(([cKey, cAmt]) => {
                    const cObj = (typeof getCategoryObj === 'function') ? getCategoryObj(cKey, 'expense') : { name: cKey };
                    const mems = Object.keys(item.members).join(', ');
                    return `
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 6px; font-weight: 800; color: ${document.body.classList.contains('light-theme') ? '#0f172a' : '#f8fafc'}; text-align: right;">${cObj.name}</td>
                        <td style="padding: 6px; text-align: center; color: #f87171; font-weight: 900; font-variant-numeric: tabular-nums; direction: ltr;">- ${formatVal(cAmt)}</td>
                        <td style="padding: 6px; text-align: center; color: #94a3b8;">-</td>
                        <td style="padding: 6px; text-align: left; color: #cbd5e1;">${mems || 'الجميع'}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  }

  function renderEstimArchive() {
    const container = document.getElementById('archiveContentArea');
    if (!container) return;

    const now = new Date();
    const curMonthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    const plans = (state.monthlyBudgets || []).filter(p => p.month && p.month < curMonthKey).sort((a, b) => b.month.localeCompare(a.month));
    const formatVal = (typeof formatMoneyVal === 'function') ? formatMoneyVal : (v) => (typeof formatMoney === 'function' ? formatMoney(v) : (v || 0).toLocaleString() + ' ج.م');

    let html = `
      <div style="margin-bottom: 10px; display: flex; justify-content: flex-end;">
        <button type="button" onclick="openNewBudgetPlanModal()" style="height: 32px; padding: 0 12px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.74rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);">
          <i class="fa-solid fa-plus"></i> إضافة خطة تقديرية لشهر سابق
        </button>
      </div>
    `;

    if (plans.length === 0) {
      html += `
        <div style="background: rgba(15,23,42,0.65); border: 1.2px dashed rgba(168,85,247,0.3); border-radius: 12px; padding: 20px; text-align: center; color: #94a3b8;">
          <i class="fa-solid fa-clipboard-list" style="font-size: 1.8rem; color: #c084fc; margin-bottom: 6px; display: block;"></i>
          لا توجد موازنات تقديرية سابقة محفوظة للأشهر الماضية.
        </div>
      `;
      container.innerHTML = html;
      return;
    }

    html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;
    plans.forEach(plan => {
      const planId = plan.id || plan.month;
      const isExpanded = _expandedPlans.has(planId);
      const items = Array.isArray(plan.items) ? plan.items : [];
      const totalAmount = items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
      const monthLabel = getMonthNameArabic(plan.month);

      html += `
        <div class="budget-lux-card" style="background: ${document.body.classList.contains('light-theme') ? '#ffffff' : 'rgba(30, 41, 59, 0.75)'} !important; border: 1.2px solid ${isExpanded ? (document.body.classList.contains('light-theme') ? '#7c3aed' : '#c084fc') : (document.body.classList.contains('light-theme') ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)')} !important; box-shadow: ${document.body.classList.contains('light-theme') ? '0 3px 12px rgba(0,0,0,0.06)' : 'none'}; color: ${document.body.classList.contains('light-theme') ? '#0f172a' : '#f8fafc'}; border-radius: 14px; padding: 12px 14px; transition: all 0.2s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 32px; height: 32px; border-radius: 8px; background: rgba(168, 85, 247, 0.2); color: #c084fc; display: flex; align-items: center; justify-content: center; font-size: 0.95rem;"><i class="fa-solid fa-clipboard-check"></i></span>
              <div>
                <div style="font-size: 0.90rem; font-weight: 900; color: ${document.body.classList.contains('light-theme') ? '#0f172a' : '#f8fafc'};">📋 ميزانية ${monthLabel} التقديرية</div>
                <div style="font-size: 0.68rem; color: ${document.body.classList.contains('light-theme') ? '#475569' : '#94a3b8'}; display: flex; gap: 8px; margin-top: 1px;">
                  <span>السقف التقديري: <strong style="color: #d97706; font-family: var(--font-numbers); direction: ltr;">${formatVal(totalAmount)}</strong></span>
                  <span>• عدد البنود: <strong style="color: #7c3aed;">${items.length} بند</strong></span>
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" onclick="if(typeof openBudgetItemModal==='function') openBudgetItemModal('${planId}'); else openNewBudgetPlanModal();" title="تعديل الخطة التقديرية" style="height: 28px; padding: 0 8px; border-radius: 6px; background: ${document.body.classList.contains('light-theme') ? '#f1f5f9' : 'rgba(255,255,255,0.08)'}; border: 1px solid ${document.body.classList.contains('light-theme') ? '#cbd5e1' : 'rgba(255,255,255,0.15)'}; color: ${document.body.classList.contains('light-theme') ? '#334155' : '#cbd5e1'}; font-size: 0.70rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-pencil"></i> تعديل
              </button>
              <button type="button" onclick="togglePlanArchiveExpand('${planId}')" title="${isExpanded ? 'طي' : 'توسيع'}" style="width: 28px; height: 28px; border-radius: 6px; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.4); color: #7c3aed; font-size: 0.78rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid ${isExpanded ? 'fa-minus' : 'fa-plus'}"></i>
              </button>
            </div>
          </div>

          ${isExpanded ? `
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed ${document.body.classList.contains('light-theme') ? '#cbd5e1' : 'rgba(255,255,255,0.1)'};">
              <div style="font-size: 0.72rem; font-weight: 850; color: #7c3aed; margin-bottom: 6px;"><i class="fa-solid fa-list-check"></i> بنود الخطة التقديرية:</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; direction: rtl;">
                <thead>
                  <tr style="background: ${document.body.classList.contains('light-theme') ? '#f1f5f9' : 'rgba(15,23,42,0.85)'}; color: ${document.body.classList.contains('light-theme') ? '#475569' : '#94a3b8'};">
                    <th style="padding: 6px; text-align: right;">الفئة</th>
                    <th style="padding: 6px; text-align: center;">المبلغ التقديري</th>
                    <th style="padding: 6px; text-align: right;">الملاحظة</th>
                    <th style="padding: 6px; text-align: left;">الشخص المسؤول</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(it => {
                    const cObj = (typeof getCategoryObj === 'function') ? getCategoryObj(it.category, 'expense') : { name: it.category || 'عام' };
                    return `
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 6px; font-weight: 800; color: ${document.body.classList.contains('light-theme') ? '#0f172a' : '#f8fafc'}; text-align: right;">${cObj.name}</td>
                        <td style="padding: 6px; text-align: center; color: #fbbf24; font-weight: 900; font-variant-numeric: tabular-nums; direction: ltr;">${formatVal(it.amount)}</td>
                        <td style="padding: 6px; text-align: right; color: #cbd5e1;">${escapeHtml(it.note || '-')}</td>
                        <td style="padding: 6px; text-align: left; color: #cbd5e1;">${escapeHtml(it.member || 'الجميع')}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  }

  function render() {
    const planMgmt = document.getElementById('budgetPlanManagementContainer');
    if (_view === 'actual') {
      if (planMgmt) planMgmt.style.display = 'none';
      renderActualArchive();
    } else {
      if (planMgmt) planMgmt.style.display = 'block';
      renderEstimArchive();
      try {
        if (typeof refreshBudgetPlanUI === 'function') refreshBudgetPlanUI();
        else if (typeof renderBudgetPlanSelector === 'function') renderBudgetPlanSelector();
      } catch(e) {}
    }
  }

  return {
    render,
    switchView
  };
})();
window.BudgetArchiveEngine = BudgetArchiveEngine;



// =============================================================================
// ProjectCompareEngine & ProjectArchiveEngine (v5.3.78 Project WBS Suite)
// =============================================================================

const ProjectCompareEngine = (() => {
  let _activeProject = '';
  let _actualPeriod = 'all'; // Default: total project lifetime
  let _estimPeriod = 'all';
  let _actualFrom = null, _actualTo = null;
  let _chartDough = null, _chartGrouped = null, _chartMembers = null, _chartSCurve = null;

  function pad(n) { return String(n).padStart(2, '0'); }
  function formatDateStr(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

  function getActiveProjects() {
    if (typeof state === 'undefined') return [];
    const closed = new Set(state.closedProjects || []);
    const known = (typeof getKnownProjects === 'function') ? getKnownProjects() : [];
    return known.filter(p => !closed.has(p));
  }

  function getProjectPlan(projectName) {
    if (typeof state === 'undefined' || !Array.isArray(state.monthlyBudgets)) return null;
    return state.monthlyBudgets.find(b => (b.project === projectName || b.title === projectName || b.name === projectName));
  }

  function onProjectChange(projectName) {
    _activeProject = projectName;
    render();
  }

  function onActualPeriodChange(val) {
    _actualPeriod = val;
    _estimPeriod = val;
    const customDiv = document.getElementById('cmpProjActualCustomRange');
    if (customDiv) customDiv.style.display = (val === 'custom') ? 'flex' : 'none';
    render();
  }

  function getProjectDateRange(period, customFrom, customTo) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const day = now.getDate();

    if (period === 'all') return { from: '2020-01-01', to: '2099-12-31', label: 'إجمالي عمر المشروع' };
    if (period === 'today') {
      const s = formatDateStr(now);
      return { from: s, to: s, label: 'اليوم' };
    }
    if (period === 'thisWeek') {
      const dayOfWeek = now.getDay();
      const diffToSat = (dayOfWeek + 1) % 7;
      const start = new Date(y, m, day - diffToSat);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'هذا الأسبوع' };
    }
    if (period === 'thisMonth') {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'هذا الشهر' };
    }
    if (period === 'lastMonth') {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'الشهر السابق' };
    }
    if (period === 'thisYear') {
      const start = new Date(y, 0, 1);
      const end = new Date(y, 11, 31);
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'السنة الحالية' };
    }
    if (period === 'custom') {
      const f = customFrom || formatDateStr(new Date(y, m, 1));
      const t = customTo || formatDateStr(now);
      return { from: f, to: t, label: 'فترة مخصصة' };
    }
    return { from: '2020-01-01', to: '2099-12-31', label: 'إجمالي عمر المشروع' };
  }

  function getProjectTransactions(projectName, fromDate, toDate) {
    if (typeof state === 'undefined' || !Array.isArray(state.transactions)) return [];
    return state.transactions.filter(tx => {
      if (tx.type !== 'expense') return false;
      const p = tx.project || tx.projectId || '';
      if (p !== projectName) return false;
      const d = (tx.date || '').slice(0, 10);
      if (fromDate && toDate && (d < fromDate || d > toDate)) return false;
      return true;
    });
  }

  function closeAndArchiveProject(projectName) {
    if (!projectName) projectName = _activeProject;
    if (!projectName) return;
    if (!confirm(`هل أنت متأكد من رغبتك في إغلاق مشروع "${projectName}" ونقله للأرشيف؟`)) return;

    state.closedProjects = state.closedProjects || [];
    if (!state.closedProjects.includes(projectName)) {
      state.closedProjects.push(projectName);
    }
    localStorage.setItem('family_closed_projects', JSON.stringify(state.closedProjects));
    if (typeof showToast === 'function') showToast(`تم نقل مشروع "${projectName}" إلى الأرشيف بنجاح ✓`);

    refreshProjectSelectors();
    _activeProject = getActiveProjects()[0] || '';
    render();
  }
  window.closeAndArchiveCurrentProject = closeAndArchiveProject;

  function render() {
    const activeProjects = getActiveProjects();
    const projSelect = document.getElementById('cmpProjSelect');

    if (projSelect) {
      if (!_activeProject || !activeProjects.includes(_activeProject)) {
        _activeProject = activeProjects[0] || '';
      }
      projSelect.innerHTML = activeProjects.map(p => `<option value="${p}" ${p === _activeProject ? 'selected' : ''}>📂 ${p}</option>`).join('');
      if (activeProjects.length === 0) {
        projSelect.innerHTML = `<option value="">-- لا توجد مشاريع نشطة --</option>`;
      }
    }

    const container = document.getElementById('projectCompareMainContent');
    if (!container) return;

    if (!_activeProject) {
      container.innerHTML = `
        <div style="background: rgba(15,23,42,0.65); border: 1.2px dashed rgba(56,189,248,0.3); border-radius: 14px; padding: 24px; text-align: center; color: #94a3b8;">
          <i class="fa-solid fa-folder-open" style="font-size: 2.2rem; color: #38bdf8; margin-bottom: 8px; display: block;"></i>
          <div style="font-size: 0.90rem; font-weight: 850; color: #f8fafc; margin-bottom: 6px;">لا يوجد مشروع نشط حالياً للمقارنة</div>
          <button type="button" onclick="openNewBudgetPlanModal()" style="height: 32px; padding: 0 14px; border-radius: 8px; background: linear-gradient(135deg, #0ea5e9, #2563eb); border: none; color: #fff; font-size: 0.76rem; font-weight: 900; cursor: pointer;">＋ إنشاء موازنة مشروع جديد</button>
        </div>
      `;
      return;
    }

    const actInpFrom = document.getElementById('cmpProjActualFrom');
    const actInpTo = document.getElementById('cmpProjActualTo');
    const customFrom = actInpFrom ? actInpFrom.value : null;
    const customTo = actInpTo ? actInpTo.value : null;

    const range = getProjectDateRange(_actualPeriod, customFrom, customTo);
    const txs = getProjectTransactions(_activeProject, range.from, range.to);
    const allProjTxs = getProjectTransactions(_activeProject, '2020-01-01', '2099-12-31');

    // Fetch Plan
    const plan = getProjectPlan(_activeProject);
    const planItems = (plan && Array.isArray(plan.items)) ? plan.items : [];
    const planApprovedBudget = planItems.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0) || (plan ? (parseFloat(plan.totalAmount) || 0) : 0);

    // Group transactions by projectItem
    const itemActuals = {};
    const memberActuals = {};
    const dateActuals = {};
    let totalActualInPeriod = 0;

    txs.forEach(t => {
      const itName = t.projectItem || 'مصروفات مشروع عامة';
      const amt = parseFloat(t.amount) || 0;
      const mem = t.member || 'البيت';
      const d = (t.date || '').slice(0, 10);

      itemActuals[itName] = (itemActuals[itName] || 0) + amt;
      memberActuals[mem] = (memberActuals[mem] || 0) + amt;
      if (d) dateActuals[d] = (dateActuals[d] || 0) + amt;
      totalActualInPeriod += amt;
    });

    const totalActualLifetime = allProjTxs.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);

    // 1. Combine WBS items from Plan and Transactions
    const allWbsNames = new Set(planItems.map(it => it.category || it.name || it.title));
    Object.keys(itemActuals).forEach(k => allWbsNames.add(k));

    const wbsRows = [];
    allWbsNames.forEach(name => {
      const planItem = planItems.find(it => (it.category === name || it.name === name || it.title === name));
      const estAmt = planItem ? (parseFloat(planItem.amount) || 0) : 0;
      const actAmt = itemActuals[name] || 0;
      const diff = estAmt - actAmt; // Positive = saving, Negative = overrun

      wbsRows.push({
        name,
        actAmt,
        estAmt,
        diff
      });
    });

    // Sort descending by actual expense
    wbsRows.sort((a, b) => b.actAmt - a.actAmt);

    const formatVal = (typeof formatMoneyVal === 'function') ? formatMoneyVal : (v) => (typeof formatMoney === 'function' ? formatMoney(v) : (v || 0).toLocaleString() + ' ج.م');

    // 2. Compute 6 KPIs
    const approvedBudget = planApprovedBudget || (wbsRows.reduce((s, r) => s + r.estAmt, 0)) || totalActualLifetime;
    const spentActual = totalActualLifetime;
    const remainingBalance = approvedBudget - spentActual;
    const consumptionPct = approvedBudget > 0 ? Math.round((spentActual / approvedBudget) * 100) : 0;

    // CPI = Budget of executed items ÷ Actual spent
    const executedBudgetSum = wbsRows.filter(r => r.actAmt > 0).reduce((s, r) => s + r.estAmt, 0);
    const cpi = spentActual > 0 ? (executedBudgetSum / spentActual) : 1.0;

    // Burn Rate (Weekly)
    const dates = allProjTxs.map(t => t.date).filter(Boolean).sort();
    let daysDiff = 1;
    if (dates.length > 1) {
      const t1 = new Date(dates[0]).getTime();
      const t2 = new Date(dates[dates.length - 1]).getTime();
      daysDiff = Math.max(1, Math.round((t2 - t1) / (1000 * 60 * 60 * 24)));
    }
    const weeklyBurnRate = (spentActual / daysDiff) * 7;

    // EAC = Approved Budget ÷ CPI
    const eac = (cpi > 0) ? (approvedBudget / cpi) : spentActual;

    // Build Insights Callout
    const topCostDrivers = wbsRows.slice(0, 3).filter(r => r.actAmt > 0);
    const overrunItems = wbsRows.filter(r => r.estAmt > 0 && r.diff < 0);
    const savingsItems = wbsRows.filter(r => r.estAmt > 0 && r.diff > 0);

    // Build HTML Output
    container.innerHTML = `
      <!-- 6 كروت المؤشرات التنفيذية والتحليلات الرقابية للمشروع -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px; margin-bottom: 12px;">
        <!-- كارت 1: الميزانية المعتمدة -->
        <div class="project-kpi-card" style="background: ${document.body.classList.contains('light-theme') ? '#ffffff' : 'rgba(30, 41, 59, 0.7)'} !important; border: 1.2px solid ${document.body.classList.contains('light-theme') ? '#e2e8f0' : 'rgba(56, 189, 248, 0.35)'} !important; box-shadow: ${document.body.classList.contains('light-theme') ? '0 3px 10px rgba(0,0,0,0.05)' : 'none'}; border-radius: 12px; padding: 10px; text-align: center;">
          <div style="font-size: 0.66rem; color: #94a3b8; font-weight: 800; margin-bottom: 2px;">الميزانية المعتمدة</div>
          <div style="font-size: 1.15rem; font-weight: 950; color: #38bdf8; font-family: var(--font-numbers); direction: ltr;">${formatVal(approvedBudget)}</div>
          <div style="font-size: 0.58rem; color: #7dd3fc;">سقف التكلفة المخطط</div>
        </div>

        <!-- كارت 2: المنصرف الفعلي الإجمالي -->
        <div class="project-kpi-card" style="background: ${document.body.classList.contains('light-theme') ? '#ffffff' : 'rgba(30, 41, 59, 0.7)'} !important; border: 1.2px solid ${document.body.classList.contains('light-theme') ? '#fecdd3' : 'rgba(239, 68, 68, 0.35)'} !important; box-shadow: ${document.body.classList.contains('light-theme') ? '0 3px 10px rgba(0,0,0,0.05)' : 'none'}; border-radius: 12px; padding: 10px; text-align: center;">
          <div style="font-size: 0.66rem; color: #fecdd3; font-weight: 800; margin-bottom: 2px;">المنصرف الفعلي الكلي</div>
          <div style="font-size: 1.15rem; font-weight: 950; color: #f87171; font-family: var(--font-numbers); direction: ltr;">- ${formatVal(spentActual)}</div>
          <div style="width: 100%; height: 5px; background: rgba(0,0,0,0.3); border-radius: 3px; overflow: hidden; margin-top: 4px;">
            <div style="width: ${Math.min(100, consumptionPct)}%; height: 100%; background: ${consumptionPct > 100 ? '#ef4444' : '#f59e0b'};"></div>
          </div>
          <div style="font-size: 0.58rem; color: #94a3b8; margin-top: 2px;">استهلاك ${consumptionPct}% من السقف</div>
        </div>

        <!-- كارت 3: الرصيد المتبقي لإتمام المشروع -->
        <div class="project-kpi-card" style="background: ${document.body.classList.contains('light-theme') ? '#ffffff' : 'rgba(30, 41, 59, 0.7)'} !important; border: 1.2px solid ${remainingBalance >= 0 ? (document.body.classList.contains('light-theme') ? '#a7f3d0' : 'rgba(16, 185, 129, 0.4)') : (document.body.classList.contains('light-theme') ? '#fecdd3' : 'rgba(239, 68, 68, 0.5)')} !important; box-shadow: ${document.body.classList.contains('light-theme') ? '0 3px 10px rgba(0,0,0,0.05)' : 'none'}; border-radius: 12px; padding: 10px; text-align: center;">
          <div style="font-size: 0.66rem; color: #cbd5e1; font-weight: 800; margin-bottom: 2px;">الرصيد المتبقي لإتمام المشروع</div>
          <div style="font-size: 1.15rem; font-weight: 950; color: ${remainingBalance >= 0 ? '#34d399' : '#f87171'}; font-family: var(--font-numbers); direction: ltr;">
            ${remainingBalance >= 0 ? '+' : ''}${formatVal(remainingBalance)}
          </div>
          <div style="font-size: 0.58rem; color: ${remainingBalance >= 0 ? '#6ee7b7' : '#fca5a5'};">
            ${remainingBalance >= 0 ? 'سيولة متاحة متبقية' : 'تجاوز عجز مالي ⚠️'}
          </div>
        </div>

        <!-- كارت 4: مؤشر كفاءة التكلفة CPI -->
        <div class="project-kpi-card" style="background: ${document.body.classList.contains('light-theme') ? '#ffffff' : 'rgba(30, 41, 59, 0.7)'} !important; border: 1.2px solid ${document.body.classList.contains('light-theme') ? '#e9d5ff' : 'rgba(168, 85, 247, 0.35)'} !important; box-shadow: ${document.body.classList.contains('light-theme') ? '0 3px 10px rgba(0,0,0,0.05)' : 'none'}; border-radius: 12px; padding: 10px; text-align: center;">
          <div style="font-size: 0.66rem; color: #e9d5ff; font-weight: 800; margin-bottom: 2px;">مؤشر كفاءة التكلفة (CPI)</div>
          <div style="font-size: 1.15rem; font-weight: 950; color: ${cpi >= 1.0 ? '#34d399' : '#fbbf24'}; font-family: var(--font-numbers); direction: ltr;">${cpi.toFixed(2)}</div>
          <div style="font-size: 0.58rem; color: ${cpi >= 1.0 ? '#34d399' : '#fbbf24'};">${cpi >= 1.0 ? 'كفاءة ممتازة (وفر)' : 'انحراف وتجاوز تكلفة'}</div>
        </div>

        <!-- كارت 5: معدل الحرق المالي Burn Rate -->
        <div class="project-kpi-card" style="background: ${document.body.classList.contains('light-theme') ? '#ffffff' : 'rgba(30, 41, 59, 0.7)'} !important; border: 1.2px solid ${document.body.classList.contains('light-theme') ? '#fde68a' : 'rgba(245, 158, 11, 0.35)'} !important; box-shadow: ${document.body.classList.contains('light-theme') ? '0 3px 10px rgba(0,0,0,0.05)' : 'none'}; border-radius: 12px; padding: 10px; text-align: center;">
          <div style="font-size: 0.66rem; color: #fde68a; font-weight: 800; margin-bottom: 2px;">معدل الصرف الأسبوعي</div>
          <div style="font-size: 1.15rem; font-weight: 950; color: #fbbf24; font-family: var(--font-numbers); direction: ltr;">${formatVal(weeklyBurnRate)}</div>
          <div style="font-size: 0.58rem; color: #94a3b8;">متوسط أسبوعي</div>
        </div>

        <!-- كارت 6: التكلفة المتوقعة عند الاكتمال EAC -->
        <div class="project-kpi-card" style="background: ${document.body.classList.contains('light-theme') ? '#ffffff' : 'rgba(30, 41, 59, 0.7)'} !important; border: 1.2px solid ${document.body.classList.contains('light-theme') ? '#e2e8f0' : 'rgba(56, 189, 248, 0.35)'} !important; box-shadow: ${document.body.classList.contains('light-theme') ? '0 3px 10px rgba(0,0,0,0.05)' : 'none'}; border-radius: 12px; padding: 10px; text-align: center;">
          <div style="font-size: 0.66rem; color: #bae6fd; font-weight: 800; margin-bottom: 2px;">المتوقع عند الاكتمال (EAC)</div>
          <div style="font-size: 1.15rem; font-weight: 950; color: #38bdf8; font-family: var(--font-numbers); direction: ltr;">${formatVal(eac)}</div>
          <div style="font-size: 0.58rem; color: #94a3b8;">تنبؤ بالوتيرة الحالية</div>
        </div>
      </div>

      <!-- صندوق الاستنتاجات والتحليلات التلقائية الذكية -->
      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 10px 14px; margin-bottom: 12px;">
        <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-wand-magic-sparkles"></i> <span>استنتاجات رقابية وتحليلات ذكية للمشروع:</span>
        </div>
        <div style="font-size: 0.72rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px; line-height: 1.5;">
          ${topCostDrivers.length > 0 ? `<div>📌 <strong>أعلى بنود تكلفة مستنزفة:</strong> ${topCostDrivers.map(d => `<span style="color:#f87171;">${d.name} (${formatVal(d.actAmt)})</span>`).join(' • ')}</div>` : ''}
          ${overrunItems.length > 0 ? `<div>⚠️ <strong>تنبيه تجاوز السقف:</strong> ${overrunItems.map(o => `<span style="color:#ef4444;">بند ${o.name} تجاوز المعتمد بفارق ${formatVal(Math.abs(o.diff))}</span>`).join(' • ')}</div>` : '<div>✅ <strong>انضباط الميزانية:</strong> لا توجد بنود تجاوزت السقف المعتمد حتى الآن.</div>'}
          ${savingsItems.length > 0 ? `<div>🎉 <strong>وفورات محققة:</strong> ${savingsItems.slice(0, 2).map(s => `<span style="color:#34d399;">بند ${s.name} حقق وفراً بقيمة ${formatVal(s.diff)}</span>`).join(' • ')}</div>` : ''}
        </div>
      </div>

      <!-- جدول مقارنة بنود المشروع الرباعي (4 أعمدة) -->
      <div style="overflow-x: auto; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.76rem; direction: rtl;">
          <thead>
            <tr style="background: rgba(15, 23, 42, 0.9);">
              <th style="padding: 10px; text-align: right; color: #94a3b8; font-weight: 850; border-bottom: 1px solid rgba(255,255,255,0.1);">بيان بند المشروع (WBS)</th>
              <th style="padding: 10px; text-align: center; color: #f87171; font-weight: 850; border-bottom: 1px solid rgba(255,255,255,0.1);">المصروف الفعلي</th>
              <th style="padding: 10px; text-align: center; color: #fbbf24; font-weight: 850; border-bottom: 1px solid rgba(255,255,255,0.1);">الموازنة التقديرية</th>
              <th style="padding: 10px; text-align: center; color: #38bdf8; font-weight: 850; border-bottom: 1px solid rgba(255,255,255,0.1);">الفرق والانحراف</th>
            </tr>
          </thead>
          <tbody>
            ${wbsRows.length === 0 ? `<tr><td colspan="4" style="text-align:center;padding:16px;color:#94a3b8;">لا توجد بنود أو حركات مسجلة لهذا المشروع في هذه الفترة</td></tr>` : 
              wbsRows.map(r => {
                const isSave = r.diff >= 0;
                const diffColor = isSave ? '#34d399' : '#f87171';
                const diffBg = isSave ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
                const diffSign = r.diff > 0 ? '+' : (r.diff < 0 ? '-' : '');

                return `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 9px 12px; font-weight: 850; color: #f8fafc; text-align: right;">
                      <i class="fa-solid fa-cube" style="color: #38bdf8; font-size: 0.70rem; margin-left: 6px;"></i>
                      <span>${r.name}</span>
                    </td>
                    <td style="padding: 9px 12px; text-align: center; font-weight: 900; color: #f87171; font-variant-numeric: tabular-nums; direction: ltr;">
                      ${formatVal(r.actAmt)}
                    </td>
                    <td style="padding: 9px 12px; text-align: center; font-weight: 900; color: #fbbf24; font-variant-numeric: tabular-nums; direction: ltr;">
                      ${formatVal(r.estAmt)}
                    </td>
                    <td style="padding: 9px 12px; text-align: center; direction: ltr;">
                      <span style="display: inline-block; padding: 2px 7px; border-radius: 6px; font-weight: 950; font-size: 0.74rem; background: ${diffBg}; color: ${diffColor}; font-variant-numeric: tabular-nums;">
                        ${diffSign}${formatVal(Math.abs(r.diff))}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')
            }
          </tbody>
          <tfoot>
            <tr style="background: rgba(15,23,42,0.95); border-top: 2px solid rgba(56,189,248,0.3); font-weight: 950;">
              <td style="padding: 10px; text-align: right; color: #f8fafc;">إجمالي المنصرف والمعتمد في الفترة</td>
              <td style="padding: 10px; text-align: center; color: #f87171; font-size: 0.86rem; font-variant-numeric: tabular-nums; direction: ltr;">- ${formatVal(totalActualInPeriod)}</td>
              <td style="padding: 10px; text-align: center; color: #fbbf24; font-size: 0.86rem; font-variant-numeric: tabular-nums; direction: ltr;">${formatVal(wbsRows.reduce((s,r) => s + r.estAmt, 0))}</td>
              <td style="padding: 10px; text-align: center; direction: ltr;">
                <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-weight: 950; font-size: 0.80rem; background: ${(wbsRows.reduce((s,r) => s + r.diff, 0)) >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${(wbsRows.reduce((s,r) => s + r.diff, 0)) >= 0 ? '#34d399' : '#f87171'};">
                  ${(wbsRows.reduce((s,r) => s + r.diff, 0)) > 0 ? '+' : ''}${formatVal(wbsRows.reduce((s,r) => s + r.diff, 0))}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- 4 رسوم بيانية مرفقة شاملة للمشروع -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 14px;">
        <!-- رسم 1: هيكل تكاليف المشروع حسب البنود -->
        <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
          <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-chart-pie"></i> <span>هيكل تكاليف المشروع حسب البنود (WBS)</span>
          </div>
          <div style="height: 220px; position: relative;"><canvas id="projChartDoughnut"></canvas></div>
        </div>

        <!-- رسم 2: مقارنة التقديري بالفعلي لكل بند -->
        <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
          <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-chart-column"></i> <span>مقارنة التقديري بالفعلي لكل بند</span>
          </div>
          <div style="height: 220px; position: relative;"><canvas id="projChartBarGrouped"></canvas></div>
        </div>

        <!-- رسم 3: توزيع مساهمات الأفراد في الإنفاق على المشروع -->
        <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
          <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-users"></i> <span>مساهمات أفراد العائلة في المشروع</span>
          </div>
          <div style="height: 220px; position: relative;"><canvas id="projChartBarMembers"></canvas></div>
        </div>

        <!-- رسم 4: منحنى التدفق المالي التراكمي (S-Curve) -->
        <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
          <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-chart-line"></i> <span>مسار الصرف التراكمي للمشروع (S-Curve)</span>
          </div>
          <div style="height: 220px; position: relative;"><canvas id="projChartLineSCurve"></canvas></div>
        </div>
      </div>
    `;

    // Render Charts
    renderProjectCharts(wbsRows, memberActuals, allProjTxs, approvedBudget);
  }

  function renderProjectCharts(wbsRows, memberActuals, allProjTxs, approvedBudget) {
    if (typeof Chart === 'undefined') return;

    // 1. Doughnut Chart (WBS Cost Breakdown)
    const ctxDough = document.getElementById('projChartDoughnut');
    if (ctxDough) {
      if (_chartDough) { _chartDough.destroy(); _chartDough = null; }
      const activeRows = wbsRows.filter(r => r.actAmt > 0);
      const labels = activeRows.map(r => r.name);
      const data = activeRows.map(r => r.actAmt);
      const colors = ['#38bdf8', '#a855f7', '#fbbf24', '#34d399', '#f43f5e', '#ec4899', '#6366f1', '#14b8a6'];

      _chartDough = new Chart(ctxDough, {
        type: 'doughnut',
        data: {
          labels: labels.length ? labels : ['لا توجد مصروفات'],
          datasets: [{
            data: data.length ? data : [1],
            backgroundColor: labels.length ? colors.slice(0, labels.length) : ['rgba(255,255,255,0.1)'],
            borderWidth: 1.5,
            borderColor: '#0f172a'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 10 } } } }
        }
      });
    }

    // 2. Grouped Bar Chart (Estimated vs Actual)
    const ctxGrouped = document.getElementById('projChartBarGrouped');
    if (ctxGrouped) {
      if (_chartGrouped) { _chartGrouped.destroy(); _chartGrouped = null; }
      const topRows = wbsRows.slice(0, 7);
      const labels = topRows.map(r => r.name);
      const actData = topRows.map(r => r.actAmt);
      const estData = topRows.map(r => r.estAmt);

      _chartGrouped = new Chart(ctxGrouped, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            { label: 'التقديري المعتمد', data: estData, backgroundColor: 'rgba(251, 191, 36, 0.75)', borderRadius: 5 },
            { label: 'الفعلي المنصرف', data: actData, backgroundColor: 'rgba(56, 189, 248, 0.75)', borderRadius: 5 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { color: '#cbd5e1', font: { size: 10 } } } },
          scales: {
            x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      });
    }

    // 3. Horizontal Bar Chart (Members)
    const ctxMembers = document.getElementById('projChartBarMembers');
    if (ctxMembers) {
      if (_chartMembers) { _chartMembers.destroy(); _chartMembers = null; }
      const memNames = Object.keys(memberActuals);
      const memVals = Object.values(memberActuals);

      _chartMembers = new Chart(ctxMembers, {
        type: 'bar',
        data: {
          labels: memNames.length ? memNames : ['البيت'],
          datasets: [{
            label: 'المساهمة الفعلية',
            data: memVals.length ? memVals : [0],
            backgroundColor: 'rgba(168, 85, 247, 0.75)',
            borderColor: '#a855f7',
            borderWidth: 1.2,
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
            y: { ticks: { color: '#f8fafc', font: { weight: 'bold' } }, grid: { display: false } }
          }
        }
      });
    }

    // 4. Cumulative S-Curve Chart
    const ctxSCurve = document.getElementById('projChartLineSCurve');
    if (ctxSCurve) {
      if (_chartSCurve) { _chartSCurve.destroy(); _chartSCurve = null; }

      const dateMap = {};
      allProjTxs.forEach(t => {
        const d = (t.date || '').slice(0, 10);
        if (d) dateMap[d] = (dateMap[d] || 0) + (parseFloat(t.amount) || 0);
      });

      const sortedDates = Object.keys(dateMap).sort();
      let cumAct = 0;
      const actPoints = [];
      sortedDates.forEach(d => {
        cumAct += dateMap[d];
        actPoints.push(cumAct);
      });

      _chartSCurve = new Chart(ctxSCurve, {
        type: 'line',
        data: {
          labels: sortedDates.map(d => d.slice(5)),
          datasets: [
            {
              label: 'الفعلي التراكمي للمشروع',
              data: actPoints,
              borderColor: '#f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              fill: true,
              tension: 0.25,
              borderWidth: 2.2
            },
            {
              label: 'سقف الموازنة المعتمدة',
              data: sortedDates.map(() => approvedBudget),
              borderColor: '#fbbf24',
              borderDash: [6, 4],
              fill: false,
              borderWidth: 1.8,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { color: '#cbd5e1', font: { size: 10 } } } },
          scales: {
            x: { ticks: { color: '#94a3b8', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.06)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      });
    }
  }

  return {
    render,
    onProjectChange,
    onActualPeriodChange,
    closeAndArchiveProject
  };
})();
window.ProjectCompareEngine = ProjectCompareEngine;


// =============================================================================
// ProjectArchiveEngine (Closed & Draft Projects)
// =============================================================================

const ProjectArchiveEngine = (() => {
  let _subTab = 'closed'; // 'closed' | 'draft'
  let _expandedProjects = new Set();

  function switchSubTab(tab) {
    _subTab = tab;
    const btnClosed = document.getElementById('btnProjArchiveClosed');
    const btnDraft = document.getElementById('btnProjArchiveDraft');
    if (btnClosed && btnDraft) {
      if (tab === 'closed') {
        btnClosed.style.background = 'linear-gradient(135deg, #0ea5e9, #2563eb)';
        btnClosed.style.color = '#fff';
        btnClosed.style.boxShadow = '0 2px 8px rgba(14,165,233,0.4)';
        btnDraft.style.background = 'transparent';
        btnDraft.style.color = '#94a3b8';
        btnDraft.style.boxShadow = 'none';
      } else {
        btnDraft.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)';
        btnDraft.style.color = '#fff';
        btnDraft.style.boxShadow = '0 2px 8px rgba(168,85,247,0.4)';
        btnClosed.style.background = 'transparent';
        btnClosed.style.color = '#94a3b8';
        btnClosed.style.boxShadow = 'none';
      }
    }
    render();
  }

  function toggleProjectExpand(projectName) {
    if (_expandedProjects.has(projectName)) _expandedProjects.delete(projectName);
    else _expandedProjects.add(projectName);
    render();
  }
  window.toggleProjectArchiveExpand = toggleProjectExpand;

  function restoreProject(projectName) {
    state.closedProjects = (state.closedProjects || []).filter(p => p !== projectName);
    localStorage.setItem('family_closed_projects', JSON.stringify(state.closedProjects));
    if (typeof showToast === 'function') showToast(`تمت استعادة مشروع "${projectName}" كنشط بنجاح ✓`);
    refreshProjectSelectors();
    render();
  }
  window.restoreArchivedProject = restoreProject;

  function exportProjectToExcel(projectName) {
    const txs = (state.transactions || []).filter(t => (t.project === projectName || t.projectId === projectName));
    const formatVal = (typeof formatMoneyVal === 'function') ? formatMoneyVal : (v) => (v || 0).toFixed(2);

    let csv = '\uFEFFالتاريخ,البيان,البند الفرعي WBS,المبلغ,المسؤول,المحفظة\n';
    txs.forEach(t => {
      csv += `"${t.date || ''}","${t.label || t.category || ''}","${t.projectItem || 'عام'}","${t.amount || 0}","${t.member || ''}","${t.walletId || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `كشف_حساب_مشروع_${projectName}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    if (typeof showToast === 'function') showToast(`تم تصدير كشف حساب مشروع ${projectName} بنجاح ✓`);
  }
  window.exportProjectArchiveToExcel = exportProjectToExcel;

  function render() {
    const container = document.getElementById('projectArchiveContentArea');
    if (!container) return;

    const closedSet = new Set(state.closedProjects || []);
    const known = (typeof getKnownProjects === 'function') ? getKnownProjects() : [];
    const formatVal = (typeof formatMoneyVal === 'function') ? formatMoneyVal : (v) => (typeof formatMoney === 'function' ? formatMoney(v) : (v || 0).toLocaleString() + ' ج.م');

    if (_subTab === 'closed') {
      const closedProjects = known.filter(p => closedSet.has(p));
      if (closedProjects.length === 0) {
        container.innerHTML = `
          <div style="background: rgba(15,23,42,0.65); border: 1.2px dashed rgba(56,189,248,0.3); border-radius: 12px; padding: 20px; text-align: center; color: #94a3b8;">
            <i class="fa-solid fa-flag-checkered" style="font-size: 1.8rem; color: #38bdf8; margin-bottom: 6px; display: block;"></i>
            لا توجد مشاريع مكتملة ومغلقة في الأرشيف حالياً.
          </div>
        `;
        return;
      }

      let html = `<div style="display: flex; flex-direction: column; gap: 10px;">`;
      closedProjects.forEach(pName => {
        const txs = (state.transactions || []).filter(t => (t.project === pName || t.projectId === pName) && t.type === 'expense');
        const totSpent = txs.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
        const isExpanded = _expandedProjects.has(pName);

        html += `
          <div class="budget-lux-card" style="background: ${document.body.classList.contains('light-theme') ? '#ffffff' : 'rgba(30, 41, 59, 0.75)'} !important; border: 1.2px solid ${isExpanded ? (document.body.classList.contains('light-theme') ? '#0284c7' : '#38bdf8') : (document.body.classList.contains('light-theme') ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)')} !important; box-shadow: ${document.body.classList.contains('light-theme') ? '0 3px 12px rgba(0,0,0,0.06)' : 'none'}; color: ${document.body.classList.contains('light-theme') ? '#0f172a' : '#f8fafc'}; border-radius: 14px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 32px; height: 32px; border-radius: 8px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 0.95rem;"><i class="fa-solid fa-folder-closed"></i></span>
                <div>
                  <div style="font-size: 0.92rem; font-weight: 900; color: #f8fafc;">🏁 ${pName}</div>
                  <div style="font-size: 0.68rem; color: #94a3b8;">
                    التكلفة الإجمالية: <strong style="color: #f87171; font-family: var(--font-numbers); direction: ltr;">- ${formatVal(totSpent)}</strong> • ${txs.length} حركة مسجلة
                  </div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" onclick="exportProjectArchiveToExcel('${pName}')" class="btn-wallet-action-pill" style="height: 28px; padding: 0 8px; font-size: 0.68rem; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; font-weight: 850; cursor: pointer; border-radius: 6px;">
                  <i class="fa-solid fa-file-excel"></i> تصدير إكسيل
                </button>
                <button type="button" onclick="restoreArchivedProject('${pName}')" class="btn-wallet-action-pill" style="height: 28px; padding: 0 8px; font-size: 0.68rem; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-weight: 850; cursor: pointer; border-radius: 6px;">
                  <i class="fa-solid fa-rotate-left"></i> إعادة فتح
                </button>
                <button type="button" onclick="toggleProjectArchiveExpand('${pName}')" style="width: 28px; height: 28px; border-radius: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 0.78rem; font-weight: 900; cursor: pointer;">
                  <i class="fa-solid ${isExpanded ? 'fa-minus' : 'fa-plus'}"></i>
                </button>
              </div>
            </div>

            ${isExpanded ? `
              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1);">
                <div style="font-size: 0.72rem; font-weight: 850; color: #38bdf8; margin-bottom: 6px;"><i class="fa-solid fa-receipt"></i> حركات ومصروفات المشروع:</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; direction: rtl;">
                  <thead>
                    <tr style="background: rgba(15,23,42,0.85); color: #94a3b8;">
                      <th style="padding: 6px; text-align: right;">التاريخ</th>
                      <th style="padding: 6px; text-align: right;">البيان</th>
                      <th style="padding: 6px; text-align: right;">البند الفرعي</th>
                      <th style="padding: 6px; text-align: center;">المبلغ</th>
                      <th style="padding: 6px; text-align: left;">المسؤول</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${txs.slice(0, 50).map(t => `
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 5px 6px; color: #94a3b8;">${t.date || ''}</td>
                        <td style="padding: 5px 6px; color: #f8fafc; font-weight: 800;">${escapeHtml(t.label || t.category || '')}</td>
                        <td style="padding: 5px 6px; color: #38bdf8;">${escapeHtml(t.projectItem || 'عام')}</td>
                        <td style="padding: 5px 6px; text-align: center; color: #f87171; font-weight: 900; direction: ltr;">- ${formatVal(t.amount)}</td>
                        <td style="padding: 5px 6px; text-align: left; color: #cbd5e1;">${escapeHtml(t.member || 'البيت')}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}
          </div>
        `;
      });
      html += `</div>`;
      container.innerHTML = html;
    } else {
      // Draft / Upcoming Projects
      const draftPlans = (state.monthlyBudgets || []).filter(p => (p.project || p.type === 'project') && !closedSet.has(p.project || p.title));
      let html = `
        <div style="margin-bottom: 10px; display: flex; justify-content: flex-end;">
          <button type="button" onclick="openNewBudgetPlanModal()" style="height: 32px; padding: 0 12px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.74rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);">
            <i class="fa-solid fa-plus"></i> إنشاء موازنة مشروع جديد وبنوده
          </button>
        </div>
      `;

      if (draftPlans.length === 0) {
        html += `
          <div style="background: rgba(15,23,42,0.65); border: 1.2px dashed rgba(168,85,247,0.3); border-radius: 12px; padding: 20px; text-align: center; color: #94a3b8;">
            <i class="fa-solid fa-hourglass-start" style="font-size: 1.8rem; color: #c084fc; margin-bottom: 6px; display: block;"></i>
            لا توجد مشاريع قيد التجهيز أو مقترحة حالياً.
          </div>
        `;
      } else {
        html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;
        draftPlans.forEach(plan => {
          const pTitle = plan.project || plan.title || 'مشروع جديد';
          const items = Array.isArray(plan.items) ? plan.items : [];
          const totalAmt = items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);

          html += `
            <div class="budget-lux-card" style="background: ${document.body.classList.contains('light-theme') ? '#ffffff' : 'rgba(30, 41, 59, 0.75)'} !important; border: 1.2px solid ${document.body.classList.contains('light-theme') ? '#e2e8f0' : 'rgba(168, 85, 247, 0.3)'} !important; box-shadow: ${document.body.classList.contains('light-theme') ? '0 3px 12px rgba(0,0,0,0.06)' : 'none'}; color: ${document.body.classList.contains('light-theme') ? '#0f172a' : '#f8fafc'}; border-radius: 14px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 0.90rem; font-weight: 900; color: #f8fafc;">📋 ${pTitle}</div>
                <div style="font-size: 0.68rem; color: #94a3b8;">السقف المالي: <strong style="color: #fbbf24;">${formatVal(totalAmt)}</strong> • ${items.length} بنود WBS</div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button type="button" onclick="if(typeof openBudgetItemModal==='function') openBudgetItemModal('${plan.id}');" class="btn-wallet-action-pill" style="height: 28px; padding: 0 8px; font-size: 0.68rem; background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc; font-weight: 850; cursor: pointer; border-radius: 6px;">
                  <i class="fa-solid fa-pencil"></i> تعديل
                </button>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }
      container.innerHTML = html;
    }
  }

  return {
    render,
    switchSubTab
  };
})();
window.ProjectArchiveEngine = ProjectArchiveEngine;
