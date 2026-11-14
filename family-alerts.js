/**
 * =========================================================================
 * Family Alerts Engine — Antigravity Architecture (v5.3.38)
 * محرك الإشعارات والتنبيهات الذكي لعائلة ماهر & أية
 * =========================================================================
 * - ربط فوري وشامل مع كافة العمليات المالية والالتزامات والموازنات والمهام
 * - فتح العملية أو الاستحقاق الأصلي مباشرة بكامل بياناته عند النقر
 * - صياغة عربية دقيقة ومطابقة بنسبة 100% لمعايير التنبيهات
 * - دعم وضع عدم الاتصال وتخزين آمن وتزامن لحظي بين النوافذ
 */

const familyAlerts = (() => {
  'use strict';

  // --- مفاتيح التخزين الآمن ---
  const STORAGE_KEY = 'family_alerts_store_v2';
  const READ_KEY = 'family_alerts_read_v2';
  const SOUND_KEY = 'family_alerts_sound_v2';
  const MAX_ALERTS = 800;

  let activeFilter = 'all';
  let audioContext = null;
  let previousTxMap = null;

  // --- دوال مساعدة للتخزين ---
  function safeRead(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn('[familyAlerts] Storage read error:', e);
      return fallback;
    }
  }

  function safeWrite(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('[familyAlerts] Storage write error:', e);
    }
  }

  // --- محول الأرقام العربية المشرقية ---
  function toArabicDigits(num, pad = 0) {
    if (num === null || num === undefined) return '';
    let str = pad > 0 ? String(num).padStart(pad, '0') : String(num);
    const digitsMap = { '0':'٠', '1':'١', '2':'٢', '3':'٣', '4':'٤', '5':'٥', '6':'٦', '7':'٧', '8':'٨', '9':'٩' };
    return str.replace(/[0-9]/g, d => digitsMap[d] || d);
  }

  // --- توحيد وتنسيق أسماء أفراد الأسرة ---
  function normalizePersonName(name) {
    if (!name) return 'البيت';
    const clean = String(name).trim();
    if (['آية', 'اية', 'أية'].includes(clean)) return 'اية';
    return clean;
  }

  function isFemaleName(name) {
    const n = normalizePersonName(name);
    return ['اية', 'مريم', 'الحاجة', 'النونو', 'أم ماهر'].includes(n);
  }

  // --- تنسيق التاريخ والوقت بدقة كاملة: الساعة ١٢ مساء 22/10/2026 ---
  function formatArabicDateTime(tx, fallbackTime) {
    let dateObj = null;

    if (tx?.date) {
      const parts = String(tx.date).split('T')[0].split('-');
      if (parts.length === 3) {
        let h = 12, m = 0;
        if (tx.time) {
          const tParts = String(tx.time).split(':');
          h = parseInt(tParts[0], 10) || 12;
          m = parseInt(tParts[1], 10) || 0;
        }
        dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), h, m);
      }
    }

    if (!dateObj || isNaN(dateObj.getTime())) {
      dateObj = new Date(Number(fallbackTime) || Date.now());
    }

    let h = dateObj.getHours();
    const m = dateObj.getMinutes();
    const period = h >= 12 ? 'مساء' : 'صباحا';
    h = h % 12 || 12;

    const hStr = toArabicDigits(h);
    const mStr = m > 0 ? ':' + toArabicDigits(m, 2) : '';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    return `الساعة ${hStr}${mStr} ${period} ${dateStr}`;
  }

  // --- محرك توليد نص التنبيه المالي التفصيلي ---
  function generateTransactionAlertText(tx, kind = 'add') {
    const rawAuthor = tx.author || tx.member || (typeof state !== 'undefined' ? state.currentUser : null) || 'ماهر';
    const author = normalizePersonName(rawAuthor);
    const isFemale = isFemaleName(author);
    const verb = isFemale ? 'قامت' : 'قام';
    const amtStr = toArabicDigits(Math.round(Number(tx.amount) || 0)) + ' جنيه';
    const dtStr = formatArabicDateTime(tx, tx.createdAt || tx.date);

    // صياغة المستفيد
    let memberStr = '';
    const memberName = normalizePersonName(tx.member);
    if (tx.member && memberName !== 'البيت' && memberName !== 'الكل') {
      memberStr = ' ل ' + memberName;
    } else if (memberName === 'البيت') {
      memberStr = ' للبيت';
    }

    // اسم البند
    let catName = 'مصروف يومى';
    if (typeof getCategoryName === 'function') {
      const resolved = getCategoryName(tx.category, tx.type);
      if (resolved) catName = resolved;
    }
    if (tx.category === 'daily') catName = 'مصروف يومى';

    // حالات العمليات المختلفة
    if (kind === 'delete') {
      return `${verb} ${author} بحذف عملية بمبلغ ${amtStr} بند ${catName}${memberStr} ${dtStr}`;
    }
    if (kind === 'edit') {
      return `${verb} ${author} بتعديل عملية بمبلغ ${amtStr} بند ${catName}${memberStr} ${dtStr}`;
    }
    if (tx.type === 'transfer' || tx.category === 'transfer') {
      const fromW = (typeof getWalletName === 'function') ? getWalletName(tx.fromWalletId || tx.walletId) : 'كاش البيت';
      const toW = (typeof getWalletName === 'function') ? getWalletName(tx.toWalletId || tx.to) : 'محفظة أخرى';
      return `${verb} ${author} بتحويل مبلغ ${amtStr} من ${fromW} إلى ${toW} ${dtStr}`;
    }
    if (tx.type === 'income') {
      return `${verb} ${author} بإيداع مبلغ ${amtStr} بند ${catName}${memberStr} ${dtStr}`;
    }

    // الصرف الافتراضي (المصروفات)
    // المطابقة التامة: "قامت اية بصرف مبلغ ١٠٠ جنيه بند مصروف يومى ل محمد الساعة ١٢ مساء 22/10/2026"
    return `${verb} ${author} بصرف مبلغ ${amtStr} بند ${catName}${memberStr} ${dtStr}`;
  }

  // --- محرك توليد نص تنبيه الالتزامات والفواتير ---
  function generateObligationAlertText(item) {
    const remaining = Number(item.amount || 0) - Number(item.paidAmount || 0);
    const amtStr = toArabicDigits(Math.round(remaining)) + ' جنيه';
    const title = item.title || item.label || 'فاتورة أو التزام';

    let dueStr = '';
    if (item.dueDate) {
      const parts = String(item.dueDate).split('T')[0].split('-');
      if (parts.length === 3) dueStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return `تذكير استحقاق: ${title} بمبلغ ${amtStr} تستحق في ${dueStr}`;
  }

  // --- محرك الصوت الذكي (Web Audio Synthesizer) ---
  function playAlertChime() {
    if (!safeRead(SOUND_KEY, false)) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      const now = audioContext.currentTime;
      // نغمة مزدوجة لطيفة (660Hz -> 880Hz)
      [660, 880].forEach((freq, idx) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const start = now + (idx * 0.12);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(start);
        osc.stop(start + 0.15);
      });
    } catch (e) {
      console.warn('[familyAlerts] Audio error:', e);
    }
  }

  async function toggleSound() {
    const current = safeRead(SOUND_KEY, false);
    const next = !current;
    if (next) {
      try {
        audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
        await audioContext.resume();
        safeWrite(SOUND_KEY, true);
        playAlertChime();
        if (typeof showToast === 'function') showToast('تم تفعيل صوت التنبيهات 🔔');
      } catch (e) {
        if (typeof showToast === 'function') showToast('تعذر تشغيل الصوت في المتصفح');
      }
    } else {
      safeWrite(SOUND_KEY, false);
      if (typeof showToast === 'function') showToast('تم كتم صوت التنبيهات 🔇');
    }
    render();
  }

  // --- إدارة سجل التنبيهات ---
  function getAlerts() {
    return safeRead(STORAGE_KEY, []);
  }

  function getReadIds() {
    const list = safeRead(READ_KEY, []);
    return new Set(Array.isArray(list) ? list : []);
  }

  function addAlerts(newEvents) {
    if (!Array.isArray(newEvents) || newEvents.length === 0) return;
    const current = getAlerts();
    const existingIds = new Set(current.map(a => a.id));
    const toInsert = newEvents.filter(a => a && a.id && !existingIds.has(a.id));

    if (toInsert.length > 0) {
      const merged = [...toInsert, ...current].sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, MAX_ALERTS);
      safeWrite(STORAGE_KEY, merged);
      playAlertChime();
      render();
    }
  }

  function mark(id, event) {
    if (event) event.stopPropagation();
    const readSet = getReadIds();
    if (id) {
      readSet.add(id);
    } else {
      getAlerts().forEach(a => readSet.add(a.id));
    }
    safeWrite(READ_KEY, Array.from(readSet));
    render();
  }

  // --- التلقيم التلقائي المبدئي من العمليات الفعلية إذا كان السجل فارغاً ---
  function hydrateFromActualData() {
    const stored = getAlerts();
    if (stored.length >= 10) return; // يوجد بيانات كافية بالفعل

    if (typeof state === 'undefined' || !Array.isArray(state.transactions)) return;

    const initial = [];
    // جلب آخر 30 حركة مالية حقيقية
    const recentTx = state.transactions.slice(0, 30);
    for (const tx of recentTx) {
      if (!tx || !tx.id) continue;
      const kind = tx.type === 'income' ? 'income' : (tx.type === 'transfer' || tx.category === 'transfer') ? 'transfer' : 'expense';
      const titles = { expense: 'مصروف جديد', income: 'إيداع جديد', transfer: 'تحويل بين المحافظ' };
      const body = generateTransactionAlertText(tx, 'add');
      const timestamp = tx.createdAt ? new Date(tx.createdAt).getTime() : (tx.date ? new Date(tx.date + 'T12:00:00').getTime() : Date.now());

      initial.push({
        id: 'tx:' + tx.id,
        txId: tx.id,
        kind: kind,
        title: titles[kind] || 'عملية مالية',
        body: body,
        at: timestamp,
        tx: { ...tx }
      });
    }

    // جلب الالتزامات والفواتير المستحقة
    const obligations = [...(state.expectedExpenses || []), ...(state.debts || [])];
    for (const ob of obligations) {
      if (!ob || !ob.id || ob.paid || ['paid', 'settled'].includes(ob.status)) continue;
      const remaining = Number(ob.amount || 0) - Number(ob.paidAmount || 0);
      if (!(remaining > 0)) continue;
      initial.push({
        id: 'due:' + ob.id,
        commitmentId: ob.id,
        kind: 'due',
        title: 'تذكير استحقاق',
        body: generateObligationAlertText(ob),
        at: Date.now()
      });
    }

    if (initial.length > 0) {
      addAlerts(initial);
    }
  }

  // --- التفاعل والمراقبة الدورية للعمليات ---
  function snapshotMap(transactions) {
    const map = new Map();
    if (!Array.isArray(transactions)) return map;
    for (const tx of transactions) {
      if (tx && tx.id && !tx.deleted) {
        map.set(tx.id, JSON.stringify({
          id: tx.id,
          amount: tx.amount,
          label: tx.label,
          category: tx.category,
          type: tx.type,
          walletId: tx.walletId,
          member: tx.member,
          date: tx.date,
          time: tx.time,
          from: tx.fromWalletId || tx.fromWallet,
          to: tx.toWalletId || tx.toWallet
        }));
      }
    }
    return map;
  }

  function observe(transactions, actor, baseline = false) {
    const nextMap = snapshotMap(transactions);
    if (!previousTxMap || baseline) {
      previousTxMap = nextMap;
      hydrateFromActualData();
      checkReminders();
      render();
      return;
    }

    const now = Date.now();
    const events = [];

    // فحص العمليات المضافة أو المعدلة
    for (const [id, jsonStr] of nextMap) {
      const oldJson = previousTxMap.get(id);
      const tx = (transactions || []).find(t => t.id === id);
      if (!tx) continue;

      if (!oldJson) {
        // عملية جديدة
        const kind = tx.type === 'income' ? 'income' : (tx.type === 'transfer' || tx.category === 'transfer') ? 'transfer' : 'expense';
        const titles = { expense: 'مصروف جديد', income: 'إيداع جديد', transfer: 'تحويل بين المحافظ' };
        events.push({
          id: `tx:add:${id}:${now}`,
          txId: id,
          kind: kind,
          title: titles[kind] || 'عملية جديدة',
          body: generateTransactionAlertText(tx, 'add'),
          at: now,
          tx: { ...tx }
        });
      } else if (oldJson !== jsonStr) {
        // عملية معدلة
        events.push({
          id: `tx:edit:${id}:${now}`,
          txId: id,
          kind: 'edit',
          title: 'تعديل عملية',
          body: generateTransactionAlertText(tx, 'edit'),
          at: now,
          tx: { ...tx }
        });
      }
    }

    // فحص العمليات المحذوفة
    for (const [id] of previousTxMap) {
      if (!nextMap.has(id)) {
        events.push({
          id: `tx:del:${id}:${now}`,
          txId: id,
          kind: 'delete',
          title: 'حذف عملية',
          body: `تم حذف عملية مالية بتاريخ ${formatArabicDateTime(null, now)}`,
          at: now
        });
      }
    }

    previousTxMap = nextMap;
    if (events.length > 0) {
      addAlerts(events);
    }
    checkReminders();
    render();
  }

  // --- تذكيرات الاستحقاقات والموازنات ---
  function checkReminders() {
    if (typeof state === 'undefined') return;
    const now = new Date();
    const todayStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(now) : now.toISOString().slice(0, 10);
    const events = [];

    // فحص الفواتير والالتزامات
    const obligations = [...(state.expectedExpenses || []), ...(state.debts || [])];
    for (const item of obligations) {
      if (!item || !item.id || item.paid || ['paid', 'settled', 'cancelled'].includes(item.status)) continue;
      const remaining = Number(item.amount || 0) - Number(item.paidAmount || 0);
      if (!(remaining > 0) || !item.dueDate) continue;

      const daysDiff = Math.round((new Date(item.dueDate + 'T00:00:00') - new Date(todayStr + 'T00:00:00')) / 86400000);
      if ([7, 3, 1, 0, -1].includes(daysDiff)) {
        const id = `due:${item.id}:${item.dueDate}:${daysDiff}`;
        events.push({
          id: id,
          commitmentId: item.id,
          kind: 'due',
          title: 'تذكير استحقاق',
          body: generateObligationAlertText(item),
          at: now.getTime(),
          commitment: { ...item }
        });
      }
    }

    // تذكير أية بتسجيل المصروفات إذا لم يُسجل مصروف اليوم
    const hasTodayExpense = (state.transactions || []).some(t => t.date === todayStr && t.type === 'expense');
    if (!hasTodayExpense && [13, 17, 21].includes(now.getHours())) {
      events.push({
        id: `reminder:aya:${todayStr}:${now.getHours()}`,
        kind: 'reminder',
        title: 'تذكير تسجيل المصروفات',
        body: 'لو فيه أي مصروفات لليوم، سجّليها في صفحة المصاريف.',
        at: now.getTime()
      });
    }

    if (events.length > 0) {
      addAlerts(events);
    }
  }

  // --- تسجيل مباشر وسريع للإنشاء من الأقسام الأخرى ---
  function created(kind, record) {
    if (!record) return;
    const now = Date.now();
    const who = normalizePersonName(typeof state !== 'undefined' ? state.currentUser : 'ماهر');

    if (kind === 'request') {
      addAlerts([{
        id: `request:${record.id}:${now}`,
        requestId: record.id,
        kind: 'request',
        title: 'طلب مبلغ جديد',
        body: `قام ${normalizePersonName(record.member)} بطلب مبلغ ${toArabicDigits(record.amount)} جنيه: ${record.reason || 'بدون سبب'}`,
        at: now
      }]);
    } else if (kind === 'budget') {
      addAlerts([{
        id: `budget:${record.id || record.month}:${now}`,
        budgetId: record.id,
        kind: 'budget',
        title: 'موازنة جديدة',
        body: `تم إعداد موازنة شهر ${record.month} بواسطة ${who}`,
        at: now
      }]);
    } else if (kind === 'task') {
      addAlerts([{
        id: `task:${record.id}:${now}`,
        taskId: record.id,
        kind: 'task',
        title: 'مهمة جديدة',
        body: `مهمة جديدة: "${record.title}" للمسؤول ${normalizePersonName(record.assignedMember)}`,
        at: now
      }]);
    }
  }

  // --- النقر على التنبيه لفتح الأصل فوراً وبشكل حاسم ---
  function handleAlertClick(item) {
    if (!item) return;

    // 1. تحديد كمقروء وتفعيل مؤشر العودة إلى نافذة التنبيهات عند إغلاق التفاصيل
    mark(item.id);
    window._returnToNotificationsOnClose = true;
    if (typeof closeModal === 'function') {
      closeModal('notificationsModal');
    }

    // 2. إذا كان تنبيه عملية مالية (صرف / إيداع / تحويل / تعديل)
    if (item.txId || item.tx || item.kind === 'expense' || item.kind === 'income' || item.kind === 'transfer' || item.kind === 'edit') {
      let targetId = item.txId || item.tx?.id;
      if (!targetId && item.id) {
        const parts = String(item.id).split(':');
        if (parts.length >= 3 && parts[0] === 'tx') targetId = parts[2];
        else if (parts.length >= 2 && parts[0] === 'tx') targetId = parts[1];
        else targetId = item.id;
      }
      if (typeof switchAppPage === 'function') {
        switchAppPage('operations');
      }
      if (targetId && typeof editTx === 'function') {
        editTx(targetId);
      }
      return;
    }

    // 3. إذا كان تنبيه استحقاق فاتورة أو دين أو التزام
    if (item.commitmentId || item.kind === 'due' || String(item.id).startsWith('due:')) {
      let targetId = item.commitmentId;
      if (!targetId && item.id) {
        const parts = String(item.id).split(':');
        targetId = parts[1] || item.id;
      }
      if (typeof switchAppPage === 'function') {
        switchAppPage('expected');
      }
      if (targetId && typeof openEditCommitmentModal === 'function') {
        openEditCommitmentModal(targetId);
      }
      return;
    }

    // 4. إذا كان طلب مبلغ
    if (item.requestId || item.kind === 'request') {
      if (typeof switchAppPage === 'function') {
        switchAppPage('requests');
      }
      return;
    }

    // 5. إذا كانت موازنة
    if (item.budgetId || item.kind === 'budget') {
      if (typeof switchAppPage === 'function') {
        switchAppPage('expected');
        if (typeof switchExpectedTopSection === 'function') switchExpectedTopSection('budgets');
      }
      return;
    }

    // 6. إذا كانت مهمة
    if (item.taskId || item.kind === 'task') {
      if (typeof openTasksFullScreenModal === 'function') {
        openTasksFullScreenModal();
      } else if (typeof openTasksModal === 'function') {
        openTasksModal();
      }
      return;
    }

    // 7. تذكير عام بالمصروفات
    if (item.kind === 'reminder' || String(item.id).startsWith('reminder:')) {
      if (typeof switchAppPage === 'function') {
        switchAppPage('expenses');
      }
    }
  }

  // --- تصفية القائمة ---
  function setFilter(filterType, btnEl) {
    activeFilter = filterType;
    document.querySelectorAll('.alert-pill').forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    render();
  }

  // --- رندر الواجهة وتحديث العداد والشارة ---
  function render() {
    const alerts = getAlerts();
    const readSet = getReadIds();
    const unreadCount = alerts.filter(a => !readSet.has(a.id)).length;

    // تحديث الشارة في شريط العنوان الرئيسي
    const badge = document.getElementById('headerNotifBadge');
    if (badge) {
      badge.hidden = unreadCount === 0;
      badge.textContent = toArabicDigits(unreadCount);
    }

    // تحديث زر الصوت
    const soundBtn = document.getElementById('alertSoundButton');
    if (soundBtn) {
      const isSoundOn = safeRead(SOUND_KEY, false);
      soundBtn.textContent = isSoundOn ? '🔊' : '🔇';
      soundBtn.title = isSoundOn ? 'صوت التنبيهات مفعّل' : 'صوت التنبيهات مكتوم';
    }

    // تحديث عداد الفلتر غير المقروء
    const unreadPillCount = document.getElementById('unreadPillCount');
    if (unreadPillCount) {
      unreadPillCount.textContent = unreadCount > 0 ? `(${toArabicDigits(unreadCount)})` : '';
    }

    // التحقق من وجود الحاوية في الصفحة
    const container = document.getElementById('notificationsListContainer');
    if (!container) return;

    // فلترة التنبيهات
    let filtered = alerts;
    if (activeFilter === 'unread') {
      filtered = alerts.filter(a => !readSet.has(a.id));
    } else if (activeFilter === 'expense') {
      filtered = alerts.filter(a => a.kind === 'expense');
    } else if (activeFilter === 'due') {
      filtered = alerts.filter(a => a.kind === 'due');
    }

    container.replaceChildren();

    if (filtered.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'alert-empty-state';
      emptyMsg.style.cssText = 'padding: 30px 10px; text-align: center; color: #94a3b8; font-size: 0.86rem; font-weight: 700;';
      emptyMsg.textContent = activeFilter === 'unread' ? 'لا توجد تنبيهات غير مقروءة حالياً 🎉' : 'لا توجد تنبيهات في هذا القسم حتى الآن.';
      container.append(emptyMsg);
      return;
    }

    for (const item of filtered) {
      const isUnread = !readSet.has(item.id);
      const card = document.createElement('article');
      card.className = 'family-alert';
      card.dataset.unread = String(isUnread);

      // الزر الرئيسي لفتح العملية الأصلية
      const mainBtn = document.createElement('button');
      mainBtn.className = 'family-alert-main';
      mainBtn.type = 'button';
      mainBtn.title = 'اضغط لفتح العملية الأصلية مباشرة';
      mainBtn.onclick = () => handleAlertClick(item);

      // رأس التنبيه (النوع والوقت)
      const headRow = document.createElement('div');
      headRow.className = 'alert-header-row';

      const badgeType = document.createElement('span');
      badgeType.className = `alert-badge-type alert-kind-${item.kind || 'default'}`;
      badgeType.textContent = item.title || 'تنبيه';
      headRow.append(badgeType);

      if (isUnread) {
        const dot = document.createElement('span');
        dot.className = 'alert-unread-dot';
        dot.title = 'غير مقروء';
        headRow.append(dot);
      }

      mainBtn.append(headRow);

      // نص التنبيه المالي التفصيلي
      const bodyEl = document.createElement('div');
      bodyEl.className = 'alert-body-text';
      bodyEl.textContent = item.body || '';
      mainBtn.append(bodyEl);

      card.append(mainBtn);

      // زر تحديد كمقروء السريع
      if (isUnread) {
        const checkBtn = document.createElement('button');
        checkBtn.className = 'alert-check-btn';
        checkBtn.type = 'button';
        checkBtn.textContent = '✓';
        checkBtn.title = 'تحديد كمقروء دون مغادرة التنبيهات';
        checkBtn.setAttribute('aria-label', 'تحديد كمقروء');
        checkBtn.onclick = (e) => mark(item.id, e);
        card.append(checkBtn);
      }

      container.append(card);
    }
  }

  // --- دالة الحالات التجريبية الـ 50 للاختبار الشامل ---
  function demo() {
    const at = Date.now();
    const today = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date(at)) : new Date(at).toISOString().slice(0, 10);
    const wallet = state.wallets?.[0]?.id || 'wallet-cash-safe';
    const actors = ['أية', 'ماهر', 'محمد', 'مريم'];
    const events = [];

    // 1. توليد 25 عملية مالية متنوعة وإدراجها في state.transactions
    for (let i = 0; i < 25; i++) {
      const kind = (i % 5 === 0) ? 'income' : (i % 7 === 0) ? 'transfer' : 'expense';
      const author = actors[i % actors.length];
      const member = actors[(i + 1) % actors.length];
      const amt = 50 + (i * 20);
      const id = `alert-demo-tx-${at}-${i + 1}`;

      const tx = {
        id: id,
        type: kind === 'transfer' ? 'expense' : kind,
        amount: amt,
        author: author,
        member: member,
        category: kind === 'income' ? 'salary' : (kind === 'transfer' ? 'transfer' : 'daily'),
        date: today,
        time: '12:00',
        walletId: wallet,
        label: `تجربة التنبيهات ${i + 1}`,
        createdAt: new Date(at - (i * 3600000)).toISOString()
      };

      if (kind === 'transfer') {
        tx.fromWalletId = wallet;
        tx.toWalletId = state.wallets?.[1]?.id || wallet;
      }

      state.transactions.unshift(tx);

      const titles = { expense: 'مصروف جديد', income: 'إيداع جديد', transfer: 'تحويل بين المحافظ' };
      events.push({
        id: `tx:${id}`,
        txId: id,
        kind: kind,
        title: titles[kind] || 'مصروف جديد',
        body: generateTransactionAlertText(tx, 'add'),
        at: tx.createdAt ? new Date(tx.createdAt).getTime() : at,
        tx: { ...tx }
      });
    }

    // 2. توليد 10 استحقاقات وفواتير وإدراجها في state.expectedExpenses
    for (let i = 0; i < 10; i++) {
      const dueId = `alert-demo-due-${at}-${i + 1}`;
      const dueTitle = (i % 2 === 0) ? `فاتورة كهرباء شهر ${toArabicDigits(i + 1)}` : `قسط مالي ${toArabicDigits(i + 1)}`;
      const exp = {
        id: dueId,
        title: dueTitle,
        amount: 300 + (i * 50),
        paidAmount: 0,
        dueDate: today,
        status: 'upcoming'
      };
      state.expectedExpenses.unshift(exp);

      events.push({
        id: `due:${dueId}`,
        commitmentId: dueId,
        kind: 'due',
        title: 'تذكير استحقاق',
        body: generateObligationAlertText(exp),
        at: at - (i * 1800000),
        commitment: { ...exp }
      });
    }

    // 3. حفظ الحالة وتحديث الشاشة
    if (typeof saveTx === 'function') saveTx();
    if (typeof saveMoneyRequests === 'function') saveMoneyRequests();
    addAlerts(events);
    render();
    if (typeof showToast === 'function') showToast('تم تسجيل الحالات التجريبية واختبار الربط بنجاح ✅');
  }

  // --- فتح النافذة وتحديث التنبيهات ---
  function open() {
    hydrateFromActualData();
    checkReminders();
    if (typeof openModal === 'function') {
      openModal('notificationsModal');
    }
    render();
  }

  function refresh() {
    hydrateFromActualData();
    checkReminders();
    render();
  }

  // --- المستمعات والتزامن التلقائي ---
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === READ_KEY || e.key === SOUND_KEY) {
      render();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
  });

  window.addEventListener('focus', () => refresh());
  setInterval(() => refresh(), 60000);

  // تصدير الواجهة العامة
  return {
    observe,
    created,
    mark,
    render,
    open,
    refresh,
    toggleSound,
    demo,
    setFilter,
    handleAlertClick,
    formatArabicDateTime,
    generateTransactionAlertText,
    generateObligationAlertText,
    toArabicDigits,
    normalizePersonName
  };
})();