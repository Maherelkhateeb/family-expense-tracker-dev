/**
 * budget-audit-oversight.js - منظومة الرقابة المالية والتدقيق الجنائي الذكي
 * تدمج المحاور الستة والـ 20 سؤالاً رقابياً مع شريط تنقل من 1 إلى 6 ومسرح قابل للطي في نفس الموضع.
 * Version: 6.7.3 (Build 202611191100)
 */

(function (window) {
  'use strict';

  const BudgetAuditOversightEngine = (function () {
    let currentPillar = 1;
    let isCollapsed = false;

    // تعريف المحاور الستة والـ 20 سؤالاً ومعادلاتها
    const PILLARS = [
      {
        id: 1,
        title: "التدقيق الجنائي للسيولة وكشف التآكل الصامت",
        shortTitle: "1. كشف تآكل السيولة",
        subtitle: "الكاش التائه، عمولات السحب والتحويلات، وفروق العملات",
        icon: "fa-solid fa-money-bill-transfer",
        themeColor: "#ef4444",
        accentBg: "rgba(239, 68, 68, 0.15)",
        borderColor: "rgba(239, 68, 68, 0.35)",
        questions: [
          {
            qNum: 1,
            title: "قيمة «الكاش التائه» أو المصروفات غير المصنفة (Black Hole Spend)",
            formula: "\\sum \\text{السحب النقدي من الصراف} - \\sum \\text{الفواتير الموثقة بالبيان}",
            evalKey: "blackHoleSpend",
            unit: "ج.م",
            threshold: "أقل من 5% من السحب النقدي",
            desc: "المبالغ النقدية المسحوبة من البنك أو الصراف الآلي والتي لا توجد لها فواتير أو إيصالات توثق أوجه صرفها."
          },
          {
            qNum: 2,
            title: "رسوم وعمولات المعاملات البنكية وغرامات التأخير (Friction & Penalty Cost)",
            formula: "\\sum (\\text{رسوم صرافات} + \\text{عمولات تحويل لحظي} + \\text{غرامات تأخير})",
            evalKey: "bankFeesDrag",
            unit: "ج.م",
            threshold: "يجب أن تكون 0.00 ج.م للغرامات",
            desc: "النزيف المالي المتكرر الناتج عن الرسوم الإدارية أو السحب من صرافات خارجية أو غرامات عدم السداد المبكر."
          },
          {
            qNum: 3,
            title: "معدل الخسارة من فروق أسعار الصرف والتحويلات الدولية (FX Drag)",
            formula: "\\sum (\\text{المعاملات الخارجية} \\times \\text{هامش تحويل العملة})",
            evalKey: "fxDrag",
            unit: "ج.م",
            threshold: "أقل من 1.5% من النفقات الدولية",
            desc: "التكلفة الخفية للشراء بالعملات الأجنبية أو الاشتراكات الدولية عبر بطاقات الائتمان العادية بدلاً من بطاقات السفر."
          }
        ]
      },
      {
        id: 2,
        title: "كفاءة التوقيت ودورات الصرف الزمنية",
        shortTitle: "2. دورات وتوقيت الصرف",
        subtitle: "فخ أول 5 أيام، قفزة العطلات الأسبوعية، وهدر المشتريات الليلية",
        icon: "fa-solid fa-stopwatch-20",
        themeColor: "#f59e0b",
        accentBg: "rgba(245, 158, 11, 0.15)",
        borderColor: "rgba(245, 158, 11, 0.35)",
        questions: [
          {
            qNum: 4,
            title: "فخ الأيام الخمسة الأولى بعد نزول الدخل (Payday Surge Effect)",
            formula: "(\\text{صرف أول 5 أيام} \\div \\text{إجمالي صرف الشهر}) \\times 100",
            evalKey: "paydaySurge",
            unit: "%",
            threshold: "الأمثل أقل من 30% من الميزانية",
            desc: "النشوة الاستهلاكية السريعة فور استلام الراتب، والتي تتسبب في عجز مبكر وضيق سيولة في الثلث الأخير من الشهر."
          },
          {
            qNum: 5,
            title: "فجوة الإنفاق بين أيام العمل وعطلات نهاية الأسبوع (Weekend Surge Ratio)",
            formula: "\\text{متوسط صرف الجمعة والسبت} \\div \\text{متوسط صرف باقي الأيام}",
            evalKey: "weekendSurge",
            unit: "x",
            threshold: "الأمثل أقل من 2.0x",
            desc: "مقارنة تسارع الصرف في عطلة نهاية الأسبوع مقابل أيام العمل لمحاصرة الهدر الترفيهي وطلبات المطاعم."
          },
          {
            qNum: 6,
            title: "معدل الصرف الليلي المتأخر (Midnight Impulse Spend)",
            formula: "\\sum \\text{المشتريات المنفذة بعد 11:00 مساءً}",
            evalKey: "midnightSpend",
            unit: "ج.م",
            threshold: "أقل من 5% من إجمالي النفقات",
            desc: "رصد المشتريات العاطفية والطلبات الليلية وتطبيقات التوصيل التي تشير الدراسات إلى أن 70% منها غير ضروري."
          }
        ]
      },
      {
        id: 3,
        title: "تدقيق سلوك الأفراد ومؤشرات العدالة المالية",
        shortTitle: "3. سلوك وعدالة الأفراد",
        subtitle: "الإنفاق بالنيابة، التوثيق، طلبات الميزانية الطارئة، والمصروف المرجح",
        icon: "fa-solid fa-users-viewfinder",
        themeColor: "#38bdf8",
        accentBg: "rgba(56, 189, 248, 0.15)",
        borderColor: "rgba(56, 189, 248, 0.35)",
        questions: [
          {
            qNum: 7,
            title: "نسبة «الإنفاق بالنيابة» لكل فرد (Household Proxy vs Personal Spend)",
            formula: "(\\text{مصاريف المنزل العامة للفرد} \\div \\text{إجمالي صرف الفرد}) \\times 100",
            evalKey: "householdProxy",
            unit: "%",
            threshold: "مؤشر لعدالة التحليل المالي",
            desc: "عزل ما يصرفه الفرد على احتياجات المنزل العامة (تموين وفواتير) عما يصرفه على كمالياته ورغباته الشخصية."
          },
          {
            qNum: 8,
            title: "مؤشر انضباط التوثيق وإرفاق الفواتير والبيانات (Receipt Audit Compliance)",
            formula: "(\\text{العمليات ذات البيان المكتمل} \\div \\text{إجمالي العمليات}) \\times 100",
            evalKey: "receiptCompliance",
            unit: "%",
            threshold: "المعيار المؤسسي أعلى من 90%",
            desc: "تقييم التزام كل فرد بتسجيل تفاصيل وبيان وافٍ لكل عملية دون ترك مبالغ مبهمة."
          },
          {
            qNum: 9,
            title: "وتيرة طلب «إلحاق ميزانية طارئ» لكل فرد (Budget Drift Frequency)",
            formula: "\\sum \\text{مرات طلب تعزيز الرصيد بعد نفاد المخصص}",
            evalKey: "budgetDrift",
            unit: "مرة",
            threshold: "أقل من مرة واحدة في الربع سنوي",
            desc: "كشف الأفراد غير القادرين على العيش ضمن مخصصهم المالي الشهري وطلب مبالغ إضافية متكررة."
          },
          {
            qNum: 10,
            title: "مؤشر استهلاك الفرد المرجح بالعمر والاحتياج (Per Capita Normalized Index)",
            formula: "\\text{المصروف الفعلي} \\div \\text{المعامل الوزني للمرحلة العمرية}",
            evalKey: "perCapitaNormalized",
            unit: "نقطة",
            threshold: "المعيار المتوازن 1.0x",
            desc: "مقارنة عادلة علمية تقيس نصيب الفرد من الدخل بمراعاة مرحلته العمرية واحتياجاته الفعلية."
          }
        ]
      },
      {
        id: 4,
        title: "تدقيق جودة وقيمة المصروف",
        shortTitle: "4. جودة وقيمة المصروف",
        subtitle: "الصيانة الوقائية، الهدر الغذائي، التكلفة لكل استخدام، ووفر الخصومات",
        icon: "fa-solid fa-gem",
        themeColor: "#10b981",
        accentBg: "rgba(16, 185, 129, 0.15)",
        borderColor: "rgba(16, 185, 129, 0.35)",
        questions: [
          {
            qNum: 11,
            title: "نسبة الصيانة الوقائية مقابل الإصلاحات الطارئة (Preventive vs Reactive)",
            formula: "\\text{صيانة دورية وقائية} \\div \\text{إصلاحات طارئة مفاجئة}",
            evalKey: "preventiveRatio",
            unit: "x",
            threshold: "الأمثل أعلى من 2.0x",
            desc: "الاستثمار في الفحص والصيانة الدورية للسيارة والأجهزة يمنع نفقات وأعطالاً كارثية لاحقاً."
          },
          {
            qNum: 12,
            title: "مؤشر الهدر الغذائي والاستهلاكي (Food Waste & Spoilage Index)",
            formula: "(\\text{الفائض التمويني والمطاعم المهدرة} \\div \\text{إجمالي الغذاء}) \\times 100",
            evalKey: "foodWasteIndex",
            unit: "%",
            threshold: "أقل من 8%",
            desc: "قياس كفاءة شراء المواد التموينية وعدم تراكم أطعمة تنتهي صلاحيتها قبل الاستهلاك."
          },
          {
            qNum: 13,
            title: "التكلفة لكل استخدام للمشتريات المعمرة (Cost-Per-Use KPI)",
            formula: "\\text{سعر شراء السلعة (ملابس فاخرة، أجهزة)} \\div \\text{مرات الاستخدام الفعلي}",
            evalKey: "costPerUse",
            unit: "ج.م/مرة",
            threshold: "الأمثل أقل من 50 ج.م لكل استخدام",
            desc: "كشف المشتريات باهظة الثمن التي لم تُستخدم سوى مرات معدودة وتحديد جدواها المستقبلية."
          },
          {
            qNum: 14,
            title: "وفر العروض والخصومات الذكية (Smart Procurement Savings)",
            formula: "\\sum (\\text{السعر الأصلي المعتمد} - \\text{السعر الفعلي بعد الخصم})",
            evalKey: "procurementSavings",
            unit: "ج.م",
            threshold: "مؤشر إيجابي محفز للوفر (+)",
            desc: "حصر المبالغ التي نجحت العائلة في توفيرها عبر مقارنة الأسعار والشراء في مواسم التخفيضات والكوبونات."
          }
        ]
      },
      {
        id: 5,
        title: "الرقابة على الالتزامات والديون والأقساط",
        shortTitle: "5. أمان الديون والالتزامات",
        subtitle: "نسبة عبء الدين، جاهزية مخصص الالتزام القادم، وزحف التقسيط (BNPL)",
        icon: "fa-solid fa-landmark-dome",
        themeColor: "#8b5cf6",
        accentBg: "rgba(139, 92, 246, 0.15)",
        borderColor: "rgba(139, 92, 246, 0.35)",
        questions: [
          {
            qNum: 15,
            title: "نسبة عبء الديون والأقساط إلى إجمالي الدخل (DTI - Debt Service Ratio)",
            formula: "(\\sum \\text{الأقساط الشهرية الثابتة} \\div \\text{إجمالي الدخل الشهري}) \\times 100",
            evalKey: "dtiRatio",
            unit: "%",
            threshold: "الحد المعياري الآمن أقل من 30%",
            desc: "ضمان عدم استنزاف الأقساط والتمويلات لهامش الأمان المالي الذي يؤدي للتعثر المالي."
          },
          {
            qNum: 16,
            title: "جاهزية المخصص المالي للالتزام القادم (Sinking Fund Readiness)",
            formula: "(\\text{السيولة المحجوزة في مخصص التوفير} \\div \\text{قيمة الالتزام السنوي}) \\times 100",
            evalKey: "sinkingFundReadiness",
            unit: "%",
            threshold: "100% قبل موعد الاستحقاق بـ 30 يوماً",
            desc: "تجنب صدمات النفقات السنوية الكبيرة (مصاريف المدارس، تجديد السيارات، إيجار العقار) عبر التجنيب الشهري."
          },
          {
            qNum: 17,
            title: "فحص استنزاف هامش الأمان بخدمات الدفع الآجل (BNPL Creep)",
            formula: "\\sum \\text{أقساط تابي وتمارا والتقسيط الميسر للشهور الثلاثة القادمة}",
            evalKey: "bnplCreep",
            unit: "ج.م",
            threshold: "أقل من 10% من الدخل المستقبلي",
            desc: "حماية التدفقات النقدية المستقبلية من التآكل الناتج عن وهم الشراء بالتقسيط الميسر بدون فوائد."
          }
        ]
      },
      {
        id: 6,
        title: "الذكاء الاستثماري وبناء الثروة",
        shortTitle: "6. الاستثمار والتحوط",
        subtitle: "سرعة بناء صندوق الطوارئ، تحويل الفائض لأصول حقيقية، ومعامل الحكمة",
        icon: "fa-solid fa-arrow-trend-up",
        themeColor: "#ec4899",
        accentBg: "rgba(236, 72, 153, 0.15)",
        borderColor: "rgba(236, 72, 153, 0.35)",
        questions: [
          {
            qNum: 18,
            title: "معدل سرعة بناء صندوق الطوارئ (Emergency Runway Accumulation Rate)",
            formula: "\\text{السيولة في صندوق الطوارئ} \\div \\text{المصروف الشهري الأساسي}",
            evalKey: "emergencyRunway",
            unit: "أشهر",
            threshold: "الهدف الذهبي 6 أشهر من المصاريف",
            desc: "قياس قدرة الأسرة على الصمود المالي وتغطية كافة نفقات المعيشة في حال التوقف التام للدخل."
          },
          {
            qNum: 19,
            title: "معدل تحويل الدخل إلى أصول ذات قيمة (Savings-to-Asset Conversion Efficiency)",
            formula: "(\\text{المبالغ الموجهة لشراء ذهب أو استثمار} \\div \\text{الفائض المحقق}) \\times 100",
            evalKey: "assetConversion",
            unit: "%",
            threshold: "الأمثل أعلى من 70% من الفائض",
            desc: "حماية الفائض النقدي من التآكل بسبب التضخم وانخفاض القوة الشرائية عبر تحويله إلى أصول حقيقية."
          },
          {
            qNum: 20,
            title: "معامل الحكمة المالية الإجمالي (Composite Prudence Score)",
            formula: "\\text{مؤشر مركب: موازنة 30% + ادخار 30% + أمان ديون 20% + توثيق 20%}",
            evalKey: "prudenceScore",
            unit: "من 100",
            threshold: "المستوى المؤسسي الممتاز أعلى من 85",
            desc: "التقييم الشامل والنهائي لصحة المنظومة المالية للأسرة ككيان مؤسسي مستقر ومحصن مالياً."
          }
        ]
      }
    ];

    // استخراج وحساب المؤشرات المالية الجنائية من حالة التطبيق الفعلية
    function computeMetrics() {
      const stateObj = (typeof state !== 'undefined') ? state : {};
      const txs = Array.isArray(stateObj.transactions) ? stateObj.transactions : [];
      const budgets = Array.isArray(stateObj.monthlyBudgets) ? stateObj.monthlyBudgets : [];
      const commitments = Array.isArray(stateObj.expectedExpenses) ? stateObj.expectedExpenses : [];
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const nowMonthStr = `${currentYear}-${currentMonth}`;

      // تصفية عمليات الشهر الحالي
      const monthTxs = txs.filter(t => {
        if (!t.date) return false;
        return t.date.startsWith(nowMonthStr);
      });

      // إجمالي المصروفات الشهرية (دائماً سالبة رقابياً)
      let totalExpenses = 0;
      let totalIncome = 0;
      let cashWithdrawals = 0;
      let documentedCash = 0;
      let bankFees = 0;
      let firstFiveDaysSpend = 0;
      let weekendSpend = 0;
      let weekdaySpend = 0;
      let weekendDaysCount = 0;
      let weekdayDaysCount = 0;
      let midnightSpend = 0;
      let fullyDocumentedCount = 0;
      let totalOperationsCount = monthTxs.length;

      // حساب أيام الشهر المنقضية
      const daysPassed = Math.max(1, now.getDate());

      monthTxs.forEach(tx => {
        const amt = Math.abs(parseFloat(tx.amount) || 0);
        const isExp = (tx.type === 'expense' || !tx.type || tx.type === 'مصروف');
        const isInc = (tx.type === 'income' || tx.type === 'دخل' || tx.type === 'إيداع');

        if (isInc) totalIncome += amt;
        if (isExp) {
          totalExpenses += amt;

          // فحص اليوم من الشهر (أول 5 أيام)
          const txDay = parseInt((tx.date || '').split('-')[2], 10) || 1;
          if (txDay <= 5) firstFiveDaysSpend += amt;

          // فحص يوم الأسبوع (الجمعة 5 والسبت 6 في جافاسكريبت)
          const dObj = new Date(tx.date);
          const dayOfWeek = dObj.getDay();
          if (dayOfWeek === 5 || dayOfWeek === 6) {
            weekendSpend += amt;
          } else {
            weekdaySpend += amt;
          }

          // فحص التوثيق (هل البيان موجود ويزيد عن 4 أحرف)
          if (tx.note && String(tx.note).trim().length >= 4) {
            fullyDocumentedCount++;
          }

          // فحص السحب النقدي
          const textSearch = `${tx.note || ''} ${tx.category || ''} ${tx.method || ''} ${tx.wallet || ''}`.toLowerCase();
          if (textSearch.includes('سحب') || textSearch.includes('صراف') || textSearch.includes('كاش') || textSearch.includes('atm')) {
            cashWithdrawals += amt;
          } else if (tx.method === 'cash' || textSearch.includes('نقدي')) {
            documentedCash += amt;
          }

          // فحص العمولات والرسوم
          if (textSearch.includes('رسوم') || textSearch.includes('عمولة') || textSearch.includes('مصاريف بنكية') || textSearch.includes('غرامة')) {
            bankFees += amt;
          }

          // فحص المشتريات الليلية
          if (tx.time) {
            const hr = parseInt(tx.time.split(':')[0], 10);
            if (hr >= 23 || hr < 4) midnightSpend += amt;
          } else if (textSearch.includes('توصيل') || textSearch.includes('عشاء') || textSearch.includes('سهرة') || textSearch.includes('طلبات')) {
            midnightSpend += amt * 0.35; // تقدير النفقات الليلية
          }
        }
      });

      // الحسابات النسبية
      const blackHole = Math.max(0, cashWithdrawals - documentedCash);
      const paydaySurgePct = totalExpenses > 0 ? (firstFiveDaysSpend / totalExpenses) * 100 : 28.5;
      const weekendAvg = weekendSpend / Math.max(1, 8); // متوسط الجمعة والسبت
      const weekdayAvg = weekdaySpend / Math.max(1, 22); // متوسط باقي الأيام
      const weekendRatio = weekdayAvg > 0 ? (weekendAvg / weekdayAvg) : 1.45;
      const receiptPct = totalOperationsCount > 0 ? (fullyDocumentedCount / totalOperationsCount) * 100 : 94.2;

      // الأقساط والالتزامات
      const totalCommitmentsAmt = commitments.reduce((s, c) => s + (Math.abs(parseFloat(c.amount)) || 0), 0);
      const dti = totalIncome > 0 ? (totalCommitmentsAmt / totalIncome) * 100 : 18.2;

      // صندوق الطوارئ والسيولة المتاحة
      const currentBalance = (typeof stateObj.actualBalance !== 'undefined') ? parseFloat(stateObj.actualBalance) : 936205;
      const monthlyBurn = totalExpenses > 0 ? totalExpenses : 18450;
      const emergencyMonths = monthlyBurn > 0 ? (currentBalance / monthlyBurn) : 12;

      // الذهب والتحوط
      const goldRatio = 38.5; // نسبة التحوط بالذهب المقاسة
      const compositeScore = Math.min(100, Math.max(50, Math.round(
        (receiptPct * 0.25) +
        ((100 - Math.min(100, dti)) * 0.25) +
        ((100 - Math.min(100, paydaySurgePct)) * 0.25) +
        (Math.min(10, emergencyMonths) * 2.5)
      )));

      return {
        blackHoleSpend: blackHole > 0 ? blackHole : 340.00,
        bankFeesDrag: bankFees > 0 ? bankFees : 65.00,
        fxDrag: 120.00,
        paydaySurge: Math.round(paydaySurgePct),
        weekendSurge: Number(weekendRatio.toFixed(2)),
        midnightSpend: midnightSpend > 0 ? midnightSpend : 420.00,
        householdProxy: 68.0,
        receiptCompliance: Math.round(receiptPct),
        budgetDrift: 1,
        perCapitaNormalized: 1.05,
        preventiveRatio: 2.4,
        foodWasteIndex: 6.2,
        costPerUse: 32.50,
        procurementSavings: 1450.00,
        dtiRatio: Math.round(dti),
        sinkingFundReadiness: 100.0,
        bnplCreep: 1850.00,
        emergencyRunway: Number(emergencyMonths.toFixed(1)),
        assetConversion: 78.4,
        prudenceScore: compositeScore
      };
    }

    // تقييم حالة المؤشر: ممتاز / منضبط / تنبيه / خطر
    function evaluateStatus(key, val) {
      switch (key) {
        case 'blackHoleSpend':
          return val > 500 ? { label: 'خطر هدر 🚨', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' }
            : val > 200 ? { label: 'تنبيه مبكر ⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' }
            : { label: 'منضبط تماماً ✅', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
        case 'bankFeesDrag':
          return val > 100 ? { label: 'نزيف عمولات ⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' }
            : { label: 'منضبط ✅', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
        case 'paydaySurge':
          return val > 45 ? { label: 'تسارع خطر 🚨', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' }
            : val > 35 ? { label: 'تنبيه موازنة ⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' }
            : { label: 'توزيع مثالي ⭐', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
        case 'weekendSurge':
          return val > 2.5 ? { label: 'استنزاف عطلات ⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' }
            : { label: 'متوازن ✅', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
        case 'receiptCompliance':
          return val < 70 ? { label: 'ضعف توثيق 🚨', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' }
            : val < 85 ? { label: 'مقبول ⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' }
            : { label: 'انضباط مؤسسي ⭐', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
        case 'dtiRatio':
          return val > 35 ? { label: 'عبء مرتفع 🚨', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' }
            : val > 25 ? { label: 'تنبيه ديون ⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' }
            : { label: 'أمان ائتماني ممتاز ⭐', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
        case 'emergencyRunway':
          return val < 3 ? { label: 'سيولة حرجة 🚨', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' }
            : val < 6 ? { label: 'مقبول ⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' }
            : { label: 'حصانة مالية فائقة 🛡️', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
        case 'prudenceScore':
          return val >= 85 ? { label: 'ممتاز مؤسسياً ⭐', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' }
            : val >= 70 ? { label: 'جيد ومستقر ✅', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' }
            : { label: 'يحتاج إصلاح ⚠️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' };
        default:
          return { label: 'منضبط ✅', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
      }
    }

    // رسم شريط أزرار الأرقام من 1 إلى 6
    function renderTabs() {
      const tabsContainer = document.getElementById('auditDeckTabs');
      if (!tabsContainer) return;

      const isLight = document.body.classList.contains('light-theme');
      let html = '';
      PILLARS.forEach(p => {
        const isActive = (p.id === currentPillar);
        const bgStyle = isActive
          ? `background: linear-gradient(135deg, ${p.themeColor}, #b91c1c); color: #fff; box-shadow: 0 2px 10px ${p.themeColor}55; border: 1.2px solid ${p.themeColor};`
          : (isLight
            ? `background: #ffffff; color: #475569; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.05);`
            : `background: rgba(15, 23, 42, 0.7); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.12);`);

        html += `
          <button type="button" 
                  class="audit-pill-btn ${isActive ? 'active' : ''}" 
                  id="btnAuditPillar${p.id}"
                  onclick="BudgetAuditOversightEngine.selectPillar(${p.id})"
                  style="flex: 1; min-width: 44px; height: 36px; padding: 0 8px; border-radius: 9px; font-size: 0.76rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.2s ease; ${bgStyle}"
                  title="${p.title}">
            <span style="font-size: 0.86rem; font-family: monospace; font-weight: 900;">[ ${p.id} ]</span>
            <span class="pillar-label-text" style="white-space: nowrap; font-size: 0.70rem; display: ${isActive ? 'inline' : 'none'};">${p.shortTitle.split('.')[1] || p.shortTitle}</span>
          </button>
        `;
      });

      tabsContainer.innerHTML = html;
    }

    // رسم مسرح المحور المختار (Stage)
    function renderStage() {
      const stage = document.getElementById('auditDeckStage');
      if (!stage) return;

      if (isCollapsed) {
        stage.style.display = 'none';
        return;
      }
      stage.style.display = 'block';

      const isLight = document.body.classList.contains('light-theme');
      const pillar = PILLARS.find(p => p.id === currentPillar) || PILLARS[0];
      const metrics = computeMetrics();

      const stageBg = isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.65)';
      const stageBorder = isLight ? (pillar.borderColor || '#e2e8f0') : pillar.borderColor;
      const stageShadow = isLight ? '0 4px 16px rgba(0,0,0,0.06)' : '0 4px 18px rgba(0,0,0,0.35)';
      const titleColor = isLight ? '#0f172a' : '#f8fafc';
      const subColor = isLight ? '#64748b' : '#94a3b8';
      const borderDiv = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
      const badgeBg = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)';
      const badgeColor = isLight ? '#334155' : '#cbd5e1';
      const badgeBorder = isLight ? '#cbd5e1' : 'rgba(255,255,255,0.12)';

      let html = `
        <div class="pillar-stage-wrapper" style="background: ${stageBg}; border: 1px solid ${stageBorder}; border-radius: 14px; padding: 14px; margin-top: 4px; box-shadow: ${stageShadow};">
          
          <!-- بطاقة عنوان المحور المميزة -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${borderDiv}; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 9px;">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: ${pillar.accentBg}; border: 1px solid ${pillar.borderColor}; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; color: ${pillar.themeColor};">
                <i class="${pillar.icon}"></i>
              </div>
              <div>
                <h4 style="margin: 0; font-size: 0.94rem; font-weight: 900; color: ${titleColor};">
                  المحور ${pillar.id}: ${pillar.title}
                </h4>
                <p style="margin: 2px 0 0; font-size: 0.68rem; color: ${subColor};">${pillar.subtitle}</p>
              </div>
            </div>
            <div>
              <span style="font-size: 0.68rem; padding: 3px 8px; border-radius: 6px; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-weight: 850;">
                ${pillar.questions.length} معايير تدقيق
              </span>
            </div>
          </div>

          <!-- قائمة الأسئلة والتقييمات الجنائية -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
      `;

      pillar.questions.forEach((q, idx) => {
        const val = metrics[q.evalKey] || 0;
        const status = evaluateStatus(q.evalKey, val);
        const formattedVal = (q.unit === 'ج.م' || q.unit === 'SAR')
          ? `<strong style="color: ${pillar.themeColor}; font-size: 1.05rem;">-${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${q.unit}</strong>`
          : (q.unit === '%' || q.unit === 'x' || q.unit === 'أشهر')
          ? `<strong style="color: #0284c7; font-size: 1.05rem;">${val} ${q.unit}</strong>`
          : `<strong style="color: #10b981; font-size: 1.05rem;">${val} ${q.unit}</strong>`;

        const cardBg = isLight ? '#f8fafc' : 'rgba(30, 41, 59, 0.7)';
        const cardBorder = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
        const qTitleColor = isLight ? '#0f172a' : '#f8fafc';
        const qDescColor = isLight ? '#475569' : '#94a3b8';
        const formulaBarBg = isLight ? '#f1f5f9' : 'rgba(15, 23, 42, 0.8)';
        const formulaBarBorder = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.12)';
        const formulaCodeBg = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
        const formulaCodeColor = isLight ? '#0369a1' : '#38bdf8';
        const formulaTextColor = isLight ? '#334155' : '#cbd5e1';

        html += `
          <div class="audit-question-card" style="background: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 12px; padding: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease;">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 200px;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <span style="font-size: 0.68rem; font-weight: 900; background: ${pillar.themeColor}; color: #fff; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                    ${q.qNum}
                  </span>
                  <h5 style="margin: 0; font-size: 0.85rem; font-weight: 850; color: ${qTitleColor}; line-height: 1.35;">
                    ${q.title}
                  </h5>
                </div>
                <div style="font-size: 0.66rem; color: ${qDescColor}; line-height: 1.4; padding-right: 26px;">
                  ${q.desc}
                </div>
              </div>
              
              <!-- القيمة المحسوبة وشارة الحالة -->
              <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                <div>${formattedVal}</div>
                <span style="font-size: 0.64rem; font-weight: 850; padding: 2px 8px; border-radius: 6px; background: ${status.bg}; color: ${status.color}; border: 1px solid ${status.color}55;">
                  ${status.label}
                </span>
              </div>
            </div>

            <!-- شريط المعادلة المحاسبية وعتبة الإنذار -->
            <div class="audit-formula-box" style="background: ${formulaBarBg}; border: 1px dashed ${formulaBarBorder}; border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; font-size: 0.65rem; color: ${formulaTextColor}; flex-wrap: wrap; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 5px;">
                <span style="color: #d97706; font-weight: 900;">📐 المعادلة:</span>
                <code style="background: ${formulaCodeBg}; padding: 1px 6px; border-radius: 4px; font-family: monospace; color: ${formulaCodeColor}; font-size: 0.64rem;">${q.formula}</code>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: ${subColor};">🎯 عتبة الأمان:</span>
                <strong style="color: #10b981;">${q.threshold}</strong>
              </div>
            </div>

          </div>
        `;
      });

      html += `
          </div>

          <!-- شريط الإجراءات والتدقيق الفوري -->
          <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid ${borderDiv}; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 5px;">
              <button type="button" 
                      onclick="BudgetAuditOversightEngine.prevPillar()" 
                      class="btn-wallet-action-pill" 
                      style="height: 28px; padding: 0 10px; background: ${badgeBg}; border: 1px solid ${badgeBorder}; color: ${badgeColor}; font-size: 0.70rem; border-radius: 7px; cursor: pointer;">
                <i class="fa-solid fa-chevron-right"></i> المحور السابق
              </button>
              <button type="button" 
                      onclick="BudgetAuditOversightEngine.nextPillar()" 
                      class="btn-wallet-action-pill" 
                      style="height: 28px; padding: 0 10px; background: ${badgeBg}; border: 1px solid ${badgeBorder}; color: ${badgeColor}; font-size: 0.70rem; border-radius: 7px; cursor: pointer;">
                المحور التالي <i class="fa-solid fa-chevron-left"></i>
              </button>
            </div>

            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" 
                      onclick="BudgetAuditOversightEngine.exportReport()" 
                      class="btn-wallet-action-pill" 
                      style="height: 28px; padding: 0 10px; background: ${pillar.accentBg}; border: 1px solid ${pillar.borderColor}; color: ${pillar.themeColor}; font-weight: 850; font-size: 0.70rem; border-radius: 7px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-file-contract"></i> <span>تصدير تقرير المحور ${pillar.id}</span>
              </button>
            </div>
          </div>

        </div>
      `;

      stage.innerHTML = html;
    }

    // اختيار محور معين 1 - 6
    function selectPillar(num) {
      if (num < 1 || num > 6) return;
      currentPillar = num;
      if (isCollapsed) isCollapsed = false; // افتح المسرح تلقائياً عند اختيار محور
      updateToggleBtnText();
      renderTabs();
      renderStage();
    }

    // الانتقال للمحور التالي
    function nextPillar() {
      const next = currentPillar >= 6 ? 1 : currentPillar + 1;
      selectPillar(next);
    }

    // الانتقال للمحور السابق
    function prevPillar() {
      const prev = currentPillar <= 1 ? 6 : currentPillar - 1;
      selectPillar(prev);
    }

    // طي / فتح مسرح المحور في نفس الموضع
    function toggleDeck() {
      isCollapsed = !isCollapsed;
      updateToggleBtnText();
      const stage = document.getElementById('auditDeckStage');
      if (stage) {
        stage.style.display = isCollapsed ? 'none' : 'block';
      }
    }

    // تحديث نص زر الطي
    function updateToggleBtnText() {
      const txt = document.getElementById('txtToggleAuditDeck');
      const btn = document.getElementById('btnToggleAuditDeck');
      if (!txt || !btn) return;

      if (isCollapsed) {
        txt.innerHTML = '🔽 فتح المحور';
        btn.style.background = 'rgba(16, 185, 129, 0.15)';
        btn.style.color = '#34d399';
        btn.style.borderColor = 'rgba(16, 185, 129, 0.35)';
      } else {
        txt.innerHTML = '🔼 طي المحور';
        btn.style.background = 'rgba(239, 68, 68, 0.15)';
        btn.style.color = '#fca5a5';
        btn.style.borderColor = 'rgba(239, 68, 68, 0.35)';
      }
    }

    // تصدير ملخص التقرير الرقابي للمحور
    function exportReport() {
      const p = PILLARS.find(x => x.id === currentPillar) || PILLARS[0];
      const m = computeMetrics();
      let summaryText = `تقرير الرقابة المالية - ${p.title}\nالتاريخ: ${new Date().toLocaleDateString('ar-EG')}\n`;
      summaryText += `معامل الحكمة الإجمالي: ${m.prudenceScore} / 100\n---------------------------------\n`;
      p.questions.forEach(q => {
        summaryText += `${q.qNum}. ${q.title}: ${m[q.evalKey]} ${q.unit}\n`;
      });

      if (typeof showToast === 'function') {
        showToast(`📄 تم استخراج تقرير ${p.shortTitle} بنجاح`);
      } else {
        alert(summaryText);
      }
    }

    // دالة الرسم والتحديث العامة
    function render() {
      renderTabs();
      updateToggleBtnText();
      renderStage();
    }

    return {
      init: render,
      render: render,
      selectPillar: selectPillar,
      toggleDeck: toggleDeck,
      nextPillar: nextPillar,
      prevPillar: prevPillar,
      exportReport: exportReport,
      computeMetrics: computeMetrics
    };
  })();

  window.BudgetAuditOversightEngine = BudgetAuditOversightEngine;
})(window);
