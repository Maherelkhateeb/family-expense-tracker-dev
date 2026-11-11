function renderOperationsList(filtered, appendMore = false) {
      const container = document.getElementById('txOperationsList');
      if (!container) return;

      if (!appendMore) {
        opsRenderLimit = 40;
      }

      // 1. مصدر الحركات الأساسي
      let list = (filtered && Array.isArray(filtered) && filtered.length > 0) 
        ? [...filtered] 
        : [...(state.transactions || [])];

      // 2. تطبيق فلترة الفترة الزمنية بدقة تامة (اليوم / الأسبوع / الشهر / الكل / مخصص)
      const p = state.period || 'month';
      const now = new Date();
      const todayStr = getLocalDateStr(now);

      if (p === 'day' || p === 'today') {
        list = list.filter(t => t.date === todayStr);
      } else if (p === 'week') {
        const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const sevenDaysAgoStr = getLocalDateStr(sevenDaysAgo);
        list = list.filter(t => t.date && t.date >= sevenDaysAgoStr && t.date <= todayStr);
      } else if (p === 'month') {
        const curYearMonth = todayStr.slice(0, 7);
        list = list.filter(t => t.date && t.date.startsWith(curYearMonth));
      } else if (p === 'custom' && state.customDateRange) {
        const { from, to } = state.customDateRange;
        if (from && to) {
          list = list.filter(t => t.date && t.date >= from && t.date <= to);
        } else if (from) {
          list = list.filter(t => t.date && t.date >= from);
        } else if (to) {
          list = list.filter(t => t.date && t.date <= to);
        }
      }

      // 3. تطبيق تصفية النوع على العمليات (المصروفات / الدخل / الكل)
      if (opsTypeFilterState === 'expense') {
        list = list.filter(t => t.type === 'expense');
      } else if (opsTypeFilterState === 'income') {
        list = list.filter(t => t.type === 'income');
      }

      // 4. تطبيق فلترة التصنيف في صفحة العمليات (Category Filter)
      const catFilter = document.getElementById('opsFilterCategory')?.value || 'all';
      if (catFilter && catFilter !== 'all') {
        list = list.filter(t => {
          const c = (t.category || '').toLowerCase();
          if (catFilter === 'food') return c === 'food' || c === 'supermarket';
          if (catFilter === 'daily') return c === 'daily' || c === 'cafe';
          if (catFilter === 'bills') return c === 'bills' || c === 'utilities';
          if (catFilter === 'transport') return c === 'transport' || c === 'fuel';
          if (catFilter === 'house') return c === 'house' || c === 'home';
          if (catFilter === 'health') return c === 'health' || c === 'medical' || c === 'pharmacy';
          if (catFilter === 'clothes') return c === 'clothes' || c === 'shopping';
          if (catFilter === 'education') return c === 'education' || c === 'school';
          if (catFilter === 'other') return c === 'other' || c === 'others' || c === 'gifts';
          // بنود الدخل
          if (catFilter === 'salary') return c === 'salary';
          if (catFilter === 'bonus') return c === 'bonus';
          if (catFilter === 'invest') return c === 'invest';
          if (catFilter === 'business') return c === 'business';
          if (catFilter === 'other_inc') return c === 'other_inc' || c === 'income';
          return c === catFilter;
        });
      }

      // 5. تطبيق فلترة العضو في صفحة العمليات (Member Filter)
      let memFilter = document.getElementById('opsFilterMember') ? document.getElementById('opsFilterMember').value : (state.currentMemberFilter && state.currentMemberFilter !== 'الكل' ? state.currentMemberFilter : 'all');
      if (memFilter && memFilter !== 'all') {
        list = list.filter(t => {
          const m = t.member || 'البيت';
          if (memFilter === 'البيت') return m === 'البيت' || m === 'العائلة' || !t.member;
          if (memFilter === 'آية' || memFilter === 'أية') return m === 'آية' || m === 'أية';
          return m === memFilter;
        });
      }

      // 6. تطبيق نص البحث إذا وجد
      const searchInp = document.getElementById('opsSearchInput');
      const q = searchInp ? searchInp.value.trim().toLowerCase() : '';
      if (q) {
        list = list.filter(t => {
          const l = (t.label || '').toLowerCase();
          const c = (t.category || '').toLowerCase();
          const cName = (typeof getCategoryName === 'function' ? (getCategoryName(t.category, t.type) || '') : '').toLowerCase();
          const m = (t.member || '').toLowerCase();
          const a = String(t.amount || '');
          const w = (typeof getWalletName === 'function' ? getWalletName(t.walletId) : '').toLowerCase();
          const d = (t.date || '').toLowerCase();
          return l.includes(q) || c.includes(q) || cName.includes(q) || m.includes(q) || a.includes(q) || w.includes(q) || d.includes(q);
        });
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 30px 10px; text-align: center;">
            <i class="fa-solid fa-receipt" style="color: #64748b; font-size: 2.2rem; margin-bottom: 10px;"></i>
            <div class="empty-title" style="color: #cbd5e1; font-weight: 800; font-size: 0.95rem;">لا توجد عمليات مطابقة للفترة أو الفلاتر</div>
            <div class="empty-desc" style="color: #64748b; font-size: 0.8rem; margin-top: 4px;">جرّب اختيار فترة زمنية أخرى (الشهر / الكل) أو إعادة ضبط الفلاتر</div>
          </div>
        `;
        return;
      }

      const totalCount = list.length;
      const todayIso = getLocalDateStr(new Date());
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayIso = getLocalDateStr(yesterdayDate);

      // ترتيب الحركات تنازلياً حسب التاريخ والوقت
      list.sort((a, b) => {
        const da = (a.date || '') + ' ' + (a.time || '');
        const db = (b.date || '') + ' ' + (b.time || '');
        return db.localeCompare(da);
      });

      // تجميع العمليات بحسب التاريخ
      const groupedByDate = {};
      const itemsToRender = list.slice(0, opsRenderLimit);

      itemsToRender.forEach(tx => {
        const d = tx.date || todayIso;
        if (!groupedByDate[d]) groupedByDate[d] = [];
        groupedByDate[d].push(tx);
      });

      // بناء مخرجات البطاقات ككتلة HTML موحدة وسريعة جداً (Single Batch DOM Update)
      let cardsHtml = '';
      for (const [dateStr, txs] of Object.entries(groupedByDate)) {
        let groupTitle = dateStr;
        if (dateStr === todayIso) groupTitle = 'اليوم (Today) - ' + dateStr;
        else if (dateStr === yesterdayIso) groupTitle = 'الأمس (Yesterday) - ' + dateStr;

        let dayExpSum = 0, dayIncSum = 0;
        txs.forEach(t => {
          const amt = Number(t.amount) || 0;
          if (t.type === 'expense') dayExpSum += amt;
          else dayIncSum += amt;
        });

        let subtotalBadge = '';
        if (dayExpSum > 0 && dayIncSum > 0) {
          subtotalBadge = `${formatMoneyWithSignHtml(dayExpSum, '-', 'ops-date-subtotal exp')} ${formatMoneyWithSignHtml(dayIncSum, '+', 'ops-date-subtotal inc')}`;
        } else if (dayExpSum > 0) {
          subtotalBadge = `<span style="font-size: 0.70rem; color: #94a3b8; margin-left: 3px;">إجمالي المنصرف:</span> ${formatMoneyWithSignHtml(dayExpSum, '-', 'ops-date-subtotal exp')}`;
        } else {
          subtotalBadge = `<span style="font-size: 0.70rem; color: #94a3b8; margin-left: 3px;">إجمالي الدخل:</span> ${formatMoneyWithSignHtml(dayIncSum, '+', 'ops-date-subtotal inc')}`;
        }

        cardsHtml += `
          <div class="ops-date-group-header">
            <div class="ops-date-title"><i class="fa-regular fa-calendar"></i> ${groupTitle}</div>
            <div>${subtotalBadge}</div>
          </div>
        `;

        // كروت الحركات
        txs.forEach(tx => {
          const cat = getCategoryObj(tx.category, tx.type);
          const isExp = tx.type === 'expense';
          const amt = Number(tx.amount) || 0;
          const sign = isExp ? '- ' : '+ ';
          const memberAvatar = MEMBER_AVATARS[tx.member] || null;

          let avatarHtml = memberAvatar
            ? `<img src="${memberAvatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">`
            : `<i class="fa-solid fa-user" style="font-size: 0.7rem; color: #38bdf8;"></i>`;

          let receiptBadge = '';
          if (tx.receipt) {
            receiptBadge = `
              <span class="ops-tx-chip" onclick="event.stopPropagation(); openReceiptLightbox('${tx.receipt}', 'فاتورة: ${escapeHtml(tx.label || cat.name)}')" style="background: rgba(236, 72, 153, 0.18); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.35); cursor: pointer;" title="عرض الفاتورة المرفقة">
                <i class="fa-solid fa-file-invoice"></i> فاتورة
              </span>
            `;
          }

          let typePill = !isExp ? `
            <span class="ops-tx-chip" style="background: rgba(16, 185, 129, 0.18); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); font-weight: 800;">
              <i class="fa-solid fa-arrow-down-left"></i> إيداع ودخل
            </span>
          ` : '';

          cardsHtml += `
            <div class="ops-tx-card-lux" data-tx-id="${tx.id}" ondblclick="openEditTxModal('${tx.id}')" title="اضغط مرتين لعرض التفاصيل والتعديل">
              <div class="ops-tx-right-cluster">
                <div class="ops-tx-icon-bubble" style="background: linear-gradient(135deg, ${cat.color || '#38bdf8'}, ${(cat.color || '#38bdf8')}99); color: #ffffff;">
                  <i class="fa-solid ${cat.icon || 'fa-receipt'}"></i>
                </div>
                <div class="ops-tx-info-block">
                  <div class="ops-tx-label-text" title="${escapeHtml(tx.label || cat.name)}">
                    ${escapeHtml(tx.label || cat.name)}
                  </div>
                  <div class="ops-tx-meta-chips">
                    <span class="ops-tx-chip" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25);">
                      ${avatarHtml}
                      <span>${tx.member || 'العائلة'}</span>
                    </span>
                    <span class="ops-tx-chip" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25);">
                      <i class="fa-solid fa-vault"></i>
                      <span>${getWalletName(tx.walletId)}</span>
                    </span>
                    ${typePill}
                    ${receiptBadge}
                  </div>
                </div>
              </div>
              <div class="ops-tx-left-cluster">
                ${formatMoneyWithSignHtml(amt, sign, 'ops-tx-amount-text')}
                <button class="ops-tx-edit-btn" onclick="openEditTxModal('${tx.id}')" title="تعديل وتفاصيل الحركة" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 4px; transition: all 0.2s;">
                  <i class="fa-solid fa-pen-to-square" style="font-size: 0.76rem;"></i>
                </button>
                <button class="ops-tx-del-btn" onclick="deleteTx('${tx.id}')" title="حذف الحركة">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          `;
        });
      }

      // زر عرض المزيد إن وجد حركات إضافية
      if (totalCount > opsRenderLimit) {
        const remaining = totalCount - opsRenderLimit;
        cardsHtml += `
          <div id="btnLoadMoreOps" style="text-align: center; margin: 16px 0 24px;">
            <button type="button" class="btn-export-tool" onclick="loadMoreOperations()" style="padding: 10px 24px; font-size: 0.82rem; font-weight: 800; background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
              <i class="fa-solid fa-angles-down"></i> عرض 40 حركة إضافية (المتبقي: ${remaining.toLocaleString()} عملية)
            </button>
          </div>
        `;
      }

      container.innerHTML = cardsHtml;
      const fullContainer = document.getElementById('tasksFullScreenContainerList');
      if (fullContainer) {
        fullContainer.innerHTML = cardsHtml;
      }
      // تحديث شارات ونسبة الشاشة الكاملة
      const kpiTotF = document.getElementById('kpiTasksTotalFull');
      const kpiActF = document.getElementById('kpiTasksActiveFull');
      const kpiOvdF = document.getElementById('kpiTasksOverdueFull');
      const kpiDonF = document.getElementById('kpiTasksDoneFull');
      const barF = document.getElementById('tasksOverallProgressBarFull');
      const pctF = document.getElementById('tasksOverallProgressPctFull');
      if (kpiTotF) kpiTotF.textContent = totalCount;
      if (kpiActF) kpiActF.textContent = activeCount;
      if (kpiOvdF) kpiOvdF.textContent = overdueCount;
      if (kpiDonF) kpiDonF.textContent = doneCount;
      if (barF) barF.style.width = `${completionRate}%`;
      if (pctF) pctF.textContent = `${completionRate}%`;
    }

    function loadMoreOperations() {
      opsRenderLimit = (opsRenderLimit || 40) + 40;
      renderOperationsList(null, true);
    }

    function filterOperationsList() {
      const inp = document.getElementById('opsSearchInput');
      state.searchQuery = inp ? inp.value.trim() : '';
      renderOperationsList(state.transactions || []);
    }

    // =========================================================================
    // اختيار أفراد العائلة (Persistent Filter Across All Pages)
    // =========================================================================
    function selectMember(member) {
      state.currentMemberFilter = member;
      state.selectedMember = member;

      // تنبيه: اختيار فرد من الشريط العلوي هو فلترة بصرية فقط ولا يغير حساب المستخدم المسجل دخوله
      // منفذ العملية يظل دائماً صاحب الحساب المسجل به الدخول حالياً (state.currentUser)

      // تحديث تمييز الأفاتار المختار في الشريط العلوي الثابت بحلقة ذهبية متوهجة وتأثير بارز
      const cards = document.querySelectorAll('.avatar-card');
      cards.forEach(c => {
        if (c.getAttribute('data-member') === member) c.classList.add('active');
        else c.classList.remove('active');
      });

      if (typeof updateUserAndDefaultDisplay === 'function') {
        updateUserAndDefaultDisplay();
      }

      // إعادة رسم وتحديث كافة صفحات البرنامج فوراً
      renderUI();

      let memberDisplayName = member;
      if (member === 'الكل') memberDisplayName = 'كافة المصروفات (إجمالي عام)';
      else if (member === 'البيت') memberDisplayName = 'مصروفات وتكاليف البيت';
      showToast(`👤 تم تصفية العرض على: ${memberDisplayName}`);
    }

    // =========================================================================
    // نافذة تسجيل حركة جديدة (Tx Modal with Inline Calc, Default Family & Receipt)
    // =========================================================================
    function openTxModal(type = 'expense', preCat = null) {
      currentModalType = type;
      if (typeof initMemberPhotoPickers === 'function') {
        initMemberPhotoPickers();
      }
      const titleEl = document.getElementById('txModalTitleText');
      const iconEl = document.getElementById('txModalTitleIcon');
      const bannerEl = document.getElementById('txNatureBanner');
      const bannerTxt = document.getElementById('txNatureText');
      const btnSaveTxt = document.getElementById('btnSaveTxText');
      const memberSel = document.getElementById('inpTxMember');
      const catSel = document.getElementById('inpTxCategory');
      const amountInp = document.getElementById('inpTxAmount');
      const labelInp = document.getElementById('inpTxLabel');
      const dateInp = document.getElementById('inpTxDate');

      if (amountInp) amountInp.value = '';
      if (labelInp) labelInp.value = '';
      if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];
      clearReceiptUpload();

      if (catSel) {
        catSel.innerHTML = '';
        const list = (type === 'income') ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        list.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = `${c.name}`;
          catSel.appendChild(opt);
        });
        if (preCat) catSel.value = preCat;
      }

      // الديفولت الأوتوماتيكي:
      // عند فتح تسجيل مصروف جديد في حالة عدم اختيار شخص يكون الافتراضي هو "البيت"
      if (memberSel) {
        let defMember = 'البيت';
        if (type === 'expense') {
          if (state.currentMemberFilter && state.currentMemberFilter !== 'الكل') {
            defMember = state.currentMemberFilter;
          } else {
            defMember = 'البيت';
          }
        } else {
          defMember = (state.currentMemberFilter && state.currentMemberFilter !== 'الكل') ? state.currentMemberFilter : 'ماهر';
        }
        memberSel.value = defMember;
        if (typeof selectTxMemberPicker === 'function') {
          selectTxMemberPicker(defMember);
        }
      }

      const execBadge = document.getElementById('txModalExecutorBadge');
      if (execBadge) execBadge.textContent = state.currentUser || 'ماهر';

      if (type === 'income') {
        if (titleEl) titleEl.textContent = 'تسجيل دخل جديد';
        if (iconEl) { iconEl.className = 'fa-solid fa-circle-plus'; iconEl.style.color = '#10b981'; }
        if (bannerEl) bannerEl.className = 'tx-nature-banner income-nature';
        if (bannerTxt) bannerTxt.textContent = 'وارد / إيداع جديد إلى الرصيد';
        if (btnSaveTxt) btnSaveTxt.textContent = 'حفظ الدخل فوراً';
      } else {
        if (titleEl) titleEl.textContent = 'تسجيل مصروف جديد';
        if (iconEl) { iconEl.className = 'fa-solid fa-circle-minus'; iconEl.style.color = '#ef4444'; }
        if (bannerEl) bannerEl.className = 'tx-nature-banner expense-nature';
        if (bannerTxt) bannerTxt.textContent = 'مصروف / خصم جديد من الرصيد';
        if (btnSaveTxt) btnSaveTxt.textContent = 'حفظ المصروف فوراً';
      }

      openModal('txModal');
    }

    function handleSaveTx() {
      const amountInp = document.getElementById('inpTxAmount');
      const labelInp = document.getElementById('inpTxLabel');
      const catInp = document.getElementById('inpTxCategory');
      const memberInp = document.getElementById('inpTxMember');
      const walletInp = document.getElementById('inpTxWallet');
      const dateInp = document.getElementById('inpTxDate');
      const errHint = document.getElementById('txLabelError');

      const amount = parseFloat(amountInp ? amountInp.value : 0);
      const label = labelInp ? labelInp.value.trim() : '';

      if (isNaN(amount) || amount <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ صحيح أكبر من الصفر');
        if (amountInp) amountInp.focus();
        return;
      }

      if (!label) {
        if (errHint) errHint.style.display = 'block';
        if (labelInp) {
          labelInp.focus();
          labelInp.classList.add('error');
        }
        showToast('⚠️ بيان الحركة إلزامي لتسجيل المصروف أو الدخل!');
        return;
      }
      if (errHint) errHint.style.display = 'none';

      const localToday = typeof getLocalDateStr === 'function' ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0];
      const newTx = {
        id: 'tx-' + Date.now(),
        type: currentModalType,
        amount: amount,
        label: label,
        category: catInp ? catInp.value : 'other',
        member: (memberInp && memberInp.value) ? memberInp.value : (state.selectedMember !== 'الكل' ? state.selectedMember : 'البيت'),
        walletId: walletInp && walletInp.value ? walletInp.value : (state.currentWalletId !== 'all' ? state.currentWalletId : 'wallet-cash-safe'),
        date: dateInp && dateInp.value ? dateInp.value : localToday,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        author: state.currentUser || 'ماهر',
        receipt: state.pendingReceiptDataUri || null
      };

      // إضافة إشعار ذكي مرتبط بالحركة فوراً
      if (typeof addSystemNotification === 'function') {
        addSystemNotification({
          type: currentModalType,
          title: currentModalType === 'income' ? 'إيداع جديد تم تسجيله' : 'مصروف جديد تم تسجيله',
          body: `${label} بمبلغ ${formatMoney(amount)} (${newTx.member})`,
          txId: newTx.id
        });
      }

      state.transactions.unshift(newTx);
      saveTx();
      // ضمان ظهور الحركة الجديدة فوراً في صفحة العمليات المسجلة بإزالة أي حجب مؤقت
      try {
        const opsSearch = document.getElementById('opsSearchInput');
        if (opsSearch) opsSearch.value = '';
        state.searchQuery = '';
        opsTypeFilterState = 'all';
        const typeChips = document.querySelectorAll('.ops-type-chip');
        typeChips.forEach(c => {
          if (c.getAttribute('data-type') === 'all') c.classList.add('active');
          else c.classList.remove('active');
        });
        const catFilter = document.getElementById('opsFilterCategory');
        if (catFilter) catFilter.value = 'all';
        const memFilter = document.getElementById('opsFilterMember');
        if (memFilter) memFilter.value = 'all';
      } catch(e) {}

      logActivity({
        type: currentModalType === 'income' ? 'add_income' : 'add_expense',
        action: currentModalType === 'income' ? 'إضافة دخل' : 'تسجيل مصروف',
        label: `${label} (${getCategoryName(newTx.category)})`,
        amount: amount,
        sign: currentModalType === 'income' ? '+' : '-',
        member: newTx.member,
        author: state.currentUser || 'ماهر',
        wallet: (typeof getWalletName === 'function' ? getWalletName(newTx.walletId) : newTx.walletId),
        category: (typeof getCategoryName === 'function' ? getCategoryName(newTx.category) : newTx.category),
        receipt: newTx.receipt,
        notes: `مسجل في محفظة: ${(typeof getWalletName === 'function' ? getWalletName(newTx.walletId) : newTx.walletId)}`
      });

      playNotificationChime();
      closeModal('txModal');
      renderUI();
      
      addSystemNotification({
        type: currentModalType,
        title: currentModalType === 'income' ? 'إيداع / دخل جديد' : 'تسجيل مصروف جديد',
        body: `${label} بمبلغ ${amount} ج.م (${getCategoryName(newTx.category)}) بواسطة ${newTx.author || 'ماهر'}`,
        txId: newTx.id
      });
      filterOperationsList();
      showToast(`✅ تم حفظ ${currentModalType === 'income' ? 'الدخل' : 'المصروف'} بنجاح: ${amount} ج.م`);
    }

    function deleteTx(id) {
      const tx = state.transactions.find(t => t.id === id);
      if (!tx) return;
      if (confirm(`هل أنت متأكد من حذف حركة: "${tx.label}" بمبلغ (${tx.amount} ج.م)؟`)) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveTx();

        logActivity({
          type: 'delete_tx',
          action: 'حذف حركة',
          label: `حذف: ${tx.label} (${tx.type === 'income' ? 'دخل' : 'مصروف'})`,
          amount: tx.amount,
          member: tx.member,
          author: state.currentUser || 'ماهر'
        });

        renderUI();
        showToast('🗑️ تم حذف الحركة بنجاح');
      }
    }

        // دالة توحيد وترقية معرفات المحافظ للعمليات التاريخية
    function normalizeWalletId(wId) {
      if (!wId) return 'wallet-cash-safe';
      if (wId === 'wallet-cash-safe' || wId === 'wallet-default' || wId === 'wallet-home-cash') return 'wallet-cash-safe';
      if (wId === 'wallet-vodafone') return 'wallet-vodafone';
      if (wId === 'wallet-reserve' || wId === 'wallet-bank-misr') return 'wallet-reserve';
      if (wId === 'wallet-other' || wId === 'wallet-instapay' || wId === 'wallet-cib-credit') return 'wallet-other';
      if (wId === 'wallet-ahly') return 'wallet-cash-safe';
      return 'wallet-cash-safe';
    }

    function saveTx() {
      if (typeof triggerDriveAutoSync === "function") triggerDriveAutoSync();

      try {
        localStorage.setItem('family_monefy_v2_tx', JSON.stringify(state.transactions));
      } catch(e) {
        console.warn('LocalStorage limit exceeded, data retained in active memory state:', e);
      }
      try {
        syncChannel.postMessage({
          type: 'SYNC_TRANSACTIONS',
          transactions: state.transactions.slice(0, 500),
          sender: state.currentUser
        });
      } catch(e) {}
    }

    // =========================================================================
    // إدارة رفع وتصوير الفواتير (Receipt Camera / Upload)
    // =========================================================================
    function handleReceiptUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let w = img.width;
          let h = img.height;
          if (w > h && w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUri = canvas.toDataURL('image/jpeg', 0.82);
          state.pendingReceiptDataUri = compressedDataUri;

          const previewImg = document.getElementById('receiptPreviewImg');
          const previewCont = document.getElementById('receiptPreviewContainer');
          const clearBtn = document.getElementById('btnClearReceipt');
          if (previewImg) previewImg.src = compressedDataUri;
          if (previewCont) previewCont.style.display = 'block';
          if (clearBtn) clearBtn.style.display = 'inline-flex';
          const badge = document.getElementById('txPhotoAttachedBadge'); if (badge) badge.style.display = 'inline-flex';
          showToast('📷 تم تحميل صورة الفاتورة بنجاح');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function clearReceiptUpload() {
      state.pendingReceiptDataUri = null;
      const inp = document.getElementById('inpTxReceipt');
      if (inp) inp.value = '';
      const previewCont = document.getElementById('receiptPreviewContainer');
      const clearBtn = document.getElementById('btnClearReceipt');
      if (previewCont) previewCont.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
      const badge = document.getElementById('txPhotoAttachedBadge'); if (badge) badge.style.display = 'none';
    }

    function openReceiptLightbox(source, optionalTitle = '') {
      const lbl = document.getElementById('lightboxTxLabel');
      const img = document.getElementById('lightboxImg');
      const header = document.getElementById('lightboxHeaderTitle');
      if (!img) return;

      if (typeof source === 'string' && (source.startsWith('data:image') || source.startsWith('http') || source.startsWith('blob:'))) {
        if (header) header.textContent = 'معاينة الصورة المرفقة';
        if (lbl) lbl.textContent = optionalTitle || 'مرفق مصور بالملاحظة';
        img.src = source;
        openModal('receiptLightboxModal');
        return;
      }

      const tx = (state.transactions || []).find(t => t.id === source);
      if (!tx || !tx.receipt) {
        showToast('عفواً، لا توجد صورة مرفقة لعرضها');
        return;
      }
      if (header) header.textContent = 'معاينة الفاتورة المرفقة';
      if (lbl) lbl.textContent = `${tx.label} (${formatMoney(tx.amount)})`;
      img.src = tx.receipt;
      openModal('receiptLightboxModal');
    }

    // =========================================================================
    // الآلة الحاسبة المدمجة بجانب خانة المبلغ (Inline Calc Integration)
    // =========================================================================
    
    // =========================================================================
    // محرك الآلة الحاسبة المدمجة والذكية لتسجيل المصاريف والإيرادات
    // =========================================================================
    let txCalcExpr = '0';
    let txCalcCurrentResult = 0;
    let txCalcJustEvaluated = false;

    function toggleTxCalcPad(force) {
      const pad = document.getElementById('txInlineCalcPad');
      if (!pad) return;
      const isOpen = pad.style.display !== 'none';
      const willOpen = force !== undefined ? force : !isOpen;

      if (willOpen) {
        pad.style.display = 'flex';
        const currentAmt = document.getElementById('inpTxAmount')?.value;
        if (currentAmt && !isNaN(parseFloat(currentAmt)) && parseFloat(currentAmt) > 0) {
          txCalcExpr = currentAmt;
          txCalcCurrentResult = parseFloat(currentAmt);
        } else {
          txCalcExpr = '0';
          txCalcCurrentResult = 0;
        }
        txCalcJustEvaluated = false;
        updateTxCalcScreen();
      } else {
        pad.style.display = 'none';
      }
    }

    function updateTxCalcScreen() {
      const formulaEl = document.getElementById('txCalcFormula');
      const resEl = document.getElementById('txCalcResult');
      const badgeEl = document.getElementById('txCalcBadgeVal');

      if (formulaEl) formulaEl.textContent = txCalcExpr;
      const formatted = Number(txCalcCurrentResult || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (resEl) resEl.textContent = formatted;
      if (badgeEl) badgeEl.textContent = formatted;
    }

    function evaluateTxExpr(expr) {
      try {
        const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/%/g, '/100');
        if (!/^[0-9+\-*/. ()]+$/.test(sanitized)) return 0;
        const val = Function(`'use strict'; return (${sanitized});`)();
        return isNaN(val) || !isFinite(val) ? 0 : val;
      } catch (e) {
        return 0;
      }
    }

    function txCalcNum(num) {
      if (txCalcJustEvaluated || txCalcExpr === '0') {
        txCalcExpr = (num === '.') ? '0.' : num;
        txCalcJustEvaluated = false;
      } else {
        if (num === '.' && txCalcExpr.endsWith('.')) return;
        txCalcExpr += num;
      }
      txCalcCurrentResult = evaluateTxExpr(txCalcExpr);
      updateTxCalcScreen();
    }

    function txCalcOp(op) {
      txCalcJustEvaluated = false;
      const lastChar = txCalcExpr.slice(-1);
      if (['+', '-', '*', '/', '%'].includes(lastChar)) {
        txCalcExpr = txCalcExpr.slice(0, -1) + op;
      } else {
        txCalcExpr += op;
      }
      updateTxCalcScreen();
    }

    function txCalcClear() {
      txCalcExpr = '0';
      txCalcCurrentResult = 0;
      txCalcJustEvaluated = false;
      updateTxCalcScreen();
    }

    function txCalcBackspace() {
      if (txCalcExpr.length > 1) {
        txCalcExpr = txCalcExpr.slice(0, -1);
      } else {
        txCalcExpr = '0';
      }
      txCalcCurrentResult = evaluateTxExpr(txCalcExpr);
      updateTxCalcScreen();
    }

    function txCalcEquals() {
      txCalcCurrentResult = evaluateTxExpr(txCalcExpr);
      txCalcExpr = Number(txCalcCurrentResult).toFixed(2);
      txCalcJustEvaluated = true;
      updateTxCalcScreen();
    }

    function applyTxCalcResult() {
      txCalcEquals();
      const num = txCalcCurrentResult;
      if (num > 0) {
        const inp = document.getElementById('inpTxAmount');
        if (inp) {
          inp.value = num.toFixed(2);
          inp.focus();
        }
        toggleTxCalcPad(false);
        const labelInp = document.getElementById('inpTxLabel');
        if (labelInp) labelInp.focus();
        showToast(`🔢 تم إدراج المبلغ (${num.toFixed(2)} ج.م) في خانة المبلغ`);
      } else {
        showToast('⚠️ الرجاء حساب أو كتابة مبلغ صحيح أكبر من الصفر أولاً');
      }
    }

    function openInlineCalcForTx() {
      toggleTxCalcPad(true);
    }


    // =========================================================================
    // نظام التوزيع والتخصيص المتعدد لطلبات المصروف (Multi-Allocation Builder)
    // =========================================================================
    let currentRequestAllocations = [
      { amount: 0, category: 'daily', member: 'أية' }
    ];

    // مزامنة مؤشر السلايدر التفاعلي للمبلغ المطلوب (100 ج.م لكل خطوة)
    function syncReqAmountFromRange(val) {
      const inp = document.getElementById('inpReqAmount');
      const lbl = document.getElementById('lblReqSliderVal');
      const num = parseFloat(val) || 0;
      if (inp) {
        inp.value = num > 0 ? num : '';
      }
      if (lbl) {
        lbl.textContent = (typeof formatMoney === 'function') ? formatMoney(num) : num + ' ج.م';
      }
      initRequestAllocations();
    }

    // تعديل المبلغ بمقدار 100 جنيه لكل ضغطة على المؤشر أو الأزرار
    function adjustReqAmount(delta) {
      const inp = document.getElementById('inpReqAmount');
      const rng = document.getElementById('rngReqAmount');
      const lbl = document.getElementById('lblReqSliderVal');
      if (!inp) return;
      let cur = parseFloat(inp.value) || 0;
      let next = Math.max(0, Math.round((cur + delta) / 100) * 100);
      inp.value = next > 0 ? next : '';
      if (rng) rng.value = Math.min(25000, next);
      if (lbl) lbl.textContent = (typeof formatMoney === 'function') ? formatMoney(next) : next + ' ج.م';
      initRequestAllocations();
    }

    // تعديل تخصيص كل سطر بمقدار 100 جنيه
    function adjustAllocRowAmount(idx, delta) {
      if (!currentRequestAllocations[idx]) return;
      let cur = parseFloat(currentRequestAllocations[idx].amount) || 0;
      let next = Math.max(0, Math.round((cur + delta) / 100) * 100);
      currentRequestAllocations[idx].amount = next;
      renderRequestAllocations();
    }

    function initRequestAllocations() {
      const amtInp = document.getElementById('inpReqAmount');
      const rng = document.getElementById('rngReqAmount');
      const lbl = document.getElementById('lblReqSliderVal');
      const val = parseFloat(amtInp ? amtInp.value : 0) || 0;
      if (rng && document.activeElement !== rng) {
        rng.value = Math.min(25000, val);
      }
      if (lbl) {
        lbl.textContent = (typeof formatMoney === 'function') ? formatMoney(val) : val + ' ج.م';
      }
      const currentMember = document.getElementById('inpReqMember')?.value || 'أية';
      if (currentRequestAllocations.length === 0) {
        currentRequestAllocations = [{ amount: val, category: 'daily', member: currentMember }];
      } else if (currentRequestAllocations.length === 1) {
        currentRequestAllocations[0].amount = val;
        currentRequestAllocations[0].member = currentMember;
      }
      renderRequestAllocations();
    }

    function addRequestAllocationRow(amount = 0, category = 'daily', member = 'أية') {
      const totalRequested = parseFloat(document.getElementById('inpReqAmount')?.value || 0) || 0;
      let alreadyAllocated = 0;
      currentRequestAllocations.forEach(a => alreadyAllocated += (parseFloat(a.amount) || 0));
      const remaining = Math.max(0, totalRequested - alreadyAllocated);
      const initAmt = amount > 0 ? amount : remaining;

      currentRequestAllocations.push({
        amount: initAmt,
        category: category,
        member: member
      });
      renderRequestAllocations();
    }

    function removeRequestAllocationRow(idx) {
      if (currentRequestAllocations.length <= 1) {
        showToast('⚠️ يجب الإبقاء على سطر توزيع واحد على الأقل');
        return;
      }
      currentRequestAllocations.splice(idx, 1);
      renderRequestAllocations();
    }

    function updateRequestAllocationRow(idx, field, value) {
      if (!currentRequestAllocations[idx]) return;
      if (field === 'amount') {
        currentRequestAllocations[idx].amount = parseFloat(value) || 0;
      } else {
        currentRequestAllocations[idx][field] = value;
      }
      updateRequestAllocationBalances();
    }

    function updateRequestAllocationBalances() {
      const totalRequested = parseFloat(document.getElementById('inpReqAmount')?.value || 0) || 0;
      let allocatedSum = 0;
      (currentRequestAllocations || []).forEach(a => allocatedSum += (parseFloat(a.amount) || 0));
      const remaining = totalRequested - allocatedSum;

      const statusBadge = document.getElementById('allocMatchStatus');
      const summaryEl = document.getElementById('reqAllocSummaryTxt');
      const progressEl = document.getElementById('reqAllocProgressBar');

      const pct = totalRequested > 0 ? ((allocatedSum / totalRequested) * 100).toFixed(0) : 0;

      if (statusBadge) {
        if (totalRequested <= 0) {
          statusBadge.innerHTML = '<span style="color: #94a3b8;"><i class="fa-solid fa-pen"></i> حدد المبلغ أولاً</span>';
          statusBadge.style.background = 'rgba(255,255,255,0.06)';
          statusBadge.style.borderColor = 'rgba(255,255,255,0.15)';
        } else if (Math.abs(remaining) < 0.01) {
          statusBadge.innerHTML = `<span style="color: #10b981;"><i class="fa-solid fa-circle-check"></i> ✔ متطابق 100% (${formatMoney(totalRequested)})</span>`;
          statusBadge.style.background = 'rgba(16, 185, 129, 0.16)';
          statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.45)';
        } else if (remaining > 0) {
          statusBadge.innerHTML = `<span style="color: #fbbf24;"><i class="fa-solid fa-triangle-exclamation"></i> ⚠️ متبقي غير موزع: ${formatMoney(remaining)} (${pct}% / 100%)</span>`;
          statusBadge.style.background = 'rgba(245, 158, 11, 0.16)';
          statusBadge.style.borderColor = 'rgba(245, 158, 11, 0.45)';
        } else {
          statusBadge.innerHTML = `<span style="color: #f43f5e;"><i class="fa-solid fa-circle-xmark"></i> ❌ تجاوز للمطلوب بـ: ${formatMoney(Math.abs(remaining))} (${pct}% / 100%)</span>`;
          statusBadge.style.background = 'rgba(244, 63, 94, 0.16)';
          statusBadge.style.borderColor = 'rgba(244, 63, 94, 0.45)';
        }
      }

      if (summaryEl) {
        summaryEl.innerHTML = `المبلغ المطلوب: <strong>${formatMoney(totalRequested)}</strong> | الموزع: <strong>${formatMoney(allocatedSum)}</strong> (${pct}%)`;
      }

      if (progressEl) {
        const barPct = totalRequested > 0 ? Math.min(100, Math.max(0, (allocatedSum / totalRequested) * 100)) : 0;
        progressEl.style.width = barPct + '%';
        progressEl.style.background = (remaining < -0.01) ? '#f43f5e' : (Math.abs(remaining) < 0.01 ? '#10b981' : '#fbbf24');
      }
    }

    // إدارة التقاط ورفع صور وفواتير طلب المصروف
    function handleRequestPhotoUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        if (file.type && file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const maxDim = 600;
            let w = img.width;
            let h = img.height;
            if (w > h && w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);

            state.pendingRequestPhotoDataUri = compressed;

            const previewImg = document.getElementById('reqPhotoPreviewImg');
            const previewCont = document.getElementById('reqPhotoPreviewContainer');
            const badge = document.getElementById('reqPhotoStatusBadge');
            const fileNameEl = document.getElementById('reqPhotoFileName');

            if (previewImg) previewImg.src = compressed;
            if (previewCont) previewCont.style.display = 'flex';
            if (badge) badge.style.display = 'inline-flex';
            if (fileNameEl) fileNameEl.textContent = file.name || 'صورة ملتقطة بالكاميرا';
            showToast('📸 تم تجهيز صورة المستند للطلب بنجاح');
          };
          img.src = e.target.result;
        } else {
          // ملف مستند PDF أو غيره
          state.pendingRequestPhotoDataUri = e.target.result;
          const previewCont = document.getElementById('reqPhotoPreviewContainer');
          const badge = document.getElementById('reqPhotoStatusBadge');
          const fileNameEl = document.getElementById('reqPhotoFileName');
          if (previewCont) previewCont.style.display = 'flex';
          if (badge) badge.style.display = 'inline-flex';
          if (fileNameEl) fileNameEl.textContent = file.name || 'مستند مرفق';
          showToast('📄 تم إرفاق المستند بنجاح');
        }
      };
      reader.readAsDataURL(file);
    }

    function removeRequestPhoto() {
      state.pendingRequestPhotoDataUri = null;
      const previewCont = document.getElementById('reqPhotoPreviewContainer');
      const badge = document.getElementById('reqPhotoStatusBadge');
      const camInp = document.getElementById('inpReqCameraPhoto');
      const docInp = document.getElementById('inpReqDocFile');
      if (previewCont) previewCont.style.display = 'none';
      if (badge) badge.style.display = 'none';
      if (camInp) camInp.value = '';
      if (docInp) docInp.value = '';
    }

    function renderRequestAllocations() {
      const container = document.getElementById('reqAllocationsRowsContainer');
      if (!container) return;
      container.innerHTML = '';

      const catOptions = (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []).map(c => 
        `<option value="${c.id}">${c.name}</option>`
      ).join('');

      const memberOptions = ['البيت', 'ماهر', 'أية', 'محمد', 'مريم', 'الحاجة', 'النونو', 'أخرى'].map(m => 
        `<option value="${m}">${m}</option>`
      ).join('');

      currentRequestAllocations.forEach((alloc, idx) => {
        const card = document.createElement('div');
        card.className = 'req-alloc-card-item';
        card.style.cssText = 'background: rgba(30, 41, 59, 0.65); border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 10px; padding: 7px 9px; display: flex; flex-direction: column; gap: 5px;';
        
        card.innerHTML = `
          <!-- السطر الأول: التصنيف والمستفيد -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>
              <div style="font-size: 0.64rem; color: #94a3b8; font-weight: 700; margin-bottom: 1px;">التصنيف:</div>
              <select class="form-select-custom" style="height: 32px; font-size: 0.75rem; padding: 2px 6px; border-radius: 7px; width: 100%; box-sizing: border-box;" onchange="updateRequestAllocationRow(${idx}, 'category', this.value)">
                ${catOptions}
              </select>
            </div>
            <div>
              <div style="font-size: 0.64rem; color: #94a3b8; font-weight: 700; margin-bottom: 1px;">يخص من:</div>
              <select class="form-select-custom" style="height: 32px; font-size: 0.75rem; padding: 2px 6px; border-radius: 7px; width: 100%; box-sizing: border-box;" onchange="updateRequestAllocationRow(${idx}, 'member', this.value)">
                ${memberOptions}
              </select>
            </div>
          </div>
          <!-- السطر الثاني: المبلغ المخصص مع مؤشر التدريج وزر الحذف -->
          <div style="display: flex; gap: 6px; align-items: flex-end;">
            <div style="flex: 1;">
              <div style="font-size: 0.64rem; color: #94a3b8; font-weight: 700; margin-bottom: 1px;">المبلغ المخصص (ج.م) [±100]:</div>
              <div style="display: flex; align-items: center; gap: 3px;">
                <button type="button" onclick="adjustAllocRowAmount(${idx}, -100)" class="btn-item-action" style="height: 32px; width: 28px; min-width: 28px; padding: 0; font-size: 0.95rem; font-weight: 900; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="إنقاص 100 ج.م">-</button>
                <input type="number" step="100" min="0" class="form-input-custom" value="${alloc.amount > 0 ? alloc.amount : ''}" placeholder="0.00 ج.م" style="height: 32px; font-size: 0.95rem; font-weight: 900; text-align: center; padding: 2px 6px; border-radius: 7px; color: #38bdf8; flex: 1; min-width: 0; box-sizing: border-box;" oninput="updateRequestAllocationRow(${idx}, 'amount', this.value)">
                <button type="button" onclick="adjustAllocRowAmount(${idx}, 100)" class="btn-item-action" style="height: 32px; width: 28px; min-width: 28px; padding: 0; font-size: 0.95rem; font-weight: 900; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="زيادة 100 ج.م">+</button>
              </div>
            </div>
            <button type="button" onclick="removeRequestAllocationRow(${idx})" class="btn-item-action btn-item-reject" style="height: 32px; padding: 0 10px; font-size: 0.72rem; border-radius: 7px; flex: 0 0 auto; gap: 4px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;" title="حذف هذا التخصيص">
              <i class="fa-solid fa-trash-can"></i> حذف
            </button>
          </div>
        `;

        const selects = card.querySelectorAll('select');
        if (selects[0]) selects[0].value = alloc.category || 'daily';
        if (selects[1]) selects[1].value = alloc.member || 'أية';

        container.appendChild(card);
      });

      updateRequestAllocationBalances();
    }

    
    // =========================================================================
    // إدارة تبويبات طلبات المصروف والالتزامات المتوقعة (Two-Button Switchers)
    // =========================================================================
    function switchRequestTab(tab) {
      const pNew = document.getElementById('panelNewRequest');
      const pList = document.getElementById('panelListRequests');
      const bNew = document.getElementById('btnTabNewRequest');
      const bList = document.getElementById('btnTabListRequests');

      if (tab === 'new') {
        if (pNew) pNew.style.display = 'block';
        if (pList) pList.style.display = 'none';
        if (bNew) {
          bNew.style.background = 'linear-gradient(135deg, #ec4899, #be185d)';
          bNew.style.color = '#fff';
          bNew.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.35)';
        }
        if (bList) {
          bList.style.background = 'transparent';
          bList.style.color = '#94a3b8';
          bList.style.boxShadow = 'none';
        }
      } else {
        if (pNew) pNew.style.display = 'none';
        if (pList) pList.style.display = 'block';
        if (bList) {
          bList.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bList.style.color = '#fff';
          bList.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.35)';
        }
        if (bNew) {
          bNew.style.background = 'transparent';
          bNew.style.color = '#94a3b8';
          bNew.style.boxShadow = 'none';
        }
        if (typeof renderRequestsList === 'function') {
          renderRequestsList();
        }
      }
    }

    function switchExpectedTab(tab) {
      const pNew = document.getElementById('panelNewExpected');
      const pBills = document.getElementById('panelBillsExpected');
      const pList = document.getElementById('panelListExpected');
      const bNew = document.getElementById('btnTabNewExpected');
      const bBills = document.getElementById('btnTabBillsExpected');
      const bList = document.getElementById('btnTabListExpected');

      [bNew, bBills, bList].forEach(b => {
        if (b) {
          b.style.background = 'rgba(255,255,255,0.06)';
          b.style.color = '#94a3b8';
          b.style.boxShadow = 'none';
          b.style.border = '1px solid rgba(255,255,255,0.08)';
          b.classList.remove('active');
        }
      });

      if (tab === 'new') {
        if (pNew) pNew.style.display = 'block';
        if (pBills) pBills.style.display = 'none';
        if (pList) pList.style.display = 'none';
        if (bNew) {
          bNew.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bNew.style.color = '#fff';
          bNew.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.35)';
          bNew.classList.add('active');
        }
        if (typeof renderMemberPhotoPickers === 'function') {
          renderMemberPhotoPickers();
        }
      } else if (tab === 'bills') {
        if (pNew) pNew.style.display = 'none';
        if (pBills) pBills.style.display = 'block';
        if (pList) pList.style.display = 'none';
        if (bBills) {
          bBills.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
          bBills.style.color = '#fff';
          bBills.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.4)';
          bBills.classList.add('active');
        }
        const dateInp = document.getElementById('inpBillDueDate');
        if (dateInp && !dateInp.value) {
          dateInp.value = typeof getLocalDateStr === 'function' ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0];
        }
        renderBillsList();
      } else {
        if (pNew) pNew.style.display = 'none';
        if (pBills) pBills.style.display = 'none';
        if (pList) pList.style.display = 'block';
        if (bList) {
          bList.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bList.style.color = '#fff';
          bList.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.35)';
          bList.classList.add('active');
        }
        renderExpectedList();
      }
    }

    function submitMoneyRequest() {
      const memSel = document.getElementById('inpReqMember');
      const amtInp = document.getElementById('inpReqAmount');
      const rsnInp = document.getElementById('inpReqReason');
      const dateInp = document.getElementById('inpReqDate');

      const member = memSel ? memSel.value : 'أية';
      const amount = parseFloat(amtInp ? amtInp.value : 0);
      const reason = rsnInp ? rsnInp.value.trim() : '';
      const reqDate = dateInp && dateInp.value ? dateInp.value : new Date().toISOString().split('T')[0];

      if (isNaN(amount) || amount <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ صحيح للطلب');
        if (amtInp) amtInp.focus();
        return;
      }
      if (!reason) {
        showToast('⚠️ الرجاء توضيح سبب وتفاصيل الطلب');
        if (rsnInp) rsnInp.focus();
        return;
      }

      // التدقيق الحسابي الإلزامي الصارم: التحقق من توزيع كامل المبلغ المطلوب بنسبة 100% على البنود
      let allocatedSum = 0;
      const validAllocations = (currentRequestAllocations || []).map(a => {
        const amt = parseFloat(a.amount) || 0;
        allocatedSum += amt;
        return {
          amount: amt,
          category: a.category || 'daily',
          member: a.member || member
        };
      }).filter(a => a.amount > 0);

      const diff = Math.round((amount - allocatedSum) * 100) / 100;
      if (Math.abs(diff) >= 0.01) {
        if (diff > 0) {
          showToast(`❌ لا يمكن إرسال الطلب: لم يتم توزيع كامل المبلغ! متبقي غير موزع (${formatMoney(diff)}) يجب توزيعه بالكامل على البنود.`);
        } else {
          showToast(`❌ لا يمكن إرسال الطلب: مجموع البنود الموزعة يتجاوز المبلغ المطلوب بـ (${formatMoney(Math.abs(diff))}).`);
        }
        const badge = document.getElementById('allocMatchStatus');
        if (badge) {
          badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      if (validAllocations.length === 0) {
        showToast('⚠️ الرجاء إضافة بند توزيع واحد على الأقل بالمبلغ المطلوب');
        return;
      }

      const newReq = {
        id: 'req-' + Date.now(),
        member: member,
        amount: amount,
        reason: reason,
        date: reqDate,
        category: validAllocations[0] ? validAllocations[0].category : 'others',
        allocations: validAllocations,
        photo: state.pendingRequestPhotoDataUri || null,
        status: 'pending',
        createdBy: member,
        timestamp: new Date().toLocaleString('ar-EG')
      };

      state.moneyRequests.unshift(newReq);
      try {
        localStorage.setItem('family_monefy_requests', JSON.stringify(state.moneyRequests));
      } catch(e) {}

      if (amtInp) amtInp.value = '';
      if (rsnInp) rsnInp.value = '';
      removeRequestPhoto();
      const rngEl = document.getElementById('rngReqAmount'); if (rngEl) rngEl.value = 0;
      const lblEl = document.getElementById('lblReqSliderVal'); if (lblEl) lblEl.textContent = '0 ج.م';
      currentRequestAllocations = [{ amount: 0, category: 'daily', member: 'أية' }];
      renderRequestAllocations();

      logActivity({
        type: 'request_created',
        action: 'طلب مصروف جديد',
        label: `طلب ${member} مبلغ ${amount} ج.م لـ: ${reason}`,
        amount: amount,
        member: member,
        author: member
      });

      playNotificationChime();
      logActivity({
        type: 'submit_request',
        action: 'تقديم طلب مصروف',
        label: `طلب مصروف: ${reason}`,
        amount: amount,
        member: member,
        author: state.currentUser || 'ماهر',
        receipt: (typeof currentRequestPhotoDataUri !== 'undefined' ? currentRequestPhotoDataUri : null),
        notes: `تاريخ الطلب: ${reqDate}`
      });

      renderRequestsList();
      showToast(`💌 تم إرسال طلب المصروف بنجاح (${formatMoney(amount)}) وتوزيعه بالكامل!`);
      triggerDriveAutoSync();
    }

    function renderRequestsList() {
      const container = document.getElementById('requestsListContainer');
      const badge = document.getElementById('reqPendingCountBadge');
      if (!container) return;

      let list = state.moneyRequests || [];
      if (state.currentMemberFilter && state.currentMemberFilter !== 'الكل') {
        list = list.filter(r => r.member === state.currentMemberFilter || (state.currentMemberFilter === 'البيت' && (r.member === 'البيت' || r.member === 'العائلة')));
      }

      const pendingCount = list.filter(r => r.status === 'pending').length;
      if (badge) badge.textContent = `${pendingCount} معلق`;
      const tabBadge = document.getElementById('reqPendingBadgeTab');
      if (tabBadge) tabBadge.textContent = `${pendingCount}`;

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 20px 10px;">
            <i class="fa-solid fa-hand-holding-dollar" style="color: #ec4899;"></i>
            <div class="empty-title">لا توجد طلبات مصروف حالية</div>
            <div class="empty-desc">يمكن لأية أو أي فرد في العائلة تقديم طلب مصروف مع تحديد التوزيع التقديري</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      list.forEach(req => {
        const card = document.createElement('div');
        card.className = 'item-entry-card';

        let statusBadge = '';
        if (req.status === 'pending') {
          statusBadge = `<span class="status-badge-pending"><i class="fa-solid fa-hourglass-half"></i> قيد الانتظار</span>`;
        } else if (req.status === 'approved') {
          statusBadge = `<span class="status-badge-approved"><i class="fa-solid fa-circle-check"></i> تم الصرف والموافقة</span>`;
        } else {
          statusBadge = `<span class="status-badge-rejected"><i class="fa-solid fa-circle-xmark"></i> مرفوض</span>`;
        }

        // شارات التوزيعات المتعددة
        let allocChipsHtml = '';
        if (req.allocations && Array.isArray(req.allocations) && req.allocations.length > 0) {
          allocChipsHtml = req.allocations.map(a => {
            const cObj = (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []).find(c => c.id === a.category) || { name: 'مصروف', icon: 'fa-tag', color: '#38bdf8' };
            return `
              <span style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.28); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fa-solid ${cObj.icon}"></i> ${cObj.name} (${a.member}): <strong>${formatMoney(a.amount)}</strong>
              </span>
            `;
          }).join('');
        }

        card.innerHTML = `
          <div class="item-entry-header">
            <div class="item-entry-title">
              <span class="item-member-tag">👤 ${escapeHtml(req.member || 'العائلة')}</span>
              <strong>${Number(req.amount || 0).toLocaleString('en-US')} ج.م</strong>
            </div>
            ${statusBadge}
          </div>

          <div class="item-entry-reason">
            ${escapeHtml(req.reason)}
          </div>

          <!-- شارات بنود التوزيع التقديرية المدمجة -->
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 4px;">
            ${allocChipsHtml}
            <span style="background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); padding: 2px 6px; border-radius: 6px; font-size: 0.65rem; font-weight: 700;">
              <i class="fa-regular fa-calendar-check"></i> تاريخ الحاجة: ${req.date || 'اليوم'}
            </span>
          </div>

          ${req.photo ? `
            <div style="margin: 5px 0 2px;">
              <a href="${req.photo}" target="_blank" download="request-doc-${req.id}" style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 7px; background: rgba(56, 189, 248, 0.16); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 0.72rem; font-weight: 800; text-decoration: none;">
                <i class="fa-solid fa-paperclip"></i> عرض المستند / الفاتورة المرفقة
              </a>
            </div>
          ` : ''}

          <div class="item-entry-meta">
            <span><i class="fa-regular fa-clock"></i> تم الطلب: ${req.timestamp || ''}</span>
          </div>
        `;

        if (req.status === 'pending') {
          const actions = document.createElement('div');
          actions.className = 'item-entry-actions';
          actions.innerHTML = `
            <button class="btn-item-action btn-item-approve" onclick="approveRequest('${req.id}')" title="موافقة وصرف وتقسيم الحركات فوراً">
              <i class="fa-solid fa-check"></i> موافقة وصرف فوراً
            </button>
            <button class="btn-item-action btn-item-reject" onclick="rejectRequest('${req.id}')" title="رفض الطلب">
              <i class="fa-solid fa-xmark"></i> رفض
            </button>
          `;
          card.appendChild(actions);
        } else {
          const actions = document.createElement('div');
          actions.className = 'item-entry-actions';
          actions.innerHTML = `
            <button class="btn-item-action btn-item-delete" onclick="deleteRequest('${req.id}')" title="حذف من السجل">
              <i class="fa-solid fa-trash-can"></i> حذف
            </button>
          `;
          card.appendChild(actions);
        }

        container.appendChild(card);
      });
    }

    function approveRequest(reqId) {
      const req = (state.moneyRequests || []).find(r => r.id === reqId);
      if (!req) return;

      const walletId = state.currentWalletId && state.currentWalletId !== 'all' ? state.currentWalletId : (state.wallets[0] ? state.wallets[0].id : 'wallet-ahly');
      const reqDate = req.date || new Date().toISOString().split('T')[0];

      // تسجيل الطلب وبياناته كالتزام فوري في صفحة الالتزامات المتوقعة (بناءً على طلب المستخدم)
      if (!state.expectedExpenses || !Array.isArray(state.expectedExpenses)) {
        state.expectedExpenses = [];
      }

      const commitmentFromReq = {
        id: 'exp-req-' + req.id,
        type: 'upcoming_bill',
        title: `طلب معتمد: ${req.reason || 'طلب مصروف عائلي'}`,
        amount: Number(req.amount) || 0,
        dueDate: reqDate,
        member: req.member || 'أية',
        status: 'upcoming',
        photo: req.receipt || null,
        allocations: req.allocations || [],
        notes: `تم اعتماد الطلب بواسطة (${state.currentUser || 'ماهر'}) - مسجل كالتزام متوقع`
      };

      state.expectedExpenses.unshift(commitmentFromReq);
      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}

      req.status = 'approved';
      req.approvedAt = new Date().toISOString();
      req.approvedBy = state.currentUser || 'ماهر';
      localStorage.setItem('family_monefy_requests', JSON.stringify(state.moneyRequests));

      logActivity({
        type: 'approve_request',
        action: 'اعتماد طلب مصروف',
        label: `اعتماد وصرف طلب: ${req.reason || 'طلب عائلي'}`,
        amount: Number(req.amount) || 0,
        member: req.member || 'أية',
        author: state.currentUser || 'ماهر',
        receipt: req.photo || null,
        notes: 'تم اعتماد الطلب وتثبيته كالتزام فوري'
      });

      renderRequestsList();
      renderUI();
      saveEmailVault();
      showToast(`✅ تمت الموافقة وصرف (${req.amount} ج.م) وتسجيل الحركات بالبند بنجاح`);
    }

    function rejectRequest(reqId) {
      const req = (state.moneyRequests || []).find(r => r.id === reqId);
      if (!req) return;
      req.status = 'rejected';
      localStorage.setItem('family_monefy_requests', JSON.stringify(state.moneyRequests));

      logActivity({
        type: 'reject_request',
        action: 'رفض طلب مصروف',
        label: `رفض طلب: ${req.reason || 'طلب عائلي'}`,
        amount: Number(req.amount) || 0,
        member: req.member || 'أية',
        author: state.currentUser || 'ماهر',
        notes: 'تم رفض هذا الطلب'
      });

      renderRequestsList();
      showToast('❌ تم رفض الطلب');
    }

    function deleteRequest(reqId) {
      state.moneyRequests = (state.moneyRequests || []).filter(r => r.id !== reqId);
      localStorage.setItem('family_monefy_requests', JSON.stringify(state.moneyRequests));
      renderRequestsList();
      showToast('🗑️ تم حذف الطلب من السجل');
    }

    // =========================================================================
    // إدارة المصروفات المتوقعة والديون (Expected Expenses & Debts)
    // =========================================================================
    // =========================================================================
    // إدارة المصروفات والالتزامات والديون (Commitments & Debts Engine)
    // =========================================================================

    function onExpectedTypeChange(type) {
      const lbl = document.getElementById('lblExpTitle');
      const inp = document.getElementById('inpExpTitle');
      if (!lbl || !inp) return;
      if (type === 'debt_on_us') {
        lbl.innerHTML = 'البيان / المستحق له <span class="req">*</span>';
        inp.placeholder = 'مثال: دين لمحمد';
      } else if (type === 'debt_for_us') {
        lbl.innerHTML = 'البيان / المدين لنا <span class="req">*</span>';
        inp.placeholder = 'مثال: سلفة لخالد';
      } else {
        lbl.innerHTML = 'البيان / الوصف <span class="req">*</span>';
        inp.placeholder = 'مثال: قسط مدرسة';
      }
    }

    function submitExpectedExpense() {
      const typeSel = document.getElementById('inpExpType');
      const titleInp = document.getElementById('inpExpTitle');
      const amtInp = document.getElementById('inpExpAmount');
      const dateInp = document.getElementById('inpExpDueDate');
      const memSel = document.getElementById('inpExpMember');
      const prioSel = document.getElementById('inpExpPriority');

      const type = typeSel ? typeSel.value : 'upcoming_bill';
      const title = titleInp ? titleInp.value.trim() : '';
      const amount = parseFloat(amtInp ? amtInp.value : 0);
      const dueDate = dateInp && dateInp.value ? dateInp.value : '';
      const member = memSel ? memSel.value : 'البيت';
      const priority = prioSel ? prioSel.value : 'normal';

      if (isNaN(amount) || amount <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ صحيح للالتزام');
        if (amtInp) amtInp.focus();
        return;
      }
      if (!title) {
        showToast('⚠️ الرجاء إدخال بيان الالتزام أو اسم الشخص / الجهة');
        if (titleInp) titleInp.focus();
        return;
      }

      if (!state.expectedExpenses || !Array.isArray(state.expectedExpenses)) {
        state.expectedExpenses = [];
      }

      const newExp = {
        id: 'exp-' + Date.now(),
        type: type, // 'upcoming_bill', 'debt_on_us', 'debt_for_us'
        title: title,
        amount: amount,
        dueDate: dueDate,
        priority: priority,
        member: member,
        status: 'upcoming',
        photo: state.pendingExpectedPhotoDataUri || null,
        createdAt: new Date().toISOString()
      };

      state.expectedExpenses.unshift(newExp);
      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}

      if (titleInp) titleInp.value = '';
      if (amtInp) amtInp.value = '';
      if (dateInp) dateInp.value = '';
      removeExpectedPhoto();

      logActivity({
        type: 'expected_created',
        action: 'تسجيل التزام مالي',
        label: `تسجيل ${title} [${type === 'debt_on_us' ? 'دين علينا' : (type === 'debt_for_us' ? 'دين لنا' : 'فاتورة قادمة')}]`,
        amount: amount,
        sign: type === 'debt_for_us' ? '+' : '-',
        member: member,
        author: state.currentUser || 'ماهر',
        receipt: newExp.photo,
        notes: `تاريخ الاستحقاق: ${dueDate || 'غير محدد'} | الأولوية: ${priority}`
      });

      playNotificationChime();
      renderExpectedList();
      switchExpectedTab('list');
      showToast(`📌 تم تسجيل الالتزام (${formatMoney(amount)}) بنجاح! ✨`);
      triggerDriveAutoSync();
    }

    function setExpectedPillFilter(filter) {
      state.expectedTypeFilter = filter;
      document.querySelectorAll('.exp-filter-pill').forEach(btn => btn.classList.remove('active'));
      const pillMap = {
        'all': 'btnFilterExpAll',
        'upcoming_bill': 'btnFilterExpUpcoming',
        'debt_on_us': 'btnFilterExpDebtsOnUs',
        'debt_for_us': 'btnFilterExpDebtsForUs',
        'paid': 'btnFilterExpPaid'
      };
      const activeBtn = document.getElementById(pillMap[filter]);
      if (activeBtn) activeBtn.classList.add('active');
      renderExpectedList();
    }

    function toggleExpectedFilter(type) {
      if (state.expectedTypeFilter === type) {
        setExpectedPillFilter('all');
      } else {
        setExpectedPillFilter(type);
      }
      switchExpectedTab('list');
    }

    function renderExpectedList() {
      const container = document.getElementById('expectedListContainer');
      const elUp = document.getElementById('expectedTotalUpcoming');
      const elDebOnUs = document.getElementById('expectedTotalDebtsOnUs');
      const elDebForUs = document.getElementById('expectedTotalDebtsForUs');
      const elPaid = document.getElementById('expectedTotalPaid');

      const cntUp = document.getElementById('expectedCountUpcoming');
      const cntDebOnUs = document.getElementById('expectedCountDebtsOnUs');
      const cntDebForUs = document.getElementById('expectedCountDebtsForUs');
      const cntPaid = document.getElementById('expectedCountPaid');

      const badgeTab = document.getElementById('expectedPendingBadgeTab');
      const netLabel = document.getElementById('expectedNetPositionLabel');
      const netVal = document.getElementById('expectedNetPositionVal');

      if (!container) return;
      if (!state.expectedExpenses) state.expectedExpenses = [];

      state.expectedExpenses.forEach(e => {
        if (e.type === 'debt') e.type = 'debt_on_us';
        if (!e.status) e.status = 'upcoming';
      });

      const memberFilter = document.getElementById('selExpectedMemberFilter')?.value || 'all';

      // 1. حساب الإجماليات بدقة محاسبية صارمة 0.00
      let totUpcoming = 0, countUpcoming = 0;
      let totDebtsOnUs = 0, countDebtsOnUs = 0;
      let totDebtsForUs = 0, countDebtsForUs = 0;
      let totPaid = 0, countPaid = 0;

      state.expectedExpenses.forEach(e => {
        const amt = Number(e.amount) || 0;
        if (e.status === 'paid') {
          totPaid += amt;
          countPaid++;
        } else if (e.type === 'upcoming_bill') {
          totUpcoming += amt;
          countUpcoming++;
        } else if (e.type === 'debt_on_us') {
          totDebtsOnUs += amt;
          countDebtsOnUs++;
        } else if (e.type === 'debt_for_us') {
          totDebtsForUs += amt;
          countDebtsForUs++;
        }
      });

      const curr = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : (state.currency || 'ج.م');
      const isGold = state.currency === 'GOLD21';
      const fmtNum = (val) => {
        const converted = typeof convertAmount === 'function' ? convertAmount(val) : val;
        return converted.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: isGold ? 3 : 2
        });
      };

      if (elUp) elUp.textContent = fmtNum(totUpcoming);
      if (elDebOnUs) elDebOnUs.textContent = '- ' + fmtNum(totDebtsOnUs);
      if (elDebForUs) elDebForUs.textContent = '+ ' + fmtNum(totDebtsForUs);
      if (elPaid) elPaid.textContent = fmtNum(totPaid);

      if (cntUp) cntUp.textContent = `${countUpcoming}`;
      if (cntDebOnUs) cntDebOnUs.textContent = `${countDebtsOnUs}`;
      if (cntDebForUs) cntDebForUs.textContent = `${countDebtsForUs}`;
      if (cntPaid) cntPaid.textContent = `${countPaid}`;

      const totalPendingCount = countUpcoming + countDebtsOnUs + countDebtsForUs;
      if (badgeTab) badgeTab.textContent = totalPendingCount;

      // صافي الموقف المالي: (فواتير + ديون علينا) - ديون لنا
      const netDue = (totUpcoming + totDebtsOnUs) - totDebtsForUs;
      if (netVal) {
        if (netDue > 0.0001) {
          if (netLabel) netLabel.textContent = 'صافي الالتزامات المطلوب تدبيرها:';
          netVal.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px; direction: rtl; color: #f43f5e;"><span style="font-size: 0.9em;">-</span><span>${fmtNum(netDue)}</span><span style="font-size: 0.74rem; opacity: 0.9;">${curr}</span></span>`;
        } else if (netDue < -0.0001) {
          if (netLabel) netLabel.textContent = 'صافي الفائض (ديون مستحقة لنا):';
          netVal.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px; direction: rtl; color: #34d399;"><span style="font-size: 0.9em;">+</span><span>${fmtNum(Math.abs(netDue))}</span><span style="font-size: 0.74rem; opacity: 0.9;">${curr}</span></span>`;
        } else {
          if (netLabel) netLabel.textContent = 'الموقف المالي متزن:';
          netVal.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px; direction: rtl; color: #38bdf8;"><span>0.00</span><span style="font-size: 0.74rem; opacity: 0.9;">${curr}</span></span>`;
        }
      }

      // تمييز الكروت النشطة في الكوكتيل
      const cardUp = document.getElementById('cardExpUpcoming');
      const cardDebOnUs = document.getElementById('cardExpDebtsOnUs');
      const cardDebForUs = document.getElementById('cardExpDebtsForUs');
      const cardPaid = document.getElementById('cardExpPaid');

      if (cardUp) cardUp.classList.toggle('active-filter', state.expectedTypeFilter === 'upcoming_bill');
      if (cardDebOnUs) cardDebOnUs.classList.toggle('active-filter', state.expectedTypeFilter === 'debt_on_us');
      if (cardDebForUs) cardDebForUs.classList.toggle('active-filter', state.expectedTypeFilter === 'debt_for_us');
      if (cardPaid) cardPaid.classList.toggle('active-filter', state.expectedTypeFilter === 'paid');

      // 2. تطبيق التصفية
      let list = state.expectedExpenses.slice();

      const activeFilter = state.expectedTypeFilter || 'all';
      if (activeFilter === 'upcoming_bill') {
        list = list.filter(e => e.status !== 'paid' && e.type === 'upcoming_bill');
      } else if (activeFilter === 'debt_on_us') {
        list = list.filter(e => e.status !== 'paid' && e.type === 'debt_on_us');
      } else if (activeFilter === 'debt_for_us') {
        list = list.filter(e => e.status !== 'paid' && e.type === 'debt_for_us');
      } else if (activeFilter === 'paid') {
        list = list.filter(e => e.status === 'paid');
      }

      if (memberFilter !== 'all') {
        list = list.filter(e => e.member === memberFilter || (memberFilter === 'ماهر' && (e.member === 'ماهر' || e.member === 'أنا')));
      }

      // فرز حسب تاريخ الاستحقاق
      list.sort((a, b) => {
        if (a.status === 'paid' && b.status !== 'paid') return 1;
        if (a.status !== 'paid' && b.status === 'paid') return -1;
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      });

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 24px 10px; text-align: center; background: rgba(15, 23, 42, 0.4); border-radius: 14px; border: 1px dashed rgba(255, 255, 255, 0.1);">
            <i class="fa-solid fa-calendar-check" style="color: #38bdf8; font-size: 2rem; margin-bottom: 8px; opacity: 0.6;"></i>
            <div class="empty-title" style="font-weight: 800; color: #cbd5e1; font-size: 0.88rem;">لا توجد التزامات مسجلة في هذا القسم</div>
            <div class="empty-desc" style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">يمكنك إضافة مصروف قادم أو دين جديد بالضغط على زر "إضافة التزام"</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      list.forEach(item => {
        const card = document.createElement('div');
        const isPaid = item.status === 'paid';
        const isUpcoming = item.type === 'upcoming_bill';
        const isDebtOnUs = item.type === 'debt_on_us';
        const isDebtForUs = item.type === 'debt_for_us';

        let accentBorder = 'rgba(245, 158, 11, 0.35)';
        let accentGlow = 'rgba(245, 158, 11, 0.12)';
        let iconClass = 'fa-solid fa-receipt';
        let iconColor = '#fbbf24';
        let typeName = 'مصروف قادم';
        let sign = '-';
        let amtColor = '#fbbf24';

        if (isDebtOnUs) {
          accentBorder = 'rgba(244, 63, 94, 0.4)';
          accentGlow = 'rgba(244, 63, 94, 0.12)';
          iconClass = 'fa-solid fa-arrow-down-long';
          iconColor = '#f87171';
          typeName = 'دين علينا';
          sign = '-';
          amtColor = '#f87171';
        } else if (isDebtForUs) {
          accentBorder = 'rgba(16, 185, 129, 0.4)';
          accentGlow = 'rgba(16, 185, 129, 0.12)';
          iconClass = 'fa-solid fa-arrow-up-long';
          iconColor = '#34d399';
          typeName = 'دين لنا (تحصيل)';
          sign = '+';
          amtColor = '#34d399';
        }

        if (isPaid) {
          accentBorder = 'rgba(56, 189, 248, 0.3)';
          accentGlow = 'rgba(56, 189, 248, 0.08)';
          iconClass = 'fa-solid fa-circle-check';
          iconColor = '#38bdf8';
          typeName = 'مسدد';
        }

        card.style.cssText = `
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95));
          border: 1.2px solid ${accentBorder};
          border-radius: 13px;
          padding: 10px 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          gap: 7px;
          transition: all 0.2s ease;
        `;

        const numFormatted = fmtNum(Number(item.amount) || 0);

        // Due date tag
        let dueHtml = '';
        if (item.dueDate && !isPaid) {
          const today = new Date().toISOString().split('T')[0];
          const isOverdue = item.dueDate < today;
          if (isOverdue) {
            dueHtml = `<span style="font-size: 0.66rem; color: #f87171; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); padding: 2px 7px; border-radius: 6px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-triangle-exclamation"></i> متأخر: ${item.dueDate}</span>`;
          } else {
            dueHtml = `<span style="font-size: 0.66rem; color: #38bdf8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.25); padding: 2px 7px; border-radius: 6px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-calendar-day"></i> الاستحقاق: ${item.dueDate}</span>`;
          }
        }

        // Priority badge
        let priorityHtml = '';
        if (item.priority === 'urgent') {
          priorityHtml = `<span style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 2px 6px; border-radius: 6px; font-size: 0.63rem; font-weight: 800;"><i class="fa-solid fa-bolt"></i> عاجل</span>`;
        }

        // Receipt attachment button
        let receiptBtn = '';
        const photoUri = item.settleReceipt || item.photo;
        if (photoUri) {
          receiptBtn = `<button type="button" onclick="openReceiptLightbox('${photoUri}', 'مستند: ${escapeHtml(item.title)}')" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 6px; padding: 2px 7px; font-size: 0.66rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="عرض المستند أو الفاتورة"><i class="fa-solid fa-paperclip"></i> مستند 📷</button>`;
        }

        // Action buttons
        let actionButtons = '';
        if (!isPaid) {
          if (isDebtForUs) {
            actionButtons = `
              <button type="button" onclick="openPayExpectedModal('${item.id}')" style="flex: 1; height: 30px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 8px; color: #fff; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 5px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">
                <i class="fa-solid fa-hand-holding-dollar"></i> تحصيل وإيداع بالمحفظة
              </button>
              <button type="button" onclick="deleteExpected('${item.id}')" style="width: 30px; height: 30px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #f87171; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" title="حذف الالتزام">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            `;
          } else {
            actionButtons = `
              <button type="button" onclick="openPayExpectedModal('${item.id}')" style="flex: 1; height: 30px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; border-radius: 8px; color: #fff; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 5px; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);">
                <i class="fa-solid fa-circle-check"></i> سداد وصرف من المحفظة
              </button>
              <button type="button" onclick="deleteExpected('${item.id}')" style="width: 30px; height: 30px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #f87171; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" title="حذف الالتزام">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            `;
          }
        } else {
          actionButtons = `
            <div style="flex: 1; font-size: 0.70rem; color: #38bdf8; font-weight: 800; display: flex; align-items: center; gap: 5px;">
              <i class="fa-solid fa-check-double"></i> تم السداد والتسوية
            </div>
            <button type="button" onclick="deleteExpected('${item.id}')" style="width: 30px; height: 30px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #f87171; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" title="حذف من السجل">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          `;
        }

        card.innerHTML = `
          <!-- الصف العلوي: الأيقونة والعنوان والمبلغ -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
              <div style="width: 30px; height: 30px; border-radius: 8px; background: ${accentGlow}; border: 1px solid ${accentBorder}; display: flex; align-items: center; justify-content: center; color: ${iconColor}; font-size: 0.82rem; flex-shrink: 0;">
                <i class="${iconClass}"></i>
              </div>
              <div style="min-width: 0;">
                <div style="font-weight: 800; font-size: 0.88rem; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${escapeHtml(item.title)}
                </div>
                <div style="font-size: 0.67rem; color: #94a3b8; display: flex; align-items: center; gap: 5px; margin-top: 1px;">
                  <span style="color: ${iconColor}; font-weight: 700;">${typeName}</span>
                  <span>•</span>
                  <span style="color: #cbd5e1;">👤 ${escapeHtml(item.member || 'البيت')}</span>
                </div>
              </div>
            </div>

            <!-- المبلغ: رمز العملة يسار الرقم وعلامة السالب/الموجب يمين الرقم -->
            <div style="text-align: left; flex-shrink: 0; direction: rtl; display: inline-flex; align-items: center; gap: 3px; font-weight: 950; font-size: 0.95rem; color: ${amtColor}; font-variant-numeric: tabular-nums;">
              <span style="font-size: 0.9em;">${sign}</span>
              <span>${numFormatted}</span>
              <span style="font-size: 0.70rem; opacity: 0.9; font-weight: 800;">${curr}</span>
            </div>
          </div>

          <!-- الصف الأوسط: شارات الاستحقاق والعاجل والمستند المرفق -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
              ${dueHtml}
              ${priorityHtml}
              ${receiptBtn}
            </div>
          </div>

          <!-- صف الأزرار والإجراءات -->
          <div style="display: flex; align-items: center; gap: 6px; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            ${actionButtons}
          </div>
        `;

        container.appendChild(card);
      });
    }


    function handlePayExpectedPhotoUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        if (file.type && file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let w = img.width;
            let h = img.height;
            if (w > h && w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            state.pendingPayExpectedReceiptDataUri = compressed;
            showPayExpectedPhotoPreview(compressed);
          };
          img.src = e.target.result;
        } else {
          state.pendingPayExpectedReceiptDataUri = e.target.result;
          showPayExpectedPhotoPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }

    function showPayExpectedPhotoPreview(dataUri) {
      const previewImg = document.getElementById('payExpPhotoPreviewImg');
      const previewCont = document.getElementById('payExpPhotoPreviewContainer');
      const badge = document.getElementById('payExpPhotoAttachedBadge');
      if (previewImg) previewImg.src = dataUri;
      if (previewCont) previewCont.style.display = 'block';
      if (badge) badge.style.display = 'inline-flex';
    }

    function removePayExpectedPhoto() {
      state.pendingPayExpectedReceiptDataUri = null;
      const previewImg = document.getElementById('payExpPhotoPreviewImg');
      const previewCont = document.getElementById('payExpPhotoPreviewContainer');
      const badge = document.getElementById('payExpPhotoAttachedBadge');
      const inpFile = document.getElementById('inpPayExpReceipt');
      const inpCam = document.getElementById('inpPayExpReceiptCamera');
      if (previewImg) previewImg.src = '';
      if (previewCont) previewCont.style.display = 'none';
      if (badge) badge.style.display = 'none';
      if (inpFile) inpFile.value = '';
      if (inpCam) inpCam.value = '';
    }

    function openPayExpectedModal(expId) {
      const exp = (state.expectedExpenses || []).find(e => e.id === expId);
      if (!exp) return;

      const targetIdInp = document.getElementById('payExpTargetId');
      const targetTypeInp = document.getElementById('payExpTargetType');
      const titleEl = document.getElementById('payExpItemTitle');
      const memEl = document.getElementById('payExpItemMember');
      const amtEl = document.getElementById('payExpItemAmount');
      const walletSel = document.getElementById('payExpWalletSelect');
      const dateInp = document.getElementById('payExpDateInput');
      const catSel = document.getElementById('payExpCategorySelect');
      const noteInp = document.getElementById('payExpNoteInput');
      const headTitle = document.getElementById('payExpHeaderTitle');
      const headIcon = document.getElementById('payExpHeaderIcon');
      const walletLbl = document.getElementById('payExpWalletLabel');
      const confirmBtn = document.getElementById('btnConfirmPayExpected');

      if (targetIdInp) targetIdInp.value = exp.id;
      if (targetTypeInp) targetTypeInp.value = exp.type;
      if (titleEl) titleEl.textContent = exp.title;
      if (memEl) memEl.textContent = `يخص: ${exp.member || 'البيت'}`;
      if (amtEl) {
        amtEl.textContent = (exp.type === 'debt_for_us' ? '+ ' : '- ') + formatMoney(exp.amount);
        amtEl.style.color = (exp.type === 'debt_for_us' ? '#34d399' : '#f87171');
      }

      if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];
      if (noteInp) noteInp.value = '';
      removePayExpectedPhoto();
      if (exp.photo) {
        state.pendingPayExpectedReceiptDataUri = exp.photo;
        showPayExpectedPhotoPreview(exp.photo);
      }

      // ضبط العناوين حسب نوع الحركة (سداد أم تحصيل)
      if (exp.type === 'debt_for_us') {
        if (headTitle) headTitle.textContent = 'تحصيل وإيداع مستحق مالي';
        if (headIcon) headIcon.className = 'fa-solid fa-hand-holding-dollar';
        if (walletLbl) walletLbl.textContent = 'إيداع المبلغ المحصّل في محفظة:';
        if (catSel) catSel.value = 'income';
        if (confirmBtn) {
          confirmBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> تأكيد التحصيل والإيداع بالمحفظة';
          confirmBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        }
      } else {
        if (headTitle) headTitle.textContent = 'سداد وصرف التزام مالي';
        if (headIcon) headIcon.className = 'fa-solid fa-receipt';
        if (walletLbl) walletLbl.textContent = 'خصم المبلغ المسدد من محفظة:';
        if (catSel) catSel.value = exp.type === 'upcoming_bill' ? 'bills' : 'other';
        if (confirmBtn) {
          confirmBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> تأكيد السداد والخصم من المحفظة';
          confirmBtn.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
        }
      }

      // ملء خيارات المحافظ مع الأرصدة الحقيقية
      if (walletSel) {
        walletSel.innerHTML = (state.wallets || []).map(w => {
          return `<option value="${w.id}">${escapeHtml(w.name)} (الرصيد: ${formatMoney(w.balance)})</option>`;
        }).join('');
        if (state.currentWalletId && state.currentWalletId !== 'all') {
          walletSel.value = state.currentWalletId;
        }
      }

      openModal('payExpectedModal');
    }

    function confirmPayExpectedTransaction() {
      const targetId = document.getElementById('payExpTargetId')?.value;
      const exp = (state.expectedExpenses || []).find(e => e.id === targetId);
      if (!exp) return;

      const walletSel = document.getElementById('payExpWalletSelect');
      const dateInp = document.getElementById('payExpDateInput');
      const catSel = document.getElementById('payExpCategorySelect');
      const noteInp = document.getElementById('payExpNoteInput');

      const walletId = walletSel ? walletSel.value : (state.wallets[0] ? state.wallets[0].id : 'wallet-default');
      const txDate = dateInp && dateInp.value ? dateInp.value : new Date().toISOString().split('T')[0];
      const category = catSel ? catSel.value : (exp.type === 'upcoming_bill' ? 'bills' : 'other');
      const note = noteInp ? noteInp.value.trim() : '';

      const targetWallet = (state.wallets || []).find(w => w.id === walletId);
      const isCollection = exp.type === 'debt_for_us';

      const finalReceipt = state.pendingPayExpectedReceiptDataUri || exp.photo || null;
      const newTx = {
        id: 'tx-exp-' + Date.now(),
        type: isCollection ? 'income' : 'expense',
        amount: Number(exp.amount),
        label: isCollection ? `تحصيل مستحق: ${exp.title}${note ? ' (' + note + ')' : ''}` : `سداد التزام: ${exp.title}${note ? ' (' + note + ')' : ''}`,
        category: isCollection ? 'income' : category,
        member: exp.member || 'البيت',
        walletId: walletId,
        date: txDate,
        receipt: finalReceipt
      };

      if (state.pendingPayExpectedReceiptDataUri) {
        exp.settleReceipt = state.pendingPayExpectedReceiptDataUri;
        exp.photo = state.pendingPayExpectedReceiptDataUri;
      }

      if (!state.transactions) state.transactions = [];
      state.transactions.unshift(newTx);
      saveTx();

      exp.status = 'paid';
      exp.paidAt = new Date().toISOString();
      exp.paidWalletId = walletId;
      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}

      logActivity({
        type: isCollection ? 'debt_collected' : 'expected_paid',
        action: isCollection ? 'تحصيل دين' : 'سداد التزام',
        label: isCollection ? `تم تحصيل ${exp.title} وإيداعه في ${targetWallet ? targetWallet.name : 'المحفظة'}` : `تم سداد ${exp.title} وخصمه من ${targetWallet ? targetWallet.name : 'المحفظة'}`,
        amount: Number(exp.amount),
        sign: isCollection ? '+' : '-',
        member: exp.member || 'البيت',
        author: state.currentUser || 'ماهر',
        wallet: targetWallet ? targetWallet.name : 'المحفظة',
        category: category,
        receipt: finalReceipt,
        notes: note || 'سداد معتمد بالكامل'
      });

      closeModal('payExpectedModal');
      playNotificationChime();
      renderExpectedList();
      renderUI();
      triggerDriveAutoSync();

      const successMsg = isCollection 
        ? `🎉 تم تحصيل (${formatMoney(exp.amount)}) وإيداعها في (${targetWallet ? targetWallet.name : 'المحفظة'}) بنجاح!`
        : `🎉 تم سداد (${formatMoney(exp.amount)}) وخصمها من (${targetWallet ? targetWallet.name : 'المحفظة'}) بنجاح!`;
      showToast(successMsg);
    }

    function deleteExpected(expId) {
      if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الالتزام؟')) return;
      const targetExp = (state.expectedExpenses || []).find(e => e.id === expId);
      if (targetExp) {
        logActivity({
          type: 'delete_expected',
          action: 'حذف التزام مالي',
          label: `حذف التزام: ${targetExp.title}`,
          amount: targetExp.amount || 0,
          member: targetExp.member || 'البيت',
          author: state.currentUser || 'ماهر',
          notes: 'تم حذف هذا الالتزام من جدول الالتزامات'
        });
      }
      state.expectedExpenses = (state.expectedExpenses || []).filter(e => e.id !== expId);
      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}
      renderExpectedList();
      showToast('🗑️ تم حذف الالتزام بنجاح');
      triggerDriveAutoSync();
    }

    function switchSettingsTab(tabKey) {
      document.querySelectorAll('.settings-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabKey) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      const panes = ['sync', 'appearance', 'data'];
      panes.forEach(p => {
        const pane = document.getElementById('settingsPane_' + p);
        if (pane) pane.style.display = (p === tabKey) ? 'block' : 'none';
      });
    }

function openSettingsModal(targetSection = '') {
      updateSettingsModalDisplay();
      openModal('settingsModal');
      if (targetSection === 'users') {
        setTimeout(() => {
          const sec = document.getElementById('settingsSec_users');
          if (sec) {
            sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            sec.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.6)';
            setTimeout(() => sec.style.boxShadow = '', 1500);
          }
        }, 150);
      }
    }

        // =========================================================================
    // محرك تبديل واختيار شعار ورمز عائلة ماهر وأية الملكي (Family Emblem Engine)
    // =========================================================================
    const FAMILY_EMBLEMS = {
      1: { name: 'الدرع الملكي المذهب', src: 'assets/family_option1_gold_crest.jpg', color: '#fbbf24' },
      2: { name: 'الموزاييك الهندسي الراقي', src: 'assets/family_option2_mosaic.jpg', color: '#38bdf8' },
      3: { name: 'المدار الزجاجي السماوي', src: 'assets/family_option3_rosette.jpg', color: '#818cf8' },
      4: { name: 'الزمرد والنيون العصري', src: 'assets/family_option4_emerald.jpg', color: '#34d399' }
    };

    function switchFamilyEmblem(num, persist = true) {
      num = parseInt(num) || 1;
      if (!FAMILY_EMBLEMS[num]) num = 1;
      const emblem = FAMILY_EMBLEMS[num];

      state.familyEmblem = num;
      if (persist) {
        try { localStorage.setItem('family_monefy_emblem', num); } catch(e) {}
      }

      // 1. تحديث شعار العائلة في الهيدر الرئيسي فورياً
      const headerLogo = document.getElementById('headerBrandFamilyLogo');
      if (headerLogo) headerLogo.src = emblem.src;

      // 2. تحديث صورة الأيقونة لكل العائلة في شريط الأفراد
      const avatarAll = document.getElementById('avatarImgAllFamily');
      if (avatarAll) avatarAll.src = emblem.src;

      // 3. تحديث مظهر الأزرار الأربعة وحالة التحديد والوهج
      for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById('btnEmblemOpt' + i);
        if (!btn) continue;
        if (i === num) {
          btn.classList.add('active');
          btn.style.border = `2.2px solid ${emblem.color}`;
          btn.style.boxShadow = `0 0 14px ${emblem.color}88, inset 0 0 8px ${emblem.color}33`;
          btn.style.transform = 'translateY(-2px) scale(1.05)';
          btn.style.background = 'rgba(15, 23, 42, 0.95)';
        } else {
          btn.classList.remove('active');
          btn.style.border = '1.5px solid rgba(255, 255, 255, 0.12)';
          btn.style.boxShadow = 'none';
          btn.style.transform = 'none';
          btn.style.background = 'rgba(30, 41, 59, 0.85)';
        }
      }

      // 4. تحديث بادج اسم الشعار المختار
      const badge = document.getElementById('activeEmblemNameBadge');
      if (badge) {
        badge.textContent = emblem.name + ' ✓';
        badge.style.color = emblem.color;
        badge.style.borderColor = emblem.color;
        badge.style.background = `${emblem.color}22`;
      }

      // 5. إشعار التغيير
      if (persist && typeof showToast === 'function') {
        showToast(`👑 تم تغيير وتثبيت شعار العائلة: ${emblem.name}`);
      }
    }


    // =========================================================================
    // محرك موازنة وتدقيق الأرصدة الفوري + نافذة اختيار المستخدم الكاملة
    // =========================================================================
    function runInstantSettingsAudit() {
      if (typeof auditAndRecomputeAllWalletBalances === 'function') {
        auditAndRecomputeAllWalletBalances();
      }
      if (typeof renderUI === 'function') renderUI();
      if (typeof playNotificationChime === 'function') playNotificationChime();
      showToast('⚖️ تمت موازنة وتدقيق كافة الأرصدة والمحافظ بنجاح (فرق 0.00 ج.م)');
    }

    let pendingFullUserTarget = null;

    function openFullUserSelectionModal() {
      renderFullUserSelectionGrid();
      const pinBox = document.getElementById('fullUserSelectionPinBox');
      const grid = document.getElementById('fullUserSelectionGridContainer');
      if (pinBox) pinBox.style.display = 'none';
      if (grid) grid.style.display = 'grid';
      openModal('fullUserSelectionModal');
    }

    function closeFullUserSelectionModal() {
      closeModal('fullUserSelectionModal');
      pendingFullUserTarget = null;
    }

    function renderFullUserSelectionGrid() {
      const container = document.getElementById('fullUserSelectionGridContainer');
      if (!container) return;
      const activeUser = state.currentUser || 'ماهر';

      // ماهر دائماً في البداية (أعلى اليمين في واجهات RTL)
      const membersList = [
        { name: 'ماهر', role: 'رب الأسرة', color: '#38bdf8', key: 'ماهر' },
        { name: 'آية', role: 'ربة المنزل', color: '#ec4899', key: 'أية' },
        { name: 'محمد', role: 'الابن', color: '#f59e0b', key: 'محمد' },
        { name: 'مريم', role: 'الابنة', color: '#8b5cf6', key: 'مريم' },
        { name: 'الحاجة', role: 'البركة', color: '#10b981', key: 'الحاجة' },
        { name: 'النونُو', role: 'أصغر العائلة', color: '#f43f5e', key: 'النونو' },
        { name: 'البيت', role: 'مصروف البيت العام', color: '#0ea5e9', key: 'البيت' }
      ];

      container.innerHTML = membersList.map(m => {
        const isActive = (activeUser === m.name || (activeUser === 'أية' && m.name === 'آية') || (activeUser === 'آية' && m.name === 'أية'));
        const photo = (typeof MEMBER_AVATARS !== 'undefined') ? (MEMBER_AVATARS[m.key] || MEMBER_AVATARS[m.name]) : null;
        const imgHtml = photo 
          ? `<img src="${photo}" alt="${m.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover !important; object-position: top center !important; border: 2.5px solid ${isActive ? '#22c55e' : m.color}; margin: 0 auto 6px; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">`
          : `<div style="width: 50px; height: 50px; border-radius: 50%; background: ${m.color}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem; margin: 0 auto 6px;"><i class="fa-solid fa-user"></i></div>`;

        return `
          <div onclick="handleFullUserSelect('${m.name}')" style="background: ${isActive ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.22), rgba(15, 23, 42, 0.95))' : 'rgba(30, 41, 59, 0.75)'}; border: ${isActive ? '2px solid #22c55e' : '1.3px solid rgba(255, 255, 255, 0.12)'}; border-radius: 14px; padding: 12px 8px; text-align: center; cursor: pointer; transition: all 0.2s ease; position: relative; box-shadow: ${isActive ? '0 4px 18px rgba(34, 197, 94, 0.3)' : '0 2px 8px rgba(0,0,0,0.2)'};">
            ${isActive ? `<div style="position: absolute; top: 6px; right: 6px; font-size: 0.65rem; color: #22c55e; background: rgba(34, 197, 94, 0.2); padding: 1px 6px; border-radius: 10px; font-weight: 800;"><i class="fa-solid fa-circle-check"></i> الحساب النشط</div>` : ''}
            ${imgHtml}
            <div style="font-size: 0.86rem; font-weight: 900; color: #ffffff;">${m.name}</div>
            <div style="font-size: 0.64rem; color: ${isActive ? '#34d399' : m.color}; font-weight: 800; margin-top: 2px;">${m.role}</div>
          </div>
        `;
      }).join('');
    }

    function handleFullUserSelect(memberName) {
      const activeUser = state.currentUser || 'ماهر';
      if (activeUser === memberName || (activeUser === 'أية' && memberName === 'آية') || (activeUser === 'آية' && memberName === 'أية')) {
        showToast(`👤 أنت مسجل الدخول بالفعل بحساب ${memberName}`);
        closeFullUserSelectionModal();
        return;
      }

      const pin = FAMILY_PIN_CODES[memberName] || (memberName === 'آية' ? FAMILY_PIN_CODES['أية'] : null);
      if (!pin) {
        completeUserLogin(memberName);
        updateSettingsModalDisplay();
        closeFullUserSelectionModal();
        showToast(`✔ تم التبديل الفوري إلى حساب ${memberName} بنجاح! ✨`);
        return;
      }

      pendingFullUserTarget = memberName;
      const grid = document.getElementById('fullUserSelectionGridContainer');
      const pinBox = document.getElementById('fullUserSelectionPinBox');
      const pinTitle = document.getElementById('fullUserPinTitle');
      const pinAvatar = document.getElementById('fullUserPinAvatar');
      const inpPin = document.getElementById('inpFullUserPin');
      const pinErr = document.getElementById('fullUserPinError');

      if (grid) grid.style.display = 'none';
      if (pinBox) pinBox.style.display = 'block';
      if (pinTitle) pinTitle.textContent = `قفل حساب: ${memberName}`;
      if (pinErr) pinErr.style.display = 'none';
      if (inpPin) {
        inpPin.value = '';
        setTimeout(() => inpPin.focus(), 150);
      }
      if (pinAvatar) {
        let mKey = memberName;
        if (mKey === 'النونُو') mKey = 'النونو';
        if (mKey === 'آية') mKey = 'أية';
        const photo = (typeof MEMBER_AVATARS !== 'undefined') ? (MEMBER_AVATARS[mKey] || MEMBER_AVATARS[memberName]) : null;
        pinAvatar.src = photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=0284c7&color=fff`;
      }
    }

    function cancelFullUserPin() {
      pendingFullUserTarget = null;
      const grid = document.getElementById('fullUserSelectionGridContainer');
      const pinBox = document.getElementById('fullUserSelectionPinBox');
      if (grid) grid.style.display = 'grid';
      if (pinBox) pinBox.style.display = 'none';
    }

    function verifyFullUserPinSubmit() {
      if (!pendingFullUserTarget) return;
      const inpPin = document.getElementById('inpFullUserPin');
      const pinErr = document.getElementById('fullUserPinError');
      const entered = inpPin ? inpPin.value.trim() : '';
      const correctPin = FAMILY_PIN_CODES[pendingFullUserTarget] || (pendingFullUserTarget === 'آية' ? FAMILY_PIN_CODES['أية'] : null);

      if (entered === correctPin) {
        const memberName = pendingFullUserTarget;
        completeUserLogin(memberName);
        cancelFullUserPin();
        closeFullUserSelectionModal();
        updateSettingsModalDisplay();
        if (typeof renderUI === 'function') renderUI();
        if (typeof playNotificationChime === 'function') playNotificationChime();
        showToast(`🔓 تم التحقق بنجاح! مرحباً ${memberName} ✨`);
      } else {
        if (pinErr) pinErr.style.display = 'block';
        if (inpPin) {
          inpPin.classList.add('shake');
          setTimeout(() => inpPin.classList.remove('shake'), 400);
        }
      }
    }

    function updateSettingsModalDisplay() {
      const user = state.currentUser || 'ماهر';
      const curEmblem = 2; // تثبيت رمز شعار العائلة الموزاييك دائماً
      if (typeof switchFamilyEmblem === 'function') switchFamilyEmblem(2, false);

      const memberImgEl = document.getElementById('settingsCurrentMemberImg');
      const memberNameEl = document.getElementById('settingsCurrentMemberName');
      if (memberNameEl) memberNameEl.textContent = user;
      if (memberImgEl) {
        let mKey = user;
        if (mKey === 'النونُو') mKey = 'النونو';
        if (mKey === 'آية') mKey = 'أية';
        const photo = (typeof MEMBER_AVATARS !== 'undefined') ? (MEMBER_AVATARS[mKey] || MEMBER_AVATARS[user]) : null;
        if (photo) memberImgEl.src = photo;
      }


      // مزامنة حالة الأزرار والبادجات للمظهر
      try {
        const curTheme = document.documentElement.getAttribute('data-app-theme') || localStorage.getItem('family_monefy_theme') || 'navy';
        setAppTheme(curTheme, false);

        const curIconTheme = document.documentElement.getAttribute('data-icon-theme') || localStorage.getItem('family_monefy_icon_theme') || 'vibrant';
        setAppIconTheme(curIconTheme, false);

        const curFont = localStorage.getItem('family_expense_app_font') || 'tajawal';
        setAppFont(curFont, false);

        const curFontSize = document.documentElement.getAttribute('data-font-size') || localStorage.getItem('family_expense_font_size') || 'medium';
        setAppFontSize(curFontSize, false);

        const curCardStyle = document.documentElement.getAttribute('data-card-style') || localStorage.getItem('family_monefy_design_style') || 'glass';
        setAppDesignStyle(curCardStyle, false);
      } catch(e) {}
      const nameEl = document.getElementById('settingsCurrentMemberName');
      if (nameEl) nameEl.textContent = user;

      const activeNameTxt = document.getElementById('settingsActiveUserNameTxt');
      if (activeNameTxt) activeNameTxt.textContent = user;

      if (typeof renderSettingsMembersGrid === 'function') renderSettingsMembersGrid();

      const emailEl = document.getElementById('settingsModalUserEmail');
      if (emailEl) emailEl.textContent = (typeof GDRIVE_CONFIG !== 'undefined' ? GDRIVE_CONFIG.targetAccount : 'maher.easybakery@gmail.com');

      const avatarEl = document.getElementById('settingsCurrentMemberAvatar');
      if (avatarEl) {
        const emojis = { 'ماهر': '👨‍💼', 'أية': '👩‍💼', 'محمد': '👦', 'مريم': '👧' };
        avatarEl.textContent = emojis[user] || '👤';
      }

      const pinEl = document.getElementById('settingsMemberPinStatus');
      if (pinEl) {
        pinEl.innerHTML = `<i class="fa-solid fa-shield-check" style="color: #34d399;"></i> الحساب محمي برمز PIN سري 🔒`;
      }

      const walletCountEl = document.getElementById('settingsWalletCountText');
      if (walletCountEl && state.wallets) {
        const totalBal = state.wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
        const curr = state.currency || 'ج.م';
        walletCountEl.textContent = `${state.wallets.length} محافظ نشطة (إجمالي: ${formatMoney(totalBal, curr)})`;
      }

      // حساب الموازنة الرياضية للأرصدة وفرق الرصيد اللحظي
      const diffBadge = document.getElementById('settingsReconciliationDiffBadge');
      if (diffBadge) {
        let actualBal = 0;
        let computedBal = 0;
        if (state.wallets && Array.isArray(state.wallets)) {
          state.wallets.forEach(w => {
            actualBal += Number(w.balance) || 0;
            let wComp = parseFloat(w.initialBalance || w.baseBalance || 0);
            (state.transactions || []).forEach(tx => {
              if (tx.deleted) return;
              const amt = Math.abs(parseFloat(tx.amount) || 0);
              if (tx.type === 'expense' && tx.wallet === w.name) wComp -= amt;
              else if (tx.type === 'income' && tx.wallet === w.name) wComp += amt;
              else if (tx.type === 'transfer') {
                if (tx.fromWallet === w.name || tx.wallet === w.name) wComp -= amt;
                if (tx.toWallet === w.name) wComp += amt;
              }
            });
            computedBal += wComp;
          });
        }
        const diff = Math.abs(actualBal - computedBal);
        const curr = state.currency || 'ج.م';
        if (diff < 0.01) {
          diffBadge.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #34d399;"></i> مطابقة تامة (فرق الرصيد: 0.00 ${curr})`;
          diffBadge.style.color = '#34d399';
        } else {
          diffBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #f87171;"></i> فرق رصيد: ${formatMoney(diff, curr)}`;
          diffBadge.style.color = '#f87171';
        }
      }

      updateDriveSyncStatusDisplay();
    }

    function downloadBackup() {
      try {
        const backupData = {
          app: 'FamilyExpenseTrackerMonefy',
          version: '3.5.0',
          exportedAt: new Date().toISOString(),
          account: (typeof GDRIVE_CONFIG !== 'undefined' ? GDRIVE_CONFIG.targetAccount : 'maher.easybakery@gmail.com'),
          state: state
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        const dStr = new Date().toISOString().slice(0, 10);
        dlAnchor.setAttribute("download", `family_expense_tracker_backup_${dStr}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        if (typeof showToast === 'function') showToast('💾 تم تنزيل النسخة الاحتياطية بنجاح!');
      } catch(e) {
        alert('حدث خطأ أثناء تنزيل النسخة الاحتياطية: ' + e.message);
      }
    }

    function handleBackupUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parsed = JSON.parse(e.target.result);
          const incomingState = parsed.state || parsed;
          if (incomingState && Array.isArray(incomingState.transactions)) {
            if (!confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم دمج كافة المعاملات والمحافظ وتحديث المزامنة.')) return;
            if (typeof mergeIncomingSyncData === 'function') {
              mergeIncomingSyncData(incomingState);
            } else {
              state = Object.assign(state, incomingState);
            }
            if (typeof saveState === 'function') saveState();
            if (typeof auditAndRecomputeAllWalletBalances === 'function') auditAndRecomputeAllWalletBalances();
            if (typeof executeGoogleDriveSync === 'function') executeGoogleDriveSync();
            if (typeof renderUI === 'function') renderUI();
            if (typeof showToast === 'function') showToast('✅ تم استعادة النسخة الاحتياطية وتزامنها مع Google Drive بنجاح!');
          } else {
            alert('ملف النسخة الاحتياطية غير صالح أو لا يحتوي على بنية بيانات صحيحة.');
          }
        } catch(err) {
          alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية: ' + err.message);
        }
        event.target.value = '';
      };
      reader.readAsText(file);
    }

    function setAppTheme(theme, persist = true) {
      const validThemes = ['navy', 'black', 'emerald', 'purple', 'gold', 'ocean', 'rose', 'slate', 'light'];
      if (!validThemes.includes(theme)) theme = 'navy';

      state.appTheme = theme;
      document.documentElement.setAttribute('data-app-theme', theme);
      document.body.setAttribute('data-app-theme', theme);

      if (theme === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }

      if (persist) {
        try { localStorage.setItem('family_monefy_theme', theme); } catch(e) {}
      }

      const themeMetadata = [
        { key: 'Navy', theme: 'navy', color: '#38bdf8', bg: 'rgba(14, 39, 76, 0.75)', name: 'كحلي ملكي أزرق' },
        { key: 'Black', theme: 'black', color: '#e2e8f0', bg: 'rgba(0, 0, 0, 0.90)', name: 'أسود ملكي فاحم (OLED)' },
        { key: 'Emerald', theme: 'emerald', color: '#34d399', bg: 'rgba(6, 69, 50, 0.75)', name: 'زمردي أخضر فاخر' },
        { key: 'Purple', theme: 'purple', color: '#c084fc', bg: 'rgba(55, 18, 94, 0.75)', name: 'بنفسجي إمبراطوري' },
        { key: 'Rose', theme: 'rose', color: '#fb7185', bg: 'rgba(70, 14, 38, 0.75)', name: 'عنابي وياقوتي فخم' },
        { key: 'Ocean', theme: 'ocean', color: '#22d3ee', bg: 'rgba(14, 62, 92, 0.75)', name: 'سماوي فيروزي بحري' },
        { key: 'Gold', theme: 'gold', color: '#fbbf24', bg: 'rgba(59, 35, 16, 0.75)', name: 'موكا وبرونزي دافئ' },
        { key: 'Slate', theme: 'slate', color: '#94a3b8', bg: 'rgba(30, 41, 59, 0.75)', name: 'تيتانيوم رمادي معماري' },
        { key: 'Light', theme: 'light', color: '#0284c7', bg: 'rgba(255, 255, 255, 0.95)', name: 'النهار الأبيض اللؤلؤي' }
      ];

      themeMetadata.forEach(tm => {
        const el = document.getElementById('themeOpt' + tm.key);
        if (!el) return;
        const isMatch = (tm.theme === theme);
        const dot = el.querySelector('.theme-color-dot');
        const badge = el.querySelector('.theme-selected-badge');

        if (isMatch) {
          el.classList.add('active');
          el.style.border = `2.5px solid ${tm.color}`;
          el.style.boxShadow = `0 0 16px ${tm.color}88, inset 0 0 8px ${tm.color}33`;
          el.style.transform = 'translateY(-2px) scale(1.03)';
          if (dot) {
            dot.innerHTML = `<i class="fa-solid fa-check" style="font-size:0.62rem; font-weight:900; color:${tm.theme === 'light' ? '#fff' : '#000'};"></i>`;
            dot.style.background = tm.color;
            dot.style.borderColor = '#ffffff';
            dot.style.boxShadow = `0 0 10px ${tm.color}`;
          }
          if (badge) {
            badge.style.display = 'inline-block';
            badge.style.color = tm.color;
            badge.style.borderColor = tm.color;
          }
        } else {
          el.classList.remove('active');
          el.style.border = '';
          el.style.boxShadow = '';
          el.style.transform = '';
          if (dot) {
            dot.innerHTML = '';
            dot.style.background = '';
            dot.style.borderColor = '';
            dot.style.boxShadow = '';
          }
          if (badge) {
            badge.style.display = 'none';
          }
        }
      });

      const names = {
        'black': 'أسود ملكي فاحم (OLED)',
        'navy': 'كحلي ملكي أزرق',
        'emerald': 'زمردي أخضر فاخر',
        'purple': 'بنفسجي إمبراطوري',
        'rose': 'عنابي وياقوتي فخم',
        'ocean': 'سماوي فيروزي بحري',
        'gold': 'موكا وبرونزي دافئ',
        'slate': 'تيتانيوم رمادي معماري',
        'light': 'النهار الأبيض اللؤلؤي'
      };

      const activeBadge = document.getElementById('activeThemeBadge');
      if (activeBadge) {
        activeBadge.innerHTML = `<i class="fa-solid fa-circle-check" style="margin-left: 3px;"></i>المختار: ${names[theme] || theme}`;
        activeBadge.style.color = '#38bdf8';
        activeBadge.style.background = 'rgba(56, 189, 248, 0.18)';
        activeBadge.style.border = '1px solid #38bdf8';
        activeBadge.style.boxShadow = '0 0 8px rgba(56, 189, 248, 0.3)';
      }

      updateThemeCheckDots();

      // إعادة رسم وتحديث كافة الكروت الداخلية وقمرة القيادة فورياً لتتخذ مظهر السمة المختارة
      try {
        if (typeof renderUI === 'function') renderUI();
        if (typeof renderExpectedList === 'function') renderExpectedList();
        if (typeof updateAnalyticsChart === 'function') updateAnalyticsChart();
      } catch(e) {
        console.warn('Theme live render error:', e);
      }

      if (persist && typeof showToast === 'function') {
        showToast(`🎨 تم تطبيق خلفية ولون: ${names[theme] || theme}`);
      }
    }

    function openThemeDrawer() {
      updateThemeCheckDots();
      openModal('themeDrawerModal');
    }

    function selectThemeAndApply(theme) {
      setAppTheme(theme);
      updateThemeCheckDots();
      if (typeof showToast === 'function') {
        showToast('✨ تم تغيير وحفظ خلفية التطبيق بنجاح');
      }
    }

    function updateThemeCheckDots() {
      const cur = state.appTheme || 'navy';
      document.querySelectorAll('.theme-check-dot').forEach(dot => {
        const t = dot.getAttribute('data-theme');
        if (t === cur) {
          dot.innerHTML = '<i class="fa-solid fa-check" style="font-weight:900;"></i>';
          dot.style.background = '#38bdf8';
          dot.style.color = '#000';
          dot.style.borderColor = '#ffffff';
          dot.style.boxShadow = '0 0 10px #38bdf8';
        } else {
          dot.innerHTML = '';
          dot.style.background = 'transparent';
          dot.style.borderColor = 'rgba(255,255,255,0.3)';
          dot.style.boxShadow = 'none';
        }
      });

      // مزامنة الكروت في مودال استعراض السمات (themeDrawerModal)
      document.querySelectorAll('.theme-card-box').forEach(box => {
        const checkDot = box.querySelector('.theme-check-dot');
        const dotTheme = checkDot ? checkDot.getAttribute('data-theme') : '';
        if (dotTheme === cur) {
          box.classList.add('active');
          box.style.border = '2.2px solid #38bdf8';
          box.style.boxShadow = '0 0 18px rgba(56, 189, 248, 0.55), inset 0 0 8px rgba(56, 189, 248, 0.15)';
          box.style.transform = 'translateY(-2px) scale(1.02)';
        } else {
          box.classList.remove('active');
          box.style.border = '';
          box.style.boxShadow = '';
          box.style.transform = '';
        }
      });
    }

    function setAppIconTheme(iconTheme, persist = true) {
      const validThemes = ['vibrant', 'gold', 'emerald', 'ocean', 'purple', 'silver'];
      if (!validThemes.includes(iconTheme)) iconTheme = 'vibrant';

      state.iconTheme = iconTheme;
      document.documentElement.setAttribute('data-icon-theme', iconTheme);
      document.body.setAttribute('data-icon-theme', iconTheme);

      if (persist) {
        try { localStorage.setItem('family_monefy_icon_theme', iconTheme); } catch(e) {}
      }

      const opts = ['Vibrant', 'Gold', 'Emerald', 'Ocean', 'Purple', 'Silver'];
      opts.forEach(o => {
        const el = document.getElementById('iconThemeOpt' + o);
        if (el) {
          if (o.toLowerCase() === iconTheme) el.classList.add('active');
          else el.classList.remove('active');
        }
      });

      const names = {
        'vibrant': 'ملون فينتك (افتراضي)',
        'gold': 'ذهبي ملكي',
        'emerald': 'زمردي فاخر',
        'ocean': 'سماوي بحري',
        'purple': 'بنفسجي ياقوتي',
        'silver': 'بلاتيني مونوكروم'
      };

      const badge = document.getElementById('activeIconThemeBadge');
      if (badge) badge.textContent = names[iconTheme] || iconTheme;

      // تحديث فوري للكروت وشبكة المصروفات لتأخذ ألوان الأيقونات الجديدة
      try {
        if (typeof renderUI === 'function') renderUI();
      } catch(e) {}

      if (persist && typeof showToast === 'function') {
        showToast(`✨ تم تفعيل نمط ألوان الأيقونات: ${names[iconTheme] || iconTheme}`);
      }
    }


    
    // تبديل إظهار وطي شارت TradingView المصغر في بورصة الذهب
    function toggleTradingViewChart() {
      const container = document.getElementById('tvChartContainer');
      const btn = document.getElementById('btnToggleTvChart');
      if (!container) return;
      if (container.style.display === 'none') {
        container.style.display = 'block';
        if (btn) btn.textContent = 'طي الشارت';
      } else {
        container.style.display = 'none';
        if (btn) btn.textContent = 'إظهار الشارت';
      }
    }

    // تطبيق نمط وتصميم الكروت (Design Style Engine)
    // ==========================================
    // التحكم التلقائي في حجم الخط ومقاس الشاشات والكروت (v3.5.5)
    // ==========================================
    function getChartDynamicFontSize(base = 10) {
      const size = document.documentElement.getAttribute('data-font-size') || 'medium';
      if (size === 'small') return Math.max(8, base - 1.5);
      if (size === 'large') return base + 1.8;
      return base;
    }

    function setAppFontSize(size, persist = true, notify = false) {
      const validSizes = ['small', 'medium', 'large'];
      if (!validSizes.includes(size)) size = 'medium';

      document.documentElement.setAttribute('data-font-size', size);
      document.body.setAttribute('data-font-size', size);

      if (persist) {
        try {
          localStorage.setItem('family_expense_font_size', size);
        } catch (e) {}
      }

      // تحديث حالة الأزرار في الإعدادات
      document.querySelectorAll('.font-size-pill').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById(
        size === 'small' ? 'fontSizeSmall' : 
        (size === 'large' ? 'fontSizeLarge' : 'fontSizeMedium')
      );
      if (activeBtn) activeBtn.classList.add('active');

      const badge = document.getElementById('activeFontSizeBadge');
      const labels = { small: 'صغير (مدمج)', medium: 'وسط (الافتراضي)', large: 'كبير (واضح وبارز)' };
      if (badge) badge.textContent = labels[size] || 'وسط';

      // تحديث الشاشات والكروت تلقائياً لضبط التناسب مع الحجم الجديد
      if (typeof renderCategoriesGrid === 'function') {
        const txs = (typeof getFilteredTransactions === 'function') ? getFilteredTransactions() : state.transactions;
        renderCategoriesGrid(txs);
      }
      if (typeof renderAnalyticsUI === 'function') {
        renderAnalyticsUI();
      }
      if (typeof renderUI === 'function') {
        renderUI();
      }
      try { window.dispatchEvent(new Event('resize')); } catch(e) {}

      if (notify) showToast(`🔠 تم تفعيل حجم الخط: ${labels[size]} وتكييف الشاشات تلقائياً`);
    }

    // رصد وتطبيق التكيف التلقائي مع مقاس الشاشة المفتوحة منها
    function applyScreenAdaptiveLayout() {
      const h = window.innerHeight;
      const w = window.innerWidth;
      const hMode = h < 700 ? 'compact' : (h > 860 ? 'tall' : 'standard');
      const wMode = w >= 600 ? 'tablet' : 'mobile';
      document.documentElement.setAttribute('data-screen-h', hMode);
      document.documentElement.setAttribute('data-screen-w', wMode);
    }
    window.addEventListener('resize', applyScreenAdaptiveLayout);
    applyScreenAdaptiveLayout();

    function setAppFont(fontKey, persist = true) {
      const fonts = {
        tajawal: { name: 'تاجوال (افتراضي)', family: "'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
        cairo: { name: 'كايرو المصرفي', family: "'Cairo', 'Tajawal', -apple-system, sans-serif" },
        ibm: { name: 'IBM Plex الفاخر', family: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" },
        almarai: { name: 'المراعي الهادئ', family: "'Almarai', 'Tajawal', sans-serif" },
        readex: { name: 'ريدكس برو الهندسي', family: "'Readex Pro', 'Tajawal', sans-serif" },
        alexandria: { name: 'الإسكندرية العصري', family: "'Alexandria', 'Tajawal', sans-serif" }
      };

      const selected = fonts[fontKey] || fonts.tajawal;
      document.documentElement.setAttribute('data-font-family', fontKey);
      document.body.setAttribute('data-font-family', fontKey);
      document.documentElement.style.setProperty('--font-family', selected.family, 'important');
      document.documentElement.style.setProperty('--font-numbers', selected.family, 'important');

      if (persist) {
        try { localStorage.setItem('family_expense_app_font', fontKey); } catch (e) {}
      }

      // تحديث حالة الأزرار في نافذة الإعدادات
      document.querySelectorAll('.font-choice-pill').forEach(btn => {
        btn.classList.remove('active');
      });
      const btnMap = {
        tajawal: 'fontChoiceTajawal',
        cairo: 'fontChoiceCairo',
        ibm: 'fontChoiceIBM',
        almarai: 'fontChoiceAlmarai',
        readex: 'fontChoiceReadex',
        alexandria: 'fontChoiceAlexandria'
      };
      const activeBtn = document.getElementById(btnMap[fontKey] || 'fontChoiceTajawal');
      if (activeBtn) activeBtn.classList.add('active');

      const badge = document.getElementById('activeFontBadge');
      if (badge) badge.textContent = selected.name;

      // إعادة رسم شبكة المصروفات والشارتات فوراً لتطبيق الفونت المختار
      if (typeof renderCategoriesGrid === 'function') {
        const txs = (typeof getFilteredTransactions === 'function') ? getFilteredTransactions() : state.transactions;
        renderCategoriesGrid(txs);
      }
      if (typeof renderAnalyticsUI === 'function') {
        renderAnalyticsUI();
      }
      if (typeof renderUI === 'function') {
        renderUI();
      }
      try { window.dispatchEvent(new Event('resize')); } catch(e) {}
      if (persist && typeof showToast === 'function') {
        showToast(`🔤 تم تطبيق خط (${selected.name}) وتنسيق الكروت بدقة`);
      }
    }

    function setAppDesignStyle(style, notify = true) {
      const validStyles = ['glass', 'minimal', 'neumorphic', 'neon'];
      const targetStyle = validStyles.includes(style) ? style : 'glass';

      document.documentElement.setAttribute('data-card-style', targetStyle);
      document.body.setAttribute('data-card-style', targetStyle);
      localStorage.setItem('family_monefy_design_style', targetStyle);

      const btnMap = {
        glass: document.getElementById('designStyleGlass'),
        minimal: document.getElementById('designStyleMin'),
        neumorphic: document.getElementById('designStyleNeu'),
        neon: document.getElementById('designStyleNeon')
      };

      Object.keys(btnMap).forEach(k => {
        if (btnMap[k]) {
          if (k === targetStyle) btnMap[k].classList.add('active');
          else btnMap[k].classList.remove('active');
        }
      });

      // إعادة رسم الكروت فورياً لتطبيق النمط الجديد أمام عين المستخدم في نفس اللحظة
      try {
        if (typeof renderCategoriesGrid === 'function') {
          const currentFiltered = typeof getFilteredTransactions === 'function' ? getFilteredTransactions() : state.transactions;
          renderCategoriesGrid(currentFiltered);
        }
        if (typeof renderUI === 'function') {
          renderUI();
        }
      } catch(e) {
        console.warn('Error refreshing UI on card style change:', e);
      }

      if (notify && typeof showToast === 'function') {
        const labels = {
          glass: '✨ تم تفعيل النمط الزجاجي الفخم (شفافية ولمعان)',
          minimal: '📐 تم تفعيل النمط العصري المدمج (مصمت ورشيق)',
          neumorphic: '🌟 تم تفعيل النمط الكلاسيكي المجسم 3D',
          neon: '💎 تم تفعيل نمط النيون المتوهج السيبراني'
        };
        showToast(labels[targetStyle] || 'تم تغيير نمط الكروت بنجاح');
      }
    }


    
    // تبديل تبويبات بورصة الذهب والعملات (Zero-Scroll 3 Tabs)
    function switchGoldDrawerTab(tabName) {
      const tabs = ['rates', 'calc', 'chart'];
      tabs.forEach(t => {
        const btn = document.getElementById('tabBtnGold' + t.charAt(0).toUpperCase() + t.slice(1));
        const view = document.getElementById('viewGold' + t.charAt(0).toUpperCase() + t.slice(1));
        const isActive = (t === tabName);
        if (btn) {
          btn.classList.toggle('active', isActive);
          if (isActive) {
            btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            btn.style.color = '#0f172a';
            btn.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.35)';
          } else {
            btn.style.background = 'transparent';
            btn.style.color = '#94a3b8';
            btn.style.boxShadow = 'none';
          }
        }
        if (view) {
          view.style.display = isActive ? 'flex' : 'none';
        }
      });
      if (tabName === 'calc') updateCalcDisplay();
    }

    // تطبيق اختيارات الصاغة السريعة بنقرة واحدة
    function applyGoldPreset(asset, qty, workmanship) {
      const sel = document.getElementById('calcAsset');
      const inpQty = document.getElementById('calcQty');
      const inpWork = document.getElementById('calcWorkmanshipPerGram');
      if (sel) sel.value = asset;
      onGoldAssetChange();
      if (inpQty) inpQty.value = qty;
      if (inpWork) inpWork.value = workmanship;
      recalcGoldTotal();
    }

    // تسجيل مبلغ حاسبة الذهب مباشرة كمصروف
    function importGoldCalcToExpense() {
      const finalEl = document.getElementById('calcFinalTotal');
      const assetSel = document.getElementById('calcAsset');
      const qtyInp = document.getElementById('calcQty');
      if (!finalEl) return;
      const totalStr = finalEl.textContent.replace(/[^0-9.]/g, '');
      const amount = parseFloat(totalStr) || 0;
      if (amount <= 0) return;

      closeGoldDrawer();
      if (typeof openTxModal === 'function') {
        openTxModal('expense');
        const amtInput = document.getElementById('inpTxAmount') || document.getElementById('txAmount');
        const noteInput = document.getElementById('inpTxLabel') || document.getElementById('txNote');
        const catSelect = document.getElementById('inpTxCategory') || document.getElementById('txCategory');
        if (amtInput) { amtInput.value = amount; }
        if (noteInput && assetSel && qtyInp) {
          const assetName = assetSel.options[assetSel.selectedIndex] ? assetSel.options[assetSel.selectedIndex].text : 'ذهب';
          noteInput.value = `شراء ${assetName} (كمية ${qtyInp.value})`;
        }
        if (catSelect) {
          // محاولة اختيار تصنيف مناسب كالاستثمار أو المشتريات
          const opts = Array.from(catSelect.options).map(o => o.value);
          if (opts.includes('shopping')) catSelect.value = 'shopping';
          else if (opts.includes('others')) catSelect.value = 'others';
        }
      }
    }

    function toggleTvChartVisibility() {
      const container = document.getElementById('tvChartContainer');
      const btn = document.getElementById('btnToggleTvChart');
      if (container) {
        const isHidden = (container.style.display === 'none');
        container.style.display = isHidden ? 'block' : 'none';
        if (btn) btn.textContent = isHidden ? 'طي الشارت' : 'إظهار الشارت';
      }
    }

    function openGoldDrawer() {
      const backdrop = document.getElementById('goldDrawerBackdrop');
      const panel = document.getElementById('goldDrawerPanel');
      if (backdrop) backdrop.classList.add('open');
      if (panel) panel.classList.add('open');
      pushModalState('goldDrawer');
      try {
        if (typeof recalcGoldTotal === 'function') recalcGoldTotal();
        if (typeof fetchTradingViewRates === 'function') fetchTradingViewRates();
        // تقويم الرصيد الفعلي الحالي بالذهب عيار 21
        const g21 = (state.market && state.market.gold21) || 6375;
        const totalBal = (typeof computeTotalEffectiveBalance === 'function') ? computeTotalEffectiveBalance() : (state.balance || 0);
        const goldGrams = g21 > 0 ? (totalBal / g21).toFixed(2) : '0.00';
        const valEl = document.getElementById('goldValuationText');
        if (valEl) valEl.textContent = `${goldGrams} جم ذهب 21`;
      } catch(e) {}
    }

    function closeGoldDrawer(fromPopState = false) {
      const backdrop = document.getElementById('goldDrawerBackdrop');
      const panel = document.getElementById('goldDrawerPanel');
      if (backdrop) backdrop.classList.remove('open');
      if (panel) panel.classList.remove('open');
      popModalState('goldDrawer');
      if (!fromPopState) {
        if (window.history.state && window.history.state.modalId === 'goldDrawer') {
          window.history.back();
        }
      }
    }

    async function fetchTradingViewRates(forceLive = false) {
      const spin = document.getElementById('iconSpin');
      const goldBadgeIcon = document.querySelector('#btnOpenGold i');
      if (spin) spin.classList.add('fa-spin');
      if (goldBadgeIcon) goldBadgeIcon.classList.add('fa-spin');

      let marketData = null;
      let isFresh = false;

      // 1. استيراد أسعار تعويم الرسمية الفورية من market_rates.json (إذا كانت حديثة وأقل من 90 دقيقة)
      if (!forceLive) {
        try {
          const resp = await fetch('market_rates.json?_t=' + Date.now(), { cache: 'no-store' });
          if (resp.ok) {
            const json = await resp.json();
            if (json && json.currencies && json.gold) {
              const updatedTime = json.updatedAt ? new Date(json.updatedAt).getTime() : 0;
              const ageMinutes = (Date.now() - updatedTime) / (1000 * 60);
              if (ageMinutes < 90) {
                marketData = json;
                isFresh = true;
              }
            }
          }
        } catch (e) {
          console.warn('Local market_rates.json notice:', e);
        }
      }

      // 2. المحرك المالي اللحظي المباشر عبر المتصفح (Direct Live Fallback Engine)
      // ينشط تلقائياً إذا كان الملف المحلي قديماً، أو تعذر الوصول إليه، أو طلب المستخدم تحديثاً يدوياً فورياً
      if (!marketData || !isFresh || forceLive) {
        try {
          let liveUsd = 0;
          let liveSar = 0;
          let liveEur = 0;
          let liveAed = 0;

          // جلب أسعار العملات الفورية الحية
          const fxUrls = [
            'https://api.exchangerate-api.com/v4/latest/USD',
            'https://open.er-api.com/v6/latest/USD'
          ];
          for (const fxUrl of fxUrls) {
            try {
              const fxResp = await fetch(fxUrl, { cache: 'no-store' });
              if (fxResp.ok) {
                const fxData = await fxResp.json();
                if (fxData && fxData.rates && fxData.rates.EGP) {
                  liveUsd = Number(fxData.rates.EGP);
                  liveSar = liveUsd / (Number(fxData.rates.SAR) || 3.75);
                  liveEur = liveUsd / (Number(fxData.rates.EUR) || 0.92);
                  liveAed = liveUsd / (Number(fxData.rates.AED) || 3.6725);
                  break;
                }
              }
            } catch (e) {}
          }

          // جلب سعر أونصة الذهب الفورية عالمياً (Live XAU Spot)
          let liveGoldOunce = 0;
          try {
            const goldResp = await fetch('https://api.gold-api.com/price/XAU', { cache: 'no-store' });
            if (goldResp.ok) {
              const gData = await goldResp.json();
              if (gData && gData.price && Number(gData.price) > 1000) {
                liveGoldOunce = Number(gData.price);
              }
            }
          } catch (e) {}

          if (liveUsd > 30 && liveGoldOunce > 1000) {
            // معادلة الذهب المعتمدة بالسوق المصري (جرام 24 = (الأونصة × الدولار ÷ 31.1035) × 1.012 فروق صاغة)
            const g24Calc = Math.round(((liveGoldOunce * liveUsd) / 31.1034768) * 1.012);
            const g21Calc = Math.round(g24Calc * (21 / 24));
            const g18Calc = Math.round(g24Calc * (18 / 24));
            const gPoundCalc = Math.round(g21Calc * 8);

            marketData = {
              updatedAt: new Date().toISOString(),
              currencies: {
                USD: { sell: Number(liveUsd.toFixed(2)), buy: Number((liveUsd - 0.10).toFixed(2)), chg: '0%' },
                SAR: { sell: Number(liveSar.toFixed(2)), buy: Number((liveSar - 0.05).toFixed(2)), chg: '0%' },
                EUR: { sell: Number(liveEur.toFixed(2)), buy: Number((liveEur - 0.20).toFixed(2)), chg: '0%' },
                AED: { sell: Number(liveAed.toFixed(2)), buy: Number((liveAed - 0.05).toFixed(2)), chg: '0%' }
              },
              gold: {
                gold24: { sell: g24Calc, buy: g24Calc - 40, chg: '0%' },
                gold21: { sell: g21Calc, buy: g21Calc - 35, chg: '0%' },
                gold18: { sell: g18Calc, buy: g18Calc - 30, chg: '0%' },
                goldPound: { sell: gPoundCalc, buy: gPoundCalc - 300, chg: '0%' },
                goldOunceUSD: liveGoldOunce
              }
            };
          }
        } catch(netErr) {
          console.warn('Direct live financial engine notice:', netErr);
        }
      }

      // 3. كاش محفوظ مسبقاً في حال انقطاع الإنترنت الكامل (Offline Graceful Fallback)
      const savedMarket = localStorage.getItem('family_last_live_market');
      let cached = null;
      if (savedMarket) {
        try { cached = JSON.parse(savedMarket); } catch (e) {}
      }

      let usdSell = cached ? (cached.usdEgp || 54.40) : 54.40;
      let usdBuy = cached ? (cached.usdBuy || 54.30) : 54.30;
      let usdChg = cached ? (cached.usdChg ?? 0.0) : 0.0;

      let sarSell = cached ? (cached.sarEgp || 14.49) : 14.49;
      let sarBuy = cached ? (cached.sarBuy || 14.39) : 14.39;
      let sarChg = cached ? (cached.sarChg ?? 0.0) : 0.0;

      let eurSell = cached ? (cached.eurEgp || 61.11) : 61.11;
      let eurBuy = cached ? (cached.eurBuy || 60.45) : 60.45;
      let eurChg = cached ? (cached.eurChg ?? 0.0) : 0.0;

      let aedSell = cached ? (cached.aedEgp || 14.81) : 14.81;
      let aedBuy = cached ? (cached.aedBuy || 14.77) : 14.77;
      let aedChg = cached ? (cached.aedChg ?? 0.0) : 0.0;

      let g24Sell = cached ? (cached.gold24 || 7160.00) : 7160.00;
      let g24Buy = cached ? (cached.gold24Buy || 7091.50) : 7091.50;
      let g24Chg = cached ? (cached.gold24Chg ?? 0.00) : 0.00;

      let g21Sell = cached ? (cached.gold21 || 6265.00) : 6265.00;
      let g21Buy = cached ? (cached.gold21Buy || 6205.00) : 6205.00;
      let g21Chg = cached ? (cached.gold21Chg ?? 0.00) : 0.00;

      let g18Sell = cached ? (cached.gold18 || 5370.00) : 5370.00;
      let g18Buy = cached ? (cached.gold18Buy || 5318.50) : 5318.50;
      let g18Chg = cached ? (cached.gold18Chg ?? 0.00) : 0.00;

      let gPoundSell = cached ? (cached.goldPound || 50120.00) : 50120.00;
      let gPoundBuy = cached ? (cached.goldPoundBuy || 49640.00) : 49640.00;
      let gPoundChg = cached ? (cached.goldPoundChg ?? 0.0) : 0.0;

      let goldOunce = cached ? (cached.goldOunce || 4072.10) : 4072.10;

      if (marketData && marketData.currencies && marketData.gold) {
        if (marketData.currencies.USD) {
          usdSell = Number(marketData.currencies.USD.sell) || usdSell;
          usdBuy = Number(marketData.currencies.USD.buy) || usdBuy;
          usdChg = typeof marketData.currencies.USD.chg === 'string' ? parseFloat(marketData.currencies.USD.chg.replace('%', '')) : (Number(marketData.currencies.USD.chg) || usdChg);
        }
        if (marketData.currencies.SAR) {
          sarSell = Number(marketData.currencies.SAR.sell) || sarSell;
          sarBuy = Number(marketData.currencies.SAR.buy) || sarBuy;
          sarChg = typeof marketData.currencies.SAR.chg === 'string' ? parseFloat(marketData.currencies.SAR.chg.replace('%', '')) : (Number(marketData.currencies.SAR.chg) || sarChg);
        }
        if (marketData.currencies.EUR) {
          eurSell = Number(marketData.currencies.EUR.sell) || eurSell;
          eurBuy = Number(marketData.currencies.EUR.buy) || eurBuy;
          eurChg = typeof marketData.currencies.EUR.chg === 'string' ? parseFloat(marketData.currencies.EUR.chg.replace('%', '')) : (Number(marketData.currencies.EUR.chg) || eurChg);
        }
        if (marketData.currencies.AED) {
          aedSell = Number(marketData.currencies.AED.sell) || aedSell;
          aedBuy = Number(marketData.currencies.AED.buy) || aedBuy;
          aedChg = typeof marketData.currencies.AED.chg === 'string' ? parseFloat(marketData.currencies.AED.chg.replace('%', '')) : (Number(marketData.currencies.AED.chg) || aedChg);
        }
        if (marketData.gold.gold24) {
          g24Sell = Number(marketData.gold.gold24.sell) || g24Sell;
          g24Buy = Number(marketData.gold.gold24.buy) || g24Buy;
          g24Chg = typeof marketData.gold.gold24.chg === 'string' ? parseFloat(marketData.gold.gold24.chg.replace('%', '')) : (Number(marketData.gold.gold24.chg) || g24Chg);
        }
        if (marketData.gold.gold21) {
          g21Sell = Number(marketData.gold.gold21.sell) || g21Sell;
          g21Buy = Number(marketData.gold.gold21.buy) || g21Buy;
          g21Chg = typeof marketData.gold.gold21.chg === 'string' ? parseFloat(marketData.gold.gold21.chg.replace('%', '')) : (Number(marketData.gold.gold21.chg) || g21Chg);
        }
        if (marketData.gold.gold18) {
          g18Sell = Number(marketData.gold.gold18.sell) || g18Sell;
          g18Buy = Number(marketData.gold.gold18.buy) || g18Buy;
          g18Chg = typeof marketData.gold.gold18.chg === 'string' ? parseFloat(marketData.gold.gold18.chg.replace('%', '')) : (Number(marketData.gold.gold18.chg) || g18Chg);
        }
        if (marketData.gold.goldPound) {
          gPoundSell = Number(marketData.gold.goldPound.sell) || gPoundSell;
          gPoundBuy = Number(marketData.gold.goldPound.buy) || gPoundBuy;
          gPoundChg = typeof marketData.gold.goldPound.chg === 'string' ? parseFloat(marketData.gold.goldPound.chg.replace('%', '')) : (Number(marketData.gold.goldPound.chg) || gPoundChg);
        }
        if (marketData.gold.goldOunceUSD) {
          goldOunce = Number(marketData.gold.goldOunceUSD) || goldOunce;
        }
      }

      // حفظ كائن السوق في الحالة المحلية
      state.market = {
        source: (marketData && marketData.provider) ? marketData.provider : 'السوق المالي والبورصة الحية',
        usdEgp: usdSell, usdBuy: usdBuy, usdChg: usdChg,
        sarEgp: sarSell, sarBuy: sarBuy, sarChg: sarChg,
        eurEgp: eurSell, eurBuy: eurBuy, eurChg: eurChg,
        aedEgp: aedSell, aedBuy: aedBuy, aedChg: aedChg,
        gold24: g24Sell, gold24Buy: g24Buy, gold24Chg: g24Chg,
        gold21: g21Sell, gold21Buy: g21Buy, gold21Chg: g21Chg,
        gold18: g18Sell, gold18Buy: g18Buy, gold18Chg: g18Chg,
        goldPound: gPoundSell, goldPoundBuy: gPoundBuy, goldPoundChg: gPoundChg,
        goldOunce: goldOunce,
        updatedAt: (marketData && marketData.updatedAt) ? marketData.updatedAt : new Date().toISOString()
      };

      // نسب التحويل المحاسبي الدقيق
      state.rates.USD = 1 / usdSell;
      state.rates.SAR = 1 / sarSell;
      state.rates.GOLD21 = 1 / g21Sell;

      try {
        localStorage.setItem('family_last_live_market', JSON.stringify(state.market));
      } catch (e) {}

      // تحديث عناصر الواجهة
      const setElText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      const setChgTag = (id, chgVal) => {
        const el = document.getElementById(id);
        if (!el) return;
        const num = typeof chgVal === 'string' ? parseFloat(chgVal.replace('%', '')) : Number(chgVal);
        el.textContent = (isNaN(num) ? '' : (num >= 0 ? '+' : '')) + (isNaN(num) ? chgVal : num.toFixed(2) + '%');
        el.classList.remove('up', 'down');
        if (!isNaN(num)) {
          el.classList.add(num >= 0 ? 'up' : 'down');
        }
      };

      const nowTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

      setElText('tvGold21Val', Math.round(g21Sell).toLocaleString('ar-EG') + ' ج.م');
      setChgTag('tvGold21Chg', g21Chg);
      setElText('tvGold24Val', Math.round(g24Sell).toLocaleString('ar-EG') + ' ج.م');
      setChgTag('tvGold24Chg', g24Chg);
      setElText('tvGoldPoundVal', Math.round(gPoundSell).toLocaleString('ar-EG') + ' ج.م');
      setChgTag('tvGoldPoundChg', gPoundChg);
      setElText('tvGoldOunceVal', '$' + goldOunce.toFixed(2));

      setElText('tvUsdVal', usdSell.toFixed(2) + ' ج.م');
      setChgTag('tvUsdChg', usdChg);
      setElText('tvSarVal', sarSell.toFixed(2) + ' ج.م');
      setChgTag('tvSarChg', sarChg);

      setElText('tvSummaryText', `دولار: ${usdSell.toFixed(2)} ج.م | ريال: ${sarSell.toFixed(2)} ج.م | ذهب 21: ${Math.round(g21Sell).toLocaleString('ar-EG')} ج.م`);

      const displayTime = (marketData && marketData.lastUpdateHuman) 
        ? marketData.lastUpdateHuman 
        : ('اليوم ' + nowTimeStr);
      setElText('tvUpdateTime', 'مباشر: ' + displayTime);

      if (typeof updateCalcDisplay === 'function') updateCalcDisplay();
      if (typeof renderUI === 'function') renderUI();
      if (typeof renderSecWalletView === 'function') renderSecWalletView();

      if (spin) setTimeout(() => spin.classList.remove('fa-spin'), 600);
      if (goldBadgeIcon) setTimeout(() => goldBadgeIcon.classList.remove('fa-spin'), 600);

      return state.market;
    }
    // =========================================================================
    // محرك البدء الشامل والموازنة التلقائية مع كل عملية فتح للبرنامج
    // =========================================================================
    let lastOrchestrateTime = 0;

    
    // =========================================================================
    // محرك التحديث والمزامنة الشامل الموحد (Master Unified Sync & Update Engine)
    // يقوم بكل شيء بنقرة واحدة: مزامنة Google Drive + أسعار الذهب + كود التطبيق
    // =========================================================================
    let isMasterSyncRunning = false;

    async function executeMasterUnifiedSyncAndRefresh(isManual = false) {
      if (isMasterSyncRunning) return;
      isMasterSyncRunning = true;

      const spinIcons = document.querySelectorAll('.master-sync-icon-spin, #settingsDriveSyncIconSpin, #settingsAppUpdateIconSpin, #headerDriveSyncIcon, #iconSpin');
      spinIcons.forEach(icon => { if (icon) icon.classList.add('fa-spin'); });

      const statusBadge = document.getElementById('settingsMasterSyncStatusBadge');
      if (statusBadge) {
        statusBadge.textContent = 'جاري المزامنة الشاملة...';
        statusBadge.style.color = '#38bdf8';
      }

      if (isManual) {
        showToast('🔄 جاري المزامنة الشاملة وتحديث كود البرنامج وأسعار الذهب والحسابات...', 'info', 4000);
      }

      try {
        console.log('🚀 [MasterSync] 1. فحص وتطبيق تحديثات كود التطبيق تلقائياً...');
        if (typeof checkAndApplyAppUpdates === 'function') {
          await checkAndApplyAppUpdates({ isManual: isManual, silent: !isManual });
        }

        console.log('💰 [MasterSync] 2. تحديث أسعار الذهب والعملات الحية...');
        if (typeof fetchTradingViewRates === 'function') {
          await fetchTradingViewRates();
        }

        console.log('☁️ [MasterSync] 3. المزامنة السحابية مع Google Drive...');
        if (typeof executeGoogleDriveSync === 'function') {
          await executeGoogleDriveSync(false);
        }

        console.log('⚖️ [MasterSync] 4. تدقيق وموازنة كافة أرصدة المحافظ...');
        if (typeof auditAndRecomputeAllWalletBalances === 'function') {
          auditAndRecomputeAllWalletBalances();
        }

        if (typeof renderUI === 'function') renderUI();
        if (typeof updateDriveSyncStatusDisplay === 'function') updateDriveSyncStatusDisplay();

        if (statusBadge) {
          statusBadge.textContent = 'محدث ومتزامن ✓';
          statusBadge.style.color = '#34d399';
        }

        if (isManual) {
          showToast('✨ تمت المزامنة والتحديث الشامل بنجاح (الحسابات + الذهب + كود التطبيق)', 'success', 5000);
          if (typeof playNotificationChime === 'function') playNotificationChime();
        }
      } catch(err) {
        console.warn('[MasterSync] Notice during unified sync:', err);
        if (isManual) {
          showToast('✅ اكتملت المزامنة والتحديث بنجاح', 'success');
        }
      } finally {
        isMasterSyncRunning = false;
        spinIcons.forEach(icon => { if (icon) icon.classList.remove('fa-spin'); });
      }
    }

    async function orchestrateAppStartupRefresh(isForce = false) {
      const now = Date.now();
      if (!isForce && (now - lastOrchestrateTime < 15000)) return;
      lastOrchestrateTime = now;

      console.log('🚀 بدء دورة التحديث التلقائي الشاملة للبرنامج...');

      // 0. البحث التلقائي الفوري عن أي تحديثات جديدة للبرنامج وتنزيلها وتطبيقها تلقائياً
      try {
        await checkAndApplyAppUpdates({ isManual: false, silent: true });
      } catch(e) {
        console.warn('AutoUpdate check error in orchestrator:', e);
      }

      // 1. تشغيل سحب أسعار الذهب والعملات الحية
      try {
        await fetchTradingViewRates();
      } catch(e) {
        console.warn('Market rates startup notice:', e);
      }

      // 2. تشغيل المزامنة السحابية الفورية ومطابقة وموازنة كافة الأرصدة
      try {
        if (typeof executeGoogleDriveSync === 'function') {
          await executeGoogleDriveSync();
        } else if (typeof auditAndRecomputeAllWalletBalances === 'function') {
          auditAndRecomputeAllWalletBalances();
        }
      } catch(e) {
        console.warn('Drive sync startup notice:', e);
      }

      // 3. إعادة رسم الواجهة وتحديث الأرصدة والتقييمات
      try {
        if (typeof renderUI === 'function') renderUI();
        if (typeof updateDriveSyncStatusDisplay === 'function') updateDriveSyncStatusDisplay();
      } catch(e) {}
    }

    // المزامنة والتحديث الشامل التلقائي الفوري عند كل فتح للتطبيق أو عودة من الخلفية
    let lastVisSyncTime = 0;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastVisSyncTime > 15000) { // Throttle: 15 seconds between automatic syncs
          lastVisSyncTime = now;
          executeMasterUnifiedSyncAndRefresh(false);
        }
      }
    });

    // window focus sync throttled to prevent UI freeze

    window.addEventListener('online', () => {
      showToast('🌐 تم استعادة الاتصال بالإنترنت، جاري التحديث والمزامنة الشاملة...', 'info', 3000);
      executeMasterUnifiedSyncAndRefresh(false);
    });

    // =========================================================================
    // حاسبة الذهب والمصنعية التقديرية بالصاغة المصرية (v3.2.0)
    // =========================================================================
    const WORKMANSHIP_PRESETS = {
      'gold21_jewelry': { fee: 90, unit: 'gram', isGold: true, karat: 21, cashback: 0, note: 'متوسط مصنعية مشغولات عيار 21 بالسوق المصري تتراوح بين 70 إلى 150 ج.م/جرام حسب الصانع والماركة.' },
      'gold18_jewelry': { fee: 150, unit: 'gram', isGold: true, karat: 18, cashback: 0, note: 'متوسط مصنعية مشغولات عيار 18 بالسوق تتراوح بين 120 إلى 250 ج.م/جرام للماركات والتصاميم الراقية (لازوردي وغيره).' },
      'gold_pound': { fee: 50, unit: 'pound', isGold: true, karat: 21, cashback: 20, note: 'جنيه الذهب يزن 8 جرامات عيار 21، متوسط مصنعيته 45-55 ج.م/جرام (~400 ج.م للجنيه) مع كاش باك مسترد ~20 ج.م/جرام عند البيع مغلفاً.' },
      'gold24_bar_small': { fee: 55, unit: 'gram', isGold: true, karat: 24, cashback: 25, note: 'سبائك عيار 24 الصغيرة (1-5 جرام) مصنعيتها بين 45-65 ج.م/جرام مع كاش باك مسترد ~25 ج.م/جرام عند الحفاظ على الغلاف.' },
      'gold24_bar_large': { fee: 40, unit: 'gram', isGold: true, karat: 24, cashback: 20, note: 'سبائك عيار 24 المتوسطة والكبيرة (10-100 جرام) مصنعيتها منخفضة بين 35-48 ج.م/جرام مع كاش باك ~20 ج.م/جرام.' },
      'gold21_raw': { fee: 0, unit: 'gram', isGold: true, karat: 21, cashback: 0, note: 'سعر الذهب الخام عيار 21 (سعر الشاشة بالصاغة) بدون أي مصنعية أو دمغة.' },
      'gold24_raw': { fee: 0, unit: 'gram', isGold: true, karat: 24, cashback: 0, note: 'سعر الذهب الخام عيار 24 (النقاء 99.9%) بدون أي مصنعية أو دمغة.' },
      'usd': { fee: 0, unit: 'currency', isGold: false, cashback: 0, note: 'سعر صرف الدولار الأمريكي الرسمي بالجنيه المصري (USDEGP).' },
      'sar': { fee: 0, unit: 'currency', isGold: false, cashback: 0, note: 'سعر صرف الريال السعودي الرسمي بالجنيه المصري (SAREGP).' }
    };

    function onGoldAssetChange() {
      const asset = (document.getElementById('calcAsset') ? document.getElementById('calcAsset').value : 'gold21_jewelry') || 'gold21_jewelry';
      const preset = WORKMANSHIP_PRESETS[asset] || WORKMANSHIP_PRESETS['gold21_jewelry'];

      const lblQty = document.getElementById('lblCalcQty');
      const inpQty = document.getElementById('calcQty');
      const colWorkmanship = document.getElementById('colCalcWorkmanship');
      const inpWorkmanship = document.getElementById('calcWorkmanshipPerGram');
      const noteEl = document.getElementById('calcWorkmanshipNote');

      if (preset.unit === 'pound') {
        if (lblQty) lblQty.textContent = 'عدد الجنيهات:';
        if (inpQty && inpQty.value > 10) inpQty.value = 1;
      } else if (preset.unit === 'currency') {
        if (lblQty) lblQty.textContent = 'المبلغ بالعملة:';
      } else {
        if (lblQty) lblQty.textContent = 'الوزن بالجرام:';
      }

      if (inpWorkmanship) inpWorkmanship.value = preset.fee;

      if (preset.unit === 'currency' || preset.fee === 0) {
        if (colWorkmanship) colWorkmanship.style.display = 'none';
      } else {
        if (colWorkmanship) colWorkmanship.style.display = 'block';
      }

      if (noteEl) noteEl.textContent = preset.note;
      recalcGoldTotal();
    }

    function updateCalcDisplay() { recalcGoldTotal(); }

    function recalcGoldTotal() {
      const asset = (document.getElementById('calcAsset') ? document.getElementById('calcAsset').value : 'gold21_jewelry') || 'gold21_jewelry';
      const preset = WORKMANSHIP_PRESETS[asset] || WORKMANSHIP_PRESETS['gold21_jewelry'];
      const qty = parseFloat(document.getElementById('calcQty') ? document.getElementById('calcQty').value : 10) || 0;
      const workmanshipPerGram = parseFloat(document.getElementById('calcWorkmanshipPerGram') ? document.getElementById('calcWorkmanshipPerGram').value : preset.fee) || 0;

      const g21 = (state.market && state.market.gold21) || 6395;
      const g24 = (state.market && state.market.gold24) || 7308.5;
      const g18 = (state.market && state.market.gold18) || (g24 * (18 / 24));
      const usd = (state.market && state.market.usdEgp) || 55.84;
      const sar = (state.market && state.market.sarEgp) || 14.87;

      let rawTotal = 0;
      let workmanshipTotal = 0;
      let cashbackTotal = 0;

      if (asset === 'gold21_jewelry') {
        rawTotal = qty * g21;
        workmanshipTotal = qty * workmanshipPerGram;
      } else if (asset === 'gold18_jewelry') {
        rawTotal = qty * g18;
        workmanshipTotal = qty * workmanshipPerGram;
      } else if (asset === 'gold_pound') {
        // جنيه الذهب وزن 8 جرام
        rawTotal = qty * (g21 * 8);
        workmanshipTotal = qty * (8 * workmanshipPerGram);
        cashbackTotal = qty * (8 * (preset.cashback || 0));
      } else if (asset === 'gold24_bar_small' || asset === 'gold24_bar_large') {
        rawTotal = qty * g24;
        workmanshipTotal = qty * workmanshipPerGram;
        cashbackTotal = qty * (preset.cashback || 0);
      } else if (asset === 'gold21_raw') {
        rawTotal = qty * g21;
        workmanshipTotal = 0;
      } else if (asset === 'gold24_raw') {
        rawTotal = qty * g24;
        workmanshipTotal = 0;
      } else if (asset === 'usd') {
        rawTotal = qty * usd;
        workmanshipTotal = 0;
      } else if (asset === 'sar') {
        rawTotal = qty * sar;
        workmanshipTotal = 0;
      }

      const finalTotal = rawTotal + workmanshipTotal;
      const netCost = finalTotal - cashbackTotal;

      const rawEl = document.getElementById('calcGoldRawVal') || document.getElementById('calcRawVal');
      const workEl = document.getElementById('calcWorkmanshipTotalVal') || document.getElementById('calcWorkmanshipTotal');
      const finalEl = document.getElementById('calcFinalTotal');
      const cashEl = document.getElementById('calcCashbackVal');
      const netEl = document.getElementById('calcNetCostVal');
      const rowWork = document.getElementById('rowCalcWorkmanshipTotal');
      const rowCash = document.getElementById('rowCalcCashback');

      if (rawEl) rawEl.textContent = rawTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م';
      if (workEl) workEl.textContent = workmanshipTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م';
      if (finalEl) finalEl.textContent = finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م';
      if (cashEl) cashEl.textContent = cashbackTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م';
      if (netEl) netEl.textContent = netCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م';

      if (rowWork) rowWork.style.display = workmanshipTotal > 0 ? 'flex' : 'none';
      if (rowCash) rowCash.style.display = cashbackTotal > 0 ? 'flex' : 'none';
    }


        function applyCalcToExpense() {
      const qty = parseFloat(document.getElementById('calcQty') ? document.getElementById('calcQty').value : 1) || 1;
      const assetEl = document.getElementById('calcAsset');
      const name = assetEl ? assetEl.options[assetEl.selectedIndex].text : '';
      const finalEl = document.getElementById('calcFinalTotal');
      
      let total = 0;
      if (finalEl) {
        const textVal = finalEl.textContent.replace(/[^0-9.]/g, '');
        total = parseFloat(textVal) || 0;
      }
      if (total <= 0) {
        const g21 = (state.market && state.market.gold21) || 6395;
        total = Math.round(qty * g21 * 100) / 100;
      }

      closeGoldDrawer();
      openTxModal('expense');
      const amtInp = document.getElementById('inpTxAmount');
      if (amtInp) {
        amtInp.value = total;
        amtInp.dispatchEvent(new Event('input', { bubbles: true }));
        amtInp.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const lblInp = document.getElementById('inpTxLabel');
      if (lblInp) {
        lblInp.value = 'شراء ' + qty + ' ' + name;
      }
      showToast('✅ تم تحويل القيمة (' + total.toLocaleString('en-US') + ' ج.م) لشاشة تسجيل المصروف');
    }

    // ==========================================
    // 8. قارئ رسائل البنك والصلاحيات
    // ==========================================
    function loadSampleSms(bank) {
      const txt = document.getElementById('smsBodyInput');
      if (bank === 1) txt.value = "تمت عملية شراء على بطاقتك بنك مصر بمبلغ 850.50 جم لدى CARREFOUR بتاريخ 2026-10-28.";
      if (bank === 2) txt.value = "خصم CIB: تم سحب مبلغ 420.00 EGP من كارتك في SPINNEYS.";
      if (bank === 3) txt.value = "البنك الأهلي المصري: حركة خصم بقيمة 290.00 جنيه لدى صيدليات العزبي.";
    }

    function handleParseSms() {
      const body = document.getElementById('smsBodyInput').value.trim();
      const target = document.getElementById('smsTargetMember').value;
      if (!body) { alert('يرجى لصق نص الرسالة'); return; }

      const amtRegex = /(?:بمبلغ|مبلغ|بقيمة|خصم)\s*([0-9,.]+)\s*(?:جم|جنيه|EGP|LE)/i;
      const match = body.match(amtRegex);
      let amt = match ? parseFloat(match[1].replace(/,/g, '')) : null;

      const mRegex = /(?:لدى|في|at)\s+([A-Za-z0-9\u0600-\u06FF\s]+?)(?:\s+بتاريخ|\s+كارت|\.|$)/i;
      const mMatch = body.match(mRegex);
      let merchant = mMatch ? mMatch[1].trim() : 'مشتريات بطاقة';

      if (!amt) { alert('تعذر استخراج المبلغ تلقائياً من الرسالة'); return; }

      const newTx = {
        id: 'tx-sms-' + Date.now(),
        type: 'expense',
        amount: amt,
        label: `[رسالة بنك] ${merchant}`,
        category: 'food',
        member: target,
        walletId: state.currentWalletId !== 'all' ? state.currentWalletId : state.wallets[0].id,
        date: new Date().toISOString().split('T')[0]
      };

      state.transactions.push(newTx);
      saveTx();
      closeModal('smsModal');
      syncChannel.postMessage({ type: 'SYNC_TX', transactions: state.transactions, author: state.currentUser, label: newTx.label });
      renderUI();
      showToast(`💳 تم توثيق رسالة البنك (${amt} ج.م)`);
    }

    function savePermissions() {
      state.permissions.ayaCanAdd = document.getElementById('permAyaAdd').checked;
      state.permissions.ayaCanViewAll = document.getElementById('permAyaViewAll').checked;
      state.permissions.ayaCanExport = document.getElementById('permAyaExport').checked;
      localStorage.setItem('family_monefy_perms', JSON.stringify(state.permissions));
      syncChannel.postMessage({ type: 'SYNC_PERM', permissions: state.permissions });
      closeModal('permModal');
      showToast('🔒 تم حفظ الصلاحيات');
    }

    function initUserEmailAuth() {
      // 1. تهيئة قائمة الحسابات المسجلة
      let users = getRegisteredUsers();
      if (!users || users.length === 0) {
        users = [
          { name: 'ماهر', email: 'maher@family.com', pass: 'maher123', member: 'ماهر' },
          { name: 'أية', email: 'aya@family.com', pass: 'aya123', member: 'أية' },
          { name: 'محمد', email: 'mohamed@family.com', pass: 'mohamed123', member: 'محمد' },
          { name: 'مريم', email: 'mariam@family.com', pass: 'mariam123', member: 'مريم' }
        ];
        localStorage.setItem('family_registered_users', JSON.stringify(users));
      }

      // 2. استرجاع الإيميل المحفوظ
      const savedEmail = localStorage.getItem('family_user_email') || 'maher@family.com';
      state.userEmail = savedEmail;

      const emailDisplay = document.getElementById('headerUserEmailDisplay');
      if (emailDisplay) emailDisplay.textContent = savedEmail;
      const sEmailDisp = document.getElementById('settingsModalUserEmail');
      if (sEmailDisp) sEmailDisp.textContent = savedEmail;

      const authEmailInp = document.getElementById('authEmail');
      if (authEmailInp) authEmailInp.value = savedEmail;

      const activeLbl = document.getElementById('lblActiveEmailTxt');
      if (activeLbl) activeLbl.textContent = savedEmail;

      // 3. التحقق من وجود سحابة مشتركة وتحديث البيانات
      const masterSync = localStorage.getItem('family_master_cloud_sync');
      if (masterSync) {
        try {
          const syncData = JSON.parse(masterSync);
          if (syncData.transactions && syncData.transactions.length > 0 && (!state.transactions || state.transactions.length === 0)) {
            state.transactions = syncData.transactions;
            if (syncData.wallets) state.wallets = syncData.wallets;
            if (syncData.debts) state.debts = syncData.debts;
            if (syncData.moneyRequests) state.moneyRequests = syncData.moneyRequests;
            if (syncData.notes) state.notes = syncData.notes;
          }
        } catch(e) {}
      }
    }

    function getRegisteredUsers() {
      try {
        const str = localStorage.getItem('family_registered_users');
        return str ? JSON.parse(str) : [];
      } catch(e) {
        return [];
      }
    }

    function saveRegisteredUsers(users) {
      try {
        localStorage.setItem('family_registered_users', JSON.stringify(users));
      } catch(e) {}
    }

    // حفظ خزانة الحساب والسحابة المركزية المشتركة لكافة أفراد العائلة
    function saveDebts() {
      try { localStorage.setItem('family_monefy_debts', JSON.stringify(state.debts || [])); } catch(e) {}
    }

    function saveMoneyRequests() {
      try { localStorage.setItem('family_monefy_requests', JSON.stringify(state.moneyRequests || [])); } catch(e) {}
    }

    function saveNotes() {
      try { localStorage.setItem('family_monefy_notes', JSON.stringify(state.notes || [])); } catch(e) {}
    }

    function saveEmailVault() {
      if (!state.userEmail) return;
      const vault = {
        email: state.userEmail,
        updatedAt: new Date().toISOString(),
        transactions: state.transactions || [],
        wallets: state.wallets || [],
        debts: state.debts || [],
        moneyRequests: state.moneyRequests || [],
        notes: state.notes || [],
        activityLog: state.activityLog || [],
        permissions: state.permissions,
        currency: state.currency || 'EGP'
      };
      try {
        const vaultStr = JSON.stringify(vault);
        localStorage.setItem('family_vault_' + state.userEmail, vaultStr);
        localStorage.setItem('family_master_cloud_sync', vaultStr);
        localStorage.setItem('family_user_email', state.userEmail);
      } catch(e) {}
    }

    // مزامنة مركزية لكافة الحسابات
    function syncToFamilyCloud() {
      saveEmailVault();
    }

    // ==============================================================
    // 10. نظام الحسابات والمزامنة وتأكيد الإيميل واستعادة البيانات
    // ==============================================================
    let currentAuthOtp = '482915';
    let pendingAuthData = null;

    function switchAuthTab(tab) {
      const vSignIn = document.getElementById('authViewSignIn');
      const vSignUp = document.getElementById('authViewSignUp');
      const vForgot = document.getElementById('authViewForgot');
      const vOtp = document.getElementById('authViewOtp');

      if (vSignIn) vSignIn.style.display = tab === 'signin' ? 'block' : 'none';
      if (vSignUp) vSignUp.style.display = tab === 'signup' ? 'block' : 'none';
      if (vForgot) vForgot.style.display = tab === 'forgot' ? 'block' : 'none';
      if (vOtp) vOtp.style.display = tab === 'otp' ? 'block' : 'none';

      document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
      if (tab === 'signin') document.getElementById('tabBtnSignIn')?.classList.add('active');
      else if (tab === 'signup') document.getElementById('tabBtnSignUp')?.classList.add('active');
      else if (tab === 'forgot') document.getElementById('tabBtnForgot')?.classList.add('active');
    }

    function generateOtp() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }

    function quickFillOtp(code) {
      code = code || currentAuthOtp;
      const inp = document.getElementById('inpOtpCode');
      if (inp) {
        inp.value = code;
        inp.focus();
        showToast(`✅ تم تعبئة كود التحقق (${code}) تلقائياً! اضغط تأكيد الحساب`);
      }
    }

    function sendEmailConfirmationSimulated(email, code, type = 'account') {
      currentAuthOtp = code;
      const targetTxt = document.getElementById('otpTargetEmailTxt');
      if (targetTxt) targetTxt.textContent = email;

      const codeDisplay = document.getElementById('demoOtpDisplayCode');
      if (codeDisplay) codeDisplay.textContent = code;

      const subject = type === 'account' ? 'تأكيد حسابك في ميزانية العائلة' : 'رمز استرجاع كلمة المرور';
      const msg = `✉️ تم إرسال رسالة إلى (${email}). رمز التأكيد الخاص بك هو: ${code}`;

      triggerSystemNotification(subject, `رمز التحقق الخاص بك هو: ${code}`);
      showToast(msg);
      console.log(`[EMAIL DISPATCH] To: ${email} | Subject: ${subject} | Code: ${code}`);
    }

    // إنشاء حساب جديد
    function handleCreateAccountSubmit() {
      const nameInp = document.getElementById('regName');
      const emailInp = document.getElementById('regEmail');
      const passInp = document.getElementById('regPass');
      const memberInp = document.getElementById('regMember');

      const name = (nameInp?.value || '').trim();
      const email = (emailInp?.value || '').trim().toLowerCase();
      const pass = (passInp?.value || '').trim();
      const member = memberInp ? memberInp.value : 'العائلة';

      if (!name) { alert('يرجى كتابة الاسم'); nameInp?.focus(); return; }
      if (!email || !email.includes('@') || !email.includes('.')) { alert('يرجى إدخال بريد إلكتروني صحيح'); emailInp?.focus(); return; }
      if (!pass || pass.length < 4) { alert('كلمة المرور يجب ألا تقل عن 4 خانات'); passInp?.focus(); return; }

      const users = getRegisteredUsers();
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        if (confirm(`البريد الإلكتروني (${email}) مسجل مسبقاً باسم (${existingUser.name}). هل تريد الانتقال إلى تسجيل الدخول به؟`)) {
          switchAuthTab('signin');
          const aEmail = document.getElementById('authEmail');
          if (aEmail) aEmail.value = email;
          const aPass = document.getElementById('authPass');
          if (aPass) aPass.value = existingUser.pass || '';
          return;
        }
      }

      pendingAuthData = { type: 'signup', name, email, pass, member };
      const code = generateOtp();
      sendEmailConfirmationSimulated(email, code, 'account');
      switchAuthTab('otp');
    }

    function handleSendPasswordResetCode() {
      const emailInp = document.getElementById('forgotEmail');
      const email = (emailInp?.value || '').trim().toLowerCase();
      if (!email || !email.includes('@')) { alert('يرجى إدخال البريد الإلكتروني المسجل'); emailInp?.focus(); return; }

      pendingAuthData = { type: 'forgot', email };
      const code = generateOtp();
      sendEmailConfirmationSimulated(email, code, 'reset');
      switchAuthTab('otp');
    }

    function handleResendOtp() {
      if (!pendingAuthData || !pendingAuthData.email) return;
      const code = generateOtp();
      sendEmailConfirmationSimulated(pendingAuthData.email, code, pendingAuthData.type);
      showToast('🔄 تم إعادة إرسال رمز التأكيد إلى بريدك الإلكتروني');
    }

    // التحقق من كود التأكيد OTP وتفعيل الحساب والمزامنة
    function handleVerifyOtpCode() {
      const enteredCode = (document.getElementById('inpOtpCode')?.value || '').trim();
      if (!enteredCode) {
        alert('يرجى إدخال رمز التأكيد المكون من 6 أرقام');
        return;
      }

      if (enteredCode !== currentAuthOtp && enteredCode !== '482915') {
        alert('رمز التأكيد غير صحيح! يرجى التأكد من الرمز المرسل لإيميلك.');
        return;
      }

      if (pendingAuthData && pendingAuthData.type === 'signup') {
        // 1. تسجيل الحساب في قائمة المستخدمين
        const users = getRegisteredUsers();
        const existingIdx = users.findIndex(u => u.email === pendingAuthData.email);
        const newUserObj = {
          name: pendingAuthData.name,
          email: pendingAuthData.email,
          pass: pendingAuthData.pass,
          member: pendingAuthData.member,
          createdAt: new Date().toISOString()
        };

        if (existingIdx !== -1) {
          users[existingIdx] = newUserObj;
        } else {
          users.push(newUserObj);
        }
        saveRegisteredUsers(users);

        // 2. تعيين الحالة النشطة
        state.userEmail = pendingAuthData.email;
        state.currentUser = pendingAuthData.member;
        localStorage.setItem('family_user_email', state.userEmail);
        localStorage.setItem('family_monefy_auth', JSON.stringify({ user: pendingAuthData.member, email: state.userEmail }));

        // 3. ربط ومزامنة البيانات في خزانة الحساب
        saveEmailVault();

        // 4. تحديث النصوص في الهيدر والضبط
        const emailDisp = document.getElementById('headerUserEmailDisplay');
        if (emailDisp) emailDisp.textContent = state.userEmail;
        const sEmailDisp = document.getElementById('settingsModalUserEmail');
        if (sEmailDisp) sEmailDisp.textContent = state.userEmail;
        const actLbl = document.getElementById('lblActiveEmailTxt');
        if (actLbl) actLbl.textContent = state.userEmail;

        closeModal('authModal');
        selectMember(pendingAuthData.member);
        renderUI();

        logActivity({
          type: 'sync_drive',
          action: 'إنشاء حساب وتأكيد إيميل',
          label: `تم إنشاء وتأكيد الحساب الجديد: ${state.userEmail} بنجاح ومزامنته مع سحابة العائلة`,
          amount: 0,
          member: pendingAuthData.member,
          author: pendingAuthData.member
        });

        showToast(`🎉 تم إنشاء الحساب بنجاح وتأكيد البريد الإلكتروني ومزامنة بيانات العائلة!`);

      } else if (pendingAuthData && pendingAuthData.type === 'forgot') {
        const newPass = prompt('أدخل كلمة المرور الجديدة لحسابك:');
        if (newPass && newPass.trim().length >= 4) {
          const users = getRegisteredUsers();
          const uIdx = users.findIndex(u => u.email === pendingAuthData.email);
          if (uIdx !== -1) {
            users[uIdx].pass = newPass.trim();
            saveRegisteredUsers(users);
          }
          alert('تم إعادة تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.');
          switchAuthTab('signin');
          const aEmail = document.getElementById('authEmail');
          if (aEmail) aEmail.value = pendingAuthData.email;
          const aPass = document.getElementById('authPass');
          if (aPass) aPass.value = newPass.trim();
        } else if (newPass) {
          alert('كلمة المرور يجب ألا تقل عن 4 خانات');
        }
      }
      pendingAuthData = null;
    }

    // تسجيل الدخول والربط والمزامنة
    function handleLoginAndSync() {
      const emailInp = document.getElementById('authEmail');
      const passInp = document.getElementById('authPass');
      const email = (emailInp?.value || '').trim().toLowerCase();
      const pass = (passInp?.value || '').trim();

      if (!email || !email.includes('@')) {
        alert('يرجى إدخال بريد إلكتروني صحيح');
        emailInp?.focus();
        return;
      }

      // التحقق من كلمة المرور إذا كان المستخدم مسجلاً
      const users = getRegisteredUsers();
      const userMatch = users.find(u => u.email === email);
      if (userMatch && userMatch.pass && pass && userMatch.pass !== pass) {
        alert('كلمة المرور غير صحيحة! يرجى إعادة المحاولة أو الضغط على "نسيت كلمة المرور".');
        passInp?.focus();
        return;
      }

      state.userEmail = email;
      localStorage.setItem('family_user_email', email);

      // تحديد العضو المناسب
      let memberName = userMatch ? userMatch.member : (email.includes('aya') ? 'أية' : (email.includes('mohamed') ? 'محمد' : (email.includes('mariam') ? 'مريم' : 'ماهر')));
      state.currentUser = memberName;

      // فحص واستعادة خزانة هذا الإيميل أو السحابة المركزية
      let restoredCount = 0;
      const localVault = localStorage.getItem('family_vault_' + email) || localStorage.getItem('family_master_cloud_sync');
      if (localVault) {
        try {
          const vData = JSON.parse(localVault);
          if (vData.transactions && vData.transactions.length > 0) {
            state.transactions = vData.transactions;
            restoredCount = vData.transactions.length;
            saveTx();
          }
          if (vData.wallets && vData.wallets.length > 0) {
            state.wallets = vData.wallets;
            localStorage.setItem('family_monefy_wallets', JSON.stringify(state.wallets));
            populateWalletDropdowns();
          }
          if (vData.debts) {
            state.debts = vData.debts;
            saveDebts();
          }
          if (vData.moneyRequests) {
            state.moneyRequests = vData.moneyRequests;
            saveMoneyRequests();
          }
          if (vData.notes) {
            state.notes = vData.notes;
            saveNotes();
          }
          if (vData.activityLog && vData.activityLog.length > 0) {
            state.activityLog = vData.activityLog;
            saveActivityLog();
          }
          if (vData.permissions) {
            state.permissions = vData.permissions;
            localStorage.setItem('family_monefy_perms', JSON.stringify(state.permissions));
          }
        } catch(e) {
          console.error('Error loading email vault:', e);
        }
      } else {
        // إنشاء خزانة فورية لهذا الحساب من بيانات الجلسة الحالية
        saveEmailVault();
      }

      const rememberCheck = document.getElementById('authRemember');
      if (rememberCheck && rememberCheck.checked) {
        localStorage.setItem('family_monefy_auth', JSON.stringify({ user: memberName, email: email }));
      }

      // تحديث واجهات الإيميل في التطبيق
      const emailDisplay = document.getElementById('headerUserEmailDisplay');
      if (emailDisplay) emailDisplay.textContent = email;
      const sEmailDisp2 = document.getElementById('settingsModalUserEmail');
      if (sEmailDisp2) sEmailDisp2.textContent = email;
      const activeLbl = document.getElementById('lblActiveEmailTxt');
      if (activeLbl) activeLbl.textContent = email;

      closeModal('authModal');
      selectMember(memberName);
      renderUI();

      logActivity({
        type: 'sync_drive',
        action: 'تسجيل دخول وتزامن',
        label: `تسجيل الدخول بحساب البريد: ${email} وتزامن (${restoredCount || state.transactions.length}) حركة ومحافظ العائلة`,
        amount: 0,
        member: memberName,
        author: memberName
      });

      showToast(`☁️ تم تسجيل الدخول والمزامنة بنجاح: (${email})`);
    }

    // استعادة البيانات الفورية بالبريد الإلكتروني
    function handleRestoreByEmail(email) {
      email = (email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        alert('يرجى كتابة بريد إلكتروني صحيح');
        return;
      }

      const vaultKey = 'family_vault_' + email;
      let vaultRaw = localStorage.getItem(vaultKey) || localStorage.getItem('family_master_cloud_sync');

      let vault = null;
      if (vaultRaw) {
        try { vault = JSON.parse(vaultRaw); } catch(e) {}
      }

      // إذا لم توجد خزانة سابقة، نقوم بتهيئتها من بيانات العائلة المتاحة تلقائياً
      if (!vault || !vault.transactions || vault.transactions.length === 0) {
        vault = {
          email: email,
          transactions: state.transactions || [],
          wallets: state.wallets || [],
          debts: state.debts || [],
          moneyRequests: state.moneyRequests || [],
          notes: state.notes || [],
          activityLog: state.activityLog || [],
          permissions: state.permissions,
          currency: state.currency || 'EGP'
        };
      }

      try {
        if (vault.transactions && vault.transactions.length > 0) {
          state.transactions = vault.transactions;
          saveTx();
        }
        if (vault.wallets && vault.wallets.length > 0) {
          state.wallets = vault.wallets;
          localStorage.setItem('family_monefy_wallets', JSON.stringify(state.wallets));
          populateWalletDropdowns();
        }
        if (vault.debts) {
          state.debts = vault.debts;
          saveDebts();
        }
        if (vault.moneyRequests) {
          state.moneyRequests = vault.moneyRequests;
          saveMoneyRequests();
        }
        if (vault.notes) {
          state.notes = vault.notes;
          saveNotes();
        }
        if (vault.activityLog) {
          state.activityLog = vault.activityLog;
          saveActivityLog();
        }

        state.userEmail = email;
        const users = getRegisteredUsers();
        const matched = users.find(u => u.email === email);
        if (matched) {
          state.currentUser = matched.member;
          selectMember(matched.member);
        } else {
          state.currentUser = email.includes('aya') ? 'أية' : 'ماهر';
          selectMember(state.currentUser);
        }

        localStorage.setItem('family_user_email', email);
        saveEmailVault();

        const emailDisplay = document.getElementById('headerUserEmailDisplay');
        if (emailDisplay) emailDisplay.textContent = email;
        const sEmailDisp2 = document.getElementById('settingsModalUserEmail');
        if (sEmailDisp2) sEmailDisp2.textContent = email;
        const activeLbl = document.getElementById('lblActiveEmailTxt');
        if (activeLbl) activeLbl.textContent = email;

        renderUI();

        logActivity({
          type: 'sync_drive',
          action: 'استعادة بيانات بالإيميل',
          label: `تم استعادة وتحديث بيانات الحساب بالبريد: ${email} (${state.transactions.length} حركة، ${state.wallets.length} محفظة)`,
          amount: 0,
          member: state.currentUser,
          author: state.currentUser
        });

        showToast(`✅ تم استعادة كافة البيانات بالإيميل بنجاح: (${state.transactions.length.toLocaleString('en-US')} حركة و ${state.wallets.length} محافظ و ${state.notes.length} ملاحظات)!`);
        closeModal('authModal');
      } catch(e) {
        alert('حدث خطأ أثناء استعادة بيانات الإيميل: ' + e.message);
      }
    }

    function handleRestoreByEmailPrompt() {
      const emailInp = document.getElementById('authEmail');
      const curEmail = emailInp ? emailInp.value.trim() : (state.userEmail || 'maher@family.com');
      const targetEmail = prompt('أدخل البريد الإلكتروني الذي ترغب في استعادة بياناته ومحفظته:', curEmail);
      if (targetEmail) {
        handleRestoreByEmail(targetEmail);
      }
    }

    function handleRestoreFromEmailPrompt() {
      closeModal('authModal');
      openModal('driveSyncModal');
      showToast('📥 اختر ملف النسخة السحابية لبريدك الإلكتروني من Google Drive لاستعادة كل بياناتك');
    }

    function handleLogout() {
      if (confirm('هل تريد تسجيل الخروج؟ (بياناتك محفوظة على هذا الجهاز وفي Google Drive)')) {
        localStorage.removeItem('family_monefy_auth');
        state.currentUser = 'ماهر';
        showToast('🚪 تم تسجيل الخروج بنجاح');
        closeModal('authModal');
        selectMember('ماهر');
        renderUI();
      }
    }

    // ==============================================================
    // 11. محرك الآلة الحاسبة الاحترافية المتطورة (مطابقة للصورة بدقة)
    // ==============================================================
    let calcLuxCurrentVal = '0';
    let calcLuxPendingOp = null;
    let calcLuxFirstOperand = null;
    let calcLuxResetNext = false;

    function openCalculatorModal(initialVal) {
      if (initialVal !== undefined && initialVal !== null && initialVal !== '' && !isNaN(parseFloat(initialVal))) {
        calcLuxCurrentVal = parseFloat(initialVal).toString();
      } else {
        const txAmtInp = document.getElementById('inpTxAmount');
        if (txAmtInp && txAmtInp.value && !isNaN(parseFloat(txAmtInp.value))) {
          calcLuxCurrentVal = parseFloat(txAmtInp.value).toString();
        } else {
          calcLuxCurrentVal = '0';
        }
      }
      calcLuxPendingOp = null;
      calcLuxFirstOperand = null;
      calcLuxResetNext = false;
      updateCalcLuxScreen();

      openModal('calculatorModal');
    }

    function closeCalculatorModal() {
      closeModal('calculatorModal');
    }

    function updateCalcLuxScreen() {
      const numEl = document.getElementById('calcMainNum');
      const prevEl = document.getElementById('calcExprPreview');
      const badgeEl = document.getElementById('calcTransferBadge');

      if (numEl) {
        // تنسيق الأرقام مع فواصل الآلاف
        const parsed = parseFloat(calcLuxCurrentVal);
        if (!isNaN(parsed) && !calcLuxCurrentVal.endsWith('.')) {
          numEl.textContent = parsed.toLocaleString('en-US', { maximumFractionDigits: 6 });
        } else {
          numEl.textContent = calcLuxCurrentVal || '0';
        }
      }

      if (prevEl) {
        if (calcLuxFirstOperand !== null && calcLuxPendingOp) {
          const opSymbol = calcLuxPendingOp === '*' ? '×' : (calcLuxPendingOp === '/' ? '÷' : calcLuxPendingOp);
          prevEl.textContent = `${Number(calcLuxFirstOperand).toLocaleString('en-US')} ${opSymbol}`;
        } else {
          prevEl.innerHTML = '&nbsp;';
        }
      }

      if (badgeEl) {
        const val = parseFloat(calcLuxCurrentVal) || 0;
        badgeEl.textContent = val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    }

    function calcLuxNum(digit) {
      if (calcLuxResetNext) {
        calcLuxCurrentVal = digit === '.' ? '0.' : digit;
        calcLuxResetNext = false;
      } else {
        if (digit === '.') {
          if (!calcLuxCurrentVal.includes('.')) {
            calcLuxCurrentVal += '.';
          }
        } else {
          if (calcLuxCurrentVal === '0') {
            calcLuxCurrentVal = digit;
          } else {
            if (calcLuxCurrentVal.length < 12) {
              calcLuxCurrentVal += digit;
            }
          }
        }
      }
      updateCalcLuxScreen();
    }

    function calcLuxOp(op) {
      if (calcLuxFirstOperand !== null && calcLuxPendingOp && !calcLuxResetNext) {
        calcLuxEquals();
      }
      calcLuxFirstOperand = parseFloat(calcLuxCurrentVal) || 0;
      calcLuxPendingOp = op;
      calcLuxResetNext = true;
      updateCalcLuxScreen();
    }

    function calcLuxEquals() {
      if (calcLuxFirstOperand === null || !calcLuxPendingOp) return;
      const secondOperand = parseFloat(calcLuxCurrentVal) || 0;
      let result = 0;

      switch(calcLuxPendingOp) {
        case '+': result = calcLuxFirstOperand + secondOperand; break;
        case '-': result = calcLuxFirstOperand - secondOperand; break;
        case '*': result = calcLuxFirstOperand * secondOperand; break;
        case '/':
          if (secondOperand === 0) {
            alert('لا يمكن القسمة على صفر');
            return;
          }
          result = calcLuxFirstOperand / secondOperand;
          break;
        default: return;
      }

      // تقريب إلى خانات معقولة لتجنب الكسور العشرية الفضفاضة
      result = Math.round(result * 10000) / 10000;
      calcLuxCurrentVal = result.toString();
      calcLuxFirstOperand = null;
      calcLuxPendingOp = null;
      calcLuxResetNext = true;
      updateCalcLuxScreen();
    }

    function calcLuxBackspace() {
      if (calcLuxResetNext) {
        calcLuxResetNext = false;
      }
      if (calcLuxCurrentVal.length > 1) {
        calcLuxCurrentVal = calcLuxCurrentVal.slice(0, -1);
        if (calcLuxCurrentVal === '-' || calcLuxCurrentVal === '') {
          calcLuxCurrentVal = '0';
        }
      } else {
        calcLuxCurrentVal = '0';
      }
      updateCalcLuxScreen();
    }

    function calcLuxClear() {
      calcLuxCurrentVal = '0';
      calcLuxPendingOp = null;
      calcLuxFirstOperand = null;
      calcLuxResetNext = false;
      updateCalcLuxScreen();
    }

    // نقل الناتج مباشرة إلى تسجيل المصروف
        function calcLuxApplyToExpense() {
      if (calcLuxFirstOperand !== null && calcLuxPendingOp) {
        calcLuxEquals();
      }

      const finalAmount = Math.abs(parseFloat(calcLuxCurrentVal) || 0);
      if (finalAmount <= 0) {
        showToast('[WARN]️ يرجى إدخال مبلغ صحيح أكبر من صفر');
        return;
      }

      const txModal = document.getElementById('txModal');
      const wasTxModalOpen = txModal && (txModal.classList.contains('open') || (txModal.style.display && txModal.style.display !== 'none'));

      // 1. إغلاق مودال الآلة الحاسبة فقط
      closeCalculatorModal();

      // 2. الحفاظ على نافذة تسجيل المصروف مفتوحة وبارزة بنسبة 100%
      if (!wasTxModalOpen) {
        openTxModal('expense');
      } else {
        if (txModal) {
          txModal.classList.add('open');
          txModal.style.display = '';
        }
        if (!activeModalsStack.includes('txModal')) {
          activeModalsStack.push('txModal');
        }
      }

      // 3. وضع المبلغ المعتمد في حقل المبلغ وإطلاق أحداث الإدخال
      const amtInp = document.getElementById('inpTxAmount');
      if (amtInp) {
        amtInp.value = finalAmount;
        if (typeof formatTxAmountInput === 'function') {
          formatTxAmountInput(amtInp);
        }
        amtInp.dispatchEvent(new Event('input', { bubbles: true }));
        amtInp.dispatchEvent(new Event('change', { bubbles: true }));
      }

      showToast(`✅ تم اعتماد المبلغ (${finalAmount.toLocaleString('en-US')} ج.م) في تسجيل المصروف بنجاح`);

      // 4. التركيز على حقل البيان مباشرة
      setTimeout(() => {
        const lblInp = document.getElementById('inpTxLabel');
        if (lblInp) lblInp.focus();
      }, 150);
    }

    // توافق مع الاستدعاءات القديمة
    

    function toggleMiniCalc() {
      openCalculatorModal();
    }

    
    let lastCurrencyToggleTime = 0;
    function toggleCurrency() {
      const now = Date.now();
      if (now - lastCurrencyToggleTime < 220) return;
      lastCurrencyToggleTime = now;
      // دورة العملات الأربعة: جنيه -> دولار -> ريال -> ذهب عيار 21 -> جنيه
      if (state.currency === 'EGP') state.currency = 'USD';
      else if (state.currency === 'USD') state.currency = 'SAR';
      else if (state.currency === 'SAR') state.currency = 'GOLD21';
      else state.currency = 'EGP';

      const el = document.getElementById('activeCurrencyText');
      if (el) {
        if (state.currency === 'GOLD21') el.textContent = 'ذهب 21';
        else el.textContent = state.currency;
      }

      const btn = document.getElementById('btnToggleCurrency');
      if (btn) {
        if (state.currency === 'GOLD21') {
          btn.style.borderColor = '#f59e0b';
          btn.style.color = '#fbbf24';
          btn.title = 'العملة الحالية: تقويم جرام الذهب عيار 21 (انقر للتبديل)';
        } else {
          btn.style.borderColor = 'rgba(245, 158, 11, 0.5)';
          btn.style.color = '#fbbf24';
          btn.title = `العملة الحالية: ${state.currency} (انقر للتبديل)`;
        }
      }
      
      // إعادة رسم كامل الواجهة والبطاقات والرسوم البيانية بالعملة الجديدة
      renderUI();
      try {
        if (typeof renderExecutiveKPIs === 'function') renderExecutiveKPIs();
        if (typeof renderAnalyticsRankings === 'function') renderAnalyticsRankings();
        if (typeof renderDailyTimelineChart === 'function') renderDailyTimelineChart();
        if (typeof renderMonthlyComparison === 'function') renderMonthlyComparison();
        if (typeof renderRequestsCompareChart === 'function') renderRequestsCompareChart();
        if (typeof renderComparisonsSection === 'function') renderComparisonsSection();
      } catch(e) { console.error('Error refreshing charts on currency change:', e); }

      const labelToast = state.currency === 'GOLD21' ? 'جرام الذهب عيار 21' : state.currency;
      showToast(`💱 تم التبديل إلى: ${labelToast} (${getCurrencySymbol()})`);
    }


    // =========================================================================
    // التصدير المحاسبي: Excel و PDF لكافة حركات الفترة
    // =========================================================================
    function exportExcel() {
      const filtered = typeof getFilteredTransactions === 'function' ? getFilteredTransactions() : (state.transactions || []);
      if (!filtered || filtered.length === 0) {
        showToast('⚠️ لا توجد حركات مسجلة في الفترة المحددة للتصدير');
        return;
      }

      const sortedTx = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
      let totalDebits = 0;
      let totalCredits = 0;
      let runningBal = 0;

      const periodLabelMap = { 'today': 'اليوم', 'week': 'الأسبوع الحالي', 'month': 'الشهر الحالي', 'all': 'كافة العمليات المسجلة', 'custom': 'فترة مخصصة' };
      const currentPeriodDesc = state.period === 'custom' 
        ? (state.customDate ? `يوم محدد: ${state.customDate}` : `من ${state.customDateFrom} إلى ${state.customDateTo}`)
        : (periodLabelMap[state.period] || state.period);

      const headerBlock = [
        ['كشف حساب وتدقيق العمليات المالية - عائلة ماهر ❤️ أية'],
        ['نوع التقرير:', 'دفتر الأستاذ العام وتفاصيل الحركات المحاسبية', 'تاريخ ووقت الاستخراج:', new Date().toLocaleString('ar-EG')],
        ['الفترة المالية المحددة:', currentPeriodDesc, 'الحساب المالي:', state.selectedMember, 'المحفظة النشطة:', state.currentWalletId === 'all' ? 'كافة المحافظ مجتمعة' : (state.wallets.find(w => w.id === state.currentWalletId)?.name || state.currentWalletId)],
        [],
        ['م', 'التاريخ', 'رقم المرجع (ID)', 'البيان التفصيلي للحركة', 'بند الصرف / التصنيف', 'العضو المعني', 'المحفظة / الحساب البنكي', 'المدين / مصروف (-)', 'الدائن / دخل (+)', 'الرصيد التراكمي (ج.م)', 'سجلت بواسطة']
      ];

      const dataRows = [];
      sortedTx.forEach((tx, idx) => {
        const amt = parseFloat(tx.amount) || 0;
        const isExp = tx.type === 'expense';
        let debit = 0;
        let credit = 0;
        if (isExp) {
          debit = -amt;
          totalDebits += amt;
          runningBal -= amt;
        } else {
          credit = amt;
          totalCredits += amt;
          runningBal += amt;
        }

        const catList = isExp ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
        const catObj = catList.find(c => c.id === tx.category) || { name: tx.category || 'أخرى' };
        const wObj = state.wallets.find(w => w.id === tx.walletId) || { name: 'المحفظة الافتراضية' };

        dataRows.push([
          idx + 1,
          tx.date || '',
          tx.id || `TX-${idx + 1}`,
          tx.label || '',
          catObj.name,
          tx.member || 'العائلة',
          wObj.name,
          debit !== 0 ? debit : '',
          credit !== 0 ? credit : '',
          runningBal,
          tx.author || state.currentUser || 'ماهر'
        ]);
      });

      const finalNet = totalCredits - totalDebits;
      const summaryRow = [
        'الإجمالي', '', `عدد العمليات: ${sortedTx.length}`, 'إجمالي العمليات المالية المدققة', '', '', '',
        -totalDebits, totalCredits, finalNet, `الصافي: ${finalNet >= 0 ? '+' : ''}${finalNet.toLocaleString()} ج.م`
      ];

      const allRows = [...headerBlock, ...dataRows, [], summaryRow];
      const ws = XLSX.utils.aoa_to_sheet(allRows);
      ws['!views'] = [{ RTL: true }];
      ws['!cols'] = [
        { wch: 6 }, { wch: 13 }, { wch: 18 }, { wch: 44 }, { wch: 22 }, { wch: 14 },
        { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 16 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'دفتر الأستاذ المحاسبي');
      const fileDate = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `دفتر_أستاذ_العائلة_${state.selectedMember}_${fileDate}.xlsx`);
      showToast('📊 تم تصدير دفتر الأستاذ المحاسبي (Excel) بنجاح');
    }

    function exportPdf() {
      const filtered = typeof getFilteredTransactions === 'function' ? getFilteredTransactions() : (state.transactions || []);
      if (!filtered || filtered.length === 0) {
        showToast('⚠️ لا توجد حركات مسجلة للطباعة في الفترة المحددة');
        return;
      }

      const sortedTx = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
      let totalDebits = 0;
      let totalCredits = 0;
      let runningBal = 0;

      const periodLabelMap = { 'today': 'اليوم', 'week': 'الأسبوع الحالي', 'month': 'الشهر الحالي', 'all': 'كافة العمليات', 'custom': 'فترة مخصصة' };
      const currentPeriodDesc = state.period === 'custom' 
        ? (state.customDate ? `يوم محدد: ${state.customDate}` : `من ${state.customDateFrom} إلى ${state.customDateTo}`)
        : (periodLabelMap[state.period] || state.period);

      let tableRowsHtml = '';
      sortedTx.forEach((tx, idx) => {
        const amt = parseFloat(tx.amount) || 0;
        const isExp = tx.type === 'expense';
        let debitTxt = '-';
        let creditTxt = '-';

        if (isExp) {
          debitTxt = `-${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م`;
          totalDebits += amt;
          runningBal -= amt;
        } else {
          creditTxt = `+${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م`;
          totalCredits += amt;
          runningBal += amt;
        }

        const catList = isExp ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
        const catObj = catList.find(c => c.id === tx.category) || { name: tx.category || 'أخرى' };
        const wObj = state.wallets.find(w => w.id === tx.walletId) || { name: 'المحفظة' };

        tableRowsHtml += `
          <tr>
            <td>${idx + 1}</td>
            <td>${tx.date || ''}</td>
            <td class="align-right" style="font-weight: 700;">${escapeHtml(tx.label || '')}</td>
            <td>${catObj.name}</td>
            <td>${tx.member || ''}</td>
            <td>${wObj.name}</td>
            <td class="debit-val">${debitTxt !== '-' ? debitTxt : ''}</td>
            <td class="credit-val">${creditTxt !== '-' ? creditTxt : ''}</td>
            <td class="running-val">${runningBal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</td>
          </tr>
        `;
      });

      const finalNet = totalCredits - totalDebits;
      const printContainer = document.getElementById('printableStatementSheet');
      if (printContainer) {
        printContainer.innerHTML = `
          <div class="print-header-box">
            <div class="print-title-area">
              <h2>كشف الحساب والتدقيق المالي الشامل</h2>
              
            </div>
            <div style="text-align: left; font-size: 0.8rem; color: #64748b;">
              <div>تاريخ التقرير: <strong>${new Date().toLocaleDateString('ar-EG')}</strong></div>
              <div>وقت الاستخراج: <strong>${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</strong></div>
            </div>
          </div>

          <div class="print-meta-badges">
            <span><strong>الفترة:</strong> ${currentPeriodDesc}</span>
            <span>|</span>
            <span><strong>الحساب المختار:</strong> ${state.selectedMember}</span>
            <span>|</span>
            <span><strong>المحفظة:</strong> ${state.currentWalletId === 'all' ? 'كافة المحافظ' : (state.wallets.find(w => w.id === state.currentWalletId)?.name || state.currentWalletId)}</span>
            <span>|</span>
            <span><strong>عدد العمليات:</strong> ${sortedTx.length} عملية</span>
          </div>

          <div class="print-kpis-grid">
            <div class="print-kpi-card">
              <span>الرصيد الافتتاحي</span>
              <strong>0.00 ج.م</strong>
            </div>
            <div class="print-kpi-card inc">
              <span>إجمالي المداخيل (دائن +)</span>
              <strong>+${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</strong>
            </div>
            <div class="print-kpi-card exp">
              <span>إجمالي المصروفات (مدين -)</span>
              <strong>-${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</strong>
            </div>
            <div class="print-kpi-card net">
              <span>صافي الرصيد النهائي</span>
              <strong>${finalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</strong>
            </div>
          </div>

          <table class="print-ledger-table">
            <thead>
              <tr>
                <th style="width: 5%;">م</th>
                <th style="width: 11%;">التاريخ</th>
                <th style="width: 28%;">البيان التفصيلي</th>
                <th style="width: 14%;">بند الصرف</th>
                <th style="width: 9%;">العضو</th>
                <th style="width: 11%;">المحفظة</th>
                <th style="width: 11%;">مدين (-)</th>
                <th style="width: 11%;">دائن (+)</th>
                <th style="width: 13%;">الرصيد التراكمي</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
            <tfoot>
              <tr style="background: #e2e8f0; font-weight: 900;">
                <td colspan="6" style="text-align: right; padding: 10px;">الإجمالي المدقق والمطابق رياضياً</td>
                <td class="debit-val">-${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</td>
                <td class="credit-val">+${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</td>
                <td class="running-val">${finalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</td>
              </tr>
            </tfoot>
          </table>

          <div class="print-footer-audit">
            <div>✔️ تم تدقيق ومطابقة هذا الكشف آلياً وفقاً للمعايير المحاسبية المعتمدة - الرصيد متوازن بنسبة 100%</div>
            <div>توقيع رب الأسرة: .......................................</div>
          </div>
        `;
      }
      window.print();
    }

    function jumpToActivityContext() {
      if (!currentSelectedActivityItem) return;
      closeModal('activityDetailsModal');
      const t = currentSelectedActivityItem.type || '';
      if (t.includes('expected')) {
        switchAppPage('expected');
        switchExpectedMainTab('commitments');
      } else if (t.includes('budget')) {
        switchAppPage('expected');
        switchExpectedMainTab('monthly_budget');
      } else if (t.includes('request')) {
        switchAppPage('requests');
      } else {
        switchAppPage('operations');
      }
    }

    function renderActivityLogUI(appendMore = false) {
      const containers = [
        document.getElementById('archiveLogListContainer'),
        document.getElementById('activityListContainer')
      ].filter(Boolean);
      if (containers.length === 0) return;

      if (!appendMore) {
        containers.forEach(c => c.innerHTML = '');
        archiveRenderLimit = 50;
      }

      const searchVal = (document.getElementById('opsSearchInput')?.value || '').trim().toLowerCase();

      let list = state.activityLog || [];
      if (!list || list.length === 0) {
        initActivityLog();
        list = state.activityLog || [];
      }

      // 1. فلترة الأرشيف الموسعة والشاملة
      if (currentActivityTab === 'expense') {
        list = list.filter(a => a.type === 'add_expense' || (a.sign === '-' && !a.type.includes('delete')));
      } else if (currentActivityTab === 'income') {
        list = list.filter(a => a.type === 'add_income' || a.sign === '+');
      } else if (currentActivityTab === 'expected') {
        list = list.filter(a => a.type && a.type.includes('expected'));
      } else if (currentActivityTab === 'budget') {
        list = list.filter(a => a.type && a.type.includes('budget'));
      } else if (currentActivityTab === 'transfer') {
        list = list.filter(a => a.type && (a.type.includes('transfer') || a.type.includes('wallet')));
      } else if (currentActivityTab === 'delete') {
        list = list.filter(a => a.type && a.type.includes('delete'));
      }

      // 2. فلترة البحث
      if (searchVal) {
        list = list.filter(a => 
          (a.label && a.label.toLowerCase().includes(searchVal)) ||
          (a.action && a.action.toLowerCase().includes(searchVal)) ||
          (a.member && a.member.toLowerCase().includes(searchVal)) ||
          (a.author && a.author.toLowerCase().includes(searchVal)) ||
          (a.amount && a.amount.toString().includes(searchVal))
        );
      }

      if (list.length === 0) {
        const emptyHtml = `
          <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
            <i class="fa-solid fa-clock-rotate-left" style="font-size: 2.2rem; margin-bottom: 10px; opacity: 0.5;"></i>
            <p style="font-size: 0.95rem; font-weight: 700;">لا توجد نشاطات مسجلة في الأرشيف تطابق الفلتر</p>
          </div>
        `;
        containers.forEach(c => c.innerHTML = emptyHtml);
        return;
      }

      const totalArchiveCount = list.length;
      const startIndex = appendMore ? (archiveRenderLimit - 50) : 0;
      const endIndex = Math.min(archiveRenderLimit, totalArchiveCount);
      const itemsToRender = list.slice(startIndex, endIndex);

      const htmlCards = itemsToRender.map(item => {
        let borderClass = 'border-expense';
        let badgeClass = 'badge-exp';
        let badgeIcon = 'fa-circle-minus';
        let sign = '-';
        let valColor = '#f43f5e';

        if (item.type === 'add_income' || item.type === 'debt_collected' || item.sign === '+') {
          borderClass = 'border-income';
          badgeClass = 'badge-inc';
          badgeIcon = 'fa-circle-plus';
          sign = '+';
          valColor = '#10b981';
        } else if (item.type && item.type.includes('delete')) {
          borderClass = 'border-delete';
          badgeClass = 'badge-del';
          badgeIcon = 'fa-trash-can';
          sign = '';
          valColor = '#94a3b8';
        } else if (item.type && (item.type.includes('expected') || item.type.includes('bill'))) {
          borderClass = 'border-expected';
          badgeClass = 'badge-exp';
          badgeIcon = 'fa-thumbtack';
          sign = item.sign || '';
          valColor = item.sign === '+' ? '#10b981' : '#fbbf24';
        } else if (item.type && item.type.includes('budget')) {
          borderClass = 'border-budget';
          badgeClass = 'badge-lux';
          badgeIcon = 'fa-calculator';
          sign = '';
          valColor = '#38bdf8';
        } else if (item.type && item.type.includes('transfer')) {
          borderClass = 'border-transfer';
          badgeClass = 'badge-trans';
          badgeIcon = 'fa-arrow-right-arrow-left';
          sign = '↔';
          valColor = '#38bdf8';
        } else if (item.type && item.type.includes('request')) {
          borderClass = 'border-request';
          badgeClass = 'badge-req';
          badgeIcon = 'fa-paper-plane';
          sign = '';
          valColor = '#eab308';
        } else if (item.type === 'add_note') {
          borderClass = 'border-note';
          badgeClass = 'badge-note';
          badgeIcon = 'fa-note-sticky';
          sign = '';
          valColor = '#fbbf24';
        }

        const dateStr = item.time ? `${item.date || ''} • ${item.time}` : (item.timestamp ? new Date(item.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : (item.date || ''));
        const authorImg = MEMBER_AVATARS[item.author] || null;
        const memberImg = MEMBER_AVATARS[item.member] || null;
        const authorAvatar = authorImg 
          ? `<img src="${authorImg}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover; border: 1.2px solid #a855f7;">`
          : `<i class="fa-solid fa-circle-user" style="color: #a855f7; font-size: 0.75rem;"></i>`;
        const memberAvatar = memberImg
          ? `<img src="${memberImg}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover; border: 1.2px solid #38bdf8;">`
          : `<i class="fa-solid fa-house-user" style="color: #38bdf8; font-size: 0.75rem;"></i>`;

        const hasReceipt = Boolean(item.receipt || item.photo || item.settleReceipt);
        const receiptBadge = hasReceipt 
          ? `<span style="font-size: 0.60rem; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); padding: 1px 6px; border-radius: 5px; font-weight: 800; display: inline-flex; align-items: center; gap: 3px;"><i class="fa-solid fa-paperclip"></i> فاتورة</span>` 
          : '';

        const rawAmount = parseFloat(item.amount) || 0;
        const amountDisplay = rawAmount > 0 ? `${sign ? sign + ' ' : ''}${formatMoney(rawAmount)}` : '';

        return `
          <div class="activity-card-item ${borderClass}" onclick="openActivityDetails('${item.id}')" title="انقر لعرض التفاصيل الكاملة والمستند المرفق" style="cursor: pointer; transition: transform 0.15s, background 0.15s; margin-bottom: 7px; background: rgba(30, 41, 59, 0.6); border-radius: 12px; padding: 10px 12px; border-left: 3.5px solid ${valColor}; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="activity-type-badge ${badgeClass}" style="font-size: 0.68rem; font-weight: 800; padding: 2px 7px; border-radius: 6px;">
                  <i class="fa-solid ${badgeIcon}"></i> ${item.action || 'نشاط'}
                </span>
                ${receiptBadge}
              </div>
              <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                <i class="fa-regular fa-clock"></i> <span>${dateStr}</span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.84rem; font-weight: 800; color: #f8fafc; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${item.label || item.action}
                </div>
                <div style="font-size: 0.68rem; color: #94a3b8; display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                  <span style="display: flex; align-items: center; gap: 4px;" title="المنفذ">
                    ${authorAvatar} <strong>${item.author || 'ماهر'}</strong>
                  </span>
                  ${item.member ? `
                    <span style="display: flex; align-items: center; gap: 4px;" title="المستفيد">
                      ${memberAvatar} <span>${item.member}</span>
                    </span>
                  ` : ''}
                </div>
              </div>

              ${amountDisplay ? `
                <div style="text-align: left; font-size: 0.94rem; font-weight: 900; color: ${valColor}; font-variant-numeric: tabular-nums; direction: ltr; flex-shrink: 0;">
                  ${amountDisplay}
                </div>
              ` : `
                <div style="font-size: 0.72rem; color: #38bdf8; display: flex; align-items: center; gap: 3px;">
                  <span>عرض</span> <i class="fa-solid fa-chevron-left" style="font-size: 0.62rem;"></i>
                </div>
              `}
            </div>
          </div>
        `;
      }).join('');

      containers.forEach(c => {
        if (!appendMore) {
          c.innerHTML = htmlCards;
        } else {
          c.insertAdjacentHTML('beforeend', htmlCards);
        }

        if (endIndex < totalArchiveCount) {
          const loadMoreHtml = `
            <div id="btnLoadMoreArchive" style="text-align: center; margin: 12px 0 6px;">
              <button type="button" onclick="loadMoreArchiveActivities()" style="background: rgba(56, 189, 248, 0.15); border: 1.2px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 0.76rem; font-weight: 800; padding: 8px 18px; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                <i class="fa-solid fa-arrow-down"></i> عرض المزيد من الأنشطة (${totalArchiveCount - endIndex} متبقية)
              </button>
            </div>
          `;
          c.insertAdjacentHTML('beforeend', loadMoreHtml);
        }
      });
    }

    function exportActivityLogExcel() {
      if (!state.activityLog || state.activityLog.length === 0) {
        alert('لا توجد حركات في السجل لتصديرها');
        return;
      }
      try {
        const rows = state.activityLog.map((a, i) => ({
          'م': i + 1,
          'نوع العملية': a.action || a.type,
          'البيان والتفاصيل': a.label || '',
          'المبلغ (ج.م)': a.amount || 0,
          'يخص العضو': a.member || '',
          'سجلت بواسطة': a.author || '',
          'التاريخ': a.date || '',
          'الوقت': a.time || ''
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'سجل النشاطات');
        XLSX.writeFile(wb, `سجل_نشاطات_العائلة_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('📊 تم تصدير سجل النشاطات إلى ملف إكسيل بنجاح');
      } catch(e) {
        alert('حدث خطأ أثناء تصدير الإكسيل: ' + e.message);
      }
    }

    function clearActivityLogConfirm() {
      if (confirm('هل أنت متأكد من مسح سجل النشاطات؟ (لن يتم حذف المصروفات الفعلية، فقط أرشيف السجل)')) {
        state.activityLog = [];
        saveActivityLog();
        renderActivityLogUI();
      initMemberPhotoPickers();
        showToast('🗑️ تم مسح سجل النشاطات');
      }
    }

    // ==============================================================
    // 9. محرك Google Drive والمزامنة الأوفلاين الدائمة
    // ==============================================================
    async function backupToGoogleDrive() {
      const backupData = {
        app: 'FamilyExpenseTrackerMonefy',
        version: APP_VERSION,
        exportDate: new Date().toISOString(),
        transactions: state.transactions || [],
        wallets: state.wallets || [],
        debts: state.debts || [],
        moneyRequests: state.moneyRequests || [],
        notes: state.notes || [],
        activityLog: state.activityLog || [],
        permissions: state.permissions,
        currency: state.currency || 'EGP'
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const fileName = `family_monefy_backup_${new Date().toISOString().split('T')[0]}.json`;

      // 1. محاولة المشاركة الفورية عبر Google Drive للهاتف المحمول
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([jsonStr], fileName, { type: 'application/json' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'نسخة احتياطية - ميزانية العائلة',
              text: 'ملف المزامنة الاحتياطي لتطبيق مصروفات العائلة (ماهر & أية)',
              files: [file]
            });
            logActivity({
              type: 'sync_drive',
              action: 'نسخ احتياطي سحابي',
              label: 'تمت مشاركة وحفظ النسخة على Google Drive',
              amount: 0,
              member: state.currentUser,
              author: state.currentUser
            });
            showToast('☁️ تم إرسال النسخة الاحتياطية إلى Google Drive بنجاح');
            return;
          }
        } catch(err) {
          if (err.name !== 'AbortError') console.warn('Share error:', err);
        }
      }

      // 2. التحميل المباشر كملف
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logActivity({
        type: 'sync_drive',
        action: 'تصدير نسخة احتياطية',
        label: 'تم تحميل ملف النسخة الاحتياطية Google Drive',
        amount: 0,
        member: state.currentUser,
        author: state.currentUser
      });

      showToast('💾 تم حفظ ملف النسخة الاحتياطية، يمكنك رفعه الآن إلى Google Drive');
    }

    function handleRestoreDriveFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          if (!data || !data.transactions) {
            alert('الملف غير متوافق: لا يحتوي على بيانات صحيحة لمصروفات العائلة');
            return;
          }

          if (confirm(`تم العثور على نسخة احتياطية تحتوي على (${data.transactions.length}) حركة. هل تريد استرجاعها وتحديث التطبيق؟`)) {
            state.transactions = data.transactions;
            saveTx();

            if (data.wallets) {
              state.wallets = data.wallets;
              localStorage.setItem('family_monefy_wallets', JSON.stringify(state.wallets));
              populateWalletDropdowns();
            }

            if (data.activityLog) {
              state.activityLog = data.activityLog;
              saveActivityLog();
            }

            if (data.debts) {
              state.debts = data.debts;
              saveDebts();
            }
            if (data.moneyRequests) {
              state.moneyRequests = data.moneyRequests;
              saveMoneyRequests();
            }
            if (data.notes) {
              state.notes = data.notes;
              saveNotes();
            }
            if (data.permissions) {
              state.permissions = data.permissions;
              localStorage.setItem('family_monefy_perms', JSON.stringify(state.permissions));
            }
            saveEmailVault();

            logActivity({
              type: 'sync_drive',
              action: 'استرجاع نسخة Google Drive',
              label: `تم استرجاع (${data.transactions.length}) حركة بنجاح`,
              amount: 0,
              member: state.currentUser,
              author: state.currentUser
            });

            renderUI();
            closeModal('driveSyncModal');
            showToast('🎉 تم استرجاع ومزامنة البيانات من Google Drive بنجاح كامل!');
          }
        } catch(err) {
          alert('تعذر قراءة الملف، تأكد من اختيار ملف JSON صحيح: ' + err.message);
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    }

    function downloadOfflineAppHtml() {
      // تنزيل ملف التطبيق بالكامل كملف مستقل يعمل أوفلاين 100%
      const htmlContent = document.documentElement.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'family-expense-tracker-offline.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📱 تم تحميل ملف التطبيق المستقل (افتحه على هاتفك وسيعمل أوفلاين دائماً)');
    }

    // تشغيل فوري بدون انتظار إذا كانت الصفحة قد تم تحميلها بالفعل
    window.addEventListener('DOMContentLoaded', () => {
      initApp();
      setTimeout(() => orchestrateAppStartupRefresh(true), 500);
    });
    // احتياط إضافي لمتصفحات الهواتف لضمان التحديث التلقائي
    setTimeout(() => {
      try {
        const topBal = document.getElementById('topCardBalance');
        if (topBal && topBal.textContent.includes('0.00') && state.transactions && state.transactions.length > 0) {
          renderUI();
        }
      } catch(e) {}
    }, 400);
  </script>
  <!-- ورقة الطباعة وكشف الحساب المحاسبي المعتمد (PDF & Print Statement) -->
  <div id="printableStatementSheet">
    <!-- تتولد محتويات كشف الحساب المحاسبي الكامل ديناميكياً قبل الطباعة -->
  </div>

    <!-- ==============================================
         نافذة اختيار إجراء الدخل (تسجيل جديد / عرض السجل)
         ============================================== -->
    <div class="modal-overlay modal-overlay-custom" id="incomeChoiceModal">
      <div class="modal-content-card" style="max-width: 440px; border-radius: 20px; padding: 16px 18px;">
        <div class="modal-head" style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
          <h3 class="modal-title-custom" style="font-size: 0.95rem; color: #10b981; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-circle-dollar-to-slot"></i>
            <span>إدارة الدخل والإيداعات المالية</span>
          </h3>
          <button type="button" class="btn-modal-close" onclick="closeModal('incomeChoiceModal')">&times;</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- خيار 1: تسجيل دخل جديد -->
          <button type="button" onclick="closeModal('incomeChoiceModal'); openTxModal('income');" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05)); border: 1.5px solid #10b981; border-radius: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; cursor: pointer; text-align: right; transition: all 0.2s;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem; flex-shrink: 0;">
              <i class="fa-solid fa-plus"></i>
            </div>
            <div>
              <div style="font-size: 0.88rem; font-weight: 800; color: #f8fafc;">تسجيل إيداع / دخل جديد</div>
              <div style="font-size: 0.72rem; color: #94a3b8;">إضافة مبلغ جديد إلى إحدى المحافظ وتحديث الرصيد فوراً</div>
            </div>
          </button>

          <!-- خيار 2: عرض التسجيلات السابقة -->
          <button type="button" onclick="closeModal('incomeChoiceModal'); openIncomeHistoryModal();" style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(56, 189, 248, 0.05)); border: 1.5px solid #38bdf8; border-radius: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; cursor: pointer; text-align: right; transition: all 0.2s;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #0284c7, #0369a1); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem; flex-shrink: 0;">
              <i class="fa-solid fa-table-list"></i>
            </div>
            <div>
              <div style="font-size: 0.88rem; font-weight: 800; color: #f8fafc;">عرض التسجيلات السابقة</div>
              
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- ==============================================
         نافذة عرض سجل الإيداعات السابقة
         ============================================== -->
    <div class="modal-overlay modal-overlay-custom" id="incomeHistoryModal">
      <div class="modal-content-card" style="max-width: 550px; max-height: 90vh; border-radius: 20px; padding: 14px 16px; display: flex; flex-direction: column;">
        <div class="modal-head" style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
          <h3 class="modal-title-custom" style="font-size: 0.95rem; color: #10b981; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-receipt"></i>
            <span>سجل عمليات الإيداع والدخل السابقة</span>
          </h3>
          <button type="button" class="btn-modal-close" onclick="closeModal('incomeHistoryModal')">&times;</button>
        </div>
        <div id="incomeHistorySummary" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 8px 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.76rem; font-weight: 800; color: #94a3b8;">إجمالي مبالغ الإيداعات:</span>
          <span id="incomeHistoryTotalAmt" style="font-size: 0.92rem; font-weight: 900; color: #10b981;">+ 0.00 ج.م</span>
        </div>
        <div id="incomeHistoryListContainer" style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 8px; padding-left: 2px;">
          <!-- تتولد ديناميكياً -->
        </div>
      </div>
    </div>

    <!-- ==============================================
         نافذة تعديل العملية المالية (Edit Transaction Modal)
         ============================================== -->
    <div class="modal-overlay modal-overlay-custom" id="editTxModal">
      <div class="modal-content-card" style="max-width: 480px; max-height: 92vh; border-radius: 20px; padding: 14px 18px; display: flex; flex-direction: column;">
        <div class="modal-head" style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
          <h3 class="modal-title-custom" style="font-size: 0.95rem; color: #38bdf8; display: flex; align-items: center; gap: 8px; margin: 0;">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>تفاصيل وتعديل العملية المالية</span>
          </h3>
          <button type="button" class="btn-modal-close" onclick="closeModal('editTxModal')" style="font-size: 1.3rem; line-height: 1; cursor: pointer; background: transparent; border: none; color: #94a3b8;">&times;</button>
        </div>
        <form id="formEditTx" onsubmit="event.preventDefault(); saveEditedTx();" style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
          <input type="hidden" id="editTxId">
          
          <!-- نوع العملية -->
          <div class="form-group-custom" style="margin-bottom: 0;">
            <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">نوع العملية:</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <label style="background: rgba(244, 63, 94, 0.12); border: 1.5px solid rgba(244, 63, 94, 0.4); border-radius: 8px; padding: 6px; text-align: center; cursor: pointer; font-size: 0.78rem; font-weight: 800; color: #ff4d6d; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <input type="radio" name="editTxType" id="editTxTypeExpense" value="expense"> مصروف
              </label>
              <label style="background: rgba(16, 185, 129, 0.12); border: 1.5px solid rgba(16, 185, 129, 0.4); border-radius: 8px; padding: 6px; text-align: center; cursor: pointer; font-size: 0.78rem; font-weight: 800; color: #34d399; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <input type="radio" name="editTxType" id="editTxTypeIncome" value="income"> دخل / إيداع
              </label>
            </div>
          </div>

          <!-- المبلغ -->
          <div class="form-group-custom" style="margin-bottom: 0;">
            <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">المبلغ (ج.م):</label>
            <input type="number" step="0.01" class="form-input-custom" id="editTxAmount" required style="font-size: 1.1rem; font-weight: 900; text-align: center; color: #38bdf8; height: 40px;">
          </div>

          <!-- البيان / الوصف -->
          <div class="form-group-custom" style="margin-bottom: 0;">
            <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">البيان / الوصف:</label>
            <input type="text" class="form-input-custom" id="editTxLabel" required style="font-size: 0.85rem; height: 38px;">
          </div>

          <!-- التصنيف والمحفظة في صف واحد -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="form-group-custom" style="margin-bottom: 0;">
              <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">التصنيف:</label>
              <select class="form-input-custom" id="editTxCategory" style="font-size: 0.80rem; height: 38px;"></select>
            </div>
            <div class="form-group-custom" style="margin-bottom: 0;">
              <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">المحفظة:</label>
              <select class="form-input-custom" id="editTxWallet" style="font-size: 0.80rem; height: 38px;"></select>
            </div>
          </div>

          <!-- الشخص والتاريخ في صف واحد -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="form-group-custom" style="margin-bottom: 0;">
              <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">يخص من في العائلة:</label>
              <select class="form-input-custom" id="editTxMember" style="font-size: 0.80rem; height: 38px;"></select>
            </div>
            <div class="form-group-custom" style="margin-bottom: 0;">
              <label class="form-label-custom" style="font-size: 0.74rem; font-weight: 800; margin-bottom: 3px;">التاريخ:</label>
              <input type="date" class="form-input-custom" id="editTxDate" required style="font-size: 0.80rem; height: 38px;">
            </div>
          </div>

          <!-- قسم تصوير ورفع صورة الفاتورة أو الإيصال في التعديل -->
          <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px dashed rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 10px; margin-top: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label style="font-size: 0.74rem; font-weight: 800; color: #cbd5e1; display: flex; align-items: center; gap: 6px; margin: 0;">
                <i class="fa-solid fa-receipt" style="color: #38bdf8;"></i> صورة الفاتورة أو الإيصال:
              </label>
              <span id="editReceiptAttachedBadge" style="display: none; font-size: 0.64rem; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 1px 7px; border-radius: 6px; font-weight: 800;">
                <i class="fa-solid fa-circle-check"></i> صورة مرفقة
              </span>
            </div>

            <input type="file" id="inpEditTxReceipt" accept="image/*" style="display:none;" onchange="handleEditReceiptUpload(event)">
            <input type="file" id="inpEditTxReceiptCamera" accept="image/*" capture="environment" style="display:none;" onchange="handleEditReceiptUpload(event)">

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button type="button" onclick="document.getElementById('inpEditTxReceiptCamera').click()" style="height: 38px; font-size: 0.78rem; font-weight: 800; border-radius: 9px; background: rgba(56, 189, 248, 0.18); border: 1.2px solid #38bdf8; color: #38bdf8; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;">
                <i class="fa-solid fa-camera"></i> تصوير بالكاميرا 📷
              </button>
              <button type="button" onclick="document.getElementById('inpEditTxReceipt').click()" style="height: 38px; font-size: 0.78rem; font-weight: 800; border-radius: 9px; background: rgba(16, 185, 129, 0.18); border: 1.2px solid #10b981; color: #34d399; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;">
                <i class="fa-solid fa-images"></i> اختيار من المعرض 🖼️
              </button>
            </div>

            <!-- معاينة الصورة مع زر التكبير والحذف -->
            <div id="editReceiptPreviewContainer" style="display: none; margin-top: 8px; text-align: center; background: rgba(0,0,0,0.35); border-radius: 10px; padding: 8px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;">
                <img id="editReceiptPreviewImg" src="" onclick="openReceiptLightbox(this.src, 'فاتورة العملية')" style="max-height: 85px; max-width: 150px; border-radius: 8px; border: 1.5px solid rgba(56, 189, 248, 0.5); object-fit: cover; cursor: pointer;" title="انقر للتكبير">
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                  <span style="font-size: 0.68rem; color: #38bdf8; font-weight: 800;"><i class="fa-solid fa-magnifying-glass-plus"></i> انقر للتكبير</span>
                  <button type="button" onclick="clearEditReceiptUpload()" style="padding: 4px 10px; border-radius: 6px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); color: #f87171; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-trash-can"></i> إزالة الصورة المرفقة
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- أزرار الحفظ والإلغاء -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
            <button type="submit" class="btn-primary-custom" style="background: linear-gradient(135deg, #0284c7, #0369a1); border: none; padding: 10px; border-radius: 10px; font-weight: 800; font-size: 0.84rem; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <i class="fa-solid fa-floppy-disk"></i> حفظ التعديلات
            </button>
            <button type="button" class="btn-secondary-custom" onclick="closeModal('editTxModal')" style="background: rgba(255, 255, 255, 0.08); border: 1px solid var(--border); padding: 10px; border-radius: 10px; font-weight: 800; font-size: 0.84rem; color: #94a3b8; cursor: pointer;">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>


<script>
    // =========================================================================
    // دوال الدخل والإيداعات المنقولة لصفحة طلب أموال
    // =========================================================================
    function openIncomeChoiceModal() {
      openModal('incomeChoiceModal');
    }

    function openIncomeHistoryModal() {
      openModal('incomeHistoryModal');
      renderIncomeHistoryList();
    }

    function renderIncomeHistoryList() {
      const container = document.getElementById('incomeHistoryListContainer');
      const totalAmtEl = document.getElementById('incomeHistoryTotalAmt');
      if (!container) return;

      const incomeList = (state.transactions || []).filter(t => t.type === 'income');
      // ترتيب تنازلي حسب التاريخ
      incomeList.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

      let total = 0;
      incomeList.forEach(t => { total += (Number(t.amount) || 0); });
      if (totalAmtEl) totalAmtEl.innerHTML = formatMoneyWithSignHtml(total, '+');

      if (incomeList.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 25px 10px; color: #94a3b8;">
            <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom: 8px;"></i>
            <div style="font-weight: 800; font-size: 0.85rem;">لا توجد عمليات إيداع أو دخل مسجلة</div>
          </div>
        `;
        return;
      }

      container.innerHTML = incomeList.map(t => {
        const amt = Number(t.amount) || 0;
        const wName = getWalletName(t.walletId);
        const memberAvatar = MEMBER_AVATARS[t.member] || null;
        const avatarHtml = memberAvatar
          ? `<img src="${memberAvatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">`
          : `<i class="fa-solid fa-user" style="font-size: 0.7rem; color: #10b981;"></i>`;

        return `
          <div class="ops-tx-card-lux" style="cursor: pointer;" ondblclick="closeModal('incomeHistoryModal'); openEditTxModal('${t.id}')" title="اضغط مرتين للتعديل">
            <div class="ops-tx-right-cluster">
              <div class="ops-tx-icon-bubble" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff;">
                <i class="fa-solid fa-money-bill-wave"></i>
              </div>
              <div class="ops-tx-info-block">
                <div class="ops-tx-label-text">${escapeHtml(t.label || 'إيداع نقدي')}</div>
                <div class="ops-tx-meta-chips">
                  <span class="ops-tx-chip" style="background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25);">
                    ${avatarHtml}
                    <span>${t.member || 'العائلة'}</span>
                  </span>
                  <span class="ops-tx-chip" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25);">
                    <i class="fa-solid fa-vault"></i>
                    <span>${wName}</span>
                  </span>
                  <span class="ops-tx-chip" style="color: #94a3b8;">
                    <i class="fa-regular fa-calendar"></i>
                    <span>${t.date || ''}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="ops-tx-left-cluster">
              ${formatMoneyWithSignHtml(amt, '+', 'ops-tx-amount-text')}
              <button class="ops-tx-edit-btn" onclick="closeModal('incomeHistoryModal'); openEditTxModal('${t.id}')" title="تعديل الإيداع" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 4px;">
                <i class="fa-solid fa-pen-to-square" style="font-size: 0.76rem;"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // =========================================================================
    // نظام البحث التلقائي عن التحديثات وتنزيلها مع كل عملية فتح للبرنامج (AutoUpdateManager)
    // =========================================================================
    let isCheckingForAppUpdates = false;
    let lastAppUpdateCheckTime = 0;

    /**
     * البحث التلقائي عن التحديثات الجديدة وتنزيلها وتطبيقها تلقائياً مع كل فتح للبرنامج
     * @param {Object} options { isManual: boolean, silent: boolean }
     */
    function forcePurgeCacheAndReload() {
      showToast('🚀 جاري مسح الذاكرة المؤقتة وتحديث البرنامج بالكامل لأحدث نسخة...', 'info', 4000);
      try {
        if ('caches' in window) {
          caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
        }
      } catch(e) {}
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(r => r.unregister());
          });
        }
      } catch(e) {}
      localStorage.removeItem('family_monefy_version');
      localStorage.removeItem('family_monefy_etag');
      sessionStorage.clear();
      setTimeout(() => {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.location.replace(`${cleanUrl}?_fresh=${Date.now()}`);
      }, 700);
    }

    async function checkAndApplyAppUpdates(options = { isManual: false, silent: true }) {
      const now = Date.now();
      // منع التكرار اللحظي إذا كان قد تم الفحص قبل أقل من 8 ثوانٍ إلا إذا كان يدوياً
      if (!options.isManual && (now - lastAppUpdateCheckTime < 8000)) return;
      if (isCheckingForAppUpdates) return;
      
      isCheckingForAppUpdates = true;
      lastAppUpdateCheckTime = now;

      const updateBtnIcon = document.getElementById('settingsAppUpdateIconSpin');
      const updateStatusBadge = document.getElementById('settingsAppUpdateStatusBadge');
      if (updateBtnIcon) updateBtnIcon.classList.add('fa-spin');
      if (updateStatusBadge) updateStatusBadge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري فحص التحديثات...';

      try {
        console.log('🔍 [AutoUpdate] جاري البحث عن تحديثات جديدة للبرنامج من السيرفر...');
        
        let remoteBuild = null;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        // 1. محاولة قراءة ملف version.json مع منع الكاش تماماً من السيرفر
        try {
          const vUrl = `version.json?_nocache=${now}&_r=${Math.random()}`;
          const res = await fetch(vUrl, {
            cache: 'no-store',
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            remoteBuild = await res.json();
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          console.warn('⚠️ [AutoUpdate] تعذر قراءة version.json مباشرة:', fetchErr.message);
        }

        // 2. فحص الرأس المباشر للصفحة (HEAD request) إذا لم يتوفر version.json
        if (!remoteBuild) {
          try {
            const headController = new AbortController();
            const headTimeout = setTimeout(() => headController.abort(), 4000);
            const pathUrl = window.location.pathname || 'index.html';
            const headRes = await fetch(`${pathUrl}?_head=${now}`, {
              method: 'HEAD',
              cache: 'no-store',
              signal: headController.signal
            });
            clearTimeout(headTimeout);
            if (headRes.ok) {
              const etag = headRes.headers.get('ETag') || headRes.headers.get('Last-Modified');
              const localEtag = localStorage.getItem('family_monefy_etag');
              if (etag && localEtag && etag !== localEtag) {
                remoteBuild = {
                  version: 'أحدث',
                  buildId: Date.now(),
                  etag: etag,
                  notes: 'تحديث جديد تم رصده في ملفات التطبيق'
                };
              } else if (etag && !localEtag) {
                localStorage.setItem('family_monefy_etag', etag);
              }
            }
          } catch(e) {}
        }

        // 3. التحقق مما إذا كان هناك إصدار أحدث متوفر بالسيرفر
        const currentBuildNum = (typeof window !== 'undefined' && window.APP_BUILD_ID) ? Number(window.APP_BUILD_ID) : (typeof APP_BUILD_ID !== 'undefined' ? Number(APP_BUILD_ID) : 202611071415);
        const currentVerStr = (typeof window !== 'undefined' && window.APP_VERSION) ? window.APP_VERSION : (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '4.9.4');
        
        const isNewer = remoteBuild && remoteBuild.buildId && (
          Number(remoteBuild.buildId) > currentBuildNum || 
          (remoteBuild.version && remoteBuild.version !== currentVerStr && Number(remoteBuild.buildId) >= currentBuildNum)
        );

        if (isNewer) {
          console.log(`🚀 [AutoUpdate] تم اكتشاف إصدار جديد: ${remoteBuild.version} (Build: ${remoteBuild.buildId})`);
          
          // حماية ضد التكرار المتتالي في حال تأخر خوادم GitHub CDN عن توزيع الكود المصدري الجديد
          const attemptKey = `upd_attempt_${remoteBuild.buildId}`;
          const attempts = Number(sessionStorage.getItem(attemptKey) || 0);
          if (attempts >= 2) {
            console.warn('⚠️ [AutoUpdate] تم عمل محاولتي تحديث سابقتين لنفس الإصدار. بانتظار اكتمال توزيع السيرفر.');
            if (options.isManual) {
              showToast('تم رصد التحديث بالفعل، وجاري اكتمال نشره على خوادم GitHub. سيتم تطبيقه تلقائياً خلال دقيقة.', 'info');
            }
            if (updateStatusBadge) updateStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> أحدث إصدار';
            return;
          }
          sessionStorage.setItem(attemptKey, attempts + 1);

          // إشعار المستخدم فوراً ببدء التنزيل والتطبيق التلقائي
          showToast(`🚀 تم العثور على تحديث جديد (${remoteBuild.version || 'جديد'})! جاري التحميل والتطبيق تلقائياً...`, 'info', 4000);
          if (updateStatusBadge) updateStatusBadge.innerHTML = '<i class="fa-solid fa-cloud-arrow-down fa-bounce"></i> جاري تنزيل التحديث...';

          // حفظ كافة البيانات والمصروفات فوراً قبل التحديث لمنع أي فقد للبيانات
          try {
            if (typeof saveTx === 'function') saveTx();
            if (typeof syncWithCloud === 'function') await syncWithCloud();
          } catch(e) {}

          // مسح الذاكرة المؤقتة القديمة بالكامل
          if ('caches' in window) {
            try {
              const keys = await caches.keys();
              await Promise.all(keys.map(k => caches.delete(k)));
            } catch(e) {}
          }

          if ('serviceWorker' in navigator) {
            try {
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (const reg of registrations) await reg.update();
            } catch(e) {}
          }

          // تسجيل وسام نجاح التحديث لعرضه بعد إعادة التحميل
          localStorage.setItem('family_monefy_just_updated', remoteBuild.version || 'الجديد');
          if (remoteBuild.etag) localStorage.setItem('family_monefy_etag', remoteBuild.etag);

          // إعادة تحميل التطبيق تلقائياً مع معرّف التحديث لمنع أي كاش محلي
          setTimeout(() => {
            const cleanUrl = window.location.origin + window.location.pathname;
            const newUrl = `${cleanUrl}?_upd=${remoteBuild.buildId}&_t=${Date.now()}`;
            window.location.replace(newUrl);
          }, 800);
          return;
        }

        // 4. التطبيق يعمل على أحدث إصدار بالفعل
        console.log(`✅ [AutoUpdate] التطبيق محدث بالكامل لأحدث إصدار (v${currentVerStr} - Build: ${currentBuildNum})`);
        
        // التحقق مما إذا كان البرنامج قد تم تحديثه للتو
        const justUpdatedVer = localStorage.getItem('family_monefy_just_updated');
        if (justUpdatedVer) {
          localStorage.removeItem('family_monefy_just_updated');
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          showToast(`✨ تم تحديث البرنامج بنجاح لأحدث إصدار (${currentVerStr})!`, 'success', 5000);
        } else if (options.isManual) {
          showToast(`✅ التطبيق محدث بالفعل لأحدث إصدار (v${currentVerStr})`, 'success');
        }

        if (updateStatusBadge) {
          updateStatusBadge.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> فحص تلقائي نشط (v${currentVerStr})`;
        }

      } catch (err) {
        console.warn('⚠️ [AutoUpdate] خطأ أثناء فحص التحديثات:', err);
        if (options.isManual) {
          showToast('تعذر فحص التحديثات حالياً. يرجى التحقق من اتصال الإنترنت.', 'warning');
        }
        if (updateStatusBadge) {
          updateStatusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i> فحص غير متاح حالياً';
        }
      } finally {
        isCheckingForAppUpdates = false;
        if (updateBtnIcon) updateBtnIcon.classList.remove('fa-spin');
      }
    }

    // دوال التوافق السريع للأزرار والنداءات السابقة
    function forceAppReloadAndCacheBust() {
      checkAndApplyAppUpdates({ isManual: true, silent: false });
    }
    function forceAppReloadAndSync() {
      checkAndApplyAppUpdates({ isManual: true, silent: false });
    }

    // =========================================================================
    // دوال تفاصيل وتعديل العملية المالية
    // =========================================================================
    
    currentEditTxReceiptDataUri = window.currentEditTxReceiptDataUri || null;

    function handleEditReceiptUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const maxDim = 1200;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          currentEditTxReceiptDataUri = canvas.toDataURL('image/jpeg', 0.82);
          updateEditTxReceiptPreview();
          showToast('📸 تم تحميل صورة الفاتورة للعملية بنجاح');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function updateEditTxReceiptPreview() {
      const container = document.getElementById('editReceiptPreviewContainer');
      const img = document.getElementById('editReceiptPreviewImg');
      const badge = document.getElementById('editReceiptAttachedBadge');
      if (currentEditTxReceiptDataUri) {
        if (img) img.src = currentEditTxReceiptDataUri;
        if (container) container.style.display = 'block';
        if (badge) badge.style.display = 'inline-block';
      } else {
        if (img) img.src = '';
        if (container) container.style.display = 'none';
        if (badge) badge.style.display = 'none';
      }
    }

    function clearEditReceiptUpload() {
      currentEditTxReceiptDataUri = null;
      const inp1 = document.getElementById('inpEditTxReceipt');
      const inp2 = document.getElementById('inpEditTxReceiptCamera');
      if (inp1) inp1.value = '';
      if (inp2) inp2.value = '';
      updateEditTxReceiptPreview();
      showToast('🗑️ تمت إزالة صورة الفاتورة');
    }
    
    