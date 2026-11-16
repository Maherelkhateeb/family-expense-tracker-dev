/**
 * Voice Assistant Engine v5.3.82
 * Local Arabic NLP Speech-to-Transaction Suite
 */
const VoiceAssistantEngine = (() => {
  let _recognition = null;
  let _isListening = false;
  let _currentParsed = null;

  function normalizeArabic(text) {
    if (!text) return '';
    return text
      .replace(/[إأآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .trim();
  }

  // Raw Arabic Numbers Mapping
  const RAW_AR_NUMS = {
    'صفر': 0, 'واحد': 1, 'واحدة': 1, 'اثنان': 2, 'اثنين': 2, 'ثلاثة': 3, 'ثلاث': 3, 'تلاتة': 3,
    'اربعة': 4, 'أربعة': 4, 'اربع': 4, 'خمسة': 5, 'خمس': 5, 'ستة': 6, 'ست': 6,
    'سبعة': 7, 'سبع': 7, 'ثمانية': 8, 'ثماني': 8, 'ثمان': 8, 'تمانية': 8, 'تسعة': 9, 'تسع': 9,
    'عشرة': 10, 'عشر': 10, 'احد عشر': 11, 'إحدى عشر': 11, 'اثنا عشر': 12, 'اثني عشر': 12,
    'عشرين': 20, 'عشرون': 20, 'ثلاثين': 30, 'ثلاثون': 30, 'تلاتين': 30, 'اربعين': 40, 'أربعين': 40, 'اربعون': 40,
    'خمسين': 50, 'خمسون': 50, 'ستين': 60, 'ستون': 60, 'سبعين': 70, 'سبعون': 70,
    'ثمانين': 80, 'ثمانون': 80, 'تمانين': 80, 'تسعين': 90, 'تسعون': 90,
    'مية': 100, 'مائة': 100, 'مئة': 100, 'ميه': 100,
    'ميتين': 200, 'مائتين': 200, 'مئتان': 200, 'ثلاثمائة': 300, 'تلتمية': 300, 'تلتميه': 300,
    'اربعمائة': 400, 'خمسمائة': 500, 'خمسمية': 500, 'خمسميه': 500,
    'ستمائة': 600, 'سبعمائة': 700, 'ثمانمائة': 800, 'تسعمائة': 900,
    'الف': 1000, 'ألف': 1000, 'الفين': 2000, 'ألفين': 2000, 'الاف': 1000,
    'مليون': 1000000, 'نصف': 0.5, 'نص': 0.5, 'ربع': 0.25
  };

  const AR_NUMS = {};
  for (const k in RAW_AR_NUMS) {
    AR_NUMS[normalizeArabic(k)] = RAW_AR_NUMS[k];
  }

  function parseArabicAmount(text) {
    if (!text) return 0;
    // 1. Direct digits
    const digitMatch = text.match(/(\d+(?:\.\d+)?)/);
    if (digitMatch) {
      return parseFloat(digitMatch[1]);
    }
    // 2. Arabic words parser
    const words = text.split(/\s+/);
    let total = 0;
    let current = 0;
    for (const rawW of words) {
      let w = normalizeArabic(rawW);
      // Remove leading conjunction 'و' if word not in AR_NUMS (e.g. 'وخمسين' -> 'خمسين', 'وميه' -> 'ميه')
      if (AR_NUMS[w] === undefined && w.startsWith('و') && w.length > 2) {
        w = w.slice(1);
      }
      if (AR_NUMS[w] !== undefined) {
        const val = AR_NUMS[w];
        if (val === 1000 || val === 2000) {
          current = (current === 0 ? 1 : current) * val;
          total += current;
          current = 0;
        } else {
          total += val;
        }
      }
    }
    total += current;
    return total;
  }

  function parseSpokenText(raw) {
    const norm = normalizeArabic(raw);
    const result = {
      rawText: raw,
      type: 'expense', // 'expense' | 'debt_for_us' | 'debt_on_us' | 'bill' | 'project'
      amount: 0,
      category: 'other',
      label: raw,
      walletId: (window.state && state.currentWalletId) || 'cash',
      member: (window.state && state.members && state.members[0] && state.members[0].name) || 'البيت',
      projectName: null,
      projectItem: null,
      personName: null
    };

    // 1. Extract Amount
    result.amount = parseArabicAmount(raw);

    // 2. Detect Intent / Type
    if (/سلفت|اقرضت|استلف مني|دين لي|اعطيت .* دين|لي عند/.test(norm)) {
      result.type = 'debt_for_us';
      const mPerson = raw.match(/(?:سلفت|اقرضت|استلف مني|لي عند|اعطيت)\s+([\u0600-\u06FFa-zA-Z]+)/);
      if (mPerson) result.personName = mPerson[1];
    } else if (/تسلفت|استلفت|دين علي|اقترضت من|علي ل/.test(norm)) {
      result.type = 'debt_on_us';
      const mPerson = raw.match(/(?:تسلفت من|استلفت من|اقترضت من|علي ل)\s+([\u0600-\u06FFa-zA-Z]+)/);
      if (mPerson) result.personName = mPerson[1];
    } else if (/فاتوره|قسط|اشتراك|ايجار|سداد كهرباء|سداد نت|مياه|فاتورة/.test(norm)) {
      result.type = 'bill';
      result.category = 'bills';
    } else if (/مشروع/.test(norm)) {
      result.type = 'project';
      if (typeof getKnownProjects === 'function') {
        const known = getKnownProjects();
        for (const p of known) {
          if (raw.includes(p)) {
            result.projectName = p;
            break;
          }
        }
      }
    }

    // 3. Match Category if expense
    if (result.type === 'expense') {
      if (/بنزين|سياره|اوبر|تاكسي|مواصلات|كارته|موقف/.test(norm)) result.category = 'transport';
      else if (/اكل|مطعم|سوبرماركت|خضار|لحوم|جبن|لبن|عيش|طعام|فطار|غدا|عشا/.test(norm)) result.category = 'food';
      else if (/دواء|صيدليه|علاج|كشف|طبيب|دكتور|تحليل|مستشفي/.test(norm)) result.category = 'health';
      else if (/قهوه|كافيه|مصروف|شاي|سجاير|يومي/.test(norm)) result.category = 'daily';
      else if (/منزل|ادوات|صيانه|منظفات|كهرباء بيت|سباكه/.test(norm)) result.category = 'house';
      else if (/ملابس|قميص|حذاء|بنطلون|فستان|جاكت/.test(norm)) result.category = 'clothes';
      else if (/مدرسه|دروس|جامعه|كتب|تعليم|كورس/.test(norm)) result.category = 'education';
      else if (/فاتوره|نت|شحن|موبايل/.test(norm)) result.category = 'bills';
      else result.category = 'other';
    }

    // 4. Match Wallet
    if (window.state && Array.isArray(state.wallets)) {
      for (const w of state.wallets) {
        const wNameNorm = normalizeArabic(w.name);
        if (wNameNorm && norm.includes(wNameNorm)) {
          result.walletId = w.id;
          break;
        }
      }
    }

    return result;
  }

  function initSpeech() {
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechClass) return false;

    _recognition = new SpeechClass();
    _recognition.lang = 'ar-EG';
    _recognition.interimResults = true;
    _recognition.continuous = false;

    _recognition.onstart = () => {
      _isListening = true;
      const fab = document.getElementById('btnVoiceAssistantFab');
      const overlay = document.getElementById('voiceLiveOverlay');
      if (fab) {
        fab.classList.add('is-listening');
        fab.innerHTML = '<i class="fa-solid fa-microphone-lines"></i>';
      }
      if (overlay) {
        overlay.classList.add('show');
        document.getElementById('voiceLiveText').textContent = 'جارٍ الاستماع... تفضل بالتحدث';
      }
    };

    _recognition.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      const text = final || interim;
      const liveEl = document.getElementById('voiceLiveText');
      if (liveEl && text) liveEl.textContent = text;

      if (final) {
        handleSpokenResult(final);
      }
    };

    _recognition.onerror = (e) => {
      console.warn('[Voice Assistant] Error:', e.error);
      stopListening();
      if (typeof showToast === 'function') {
        if (e.error === 'not-allowed') showToast('⚠️ يرجى السماح بالوصول إلى المايك لتفعيل التسجيل الصوتي');
        else if (e.error !== 'no-speech') showToast('⚠️ تعذر التعرف على الصوت، حاول مرة أخرى');
      }
    };

    _recognition.onend = () => {
      stopListening();
    };

    return true;
  }

  function toggleListening() {
    if (_isListening) {
      stopListening();
      return;
    }
    if (!_recognition && !initSpeech()) {
      if (typeof showToast === 'function') {
        showToast('⚠️ متصفحك الحالي لا يدعم التعرف الصوتي المباشر، يُرجى استخدام Chrome أو Edge');
      }
      return;
    }
    try {
      _recognition.start();
    } catch (err) {
      console.warn('Speech start error:', err);
    }
  }

  function stopListening() {
    _isListening = false;
    const fab = document.getElementById('btnVoiceAssistantFab');
    const overlay = document.getElementById('voiceLiveOverlay');
    if (fab) {
      fab.classList.remove('is-listening', 'is-processing');
      fab.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    }
    if (overlay) overlay.classList.remove('show');
    if (_recognition) {
      try { _recognition.stop(); } catch (e) {}
    }
  }

  function handleSpokenResult(rawText) {
    stopListening();
    const fab = document.getElementById('btnVoiceAssistantFab');
    if (fab) fab.classList.add('is-processing');

    const parsed = parseSpokenText(rawText);
    _currentParsed = parsed;

    setTimeout(() => {
      if (fab) fab.classList.remove('is-processing');
      openConfirmDrawer(parsed);
    }, 250);
  }

  function openConfirmDrawer(p) {
    const drawer = document.getElementById('voiceConfirmDrawer');
    const backdrop = document.getElementById('voiceDrawerBackdrop');
    if (!drawer || !backdrop) return;

    // Type Badge config
    let badgeHtml = '';
    let typeLabel = '';
    let signPrefix = '- ';
    let amountColor = '#f87171';

    if (p.type === 'debt_for_us') {
      typeLabel = '🟢 دين لنا (إقراض)';
      badgeHtml = `<span style="background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:8px;padding:3px 10px;font-size:0.76rem;font-weight:900;"><i class="fa-solid fa-hand-holding-dollar"></i> دين لنا</span>`;
      signPrefix = '+ ';
      amountColor = '#34d399';
    } else if (p.type === 'debt_on_us') {
      typeLabel = '🔴 دين علينا (استدانة)';
      badgeHtml = `<span style="background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.4);border-radius:8px;padding:3px 10px;font-size:0.76rem;font-weight:900;"><i class="fa-solid fa-handshake-angle"></i> دين علينا</span>`;
    } else if (p.type === 'bill') {
      typeLabel = '⚡ فاتورة / التزام دوري';
      badgeHtml = `<span style="background:rgba(245,158,11,0.2);color:#fbbf24;border:1px solid rgba(245,158,11,0.4);border-radius:8px;padding:3px 10px;font-size:0.76rem;font-weight:900;"><i class="fa-solid fa-bolt"></i> التزام دوري</span>`;
    } else if (p.type === 'project') {
      typeLabel = '🟣 مصروف مشروع خاص';
      badgeHtml = `<span style="background:rgba(168,85,247,0.2);color:#c084fc;border:1px solid rgba(168,85,247,0.4);border-radius:8px;padding:3px 10px;font-size:0.76rem;font-weight:900;"><i class="fa-solid fa-trowel-bricks"></i> مشروع</span>`;
    } else {
      typeLabel = '🔷 مصروف عادي';
      badgeHtml = `<span style="background:rgba(14,165,233,0.2);color:#38bdf8;border:1px solid rgba(14,165,233,0.4);border-radius:8px;padding:3px 10px;font-size:0.76rem;font-weight:900;"><i class="fa-solid fa-cart-shopping"></i> مصروف عادي</span>`;
    }

    const catObj = (typeof getCategoryObj === 'function') ? getCategoryObj(p.category, 'expense') : { name: p.category, icon: 'fa-tag', color: '#38bdf8' };
    const walletObj = (window.state && state.wallets) ? state.wallets.find(w => w.id === p.walletId) : null;
    const walletName = walletObj ? walletObj.name : 'الرئيسية';
    const formatVal = (typeof formatMoneyVal === 'function') ? formatMoneyVal : (v) => (v || 0).toLocaleString() + ' ج.م';

    const bodyEl = document.getElementById('voiceConfirmDrawerBody');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px;">
          <div>
            <div style="font-size:0.74rem;color:#94a3b8;">التعرف الصوتي الذكي</div>
            <div style="font-size:1.0rem;font-weight:900;color:#f8fafc;display:flex;align-items:center;gap:6px;">
              ${badgeHtml}
            </div>
          </div>
          <div style="text-align:left;">
            <div style="font-size:0.68rem;color:#94a3b8;">المبلغ المكتشف</div>
            <div style="font-size:1.25rem;font-weight:900;color:${amountColor};direction:ltr;font-family:var(--font-numbers);">
              ${p.amount > 0 ? `${signPrefix}${formatVal(p.amount)}` : '<span style="color:#fbbf24;font-size:0.9rem;">⚠️ حدد المبلغ</span>'}
            </div>
          </div>
        </div>

        <div class="voice-card-box" style="background:rgba(15,23,42,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 12px;margin-bottom:12px;display:flex;flex-direction:column;gap:6px;">
          <div style="display:flex;justify-content:space-between;font-size:0.80rem;">
            <span style="color:#94a3b8;"><i class="fa-solid fa-quote-right" style="color:#38bdf8;"></i> العبارة المنطوقة:</span>
            <span style="color:#f8fafc;font-weight:800;">"${p.rawText}"</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.80rem;">
            <span style="color:#94a3b8;"><i class="fa-solid fa-shapes" style="color:${catObj.color || '#38bdf8'};"></i> البند:</span>
            <span style="color:#f8fafc;font-weight:800;">${catObj.name}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.80rem;">
            <span style="color:#94a3b8;"><i class="fa-solid fa-wallet" style="color:#fbbf24;"></i> المحفظة:</span>
            <span style="color:#f8fafc;font-weight:800;">${walletName}</span>
          </div>
          ${p.projectName ? `
            <div style="display:flex;justify-content:space-between;font-size:0.80rem;">
              <span style="color:#94a3b8;"><i class="fa-solid fa-folder-tree" style="color:#c084fc;"></i> المشروع:</span>
              <span style="color:#c084fc;font-weight:900;">${p.projectName}</span>
            </div>
          ` : ''}
          ${p.personName ? `
            <div style="display:flex;justify-content:space-between;font-size:0.80rem;">
              <span style="color:#94a3b8;"><i class="fa-solid fa-user" style="color:#34d399;"></i> الشخص:</span>
              <span style="color:#34d399;font-weight:900;">${p.personName}</span>
            </div>
          ` : ''}
        </div>
      `;
    }

    backdrop.classList.add('open');
    drawer.classList.add('open');
  }

  function closeConfirmDrawer() {
    const drawer = document.getElementById('voiceConfirmDrawer');
    const backdrop = document.getElementById('voiceDrawerBackdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    _currentParsed = null;
  }

  function commitTransaction() {
    if (!_currentParsed) return;
    const p = _currentParsed;
    if (!p.amount || p.amount <= 0) {
      if (typeof showToast === 'function') showToast('⚠️ تعذر تحديد المبلغ من الصوت، يرجى الفتح للتعديل');
      openInModalForEdit();
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    if (p.type === 'debt_for_us' || p.type === 'debt_on_us') {
      if (!window.state.debts) window.state.debts = [];
      const newDebt = {
        id: 'd_' + Date.now(),
        person: p.personName || 'شخص غير محدد',
        type: (p.type === 'debt_for_us') ? 'for_us' : 'on_us',
        amount: p.amount,
        remaining: p.amount,
        date: todayStr,
        notes: `مسجل صوتياً: ${p.rawText}`
      };
      state.debts.unshift(newDebt);
      if (typeof saveDebts === 'function') saveDebts();
      if (typeof showToast === 'function') showToast(`✅ تم تسجيل الدين (${newDebt.person}) بنجاح`);
    } else if (p.type === 'bill') {
      if (!window.state.expectedExpenses) window.state.expectedExpenses = [];
      const newBill = {
        id: 'exp_' + Date.now(),
        name: p.label || 'فاتورة دورية',
        category: p.category || 'bills',
        amount: p.amount,
        dueDate: todayStr,
        period: 'monthly',
        status: 'unpaid',
        notes: `مسجل صوتياً: ${p.rawText}`
      };
      state.expectedExpenses.unshift(newBill);
      if (typeof saveExpectedExpenses === 'function') saveExpectedExpenses();
      if (typeof showToast === 'function') showToast(`✅ تم جدولة الفاتورة (${newBill.name}) بنجاح`);
    } else {
      // Standard Expense / Project Expense
      const newTx = {
        id: 'tx_' + Date.now(),
        date: todayStr,
        type: 'expense',
        category: p.category || 'other',
        amount: p.amount,
        label: p.label || 'مصروف صوتي',
        walletId: p.walletId,
        member: p.member || 'البيت',
        project: p.projectName || null,
        projectItem: p.projectItem || null,
        notes: `مسجل صوتياً: ${p.rawText}`,
        createdAt: new Date().toISOString()
      };

      if (!window.state.transactions) window.state.transactions = [];
      state.transactions.unshift(newTx);

      // Deduct from wallet
      if (window.state.wallets) {
        const w = state.wallets.find(x => x.id === p.walletId);
        if (w) w.balance = (w.balance || 0) - p.amount;
      }

      if (typeof saveTx === 'function') saveTx();
      else if (typeof saveTransactions === 'function') saveTransactions();

      if (typeof logActivity === 'function') {
        logActivity('voice_tx_add', `إضافة مصروف صوتي: ${newTx.label} بمبلغ ${newTx.amount}`);
      }
      if (typeof showToast === 'function') {
        showToast(`✅ تم تسجيل المصروف (-${p.amount} ج.م) بنجاح`);
      }
    }

    closeConfirmDrawer();
    if (typeof refreshAppDisplay === 'function') refreshAppDisplay();
    else if (typeof renderTransactionsTable === 'function') renderTransactionsTable();
  }

  function openInModalForEdit() {
    if (!_currentParsed) return;
    const p = _currentParsed;
    closeConfirmDrawer();

    if (p.type === 'debt_for_us' || p.type === 'debt_on_us') {
      if (typeof openDebtModal === 'function') openDebtModal();
    } else if (p.type === 'bill') {
      if (typeof openExpectedExpenseModal === 'function') openExpectedExpenseModal();
    } else {
      if (typeof openTxModal === 'function') {
        openTxModal('expense');
        setTimeout(() => {
          const amtInput = document.getElementById('txAmount');
          const lblInput = document.getElementById('txLabel');
          const catSelect = document.getElementById('txCategory');
          const walSelect = document.getElementById('txWallet');
          if (amtInput && p.amount > 0) amtInput.value = p.amount;
          if (lblInput) lblInput.value = p.label || '';
          if (catSelect && p.category) catSelect.value = p.category;
          if (walSelect && p.walletId) walSelect.value = p.walletId;
        }, 150);
      }
    }
  }

  return {
    toggleListening,
    stopListening,
    commitTransaction,
    openInModalForEdit,
    closeConfirmDrawer,
    parseSpokenText
  };
})();

window.VoiceAssistantEngine = VoiceAssistantEngine;
