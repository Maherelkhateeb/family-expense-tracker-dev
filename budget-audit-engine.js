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

    const rowsHtml = plan.items.map(it => {
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

  // ---------------------------------------------------------------------------
  // 6. التحديث الشامل والمتناغم لمنظومة الموازنات (Master Synchronizer)
  // ---------------------------------------------------------------------------
  function refreshActiveBudgetAudit() {
    let plan = window.currentBudgetMonthData;
    if (!plan && state.monthlyBudgets && state.monthlyBudgets.length > 0) {
      plan = state.monthlyBudgets[0];
      window.currentBudgetMonthData = plan;
    }
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
      const pct = Math.min(100, Math.round((periodExpense / totalProratedEst) * 100));
      progBar.style.width = pct + '%';
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
    const container = document.getElementById('panelProjectBudgets');
    if (!container) return;

    const plans = (state.monthlyBudgets || []).filter(b => b.project);
    if (plans.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px 14px; color: #94a3b8; font-size: 0.82rem; background: rgba(15, 23, 42, 0.4); border-radius: 14px; border: 1px dashed rgba(255,255,255,0.1);">
          <div style="font-size: 1.8rem; margin-bottom: 8px; color: #38bdf8;"><i class="fa-solid fa-trowel-bricks"></i></div>
          <div style="font-weight: 850; font-size: 0.95rem; color: #f8fafc; margin-bottom: 4px;">لا توجد موازنات مشاريع مرصودة حتى الآن</div>
          <div>يمكنك إنشاء موازنة جديدة وتخصيصها لمشروع محدد من زر (+ خطة جديدة).</div>
        </div>
      `;
      return;
    }

    let selProj = window.selectedProjectBudgetName;
    let activeProjPlan = plans.find(p => p.project === selProj) || plans[0];
    window.selectedProjectBudgetName = activeProjPlan.project;

    ensureBudgetItems(activeProjPlan);

    const allProjTxs = (state.transactions || []).filter(t => t.project === activeProjPlan.project);
    const projTxs = getTransactionsForPeriod(allProjTxs, activeProjectTimePeriod, activeProjPlan.month, projectCustomStart, projectCustomEnd);
    const expenseTxs = projTxs.filter(t => t.type === 'expense');

    const totalEst = (activeProjPlan.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
    const totalAct = expenseTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const diff = totalEst - totalAct;
    const isOver = diff < 0;

    container.innerHTML = `
      <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
        <div style="font-size: 0.88rem; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-trowel-bricks"></i>
          <span>موازنة المشروع: ${escapeHtml(activeProjPlan.project)}</span>
        </div>
        <select onchange="BudgetAuditEngine.selectProject(this.value)" style="height: 32px; font-size: 0.76rem; font-weight: 850; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); color: #fff; border-radius: 8px; padding: 0 8px;">
          ${plans.map(p => `<option value="${escapeHtml(p.project)}" ${p.project === activeProjPlan.project ? 'selected' : ''}>${escapeHtml(p.name || p.project)}</option>`).join('')}
        </select>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
        <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 8px; text-align: center;">
          <div style="font-size: 0.68rem; color: #94a3b8;">الميزانية المرصودة</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: #38bdf8;">${formatMoneyVal(totalEst)}</div>
        </div>
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 8px; text-align: center;">
          <div style="font-size: 0.68rem; color: #94a3b8;">المنصرف الفعلي</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: #f87171;">${formatMoneyVal(totalAct)}</div>
        </div>
        <div style="background: ${isOver ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; border: 1px solid ${isOver ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}; border-radius: 10px; padding: 8px; text-align: center;">
          <div style="font-size: 0.68rem; color: #94a3b8;">${isOver ? 'العجز' : 'الوفر المتبقي'}</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: ${isOver ? '#f87171' : '#34d399'};">${isOver ? '- ' : '+ '}${formatMoneyVal(Math.abs(diff))}</div>
        </div>
      </div>

      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.74rem;">
          <thead>
            <tr style="background: rgba(30, 41, 59, 0.8); color: #94a3b8;">
              <th style="padding: 8px; text-align: right;">البند</th>
              <th style="padding: 8px; text-align: center;">المقدر</th>
              <th style="padding: 8px; text-align: center;">الفعلي</th>
              <th style="padding: 8px; text-align: center;">الفارق</th>
            </tr>
          </thead>
          <tbody>
            ${(activeProjPlan.items || []).map(it => {
              const act = expenseTxs.filter(t => t.category === it.category).reduce((s, t) => s + (Number(t.amount) || 0), 0);
              const d = (Number(it.amount) || 0) - act;
              return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 8px; color: #f8fafc; font-weight: 800;">${escapeHtml(it.title || it.category)}</td>
                  <td style="padding: 8px; text-align: center; color: #fbbf24;">${formatMoneyVal(it.amount)}</td>
                  <td style="padding: 8px; text-align: center; color: #38bdf8;">${formatMoneyVal(act)}</td>
                  <td style="padding: 8px; text-align: center; color: ${d < 0 ? '#f87171' : '#34d399'}; font-weight: 900;">
                    ${d < 0 ? '- ' : '+ '}${formatMoneyVal(Math.abs(d))}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
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
    refreshActiveBudgetAudit,
    renderProjectBudgetsAdvanced,
    renderExecutiveComparisonsAudit,
    renderBudgetHistoryAdvanced
  };
})();
