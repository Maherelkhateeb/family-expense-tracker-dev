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
    return String(text).normalize('NFKC')
      .replace(/[\u064b-\u065f\u0670\u0640]/g, '')
      .replace(/[إأآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/٫/g, '.').replace(/٬/g, ',')
      .replace(/[،؛؟!]/g, ' ').replace(/\s+/g, ' ').trim();
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
    const norm = normalizeArabic(text);
    if (!norm) return 0;

    // Currency-marked amounts take priority over dates or incidental numbers.
    const numberPattern = '([0-9][0-9,]*(?:\\.[0-9]+)?)';
    const currency = new RegExp(numberPattern + '\\s*(?:جنيه|جنيهات|جنيها|ريال|ريالات|ريالا|درهم|دولار|دينار)', 'i');
    const verb = new RegExp('(?:صرفت|دفعت|اشتريت|اودعت|استلمت|قبضت|دخل|سلفت|استلفت|سددت|بمبلغ|بقيمة|ب|مبلغ)\\s*' + numberPattern, 'i');
    const direct = norm.match(currency) || norm.match(verb) || norm.match(new RegExp(numberPattern));
    if (direct) {
      const value = Number(direct[1].replace(/,/g, ''));
      if (Number.isFinite(value) && value > 0) return value;
    }

    const words = norm.split(/\s+/);
    let total = 0, group = 0, found = false, lastScale = 1;
    for (let i = 0; i < words.length; i++) {
      let word = words[i].replace(/^[^\u0621-\u064a]+|[^\u0621-\u064a]+$/g, '');
      if (word.startsWith('ب') && AR_NUMS[word.slice(1)] !== undefined) word = word.slice(1);
      if (word.startsWith('ال') && AR_NUMS[word.slice(2)] !== undefined) word = word.slice(2);
      if (AR_NUMS[word] === undefined && word.startsWith('و') && word.length > 2) word = word.slice(1);
      const next = words[i + 1] ? normalizeArabic(words[i + 1]) : '';
      if (AR_NUMS[word + ' ' + next] !== undefined) {
        word += ' ' + next;
        i++;
      }
      const val = AR_NUMS[word];
      if (val === undefined) continue;
      found = true;
      if (val >= 1000000 || val === 1000 || val === 2000) {
        const multiplier = val;
        total += (group || 1) * multiplier;
        group = 0;
        lastScale = multiplier === 2000 ? 1000 : multiplier;
      } else if (val === 0.5 || val === 0.25) {
        if (total > 0 && group === 0) total += lastScale * val;
        else group += val;
      } else if (val >= 100 && val < 1000 && group > 0 && group < 10) {
        group *= val;
      } else {
        group += val;
      }
    }
    return found ? total + group : 0;
  }

    function parseSpokenText(raw) {
    const norm = normalizeArabic(raw);
    const appState = typeof state !== 'undefined' ? state : null;
    const result = {
      rawText: String(raw || ''), type: 'expense',
      amount: parseArabicAmount(raw), category: 'other', label: String(raw || '').trim(),
      walletId: appState && appState.currentWalletId && appState.currentWalletId !== 'all'
        ? appState.currentWalletId : ((appState && appState.wallets && appState.wallets[0] && appState.wallets[0].id) || 'cash'),
      member: (appState && (appState.currentUser || appState.selectedMember) && appState.selectedMember !== 'الكل'
        ? (appState.selectedMember || appState.currentUser) : 'البيت'),
      projectName: null, projectItem: null, personName: null
    };
    // Match borrowing before lending: "تسلفت" contains "سلفت".
    if (/تسلفت|استلفت|دين علي|اقترضت من|علي ل/.test(norm)) {
      result.type = 'debt_on_us';
      const person = norm.match(/(?:تسلفت من|استلفت من|اقترضت من|علي ل)\s+([\u0621-\u064a]+)/);
      if (person) result.personName = person[1];
    } else if (/سلفت|اقرضت|استلف مني|دين لي|لي عند|اعطيت.*دين/.test(norm)) {
      result.type = 'debt_for_us';
      const person = norm.match(/(?:سلفت|اقرضت|استلف مني|لي عند|اعطيت)\s+([\u0621-\u064a]+)/);
      if (person) result.personName = person[1];
    } else if (/فاتوره|قسط|اشتراك|ايجار|سداد كهرباء|سداد نت|فواتير/.test(norm)) {
      result.type = 'bill'; result.category = 'bills';
    } else if (/ايداع|اودعت|ايدعت|استلمت|قبضت|دخل|راتب|تحويل وارد|مكافاه/.test(norm)) {
      result.type = 'income'; result.category = 'other_inc';
    } else if (/مشروع/.test(norm)) {
      result.type = 'project';
      if (typeof getKnownProjects === 'function') {
        for (const p of getKnownProjects()) {
          if (normalizeArabic(raw).includes(normalizeArabic(p))) { result.projectName = p; break; }
        }
      }
    }
    if (result.type === 'expense' || result.type === 'project') {
      if (/بنزين|سياره|اوبر|تاكسي|مواصلات|كارته|موقف/.test(norm)) result.category = 'transport';
      else if (/اكل|مطعم|سوبرماركت|خضار|لحوم|جبن|لبن|عيش|طعام|فطار|غدا|عشا/.test(norm)) result.category = 'food';
      else if (/دواء|صيدليه|علاج|كشف|طبيب|دكتور|تحليل|مستشفي/.test(norm)) result.category = 'health';
      else if (/قهوه|كافيه|مصروف|شاي|يومي/.test(norm)) result.category = 'daily';
      else if (/منزل|ادوات|صيانه|منظفات|سباكه/.test(norm)) result.category = 'house';
      else if (/ملابس|قميص|حذاء|بنطلون|فستان|جاكت/.test(norm)) result.category = 'clothes';
      else if (/مدرسه|دروس|جامعه|كتب|تعليم|كورس/.test(norm)) result.category = 'education';
      else if (/انترنت|نت|شحن|موبايل/.test(norm)) result.category = 'bills';
    }
    if (appState && Array.isArray(appState.wallets)) {
      for (const wallet of appState.wallets) {
        if (wallet.name && norm.includes(normalizeArabic(wallet.name))) {
          result.walletId = wallet.id; break;
        }
      }
    }
    return result;
  }

    let _speechText = '';
  let _isStarting = false;
  let _speechError = null;

  function resetListeningUi() {
    _isListening = false; _isStarting = false;
    const fab = document.getElementById('btnVoiceAssistantFab');
    const overlay = document.getElementById('voiceLiveOverlay');
    if (fab) {
      fab.classList.remove('is-listening', 'is-processing');
      fab.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    }
    if (overlay) overlay.classList.remove('show');
  }

  function initSpeech() {
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechClass) return false;
    _recognition = new SpeechClass();
    _recognition.lang = 'ar-EG';
    _recognition.interimResults = true;
    _recognition.continuous = true;
    _recognition.maxAlternatives = 3;

    _recognition.onstart = () => {
      _isStarting = false; _isListening = true;
      const fab = document.getElementById('btnVoiceAssistantFab');
      const overlay = document.getElementById('voiceLiveOverlay');
      if (fab) {
        fab.classList.add('is-listening');
        fab.innerHTML = '<i class="fa-solid fa-stop"></i>';
      }
      if (overlay) overlay.classList.add('show');
      const textEl = document.getElementById('voiceLiveText');
      if (textEl) textEl.textContent = 'جارٍ الاستماع... اضغط للإيقاف بعد اكتمال الجملة';
    };
    _recognition.onresult = (event) => {
      const finals = [], interim = [];
      for (let i = 0; i < event.results.length; i++) {
        const segment = event.results[i];
        const transcript = String(segment[0] && segment[0].transcript || '').trim();
        if (!transcript) continue;
        (segment.isFinal ? finals : interim).push(transcript);
      }
      _speechText = finals.concat(interim).join(' ').trim();
      const liveEl = document.getElementById('voiceLiveText');
      if (liveEl && _speechText) liveEl.textContent = _speechText;
    };
    _recognition.onerror = (event) => {
      _speechError = event.error || 'unknown';
      if (typeof showToast !== 'function') return;
      if (_speechError === 'not-allowed' || _speechError === 'service-not-allowed') {
        showToast('يرجى منح المتصفح إذن استخدام الميكروفون ثم إعادة المحاولة');
      } else if (_speechError === 'audio-capture') {
        showToast('لم يتم العثور على ميكروفون متاح');
      } else if (_speechError === 'network') {
        showToast('التعرف الصوتي يحتاج إلى اتصال بالخدمة الصوتية؛ تحقق من الإنترنت');
      } else if (_speechError !== 'no-speech' && _speechError !== 'aborted') {
        showToast('تعذر التعرف على الصوت: ' + _speechError);
      }
    };
    _recognition.onend = () => {
      const phrase = _speechText.trim();
      const error = _speechError;
      resetListeningUi();
      _speechText = ''; _speechError = null;
      if (phrase && !['not-allowed', 'service-not-allowed', 'audio-capture'].includes(error)) {
        handleSpokenResult(phrase);
      } else if (!phrase && (!error || error === 'no-speech') && typeof showToast === 'function') {
        showToast('لم يتم التقاط كلمات واضحة. حاول التحدث مجددًا');
      }
    };
    return true;
  }

  function toggleListening() {
    if (_isListening || _isStarting) {
      stopListening();
      return;
    }
    if (!_recognition && !initSpeech()) {
      if (typeof showToast === 'function') showToast('التعرف الصوتي غير مدعوم في هذا المتصفح. جرّب Chrome');
      return;
    }
    _speechText = ''; _speechError = null; _isStarting = true;
    try {
      _recognition.start();
    } catch (err) {
      _isStarting = false;
      console.warn('[Voice] start failed', err);
      if (typeof showToast === 'function') showToast('تعذر بدء الاستماع؛ أغلق التسجيل السابق وأعد المحاولة');
    }
  }

  function stopListening() {
    if (!_recognition || (!_isListening && !_isStarting)) return;
    try { _recognition.stop(); } catch (err) { resetListeningUi(); }
  }

  function handleSpokenResult(rawText) {
    const text = String(rawText || '').trim();
    if (!text) return;
    const fab = document.getElementById('btnVoiceAssistantFab');
    if (fab) fab.classList.add('is-processing');
    const parsed = parseSpokenText(text);
    _currentParsed = parsed;
    if (fab) fab.classList.remove('is-processing');
    openConfirmDrawer(parsed);
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
    } else if (p.type === 'income') {
      typeLabel = 'إيداع أو دخل';
      badgeHtml = '<span style="background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.4);border-radius:8px;padding:3px 10px;font-size:0.76rem;font-weight:900;"><i class="fa-solid fa-arrow-down-left"></i> إيداع</span>';
      signPrefix = '+ ';
      amountColor = '#34d399';
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
            <span style="color:#f8fafc;font-weight:800;">"${String(p.rawText).replace(/[&<>"\']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"\'":'&#39;'}[c]))}"</span>
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
    const p = _currentParsed;
    if (!p) return;
    if (!Number.isFinite(p.amount) || p.amount <= 0) {
      if (typeof showToast === 'function') showToast('المبلغ غير واضح؛ يرجى مراجعته قبل الحفظ');
      openInModalForEdit();
      return;
    }
    if (typeof state === 'undefined') {
      if (typeof showToast === 'function') showToast('تعذر الوصول إلى بيانات البرنامج');
      return;
    }

    const date = new Date();
    const today = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    try {
      if (p.type === 'debt_for_us' || p.type === 'debt_on_us' || p.type === 'bill') {
        // Same commitments schema and storage as the native application.
        if (!Array.isArray(state.expectedExpenses)) state.expectedExpenses = [];
        const item = {
          id: 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          type: p.type === 'bill' ? 'upcoming_bill' : p.type,
          title: p.personName || p.label || 'التزام صوتي',
          amount: p.amount, dueDate: '', priority: 'normal',
          member: p.member || 'البيت', status: 'upcoming',
          photo: null, createdAt: new Date().toISOString(),
          notes: 'تسجيل صوتي: ' + p.rawText
        };
        state.expectedExpenses.unshift(item);
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
        if (typeof renderExpectedList === 'function') renderExpectedList();
      } else {
        const tx = {
          id: 'tx-voice-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          date: today,
          type: p.type === 'income' ? 'income' : 'expense',
          category: p.category || (p.type === 'income' ? 'other_inc' : 'other'),
          amount: p.amount,
          label: p.label || 'عملية صوتية',
          walletId: p.walletId,
          member: p.member || 'البيت',
          project: p.projectName || null,
          projectItem: p.projectItem || null,
          notes: 'مسجل صوتياً: ' + p.rawText,
          createdAt: new Date().toISOString()
        };
        if (!Array.isArray(state.transactions)) state.transactions = [];
        state.transactions.unshift(tx);
        // The native save flow re-computes wallet balances. Never deduct manually.
        if (typeof saveTx === 'function') saveTx();
        else localStorage.setItem('family_monefy_v2_tx', JSON.stringify(state.transactions));
      }
      if (typeof renderUI === 'function') renderUI();
      closeConfirmDrawer();
      if (typeof showToast === 'function') showToast('تم تسجيل العملية الصوتية بنجاح');
    } catch (err) {
      console.error('[Voice] Save error', err);
      if (typeof showToast === 'function') showToast('تعذر حفظ العملية. راجع البيانات وحاول مجددًا');
    }
  }

    function openInModalForEdit() {
    if (!_currentParsed) return;
    const p = _currentParsed;
    closeConfirmDrawer();
    if (p.type === 'debt_for_us' || p.type === 'debt_on_us' || p.type === 'bill') {
      if (typeof switchAppPage === 'function') switchAppPage('expected');
      if (typeof switchExpectedTab === 'function') switchExpectedTab('new');
      const fields = {
        inpExpType: p.type === 'bill' ? 'upcoming_bill' : p.type,
        inpExpTitle: p.personName || p.label,
        inpExpAmount: p.amount > 0 ? String(p.amount) : ''
      };
      for (const id of Object.keys(fields)) {
        const element = document.getElementById(id);
        if (element) element.value = fields[id];
      }
      document.getElementById('inpExpAmount')?.focus();
      return;
    }
    if (typeof openTxModal !== 'function') return;
    openTxModal(p.type === 'income' ? 'income' : 'expense', p.category);
    const fields = {
      inpTxAmount: p.amount > 0 ? String(p.amount) : '',
      inpTxLabel: p.label,
      inpTxCategory: p.category,
      inpTxWallet: p.walletId,
      inpTxMember: p.member
    };
    for (const id of Object.keys(fields)) {
      const element = document.getElementById(id);
      if (element) element.value = fields[id];
    }
    document.getElementById('inpTxAmount')?.focus();
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
