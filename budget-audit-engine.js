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
    // Dedicated comparison tab links directly to authoritative 3-axis liquidity comparisons
    if (typeof renderComparisonsSection === 'function') {
      renderComparisonsSection();
      return;
    }
    const container = document.getElementById('panelBudgetComparisons');
    if (!container) return;
    if (window.FamilyBudgetComparison) {
      window.FamilyBudgetComparison.render(container, state);
    }
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
  let periodChartMode = 'table';
  const sampleMonthlyAmounts = {
    food: 3000, bills: 2100, education: 1800, transport: 1200,
    house: 1000, daily: 950, health: 850, clothes: 650, other: 450
  };

  // حالة منصة الرسوم البيانية التفاعلية المدمجة (1–8)
  let activeChartTab = 1;
  let isChartDeckCollapsed = false;
  let _currentChartsMap = {};

  const CHARTS_DECK_META = [
    { id: 1, name: 'الأعمدة', fullName: '1. الأعمدة المتجاورة', icon: 'fa-chart-column', tip: 'مقارنة الصرف الفعلي مع التقديري بنداً ببند' },
    { id: 2, name: 'الشلال', fullName: '2. شلال الفروقات', icon: 'fa-waterfall', tip: 'مسار تراكمي يوضح كيف تحولت الموازنة إلى الفعلي' },
    { id: 3, name: 'الانحراف', fullName: '3. أعمدة الانحراف', icon: 'fa-arrows-left-right', tip: 'تحديد دقيق لحجم واتجاه انحراف كل بند عن الخط المخطط' },
    { id: 4, name: 'الرصاصة', fullName: '4. مخطط الرصاصة: الفعلي والمرجع', icon: 'fa-bullseye', tip: 'قياس نسبة استهلاك سقف الميزانية مقارنة بالحد 100%' },
    { id: 5, name: 'التراكم', fullName: '5. التراكم عبر الفترات المختارة', icon: 'fa-chart-line', tip: 'تتبع وتيرة الصرف التراكمي ومقارنته بالمسار المستهدف' },
    { id: 6, name: 'الحرارية', fullName: '6. الخريطة الحرارية للفترتين', icon: 'fa-table-cells', tip: 'مصفوفة بصرية لتقييم انحرافات كل بند عبر الفترات' },
    { id: 7, name: 'المكدس', fullName: '7. المكدس النسبي 100%', icon: 'fa-bars-progress', tip: 'توزيع حصص البنود كنسبة مئوية من إجمالي الإنفاق 100%' },
    { id: 8, name: 'الميل', fullName: '8. مخطط الميل والاتجاه', icon: 'fa-arrow-trend-up', tip: 'مخطط اتجاهي يوضح صعود أو هبوط تكلفة كل بند' }
  ];

  function selectChartTab(chartNum) {
    activeChartTab = Math.max(1, Math.min(8, parseInt(chartNum, 10) || 1));
    isChartDeckCollapsed = false;
    renderActiveChartOnly();
  }

  function renderActiveChartOnly() {
    const stage = document.getElementById('cmpDeckStage');
    const title = document.getElementById('cmpActiveChartTitle');
    const icon = document.querySelector('#cmpChartsDeck .cmp-deck-title i');
    const tabs = document.querySelectorAll('.cmp-deck-tab');
    if (stage && _currentChartsMap && _currentChartsMap[activeChartTab]) {
      stage.innerHTML = _currentChartsMap[activeChartTab];
      stage.classList.remove('is-collapsed');
    }
    const meta = CHARTS_DECK_META[activeChartTab - 1];
    if (title && meta) title.textContent = meta.fullName;
    if (icon && meta) icon.className = 'fa-solid ' + meta.icon;
    tabs.forEach((tab, idx) => {
      const isActive = (idx + 1 === activeChartTab);
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
    const btnIcon = document.getElementById('cmpDeckToggleIcon');
    const btnLabel = document.getElementById('cmpDeckToggleLabel');
    if (btnIcon && btnLabel) {
      btnIcon.className = 'fa-solid fa-chevron-up';
      btnLabel.textContent = 'طي الرسم';
    }
  }

  function toggleChartDeck() {
    isChartDeckCollapsed = !isChartDeckCollapsed;
    const stage = document.getElementById('cmpDeckStage');
    const btnIcon = document.getElementById('cmpDeckToggleIcon');
    const btnLabel = document.getElementById('cmpDeckToggleLabel');
    if (stage) stage.classList.toggle('is-collapsed', isChartDeckCollapsed);
    if (btnIcon && btnLabel) {
      btnIcon.className = isChartDeckCollapsed ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
      btnLabel.textContent = isChartDeckCollapsed ? 'عرض الرسم' : 'طي الرسم';
    }
  }

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
      return { from: formatDateStr(start), to: formatDateStr(now), label: 'الأسبوع الحالى' };
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
      return { from: formatDateStr(start), to: formatDateStr(now), label: 'الشهر الحالى' };
    }
    if (period === 'lastMonth') {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'الشهر السابق' };
    }
    if (period === 'thisYear') {
      const start = new Date(y, 0, 1);
      return { from: formatDateStr(start), to: formatDateStr(now), label: 'السنة الحالية' };
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

  const sampleLedgerKey = 'family_monefy_budget_trial_operations_v1';
  const sampleProfiles = {
    'sample-low': { factor: -1, label: 'موازنة تجريبية اقتصادية' },
    sample: { factor: 0, label: 'موازنة تجريبية أساسية' },
    'sample-high': { factor: 1, label: 'موازنة تجريبية مرنة' },
    'sample-spend': { label: 'مصروفات المثال التجريبي' }
  };
  const sampleSpendProfiles = [
    { food: 2800, bills: 2100, education: 2000, transport: 1200, house: 1100, daily: 900, health: 700, clothes: 500, other: 300, 'trial-gifts': 450, 'trial-leisure': 0 },
    { food: 3400, bills: 2100, education: 1600, transport: 1450, house: 900, daily: 850, health: 1200, clothes: 450, other: 300, 'trial-gifts': 0, 'trial-leisure': 650 }
  ];
  const trialCategoryNames = { 'trial-gifts': 'هدايا تجريبية', 'trial-leisure': 'ترفيه تجريبي' };
  const number = new Intl.NumberFormat('ar-EG', {maximumFractionDigits: 2});
  const percent = new Intl.NumberFormat('ar-EG', {maximumFractionDigits: 1});
  const money = cents => number.format(cents / 100);
  const signedMoney = cents => (cents > 0 ? '+' : '') + money(cents);
  const byId = id => document.getElementById(id);
  let demoMode = false; // Strictly disabled - real transactions only
  let previousControls = null;
  let sampleView = {limit: 60};
  let sampleReturn = null;

  function getNavigationRange() {
    return periodToRange(_actualPeriod, byId('cmpActualFrom')?.value, byId('cmpActualTo')?.value);
  }

  function categoryName(category) {
    return trialCategoryNames[category] || (category === 'other' ? 'أخرى' : getCategoryObj(category, 'expense')?.name) || category;
  }

  function datePair(prefix) {
    return {from: byId(prefix + 'From').value, to: byId(prefix + 'To').value};
  }

  function validRange(range) {
    return /^\d{4}-\d{2}-\d{2}$/.test(range.from) && /^\d{4}-\d{2}-\d{2}$/.test(range.to) && range.from <= range.to;
  }

  function previousRange(range, period = _actualPeriod) {
    const start = new Date(range.from + 'T00:00:00Z');
    const year = start.getUTCFullYear();
    const month = start.getUTCMonth();
    const date = value => value.toISOString().slice(0, 10);
    if (period === 'thisMonth' || period === 'lastMonth') {
      const last = new Date(Date.UTC(year, month, 0));
      if (period === 'thisMonth') last.setUTCDate(Math.min(last.getUTCDate(), dateDiffDays(range.from, range.to)));
      return {from: date(new Date(Date.UTC(year, month - 1, 1))), to: date(last)};
    }
    if (period === 'thisYear') {
      const end = new Date(range.to + 'T00:00:00Z');
      const endMonth = end.getUTCMonth();
      const lastDay = new Date(Date.UTC(year - 1, endMonth + 1, 0)).getUTCDate();
      return {from: date(new Date(Date.UTC(year - 1, 0, 1))), to: date(new Date(Date.UTC(year - 1, endMonth, Math.min(lastDay, end.getUTCDate()))))};
    }
    const step = period === 'thisWeek' ? 7 : dateDiffDays(range.from, range.to);
    const day = 86400000;
    return {from: date(new Date(+start - step * day)), to: date(new Date(Date.parse(range.to) - step * day))};
  }

  function* monthSlices(range) {
    const month = new Date(range.from.slice(0,7) + '-01');
    const end = new Date(range.to);
    for (;month <= end;month.setUTCMonth(month.getUTCMonth()+1)) {
      const key = month.toISOString().slice(0,7);
      const endOfMonth = new Date(month);
      endOfMonth.setUTCMonth(month.getUTCMonth()+1,0);
      const days = endOfMonth.getUTCDate();
      yield {key, days, first: key === range.from.slice(0,7) ? +range.from.slice(8) : 1,
        last: key === range.to.slice(0,7) ? end.getUTCDate() : days};
    }
  }

  function prorate(cents, days, first, last) {
    return Math.round(cents * last / days) - Math.round(cents * (first - 1) / days);
  }

  function sampleAmounts(profile) {
    const factor = sampleProfiles[profile].factor;
    const flexible = {food: 500, education: 300, transport: 200, house: 250, daily: 200, clothes: 300, other: 250};
    return Object.entries(sampleMonthlyAmounts).map(([category, amount]) => [category, (amount + factor * (flexible[category] || 0)) * 100]);
  }

  function sampleCategories(profile) {
    return Object.keys(profile === 'sample-spend' ? sampleSpendProfiles[0] : sampleMonthlyAmounts);
  }

  function readSampleOperations() {
    const stored = JSON.parse(localStorage.getItem(sampleLedgerKey) || '{}');
    if (!stored || Array.isArray(stored) || typeof stored !== 'object') throw new Error('Invalid sample ledger');
    return stored;
  }

  function addSampleDays(dates, range, monthly) {
    let added = 0;
    for (const {key, days, first, last} of monthSlices(range)) {
      for (let day = first; day <= last; day++) {
        const date = key + '-' + pad(day);
        if (Object.hasOwn(dates, date)) continue;
        dates[date] = monthly.map(([, cents]) => prorate(cents, days, day, day));
        added += dates[date].filter(Boolean).length;
      }
    }
    return added;
  }

  function withSampleLock(write) {
    return navigator.locks ? navigator.locks.request(sampleLedgerKey, write) : Promise.resolve().then(write);
  }

  async function seedDemo() {
    const newer = periodToRange('lastMonth');
    const older = previousRange(newer, 'lastMonth');
    await withSampleLock(() => {
      const ledger = readSampleOperations();
      if (ledger.demoMonth === newer.from && ledger['sample-spend']) return;
      const dates = {};
      for (const [i, range] of [older, newer].entries()) {
        addSampleDays(dates, range, Object.entries(sampleSpendProfiles[i]).map(([key, value]) => [key, value * 100]));
      }
      ledger['sample-spend'] = dates;
      ledger.demoMonth = newer.from;
      localStorage.setItem(sampleLedgerKey, JSON.stringify(ledger));
    });
  }

  async function toggleDemo() {
    // Demo mode permanently removed - application relies strictly on real state.transactions
    const note = byId('cmpDemoNote');
    if (note) note.hidden = true;
    const button = byId('cmpDataMode');
    if (button) button.hidden = true;
  }

  function onActualPeriodChange(value) {
    _actualPeriod = value;
    byId('cmpActualPeriod').value = value;
    render();
  }

  function isSampleBudget(profile) {
    return profile !== 'sample-spend' && Object.hasOwn(sampleProfiles, profile);
  }

  async function recordSampleOperations() {
    const profile = byId('cmpPeriodReference').value;
    const range = getNavigationRange();
    if (!isSampleBudget(profile) || !validRange(range)) return false;
    const status = byId('cmpSampleStatus');
    try {
      const added = await withSampleLock(() => {
        const ledger = readSampleOperations();
        const count = addSampleDays(ledger[profile] ||= {}, range, sampleAmounts(profile));
        if (count) localStorage.setItem(sampleLedgerKey, JSON.stringify(ledger));
        return count;
      });
      if (status.dataset.scope === [profile, range.from, range.to].join(':')) {
        status.textContent = added ? 'سُجّلت ' + number.format(added) + ' عملية تجريبية.' : 'هذه الفترة مسجّلة بالفعل.';
      }
      return true;
    } catch {
      status.textContent = 'تعذّر حفظ العمليات التجريبية.';
      return false;
    }
  }

  function selectReference() {
    render();
    return recordSampleOperations();
  }

  function sampleEntries(ledger, profile, range, category) {
    const categories = sampleCategories(profile);
    const result = [];
    for (const [date, values] of Object.entries(ledger[profile] || {})) {
      if ((range.from && date < range.from) || (range.to && date > range.to) || !Array.isArray(values)) continue;
      values.forEach((cents, i) => {
        const id = categories[i];
        if (id && Number.isFinite(cents) && cents !== 0 && (!category || id === category)) result.push({date, id, cents, profile});
      });
    }
    return result;
  }

  function openSampleLedger(profile, range, button) {
    const category = button.dataset.periodCategory;
    sampleReturn = {id: button.id, series: button.dataset.periodSeries, category, top: window.scrollY};
    sampleView = {profile, ...range, category, limit: 60};
    switchAppPage('operations');
    switchOperationsSubTab('sample');
  }

  async function openSampleOperations(button) {
    const profile = byId('cmpPeriodReference').value;
    const range = getNavigationRange();
    if (!await recordSampleOperations()) return;
    const current = getNavigationRange();
    if (byId('cmpPeriodReference').value === profile && current.from === range.from && current.to === range.to) openSampleLedger(profile, range, button);
  }

  function returnFromSampleOperations() {
    if (!sampleReturn) return;
    const previous = sampleReturn;
    sampleReturn = null;
    sampleView = {limit: 60};
    switchAppPage('budgets');
    switchBudgetSubTab('monthly');
    switchBudgetMonthView('compare');
    requestAnimationFrame(() => {
      window.scrollTo(0, previous.top);
      const target = previous.id ? byId(previous.id) : document.querySelector(periodButtonSelector(previous.series, previous.category));
      target?.scrollIntoView({block: 'nearest'});
      target?.focus({preventScroll: true});
    });
  }

  function renderSampleOperations() {
    const container = byId('sampleOperationsList');
    if (!container) return;
    byId('sampleOperationsBack').hidden = !sampleReturn;
    byId('sampleOperationsShowAll').hidden = !sampleView.profile;
    byId('sampleOperationsMore').hidden = true;
    let records;
    try {
      const ledger = readSampleOperations();
      records = Object.keys(sampleProfiles).filter(profile => !sampleView.profile || sampleView.profile === profile)
        .flatMap(profile => sampleEntries(ledger, profile, sampleView, sampleView.category));
    } catch {
      container.textContent = 'تعذرت قراءة سجل العمليات التجريبية.';
      return;
    }
    records.sort((a,b) => b.date.localeCompare(a.date));
    if (!records.length) {
      container.textContent = 'لا توجد عمليات تجريبية لهذا الاختيار.';
      return;
    }
    const total = records.reduce((sum, record) => sum + record.cents, 0);
    const rows = records.slice(0,sampleView.limit).map(({date,id,cents,profile}) =>
      '<tr><td><bdi>' + escapeHtml(date) + '</bdi></td><td>' + escapeHtml(categoryName(id)) +
      '</td><td>' + sampleProfiles[profile].label + '</td><td><bdi>' + money(cents) + '</bdi></td></tr>').join('');
    container.innerHTML = '<p class="sample-operations-summary">' + number.format(records.length) + ' عملية تجريبية · ' +
      money(total) + ' ج.م</p><div class="cmp-period-table"><table aria-label="العمليات التجريبية المسجلة">' +
      '<thead><tr><th>التاريخ</th><th>البند</th><th>المصدر</th><th>ج.م</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    byId('sampleOperationsMore').hidden = records.length <= sampleView.limit;
  }

  function showMoreSampleOperations() {
    sampleView.limit += 60;
    renderSampleOperations();
  }

  function showAllSampleOperations() {
    sampleView = {limit: 60};
    renderSampleOperations();
  }

  function aggregate(entries) {
    const values = new Map();
    for (const {id, cents} of entries) values.set(id, (values.get(id) || 0) + cents);
    return values;
  }

  function expensesForRange(range) {
    // Real transactions only - demoMode eliminated
    return (state.transactions || []).filter(tx => tx.type === 'expense' && String(tx.date || '').slice(0,10) >= range.from &&
      String(tx.date || '').slice(0,10) <= range.to).map(tx => ({id: tx.category || 'other', cents: Math.round((Number(tx.amount) || 0) * 100)}));
  }

  function estimatesForRange(range) {
    const values = new Map();
    const missing = [];
    const plans = state.monthlyBudgets || [];
    for (const {key, days, first, last} of monthSlices(range)) {
      const matches = plans.filter(plan => plan.month === key && plan.items?.length);
      const plan = matches.find(item => item.id === state.activeBudgetId) || matches[0];
      if (!plan) {
        missing.push(key);
        continue;
      }
      const entries = aggregate(plan.items.map(item => ({id: item.category || 'other', cents: Math.round((Number(item.amount) || 0) * 100)})));
      for (const [category, cents] of entries) {
        values.set(category, (values.get(category) || 0) + prorate(cents, days, first, last));
      }
    }
    return {values, missing};
  }

  function periodButtonSelector(series, category) {
    return '#cmpPeriodChart button[data-period-series="' + series + '"][data-period-category="' + CSS.escape(category || '') + '"]';
  }

  function rangeLabel(range) {
    return '<bdi dir="ltr">' + escapeHtml(range.from) + ' — ' + escapeHtml(range.to) + '</bdi>';
  }

  function differencePercent(difference, baseline) {
    if (baseline === null || baseline <= 0) return '—';
    return (difference > 0 ? '+' : '') + percent.format(difference / baseline * 100) + '٪';
  }

  function changeMarkup(actual, baseline, budgetReference) {
    if (baseline === null) return '<span class="cmp-delta-caption">المرجع غير متاح</span>';
    const difference = actual - baseline;
    if (!difference) return '<span class="cmp-delta-caption">لا فرق</span>';
    const type = difference > 0 ? 'cmp-rise' : 'cmp-fall';
    const caption = budgetReference
      ? (difference > 0 ? 'أعلى من التقديري' : 'أقل من التقديري')
      : (difference > 0 ? 'أعلى من المرجع' : 'أقل من المرجع');
    const info = baseline === 0 && actual > 0 ? (budgetReference ? 'صرف بلا تقدير' : 'بند جديد') :
      baseline > 0 && actual === 0 ? (budgetReference ? 'لم يُسجَّل صرف' : 'توقف الصرف') : '';
    return '<span class="cmp-delta-caption ' + type + '">' + caption + '</span><span class="cmp-delta-value"><bdi dir="ltr" class="cmp-delta-amount ' +
      type + '">' + signedMoney(difference) + '</bdi><span class="cmp-change-unit">ج.م</span></span>' +
      (baseline > 0 ? '<small dir="ltr">' + differencePercent(difference, baseline) + '</small>' : '') +
      (info ? '<small>' + info + '</small>' : '');
  }

  function renderRangePreview(id, range, caption, fallback = 'اختر التواريخ') {
    const el = byId(id);
    if (!el) return;
    const isCustomRef = (id === 'cmpReferenceDates' && byId('cmpPeriodReference')?.value === 'custom') ||
                        (id === 'cmpProjReferenceDates' && byId('cmpProjPeriodReference')?.value === 'custom');
    const isCustomActual = (id === 'cmpPrimaryDates' && _actualPeriod === 'custom') ||
                           (id === 'cmpProjPrimaryDates' && document.getElementById('cmpProjActualPeriod')?.value === 'custom');
    const isClickable = isCustomRef || isCustomActual;

    const datesText = validRange(range) ? rangeLabel(range) : fallback;
    const icon = isClickable ? '<i class="fa-solid fa-calendar-days" style="margin-left: 5px; color: #0D9488;"></i>' : '';
    
    el.innerHTML = '<small>' + caption + '</small><div style="display:flex;align-items:center;gap:4px;">' + icon + datesText + '</div>';
    el.style.cursor = isClickable ? 'pointer' : 'default';
    el.title = isClickable ? 'اضغط لتعديل نطاق التواريخ من منتقي التاريخ' : '';
    
    if (isClickable) {
      el.onclick = () => {
        if (id === 'cmpPrimaryDates') openDateRangePickerForPair('cmpActualFrom', 'cmpActualTo');
        else if (id === 'cmpReferenceDates') openDateRangePickerForPair('cmpPeriodFrom', 'cmpPeriodTo');
        else if (id === 'cmpProjPrimaryDates') openDateRangePickerForPair('cmpProjActualFrom', 'cmpProjActualTo');
        else if (id === 'cmpProjReferenceDates') openDateRangePickerForPair('cmpProjPeriodFrom', 'cmpProjPeriodTo');
      };
    } else {
      el.onclick = null;
    }
  }

  function usePrimaryDates() {
    byId('cmpEstimFrom').value = '';
    byId('cmpEstimTo').value = '';
    render();
  }

  function valueMarkup(key, id, cents, clickable) {
    if (cents === null) return '<span>—</span>';
    if (!clickable || !cents) return '<bdi dir="ltr" class="cmp-plain-value">' + money(cents) + '</bdi>';
    const label = key === 'actual' ? 'الفترة الأساسية' : 'المرجع';
    return '<button type="button" class="cmp-period-value" data-period-series="' + key + '" data-period-category="' +
      escapeHtml(id) + '" aria-label="' + escapeHtml((id ? categoryName(id) : 'الإجمالي') + '، ' + label + '، ' + money(cents)) +
      '"><bdi dir="ltr">' + money(cents) + '</bdi></button>';
  }

  function renderInsights(rows, entryCount, total, range, comparable) {
    const rise = rows.filter(row => row.diff > 0);
    const fall = rows.filter(row => row.diff < 0);
    const most = (list, sort) => [...list].sort(sort)[0]?.name || '—';
    const stats = [
      ['عدد العمليات', number.format(entryCount)],
      ['متوسط الصرف اليومي', money(Math.round(total / dateDiffDays(range.from,range.to))) + ' ج.م'],
      ['عدد البنود', number.format(rows.length)],
      ['بنود زاد فيها الصرف', comparable ? number.format(rise.length) : '—'],
      ['بنود قل فيها الصرف', comparable ? number.format(fall.length) : '—'],
      ['بنود بلا تغير', comparable ? number.format(rows.length - rise.length - fall.length) : '—'],
      ['أكبر زيادة', most(rise, (a,b) => b.diff - a.diff)],
      ['أكبر انخفاض', most(fall, (a,b) => a.diff - b.diff)],
      ['أعلى بند صرفًا', most(rows.filter(row => row.a > 0), (a,b) => b.a - a.a)]
    ];
    byId('cmpExtraInsightGrid').innerHTML = '<dl class="cmp-metrics">' + stats.map(([name,value]) =>
      '<div><dt>' + escapeHtml(name) + '</dt><dd>' + escapeHtml(value) + '</dd></div>').join('') + '</dl>';
  }


  // Reference-spec comparison, 17 Nov 2026: visible only for a registered budget.
  // Monetary values in this engine are cents. No samples or fabricated categories.
  
  // المكون القابل للطي لشرح الرسوم البيانية وكيفية قراءتها
  function chartExplanation(whatIsIt, howToRead) {
    return '<details class="bs-chart-explanation"><summary><i class="fa-solid fa-circle-question"></i> <span>شرح</span> <i class="fa-solid fa-chevron-down"></i></summary><div class="bs-explanation-body"><div><strong>ما يعبر عنه الشارت:</strong> ' + whatIsIt + '</div><div style="margin-top:4px;"><strong>كيفية قراءته:</strong> ' + howToRead + '</div></div></details>';
  }

  function renderBudgetReferenceSpecification(content,rows,totals,range,opts={}) {
    const expanded=Boolean(content.querySelector('#cmpUnifiedAdvancedCharts')?.open);
    const referenceLabel=opts.referenceLabel||'الموازنة التقديرية';
    const actualLabel=opts.actualLabel||'الصرف الفعلي';
    const budgetMode=opts.reference==='plan'||!opts.reference;
    const sorted=[...rows];
    const est=totals.b||0, actual=totals.a||0, variance=actual-est;
    const palette={estimated:'#2563EB',actual:'#0D9488',over:'#DC2626',save:'#16A34A'};
    const num=value=>Math.round(Number(value)||0);
    const money=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value/100);
    const fmt=value=>'<bdi dir="ltr">'+money(num(value))+'</bdi>';
    const signed=value=>'<bdi dir="ltr">'+(value>0?'+':value<0?'−':'')+money(Math.abs(num(value)))+'</bdi>';
    const percentValue=(difference,base)=>base>0?(difference/base*100):null;
    const pct=value=>value===null?'—':'<bdi dir="ltr">'+(value>0?'+':value<0?'−':'')+Math.abs(value).toFixed(1)+'%</bdi>';
    const tone=value=>value>0?'bs-over':value<0?'bs-save':'bs-neutral';
    const safe=escapeHtml;
    const actualLink=row=>'<button type="button" class="bs-open-operations" data-period-series="actual" data-period-category="'+safe(row.id)+'" aria-label="عرض عمليات '+safe(row.name)+'">'+fmt(row.a)+'</button>';
    const referenceLink=row=>opts.reference==='plan'||!row.b?fmt(row.b):
      '<button type="button" class="bs-open-operations" data-period-series="reference" data-period-category="'+safe(row.id)+'" aria-label="عرض عمليات المرجع: '+safe(row.name)+'">'+fmt(row.b)+'</button>';
    const condition=row=>(row.b||0)===0?'غير مخطط':(row.diff/(row.b||1)*100>5?(budgetMode?'تجاوز':'ارتفاع'):row.diff/(row.b||1)*100< -5?(budgetMode?'توفير':'انخفاض'):'ضمن الحد');
    const totalPct=percentValue(variance,est);
    if(est+sorted.reduce((sum,row)=>sum+row.diff,0)!==actual){
      content.innerHTML='<p class="bs-error" role="alert">تعذر عرض المقارنة: إجمالي التقديري ومجموع الفروق لا يتطابقان مع إجمالي الفعلي.</p>';
      return;
    }
    if(!byId('budgetSpecStyle')){
      const style=document.createElement('style');style.id='budgetSpecStyle';
      style.textContent=[
        '.budget-spec{--bs-est:#2563EB;--bs-act:#0D9488;--bs-over:#DC2626;--bs-save:#16A34A;color:var(--text-primary,inherit);direction:rtl;font:500 13px/1.65 Tahoma,Arial,sans-serif;max-width:100%;min-width:0}',
        '.budget-spec *, .budget-spec *::before,.budget-spec *::after{box-sizing:border-box}',
        '.budget-spec h3,.budget-spec h4{margin:0 0 9px;font-size:15px;line-height:1.4;color:inherit}',
        '.budget-spec small{font-size:12px;color:var(--text-secondary,inherit)}',
        '.budget-spec .bs-intro{margin:0 0 12px;color:inherit}',
        '.budget-spec .bs-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;min-width:0}',
        '.budget-spec .bs-panel{min-width:0;max-width:100%;overflow:hidden;border:1px solid var(--border-color,#cbd5e1);background:var(--card-bg,transparent);border-radius:12px;padding:12px}',
        '.budget-spec .bs-note{font-size:12px;margin:9px 0 0}',
        '.budget-spec .bs-over{color:var(--bs-over)}.budget-spec .bs-save{color:var(--bs-save)}.budget-spec .bs-neutral{color:inherit}',
        '.budget-spec .bs-open-operations{border:0;border-bottom:1px dashed currentColor;background:transparent;font:inherit;color:var(--bs-act);padding:2px;cursor:pointer;min-height:30px}',
        '.budget-spec .bs-statline{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:9px 0 12px}',
        '.budget-spec .bs-statline>div{padding:9px;border:1px solid var(--border-color,#cbd5e1);border-radius:8px;min-width:0}',
        '.budget-spec .bs-statline strong{display:block;font-size:15px;overflow-wrap:anywhere}',
        '.budget-spec .bs-statline small{display:block}',
        '.budget-spec .bs-table-wrap{max-width:100%;width:100%;overflow-x:auto}',
        '.budget-spec .bs-table{width:100%;border-collapse:collapse;min-width:720px;text-align:right;font-variant-numeric:tabular-nums}',
        '.budget-spec .bs-table th,.budget-spec .bs-table td{padding:7px 6px;border-bottom:1px solid var(--border-color,#cbd5e1);white-space:nowrap;font-size:12px}',
        '.budget-spec .bs-table th{font-weight:900}.budget-spec .bs-table tfoot{font-weight:900}',
        '.budget-spec .bs-mobile-rows{display:none}',
        '.budget-spec .bs-row-card{border:1px solid var(--border-color,#cbd5e1);border-radius:9px;padding:10px;margin:7px 0}',
        '.budget-spec .bs-row-head{display:flex;align-items:center;justify-content:space-between;gap:6px}',
        '.budget-spec .bs-row-values{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px 9px;margin-top:6px}',
        '.budget-spec .bs-row-values>div{display:flex;gap:4px;min-width:0;flex-wrap:wrap;justify-content:space-between}',
        '.budget-spec .bs-viz{width:100%;height:auto;display:block;overflow:visible}',
        '.budget-spec .bs-viz text{fill:currentColor;font:12px Tahoma,Arial,sans-serif}',
        '.budget-spec .bs-viz .bs-grid-line{stroke:var(--border-color,#cbd5e1);stroke-width:1;stroke-dasharray:3 4}',
        '.budget-spec .bs-variance-row{display:grid;grid-template-columns:minmax(80px,1fr) minmax(0,2fr);gap:7px;align-items:center;margin:8px 0}',
        '.budget-spec .bs-variance-label{font-size:12px;text-align:right;overflow-wrap:anywhere}',
        '.budget-spec .bs-track{height:19px;position:relative;display:flex;align-items:center;background:color-mix(in srgb,var(--bs-est) 9%,transparent);border-radius:3px}',
        '.budget-spec .bs-track::after{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:1px solid currentColor;opacity:.45}',
        '.budget-spec .bs-track>i{position:absolute;top:3px;bottom:3px;max-width:50%;display:block}',
        '.budget-spec .bs-variance-value{font-size:12px;text-align:left;white-space:nowrap}',
        '.budget-spec .bs-legend{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;font-size:12px}',
        '.budget-spec .bs-legend i{display:inline-block;width:12px;height:12px;vertical-align:middle;margin-inline-end:4px}',
        '.budget-spec [dir="ltr"],.budget-spec bdi{unicode-bidi:isolate;font-variant-numeric:tabular-nums}',
        '@media(min-width:880px){.budget-spec .bs-grid{grid-template-columns:1fr !important;}.budget-spec .bs-grid>.bs-full{grid-column:1/-1}}',
        '@media(max-width:600px){.budget-spec .bs-table-wrap{display:none}.budget-spec .bs-mobile-rows{display:block}.budget-spec .bs-panel{padding:9px}.budget-spec .bs-statline strong{font-size:13px}.budget-spec .bs-viz text{font-size:12px}}'
      ].join('\n');document.head.append(style);
    }
    const tableRows=sorted.map((row,index)=>{
      const ratio=percentValue(row.diff,row.b||0), status=condition(row);
      const estShare=est?row.b/est*100:0,actShare=actual?row.a/actual*100:0;
      const type=row.id==='bills'?'ثابت':'متغير';
      const cause=row.b===0&&row.a>0?'بند غير مخطط':'غير محدد';
      const values=[[referenceLabel,referenceLink(row)],[actualLabel,actualLink(row)],
        ['الفرق','<span class="'+tone(row.diff)+'">'+signed(row.diff)+'</span>'],
        ['الانحراف',pct(ratio)],['الحالة',safe(status)],
        ['الحصة التقديرية',pct(estShare)],['الحصة الفعلية',pct(actShare)]];
      const mobile='<article class="bs-row-card" data-budget-category="'+safe(row.id)+'"><div class="bs-row-head"><strong>'+String(index+1)+'. '+safe(row.name)+'</strong><span class="'+tone(row.diff)+'">'+safe(status)+'</span></div><div class="bs-row-values">'+values.map(kv=>'<div><small>'+kv[0]+'</small><strong>'+kv[1]+'</strong></div>').join('')+'</div><small>النوع: '+type+' · السبب: '+cause+'</small></article>';
      const desktop='<tr data-budget-category="'+safe(row.id)+'"><th scope="row">'+number.format(index+1)+'. '+safe(row.name)+'</th><td>'+referenceLink(row)+'</td><td>'+actualLink(row)+'</td><td class="'+tone(row.diff)+'">'+signed(row.diff)+'</td><td>'+pct(ratio)+'</td><td>'+status+'</td><td>'+pct(estShare)+'</td><td>'+pct(actShare)+'</td><td>'+type+'</td><td>'+cause+'</td></tr>';
      return {mobile,desktop};
    });
    const totalRow='<tr><th scope="row">الإجمالي</th><td>'+fmt(est)+'</td><td><button class="bs-open-operations" type="button" data-period-series="actual" data-period-category="">'+fmt(actual)+'</button></td><td class="'+tone(variance)+'">'+signed(variance)+'</td><td>'+pct(totalPct)+'</td><td>'+ (est===0?'غير مخطط':totalPct>5?'تجاوز':totalPct< -5?'توفير':'ضمن الحد')+'</td><td>100%</td><td>100%</td><td>—</td><td>—</td></tr>';
    const table='<section class="bs-panel bs-full" id="cmpUnifiedTable" aria-label="جدول فروقات المقارنة"><h3>جدول الفروقات لكل بند</h3>'+
      '<div class="bs-table-wrap"><table class="bs-table"><thead><tr><th>البند</th><th>'+safe(referenceLabel)+'</th><th>'+safe(actualLabel)+'</th><th>الفرق</th><th>الانحراف</th><th>الحالة</th><th>حصة التقديري</th><th>حصة الفعلي</th><th>النوع</th><th>سبب الانحراف</th></tr></thead><tbody>'+tableRows.map(r=>r.desktop).join('')+'</tbody><tfoot>'+totalRow+'</tfoot></table></div>'+
      '<div class="bs-mobile-rows">'+tableRows.map(r=>r.mobile).join('')+'</div><p class="bs-note">اضغط على المبلغ الفعلي لعرض العمليات المفلترة. النسبة (—) تعني عدم وجود تقدير لهذا البند. سبب الانحراف غير محدد ما لم يُسجّل في البيانات.</p></section>';
    const max=Math.max(1,...sorted.map(row=>Math.max(row.a,row.b||0)));
    const plotW=Math.max(540,sorted.length*76+100),plotH=260,top=37,baseY=198;
    const columnWidth=18,slot=(plotW-85)/Math.max(sorted.length,1);
    let columnSvg='<svg class="bs-viz" role="img" aria-label="أعمدة التقديري والفعلي لكل بند" viewBox="0 0 '+plotW+' '+plotH+'" xmlns="http://www.w3.org/2000/svg">'+
      '<title>مقارنة الأعمدة المتجاورة</title><desc>الرمادي يمثل التقديري والأزرق يمثل الفعلي، والفرق موضح أعلى كل بند.</desc>'+
      '<path class="bs-grid-line" d="M 46 '+baseY+' H '+(plotW-16)+' M 46 '+(baseY-70)+' H '+(plotW-16)+' M 46 '+(baseY-140)+' H '+(plotW-16)+'"/>';
    sorted.forEach((row,i)=>{
      const center=50+slot*(i+.5),eh=(row.b||0)/max*140,ah=row.a/max*140;
      columnSvg+='<rect x="'+(center-20)+'" y="'+(baseY-eh)+'" width="'+columnWidth+'" height="'+eh+'" fill="'+palette.estimated+'"/>'+
        '<rect x="'+(center+2)+'" y="'+(baseY-ah)+'" width="'+columnWidth+'" height="'+ah+'" fill="'+palette.actual+'"/>'+
        '<text x="'+center+'" y="22" text-anchor="middle">'+(row.diff>0?'+':row.diff<0?'−':'')+money(Math.abs(row.diff))+'</text>'+
        '<text x="'+center+'" y="218" text-anchor="middle">'+safe(row.name.length>12?row.name.slice(0,11)+'…':row.name)+'</text>';
    });
    columnSvg+='</svg>';
    // Waterfall uses a truncated axis to make small month-end differences legible.
    const steps=[{name:'التقديري',value:est,total:true}], nonZero=sorted.filter(r=>r.diff!==0);
    nonZero.forEach(r=>steps.push({name:r.name,value:r.diff,total:false}));
    steps.push({name:'الفعلي',value:actual,total:true});
    let cumulative=est;
    const levels=[est];
    nonZero.forEach(r=>{cumulative+=r.diff;levels.push(cumulative)});
    const low=Math.min(...levels,actual),high=Math.max(...levels,actual);
    const margin=Math.max(1,(high-low)*.12),floor=Math.floor((low-margin)/10000)*10000;
    const ceil=Math.max(high+margin,floor+10000),vertical=value=>205-(value-floor)/(ceil-floor)*150;
    const stepW=Math.max(560,steps.length*76+50),pace=(stepW-90)/Math.max(steps.length,1);
    let waterfall='<svg class="bs-viz" role="img" aria-label="شلال الفروقات من التقديري إلى الفعلي" viewBox="0 0 '+stepW+' 258" xmlns="http://www.w3.org/2000/svg"><title>شلال فروقات الميزانية</title><desc>أعمدة تجاوز باللون الأحمر وتوفير باللون الأخضر، من إجمالي التقديري إلى الفعلي.</desc>';
    let running=est;
    steps.forEach((step,i)=>{
      const x=50+i*pace+pace*.25,w=Math.min(24,pace*.52),start=step.total?floor:running,end=step.total?step.value:running+step.value;
      const y=Math.min(vertical(start),vertical(end)),height=Math.max(1,Math.abs(vertical(start)-vertical(end)));
      const color=step.total?(i===0?palette.estimated:palette.actual):(step.value>0?palette.over:palette.save);
      waterfall+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+height+'" fill="'+color+'"/>'+
        '<text x="'+(x+w/2)+'" y="20" text-anchor="middle">'+(step.total?'':step.value>0?'+':'−')+money(Math.abs(step.value))+'</text>'+
        '<text x="'+(x+w/2)+'" y="236" text-anchor="middle">'+safe(step.name.length>11?step.name.slice(0,10)+'…':step.name)+'</text>';
      if(!step.total)running+=step.value;
      const next=i<steps.length-1?x+pace:w;
      if(i<steps.length-1)waterfall+='<line x1="'+(x+w)+'" x2="'+(x+pace)+'" y1="'+vertical(i===0?est:running)+'" y2="'+vertical(i===0?est:running)+'" stroke="currentColor" stroke-dasharray="3 4" opacity=".3"/>';
    });
    waterfall+='</svg>';
    const maxDelta=Math.max(1,...sorted.map(row=>Math.abs(row.diff)));
    const variances=[...sorted].sort((a,b)=>b.diff-a.diff);
    const variancesHtml=variances.map(row=>{
      const frac=Math.abs(row.diff)/maxDelta*50;
      const layout=row.diff>=0?'left:50%;width:'+frac+'%;background:'+palette.over:'right:50%;width:'+frac+'%;background:'+palette.save;
      return '<div class="bs-variance-row"><div class="bs-variance-label">'+safe(row.name)+'<div class="bs-variance-value '+tone(row.diff)+'">'+signed(row.diff)+' ('+pct(percentValue(row.diff,row.b||0))+')</div></div>'+
        '<div class="bs-track" dir="ltr"><i style="'+layout+'"></i></div></div>';
    }).join('');
    const stats='<div class="bs-statline"><div><small>إجمالي التقديري</small><strong>'+fmt(est)+'</strong></div><div><small>إجمالي الفعلي</small><strong>'+fmt(actual)+'</strong></div>'+
      '<div><small>الفرق الكلي</small><strong class="'+tone(variance)+'">'+signed(variance)+'</strong></div><div><small>نسبة الانحراف</small><strong class="'+tone(variance)+'">'+pct(totalPct)+'</strong></div></div>';
    const chart1Html = '<section class="bs-panel bs-full" id="cmpUnifiedColumns"><h3>1. الأعمدة المتجاورة</h3><div class="bs-legend"><span><i style="background:'+palette.estimated+'"></i> '+safe(referenceLabel)+'</span><span><i style="background:'+palette.actual+'"></i> '+safe(actualLabel)+'</span></div><div class="bs-plot-window" tabindex="0" aria-label="مخطط أعمدة قابل للسحب">'+columnSvg+'</div><p class="bs-note">القيم أعلى كل بند هي الفروق الموقعة. المحور يبدأ من الصفر.</p>'+ chartExplanation("مقارنة مباشرة بين مبالغ الصرف الفعلي والموازنة التقديرية (أو الفترة المرجعية) لكل بند جنبًا إلى جنب.", "العمود الأزرق الفاتح يمثل التقديري والعمود الأخضر المزرق يمثل الفعلي؛ الرقم أعلى كل زوج يوضح صافي الفرق (الموجب وفر والسالب تجاوز).") +'</section>';
    const chart2Html = '<section class="bs-panel bs-full" id="cmpUnifiedWaterfall"><h3>2. شلال الفروقات</h3><div class="bs-plot-window" tabindex="0" aria-label="شلال قابل للسحب">'+waterfall+'</div><p class="bs-note">يبدأ محور القيمة المعروض من '+fmt(floor)+' ج.م، لتوضيح الفروق الصغيرة. البنود بلا تغير تظل في الجدول.</p>'+ chartExplanation("مسار تراكمي يوضح كيف تحولت الموازنة التقديرية إلى الصرف الفعلي الإجمالي عبر تأثير كل بند.", "يبدأ بعمود التقديري؛ الأعمدة الحمراء تمثل مبالغ التجاوز الخصمية والأعمدة الخضراء تمثل الوفورات حتى نصل لعمود الفعلي النهائي.") +'</section>';
    const chart3Html = '<section class="bs-panel bs-full" id="cmpUnifiedVariance"><h3>3. أعمدة الانحراف</h3><p class="bs-note">التجاوز إلى اليمين، والتوفير إلى اليسار؛ الترتيب حسب قيمة الانحراف.</p>'+variancesHtml+ chartExplanation("تحديد دقيق لحجم واتجاه انحراف كل بند عن خط الميزانية المخطط مرتبًا تنازليًا.", "الخط الرأسي هو نقطة الصفر؛ الأشرطة الحمراء المتجهة لليمين تعني تجاوزًا والأشرطة الخضراء المتجهة لليسار تعني وفرًا وادخارًا.") +'</section>';

    const advancedCharts = buildBudgetReferenceAdvancedCharts(sorted, totals, range, opts);
    _currentChartsMap = {
      1: chart1Html,
      2: chart2Html,
      3: chart3Html,
      ...advancedCharts
    };

    const activeMeta = CHARTS_DECK_META[activeChartTab - 1] || CHARTS_DECK_META[0];
    const chartDeckHtml = `
      <section class="cmp-charts-deck bs-full" id="cmpChartsDeck">
        <div class="cmp-deck-header">
          <div class="cmp-deck-title">
            <i class="fa-solid ${activeMeta.icon}"></i>
            <span id="cmpActiveChartTitle">${activeMeta.fullName}</span>
          </div>
          <button type="button" class="cmp-deck-collapse-btn" onclick="BudgetCompareEngine.toggleChartDeck()" title="طي أو توسيع عرض الرسم البياني">
            <i id="cmpDeckToggleIcon" class="fa-solid ${isChartDeckCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}"></i>
            <span id="cmpDeckToggleLabel">${isChartDeckCollapsed ? 'عرض الرسم' : 'طي الرسم'}</span>
          </button>
        </div>
        <div class="cmp-deck-tabs-strip" role="tablist" aria-label="اختيار الرسم البياني">
          ${CHARTS_DECK_META.map(m => {
            const isActive = (m.id === activeChartTab);
            return `
              <button type="button" 
                      role="tab" 
                      class="cmp-deck-tab ${isActive ? 'active' : ''}" 
                      aria-selected="${isActive}" 
                      onclick="BudgetCompareEngine.selectChartTab(${m.id})" 
                      title="${m.tip}">
                <span class="cmp-tab-num">${m.id}</span>
                <span class="cmp-tab-name">${m.name}</span>
              </button>
            `;
          }).join('')}
        </div>
        <div class="cmp-deck-stage ${isChartDeckCollapsed ? 'is-collapsed' : ''}" id="cmpDeckStage">
          ${_currentChartsMap[activeChartTab] || ''}
        </div>
      </section>
    `;

    content.innerHTML='<div class="budget-spec" data-cmp-reference="'+safe(opts.reference||'plan')+'"><p class="bs-intro">مقارنة '+safe(actualLabel)+' مع '+safe(referenceLabel)+' · '+safe(range.from)+' إلى '+safe(range.to)+'</p>'+stats+
      '<div class="bs-grid">'+chartDeckHtml+table+'</div></div>';
  }

  // Five additional views generated for the compact chart deck
  function buildBudgetReferenceAdvancedCharts(rows,totals,range,opts={}) {
    const numberFmt=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
    const cash=value=>numberFmt.format(Math.round(value/100));
    const text=value=>escapeHtml(String(value));
    const signed=value=>(value>0?'+':value<0?'−':'')+cash(Math.abs(value));
    const pct=(actual,estimated)=>estimated>0
      ?(actual-estimated>0?'+':actual-estimated<0?'−':'')+Math.abs(Math.round((actual-estimated)/estimated*100))+'%'
      :'—';
    const sorted=[...rows];
    const colorById={food:'#2a78d6',education:'#eb6834',transport:'#1baf7a',
      leisure:'#eda100',bills:'#e87ba4',health:'#008300',daily:'#8b5cf6',
      house:'#0d9488',clothes:'#c2410c',other:'#64748b'};
    const color=id=>colorById[id]||('#'+(0x666666+String(id).split('').reduce((sum,c)=>sum+c.charCodeAt(0)*173,0)%0x777777).toString(16).padStart(6,'0'));
    if(!byId('budgetSpecAdvancedStyle')){
      const style=document.createElement('style');style.id='budgetSpecAdvancedStyle';
      style.textContent=[
        '.budget-spec .bs-bullet-row{display:grid;grid-template-columns:minmax(80px,1fr) minmax(0,2fr) auto;align-items:center;gap:8px;margin:12px 0;font-size:12px}',
        '.budget-spec .bs-bullet-track{height:18px;position:relative;border-radius:3px;overflow:visible;background:linear-gradient(to right,#2563EB2e 0 50%,#DC26262a 50% 100%)}',
        '.budget-spec .bs-bullet-track::after{content:"";position:absolute;left:var(--target);top:-3px;bottom:-3px;border-left:2px solid currentColor}',
        '.budget-spec .bs-bullet-track>i{position:absolute;top:4px;bottom:4px;left:0;background:#0D9488;max-width:100%;display:block}',
        '.budget-spec .bs-heat-row{display:grid;grid-template-columns:minmax(85px,1.2fr) repeat(var(--months),minmax(0,1fr));align-items:center;gap:3px;margin:3px 0}',
        '.budget-spec .bs-heat-row>span{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
        '.budget-spec .bs-heat-cell{display:grid;place-items:center;min-height:34px;border-radius:4px;text-align:center;font-size:12px;font-weight:800;color:inherit}',
        '.budget-spec .bs-heat-mobile{display:none}.budget-spec .bs-heat-month{margin:8px 0 12px;border-bottom:1px solid var(--border-color,#cbd5e1);padding-bottom:6px}',
        '.budget-spec .bs-heat-month-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}',
        '.budget-spec .bs-heat-month-item{padding:5px;border-radius:6px;font-size:12px;min-width:0;overflow-wrap:anywhere}',
        '.budget-spec .bs-stacked-bars{display:grid;gap:12px}',
        '.budget-spec .bs-stack{display:flex;direction:ltr;width:100%;height:36px;overflow:hidden;border-radius:5px;border:1px solid var(--border-color,#cbd5e1)}',
        '.budget-spec .bs-stack>div{height:100%;min-width:0;position:relative;opacity:.95}',
        '.budget-spec .bs-stack-label{display:flex;gap:6px;justify-content:space-between;font-size:12px}',
        '.budget-spec .bs-stack-key{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 10px;margin-top:12px}',
        '.budget-spec .bs-stack-key>span{font-size:12px}',
        '.budget-spec .bs-stack-key i{display:inline-block;width:12px;height:12px;vertical-align:middle}',
        '.budget-spec .bs-cumulative-legend{display:flex;gap:12px;justify-content:center;font-size:12px;flex-wrap:wrap}',
        '.budget-spec .bs-slope-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:8px;align-items:center;margin:8px 0;padding-bottom:6px;border-bottom:1px dashed var(--border-color,#cbd5e1)}',
        '.budget-spec .bs-slope-visual{position:relative;height:30px;background:linear-gradient(to right,transparent 0 2%,#2563EB26 2% 3%,transparent 3% 96%,#2563EB26 96% 97%,transparent 97%);min-width:0}',
        '.budget-spec .bs-slope-visual svg{width:100%;height:30px;display:block}',
        '.budget-spec .bs-slope-amounts{font-size:12px;display:flex;justify-content:space-between;direction:ltr;gap:5px}',
        '@media(max-width:600px){.budget-spec .bs-heat-desktop{display:none}.budget-spec .bs-heat-mobile{display:block}.budget-spec .bs-bullet-row{grid-template-columns:minmax(70px,1fr) minmax(0,1.6fr) auto;gap:4px}.budget-spec .bs-stack-key{gap:4px}.budget-spec .bs-slope-row{grid-template-columns:minmax(90px,1fr) minmax(0,1.35fr)}}'
      ].join('\n');document.head.append(style);
    }
    // 4. Bullet chart
    const topRatio=Math.max(0,...sorted.map(r=>r.b>0?r.a/r.b*100:0));
    const axisMax=Math.max(200,Math.ceil(topRatio/50)*50);
    const bullet=sorted.map(row=>{
      const ratio=row.b>0?Math.min(axisMax,row.a/row.b*100):0;
      return '<div class="bs-bullet-row"><span>'+text(row.name)+'</span>'+
        '<div class="bs-bullet-track" dir="ltr" style="--target:'+(100/axisMax*100)+'%"><i style="width:'+(ratio/axisMax*100)+'%"></i></div>'+
        '<strong dir="ltr">'+(row.b?pct(row.a,row.b):'—')+'</strong></div>';
    }).join('');
    const bulletLegend='<p class="bs-note">الخط الرأسي عند 100% هو المرجع المحدد، والشريط الأزرق يمثل الفعلي. المقياس من 0% إلى '+axisMax+'%.</p>';
    const chart4Html = '<section class="bs-panel"><h3>4. مخطط الرصاصة: الفعلي والمرجع</h3>'+bullet+bulletLegend+chartExplanation("مؤشر رقابي يقيس نسبة استهلاك سقف الميزانية لكل بند مقارنة بالحد الأقصى (100%).", "الخط الرأسي عند 100% يمثل السقف المحدد، والشريط الأزرق يعبر عن الفعلي؛ تخطي الشريط للخط يعني تجاوز المخصص المالي.")+'</section>';

    // 5. Cumulative
    const baseRange=opts.baseline||range;
    const n=Math.min(6,dateDiffDays(range.from,range.to),dateDiffDays(baseRange.from,baseRange.to));
    const divide=(period,count)=>{
      const start=Date.parse(period.from+'T00:00:00Z');
      const days=dateDiffDays(period.from,period.to);
      return Array.from({length:count},(_,i)=>{
        const first=Math.floor(days*i/count),last=Math.floor(days*(i+1)/count)-1;
        const day=k=>new Date(start+k*86400000).toISOString().slice(0,10);
        return {from:day(first),to:day(last)};
      });
    };
    const referenceAmounts=period=>{
      if(opts.reference==='plan')return estimatesForRange(period).values;
      if(isSampleBudget(opts.reference)){
        const totals=new Map();
        for(const {days,first,last} of monthSlices(period)){
          for(const [id,cents] of sampleAmounts(opts.reference))
            totals.set(id,(totals.get(id)||0)+prorate(cents,days,first,last));
        }
        return totals;
      }
      return aggregate(expensesForRange(period));
    };
    const primarySlices=divide(range,n),referenceSlices=divide(baseRange,n);
    const monthly=primarySlices.map((period,i)=>{
      const a=aggregate(expensesForRange(period));
      const b=referenceAmounts(referenceSlices[i]);
      const sum=map=>[...map.values()].reduce((acc,x)=>acc+x,0);
      const label=period.from===period.to?period.from.slice(5):(period.from.slice(5)+'–'+period.to.slice(5));
      return {key:label,actual:a,estimated:b,sumA:sum(a),sumB:sum(b)};
    });
    if(monthly.length){
      const last=monthly[monthly.length-1];
      last.sumA+=(totals.a||0)-monthly.reduce((v,m)=>v+m.sumA,0);
      last.sumB+=(totals.b||0)-monthly.reduce((v,m)=>v+m.sumB,0);
    }
    const cumA=[],cumB=[];let runningA=0,runningB=0;
    monthly.forEach(m=>{runningA+=m.sumA;runningB+=m.sumB;cumA.push(runningA);cumB.push(runningB)});
    const top=Math.max(1,...cumA,...cumB),width=620,height=245;
    const x=i=>monthly.length===1?width/2:55+i*(width-100)/(monthly.length-1);
    const y=value=>190-value/top*150;
    const points=series=>series.map((v,i)=>x(i)+','+y(v)).join(' ');
    let cum='<svg class="bs-viz" role="img" aria-label="الخطان التراكميان: التقديري والفعلي" viewBox="0 0 '+width+' '+height+'" xmlns="http://www.w3.org/2000/svg">'+
      '<title>التراكم عبر الفترتين المختارتين</title><desc>خط رمادي متقطع للتقديري وخط أزرق متصل للفعلي؛ الأحمر لتجاوز التقديري والأخضر للتوفير.</desc>'+
      '<path class="bs-grid-line" d="M55 190 H565 M55 115 H565 M55 40 H565"/>';
    for(let i=1;i<monthly.length;i++){
      const fill=cumA[i]>=cumB[i]?'#DC2626':'#16A34A';
      cum+='<polygon points="'+x(i-1)+','+y(cumA[i-1])+' '+x(i)+','+y(cumA[i])+' '+x(i)+','+y(cumB[i])+' '+x(i-1)+','+y(cumB[i-1])+'" fill="'+fill+'" opacity=".16"/>';
    }
    cum+='<polyline points="'+points(cumB)+'" fill="none" stroke="#2563EB" stroke-width="2" stroke-dasharray="5 4"/>'+
      '<polyline points="'+points(cumA)+'" fill="none" stroke="#0D9488" stroke-width="2"/>';
    monthly.forEach((m,i)=>{cum+='<text x="'+x(i)+'" y="215" text-anchor="middle">'+text(i+1)+'</text>';});
    cum+='</svg><div class="bs-cumulative-legend"><span>المرجع: <bdi dir="ltr">'+cash(runningB)+'</bdi></span><span>الفعلي: <bdi dir="ltr">'+cash(runningA)+'</bdi></span><span>الفجوة: <bdi dir="ltr">'+signed(runningA-runningB)+'</bdi></span></div>';
    const chart5Html = '<section class="bs-panel"><h3>5. التراكم عبر الفترات المختارة</h3>'+cum+chartExplanation("تتبع وتيرة الصرف التراكمي خطوة بخطوة ومقارنته بالمسار المستهدف طوال المدة.", "الخط المتقطع هو المرجع والخط المتصل هو الفعلي؛ المساحة الخضراء بينهما وفر والمساحة الحمراء تعني تسارع الإنفاق فوق المخطط.")+'</section>';

    // 6. Diverging heatmap
    const heat=(row,month)=>{
      const a=month.actual.get(row.id)||0,b=month.estimated.get(row.id)||0;
      const v=b?(a-b)/b*100:null,abs=Math.abs(v||0);
      const opacity=v===null?.18:abs===0?.15:abs<5?.2:abs<15?.4:abs<30?.62:.85;
      const shade=v===null?'#2563EB':v>0?'#DC2626':v<0?'#16A34A':'#2563EB';
      const label=v===null?'—':(v>0?'+':v<0?'−':'')+Math.round(abs)+'%';
      return {style:'background:color-mix(in srgb,'+shade+' '+Math.round(opacity*100)+'%, transparent)',label};
    };
    let heatGrid='<div class="bs-heat-desktop"><div class="bs-heat-row" style="--months:'+monthly.length+'"><span>البند / الشهر</span>'+monthly.map(m=>'<span dir="ltr">'+text(m.key)+'</span>').join('')+'</div>';
    sorted.forEach(row=>{
      heatGrid+='<div class="bs-heat-row" style="--months:'+monthly.length+'"><span>'+text(row.name)+'</span>'+
        monthly.map(m=>{const h=heat(row,m);return '<div class="bs-heat-cell" style="'+h.style+'" dir="ltr">'+h.label+'</div>'}).join('')+'</div>';
    });
    heatGrid+='</div><div class="bs-heat-mobile">'+monthly.map(m=>'<div class="bs-heat-month"><strong dir="ltr">'+text(m.key)+'</strong><div class="bs-heat-month-list">'+
      sorted.map(row=>{const h=heat(row,m);return '<div class="bs-heat-month-item" style="'+h.style+'">'+text(row.name)+' <bdi dir="ltr">'+h.label+'</bdi></div>'}).join('')+
      '</div></div>').join('')+'</div>';
    const chart6Html = '<section class="bs-panel bs-full"><h3>6. الخريطة الحرارية للفترتين</h3>'+heatGrid+
      '<p class="bs-note">الأحمر للتجاوز، الأخضر للتوفير، والرمادي للصفر أو البند غير المخطط. شدة اللون تعكس حجم الانحراف.</p>'+chartExplanation("مصفوفة بصرية لتقييم انحرافات كل بند عبر الفترات لاكتشاف البنود المتكررة في العجز أو الوفر.", "اللون الأحمر يعني تجاوزًا والأخضر وفرًا؛ ودرجة تركيز اللون تعبر عن شدة الانحراف بالنسبة المئوية.")+'</section>';

    // 7. Stacked 100%
    function apportion(values){
      const total=values.reduce((s,v)=>s+v,0);if(!total)return values.map(()=>0);
      const shares=values.map(v=>v/total*100),whole=shares.map(Math.floor);
      const ranked=shares.map((v,i)=>({i,frac:v-whole[i]})).sort((a,b)=>b.frac-a.frac||a.i-b.i);
      let remainder=100-whole.reduce((s,v)=>s+v,0);
      for(let i=0;i<remainder;i++)whole[ranked[i].i]++;
      return whole;
    }
    const partsEst=apportion(sorted.map(r=>r.b||0)),partsAct=apportion(sorted.map(r=>r.a||0));
    const bar=(values,label)=>'<div><div class="bs-stack-label"><strong>'+label+'</strong><span dir="ltr">'+values.join(' / ')+'%</span></div><div class="bs-stack" role="img" aria-label="'+label+' وحصص البنود" dir="ltr">'+
      values.map((v,i)=>'<div title="'+text(sorted[i].name)+' '+v+'%" style="width:'+v+'%;background:'+color(sorted[i].id)+'"></div>').join('')+'</div></div>';
    const chart7Html = '<section class="bs-panel"><h3>7. المكدس النسبي 100%</h3><div class="bs-stacked-bars">'+bar(partsEst,'التقديري')+
      bar(partsAct,'الفعلي')+'</div><div class="bs-stack-key">'+sorted.map((r,i)=>'<span><i style="background:'+color(r.id)+'"></i> '+text(r.name)+': <bdi dir="ltr">'+partsEst[i]+'% / '+partsAct[i]+'%</bdi></span>').join('')+'</div><p class="bs-note">النسب صحيحة ومجموع كل شريط 100% بطريقة أكبر باقي.</p>'+chartExplanation("توزيع حصص البنود كنسبة مئوية من إجمالي الإنفاق (100%) لمقارنة الأولويات المخططة بالفعلية.", "الشريط الأول يمثل التقديري والثاني الفعلي؛ اتساع أو ضيق حصة البند بين الشريطين يوضح تغير نمط الصرف بطريقة أكبر باقي.")+'</section>';

    // 8. Slope
    const slopeMax=Math.max(1,...sorted.flatMap(r=>[r.a,r.b||0]));
    const slope=sorted.map(row=>{
      const y1=25-(row.b||0)/slopeMax*18,y2=25-row.a/slopeMax*18,stroke=row.diff>0?'#DC2626':row.diff<0?'#16A34A':'#2563EB';
      return '<div class="bs-slope-row"><strong>'+text(row.name)+'</strong><div>'+
      '<div class="bs-slope-amounts"><bdi dir="ltr">'+cash(row.b||0)+'</bdi><bdi dir="ltr">'+cash(row.a)+'</bdi></div>'+
      '<div class="bs-slope-visual"><svg viewBox="0 0 180 30" role="img" aria-label="'+text(row.name)+' من '+cash(row.b||0)+' إلى '+cash(row.a)+'"><line x1="7" y1="'+y1+'" x2="173" y2="'+y2+'" stroke="'+stroke+'" stroke-width="2"/><circle cx="7" cy="'+y1+'" r="3" fill="'+stroke+'"/><circle cx="173" cy="'+y2+'" r="3" fill="'+stroke+'"/></svg></div></div></div>';
    }).join('');
    const chart8Html = '<section class="bs-panel"><h3>8. مخطط الميل</h3><div class="bs-slope-amounts"><strong>التقديري</strong><strong>الفعلي</strong></div>'+
      slope+'<p class="bs-note">جميع البنود بمقياس واحد، والأحمر للارتفاع والأخضر للانخفاض. المبالغ بالجنيه المصري.</p>'+chartExplanation("مخطط اتجاهي يوضح سرعة وزاوية صعود أو هبوط تكلفة كل بند بين الفترتين بمقياس موحد.", "الخط الصاعد بالأحمر يعني زيادة في التكلفة والخط الهابط بالأخضر يعني انخفاضًا وترشيدًا بالجنيه المصري.")+'</section>';

    return { 4: chart4Html, 5: chart5Html, 6: chart6Html, 7: chart7Html, 8: chart8Html };
  }


  function render() {
    const root = byId('cmpPeriodChart');
    if (!root) return;
    const reference = byId('cmpPeriodReference').value;
    const isPlan = reference === 'plan';
    const isSample = isSampleBudget(reference);
    const budgetReference = isPlan || isSample;
    const range = getNavigationRange();
    const refDates = datePair('cmpPeriod');
    const estimDates = datePair('cmpEstim');
    const baseDates = datePair('cmpActual');
    const renderLabel = (id, pair, fallback) => {
      byId(id).textContent = validRange(pair) ? pair.from + ' إلى ' + pair.to : fallback;
    };
    renderLabel('cmpActualCustomRangeLabel', baseDates, 'نطاق التواريخ');
    renderLabel('cmpPeriodCustomRangeLabel', refDates, 'نطاق المرجع');
    renderLabel('cmpEstimCustomRangeLabel', estimDates, 'تاريخ الموازنة');
    if (byId('cmpActualCustomRange')) byId('cmpActualCustomRange').hidden = _actualPeriod !== 'custom';
    if (byId('cmpPeriodCustom')) byId('cmpPeriodCustom').hidden = reference !== 'custom';
    if (byId('cmpEstimCustomRange')) byId('cmpEstimCustomRange').hidden = !isPlan;
    if (byId('cmpSampleActions')) byId('cmpSampleActions').hidden = true;
    if (byId('cmpDataMode')) byId('cmpDataMode').style.display = 'none';
    const status = byId('cmpSampleStatus');
    const scope = [reference,range.from,range.to].join(':');
    if (status.dataset.scope !== scope) {
      status.textContent = '';
      status.dataset.scope = scope;
    }
    const primaryReady = validRange(range) && (_actualPeriod !== 'custom' || validRange(baseDates));
    const planOverride = isPlan && Boolean(estimDates.from || estimDates.to);
    const baseline = reference === 'custom' ? refDates : planOverride ? estimDates :
      reference === 'previous' && primaryReady ? previousRange(range) : range;
    const rule = reference === 'custom' ? 'نطاق مستقل' : planOverride ? 'نطاق موازنة مستقل' : budgetReference ? 'نفس تواريخ الأساسية' :
      _actualPeriod === 'thisMonth' ? 'الجزء المقابل من الشهر السابق' :
      _actualPeriod === 'lastMonth' ? 'الشهر الذي يسبقه كاملًا' :
      _actualPeriod === 'thisWeek' ? 'نفس أيام الأسبوع السابق' :
      _actualPeriod === 'lastWeek' ? 'الأسبوع الذي يسبقه كاملًا' :
      _actualPeriod === 'thisYear' ? 'الجزء المقابل من السنة السابقة' :
      _actualPeriod === 'today' || _actualPeriod === 'yesterday' ? 'اليوم الذي يسبقه' : 'نطاق سابق بنفس عدد الأيام';
    const notSet = {from:'',to:''};
    renderRangePreview('cmpPrimaryDates',primaryReady ? range : notSet,'التواريخ المختارة');
    renderRangePreview('cmpReferenceDates',primaryReady || reference === 'custom' || planOverride ? baseline : notSet,rule,
      reference === 'custom' || planOverride ? 'اختر تواريخ المرجع' : 'يتحدد بعد اختيار الأساسية');
    byId('cmpRestoreDateLink').hidden = !planOverride;
    const content = byId('cmpPeriodChartContent');
    const summary = byId('cmpSummary');
    const details = byId('cmpInsightDetails');
    const viewTools = root.querySelector('.cmp-view-tools');
    const ready = primaryReady && validRange(baseline);
    viewTools.hidden = details.hidden = !ready;
    root.onclick = event => {
      const mode = event.target.closest('button[data-mode]');
      if (mode) {
        periodChartMode = mode.dataset.mode;
        render();
        return;
      }
      const button = event.target.closest('button[data-period-series]');
      if (!button || !ready) return;
      const {periodSeries, periodCategory} = button.dataset;
      const fromReference = periodSeries === 'reference';
      const selected = fromReference ? baseline : range;
      if (fromReference && isSample) {
        openSampleOperations(button);
      } else if (demoMode) {
        openSampleLedger('sample-spend', selected, button);
      } else {
        window.BudgetDrilldownHub?.open({
          source:'compare', originNode:button, ...selected, category:periodCategory,
          label:periodCategory ? categoryName(periodCategory) : 'إجمالي المصروفات',
          originSelector:periodButtonSelector(periodSeries,periodCategory)
        });
      }
    };
    root.querySelectorAll('button[data-mode]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.mode === periodChartMode)));
    if (!ready) {
      summary.textContent = 'اختر تاريخ البداية والنهاية للفترة المطلوبة.';
      content.replaceChildren();
      return;
    }
    const actualEntries = expensesForRange(range);
    const actual = aggregate(actualEntries);
    let referenceAmounts;
    let comparable = true;
    if (isPlan) {
      const result = estimatesForRange(baseline);
      referenceAmounts = result.values;
      comparable = result.missing.length === 0;
    } else if (isSample) {
      referenceAmounts = new Map();
      for (const {days,first,last} of monthSlices(baseline)) {
        for (const [category,cents] of sampleAmounts(reference)) {
          referenceAmounts.set(category,(referenceAmounts.get(category) || 0) + prorate(cents,days,first,last));
        }
      }
    } else {
      referenceAmounts = aggregate(expensesForRange(baseline));
    }
    const baseLabel = demoMode ? 'صرف تجريبي' : 'صرف فعلي';
    const refLabel = isSample ? sampleProfiles[reference].label : isPlan ? 'الموازنة المسجلة' :
      reference === 'previous' ? 'الفترة السابقة' : 'الفترة المخصصة';
    const categories = new Set([...EXPENSE_CATEGORIES.map(category => category.id),
      ...actual.keys(), ...(comparable ? referenceAmounts.keys() : [])]);
    const rows = [...categories].map(id => {
      const a = actual.get(id) || 0;
      const b = comparable ? (referenceAmounts.get(id) || 0) : null;
      return {id, name:categoryName(id), a, b, diff:comparable ? a-b : 0};
    });
    const sort = byId('cmpSort').value;
    const byName = (a,b) => a.name.localeCompare(b.name,'ar');
    rows.sort((a,b) => sort === 'name' ? byName(a,b) :
      (sort === 'spend' ? b.a-a.a : Math.abs(b.diff)-Math.abs(a.diff)) || b.a-a.a || byName(a,b));
    const total = rows.reduce((sum,row) => ({a:sum.a+row.a,b:sum.b+(row.b || 0)}), {a:0,b:0});
    const bTotal = comparable ? total.b : null;
    const showValue = (row,key) => valueMarkup(key === 'a' ? 'actual':'reference',row.id,row[key],key === 'a' || !isPlan);
    const days = dateDiffDays(range.from,range.to);
    const referenceDays = dateDiffDays(baseline.from,baseline.to);
    const timing = days === referenceDays ? '' : ' · الأساسية ' + number.format(days) + ' يوم، والمرجع ' + number.format(referenceDays) + ' يوم';
    // Four shared summary cards stay in sync with the selected comparison periods.
    const diff=bTotal===null?null:total.a-bTotal;
    const changePct=bTotal>0?(diff/bTotal*100):null;
    const deltaTone=diff===null?'slate':diff>0?'red':diff<0?'green':'slate';
    const percentLabel=changePct===null?'—':(changePct>0?'+':changePct<0?'−':'')+Math.abs(changePct).toFixed(1)+'%';
    summary.innerHTML='<div class="cmp-unified-summary">'+
      '<div class="cmp-unified-kpi" data-tone="blue"><small>'+escapeHtml(baseLabel)+'</small><strong>'+
        valueMarkup('actual','',total.a,true)+'</strong></div>'+
      '<div class="cmp-unified-kpi" data-tone="slate"><small>'+escapeHtml(refLabel)+'</small><strong>'+
        valueMarkup('reference','',bTotal,!isPlan)+'</strong></div>'+
      '<div class="cmp-unified-kpi" data-tone="'+deltaTone+'"><small>الفرق (الفعلي − المرجع)</small><strong>'+
        (diff===null?'—':'<bdi dir="ltr">'+signedMoney(diff)+'</bdi>')+'</strong></div>'+
      '<div class="cmp-unified-kpi" data-tone="'+deltaTone+'"><small>نسبة التغير</small><strong><bdi dir="ltr">'+percentLabel+'</bdi></strong></div>'+
      '</div><p class="cmp-difference-hint">'+
      (comparable?'المبالغ بالجنيه المصري'+timing:
        'لا توجد موازنة مسجلة لكل أشهر نطاق المرجع. اختر فترة تغطيها الموازنة.')+'</p>';
    renderInsights(rows,actualEntries.length,total.a,range,comparable);
    if (!rows.length) {
      content.textContent = 'لا توجد مصروفات أو بنود للمقارنة في النطاق المحدد.';
      return;
    }
    const referenceLabel = isPlan || isSample ? 'التقديري' : refLabel;
    const actualLabel = demoMode ? 'الصرف التجريبي' : 'الصرف الفعلي';
    const rankedName = (row, index) => '<span class="cmp-rank">' + number.format(index + 1) + '</span> ' + escapeHtml(row.name);
    if (comparable && periodChartMode === 'table') {
      renderBudgetReferenceSpecification(content,rows,total,range,{
        reference,baseline,referenceLabel:refLabel,actualLabel:baseLabel
      });
      return;
    }
    if (periodChartMode === 'table') {
      const tableRows = rows.map((row,index) => {
        const tone = row.diff > 0 ? 'cmp-rise' : row.diff < 0 ? 'cmp-fall' : '';
        return '<tr data-budget-category="' + escapeHtml(row.id) + '"><th scope="row">' + rankedName(row,index) +
          '</th><td class="cmp-series-actual">' + showValue(row,'a') +
          '</td><td class="cmp-series-reference">' + showValue(row,'b') +
          '</td><td class="cmp-difference ' + tone + '"><bdi dir="ltr">' + (comparable ? signedMoney(row.diff) : '—') +
          '</bdi></td><td class="' + tone + '"><bdi dir="ltr">' + differencePercent(row.diff,row.b) + '</bdi></td></tr>';
      }).join('');
      content.innerHTML = '<div class="cmp-period-table cmp-ranked-table"><table aria-label="مقارنة البنود بالجنيه المصري"><thead><tr>' +
        '<th scope="col">البند</th><th scope="col" class="cmp-key-actual">' + actualLabel +
        '</th><th scope="col" class="cmp-key-reference">' + referenceLabel +
        '</th><th scope="col">الفرق</th><th scope="col">التغيّر ٪</th></tr></thead><tbody id="cmpTableBody">' + tableRows + '</tbody></table></div>';
      return;
    }
    if (periodChartMode === 'paired') {
      const max = rows.reduce((limit,row) => Math.max(limit,row.a,row.b ?? 0),0);
      const min = rows.reduce((limit,row) => Math.min(limit,row.a,row.b ?? 0),0);
      const span = Math.max(1,max-min);
      const zero = -min / span * 100;
      const chartRows = rows.map((row,index) => {
        const bar = (key,series) => '<div class="cmp-column-' + series + '">' +
          (row[key] ? '<i style="--start:' + (Math.min(0,row[key])-min) / span * 100 +
            '%;--height:' + Math.abs(row[key]) / span * 100 + '%"></i>' : '') + '</div>';
        return '<li data-budget-category="' + escapeHtml(row.id) + '"><div class="cmp-period-track cmp-column-plot" aria-hidden="true">' +
          bar('a','actual') + bar('b','reference') + '</div><div class="cmp-column-values"><span class="cmp-series-actual" title="' +
          actualLabel + '">' + showValue(row,'a') + '</span><span class="cmp-series-reference" title="' +
          referenceLabel + '">' + showValue(row,'b') + '</span></div><strong>' + rankedName(row,index) + '</strong></li>';
      }).join('');
      content.innerHTML = '<div class="cmp-scale-key"><span class="cmp-key-actual">' + actualLabel +
        '</span><span class="cmp-key-reference">' + referenceLabel +
        '</span></div><ul class="cmp-column-chart" style="--zero:' + zero + '%">' + chartRows + '</ul>';
      return;
    }
    const maxDelta = rows.reduce((max,row) => Math.max(max,Math.abs(row.diff)),1);
    const markup = rows.map((row,index) => {
      const delta = !comparable ? '' : '<div class="cmp-period-delta" aria-hidden="true"><i class="' +
        (row.diff < 0 ? 'negative':'positive') + '" style="width:' + Math.abs(row.diff) / maxDelta * 50 + '%"></i></div>';
      const values = '<div class="cmp-change-values"><span class="cmp-series-actual">' + actualLabel + ' ' + showValue(row,'a') +
        '</span><span class="cmp-series-reference">' + referenceLabel + ' ' + showValue(row,'b') + '</span></div>';
      return '<li data-budget-category="' + escapeHtml(row.id) + '"><div class="cmp-period-row-heading"><strong>' + rankedName(row,index) +
        '</strong></div><div class="cmp-difference">' + changeMarkup(row.a,row.b,budgetReference) + '</div>' + delta + values + '</li>';
    }).join('');
    const directionKey = !comparable ? '' :
      '<div class="cmp-direction-key" dir="ltr"><span class="cmp-fall">أقل من المرجع</span><span>صفر</span><span class="cmp-rise">أعلى من المرجع</span></div>';
    content.innerHTML = directionKey + '<ul class="cmp-period-bars">' + markup + '</ul>';
  }

  function showAllCharts() {
    periodChartMode = 'table';
    isChartDeckCollapsed = false;
    render();
    const deck = byId('cmpChartsDeck');
    if (deck) {
      const stage = byId('cmpDeckStage');
      if (stage) stage.classList.remove('is-collapsed');
      const btnIcon = document.getElementById('cmpDeckToggleIcon');
      const btnLabel = document.getElementById('cmpDeckToggleLabel');
      if (btnIcon && btnLabel) {
        btnIcon.className = 'fa-solid fa-chevron-up';
        btnLabel.textContent = 'طي الرسم';
      }
      deck.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function renderReferenceInto(container,month) {
    if(!container||!/^\d{4}-\d{2}$/.test(String(month||'')))return false;
    const [year,mon]=month.split('-').map(Number);
    const range={from:month+'-01',to:month+'-'+pad(new Date(year,mon,0).getDate())};
    const entries=(state.transactions||[]).filter(tx=>tx.type==='expense'&&
      String(tx.date||'').slice(0,10)>=range.from&&String(tx.date||'').slice(0,10)<=range.to)
      .map(tx=>({id:tx.category||'other',cents:Math.round((Number(tx.amount)||0)*100)}));
    const actualAmounts=aggregate(entries);
    const planAmounts=estimatesForRange(range);
    if(planAmounts.missing.length){
      container.innerHTML='<p class="bs-error" role="status">لا توجد بيانات تقديرية مسجلة لهذا الشهر.</p>';
      return false;
    }
    const allIds=new Set([...EXPENSE_CATEGORIES.map(c=>c.id),...actualAmounts.keys(),...planAmounts.values.keys()]);
    const rows=[...allIds].map(id=>{
      const a=actualAmounts.get(id)||0,b=planAmounts.values.get(id)||0;
      return {id,name:categoryName(id),a,b,diff:a-b};
    });
    const totals=rows.reduce((sum,row)=>({a:sum.a+row.a,b:sum.b+row.b}),{a:0,b:0});
    const wasDemo=demoMode;
    try{
      demoMode=false;
      renderBudgetReferenceSpecification(container,rows,totals,range);
    }finally{demoMode=wasDemo;}
    return true;
  }

  return {
    render, showAllCharts, renderReferenceInto, onActualPeriodChange, getNavigationRange, selectReference, recordSampleOperations, usePrimaryDates,
    toggleDemo, openSampleOperations, renderSampleOperations, returnFromSampleOperations,
    showAllSampleOperations, showMoreSampleOperations,
    selectChartTab, toggleChartDeck
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
  let _referencePeriod = 'plan'; // Default: approved project plan
  let _viewMode = 'table'; // 'table', 'paired', 'change', 'charts'
  let _sortMode = 'spend'; // 'spend', 'delta', 'name'
  let _chartDough = null, _chartGrouped = null, _chartMembers = null, _chartSCurve = null;

  // حالة منصة الرسوم البيانية التفاعلية المدمجة للمشاريع (1–8)
  let activeProjChartTab = 1;
  let isProjChartDeckCollapsed = false;

  const PROJ_CHARTS_DECK_META = [
    { id: 1, name: 'الهيكل WBS', fullName: '1. هيكل تكاليف المشروع حسب البنود (WBS)', icon: 'fa-chart-pie', tip: 'توزيع مصروفات المشروع الحقيقية على حزم العمل' },
    { id: 2, name: 'المقارنة', fullName: '2. مقارنة المعتمد بالفعلي لكل بند (Grouped Bar)', icon: 'fa-chart-column', tip: 'مقارنة مباشرة بين التكلفة المعتمدة والمنصرف الفعلي' },
    { id: 3, name: 'الشلال', fullName: '3. شلال الفروقات وتدرج التكاليف (Waterfall)', icon: 'fa-water', tip: 'شلال انتقال مالي من سقف الميزانية إلى صافي التكلفة الحالية' },
    { id: 4, name: 'الانحراف', fullName: '4. أعمدة الانحراف والوفورات الموقعة', icon: 'fa-arrows-left-right-to-line', tip: 'تحديد دقيق لحجم واتجاه انحراف كل بند' },
    { id: 5, name: 'الرصاصة', fullName: '5. مخطط الرصاصة لاستنفاد الميزانية', icon: 'fa-bullseye', tip: 'قياس نسبة استهلاك سقف الميزانية مقارنة بالحد 100%' },
    { id: 6, name: 'التراكم S-Curve', fullName: '6. مسار الصرف التراكمي للمشروع (S-Curve)', icon: 'fa-chart-line', tip: 'المنحنى التراكمي الزمني لتدفق مصروفات المشروع' },
    { id: 7, name: 'الأفراد', fullName: '7. مساهمات أفراد العائلة في المشروع', icon: 'fa-users', tip: 'توزيع المبالغ المنصرفة حسب من سدد التكلفة' },
    { id: 8, name: 'المكدس 100%', fullName: '8. التوزيع النسبي لحصص بنود المشروع (100% Stacked)', icon: 'fa-layer-group', tip: 'الوزن النسبي والمئوي لكل بند من إجمالي الموازنة' }
  ];

  function selectProjChartTab(chartNum) {
    activeProjChartTab = Math.max(1, Math.min(8, parseInt(chartNum, 10) || 1));
    isProjChartDeckCollapsed = false;
    render();
  }

  function toggleProjChartDeck() {
    isProjChartDeckCollapsed = !isProjChartDeckCollapsed;
    const stage = document.getElementById('cmpProjDeckStage');
    const btnIcon = document.getElementById('cmpProjDeckToggleIcon');
    const btnLabel = document.getElementById('cmpProjDeckToggleLabel');
    if (stage) stage.classList.toggle('is-collapsed', isProjChartDeckCollapsed);
    if (btnIcon && btnLabel) {
      btnIcon.className = isProjChartDeckCollapsed ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
      btnLabel.textContent = isProjChartDeckCollapsed ? 'عرض الرسم' : 'طي الرسم';
    }
  }

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
    const customDiv = document.getElementById('cmpProjActualCustomRange');
    if (customDiv) customDiv.hidden = (val !== 'custom');
    render();
  }

  function onReferenceChange(val) {
    _referencePeriod = val;
    const customDiv = document.getElementById('cmpProjPeriodCustom');
    if (customDiv) customDiv.hidden = (val !== 'custom');
    render();
  }

  function switchMode(mode) {
    _viewMode = mode;
    const strip = document.getElementById('cmpProjModes');
    if (strip) {
      strip.querySelectorAll('button[data-proj-mode]').forEach(btn => {
        const active = (btn.dataset.projMode === mode);
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    }
    render();
  }

  function onSortChange(val) {
    _sortMode = val;
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
      return { from: formatDateStr(start), to: formatDateStr(end), label: 'الشهر الحالي' };
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
    const summaryContainer = document.getElementById('cmpProjSummary');
    const insightContainer = document.getElementById('cmpProjExtraInsightGrid');

    if (!_activeProject) {
      if (summaryContainer) summaryContainer.innerHTML = '';
      if (container) {
        container.innerHTML = `
          <div style="background: rgba(15,23,42,0.65); border: 1.2px dashed rgba(56,189,248,0.3); border-radius: 14px; padding: 24px; text-align: center; color: #94a3b8;">
            <i class="fa-solid fa-folder-open" style="font-size: 2.2rem; color: #38bdf8; margin-bottom: 8px; display: block;"></i>
            <div style="font-size: 0.90rem; font-weight: 850; color: #f8fafc; margin-bottom: 6px;">لا يوجد مشروع نشط حالياً للمقارنة</div>
            <button type="button" onclick="openNewBudgetPlanModal()" style="height: 32px; padding: 0 14px; border-radius: 8px; background: linear-gradient(135deg, #0ea5e9, #2563eb); border: none; color: #fff; font-size: 0.76rem; font-weight: 900; cursor: pointer;">＋ إنشاء موازنة مشروع جديد</button>
          </div>
        `;
      }
      return;
    }

    const actInpFrom = document.getElementById('cmpProjActualFrom');
    const actInpTo = document.getElementById('cmpProjActualTo');
    const customFrom = actInpFrom ? actInpFrom.value : null;
    const customTo = actInpTo ? actInpTo.value : null;

    const range = getProjectDateRange(_actualPeriod, customFrom, customTo);
    const txs = getProjectTransactions(_activeProject, range.from, range.to);
    const allProjTxs = getProjectTransactions(_activeProject, '2020-01-01', '2099-12-31');

    // Update range preview elements
    const primaryPreview = document.getElementById('cmpProjPrimaryDates');
    if (primaryPreview) {
      const isCustomActual = document.getElementById('cmpProjActualPeriod')?.value === 'custom';
      const datesText = (range.from === '2020-01-01') ? 'إجمالي فترة المشروع' : `${range.from} إلى ${range.to}`;
      const icon = isCustomActual ? '<i class="fa-solid fa-calendar-days" style="margin-left: 5px; color: #0D9488;"></i>' : '';
      primaryPreview.innerHTML = `<small>${range.label}</small><div style="display:flex;align-items:center;gap:4px;">${icon}<bdi dir="ltr">${datesText}</bdi></div>`;
      primaryPreview.style.cursor = isCustomActual ? 'pointer' : 'default';
      primaryPreview.onclick = isCustomActual ? () => openDateRangePickerForPair('cmpProjActualFrom', 'cmpProjActualTo') : null;
    }
    const refPreview = document.getElementById('cmpProjReferenceDates');
    if (refPreview) {
      const isCustomRef = _referencePeriod === 'custom';
      const icon = isCustomRef ? '<i class="fa-solid fa-calendar-days" style="margin-left: 5px; color: #0D9488;"></i>' : '';
      if (_referencePeriod === 'plan') {
        refPreview.innerHTML = `<small>سقف التكلفة المخطط للبنود</small><div style="display:flex;align-items:center;gap:4px;"><bdi dir="ltr">الموازنة المعتمدة</bdi></div>`;
      } else if (_referencePeriod === 'previous') {
        refPreview.innerHTML = `<small>مقارنة بنفس المدة المنصرمة</small><div style="display:flex;align-items:center;gap:4px;"><bdi dir="ltr">الفترة السابقة تلقائيًا</bdi></div>`;
      } else {
        const customText = (document.getElementById('cmpProjPeriodFrom')?.value && document.getElementById('cmpProjPeriodTo')?.value) ? `${document.getElementById('cmpProjPeriodFrom').value} إلى ${document.getElementById('cmpProjPeriodTo').value}` : 'اختر تواريخ المرجع';
        refPreview.innerHTML = `<small>مقارنة بنطاق تواريخ مخصص</small><div style="display:flex;align-items:center;gap:4px;">${icon}<bdi dir="ltr">${customText}</bdi></div>`;
      }
      refPreview.style.cursor = isCustomRef ? 'pointer' : 'default';
      refPreview.onclick = isCustomRef ? () => openDateRangePickerForPair('cmpProjPeriodFrom', 'cmpProjPeriodTo') : null;
    }

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

    // Combine WBS items from Plan and Transactions
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

    // Sorting
    if (_sortMode === 'spend') {
      wbsRows.sort((a, b) => b.actAmt - a.actAmt);
    } else if (_sortMode === 'delta') {
      wbsRows.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    } else if (_sortMode === 'name') {
      wbsRows.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }

    const formatVal = (typeof formatMoneyVal === 'function') ? formatMoneyVal : (v) => (typeof formatMoney === 'function' ? formatMoney(v) : (v || 0).toLocaleString() + ' ج.م');

    // Compute KPIs
    const approvedBudget = planApprovedBudget || (wbsRows.reduce((s, r) => s + r.estAmt, 0)) || totalActualLifetime;
    const spentActual = (_actualPeriod === 'all') ? totalActualLifetime : totalActualInPeriod;
    const remainingBalance = approvedBudget - spentActual;
    const consumptionPct = approvedBudget > 0 ? ((spentActual / approvedBudget) * 100) : 0;

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
    const weeklyBurnRate = (totalActualLifetime / daysDiff) * 7;

    // EAC = Approved Budget ÷ CPI
    const eac = (cpi > 0) ? (approvedBudget / cpi) : spentActual;

    // Build Insights Callout
    const topCostDrivers = wbsRows.slice(0, 3).filter(r => r.actAmt > 0);
    const overrunItems = wbsRows.filter(r => r.estAmt > 0 && r.diff < 0);
    const savingsItems = wbsRows.filter(r => r.estAmt > 0 && r.actAmt > 0 && r.diff > 0);

    // 1. Render 4 Unified Summary Cards
    const deltaTone = remainingBalance < 0 ? 'red' : remainingBalance > 0 ? 'green' : 'slate';
    const pctTone = consumptionPct > 100 ? 'red' : consumptionPct >= 85 ? 'slate' : 'green';

    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="cmp-unified-summary">
          <div class="cmp-unified-kpi" data-tone="blue">
            <small>المنصرف الفعلي</small>
            <strong><bdi dir="ltr">- ${formatVal(spentActual)}</bdi></strong>
          </div>
          <div class="cmp-unified-kpi" data-tone="slate">
            <small>الموازنة المعتمدة</small>
            <strong><bdi dir="ltr">${formatVal(approvedBudget)}</bdi></strong>
          </div>
          <div class="cmp-unified-kpi" data-tone="${deltaTone}">
            <small>${remainingBalance >= 0 ? 'الرصيد المتبقي (وفر)' : 'تجاوز الميزانية (عجز)'}</small>
            <strong><bdi dir="ltr">${remainingBalance >= 0 ? '+' : ''}${formatVal(remainingBalance)}</bdi></strong>
          </div>
          <div class="cmp-unified-kpi" data-tone="${pctTone}">
            <small>نسبة الاستهلاك</small>
            <strong><bdi dir="ltr">${consumptionPct.toFixed(1)}%</bdi></strong>
          </div>
        </div>
        <p class="cmp-difference-hint">المبالغ بالجنيه المصري · ${spentActual === 0 ? 'مخصص معتمد متاح بالكامل بنسبة 100% ولم تبدأ المصروفات بعد' : `تم استهلاك ${consumptionPct.toFixed(1)}% من السقف المعتمد للمشروع`}</p>
      `;
    }

    // 2. Render Main Content based on _viewMode
    if (container) {
      if (_viewMode === 'table') {
        container.innerHTML = `
          <div style="overflow-x: auto; margin-bottom: 12px; border: 1px solid var(--uc-border, rgba(255,255,255,0.08)); border-radius: 12px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem; direction: rtl; text-align: right;">
              <thead>
                <tr style="background: rgba(15, 23, 42, 0.9);">
                  <th style="padding: 10px; color: #94a3b8; font-weight: 850; border-bottom: 1px solid rgba(255,255,255,0.1);">بيان بند المشروع (WBS)</th>
                  <th style="padding: 10px; text-align: center; color: #fbbf24; font-weight: 850; border-bottom: 1px solid rgba(255,255,255,0.1);">الموازنة المعتمدة</th>
                  <th style="padding: 10px; text-align: center; color: #38bdf8; font-weight: 850; border-bottom: 1px solid rgba(255,255,255,0.1);">المنصرف الفعلي</th>
                  <th style="padding: 10px; text-align: center; color: #f87171; font-weight: 850; border-bottom: 1px solid rgba(255,255,255,0.1);">الفرق (المتبقي)</th>
                  <th style="padding: 10px; text-align: center; color: #94a3b8; font-weight: 850; border-bottom: 1px solid rgba(255,255,255,0.1);">نسبة الاستهلاك</th>
                  <th style="padding: 10px; text-align: center; color: #94a3b8; font-weight: 850; border-bottom: 1px solid rgba(255,255,255,0.1);">الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${wbsRows.length === 0 ? `<tr><td colspan="6" style="text-align:center;padding:16px;color:#94a3b8;">لا توجد بنود أو حركات مسجلة لهذا المشروع في هذه الفترة</td></tr>` : 
                  wbsRows.map((r, idx) => {
                    const isSave = r.diff >= 0;
                    const diffColor = isSave ? '#34d399' : '#f87171';
                    const diffBg = isSave ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
                    const diffSign = r.diff > 0 ? '+' : (r.diff < 0 ? '-' : '');
                    const rowPct = r.estAmt > 0 ? Math.round((r.actAmt / r.estAmt) * 100) : (r.actAmt > 0 ? 100 : 0);
                    let statusLabel = 'ضمن الحد';
                    let statusColor = '#94a3b8';
                    if (r.estAmt === 0 && r.actAmt > 0) { statusLabel = 'غير مخطط'; statusColor = '#f59e0b'; }
                    else if (r.diff < 0) { statusLabel = 'تجاوز سقف'; statusColor = '#ef4444'; }
                    else if (r.actAmt > 0 && r.diff > 0) { statusLabel = 'وفـر'; statusColor = '#10b981'; }
                    else if (r.actAmt === 0 && r.estAmt > 0) { statusLabel = 'متاح'; statusColor = '#38bdf8'; }

                    return `
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 9px 12px; font-weight: 850; color: #f8fafc;">
                          <span style="color: #38bdf8; font-size: 0.70rem; margin-left: 4px;">#${idx+1}</span>
                          <i class="fa-solid fa-cube" style="color: #38bdf8; font-size: 0.70rem; margin-left: 6px;"></i>
                          <span>${r.name}</span>
                        </td>
                        <td style="padding: 9px 12px; text-align: center; font-weight: 900; color: #fbbf24; font-variant-numeric: tabular-nums; direction: ltr;">
                          ${formatVal(r.estAmt)}
                        </td>
                        <td style="padding: 9px 12px; text-align: center; font-weight: 900; color: #38bdf8; font-variant-numeric: tabular-nums; direction: ltr;">
                          ${formatVal(r.actAmt)}
                        </td>
                        <td style="padding: 9px 12px; text-align: center; direction: ltr;">
                          <span style="display: inline-block; padding: 2px 7px; border-radius: 6px; font-weight: 950; font-size: 0.74rem; background: ${diffBg}; color: ${diffColor}; font-variant-numeric: tabular-nums;">
                            ${diffSign}${formatVal(Math.abs(r.diff))}
                          </span>
                        </td>
                        <td style="padding: 9px 12px; text-align: center; font-weight: 850; color: ${rowPct > 100 ? '#ef4444' : '#cbd5e1'}; font-variant-numeric: tabular-nums; direction: ltr;">
                          ${rowPct}%
                        </td>
                        <td style="padding: 9px 12px; text-align: center;">
                          <span style="font-size: 0.70rem; font-weight: 850; color: ${statusColor};">${statusLabel}</span>
                        </td>
                      </tr>
                    `;
                  }).join('')
                }
              </tbody>
              <tfoot>
                <tr style="background: rgba(15,23,42,0.95); border-top: 2px solid rgba(56,189,248,0.3); font-weight: 950;">
                  <td style="padding: 10px; color: #f8fafc;">الإجمالي العام</td>
                  <td style="padding: 10px; text-align: center; color: #fbbf24; font-size: 0.86rem; font-variant-numeric: tabular-nums; direction: ltr;">${formatVal(approvedBudget)}</td>
                  <td style="padding: 10px; text-align: center; color: #38bdf8; font-size: 0.86rem; font-variant-numeric: tabular-nums; direction: ltr;">- ${formatVal(spentActual)}</td>
                  <td style="padding: 10px; text-align: center; direction: ltr;">
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-weight: 950; font-size: 0.80rem; background: ${remainingBalance >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${remainingBalance >= 0 ? '#34d399' : '#f87171'};">
                      ${remainingBalance >= 0 ? '+' : ''}${formatVal(remainingBalance)}
                    </span>
                  </td>
                  <td style="padding: 10px; text-align: center; color: ${consumptionPct > 100 ? '#ef4444' : '#cbd5e1'}; font-variant-numeric: tabular-nums; direction: ltr;">${consumptionPct.toFixed(1)}%</td>
                  <td style="padding: 10px; text-align: center; color: #34d399;">${remainingBalance >= 0 ? 'انضباط ممتاز' : 'تجاوز عجز'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        `;
      } else if (_viewMode === 'paired') {
        const maxVal = Math.max(1, ...wbsRows.map(r => Math.max(r.actAmt, r.estAmt)));
        container.innerHTML = `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid var(--uc-border, rgba(255,255,255,0.08)); border-radius: 12px; padding: 14px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 0.82rem; font-weight: 850; color: #38bdf8;"><i class="fa-solid fa-chart-column"></i> أعمدة المقارنة المزدوجة (المعتمد vs الفعلي)</span>
              <div style="display: flex; gap: 12px; font-size: 0.72rem;">
                <span style="display: flex; align-items: center; gap: 4px; color: #fbbf24;"><i style="display:inline-block;width:10px;height:10px;background:#fbbf24;border-radius:2px;"></i> المعتمد</span>
                <span style="display: flex; align-items: center; gap: 4px; color: #38bdf8;"><i style="display:inline-block;width:10px;height:10px;background:#38bdf8;border-radius:2px;"></i> الفعلي</span>
              </div>
            </div>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
              ${wbsRows.map((r, idx) => {
                const actPct = (r.actAmt / maxVal) * 100;
                const estPct = (r.estAmt / maxVal) * 100;
                return `
                  <li style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.76rem; font-weight: 850; margin-bottom: 4px;">
                      <span style="color: #f8fafc;"><span style="color: #38bdf8; margin-left: 4px;">#${idx+1}</span> ${r.name}</span>
                      <div style="display: flex; gap: 10px; font-size: 0.72rem; direction: ltr;">
                        <span style="color: #38bdf8; font-weight: 900;">فعلي: ${formatVal(r.actAmt)}</span>
                        <span style="color: #fbbf24; font-weight: 900;">معتمد: ${formatVal(r.estAmt)}</span>
                      </div>
                    </div>
                    <div style="height: 16px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; justify-content: center; gap: 2px; padding: 2px;">
                      <div style="width: ${Math.min(100, estPct)}%; height: 5px; background: #fbbf24; border-radius: 2px;" title="المعتمد: ${formatVal(r.estAmt)}"></div>
                      <div style="width: ${Math.min(100, actPct)}%; height: 5px; background: #38bdf8; border-radius: 2px;" title="الفعلي: ${formatVal(r.actAmt)}"></div>
                    </div>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        `;
      } else if (_viewMode === 'change') {
        const maxDelta = Math.max(1, ...wbsRows.map(r => Math.abs(r.diff)));
        container.innerHTML = `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid var(--uc-border, rgba(255,255,255,0.08)); border-radius: 12px; padding: 14px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 0.82rem; font-weight: 850; color: #38bdf8;"><i class="fa-solid fa-arrows-split-up-and-left"></i> انحراف وتغير البنود عن المعتمد</span>
              <div style="display: flex; gap: 12px; font-size: 0.72rem;">
                <span style="display: flex; align-items: center; gap: 4px; color: #10b981;"><i style="display:inline-block;width:10px;height:10px;background:#10b981;border-radius:2px;"></i> وفر متبقي (+)</span>
                <span style="display: flex; align-items: center; gap: 4px; color: #ef4444;"><i style="display:inline-block;width:10px;height:10px;background:#ef4444;border-radius:2px;"></i> تجاوز سقف (-)</span>
              </div>
            </div>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
              ${wbsRows.map((r, idx) => {
                const isOver = r.diff < 0;
                const widthPct = (Math.abs(r.diff) / maxDelta) * 100;
                const barColor = isOver ? '#ef4444' : '#10b981';
                const bg = isOver ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)';
                return `
                  <li style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 8px 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <span style="font-size: 0.78rem; font-weight: 850; color: #f8fafc;"><span style="color: #38bdf8; margin-left: 4px;">#${idx+1}</span> ${r.name}</span>
                      <span style="font-size: 0.74rem; font-weight: 950; color: ${barColor}; direction: ltr; padding: 2px 6px; border-radius: 5px; background: ${bg};">
                        ${r.diff > 0 ? '+' : ''}${formatVal(r.diff)}
                      </span>
                    </div>
                    <div style="height: 8px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden;">
                      <div style="width: ${Math.min(100, widthPct)}%; height: 100%; background: ${barColor}; border-radius: 4px;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #94a3b8; margin-top: 4px; direction: ltr;">
                      <span>الفعلي: ${formatVal(r.actAmt)}</span>
                      <span>المعتمد: ${formatVal(r.estAmt)}</span>
                    </div>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        `;
      } else if (_viewMode === 'charts') {
        const maxDelta = Math.max(1, ...wbsRows.map(r => Math.abs(r.diff)));
        const topRatio = Math.max(0, ...wbsRows.map(r => r.estAmt > 0 ? (r.actAmt / r.estAmt * 100) : 0));
        const axisMax = Math.max(200, Math.ceil(topRatio / 50) * 50);

        // Waterfall steps
        const wfSteps = [{ name: 'المعتمد', value: approvedBudget, total: true }];
        wbsRows.filter(r => r.diff !== 0).forEach(r => wfSteps.push({ name: r.name, value: r.diff, total: false }));
        wfSteps.push({ name: 'الفعلي', value: spentActual, total: true });

        const chart1Html = `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
            <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-chart-pie"></i> <span>1. هيكل تكاليف المشروع حسب البنود (WBS)</span>
            </div>
            <div style="height: 240px; position: relative;"><canvas id="projChartDoughnut"></canvas></div>
            ${chartExplanation("توزيع مصروفات المشروع الحقيقية على حزم العمل المعتمدة (WBS).", "كل شريحة ملونة تمثل بند عمل وحصته النسبية من إجمالي تكاليف المشروع المنصرفة.")}
          </div>
        `;

        const chart2Html = `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
            <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-chart-column"></i> <span>2. مقارنة المعتمد بالفعلي لكل بند (Grouped Bar)</span>
            </div>
            <div style="height: 240px; position: relative;"><canvas id="projChartBarGrouped"></canvas></div>
            ${chartExplanation("مقارنة مباشرة بين التكلفة المعتمدة في دراسة المشروع والمنصرف الفعلي لكل بند.", "العمود الذهبي هو المعتمد والعمود السماوي هو الفعلي؛ الفارق يكشف التجاوز أو الوفر في كل بند.")}
          </div>
        `;

        const chart3Html = `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
            <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-water"></i> <span>3. شلال الفروقات وتدرج التكاليف (Waterfall Chart)</span>
            </div>
            <div style="overflow-x: auto; padding-bottom: 6px;">
              <div style="display: flex; gap: 8px; min-width: 380px; align-items: flex-end; height: 160px; padding: 10px 4px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                ${wfSteps.map(step => {
                  const isTotal = step.total;
                  const isOver = step.value < 0;
                  const barH = Math.max(15, Math.min(120, Math.round((Math.abs(step.value) / Math.max(1, approvedBudget)) * 120)));
                  const bg = isTotal ? '#2563eb' : (isOver ? '#ef4444' : '#10b981');
                  return `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                      <span style="font-size: 0.65rem; color: #94a3b8; font-variant-numeric: tabular-nums;">${formatVal(Math.abs(step.value))}</span>
                      <div style="width: 100%; height: ${barH}px; background: ${bg}; border-radius: 4px;"></div>
                      <span style="font-size: 0.68rem; font-weight: 800; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65px;">${step.name}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            <p style="font-size: 0.70rem; color: #94a3b8; margin: 8px 0 0;">يوضح الشلال الانتقال التدريجي من سقف المعتمد عبر فروقات البنود إلى المنصرف الفعلي.</p>
            ${chartExplanation("شلال انتقال مالي من سقف ميزانية المشروع المعتمدة إلى صافي التكلفة الحالية.", "الأعمدة الحمراء تمثل البنود ذات التكاليف الإضافية والخضراء تمثل الوفورات المحققة في بنود أخرى.")}
          </div>
        `;

        const chart4Html = `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
            <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-arrows-left-right-to-line"></i> <span>4. أعمدة الانحراف والوفورات الموقعة لكل بند</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${wbsRows.slice(0, 8).map(r => {
                const frac = (Math.abs(r.diff) / maxDelta) * 50;
                const isSave = r.diff >= 0;
                return `
                  <div style="display: grid; grid-template-columns: 90px 1fr 75px; gap: 8px; align-items: center; font-size: 0.72rem;">
                    <span style="color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.name}</span>
                    <div style="height: 16px; background: rgba(0,0,0,0.3); border-radius: 3px; position: relative;">
                      <div style="position: absolute; ${isSave ? 'left: 50%;' : 'right: 50%;'} width: ${Math.min(50, frac)}%; height: 100%; background: ${isSave ? '#10b981' : '#ef4444'}; border-radius: 2px;"></div>
                      <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.3);"></div>
                    </div>
                    <span style="direction: ltr; font-weight: 850; color: ${isSave ? '#34d399' : '#f87171'}; font-size: 0.68rem;">${r.diff > 0 ? '+' : ''}${formatVal(r.diff)}</span>
                  </div>
                `;
              }).join('')}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #94a3b8; margin-top: 8px;">
              <span style="color: #ef4444;">← تجاوز المعتمد</span>
              <span style="color: #10b981;">وفر متبقي →</span>
            </div>
            ${chartExplanation("صافي الوفر أو العجز المحاسبي لكل بند من بنود المشروع على جانبي خط الصفر.", "الأشرطة الخضراء لليسار تدل على مبالغ تم توفيرها والأشرطة الحمراء لليمين تنبه لتجاوز مخصص البند.")}
          </div>
        `;

        const chart5Html = `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
            <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-bullseye"></i> <span>5. مخطط الرصاصة الرقابي لاستهلاك سقف الميزانية (Bullet Chart)</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${wbsRows.slice(0, 8).map(r => {
                const ratio = r.estAmt > 0 ? Math.min(axisMax, (r.actAmt / r.estAmt) * 100) : 0;
                const targetPos = (100 / axisMax) * 100;
                const actualWidth = (ratio / axisMax) * 100;
                const isOver = ratio > 100;
                return `
                  <div style="display: grid; grid-template-columns: 90px 1fr 50px; gap: 8px; align-items: center; font-size: 0.72rem;">
                    <span style="color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.name}</span>
                    <div style="height: 18px; background: rgba(0,0,0,0.3); border-radius: 3px; position: relative; overflow: visible;">
                      <div style="position: absolute; left: 0; top: 3px; bottom: 3px; width: ${actualWidth}%; background: ${isOver ? '#ef4444' : '#0ea5e9'}; border-radius: 2px;"></div>
                      <div style="position: absolute; left: ${targetPos}%; top: 0; bottom: 0; width: 2px; background: #fbbf24; z-index: 2;" title="سقف 100%"></div>
                    </div>
                    <span style="direction: ltr; font-weight: 850; color: ${isOver ? '#ef4444' : '#f8fafc'}; font-size: 0.68rem;">${r.estAmt > 0 ? Math.round(r.actAmt / r.estAmt * 100) + '%' : '—'}</span>
                  </div>
                `;
              }).join('')}
            </div>
            <p style="font-size: 0.68rem; color: #94a3b8; margin: 8px 0 0;">الخط الذهبي عند 100% هو السقف المعتمد، والشريط الأزرق هو المنصرف الحقيقي.</p>
            ${chartExplanation("شريط رقابي يوضح مدى استهلاك كل بند من سقفه المالي المعتمد في المشروع.", "الخط الذهبي عند 100% هو السقف الحرج؛ تجاوز الشريط السماوي له يعني استنزاف الميزانية المخصصة.")}
          </div>
        `;

        const chart6Html = `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
            <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-chart-line"></i> <span>6. مسار الصرف التراكمي للمشروع (S-Curve)</span>
            </div>
            <div style="height: 240px; position: relative;"><canvas id="projChartLineSCurve"></canvas></div>
            ${chartExplanation("المنحنى التراكمي الزمني لتدفق مصروفات المشروع منذ الانطلاق وحتى اليوم.", "الميل الحاد يوضح فترات ذروة الإنفاق والتوريدات، واستواء المنحنى يوضح مراحل الهدوء واستقرار التكاليف.")}
          </div>
        `;

        const chart7Html = `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
            <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-users"></i> <span>7. مساهمات أفراد العائلة في المشروع (Members)</span>
            </div>
            <div style="height: 240px; position: relative;"><canvas id="projChartBarMembers"></canvas></div>
            ${chartExplanation("توزيع المبالغ المنصرفة في المشروع حسب الشخص أو الحساب الذي سدد التكلفة.", "الأشرطة الأفقية توضح حجم المساهمة المالية لكل فرد من أفراد العائلة في تمويل المشروع.")}
          </div>
        `;

        const chart8Html = `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px;">
            <div style="font-size: 0.78rem; font-weight: 850; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-layer-group"></i> <span>8. التوزيع النسبي لحصص بنود المشروع التراكمية (100% Stacked)</span>
            </div>
            <div style="height: 32px; background: rgba(0,0,0,0.3); border-radius: 6px; overflow: hidden; display: flex; direction: ltr; margin: 10px 0;">
              ${wbsRows.map((r, i) => {
                const colors = ['#38bdf8', '#a855f7', '#fbbf24', '#34d399', '#f43f5e', '#ec4899', '#6366f1', '#14b8a6'];
                const share = approvedBudget > 0 ? (r.estAmt / approvedBudget) * 100 : (100 / Math.max(1, wbsRows.length));
                return `<div style="width: ${share}%; height: 100%; background: ${colors[i % colors.length]};" title="${r.name}: ${Math.round(share)}%"></div>`;
              }).join('')}
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; font-size: 0.70rem; color: #cbd5e1; margin-top: 8px;">
              ${wbsRows.slice(0, 8).map((r, i) => {
                const colors = ['#38bdf8', '#a855f7', '#fbbf24', '#34d399', '#f43f5e', '#ec4899', '#6366f1', '#14b8a6'];
                const share = approvedBudget > 0 ? Math.round((r.estAmt / approvedBudget) * 100) : 0;
                return `<span><i style="display:inline-block;width:9px;height:9px;background:${colors[i % colors.length]};border-radius:2px;margin-left:4px;"></i>${r.name} (${share}%)</span>`;
              }).join('')}
            </div>
            ${chartExplanation("الوزن النسبي والمئوي لكل بند من إجمالي موازنة المشروع (مجموع الأشرطة = 100%).", "توضح الحصة المئوية لكل بند لمعرفة البنود ذات الثقل المالي الأكبر في المشروع.")}
          </div>
        `;

        const _currentProjChartsMap = {
          1: chart1Html,
          2: chart2Html,
          3: chart3Html,
          4: chart4Html,
          5: chart5Html,
          6: chart6Html,
          7: chart7Html,
          8: chart8Html
        };

        const activeProjMeta = PROJ_CHARTS_DECK_META[activeProjChartTab - 1] || PROJ_CHARTS_DECK_META[0];
        container.innerHTML = `
          <section class="cmp-charts-deck bs-full" id="cmpProjChartsDeck" style="margin-bottom: 14px;">
            <div class="cmp-deck-header">
              <div class="cmp-deck-title">
                <i class="fa-solid ${activeProjMeta.icon}"></i>
                <span id="cmpProjActiveChartTitle">${activeProjMeta.fullName}</span>
              </div>
              <button type="button" class="cmp-deck-collapse-btn" onclick="ProjectCompareEngine.toggleProjChartDeck()" title="طي أو توسيع عرض الرسم البياني">
                <i id="cmpProjDeckToggleIcon" class="fa-solid ${isProjChartDeckCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}"></i>
                <span id="cmpProjDeckToggleLabel">${isProjChartDeckCollapsed ? 'عرض الرسم' : 'طي الرسم'}</span>
              </button>
            </div>
            <div class="cmp-deck-tabs-strip" role="tablist" aria-label="اختيار رسم المشروع">
              ${PROJ_CHARTS_DECK_META.map(m => {
                const isActive = (m.id === activeProjChartTab);
                return `
                  <button type="button" 
                          role="tab" 
                          class="cmp-deck-tab ${isActive ? 'active' : ''}" 
                          aria-selected="${isActive}" 
                          onclick="ProjectCompareEngine.selectProjChartTab(${m.id})" 
                          title="${m.tip}">
                    <span class="cmp-tab-num">${m.id}</span>
                    <span class="cmp-tab-name">${m.name}</span>
                  </button>
                `;
              }).join('')}
            </div>
            <div class="cmp-deck-stage ${isProjChartDeckCollapsed ? 'is-collapsed' : ''}" id="cmpProjDeckStage">
              ${_currentProjChartsMap[activeProjChartTab] || ''}
            </div>
          </section>
        `;
        renderProjectCharts(wbsRows, memberActuals, allProjTxs, approvedBudget);
      }
    }

    // 3. Render Collapsible Insights Box
    if (insightContainer) {
      insightContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; margin-bottom: 10px;">
          <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 10px; padding: 8px; text-align: center;">
            <div style="font-size: 0.64rem; color: #e9d5ff; font-weight: 800;">مؤشر كفاءة التكلفة (CPI)</div>
            <div style="font-size: 1.1rem; font-weight: 950; color: ${cpi >= 1.0 ? '#34d399' : '#fbbf24'}; direction: ltr;">${cpi.toFixed(2)}</div>
            <div style="font-size: 0.58rem; color: ${cpi >= 1.0 ? '#34d399' : '#fbbf24'};">${cpi >= 1.0 ? 'وفر كفء' : 'انحراف تكلفة'}</div>
          </div>
          <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 8px; text-align: center;">
            <div style="font-size: 0.64rem; color: #fde68a; font-weight: 800;">معدل الصرف الأسبوعي</div>
            <div style="font-size: 1.1rem; font-weight: 950; color: #fbbf24; direction: ltr;">${formatVal(weeklyBurnRate)}</div>
            <div style="font-size: 0.58rem; color: #94a3b8;">متوسط الحرق</div>
          </div>
          <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 8px; text-align: center;">
            <div style="font-size: 0.64rem; color: #bae6fd; font-weight: 800;">المتوقع عند الاكتمال (EAC)</div>
            <div style="font-size: 1.1rem; font-weight: 950; color: #38bdf8; direction: ltr;">${formatVal(eac)}</div>
            <div style="font-size: 0.58rem; color: #94a3b8;">تنبؤ بالوتيرة الحالية</div>
          </div>
        </div>
        <div style="font-size: 0.72rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px; line-height: 1.5;">
          ${spentActual === 0 ? `<div>ℹ️ <strong>حالة الميزانية:</strong> مخصص معتمد متاح بالكامل بنسبة 100% (${formatVal(approvedBudget)}) ولم تبدأ المصروفات بعد.</div>` : `
            ${topCostDrivers.length > 0 ? `<div>📌 <strong>أعلى بنود تكلفة مستنزفة:</strong> ${topCostDrivers.map(d => `<span style="color:#f87171;">${d.name} (${formatVal(d.actAmt)})</span>`).join(' • ')}</div>` : ''}
            ${overrunItems.length > 0 ? `<div>⚠️ <strong>تنبيه تجاوز السقف:</strong> ${overrunItems.map(o => `<span style="color:#ef4444;">بند ${o.name} تجاوز المعتمد بفارق ${formatVal(Math.abs(o.diff))}</span>`).join(' • ')}</div>` : '<div>✅ <strong>انضباط الميزانية:</strong> لا توجد بنود تجاوزت السقف المعتمد حتى الآن.</div>'}
            ${savingsItems.length > 0 ? `<div>🎉 <strong>وفورات محققة:</strong> ${savingsItems.slice(0, 2).map(s => `<span style="color:#34d399;">بند ${s.name} حقق وفراً بقيمة ${formatVal(s.diff)}</span>`).join(' • ')}</div>` : ''}
          `}
        </div>
      `;
    }
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
    onReferenceChange,
    switchMode,
    onSortChange,
    closeAndArchiveProject,
    selectProjChartTab,
    toggleProjChartDeck
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
