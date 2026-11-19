/**
 * ============================================================================
 * Family Expense Tracker - Voice Assistant Engine (v6.2.0)
 * ============================================================================
 * Professional Arabic Voice NLP Speech-to-Transaction Suite
 * - Multi-dialect Arabic NLP (Egyptian, Saudi, Levantine & Modern Standard)
 * - Intelligent spoken colloquial numbers ("ألف ونص", "ميتين وعشرة", "تلات تلاف وميتين")
 * - 150+ spoken Arabic keywords across 9 core expense categories
 * - Automatic smart entity extraction: Amount, Category, Type, Wallet, Member, Project
 * - Smart silence detection with auto-finish after speaking completes
 * - Luxury interactive bottom drawer with quick-category chips and direct inline edit
 * ============================================================================
 */
const VoiceAssistantEngine = (() => {
  'use strict';

  let _recognition = null;
  let _isListening = false;
  let _isStarting = false;
  let _speechText = '';
  let _speechError = null;
  let _silenceTimer = null;
  let _currentParsed = null;

  /* --------------------------------------------------------------------------
     1. Arabic Text Normalization & Dialect Preprocessing
     -------------------------------------------------------------------------- */
  function normalizeArabic(text) {
    if (!text) return '';
    return String(text).normalize('NFKC')
      // Remove diacritics / tashkeel and tatweel
      .replace(/[\u064b-\u065f\u0670\u0640]/g, '')
      // Normalize alef variants to bare ا
      .replace(/[إأآٱ]/g, 'ا')
      // Normalize teh marbuta to ه, yeh to ي
      .replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      // Eastern Arabic numerals (٠-٩) to standard (0-9)
      .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      // Persian numerals (۰-۹) to standard (0-9)
      .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      // Arabic decimal and grouping separators
      .replace(/٫/g, '.').replace(/٬/g, ',')
      // Punctuation to clean whitespace
      .replace(/[،؛؟!]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* --------------------------------------------------------------------------
     2. Rich Colloquial & Standard Arabic Number Lexicon
     -------------------------------------------------------------------------- */
  const NUM_UNITS = {
    'صفر': 0, 'واحد': 1, 'واحده': 1, 'اثنين': 2, 'اثنان': 2, 'اتنين': 2,
    'تلاته': 3, 'ثلاثه': 3, 'تلات': 3, 'ثلاث': 3,
    'اربعه': 4, 'أربعه': 4, 'اربع': 4, 'أربع': 4,
    'خمسه': 5, 'خمس': 5,
    'سته': 6, 'ست': 6,
    'سبعه': 7, 'سبع': 7,
    'تمانيه': 8, 'ثمانيه': 8, 'تمن': 8, 'ثماني': 8, 'ثمان': 8,
    'تسعه': 9, 'تسع': 9,
    'عشره': 10, 'عشر': 10,
    // Teens (Egyptian & Standard)
    'حداشر': 11, 'احد عشر': 11, 'إحدى عشر': 11,
    'اتناشر': 12, 'اثنا عشر': 12, 'اثني عشر': 12,
    'تلاتاشر': 13, 'ثلاثه عشر': 13, 'ثلاث عشر': 13,
    'اربعتاشر': 14, 'اربعه عشر': 14, 'أربعه عشر': 14,
    'خمستاشر': 15, 'خمسه عشر': 15,
    'ستتاشر': 16, 'سته عشر': 16,
    'سبعتاشر': 17, 'سبعه عشر': 17,
    'تمنتاشر': 18, 'ثمانيه عشر': 18,
    'تسعتاشر': 19, 'تسعه عشر': 19
  };

  const NUM_TENS = {
    'عشرين': 20, 'عشرون': 20,
    'تلاتين': 30, 'ثلاثين': 30, 'ثلاثون': 30,
    'اربعين': 40, 'أربعين': 40, 'اربعون': 40, 'أربعون': 40,
    'خمسين': 50, 'خمسون': 50,
    'ستين': 60, 'ستون': 60,
    'سبعين': 70, 'سبعون': 70,
    'تمانين': 80, 'ثمانين': 80, 'ثمانون': 80,
    'تسعين': 90, 'تسعون': 90
  };

  const NUM_HUNDREDS = {
    'ميه': 100, 'مائه': 100, 'مئة': 100, 'ميت': 100,
    'ميتين': 200, 'مائتين': 200, 'مئتان': 200,
    'تلتميه': 300, 'ثلاثمائه': 300, 'ثلاثميه': 300,
    'اربعميه': 400, 'اربعمائه': 400, 'أربعمائه': 400,
    'خمسميه': 500, 'خمسمائه': 500,
    'ستميه': 600, 'ستمائه': 600,
    'سبعميه': 700, 'سبعمائه': 700,
    'تمنميه': 800, 'ثمانمائه': 800,
    'تسعميه': 900, 'تسعمائه': 900
  };

  const NUM_SCALES = {
    'الف': 1000, 'الاف': 1000, 'تلاف': 1000,
    'الفين': 2000, 'ألفين': 2000,
    'مليون': 1000000, 'مليونين': 2000000, 'ملايين': 1000000
  };

  const NUM_FRACTIONS = {
    'نص': 0.5, 'نصف': 0.5,
    'ربع': 0.25,
    'تلت': 0.33, 'ثلث': 0.33
  };

  const COLLOQUIAL_COMPOUNDS = {
    'الف ونص': 1500, 'ألف ونص': 1500, 'الف ونصف': 1500,
    'الفين ونص': 2500, 'ألفين ونص': 2500, 'الفين ونصف': 2500,
    'تلات تلاف': 3000, 'ثلاثه الاف': 3000, 'ثلاث الاف': 3000, 'تلات تلاف ونص': 3500,
    'اربع تلاف': 4000, 'اربعه الاف': 4000, 'اربع تلاف ونص': 4500,
    'خمس تلاف': 5000, 'خمسه الاف': 5000, 'خمس تلاف ونص': 5500,
    'ست تلاف': 6000, 'سته الاف': 6000,
    'سبع تلاف': 7000, 'سبعه الاف': 7000,
    'تمن تلاف': 8000, 'ثمانيه الاف': 8000,
    'تسع تلاف': 9000, 'تسعه الاف': 9000,
    'عشر تلاف': 10000, 'عشره الاف': 10000,
    'ميه ونص': 150, 'مائه ونصف': 150,
    'ميتين ونص': 250, 'مائتين ونصف': 250
  };

  /* --------------------------------------------------------------------------
     3. Robust Spoken Arabic Amount Parsing Engine
     -------------------------------------------------------------------------- */
  function parseArabicAmount(text) {
    const norm = normalizeArabic(text);
    if (!norm) return 0;

    // Pattern A: Direct numerical digits (e.g., 500, 1500.50, 75)
    // Priority when next to currency or spend verb
    const numMatch = norm.match(/(\d+(?:[.,]\d+)?)/);
    if (numMatch) {
      const val = parseFloat(numMatch[1].replace(/,/g, ''));
      if (Number.isFinite(val) && val > 0) return val;
    }

    // Pattern B: Colloquial direct compound phrases
    for (const phrase in COLLOQUIAL_COMPOUNDS) {
      if (norm.includes(phrase)) {
        let baseVal = COLLOQUIAL_COMPOUNDS[phrase];
        // Check if there is an additional hundred or ten appended (e.g. "تلات تلاف وميتين")
        const remainder = norm.replace(phrase, ' ').trim();
        const extraWords = remainder.split(/\s+/);
        for (const ew of extraWords) {
          const cleanW = ew.replace(/^[وب]+/g, '');
          if (NUM_HUNDREDS[cleanW] !== undefined) baseVal += NUM_HUNDREDS[cleanW];
          else if (NUM_TENS[cleanW] !== undefined) baseVal += NUM_TENS[cleanW];
          else if (NUM_UNITS[cleanW] !== undefined) baseVal += NUM_UNITS[cleanW];
        }
        return baseVal;
      }
    }

    // Pattern C: Token-based hierarchical accumulator
    const tokens = norm.split(/\s+/);
    let grandTotal = 0;
    let currentGroup = 0;
    let foundAny = false;

    for (let i = 0; i < tokens.length; i++) {
      let w = tokens[i].replace(/^[^\u0621-\u064a0-9]+|[^\u0621-\u064a0-9]+$/g, '');
      if (!w) continue;

      // Strip leading prepositions/conjunctions (بـ / وـ)
      if ((w.startsWith('ب') || w.startsWith('و')) && w.length > 2) {
        const stripped = w.slice(1);
        if (NUM_UNITS[stripped] || NUM_TENS[stripped] || NUM_HUNDREDS[stripped] || NUM_SCALES[stripped] || NUM_FRACTIONS[stripped]) {
          w = stripped;
        }
      }

      // Check two-word combo (e.g., "تلات تلاف" or "خمسة وعشرين")
      if (i + 1 < tokens.length) {
        let nextW = tokens[i + 1].replace(/^[^\u0621-\u064a0-9]+|[^\u0621-\u064a0-9]+$/g, '');
        if (nextW.startsWith('و') && nextW.length > 2) nextW = nextW.slice(1);

        const combo = w + ' ' + nextW;
        if (NUM_UNITS[combo] !== undefined) {
          currentGroup += NUM_UNITS[combo];
          foundAny = true;
          i++;
          continue;
        }

        // Multiplier + Scale (e.g. "خمسة الاف" or "عشرين الف")
        if ((NUM_UNITS[w] !== undefined || NUM_TENS[w] !== undefined) && NUM_SCALES[nextW] !== undefined) {
          const unitVal = NUM_UNITS[w] !== undefined ? NUM_UNITS[w] : NUM_TENS[w];
          grandTotal += unitVal * NUM_SCALES[nextW];
          foundAny = true;
          i++;
          continue;
        }
      }

      if (NUM_FRACTIONS[w] !== undefined) {
        const f = NUM_FRACTIONS[w];
        if (grandTotal > 0 && currentGroup === 0) {
          grandTotal += f * (grandTotal >= 1000 ? 1000 : 100);
        } else {
          currentGroup += f;
        }
        foundAny = true;
      } else if (NUM_SCALES[w] !== undefined) {
        const scale = NUM_SCALES[w];
        const mult = currentGroup > 0 ? currentGroup : 1;
        grandTotal += mult * scale;
        currentGroup = 0;
        foundAny = true;
      } else if (NUM_HUNDREDS[w] !== undefined) {
        currentGroup += NUM_HUNDREDS[w];
        foundAny = true;
      } else if (NUM_TENS[w] !== undefined) {
        currentGroup += NUM_TENS[w];
        foundAny = true;
      } else if (NUM_UNITS[w] !== undefined) {
        currentGroup += NUM_UNITS[w];
        foundAny = true;
      }
    }

    return foundAny ? (grandTotal + currentGroup) : 0;
  }

  /* --------------------------------------------------------------------------
     4. 150+ Spoken Keywords Dictionary for 9 Core Categories
     -------------------------------------------------------------------------- */
  const CATEGORY_VOCABULARY = {
    food: [
      'طعام', 'اكل', 'مطعم', 'سوبرماركت', 'بقالة', 'بقاله', 'خضار', 'فاكهة', 'فاكهه',
      'لحمة', 'لحمه', 'لحوم', 'فراخ', 'دجاج', 'سمك', 'عيش', 'خبز', 'جبنة', 'جبنه',
      'البان', 'حليب', 'لبن', 'بيض', 'زيت', 'سكر', 'رز', 'ارز', 'مكرونة', 'مكرونه',
      'شيبسي', 'كشري', 'فول', 'فلافل', 'طعمية', 'طعميه', 'بيتزا', 'برجر', 'شاورما',
      'وجبة', 'وجبه', 'غداء', 'عشاء', 'فطور', 'فطار', 'تموينات', 'كارفور', 'بنده',
      'العثيم', 'لولو', 'ماركت', 'حلويات', 'شوكولاته', 'مشتروات طعام', 'سوبر ماركت'
    ],
    daily: [
      'قهوة', 'قهوه', 'شاي', 'كافيه', 'كافية', 'نسكافيه', 'لاتيه', 'اسبريسو',
      'كابتشينو', 'سجائر', 'دخان', 'معسل', 'شيشة', 'شيشه', 'مصروف', 'مصاريف',
      'كشك', 'مقهى', 'بوفية', 'بوفيه', 'تسالي', 'لبان', 'مياه', 'ميه', 'عصير',
      'سناكس', 'مصروف شخصي', 'مشروبات', 'سناك', 'مشروب بارد', 'عصير قصب'
    ],
    bills: [
      'فاتورة', 'فاتوره', 'فواتير', 'كهرباء', 'مياه وغاز', 'غاز', 'نت', 'انترنت',
      'واي فاي', 'شحن', 'رصيد', 'كارت شحن', 'باقة', 'باقه', 'تجديد باقة',
      'وي', 'فودافون', 'اتصالات', 'اورنج', 'موبايلي', 'اس تي سي', 'زين', 'stc',
      'اشتراك', 'سيرفر', 'دومين', 'صيانة مصعد', 'حارس', 'بواب', 'جمعية', 'جمعيه',
      'قسط', 'اقساط', 'ايجار', 'إيجار'
    ],
    transport: [
      'بنزين', 'بنزينة', 'بنزينه', 'سولار', 'اوبر', 'أوبر', 'كريم', 'تاكسي',
      'ميكروباص', 'مترو', 'تذكرة', 'تذكره', 'اتوبيس', 'باص', 'قطار', 'سكة حديد',
      'طيران', 'موقف', 'باركنج', 'جراج', 'كارته', 'كارتة', 'غسيل سيارة',
      'زيت سيارة', 'كاوتش', 'بنشر', 'مواصلات', 'اجرة', 'سيارة', 'سياره', 'صيانة سيارة'
    ],
    house: [
      'منزل', 'ادوات منزلية', 'أدوات منزلية', 'منظفات', 'صابون', 'كلور', 'تايد',
      'اريال', 'مناديل', 'سباكة', 'سباكه', 'نجار', 'كهربائي', 'لمبة', 'لمبه',
      'دهان', 'اثاث', 'أثاث', 'عفش', 'مفروشات', 'ستائر', 'سجاد', 'بوتجاز',
      'غسالة', 'غساله', 'ثلاجة', 'ثلاجه', 'صيانة منزل', 'مستلزمات منزل'
    ],
    education: [
      'مدرسة', 'مدرسه', 'دروس', 'درس', 'سنتر', 'جامعة', 'جامعه', 'كلية', 'كليه',
      'كتب', 'كتاب', 'كشكول', 'اقلام', 'شنطة مدرسة', 'مصاريف مدرسة', 'باص مدرسة',
      'كورس', 'دورة', 'دوره', 'تدريب', 'ملازم', 'طباعة', 'مذكرات', 'تعليم'
    ],
    health: [
      'دواء', 'ادوية', 'أدوية', 'علاج', 'صيدلية', 'صيدليه', 'روشتة', 'روشته',
      'كشف', 'دكتور', 'طبيب', 'مستشفى', 'مستشفي', 'عيادة', 'عياده', 'اسنان',
      'نظارة', 'نظاره', 'عدسات', 'تحاليل', 'اشعة', 'اشعه', 'فيتامينات', 'مسكن', 'صحة'
    ],
    clothes: [
      'ملابس', 'هدوم', 'قميص', 'بنطلون', 'تيشرت', 'فستان', 'عباية', 'عبايه',
      'جاكت', 'بدلة', 'بدله', 'حذاء', 'كوتشي', 'جزمة', 'جزمه', 'شنطة', 'حزام',
      'طرحة', 'طرحه', 'ملابس اطفال', 'زارا', 'h&m', 'براند', 'تفصيل'
    ],
    other: [
      'هدية', 'هديه', 'هدايا', 'صدقة', 'صدقه', 'زكاة', 'زكاه', 'عيدية', 'عيديه',
      'حلاقة', 'حلاقه', 'صالون', 'كوافير', 'ملاهي', 'سينما', 'فسحة', 'فسحه',
      'رحلة', 'رحله', 'اكسسوارات', 'العاب', 'ألعاب', 'تبرع', 'نثريات'
    ]
  };

  function detectCategory(text) {
    const norm = normalizeArabic(text);
    const words = norm.split(/\s+/);
    const scores = {};
    for (const cat in CATEGORY_VOCABULARY) scores[cat] = 0;

    for (const cat in CATEGORY_VOCABULARY) {
      const keywords = CATEGORY_VOCABULARY[cat];
      for (const kw of keywords) {
        const normKw = normalizeArabic(kw);
        if (norm.includes(normKw)) {
          scores[cat] += words.includes(normKw) ? 3 : 1;
        }
      }
    }

    let bestCat = 'other';
    let maxScore = 0;
    for (const cat in scores) {
      if (scores[cat] > maxScore) {
        maxScore = scores[cat];
        bestCat = cat;
      }
    }
    return maxScore > 0 ? bestCat : 'other';
  }

  /* --------------------------------------------------------------------------
     5. Intelligent Label Generator (Clean and Concise)
     -------------------------------------------------------------------------- */
  function cleanSpokenLabel(raw, categoryId) {
    let s = String(raw || '').trim();
    // Strip leading transaction verbs
    s = s.replace(/^(?:صرفت|دفعت|اشتريت|سددت|حاسبت|جبت|اشترينا|صرفنا|دفعنا|اودعت|قبضت|استلمت|حولت)\s*/i, '');
    // Strip wallet phrases
    s = s.replace(/(?:من|عبر|بواسطة)\s*(?:محفظة|كاش|فودافون كاش|فيزا|البنك|الراجحي|الاهلي|انستاباي)[^\s]*/gi, '');
    // Strip beneficiary phrases
    s = s.replace(/(?:لـ?|حق|بتاع)\s*(?:بنتي|ابني|زوجتي|احمد|محمد|سارة|البيت)[^\s]*/gi, '');
    // Strip numerical amounts and currency words
    s = s.replace(/\b\d+(?:[.,]\d+)?\s*(?:جنيه|جنيهات|جنيها|ج\.م|ريال|ريالات|ريالا|رس|درهم|دولار)?\b/gi, '');
    // Strip common number words
    for (const phrase in COLLOQUIAL_COMPOUNDS) {
      s = s.replace(new RegExp(phrase, 'g'), '');
    }
    s = s.replace(/\b(?:جنيه|جنيهات|جنيها|ريال|ريالات|ريالا|درهم|دولار|بمبلغ|بقيمة|بقيمه)\b/g, '');
    // Clean dangling prepositions at start or end
    s = s.replace(/^[بفيمنعلي]+\s+/g, '').replace(/\s+[بفيمنعلي]+$/g, '');
    s = s.replace(/\s+/g, ' ').trim();

    if (s.length >= 3) return s;

    // Fallback to category display name
    const appCat = (typeof getCategoryObj === 'function') ? getCategoryObj(categoryId, 'expense') : null;
    return appCat ? appCat.name : 'مصروف صوتي';
  }

  /* --------------------------------------------------------------------------
     6. Master Spoken Parser
     -------------------------------------------------------------------------- */
  function parseSpokenText(raw) {
    const norm = normalizeArabic(raw);
    const appState = (typeof state !== 'undefined' && state) ? state : (window.state || null);

    const result = {
      rawText: String(raw || '').trim(),
      type: 'expense',
      amount: parseArabicAmount(raw),
      category: 'other',
      label: '',
      walletId: (appState && appState.currentWalletId && appState.currentWalletId !== 'all')
        ? appState.currentWalletId
        : ((appState && appState.wallets && appState.wallets[0] && appState.wallets[0].id) || 'cash'),
      member: (appState && appState.selectedMember && appState.selectedMember !== 'الكل')
        ? appState.selectedMember
        : ((appState && appState.currentUser) || 'البيت'),
      projectName: null,
      projectItem: null,
      personName: null
    };

    // Transaction Type Detection
    if (/تسلفت|استلفت|دين علي|اقترضت من|علي ل/.test(norm)) {
      result.type = 'debt_on_us';
      const m = norm.match(/(?:تسلفت من|استلفت من|اقترضت من|علي ل)\s+([\u0621-\u064a]+)/);
      if (m) result.personName = m[1];
    } else if (/سلفت|اقرضت|استلف مني|دين لي|لي عند|اعطيت.*دين/.test(norm)) {
      result.type = 'debt_for_us';
      const m = norm.match(/(?:سلفت|اقرضت|استلف مني|لي عند|اعطيت)\s+([\u0621-\u064a]+)/);
      if (m) result.personName = m[1];
    } else if (/فاتوره|قسط|اشتراك|ايجار|سداد كهرباء|سداد نت|فواتير/.test(norm)) {
      result.type = 'bill';
      result.category = 'bills';
    } else if (/ايداع|اودعت|استلمت|قبضت|دخل|راتب|تحويل وارد|مكافاه|حول لي/.test(norm)) {
      result.type = 'income';
      result.category = 'other_inc';
    } else if (/مشروع|تشطيب|شقة|عمارة/.test(norm)) {
      result.type = 'project';
      if (typeof getKnownProjects === 'function') {
        for (const p of getKnownProjects()) {
          if (norm.includes(normalizeArabic(p))) { result.projectName = p; break; }
        }
      }
    }

    // Category Detection
    if (result.type === 'expense' || result.type === 'project') {
      result.category = detectCategory(raw);
    }

    // Wallet Detection
    if (appState && Array.isArray(appState.wallets)) {
      for (const w of appState.wallets) {
        if (w.name && norm.includes(normalizeArabic(w.name))) {
          result.walletId = w.id;
          break;
        }
      }
    }

    // Member Detection
    if (appState && Array.isArray(appState.familyMembers)) {
      for (const mem of appState.familyMembers) {
        if (mem && norm.includes(normalizeArabic(mem))) {
          result.member = mem;
          break;
        }
      }
    } else if (/بنتي|ابنتي/.test(norm)) {
      result.member = 'بنتي';
    } else if (/ابني|ولدي/.test(norm)) {
      result.member = 'ابني';
    } else if (/زوجتي|ام العيال/.test(norm)) {
      result.member = 'زوجتي';
    }

    // Clean Label
    result.label = cleanSpokenLabel(raw, result.category);

    return result;
  }

  /* --------------------------------------------------------------------------
     7. SpeechRecognition Lifecycle with Silence Auto-Finish
     -------------------------------------------------------------------------- */
  function resetListeningUi() {
    _isListening = false;
    _isStarting = false;
    if (_silenceTimer) { clearTimeout(_silenceTimer); _silenceTimer = null; }

    const fab = document.getElementById('btnVoiceAssistantFab');
    const overlay = document.getElementById('voiceLiveOverlay');
    if (fab) {
      fab.classList.remove('is-listening', 'is-processing');
      fab.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    }
    if (overlay) overlay.classList.remove('show');

    // Remove pulsing styling from all layout voice buttons
    document.querySelectorAll('[data-action="voice-record"]').forEach(el => {
      el.classList.remove('is-listening');
    });
  }

  function initSpeech() {
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechClass) return false;

    _recognition = new SpeechClass();
    // Default to Egyptian or Saudi Arabic depending on app currency
    const appState = window.state || null;
    const curr = (appState && appState.currency) || 'EGP';
    _recognition.lang = (curr === 'SAR') ? 'ar-SA' : 'ar-EG';
    _recognition.interimResults = true;
    _recognition.continuous = true;
    _recognition.maxAlternatives = 3;

    _recognition.onstart = () => {
      _isStarting = false;
      _isListening = true;
      const fab = document.getElementById('btnVoiceAssistantFab');
      const overlay = document.getElementById('voiceLiveOverlay');
      if (fab) {
        fab.classList.add('is-listening');
        fab.innerHTML = '<i class="fa-solid fa-stop"></i>';
      }
      if (overlay) overlay.classList.add('show');

      document.querySelectorAll('[data-action="voice-record"]').forEach(el => {
        el.classList.add('is-listening');
      });

      const textEl = document.getElementById('voiceLiveText');
      if (textEl) textEl.textContent = 'تحدث الآن... (مثال: صرفت ميتين جنيه سوبرماركت)';
    };

    _recognition.onresult = (event) => {
      const finals = [], interim = [];
      for (let i = 0; i < event.results.length; i++) {
        const seg = event.results[i];
        const transcript = String(seg[0] && seg[0].transcript || '').trim();
        if (!transcript) continue;
        if (seg.isFinal) finals.push(transcript);
        else interim.push(transcript);
      }
      _speechText = finals.concat(interim).join(' ').trim();
      const liveEl = document.getElementById('voiceLiveText');
      if (liveEl && _speechText) liveEl.textContent = _speechText;

      // Smart silence auto-stop: if user pauses for 2.2 seconds after speaking, auto-stop
      if (_silenceTimer) clearTimeout(_silenceTimer);
      if (_speechText.length > 3) {
        _silenceTimer = setTimeout(() => {
          if (_isListening) stopListening();
        }, 2200);
      }
    };

    _recognition.onerror = (event) => {
      _speechError = event.error || 'unknown';
      if (typeof showToast !== 'function') return;
      if (_speechError === 'not-allowed' || _speechError === 'service-not-allowed') {
        showToast('يرجى منح المتصفح إذن الميكروفون ثم إعادة المحاولة');
      } else if (_speechError === 'audio-capture') {
        showToast('لم يتم العثور على ميكروفون متاح');
      } else if (_speechError === 'network') {
        showToast('التعرف الصوتي يحتاج اتصالاً بالإنترنت');
      } else if (_speechError !== 'no-speech' && _speechError !== 'aborted') {
        showToast('تعذر التعرف الصوتي: ' + _speechError);
      }
    };

    _recognition.onend = () => {
      const phrase = _speechText.trim();
      const error = _speechError;
      resetListeningUi();
      _speechText = '';
      _speechError = null;

      if (phrase && !['not-allowed', 'service-not-allowed', 'audio-capture'].includes(error)) {
        handleSpokenResult(phrase);
      } else if (!phrase && (!error || error === 'no-speech') && typeof showToast === 'function') {
        showToast('لم يتم التقاط كلمات واضحة. اضغط وتحدث مجددًا');
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
      if (typeof showToast === 'function') showToast('التعرف الصوتي غير مدعوم في هذا المتصفح. جرّب Chrome أو Edge');
      return;
    }
    _speechText = '';
    _speechError = null;
    _isStarting = true;
    try {
      _recognition.start();
    } catch (err) {
      _isStarting = false;
      console.warn('[Voice] start failed', err);
      if (typeof showToast === 'function') showToast('تعذر بدء الميكروفون، يرجى المحاولة ثانية');
    }
  }

  function stopListening() {
    if (!_recognition || (!_isListening && !_isStarting)) return;
    try {
      _recognition.stop();
    } catch (err) {
      resetListeningUi();
    }
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

  /* --------------------------------------------------------------------------
     8. Interactive Confirmation Drawer with Quick Category & Amount Tuning
     -------------------------------------------------------------------------- */
  function openConfirmDrawer(p) {
    const drawer = document.getElementById('voiceConfirmDrawer');
    const backdrop = document.getElementById('voiceDrawerBackdrop');
    if (!drawer || !backdrop) return;

    // Type Badge config
    let badgeHtml = '';
    let signPrefix = '- ';
    let amountColor = '#ef4444';

    if (p.type === 'debt_for_us') {
      badgeHtml = `<span style="background:rgba(16,185,129,0.18);color:#10b981;border:1px solid rgba(16,185,129,0.35);border-radius:8px;padding:3px 10px;font-size:0.75rem;font-weight:900;"><i class="fa-solid fa-hand-holding-dollar"></i> دين لنا</span>`;
      signPrefix = '+ ';
      amountColor = '#10b981';
    } else if (p.type === 'debt_on_us') {
      badgeHtml = `<span style="background:rgba(239,68,68,0.18);color:#ef4444;border:1px solid rgba(239,68,68,0.35);border-radius:8px;padding:3px 10px;font-size:0.75rem;font-weight:900;"><i class="fa-solid fa-handshake-angle"></i> دين علينا</span>`;
    } else if (p.type === 'bill') {
      badgeHtml = `<span style="background:rgba(249,115,22,0.18);color:#f97316;border:1px solid rgba(249,115,22,0.35);border-radius:8px;padding:3px 10px;font-size:0.75rem;font-weight:900;"><i class="fa-solid fa-bolt"></i> فاتورة دورية</span>`;
    } else if (p.type === 'income') {
      badgeHtml = `<span style="background:rgba(16,185,129,0.18);color:#10b981;border:1px solid rgba(16,185,129,0.35);border-radius:8px;padding:3px 10px;font-size:0.75rem;font-weight:900;"><i class="fa-solid fa-arrow-down-left"></i> إيداع / دخل</span>`;
      signPrefix = '+ ';
      amountColor = '#10b981';
    } else if (p.type === 'project') {
      badgeHtml = `<span style="background:rgba(139,92,246,0.18);color:#8b5cf6;border:1px solid rgba(139,92,246,0.35);border-radius:8px;padding:3px 10px;font-size:0.75rem;font-weight:900;"><i class="fa-solid fa-folder-tree"></i> مشروع</span>`;
    } else {
      badgeHtml = `<span style="background:rgba(2,132,199,0.18);color:#0284c7;border:1px solid rgba(2,132,199,0.35);border-radius:8px;padding:3px 10px;font-size:0.75rem;font-weight:900;"><i class="fa-solid fa-receipt"></i> مصروف عادي</span>`;
    }

    const catObj = (typeof getCategoryObj === 'function')
      ? getCategoryObj(p.category, 'expense')
      : { name: p.category, icon: 'fa-tag', color: '#0284c7' };

    const appState = window.state || null;
    const walletObj = (appState && Array.isArray(appState.wallets))
      ? appState.wallets.find(w => w.id === p.walletId)
      : null;
    const walletName = walletObj ? walletObj.name : 'الرئيسية (كاش)';
    const currSymbol = (appState && appState.currency === 'SAR') ? 'ر.س' : 'ج.م';

    // 9 Quick Category Switch Chips
    const quickCats = [
      { id: 'food', name: 'طعام', icon: 'fa-cart-shopping', color: '#10b981' },
      { id: 'daily', name: 'يومي', icon: 'fa-mug-saucer', color: '#d97706' },
      { id: 'bills', name: 'فواتير', icon: 'fa-bolt', color: '#f97316' },
      { id: 'transport', name: 'مواصلات', icon: 'fa-car-side', color: '#0284c7' },
      { id: 'house', name: 'منزل', icon: 'fa-couch', color: '#8b5cf6' },
      { id: 'education', name: 'تعليم', icon: 'fa-book-open', color: '#0284c7' },
      { id: 'health', name: 'صحة', icon: 'fa-capsules', color: '#ef4444' },
      { id: 'clothes', name: 'ملابس', icon: 'fa-shirt', color: '#ec4899' },
      { id: 'other', name: 'أخرى', icon: 'fa-gift', color: '#10b981' }
    ];

    const chipsHtml = quickCats.map(qc => `
      <button type="button" onclick="VoiceAssistantEngine.changeDrawerCategory('${qc.id}')"
        style="padding:4px 8px;border-radius:8px;font-size:0.70rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;border:1px solid ${p.category === qc.id ? qc.color : 'rgba(255,255,255,0.12)'};background:${p.category === qc.id ? qc.color : 'rgba(255,255,255,0.05)'};color:${p.category === qc.id ? '#ffffff' : '#94a3b8'};">
        <i class="fa-solid ${qc.icon}" style="font-size:0.65rem;"></i> ${qc.name}
      </button>
    `).join('');

    const bodyEl = document.getElementById('voiceConfirmDrawerBody');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <!-- Top Bar: Badge & Amount -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:10px;">
          <div>
            <div style="font-size:0.72rem;color:#94a3b8;font-weight:700;">المساعد الصوتي الذكي</div>
            <div style="margin-top:2px;">${badgeHtml}</div>
          </div>
          <div style="text-align:left;">
            <div style="font-size:0.68rem;color:#94a3b8;font-weight:700;">المبلغ المطلوب اعتماده</div>
            <div style="display:flex;align-items:center;gap:4px;direction:ltr;">
              <span style="font-size:1.1rem;font-weight:900;color:${amountColor};">${p.amount > 0 ? signPrefix : ''}</span>
              <input type="number" id="voiceDrawerAmtInp" value="${p.amount > 0 ? p.amount : ''}" placeholder="0.00"
                oninput="VoiceAssistantEngine.changeDrawerAmount(this.value)"
                style="width:90px;background:rgba(255,255,255,0.08);border:1.5px solid ${amountColor};border-radius:8px;color:${amountColor};font-size:1.15rem;font-weight:900;padding:2px 6px;text-align:center;outline:none;" />
              <span style="font-size:0.85rem;font-weight:900;color:#94a3b8;">${currSymbol}</span>
            </div>
          </div>
        </div>

        <!-- Details Card -->
        <div class="voice-card-box" style="background:rgba(15,23,42,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 12px;margin-bottom:12px;display:flex;flex-direction:column;gap:6px;">
          <div style="display:flex;justify-content:space-between;font-size:0.78rem;">
            <span style="color:#94a3b8;"><i class="fa-solid fa-quote-right" style="color:#38bdf8;"></i> المنطوق:</span>
            <span style="color:#f8fafc;font-weight:800;max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">"${p.rawText}"</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;">
            <span style="color:#94a3b8;"><i class="fa-solid fa-pen" style="color:#fbbf24;"></i> البيان:</span>
            <input type="text" id="voiceDrawerLabelInp" value="${p.label}"
              oninput="VoiceAssistantEngine.changeDrawerLabel(this.value)"
              style="width:68%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:6px;color:#f8fafc;font-size:0.78rem;font-weight:800;padding:2px 8px;outline:none;text-align:right;" />
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.78rem;">
            <span style="color:#94a3b8;"><i class="fa-solid fa-wallet" style="color:#38bdf8;"></i> المحفظة:</span>
            <span style="color:#f8fafc;font-weight:800;">${walletName}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.78rem;">
            <span style="color:#94a3b8;"><i class="fa-solid fa-user" style="color:#a855f7;"></i> المستفيد:</span>
            <span style="color:#f8fafc;font-weight:800;">${p.member || 'البيت'}</span>
          </div>
          ${p.projectName ? `
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;">
              <span style="color:#94a3b8;"><i class="fa-solid fa-folder-tree" style="color:#8b5cf6;"></i> المشروع:</span>
              <span style="color:#c084fc;font-weight:900;">${p.projectName}</span>
            </div>
          ` : ''}
        </div>

        <!-- Quick Category Select Chips -->
        <div style="margin-bottom:8px;">
          <div style="font-size:0.68rem;color:#94a3b8;margin-bottom:6px;font-weight:700;">تبديل البند بنقرة واحدة:</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">${chipsHtml}</div>
        </div>
      `;
    }

    backdrop.classList.add('open');
    drawer.classList.add('open');
  }

  function changeDrawerCategory(catId) {
    if (!_currentParsed) return;
    _currentParsed.category = catId;
    openConfirmDrawer(_currentParsed);
  }

  function changeDrawerAmount(val) {
    if (!_currentParsed) return;
    const n = parseFloat(val);
    _currentParsed.amount = (!isNaN(n) && n > 0) ? n : 0;
  }

  function changeDrawerLabel(val) {
    if (!_currentParsed) return;
    _currentParsed.label = String(val || '').trim();
  }

  function closeConfirmDrawer() {
    const drawer = document.getElementById('voiceConfirmDrawer');
    const backdrop = document.getElementById('voiceDrawerBackdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    _currentParsed = null;
  }

  /* --------------------------------------------------------------------------
     9. Commit Transaction directly to App State and Storage
     -------------------------------------------------------------------------- */
  function commitTransaction() {
    const p = _currentParsed;
    if (!p) return;

    if (!Number.isFinite(p.amount) || p.amount <= 0) {
      if (typeof showToast === 'function') showToast('يرجى كتابة المبلغ الصحيح قبل الحفظ');
      const amtInp = document.getElementById('voiceDrawerAmtInp');
      if (amtInp) amtInp.focus();
      return;
    }

    const appState = (typeof state !== 'undefined' && state) ? state : (window.state || null);
    if (!appState) {
      if (typeof showToast === 'function') showToast('تعذر الوصول إلى بيانات التطبيق');
      return;
    }

    const date = new Date();
    const today = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

    try {
      if (p.type === 'debt_for_us' || p.type === 'debt_on_us' || p.type === 'bill') {
        if (!Array.isArray(appState.expectedExpenses)) appState.expectedExpenses = [];
        const item = {
          id: 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          type: p.type === 'bill' ? 'upcoming_bill' : p.type,
          title: p.personName || p.label || 'التزام صوتي',
          amount: p.amount,
          dueDate: '',
          priority: 'normal',
          member: p.member || 'البيت',
          status: 'upcoming',
          photo: null,
          createdAt: new Date().toISOString(),
          notes: 'تسجيل صوتي: ' + p.rawText
        };
        appState.expectedExpenses.unshift(item);
        localStorage.setItem('family_monefy_expected', JSON.stringify(appState.expectedExpenses));
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
          notes: 'تسجيل صوتي ذكي: ' + p.rawText,
          createdAt: new Date().toISOString()
        };
        if (!Array.isArray(appState.transactions)) appState.transactions = [];
        appState.transactions.unshift(tx);

        if (typeof saveTx === 'function') saveTx();
        else localStorage.setItem('family_monefy_v2_tx', JSON.stringify(appState.transactions));
      }

      if (typeof renderUI === 'function') renderUI();
      closeConfirmDrawer();
      if (typeof showToast === 'function') showToast('تم تسجيل العملية الصوتية بنجاح ✓');
    } catch (err) {
      console.error('[Voice] Save error', err);
      if (typeof showToast === 'function') showToast('تعذر حفظ العملية الصوتية. يرجى مراجعة البيانات');
    }
  }

  /* --------------------------------------------------------------------------
     10. Fallback: Open in Full Native Modal for Detailed Editing
     -------------------------------------------------------------------------- */
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
      for (const id in fields) {
        const el = document.getElementById(id);
        if (el) el.value = fields[id];
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
    for (const id in fields) {
      const el = document.getElementById(id);
      if (el) el.value = fields[id];
    }
    document.getElementById('inpTxAmount')?.focus();
  }

  /* --------------------------------------------------------------------------
     Public API
     -------------------------------------------------------------------------- */
  return {
    toggleListening,
    stopListening,
    commitTransaction,
    openInModalForEdit,
    closeConfirmDrawer,
    parseSpokenText,
    changeDrawerCategory,
    changeDrawerAmount,
    changeDrawerLabel
  };
})();

window.VoiceAssistantEngine = VoiceAssistantEngine;
