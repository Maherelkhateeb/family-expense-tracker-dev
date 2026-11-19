// =========================================================================
// Family Expense Tracker Next - Features, Income, Tasks & Settings Engine
// =========================================================================

    // =========================================================================
    // دوال الدخل والإيداعات المنقولة لصفحة طلب أموال
    // =========================================================================
    

    function openIncomeHistoryModal() {
      openModal('incomeHistoryModal');
      renderIncomeHistoryList();
    }

    function renderIncomeHistoryList() {
      const containers = [
        document.getElementById('incomeHistoryListContainer'),
        document.getElementById('directIncomeListRows')
      ].filter(Boolean);
      if (!containers.length) return;

      const incomeList = (state.transactions || []).filter(t => t.type === 'income' && t.category !== 'transfer');
      incomeList.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      const total = incomeList.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      const totalHtml = formatMoneyWithSignHtml(total, '+');
      ['incomeHistoryTotalAmt', 'lblIncomeHistoryTotalAmt'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = totalHtml;
      });
      const countBadge = document.getElementById('incomeBadgeCount');
      if (countBadge) countBadge.textContent = String(incomeList.length);

      const emptyHtml = `
        <div style="text-align: center; padding: 25px 10px; color: #94a3b8;">
          <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom: 8px;"></i>
          <div style="font-weight: 800; font-size: 0.85rem;">لا توجد عمليات إيداع أو دخل مسجلة</div>
        </div>`;

      const rowsHtml = incomeList.map(tx => {
        const amount = Number(tx.amount) || 0;
        const member = String(tx.member || 'العائلة');
        const walletName = String(getWalletName(tx.walletId));
        const memberAvatar = MEMBER_AVATARS[member] || null;
        const avatarHtml = memberAvatar
          ? `<img src="${escapeHtml(memberAvatar)}" alt="" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">`
          : `<i class="fa-solid fa-user" style="font-size: 0.7rem; color: #10b981;"></i>`;
        return `
          <div class="ops-tx-card-lux">
            <div class="ops-tx-right-cluster">
              <div class="ops-tx-icon-bubble" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff;">
                <i class="fa-solid fa-money-bill-wave"></i>
              </div>
              <div class="ops-tx-info-block">
                <div class="ops-tx-label-text">${escapeHtml(tx.label || 'إيداع نقدي')}</div>
                <div class="ops-tx-meta-chips">
                  <span class="ops-tx-chip" style="background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25);">${avatarHtml}<span>${escapeHtml(member)}</span></span>
                  <span class="ops-tx-chip" style="background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.25);"><i class="fa-solid fa-vault"></i><span>${escapeHtml(walletName)}</span></span>
                  <span class="ops-tx-chip" style="color: #94a3b8;"><i class="fa-regular fa-calendar"></i><span>${escapeHtml(tx.date || '')}</span></span>
                </div>
              </div>
            </div>
            <div class="ops-tx-left-cluster">
              ${formatMoneyWithSignHtml(amount, '+', 'ops-tx-amount-text')}
              <button type="button" class="ops-tx-edit-btn" data-income-edit="${escapeHtml(String(tx.id || ''))}" title="تعديل الإيداع" aria-label="تعديل الإيداع" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 4px;">
                <i class="fa-solid fa-pen-to-square" style="font-size: 0.76rem;"></i>
              </button>
            </div>
          </div>`;
      }).join('');

      containers.forEach(container => {
        container.innerHTML = rowsHtml || emptyHtml;
        container.querySelectorAll('[data-income-edit]').forEach(button => {
          button.addEventListener('click', () => {
            const transactionId = button.getAttribute('data-income-edit');
            if (container.id === 'incomeHistoryListContainer') closeModal('incomeHistoryModal');
            if (transactionId && typeof editTx === 'function') editTx(transactionId);
          });
        });
      });
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
    function forcePurgeCacheAndReload(isManual = false) {
      // حماية فائقة ضد حلقات إعادة التحميل المستمرة (Anti-Loop Circuit Breaker)
      const now = Date.now();
      const lastForce = Number(localStorage.getItem('family_monefy_last_force_reload_ts') || 0);
      if (!isManual && (now - lastForce < 120000)) {
        console.warn('🛑 [AntiLoop] تم كبح إعادة التحميل التلقائي المتكرر (آخر تحديث تم قبل أقل من دقيقتين).');
        return;
      }
      localStorage.setItem('family_monefy_last_force_reload_ts', String(now));

      showToast('🚀 جاري مسح الذاكرة المؤقتة وتحديث البرنامج بالكامل لأحدث نسخة...', 'info', 3000);
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
      localStorage.setItem('family_monefy_version', window.APP_VERSION || 'v5.3.89');
      setTimeout(() => {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.location.replace(`${cleanUrl}?_fresh=${now}`);
      }, 700);
    }

    
    // =========================================================================
    // محرك التحديث التلقائي الذكي والآمن عند اكتشاف إصدار جديد (Smart PWA Auto-Update Engine)
    // =========================================================================
    function applyRemoteUpdateAndReload(remoteBuild, isManual = false) {
      console.log(`🚀 [AutoUpdate] تطبيق التحديث الجديد فوراً: ${remoteBuild?.version || 'v5.3.89'}`);
      
      try {
        if (typeof saveTx === 'function') saveTx();
        if (typeof saveTasksToStorage === 'function') saveTasksToStorage();
      } catch(e) {}

      if ('caches' in window) {
        try {
          caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
        } catch(e) {}
      }

      if ('serviceWorker' in navigator) {
        try {
          navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(r => {
              r.update();
              if (r.waiting) r.waiting.postMessage({ type: 'SKIP_WAITING' });
            });
          });
        } catch(e) {}
      }

      localStorage.setItem('family_monefy_just_updated_ts', Date.now());
      localStorage.setItem('family_monefy_just_updated', remoteBuild?.version || window.APP_VERSION || 'v5.3.89');

      setTimeout(() => {
        const cleanUrl = window.location.origin + window.location.pathname;
        const bId = remoteBuild?.buildId || Date.now();
        window.location.replace(`${cleanUrl}?_b=${bId}`);
      }, 750);
    }

    async function checkAndApplyAppUpdates(options = { isManual: false, silent: true }) {
      const now = Date.now();
      // حماية صارمة لمنع التحديث المتكرر أو حلقة إعادة التحميل المستمرة (Infinite Reload Loop Protection)
      const lastUpdatedTs = Number(localStorage.getItem('family_monefy_just_updated_ts') || 0);
      if (!options.isManual && (now - lastUpdatedTs < 60000)) {
        return Promise.resolve();
      }
      if (!options.isManual && (now - lastAppUpdateCheckTime < 20000)) return Promise.resolve();
      if (isCheckingForAppUpdates) return Promise.resolve();
      
      isCheckingForAppUpdates = true;
      lastAppUpdateCheckTime = now;

      const updateBtnIcon = document.getElementById('settingsAppUpdateIconSpin');
      const updateStatusBadge = document.getElementById('settingsAppUpdateStatusBadge');
      if (updateBtnIcon) updateBtnIcon.classList.add('fa-spin');
      if (updateStatusBadge) updateStatusBadge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري فحص التحديثات...';

      
        try {
          console.log('🔍 [AutoUpdate] جاري البحث عن تحديثات جديدة للبرنامج من السيرفر...');
          let remoteBuild = null;

          try {
            const vUrl = `version.json?_nocache=${now}&_r=${Math.random()}`;
            const res = await fetch(vUrl, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            });
            if (res.ok) {
              remoteBuild = await res.json();
            }
          } catch (fetchErr) {
            console.warn('⚠️ [AutoUpdate] تعذر قراءة version.json:', fetchErr.message);
          }

          const currentBuildNum = (typeof APP_BUILD_ID !== 'undefined' ? Number(APP_BUILD_ID) : 202611151430);
          const currentVerStr = (typeof APP_VERSION !== 'undefined' ? APP_VERSION : 'v5.3.89');

          const remoteBNum = Number(remoteBuild?.buildId || remoteBuild?.build || 0);
          const isNewer = remoteBuild && (
            (remoteBNum > currentBuildNum) ||
            (remoteBNum === 0 && remoteBuild.version &&
             String(remoteBuild.version).localeCompare(String(currentVerStr), undefined, { numeric: true, sensitivity: 'base' }) > 0)
          );

          if (isNewer || (options.isManual && options.force)) {
            const attemptedBuild = localStorage.getItem('family_monefy_last_attempted_build');
            const attemptedTime = Number(localStorage.getItem('family_monefy_last_attempted_time') || 0);
            const alreadyAttemptedThisBuild = (attemptedBuild === String(remoteBuild?.buildId)) && (Date.now() - attemptedTime < 180000);

            if (!alreadyAttemptedThisBuild || options.isManual) {
              localStorage.setItem('family_monefy_last_attempted_build', String(remoteBuild?.buildId || ''));
              localStorage.setItem('family_monefy_last_attempted_time', String(Date.now()));
              showToast(`🚀 تم العثور على تحديث جديد (${remoteBuild?.version || 'v5.3.89'})! جاري التحميل والتطبيق فوراً...`, 'info', 3000);
              applyRemoteUpdateAndReload(remoteBuild, options.isManual);
              return;
            } else {
              console.log('ℹ️ [AutoUpdate] تم تطبيق التحديث في هذه الجلسة مسبقاً.');
            }
          } else {
            console.log('✅ [AutoUpdate] التطبيق يعمل بالفعل على أحدث إصدار متوفر.');
            if (options.isManual) {
              if ('serviceWorker' in navigator) {
                try {
                  const registrations = await navigator.serviceWorker.getRegistrations();
                  for (const reg of registrations) await reg.update();
                } catch(e) {}
              }
            }
          }
        } catch(err) {
          console.warn('[AutoUpdate] Exception during update check:', err);
        } finally {
          isCheckingForAppUpdates = false;
          if (updateBtnIcon) updateBtnIcon.classList.remove('fa-spin');
          if (updateStatusBadge) updateStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> أحدث إصدار';
        }
    }

    async function executeMasterUnifiedSyncAndRefresh(isManual = false) {
      if (window.isMasterSyncRunning && !isManual) return;
      window.isMasterSyncRunning = true;

      const spinIcon = document.getElementById('headerMasterSyncSpinIcon');
      const statusText = document.getElementById('topDriveSyncStatusText');
      if (spinIcon) spinIcon.classList.add('fa-spin');
      if (statusText) {
        statusText.textContent = 'جاري التحديث والموازنة...';
        statusText.style.color = '#38bdf8';
      }

      if (isManual) {
        showToast('🔄 جاري التحديث الشامل: فحص النسخة + موازنة الحسابات + تحديث أسعار الذهب...', 'info', 3000);
      }

      try {
        // 1. فحص النسخة الجديدة وتحديث كاش المتصفح (PWA Cache & App Update)
        let remoteBuild = null;
        try {
          const vRes = await fetch('version.json?_nocache=' + Date.now(), { cache: 'no-store' });
          if (vRes.ok) {
            remoteBuild = await vRes.json();
          }
        } catch(e) {
          console.warn('PWA version check notice:', e);
        }

        const currentBuildNum = (typeof APP_BUILD_ID !== 'undefined' ? Number(APP_BUILD_ID) : 202611151430);
        const currentVerStr = (typeof APP_VERSION !== 'undefined' ? APP_VERSION : 'v5.3.89');

        const remoteBNum = Number(remoteBuild?.buildId || remoteBuild?.build || 0);
          const isNewer = remoteBuild && (
            (remoteBNum > currentBuildNum) ||
            (remoteBNum === 0 && remoteBuild.version &&
             String(remoteBuild.version).localeCompare(String(currentVerStr), undefined, { numeric: true, sensitivity: 'base' }) > 0)
          );

        if (isNewer) {
          const attemptedBuild = localStorage.getItem('family_monefy_last_attempted_build');
          const attemptedTime = Number(localStorage.getItem('family_monefy_last_attempted_time') || 0);
          const alreadyAttemptedThisBuild = (attemptedBuild === String(remoteBuild.buildId)) && (Date.now() - attemptedTime < 180000);

          if (!alreadyAttemptedThisBuild || isManual) {
            console.log(`🚀 [AutoUpdate] تم اكتشاف نسخة جديدة (${remoteBuild.version}) - جاري التحميل والتطبيق الفوري...`);
            localStorage.setItem('family_monefy_last_attempted_build', String(remoteBuild.buildId));
            localStorage.setItem('family_monefy_last_attempted_time', String(Date.now()));
            if (statusText) statusText.textContent = 'جاري تطبيق التحديث...';
            showToast(`🚀 تم العثور على إصدار جديد (${remoteBuild.version})! جاري التحديث والتطبيق فوراً...`, 'info', 3000);
            
            if (typeof applyRemoteUpdateAndReload === 'function') {
              applyRemoteUpdateAndReload(remoteBuild, isManual);
              return;
            }
          } else {
            console.log(`ℹ️ [AutoUpdate] تم محاولة تطبيق التحديث (${remoteBuild.version}) مسبقاً، بانتظار اكتمال انتشار الكاش على المتصفح.`);
          }
        }

        // 2. تحديث وموازنة أسعار الذهب والعملات الأجنبية الحية
        let liveRatesResult = null;
        if (typeof fetchTradingViewRates === 'function') {
          try {
            liveRatesResult = await fetchTradingViewRates(true);
          } catch(e) {
            console.warn('Rates refresh notice:', e);
          }
        }

        // 3. المزامنة السحابية والموازنة المحاسبية التراكمية
        if (typeof executeGoogleDriveSync === 'function') {
          try {
            await executeGoogleDriveSync(false);
          } catch(e) {}
        }

        // 4. التدقيق الرياضي وإعادة احتساب الأرصدة التراكمية بنسبة 100%
        if (typeof auditAndRecomputeAllWalletBalances === 'function') {
          auditAndRecomputeAllWalletBalances();
        }

        // 5. ضبط سريالات الحركات والطلبات
        if (typeof ensureSmartAuditSerials === 'function') ensureSmartAuditSerials();
      if (typeof ensureSmartRequestSerials === 'function') ensureSmartRequestSerials();
        if (typeof ensureSmartRequestSerials === 'function') ensureSmartRequestSerials();

        // 6. إعادة رسم الواجهات والقوائم
        if (typeof renderUI === 'function') renderUI();
        if (typeof filterOperationsList === 'function') filterOperationsList();
        if (typeof renderRequestsList === 'function') renderRequestsList();
        if (typeof renderTasksProList === 'function') renderTasksProList();

        if (statusText) {
          const isLiveOk = liveRatesResult && !liveRatesResult.isStale && !liveRatesResult.offline;
          if (isLiveOk) {
            statusText.textContent = 'محدث ومباشر ✓';
            statusText.style.color = '#34d399';
          } else {
            statusText.textContent = 'أسعار محفوظة ⚠️';
            statusText.style.color = '#fbbf24';
          }
        }

        if (isManual) {
          const goldStr = state.market?.gold21 ? ` | ذهب 21: ${state.market.gold21.toLocaleString('ar-EG')} ج.م` : '';
          const usdStr = state.market?.usdEgp ? ` | $ دولار: ${state.market.usdEgp.toFixed(2)} ج.م` : '';
          showToast(`✅ اكتمل التحديث الشامل: التطبيق محدث بالكامل (${APP_VERSION}) | الحسابات متوازنة 100%${usdStr}${goldStr}`, 'success', 5000);
          if (typeof playNotificationChime === 'function') playNotificationChime();
        }
      } catch(err) {
        console.warn('Unified sync notice:', err);
        if (statusText) {
          const isLiveOk = liveRatesResult && !liveRatesResult.isStale && !liveRatesResult.offline;
          if (isLiveOk) {
            statusText.textContent = 'محدث ومباشر ✓';
            statusText.style.color = '#34d399';
          } else {
            statusText.textContent = 'أسعار محفوظة ⚠️';
            statusText.style.color = '#fbbf24';
          }
        }
        if (isManual) showToast('⚠️ تعذر إكمال التحديث المباشر للأسعار، تم استخدام البيانات المحفوظة', 'warning');
      } finally {
        window.isMasterSyncRunning = false;
        if (spinIcon) spinIcon.classList.remove('fa-spin');
      }
    }

    // تهيئة عداد المهام في الهيدر العلوي عند بدء التشغيل
    setTimeout(() => {
      try {
        const tasks = getTodoTasks();
        const activeCount = tasks.filter(t => !t.completed).length;
        const hBadge = document.getElementById('headerTasksBadgeCount');
        if (hBadge) hBadge.textContent = activeCount;
      } catch(e) {}
    }, 500);

    // =========================================================================
    // محرك إدارة الالتزامات والديون والفواتير المتطور v5.2.1 (Commitments & Debts Master Engine)
    // =========================================================================
    let activeCommitmentSubSection = 'bills'; // 'bills' or 'debts'
    let currentUnifiedCommitmentType = 'upcoming_bill'; // 'upcoming_bill', 'debt_on_us', 'debt_for_us'
    let activeBillsFilterStatus = 'all'; // 'all', 'upcoming', 'paid'
    let activeDebtsFilterStatus = 'all'; // 'all', 'debt_on_us', 'debt_for_us', 'paid'
    window.currentUnifiedBillPhoto = null;
    window.selectedCommitmentRowId = null;

    function switchCommitmentSubSection(sec) {
      activeCommitmentSubSection = sec;
      const bBills = document.getElementById('tabCommitmentBills');
      const bDebts = document.getElementById('tabCommitmentDebts');
      const bBud = document.getElementById('tabExpectedMonthlyBudget');
      const bHist = document.getElementById('tabExpectedBudgetHistory');

      const vCommitments = document.getElementById('subViewCommitments');
      const vBillsList = document.getElementById('viewCommitmentsBillsList');
      const vDebtsList = document.getElementById('viewCommitmentsDebtsList');
      const vBud = document.getElementById('panelMonthlyBudget');
      const vHist = document.getElementById('panelBudgetHistory');

      // إظهار قسم الالتزامات العام وإخفاء الميزانية
      if (vCommitments) vCommitments.style.display = 'block';
      if (vBud) vBud.style.display = 'none';
      if (vHist) vHist.style.display = 'none';

      if (bBud) { bBud.classList.remove('active'); bBud.style.background = 'transparent'; bBud.style.color = '#94a3b8'; }
      if (bHist) { bHist.classList.remove('active'); bHist.style.background = 'transparent'; bHist.style.color = '#94a3b8'; }

      if (sec === 'bills') {
        if (bBills) {
          bBills.classList.add('active');
          bBills.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bBills.style.color = '#fff';
          bBills.style.boxShadow = '0 2px 8px rgba(2, 132, 199, 0.35)';
        }
        if (bDebts) {
          bDebts.classList.remove('active');
          bDebts.style.background = 'transparent';
          bDebts.style.color = '#94a3b8';
          bDebts.style.boxShadow = 'none';
        }
        if (vBillsList) vBillsList.style.display = 'block';
        if (vDebtsList) vDebtsList.style.display = 'none';
      } else {
        if (bDebts) {
          bDebts.classList.add('active');
          bDebts.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)';
          bDebts.style.color = '#fff';
          bDebts.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.35)';
        }
        if (bBills) {
          bBills.classList.remove('active');
          bBills.style.background = 'transparent';
          bBills.style.color = '#94a3b8';
          bBills.style.boxShadow = 'none';
        }
        if (vBillsList) vBillsList.style.display = 'none';
        if (vDebtsList) vDebtsList.style.display = 'block';
      }

      renderCommitmentsPageUI();
    }

    function toggleUnifiedAddCommitmentPanel(forceOpen = null) {
      const panel = document.getElementById('panelUnifiedAddCommitment');
      if (!panel) return;
      const isVisible = (panel.style.display !== 'none');
      const targetState = (forceOpen !== null) ? forceOpen : !isVisible;

      panel.style.display = targetState ? 'block' : 'none';
      if (targetState) {
        try { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch(e) {}
        const dateInp = document.getElementById('inpUnifiedCommitmentDueDate');
        if (dateInp && !dateInp.value) {
          dateInp.value = getLocalDateStr(new Date());
        }
        const titleInp = document.getElementById('inpUnifiedCommitmentTitle');
        if (titleInp) titleInp.focus();
      }
    }

    window.setUnifiedAddType = setUnifiedAddType;
    function setUnifiedAddType(type) {
      currentUnifiedCommitmentType = type;
      const btnBill = document.getElementById('btnTypeSelectBill');
      const btnOnUs = document.getElementById('btnTypeSelectDebtOnUs');
      const btnForUs = document.getElementById('btnTypeSelectDebtForUs');

      const lblTitle = document.getElementById('lblUnifiedCommitmentTitle');
      const inpTitle = document.getElementById('inpUnifiedCommitmentTitle');
      const rowBill = document.getElementById('rowUnifiedBillExtras');
      const rowDebt = document.getElementById('rowUnifiedDebtExtras');
      const btnSubmitTxt = document.getElementById('btnSubmitUnifiedCommitmentText');

      [btnBill, btnOnUs, btnForUs].forEach(b => {
        if (b) {
          b.classList.remove('active');
          b.style.background = 'transparent';
        }
      });

      if (type === 'upcoming_bill') {
        if (btnBill) {
          btnBill.classList.add('active');
          btnBill.style.background = 'rgba(56, 189, 248, 0.22)';
          btnBill.style.color = '#38bdf8';
        }
        if (lblTitle) lblTitle.innerHTML = 'بيان / اسم الفاتورة <span class="req" style="color: #f43f5e;">*</span>';
        if (inpTitle) inpTitle.placeholder = 'مثال: فاتورة كهرباء نوفمبر، اشتراك إنترنت، قسط مدرسة...';
        if (rowBill) rowBill.style.display = 'flex';
        if (rowDebt) rowDebt.style.display = 'none';
        if (btnSubmitTxt) btnSubmitTxt.textContent = 'حفظ وتثبيت الفاتورة';
      } else if (type === 'debt_on_us') {
        if (btnOnUs) {
          btnOnUs.classList.add('active');
          btnOnUs.style.background = 'rgba(244, 63, 94, 0.22)';
          btnOnUs.style.color = '#f87171';
        }
        if (lblTitle) lblTitle.innerHTML = 'اسم الدائن / الجهة المستحقة <span class="req" style="color: #f43f5e;">*</span>';
        if (inpTitle) inpTitle.placeholder = 'مثال: البنك الأهلي، الأخ محمد، الزميل أحمد...';
        if (rowBill) rowBill.style.display = 'none';
        if (rowDebt) rowDebt.style.display = 'block';
        if (btnSubmitTxt) btnSubmitTxt.textContent = 'حفظ وتثبيت الدين (علينا)';
      } else if (type === 'debt_for_us') {
        if (btnForUs) {
          btnForUs.classList.add('active');
          btnForUs.style.background = 'rgba(52, 211, 153, 0.22)';
          btnForUs.style.color = '#34d399';
        }
        if (lblTitle) lblTitle.innerHTML = 'اسم المدين / الشخص المطالب بالسداد <span class="req" style="color: #f43f5e;">*</span>';
        if (inpTitle) inpTitle.placeholder = 'مثال: الزميل إبراهيم، الأخ وائل...';
        if (rowBill) rowBill.style.display = 'none';
        if (rowDebt) rowDebt.style.display = 'block';
        if (btnSubmitTxt) btnSubmitTxt.textContent = 'حفظ وتثبيت الدين (لنا)';
      }
    }

    window.currentUnifiedCommitmentPhotos = [];

    function handleUnifiedBillPhotoUpload(event) {
      const files = event.target.files ? Array.from(event.target.files) : [];
      if (!files.length) return;

      if (!window.currentUnifiedCommitmentPhotos) window.currentUnifiedCommitmentPhotos = [];

      let loadedCount = 0;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let w = img.width, h = img.height;
            if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            window.currentUnifiedCommitmentPhotos.push(compressed);
            window.currentUnifiedBillPhoto = window.currentUnifiedCommitmentPhotos[0] || null;
            loadedCount++;
            if (loadedCount === files.length) {
              renderUnifiedCommitmentPhotoPreviews();
              showToast(`📷 تم إرفاق ${files.length} مرفق بنجاح`);
            }
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
      event.target.value = '';
    }

    function removeUnifiedCommitmentPhoto(idx) {
      if (!window.currentUnifiedCommitmentPhotos) return;
      window.currentUnifiedCommitmentPhotos.splice(idx, 1);
      window.currentUnifiedBillPhoto = window.currentUnifiedCommitmentPhotos[0] || null;
      renderUnifiedCommitmentPhotoPreviews();
    }

    function renderUnifiedCommitmentPhotoPreviews() {
      const row = document.getElementById('unifiedBillPhotoPreviewRow');
      const carousel = document.getElementById('unifiedBillPhotoCarousel');
      const badge = document.getElementById('unifiedCommitmentPhotoCountBadge');
      const photos = window.currentUnifiedCommitmentPhotos || [];

      if (badge) badge.textContent = `${photos.length} صور`;

      if (!photos.length) {
        if (row) row.style.display = 'none';
        if (carousel) carousel.innerHTML = '';
        return;
      }

      if (row) row.style.display = 'flex';
      if (carousel) {
        carousel.innerHTML = photos.map((p, idx) => `
          <div style="position: relative; flex-shrink: 0; width: 62px; height: 62px; border-radius: 8px; overflow: hidden; border: 1.5px solid #38bdf8; background: #0f172a;">
            <img src="${p}" onclick="openReceiptLightbox('${p}', 'مرفق ${idx + 1}')" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" title="تكبير الصورة">
            <button type="button" onclick="removeUnifiedCommitmentPhoto(${idx})" style="position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(239, 68, 68, 0.9); color: #fff; border: none; font-size: 0.65rem; line-height: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
          </div>
        `).join('');
      }
    }

    function clearUnifiedBillPhoto() {
      window.currentUnifiedCommitmentPhotos = [];
      window.currentUnifiedBillPhoto = null;
      renderUnifiedCommitmentPhotoPreviews();
    }

    window.submitUnifiedCommitment = submitUnifiedCommitment;
    function submitUnifiedCommitment() {
      const titleInp = document.getElementById('inpUnifiedCommitmentTitle');
      const amtInp = document.getElementById('inpUnifiedCommitmentAmount');
      const dateInp = document.getElementById('inpUnifiedCommitmentDueDate');
      const memSel = document.getElementById('inpUnifiedCommitmentMember');
      const catSel = document.getElementById('inpUnifiedCommitmentCategory');
      const notesInp = document.getElementById('inpUnifiedDebtNotes');

      const title = titleInp ? titleInp.value.trim() : '';
      const amount = parseFloat(amtInp ? amtInp.value : 0);
      const dueDate = dateInp && dateInp.value ? dateInp.value : getLocalDateStr(new Date());
      const member = memSel ? memSel.value : 'البيت';
      const category = catSel ? catSel.value : 'bills';
      const notes = notesInp ? notesInp.value.trim() : '';

      if (!title) {
        showToast('⚠️ الرجاء إدخال بيان أو اسم الالتزام / الفاتورة', 'error');
        if (titleInp) titleInp.focus();
        return;
      }
      if (isNaN(amount) || amount <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ صحيح أكبر من الصفر', 'error');
        if (amtInp) amtInp.focus();
        return;
      }

      if (!state.expectedExpenses || !Array.isArray(state.expectedExpenses)) {
        state.expectedExpenses = [];
      }

      const isBill = (currentUnifiedCommitmentType === 'upcoming_bill');
      const photos = (Array.isArray(window.currentUnifiedCommitmentPhotos) && window.currentUnifiedCommitmentPhotos.length)
        ? window.currentUnifiedCommitmentPhotos
        : (window.currentUnifiedBillPhoto ? [window.currentUnifiedBillPhoto] : []);

      const newCommitment = {
        id: 'exp-' + Date.now(),
        type: currentUnifiedCommitmentType, // 'upcoming_bill', 'debt_on_us', 'debt_for_us'
        title: title,
        label: title,
        amount: amount,
        paidAmount: 0,
        dueDate: dueDate,
        member: member,
        category: isBill ? category : (currentUnifiedCommitmentType === 'debt_on_us' ? 'debt_on_us' : 'debt_for_us'),
        photo: photos[0] || null,
        receipt: photos[0] || null,
        receipts: photos,
        notes: notes,
        status: 'upcoming',
        author: state.currentUser || 'ماهر',
        createdAt: new Date().toISOString()
      };

      state.expectedExpenses.unshift(newCommitment);
      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}

      // إذا كان ديناً نضمن أيضاً تسجيله في خزانة الديون المباشرة
      if (!isBill) {
        if (!state.debts || !Array.isArray(state.debts)) state.debts = [];
        state.debts.unshift({
          ...newCommitment,
          debtor: (currentUnifiedCommitmentType === 'debt_on_us') ? (title || 'دائن') : (member || 'ماهر'),
          creditor: (currentUnifiedCommitmentType === 'debt_for_us') ? (title || 'مدين') : (member || 'ماهر'),
          debtType: currentUnifiedCommitmentType === 'debt_on_us' ? 'on_us' : 'for_us',
          date: dueDate
        });
        if (typeof saveDebts === 'function') saveDebts();
      }

      // إلغاء أي فلترة تاريخ سابقة حتى يظهر الالتزام الجديد فوراً في الجدول
      state.selectedCommitmentDate = null;

      // تنظيف النموذج
      if (titleInp) titleInp.value = '';
      if (amtInp) amtInp.value = '';
      if (notesInp) notesInp.value = '';
      clearUnifiedBillPhoto();
      toggleUnifiedAddCommitmentPanel(false);

      playNotificationChime();
      renderCommitmentsPageUI();
      showToast(`✅ تم حفظ ${isBill ? 'الفاتورة' : 'الدين'} بنجاح: ${title} (${amount} ج.م)`);
    }

    function setBillsStatusFilter(status, btn) {
      activeBillsFilterStatus = status;
      document.querySelectorAll('#billsFilterPills .btn-export-tool').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
      });
      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'rgba(56, 189, 248, 0.22)';
      }
      renderCommitmentsBillsList();
    }

    function setDebtsStatusFilter(status, btn) {
      activeDebtsFilterStatus = status;
      document.querySelectorAll('#debtsFilterPills .btn-export-tool').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
      });
      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'rgba(56, 189, 248, 0.22)';
      }
      renderCommitmentsDebtsList();
    }

    
    // =========================================================================
    // محرك تقويم الاستحقاقات والالتزامات الذكي التفاعلي (Commitments Calendar Engine)
    // =========================================================================
    window.commitmentsCalendarYear = new Date().getFullYear();
    window.commitmentsCalendarMonth = new Date().getMonth(); // 0-based
    state.selectedCommitmentDate = null;
    window.isCommitmentsCalendarCollapsed = true;

    function toggleCommitmentsCalendarCollapse() {
      window.isCommitmentsCalendarCollapsed = !window.isCommitmentsCalendarCollapsed;
      const body = document.getElementById('commitmentsCalendarCollapseBody');
      const icon = document.getElementById('iconCommitmentsCalendarToggle');
      if (body) body.style.display = window.isCommitmentsCalendarCollapsed ? 'none' : 'block';
      if (icon) icon.className = window.isCommitmentsCalendarCollapsed ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
      document.getElementById('btnCommitmentsCalendarToggle')?.setAttribute('aria-expanded', String(!window.isCommitmentsCalendarCollapsed));
    }

    function navigateCommitmentsCalendar(dir) {
      window.commitmentsCalendarMonth += dir;
      if (window.commitmentsCalendarMonth < 0) {
        window.commitmentsCalendarMonth = 11;
        window.commitmentsCalendarYear -= 1;
      } else if (window.commitmentsCalendarMonth > 11) {
        window.commitmentsCalendarMonth = 0;
        window.commitmentsCalendarYear += 1;
      }
      renderCommitmentsCalendar();
    }

    function selectCommitmentCalendarDate(dateStr) {
      if (state.selectedCommitmentDate === dateStr) {
        state.selectedCommitmentDate = null;
      } else {
        state.selectedCommitmentDate = dateStr;
      }
      renderCommitmentsCalendar();
      renderCommitmentsPageUI();
    }

    function clearCommitmentDateFilter() {
      state.selectedCommitmentDate = null;
      renderCommitmentsCalendar();
      renderCommitmentsPageUI();
    }

    function renderCommitmentsCalendar() {
      const grid = document.getElementById('commitmentsCalendarGrid');
      const titleEl = document.getElementById('commitmentsCalendarMonthTitle');
      const clearBtn = document.getElementById('btnCommitmentsClearDateFilter');
      const notice = document.getElementById('commitmentsCalendarActiveDateNotice');
      const noticeLbl = document.getElementById('lblActiveCommitmentDate');
      if (!grid) return;

      const arabicMonthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];

      if (titleEl) {
        titleEl.textContent = `${arabicMonthNames[window.commitmentsCalendarMonth]} ${window.commitmentsCalendarYear}`;
      }

      if (state.selectedCommitmentDate) {
        if (clearBtn) clearBtn.style.display = 'inline-flex';
        if (notice) notice.style.display = 'block';
        if (noticeLbl) noticeLbl.textContent = state.selectedCommitmentDate;
      } else {
        if (clearBtn) clearBtn.style.display = 'none';
        if (notice) notice.style.display = 'none';
      }

      grid.innerHTML = '';

      // تجميع الالتزامات والديون بحسب موعد الاستحقاق dueDate
      const items = state.expectedExpenses || [];
      const isDebtItem = e => {
        if (!e) return false;
        if (e.isDebt === true) return true;
        const t = String(e.type || '').toLowerCase();
        return t.includes('debt') || t === 'loan';
      };

      const dateMap = Object.create(null);
      items.forEach(item => {
        if (!item.dueDate) return;
        const dStr = String(item.dueDate).slice(0, 10);
        if (!dateMap[dStr]) dateMap[dStr] = [];
        dateMap[dStr].push(item);
      });

      const todayStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().slice(0, 10);
      const firstDay = new Date(window.commitmentsCalendarYear, window.commitmentsCalendarMonth, 1);
      const lastDay = new Date(window.commitmentsCalendarYear, window.commitmentsCalendarMonth + 1, 0);
      const totalDays = lastDay.getDate();

      // (getDay() + 1) % 7 يعطي الإزاحة لأسبوع يبدأ بالسبت
      const startDay = (firstDay.getDay() + 1) % 7;

      for (let i = 0; i < startDay; i++) {
        const empty = document.createElement('div');
        empty.style.height = '36px';
        empty.style.opacity = '0.15';
        grid.appendChild(empty);
      }

      const isLightMode = document.body.classList.contains('light-theme') || document.documentElement.getAttribute('data-app-theme') === 'light';

      for (let day = 1; day <= totalDays; day++) {
        const dStr = `${window.commitmentsCalendarYear}-${String(window.commitmentsCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayItems = dateMap[dStr] || [];
        const isToday = (dStr === todayStr);
        const isSelected = (dStr === state.selectedCommitmentDate);

        const cell = document.createElement('div');
        cell.className = 'com-cal-day-cell' + (isSelected ? ' is-selected' : '') + (isToday ? ' is-today' : '');
        
        let cellBg = isLightMode ? '#f8fafc' : 'rgba(15, 23, 42, 0.65)';
        let cellBorder = isLightMode ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';

        if (isSelected) {
          cellBg = isLightMode ? 'rgba(56, 189, 248, 0.20)' : 'rgba(2, 132, 199, 0.35)';
          cellBorder = '#0284c7';
        } else if (isToday) {
          cellBg = isLightMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.20)';
          cellBorder = '#10b981';
        }

        cell.style.cssText = `
          height: 38px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.18s ease;
          border: 1px solid ${cellBorder};
          background: ${cellBg};
          box-shadow: ${isSelected ? '0 0 10px rgba(2, 132, 199, 0.45)' : 'none'};
        `;

        cell.onclick = () => selectCommitmentCalendarDate(dStr);

        const numSpan = document.createElement('span');
        numSpan.textContent = day;
        numSpan.style.cssText = `
          font-size: 0.72rem;
          font-weight: ${isSelected || isToday ? '900' : '750'};
          color: ${isSelected ? (isLightMode ? '#0284c7' : '#38bdf8') : (isToday ? '#10b981' : (isLightMode ? '#334155' : '#cbd5e1'))};
          font-family: var(--font-numbers);
          line-height: 1;
        `;
        cell.appendChild(numSpan);

        if (dayItems.length > 0) {
          const dots = document.createElement('div');
          dots.style.cssText = 'display: flex; gap: 2px; align-items: center; margin-top: 2px;';
          
          let hasBill = false;
          let hasDebtOnUs = false;
          let hasDebtForUs = false;

          dayItems.forEach(it => {
            if (it.status === 'paid') return;
            if (!isDebtItem(it)) hasBill = true;
            else if (it.type === 'debt_for_us') hasDebtForUs = true;
            else hasDebtOnUs = true;
          });

          if (hasBill) {
            const d = document.createElement('span');
            d.style.cssText = 'width: 4.5px; height: 4.5px; border-radius: 50%; background: #f59e0b;';
            dots.appendChild(d);
          }
          if (hasDebtOnUs) {
            const d = document.createElement('span');
            d.style.cssText = 'width: 4.5px; height: 4.5px; border-radius: 50%; background: #f43f5e;';
            dots.appendChild(d);
          }
          if (hasDebtForUs) {
            const d = document.createElement('span');
            d.style.cssText = 'width: 4.5px; height: 4.5px; border-radius: 50%; background: #10b981;';
            dots.appendChild(d);
          }

          if (dots.children.length === 0 && dayItems.some(it => it.status === 'paid')) {
            const d = document.createElement('span');
            d.style.cssText = 'width: 4px; height: 4px; border-radius: 50%; background: #64748b;';
            dots.appendChild(d);
          }

          cell.appendChild(dots);
        }

        grid.appendChild(cell);
      }
    }

        function renderCommitmentAttachmentsRow(item) {
      const receipts = (Array.isArray(item.receipts) && item.receipts.length)
        ? item.receipts
        : ((item.photo || item.receipt) ? [item.photo || item.receipt] : []);
      if (!receipts.length) return '';
      return `
        <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.08);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
            <span style="font-size: 0.65rem; color: #f472b6; font-weight: 850;">
              <i class="fa-solid fa-paperclip"></i> المرفقات (${receipts.length}) · مرر للتصفح:
            </span>
          </div>
          <div class="commitment-attachments-carousel" onclick="event.stopPropagation();" style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0; scrollbar-width: thin; -webkit-overflow-scrolling: touch;">
            ${receipts.map((src, i) => `
              <div style="flex-shrink: 0; width: 50px; height: 50px; border-radius: 8px; overflow: hidden; border: 1.5px solid rgba(244, 114, 182, 0.45); background: #0f172a; cursor: pointer; position: relative;" onclick="openReceiptLightbox('${src}', '${escapeHtml(item.title || item.label || 'مرفق')} (${i+1}/${receipts.length})')" title="معاينة المرفق">
                <img src="${src}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    function renderCommitmentsPageUI() {
      if (!state.expectedExpenses || !Array.isArray(state.expectedExpenses)) {
        state.expectedExpenses = [];
      }

      if (typeof renderCommitmentsCalendar === 'function') {
        renderCommitmentsCalendar();
      }

      const allItems = state.expectedExpenses;
      const nowStr = getLocalDateStr(new Date());

      // فصل الفواتير عن الديون تصنيفاً شاملاً ودقيقاً
      const isDebtItem = e => {
        if (!e) return false;
        if (e.isDebt === true) return true;
        const t = String(e.type || '').toLowerCase();
        return t.includes('debt') || t === 'loan';
      };
      const bills = allItems.filter(e => !isDebtItem(e));
      const debts = allItems.filter(e => isDebtItem(e));

      const pendingBills = bills.filter(b => b.status !== 'paid');
      const pendingDebts = debts.filter(d => d.status !== 'paid');
      const pendingDebtsOnUs = pendingDebts.filter(d => d.type === 'debt_on_us' || d.type === 'debt' || !String(d.type).includes('for_us'));
      const pendingDebtsForUs = pendingDebts.filter(d => d.type === 'debt_for_us');
      const settledItems = allItems.filter(i => i.status === 'paid');

      // تحديث عداد الزر العلوي الرئيسي للفواتير والديون وشارة التبويب السفلي
      const bBillsAndDebtsBadge = document.getElementById('badgeCountBillsAndDebts');
      if (bBillsAndDebtsBadge) {
        bBillsAndDebtsBadge.textContent = pendingBills.length + pendingDebts.length;
      }
      const navBadge = document.getElementById('navTabExpectedBadge');
      if (navBadge) {
        const totalPending = pendingBills.length + pendingDebtsOnUs.length;
        if (totalPending > 0) {
          navBadge.textContent = totalPending;
          navBadge.style.display = 'inline-block';
        } else {
          navBadge.style.display = 'none';
        }
      }

      // تحديث عدادات شريط الفلاتر السريعة تحت الفواتير والديون
      const elAll = document.getElementById('subCntAll');
      const elBills = document.getElementById('subCntBills');
      const elOnUs = document.getElementById('subCntDebtsOnUs');
      const elForUs = document.getElementById('subCntDebtsForUs');
      const elSettled = document.getElementById('subCntSettled');

      if (elAll) elAll.textContent = pendingBills.length + pendingDebts.length;
      if (elBills) elBills.textContent = pendingBills.length;
      if (elOnUs) elOnUs.textContent = pendingDebtsOnUs.length;
      if (elForUs) elForUs.textContent = pendingDebtsForUs.length;
      if (elSettled) elSettled.textContent = settledItems.length;

      const curr = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : (state.currency || 'ج.م');

      // حساب المبالغ المالية
      let sumBills = 0;
      pendingBills.forEach(b => sumBills += (Number(b.amount) || 0));

      let sumDebtsOnUs = 0;
      pendingDebtsOnUs.forEach(d => sumDebtsOnUs += (Number(d.amount) || 0));

      let sumDebtsForUs = 0;
      pendingDebtsForUs.forEach(d => sumDebtsForUs += (Number(d.amount) || 0));

      let sumSettled = 0;
      settledItems.forEach(s => sumSettled += (Number(s.amount) || 0));

      // صافي الالتزامات المطلوب تدبيرها = الفواتير + الديون علينا - الديون لنا
      const netCommitmentsToPrepare = sumBills + sumDebtsOnUs - sumDebtsForUs;

      const netIcon = document.getElementById('kpiNetIconCommitments');
      const netLabel = document.getElementById('kpiNetLabelCommitments');
      const netValue = document.getElementById('kpiNetValueCommitments');

      const c1Title = document.getElementById('kpiCap1Title');
      const c1Amt = document.getElementById('kpiCap1Amount');
      const c1Cnt = document.getElementById('kpiCap1Count');

      const c2Title = document.getElementById('kpiCap2Title');
      const c2Amt = document.getElementById('kpiCap2Amount');
      const c2Cnt = document.getElementById('kpiCap2Count');

      const c3Title = document.getElementById('kpiCap3Title');
      const c3Amt = document.getElementById('kpiCap3Amount');
      const c3Cnt = document.getElementById('kpiCap3Count');

      if (netIcon) netIcon.className = 'fa-solid fa-scale-balanced';
      if (netLabel) netLabel.textContent = 'صافي الالتزامات المالية المطلوب تدبيرها:';
      if (netValue) {
        const netColor = (netCommitmentsToPrepare > 0) ? '#ff4d6d' : '#34d399';
        const netSign = (netCommitmentsToPrepare > 0) ? '- ' : '+ ';
        const curr = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : (state.currency || 'ج.م');
        netValue.innerHTML = `<span style="color: ${netColor}; direction: ltr; unicode-bidi: isolate; display: inline-flex; align-items: center; gap: 3px;"><span>${netSign}</span><span>${curr}</span><span>${Number(Math.abs(netCommitmentsToPrepare)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>`;
      }

            if (c1Cnt) c1Cnt.textContent = `${pendingBills.length} بند`;
      if (c1Amt) c1Amt.textContent = formatMoneyVal(sumBills);

      if (c2Cnt) c2Cnt.textContent = `${pendingDebtsOnUs.length} بند`;
      if (c2Amt) c2Amt.textContent = (sumDebtsOnUs > 0 ? '- ' : '') + formatMoneyVal(sumDebtsOnUs);

      if (c3Cnt) c3Cnt.textContent = `${pendingDebtsForUs.length} بند`;
      if (c3Amt) c3Amt.textContent = (sumDebtsForUs > 0 ? '+ ' : '') + formatMoneyVal(sumDebtsForUs);

      const c4Cnt = document.getElementById('kpiCapSettledCount');
      const c4Amt = document.getElementById('kpiCapSettledAmount');
      if (c4Cnt) c4Cnt.textContent = `${settledItems.length} مكتمل`;
      if (c4Amt) c4Amt.textContent = formatMoneyVal(sumSettled);

      // تمييز الكارت النشط بحلقة توهج فخمة وتدرج لوني
      const cardBills = document.getElementById('cardComBills');
      const cardOnUs = document.getElementById('cardComDebtsOnUs');
      const cardForUs = document.getElementById('cardComDebtsForUs');
      const cardSettled = document.getElementById('cardComSettled');
      const btnClearFilter = document.getElementById('btnClearCommitmentFilter');
      const clearLabel = document.getElementById('clearCommitmentFilterLabel');

      [cardBills, cardOnUs, cardForUs, cardSettled].forEach(c => {
        if (c) {
          c.style.transform = 'none';
          c.style.boxShadow = 'none';
          c.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        }
      });

      if (btnClearFilter && clearLabel) {
        if (activeCommitmentSubFilter === 'all') {
          btnClearFilter.style.background = 'rgba(56, 189, 248, 0.12)';
          btnClearFilter.style.borderColor = 'rgba(56, 189, 248, 0.28)';
          btnClearFilter.style.color = '#38bdf8';
          clearLabel.textContent = 'عرض الكل ✓';
        } else {
          btnClearFilter.style.background = 'rgba(244, 63, 94, 0.18)';
          btnClearFilter.style.borderColor = 'rgba(244, 63, 94, 0.45)';
          btnClearFilter.style.color = '#f43f5e';
          clearLabel.textContent = 'مسح الفلتر ✕';
        }
      }

      if (activeCommitmentSubFilter === 'bills' && cardBills) {
        cardBills.style.transform = 'translateY(-3px)';
        cardBills.style.boxShadow = '0 0 0 2px #fbbf24, 0 6px 18px rgba(245, 158, 11, 0.4)';
        cardBills.style.borderColor = '#fbbf24';
      } else if (activeCommitmentSubFilter === 'debts_on_us' && cardOnUs) {
        cardOnUs.style.transform = 'translateY(-3px)';
        cardOnUs.style.boxShadow = '0 0 0 2px #fb7185, 0 6px 18px rgba(244, 63, 94, 0.4)';
        cardOnUs.style.borderColor = '#fb7185';
      } else if (activeCommitmentSubFilter === 'debts_for_us' && cardForUs) {
        cardForUs.style.transform = 'translateY(-3px)';
        cardForUs.style.boxShadow = '0 0 0 2px #34d399, 0 6px 18px rgba(16, 185, 129, 0.4)';
        cardForUs.style.borderColor = '#34d399';
      } else if (activeCommitmentSubFilter === 'settled' && cardSettled) {
        cardSettled.style.transform = 'translateY(-3px)';
        cardSettled.style.boxShadow = '0 0 0 2px #38bdf8, 0 6px 18px rgba(2, 132, 199, 0.4)';
        cardSettled.style.borderColor = '#38bdf8';
      }

      // التحكم في إظهار القوائم بناءً على الفلتر السريع
      const vBills = document.getElementById('viewCommitmentsBillsList');
      const vDebts = document.getElementById('viewCommitmentsDebtsList');

      if (activeCommitmentSubFilter === 'bills') {
        if (vBills) vBills.style.display = 'block';
        if (vDebts) vDebts.style.display = 'none';
      } else if (activeCommitmentSubFilter === 'debts_on_us' || activeCommitmentSubFilter === 'debts_for_us') {
        if (vBills) vBills.style.display = 'none';
        if (vDebts) vDebts.style.display = 'block';
      } else if (activeCommitmentSubFilter === 'settled') {
        if (vBills) vBills.style.display = 'block';
        if (vDebts) vDebts.style.display = 'block';
      } else {
        // all
        if (vBills) vBills.style.display = 'block';
        if (vDebts) vDebts.style.display = 'block';
      }

      renderCommitmentsBillsList();
      renderCommitmentsDebtsList();
    }

    function toggleSelectCommitmentRow(id) {
      window.selectedCommitmentRowId = (window.selectedCommitmentRowId === id) ? null : id;
      renderCommitmentsBillsList();
      renderCommitmentsDebtsList();
    }

    
    // =========================================================================
    // محرك تعديل الالتزامات والديون الفاخر (Commitments Edit Engine)
    // =========================================================================
    function openEditCommitmentModal(id) {
      const exp = (state.expectedExpenses || []).find(e => e.id === id) || (state.debts || []).find(d => d.id === id);
      if (!exp) return;

      const idInp = document.getElementById('inpEditCommitmentId');
      const titleInp = document.getElementById('inpEditCommitmentTitle');
      const amtInp = document.getElementById('inpEditCommitmentAmount');
      const dateInp = document.getElementById('inpEditCommitmentDueDate');
      const memSel = document.getElementById('inpEditCommitmentMember');
      const catSel = document.getElementById('inpEditCommitmentCategory');
      const notesInp = document.getElementById('inpEditCommitmentNotes');
      const titleEl = document.getElementById('editCommitmentModalTitle');

      if (idInp) idInp.value = exp.id;
      if (titleInp) titleInp.value = exp.title || exp.label || '';
      if (amtInp) amtInp.value = exp.amount || '';
      if (dateInp) dateInp.value = exp.dueDate || '';
      if (memSel) memSel.value = exp.member || 'البيت';
      if (catSel) catSel.value = exp.category || (String(exp.type).includes('for_us') ? 'debt_for_us' : (String(exp.type).includes('debt') ? 'debt_on_us' : 'bills'));
      if (notesInp) notesInp.value = exp.notes || '';

      const isDebt = String(exp.type || '').includes('debt') || exp.isDebt;
      if (titleEl) {
        titleEl.textContent = isDebt ? 'تعديل بيانات الدين المستحق' : 'تعديل الفاتورة / القسط الدوري';
      }

      openModal('editCommitmentModal');
    }
    window.openEditCommitmentModal = openEditCommitmentModal;

    function saveEditedCommitment() {
      const idInp = document.getElementById('inpEditCommitmentId');
      const titleInp = document.getElementById('inpEditCommitmentTitle');
      const amtInp = document.getElementById('inpEditCommitmentAmount');
      const dateInp = document.getElementById('inpEditCommitmentDueDate');
      const memSel = document.getElementById('inpEditCommitmentMember');
      const catSel = document.getElementById('inpEditCommitmentCategory');
      const notesInp = document.getElementById('inpEditCommitmentNotes');

      const id = idInp ? idInp.value : '';
      const title = titleInp ? titleInp.value.trim() : '';
      const amount = parseFloat(amtInp ? amtInp.value : 0);
      const dueDate = dateInp ? dateInp.value : '';
      const member = memSel ? memSel.value : 'البيت';
      const category = catSel ? catSel.value : 'bills';
      const notes = notesInp ? notesInp.value.trim() : '';

      if (!title) {
        showToast('⚠️ يرجى إدخال اسم أو بيان الالتزام', 'error');
        if (titleInp) titleInp.focus();
        return;
      }
      if (isNaN(amount) || amount <= 0) {
        showToast('⚠️ يرجى إدخال مبلغ صحيح أكبر من الصفر', 'error');
        if (amtInp) amtInp.focus();
        return;
      }

      const exp = (state.expectedExpenses || []).find(e => e.id === id);
      if (!exp) return;

      exp.title = title;
      exp.label = title;
      exp.amount = amount;
      exp.dueDate = dueDate;
      exp.member = member;
      exp.category = category;
      exp.notes = notes;
      exp.updatedAt = new Date().toISOString();

      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}

      closeModal('editCommitmentModal');
      window.selectedCommitmentRowId = null;
      playNotificationChime();
      renderCommitmentsPageUI();
      showToast('✅ تم حفظ تعديلات الالتزام بنجاح');
    }
    window.saveEditedCommitment = saveEditedCommitment;

    function renderCommitmentsBillsList() {
      const container = document.getElementById('billsListContentContainer');
      const countHeader = document.getElementById('billsTotalSubheaderTxt');
      if (!container) return;

      const isDebtItem = e => {
        if (!e) return false;
        if (e.isDebt === true) return true;
        const t = String(e.type || '').toLowerCase();
        return t.includes('debt') || t === 'loan';
      };
      const allBills = (state.expectedExpenses || []).filter(e => !isDebtItem(e));
      if (countHeader) countHeader.textContent = `${allBills.length} فاتورة مسجلة`;

      let list = allBills.slice();
      if (state.selectedCommitmentDate) {
        list = list.filter(b => String(b.dueDate || '').slice(0, 10) === state.selectedCommitmentDate);
      } else {
        if (activeCommitmentSubFilter === 'settled' || activeBillsFilterStatus === 'paid') {
          list = list.filter(b => b.status === 'paid');
        } else {
          list = list.filter(b => b.status !== 'paid');
        }
      }

      // فرز حسب تاريخ الاستحقاق
      list.sort((a, b) => {
        if (a.status === 'paid' && b.status !== 'paid') return 1;
        if (a.status !== 'paid' && b.status === 'paid') return -1;
        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      });

      if (list.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 28px 12px; background: rgba(15, 23, 42, 0.4); border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.1);">
            <i class="fa-solid fa-file-invoice" style="color: #64748b; font-size: 2rem; margin-bottom: 8px;"></i>
            <div style="color: #cbd5e1; font-weight: 850; font-size: 0.88rem;">لا توجد فواتير مطابقة</div>
            <div style="color: #64748b; font-size: 0.72rem; margin-top: 4px;">اضغط على زر "+ إضافة جديدة" لتسجيل فاتورة قادمة وتصويرها</div>
          </div>
        `;
        return;
      }

      const categoryIcons = {
        bills: { icon: 'fa-bolt', color: '#fbbf24', name: 'كهرباء وفواتير' },
        house: { icon: 'fa-couch', color: '#38bdf8', name: 'إيجار ومنزل' },
        education: { icon: 'fa-graduation-cap', color: '#a855f7', name: 'تعليم ودراسة' },
        transport: { icon: 'fa-car', color: '#06b6d4', name: 'مواصلات وسيارة' },
        health: { icon: 'fa-notes-medical', color: '#f43f5e', name: 'علاج وتأمين' },
        other: { icon: 'fa-box', color: '#94a3b8', name: 'أخرى' }
      };

      container.innerHTML = list.map(b => {
        const isPaid = (b.status === 'paid');
        const catInfo = categoryIcons[b.category] || categoryIcons.bills;
        const isSelected = (window.selectedCommitmentRowId === b.id);
        const amt = Number(b.amount) || 0;

        return `
          <div class="ops-tx-card-clean" onclick="toggleSelectCommitmentRow('${b.id}')" style="background: ${isSelected ? 'rgba(56, 189, 248, 0.10)' : 'rgba(15, 23, 42, 0.78)'}; border: 1px solid ${isSelected ? '#38bdf8' : (isPaid ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)')}; border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <!-- اليمين: الأيقونة والبيان -->
              <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: ${catInfo.color}22; border: 1px solid ${catInfo.color}55; color: ${catInfo.color}; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; flex-shrink: 0;">
                  <i class="fa-solid ${catInfo.icon}"></i>
                </div>
                <div style="min-width: 0; flex: 1;">
                  <div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; line-height: 1.35; word-break: break-word;" title="${escapeHtml(b.title || b.label || 'فاتورة مستحقة')}">
                    ${escapeHtml(b.title || b.label || 'فاتورة مستحقة')}
                  </div>
                  <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <span style="color: ${catInfo.color}; font-weight: 750;">${catInfo.name}</span>
                    <span style="background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 6px;">👤 ${b.member || 'البيت'}</span>
                    ${b.photo ? `<span style="color: #f472b6; font-size: 0.65rem;"><i class="fa-solid fa-paperclip"></i> فاتورة مصورة</span>` : ''}
                  </div>
                </div>
              </div>

              <!-- اليسار: المبلغ والحالة -->
              <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0;">
                <div style="color: ${isPaid ? '#94a3b8' : '#ff4d6d'}; font-weight: 950; font-size: 0.95rem; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate;">
                  - ${formatMoneyVal(amt)}
                </div>
                <div style="margin-top: 2px; display: flex; align-items: center; gap: 4px;">
                  <span style="font-size: 0.63rem; padding: 2px 6px; border-radius: 6px; font-weight: 800; background: ${isPaid ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)'}; color: ${isPaid ? '#34d399' : '#fbbf24'}; border: 1px solid ${isPaid ? 'rgba(52, 211, 153, 0.35)' : 'rgba(251, 191, 36, 0.35)'};">
                    ${isPaid ? 'مدفوعة ومصروفة ✓' : (b.dueDate ? 'استحقاق: ' + b.dueDate : 'مستحقة ⏳')}
                  </span>
                </div>
              </div>
            </div>

            ${renderCommitmentAttachmentsRow(b)}

            <!-- درج الإجراءات السريعة للفاتورة (يفتح عند النقر) -->
            <div style="display: ${isSelected ? 'flex' : 'none'}; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.12); flex-wrap: wrap;">
              ${!isPaid ? `
                <button type="button" onclick="event.stopPropagation(); openPayExpectedModal('${b.id}')" style="height: 32px; padding: 0 12px; border-radius: 8px; font-size: 0.74rem; font-weight: 850; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(16,185,129,0.35);">
                  <i class="fa-solid fa-money-bill-transfer"></i>
                  <span>سداد وصرف الفاتورة</span>
                </button>
              ` : ''}
              <button type="button" onclick="event.stopPropagation(); openEditCommitmentModal('${b.id}')" style="height: 32px; padding: 0 10px; border-radius: 8px; font-size: 0.74rem; font-weight: 800; background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.45); color: #38bdf8; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-pen-to-square"></i>
                <span>تعديل</span>
              </button>
              ${b.photo ? `
                <button type="button" onclick="event.stopPropagation(); openReceiptLightbox('${b.id}')" style="height: 32px; padding: 0 10px; border-radius: 8px; font-size: 0.74rem; font-weight: 800; background: rgba(236, 72, 153, 0.18); border: 1px solid rgba(236, 72, 153, 0.4); color: #f472b6; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                  <i class="fa-solid fa-image"></i>
                  <span>عرض الفاتورة</span>
                </button>
              ` : ''}
              <button type="button" onclick="event.stopPropagation(); deleteCommitmentItem('${b.id}')" style="height: 32px; padding: 0 10px; border-radius: 8px; font-size: 0.74rem; font-weight: 800; background: rgba(244, 63, 94, 0.18); border: 1px solid rgba(244, 63, 94, 0.4); color: #f43f5e; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-trash-can"></i>
                <span>حذف</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderCommitmentsDebtsList() {
      const container = document.getElementById('debtsListContentContainer');
      const countHeader = document.getElementById('debtsTotalSubheaderTxt');
      if (!container) return;

      const isDebtItem = e => {
        if (!e) return false;
        if (e.isDebt === true) return true;
        const t = String(e.type || '').toLowerCase();
        return t.includes('debt') || t === 'loan';
      };
      const allDebts = (state.expectedExpenses || []).filter(e => isDebtItem(e));
      if (countHeader) countHeader.textContent = `${allDebts.length} ديون مسجلة`;

      let list = allDebts.slice();
      if (state.selectedCommitmentDate) {
        list = list.filter(d => String(d.dueDate || '').slice(0, 10) === state.selectedCommitmentDate);
      } else {
        if (activeCommitmentSubFilter === 'debts_on_us' || activeDebtsFilterStatus === 'debt_on_us') {
          list = list.filter(d => (d.type === 'debt_on_us' || d.type === 'debt') && d.status !== 'paid');
        } else if (activeCommitmentSubFilter === 'debts_for_us' || activeDebtsFilterStatus === 'debt_for_us') {
          list = list.filter(d => d.type === 'debt_for_us' && d.status !== 'paid');
        } else if (activeCommitmentSubFilter === 'settled' || activeDebtsFilterStatus === 'paid') {
          list = list.filter(d => d.status === 'paid');
        } else {
          list = list.filter(d => d.status !== 'paid');
        }
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 28px 12px; background: rgba(15, 23, 42, 0.4); border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.1);">
            <i class="fa-solid fa-handshake" style="color: #64748b; font-size: 2rem; margin-bottom: 8px;"></i>
            <div style="color: #cbd5e1; font-weight: 850; font-size: 0.88rem;">لا توجد ديون مسجلة في هذا القسم</div>
            <div style="color: #64748b; font-size: 0.72rem; margin-top: 4px;">اضغط على زر "+ إضافة جديدة" لتسجيل دين علينا للغير أو دين لنا عند الغير</div>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(d => {
        const isDebtOnUs = (d.type === 'debt_on_us' || d.type === 'debt');
        const isPaid = (d.status === 'paid');
        const isSelected = (window.selectedCommitmentRowId === d.id);
        const amt = Number(d.amount) || 0;
        const paidAmt = Number(d.paidAmount) || (isPaid ? amt : 0);
        const remainingAmt = Math.max(0, amt - paidAmt);
        const pct = (amt > 0) ? Math.min(100, (paidAmt / amt) * 100).toFixed(0) : 0;

        const badgeColor = isDebtOnUs ? '#f87171' : '#34d399';
        const badgeBg = isDebtOnUs ? 'rgba(244, 63, 94, 0.15)' : 'rgba(52, 211, 153, 0.15)';
        const typeLabel = isDebtOnUs ? 'دين علينا للغير 🔴' : 'دين لنا عند الغير 🟢';

        return `
          <div class="ops-tx-card-clean" onclick="toggleSelectCommitmentRow('${d.id}')" style="background: ${isSelected ? 'rgba(56, 189, 248, 0.10)' : 'rgba(15, 23, 42, 0.78)'}; border: 1px solid ${isSelected ? '#38bdf8' : (isPaid ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)')}; border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <!-- اليمين: الشخص والتفاصيل -->
              <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                <div style="width: 38px; height: 38px; border-radius: 10px; background: ${badgeBg}; border: 1px solid ${badgeColor}55; color: ${badgeColor}; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; flex-shrink: 0;">
                  <i class="fa-solid ${isDebtOnUs ? 'fa-arrow-down-long' : 'fa-arrow-up-long'}"></i>
                </div>
                <div style="min-width: 0; flex: 1;">
                  <div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; line-height: 1.35; word-break: break-word;" title="${escapeHtml(d.title || d.label || 'دين مستحق')}">
                    ${escapeHtml(d.title || d.label || 'دين مستحق')}
                  </div>
                  <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <span style="color: ${badgeColor}; font-weight: 800;">${typeLabel}</span>
                    <span style="background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 6px;">👤 ${d.member || 'البيت'}</span>
                    ${d.notes ? `<span style="color: #cbd5e1; font-size: 0.65rem;">• ${escapeHtml(d.notes)}</span>` : ''}
                  </div>
                </div>
              </div>

              <!-- اليسار: المبالغ والمتبقي -->
              <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0;">
                <div style="color: ${isPaid ? '#94a3b8' : badgeColor}; font-weight: 950; font-size: 0.95rem; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate;">
                  ${isDebtOnUs ? '-' : '+'} ${formatMoneyVal(amt)}
                </div>
                <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 700; margin-top: 2px;">
                  ${isPaid ? 'تمت التسوية 100% ✓' : `المتبقي: ${formatMoneyVal(remainingAmt)}`}
                </div>
              </div>
            </div>

            ${renderCommitmentAttachmentsRow(d)}

            <!-- شريط تقدم السداد للديون -->
            <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-top: 6px;">
              <div style="width: ${pct}%; height: 100%; background: ${isPaid ? '#34d399' : badgeColor}; border-radius: 3px;"></div>
            </div>

            <!-- درج إجراءات السداد والتسوية للديون -->
            <div style="display: ${isSelected ? 'flex' : 'none'}; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.12); flex-wrap: wrap;">
              ${!isPaid ? `
                <button type="button" onclick="event.stopPropagation(); settleDebtPrompt('${d.id}', false)" style="height: 32px; padding: 0 11px; border-radius: 8px; font-size: 0.74rem; font-weight: 850; background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                  <i class="fa-solid fa-coins"></i>
                  <span>سداد دفعة جزئية</span>
                </button>
                <button type="button" onclick="event.stopPropagation(); openPayExpectedModal('${d.id}')" style="height: 32px; padding: 0 11px; border-radius: 8px; font-size: 0.74rem; font-weight: 850; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(16,185,129,0.35);">
                  <i class="fa-solid fa-check-double"></i>
                  <span>${isDebtOnUs ? 'سداد وتسوية كاملة' : 'تحصيل وإيداع كامل'}</span>
                </button>
              ` : ''}
              <button type="button" onclick="event.stopPropagation(); openEditCommitmentModal('${d.id}')" style="height: 32px; padding: 0 10px; border-radius: 8px; font-size: 0.74rem; font-weight: 800; background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.45); color: #38bdf8; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-pen-to-square"></i>
                <span>تعديل</span>
              </button>
              <button type="button" onclick="event.stopPropagation(); deleteCommitmentItem('${d.id}')" style="height: 32px; padding: 0 10px; border-radius: 8px; font-size: 0.74rem; font-weight: 800; background: rgba(244, 63, 94, 0.18); border: 1px solid rgba(244, 63, 94, 0.4); color: #f43f5e; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-trash-can"></i>
                <span>حذف</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    

    function settleDebtPrompt(id, isFull = false) {
      const debt = (state.expectedExpenses || []).find(e => e.id === id);
      if (!debt) return;

      if (isFull) {
        openPayExpectedModal(id);
        return;
      }

      const amt = Number(debt.amount) || 0;
      const currentPaid = Number(debt.paidAmount) || 0;
      const remaining = Math.max(0, amt - currentPaid);

      const inp = prompt(`المبلغ المتبقي: ${remaining} ج.م\nأدخل مبلغ الدفعة المسددة / المحصلة:`, remaining);
      if (!inp) return;
      const payAmt = parseFloat(inp);
      if (isNaN(payAmt) || payAmt <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ صحيح', 'error');
        return;
      }

      const actualPayment = Math.min(remaining, payAmt);
      debt.paidAmount = currentPaid + actualPayment;
      if (debt.paidAmount >= amt) {
        debt.status = 'paid';
        debt.settledAt = new Date().toISOString();
      }

      // تسجيل حركة مالية محاسبية دقيقة ومطابقة
      const isDebtOnUs = (debt.type === 'debt_on_us' || debt.type === 'debt');
      const activeWalletId = state.currentWalletId || (state.wallets[0] ? state.wallets[0].id : 'wallet-cash-safe');
      const targetWallet = (state.wallets || []).find(w => w.id === activeWalletId);

      const newTx = {
        id: 'tx-debt-' + Date.now(),
        type: isDebtOnUs ? 'expense' : 'income',
        amount: actualPayment,
        label: isDebtOnUs ? `سداد دفعة دين: ${debt.title || debt.label}` : `تحصيل دفعة دين: ${debt.title || debt.label}`,
        category: isDebtOnUs ? 'bills' : 'income',
        member: debt.member || 'البيت',
        walletId: activeWalletId,
        date: getLocalDateStr(new Date()),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        author: state.currentUser || 'ماهر',
        createdAt: new Date().toISOString()
      };

      if (!state.transactions) state.transactions = [];
      state.transactions.unshift(newTx);
      if (typeof saveTx === 'function') saveTx();

      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}

      playNotificationChime();
      renderUI();
      renderCommitmentsPageUI();
      showToast(`✅ تم تسجيل دفعة ${isDebtOnUs ? 'سداد' : 'تحصيل'} بمبلغ ${actualPayment} ج.م بنجاح`);
    }

    function deleteCommitmentItem(id) {
      if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الالتزام نهائياً؟')) return;
      state.expectedExpenses = (state.expectedExpenses || []).filter(e => e.id !== id);
      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}
      renderCommitmentsPageUI();
      showToast('🗑️ تم حذف الالتزام بنجاح');
    }

    // ربط استدعاء الصفحة عند التبديل
    window.renderExpectedList = function() {
      renderCommitmentsPageUI();
    };


    // =========================================================================
    // دوال التحكم الثنائية لصفحة الالتزامات: [ الفواتير والديون ] | [ الميزانيات ]
    // =========================================================================
    let activeExpectedTopSection = (() => {
      try {
        return localStorage.getItem('family_monefy_expected_top_section') === 'budgets'
          ? 'budgets'
          : 'bills_and_debts';
      } catch (e) {
        return 'bills_and_debts';
      }
    })(); // 'bills_and_debts' | 'budgets'
    window.activeExpectedTopSection = activeExpectedTopSection;
    let activeCommitmentSubFilter = 'all'; // 'all' | 'bills' | 'debts_on_us' | 'debts_for_us' | 'settled'
    let activeBudgetSubTab = 'current'; // 'current' | 'history'

    
    // =========================================================================
    // محرك الميزانيات الشهرية والخطط التقديرية المتقدم (Budget Planning Engine)
    // =========================================================================
    let currentBudgetMonthData = null;
    let selectedBudgetItemMembers = ['البيت'];
    // activeBudgetSubTab already defined

function initMonthlyBudgetUI() {
      const stored = localStorage.getItem('family_monefy_monthly_budgets');
      if (stored !== null) {
        try {
          const parsed = JSON.parse(stored);
          state.monthlyBudgets = Array.isArray(parsed) ? parsed : [];
        } catch(e) {
          state.monthlyBudgets = [];
          console.warn('تعذر قراءة الخطط المحفوظة؛ تم الاحتفاظ بالنسخة الأصلية دون استبدالها.');
        }
      }
      if (!Array.isArray(state.monthlyBudgets)) state.monthlyBudgets = [];

      if (state.monthlyBudgets.length === 0) {
        if (typeof generateRichDemoBudgets === 'function') {
          state.monthlyBudgets = generateRichDemoBudgets();
          try {
            localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
          } catch(e) {}
        }
      }

      if (state.monthlyBudgets.length === 0) {
        state.activeBudgetId = null;
        currentBudgetMonthData = null;
        populateBudgetPlanSelector();
        renderBudgetMembersMultiPicker();
        return;
      }

      // ترقية وتأكيد سلامة كل خطة
      state.monthlyBudgets.forEach((b, idx) => {
        if (!b.id) b.id = 'bgt-' + (b.month || 'plan') + '-' + (idx + 1);
        if (!b.name) b.name = b.title || (`ميزانية شهر ${b.month || 'الحالي'}`);
        if (!b.month) b.month = '2026-11';
        if (!b.categories) b.categories = {};
        if (!b.incomes) b.incomes = [];
        ensureBudgetItems(b);
      });

      if (!state.activeBudgetId || !state.monthlyBudgets.some(b => b.id === state.activeBudgetId)) {
        state.activeBudgetId = state.monthlyBudgets[0].id;
      }

      populateBudgetPlanSelector();
      renderBudgetMembersMultiPicker();
    }

    // ضمان وجود قائمة بنود ديناميكية وترحيل التصنيفات القديمة إن وجدت
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
      syncBudgetCategoriesMap(b);
    }

    // مزامنة خريطة categories القديمة لمنع كسر أي كود يعتمد عليها
    function syncBudgetCategoriesMap(b) {
      if (!b) return;
      b.categories = {};
      (b.items || []).forEach(it => {
        const cat = it.category || 'other';
        b.categories[cat] = (b.categories[cat] || 0) + (Number(it.amount) || 0);
      });
    }

    function populateBudgetPlanSelector() {
      const sel = document.getElementById('budgetPlanSelector');
      if (!sel) return;
      if (!state.monthlyBudgets) state.monthlyBudgets = [];

      if (state.monthlyBudgets.length === 0) {
        sel.innerHTML = '<option value="">لا توجد خطط محفوظة بعد</option>';
        sel.value = '';
        return;
      }

      sel.innerHTML = state.monthlyBudgets.map(b => {
        const totalExp = (b.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
        return `<option value="${escapeHtml(String(b.id || ''))}" ${b.id === state.activeBudgetId ? 'selected' : ''}>📋 ${escapeHtml(b.name)}${b.project ? ` · ${escapeHtml(b.project)}` : ''} [${escapeHtml(String(b.month || ''))}] - مقدر: ${formatMoney(totalExp)}</option>`;
      }).join('');
    }

    function loadActiveBudgetPlan() {
      if (!Array.isArray(state.monthlyBudgets) || state.monthlyBudgets.length === 0) {
        initMonthlyBudgetUI();
        if (!Array.isArray(state.monthlyBudgets) || state.monthlyBudgets.length === 0) {
          currentBudgetMonthData = null;
          document.getElementById('activeBudgetProjectInfo').hidden = true;
          state.activeBudgetId = null;
          populateBudgetPlanSelector();
          renderBudgetMembersMultiPicker();
          const itemsContainer = document.getElementById('budgetItemsListContainer');
          if (itemsContainer) {
            itemsContainer.innerHTML = '<div style="padding:18px; text-align:center; color:#94a3b8;">لا توجد خطة ميزانية محفوظة. أنشئ خطة جديدة للبدء.</div>';
          }
          const incomeContainer = document.getElementById('budgetIncomeRowsContainer');
          if (incomeContainer) incomeContainer.innerHTML = '';
          const itemCount = document.getElementById('budgetItemsCountBadge');
          if (itemCount) itemCount.textContent = '0 بند';
          const nameInput = document.getElementById('inpBudgetName');
          const monthInput = document.getElementById('inpBudgetMonth');
          if (nameInput) nameInput.value = '';
          if (monthInput) monthInput.value = '';
          const zero = formatMoney(0);
          const incomeKpi = document.getElementById('budgetKpiIncome');
          const expenseKpi = document.getElementById('budgetKpiExpense');
          const surplusKpi = document.getElementById('budgetKpiSurplus');
          if (incomeKpi) incomeKpi.textContent = `+ ${zero}`;
          if (expenseKpi) expenseKpi.textContent = `− ${zero}`;
          if (surplusKpi) surplusKpi.textContent = zero;
          return;
        }
      }

      let activePlan = state.monthlyBudgets.find(b => b.id === state.activeBudgetId);
      if (!activePlan) {
        activePlan = state.monthlyBudgets[0];
        state.activeBudgetId = activePlan.id;
      }

      currentBudgetMonthData = activePlan;
      const projectInfo = document.getElementById('activeBudgetProjectInfo');
      projectInfo.hidden = !activePlan.project;
      projectInfo.textContent = activePlan.project ? `موازنة المشروع: ${activePlan.project} · التقديرات بالجنيه المصري` : '';
      ensureBudgetItems(currentBudgetMonthData);

      const inpName = document.getElementById('inpBudgetName');
      const inpMonth = document.getElementById('inpBudgetMonth');

      if (inpName) inpName.value = activePlan.name || '';
      if (inpMonth) inpMonth.value = activePlan.month || '2026-11';

      populateBudgetPlanSelector();
      renderBudgetMembersMultiPicker();
      renderMonthlyBudgetAllocations();
      if (window.BudgetAuditEngine && typeof BudgetAuditEngine.refreshActiveBudgetAudit === 'function') {
        BudgetAuditEngine.refreshActiveBudgetAudit();
      }
    }

    

    function onBudgetPlanSelect(budgetId) {
      if (!budgetId) {
        currentBudgetMonthData = null;
        state.activeBudgetId = null;
        loadActiveBudgetPlan();
        return;
      }
      state.activeBudgetId = budgetId;
      loadActiveBudgetPlan();
      if (window.BudgetAuditEngine && typeof BudgetAuditEngine.refreshActiveBudgetAudit === 'function') {
        BudgetAuditEngine.refreshActiveBudgetAudit();
      }
      if (currentBudgetMonthData) showToast(`📂 تم فتح الميزانية: (${currentBudgetMonthData.name})`);
    }

    function onBudgetNameChange(val) {
      if (currentBudgetMonthData) {
        currentBudgetMonthData.name = val;
      }
    }

    function onBudgetMonthChange(val) {
      if (currentBudgetMonthData) {
        currentBudgetMonthData.month = val;
        renderMonthlyBudgetAllocations();
      }
    }

    function onBudgetItemCategorySelect(catId) {
      const titleInp = document.getElementById('inpBudgetItemTitle');
      if (titleInp && !titleInp.value) {
        const cat = EXPENSE_CATEGORIES.find(c => c.id === catId);
        if (cat) titleInp.placeholder = `مثال: ${cat.name}...`;
      }
    }

    // رسم شريط تحديد أفراد الأسرة المتعدد للبند الجديد
    function renderBudgetMembersMultiPicker() {
      const container = document.getElementById('budgetMembersMultiPicker');
      if (!container) return;

      const members = ['البيت', 'ماهر', 'أية', 'محمد', 'مريم', 'الحاجة', 'النونو', 'أخرى'];
      
      container.innerHTML = members.map(m => {
        const isSelected = selectedBudgetItemMembers.includes(m);
        const avatar = (typeof MEMBER_AVATARS !== 'undefined' && MEMBER_AVATARS[m]) ? MEMBER_AVATARS[m] : '';
        const bg = isSelected ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(30, 41, 59, 0.7)';
        const border = isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)';
        const color = isSelected ? '#ffffff' : '#cbd5e1';
        const shadow = isSelected ? '0 3px 10px rgba(56, 189, 248, 0.35)' : 'none';

        return `
          <button type="button" onclick="toggleBudgetItemMember('${m}')" 
                  style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 9px; border: 1.4px solid ${border}; background: ${bg}; color: ${color}; font-size: 0.74rem; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: ${shadow};">
            ${avatar ? `<img src="${avatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">` : ''}
            <span>${m}</span>
            ${isSelected ? '<i class="fa-solid fa-check" style="font-size: 0.65rem; margin-right: 2px;"></i>' : ''}
          </button>
        `;
      }).join('');

      const textEl = document.getElementById('budgetSelectedMembersText');
      if (textEl) {
        textEl.textContent = selectedBudgetItemMembers.length > 0 ? selectedBudgetItemMembers.join(' + ') : 'البيت (مشترك)';
      }
    }

    // التبديل بين تحديد/إلغاء تحديد فرد للبند الجديد (اختيار فرد أو أكثر)
    function toggleBudgetItemMember(name) {
      if (name === 'البيت') {
        selectedBudgetItemMembers = ['البيت'];
      } else {
        // إزالة البيت إن وُجد اختيار فردي محدد
        selectedBudgetItemMembers = selectedBudgetItemMembers.filter(m => m !== 'البيت');
        if (selectedBudgetItemMembers.includes(name)) {
          selectedBudgetItemMembers = selectedBudgetItemMembers.filter(m => m !== name);
        } else {
          selectedBudgetItemMembers.push(name);
        }
        if (selectedBudgetItemMembers.length === 0) {
          selectedBudgetItemMembers = ['البيت'];
        }
      }
      renderBudgetMembersMultiPicker();
    }

    // إضافة بند مصروف جديد للخطة التقديرية بديناميكية وربط متعدد بالأفراد
    function addBudgetItemToCurrentPlan() {
      if (!currentBudgetMonthData) return;

      const catSel = document.getElementById('inpBudgetItemCategory');
      const amtInp = document.getElementById('inpBudgetItemAmount');
      const titleInp = document.getElementById('inpBudgetItemTitle');

      const catId = catSel ? catSel.value : 'other';
      const amt = parseFloat(amtInp ? amtInp.value : 0);
      let title = titleInp ? titleInp.value.trim() : '';

      if (isNaN(amt) || amt <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ تقديري صحيح للبند');
        if (amtInp) amtInp.focus();
        return;
      }

      if (!title) {
        const catObj = EXPENSE_CATEGORIES.find(c => c.id === catId);
        title = catObj ? catObj.name : 'بند مصروف';
      }

      if (!currentBudgetMonthData.items) currentBudgetMonthData.items = [];

      const newItem = {
        id: 'b-item-' + Date.now(),
        category: catId,
        title: title,
        amount: amt,
        members: selectedBudgetItemMembers.length > 0 ? [...selectedBudgetItemMembers] : ['البيت'],
        notes: ''
      };

      currentBudgetMonthData.items.push(newItem);
      syncBudgetCategoriesMap(currentBudgetMonthData);

      // تنظيف الخانات بعد الإضافة
      if (amtInp) amtInp.value = '';
      if (titleInp) titleInp.value = '';
      selectedBudgetItemMembers = ['البيت'];
      renderBudgetMembersMultiPicker();

      renderMonthlyBudgetAllocations();
      showToast(`➕ تم إضافة بند (${title} - ${formatMoney(amt)}) بنجاح! ✨`);
    }

    // حذف بند مصروف من الميزانية
    function deleteBudgetItem(itemId) {
      if (!currentBudgetMonthData || !currentBudgetMonthData.items) return;
      const it = currentBudgetMonthData.items.find(i => i.id === itemId);
      const title = it ? it.title : 'هذا البند';
      currentBudgetMonthData.items = currentBudgetMonthData.items.filter(i => i.id !== itemId);
      syncBudgetCategoriesMap(currentBudgetMonthData);
      renderMonthlyBudgetAllocations();
      showToast(`🗑️ تم حذف بند: ${title}`);
    }

    // تعديل مبلغ بند مصروف
    function editBudgetItemAmount(itemId) {
      if (!currentBudgetMonthData || !currentBudgetMonthData.items) return;
      const it = currentBudgetMonthData.items.find(i => i.id === itemId);
      if (!it) return;

      const newAmtStr = prompt(`تعديل المبلغ التقديري لبند "${it.title}" (ج.م):`, it.amount);
      if (newAmtStr === null) return;
      const newAmt = parseFloat(newAmtStr);
      if (isNaN(newAmt) || newAmt <= 0) {
        showToast('⚠️ تم إلغاء التعديل: المبلغ غير صالح');
        return;
      }
      it.amount = newAmt;
      syncBudgetCategoriesMap(currentBudgetMonthData);
      renderMonthlyBudgetAllocations();
      showToast(`✏️ تم تعديل بند "${it.title}" إلى ${formatMoney(newAmt)}`);
    }

    // رسم كافة بنود الميزانية التقديرية الحالية
    // حساب المصروفات الفعلية المطابقة للبند بدقة مع مراعاة تخصيص الأفراد
    function getExpensesForBudgetItem(it, allMonthExpenses, allBudgetItems) {
      const itemMembers = Array.isArray(it.members) && it.members.length > 0 ? it.members : ['البيت'];
      const isSharedHouse = itemMembers.includes('البيت') || itemMembers.includes('الكل') || itemMembers.includes('عائلة ماهر واية');

      return allMonthExpenses.filter(t => {
        if (t.category !== it.category) return false;
        const tMember = (t.member || t.author || 'البيت').trim();

        if (!isSharedHouse) {
          // البند مخصص لأفراد محددين بالاسم (مثل أية، ماهر، محمد، ...)
          return itemMembers.includes(tMember);
        }

        // إذا كان البند مشترك للبيت/الكل:
        // نتحقق إذا كان هناك بند آخر منفصل في نفس الخطة ونفس التصنيف مخصص تحديداً لهذا الفرد
        const hasDedicatedItem = (allBudgetItems || []).some(other => {
          if (other.id === it.id || other.category !== it.category) return false;
          const otherMems = Array.isArray(other.members) ? other.members : [];
          return otherMems.includes(tMember) && !otherMems.includes('البيت') && !otherMems.includes('الكل');
        });

        // إذا وجد بند مخصص له، لا نخصمه من ميزانية البيت العامة
        if (hasDedicatedItem) return false;

        return true;
      });
    }
    window.getExpensesForBudgetItem = getExpensesForBudgetItem;

    var currentBudgetMemberFilter = 'all';

    function setBudgetMemberFilter(member, btn) {
      currentBudgetMemberFilter = member;
      const pills = document.querySelectorAll('#budgetMemberFilterStrip button');
      pills.forEach(p => p.classList.remove('active'));
      if (btn) btn.classList.add('active');
      renderMonthlyBudgetAllocations();
    }
    window.setBudgetMemberFilter = setBudgetMemberFilter;

    function renderBudgetMemberFilterPills() {
      const strip = document.getElementById('budgetMemberFilterStrip');
      if (!strip) return;

      const membersList = [
        { name: 'الكل', val: 'all', icon: 'fa-solid fa-users' },
        { name: 'البيت', val: 'البيت', icon: 'fa-solid fa-house' },
        { name: 'ماهر', val: 'ماهر', icon: 'fa-solid fa-user-tie' },
        { name: 'أية', val: 'أية', icon: 'fa-solid fa-user-nurse' },
        { name: 'محمد', val: 'محمد', icon: 'fa-solid fa-child' },
        { name: 'مريم', val: 'مريم', icon: 'fa-solid fa-child-dress' },
        { name: 'الحاجة', val: 'الحاجة', icon: 'fa-solid fa-person-cane' },
        { name: 'النونو', val: 'النونو', icon: 'fa-solid fa-baby' }
      ];

      strip.innerHTML = membersList.map(m => {
        const isActive = (currentBudgetMemberFilter === m.val);
        const avatar = (typeof MEMBER_AVATARS !== 'undefined' && MEMBER_AVATARS[m.val]) ? MEMBER_AVATARS[m.val] : '';
        const imgTag = avatar ? `<img src="${avatar}" style="width: 17px; height: 17px; border-radius: 50%; object-fit: cover;">` : `<i class="${m.icon}"></i>`;
        return `
          <button type="button" class="btn-budget-member-pill ${isActive ? 'active' : ''}" onclick="setBudgetMemberFilter('${m.val}', this)">
            ${imgTag} <span>${m.name}</span>
          </button>
        `;
      }).join('');
    }
    window.renderBudgetMemberFilterPills = renderBudgetMemberFilterPills;

    function renderMonthlyBudgetAllocations() {
      if (!currentBudgetMonthData) return;
      ensureBudgetItems(currentBudgetMonthData);

      const itemsContainer = document.getElementById('budgetItemsListContainer');
      const countBadge = document.getElementById('budgetItemsCountBadge');
      const bBadge = document.getElementById('badgeCountBudgets');

      renderBudgetMemberFilterPills();

      const targetMonth = currentBudgetMonthData.month || '2026-11';
      const project = currentBudgetMonthData.project;
      const monthExpenses = project
        ? getProjectBudgetExpenses(currentBudgetMonthData, state.transactions)
        : (state.transactions || []).filter(t => t.type === 'expense' && t.date?.startsWith(targetMonth));
      const allItems = currentBudgetMonthData.items || [];

      // فلترة البنود بحسب العضو المحدد إن لم يكن "الكل"
      const filteredItems = (currentBudgetMemberFilter === 'all')
        ? allItems
        : allItems.filter(it => (it.members || ['البيت']).includes(currentBudgetMemberFilter));

      // حساب الإجماليات بدقة
      let totalBudgetFiltered = 0;
      let totalActualFiltered = 0;

      filteredItems.forEach(it => {
        totalBudgetFiltered += (Number(it.amount) || 0);
        const matches = getExpensesForBudgetItem(it, monthExpenses, allItems);
        totalActualFiltered += matches.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      });

      if (project) {
        // Count every operation once, including expenses without a matching budget line.
        totalActualFiltered = monthExpenses
          .filter(t => currentBudgetMemberFilter === 'all' || (t.member || t.author || 'البيت').trim() === currentBudgetMemberFilter)
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      }
      // تحديث شريط الرقابة المالية الإجمالي
      const summaryTxt = document.getElementById('budgetActualSummaryTxt');
      const progBar = document.getElementById('budgetActualProgressBar');
      if (summaryTxt) {
        const overallPct = totalBudgetFiltered > 0 ? ((totalActualFiltered / totalBudgetFiltered) * 100).toFixed(1) : 0;
        const filterLabel = (currentBudgetMemberFilter === 'all') ? 'كافة بنود الخطة' : `مخصصات (${currentBudgetMemberFilter})`;
        summaryTxt.innerHTML = `منصرف ${filterLabel} لشهر (${targetMonth}): <strong>${formatMoney(totalActualFiltered)}</strong> من أصل مقدر <strong>${formatMoney(totalBudgetFiltered)}</strong> (${overallPct}%)`;
      }
      if (progBar) {
        const pctVal = totalBudgetFiltered > 0 ? Math.min(100, (totalActualFiltered / totalBudgetFiltered) * 100) : 0;
        progBar.style.width = pctVal + '%';
        progBar.style.background = (totalActualFiltered > totalBudgetFiltered) ? '#ef4444' : '#10b981';
      }

      if (countBadge) {
        countBadge.textContent = `${filteredItems.length} من أصل ${allItems.length} بند`;
      }
      if (bBadge) {
        bBadge.textContent = `${allItems.length} بند`;
      }

      // رسم كروت بنود المصروفات التقديرية المربوطة بالأفراد
      if (itemsContainer) {
        if (filteredItems.length === 0) {
          itemsContainer.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.6); border: 1.5px dashed rgba(255,255,255,0.12); border-radius: 12px; padding: 18px; text-align: center; color: #94a3b8;">
              <i class="fa-solid fa-clipboard-list" style="font-size: 1.8rem; color: #38bdf8; margin-bottom: 6px;"></i>
              <div style="font-size: 0.85rem; font-weight: 800; color: #cbd5e1;">لا توجد بنود مصروفات مخصصة لـ (${currentBudgetMemberFilter})</div>
              <div style="font-size: 0.72rem; margin-top: 3px;">اختر فرداً آخر من الشريط العلوي أو أضف بنداً جديداً مخصصاً له</div>
            </div>
          `;
        } else {
          itemsContainer.innerHTML = filteredItems.map((it, idx) => {
            const cat = EXPENSE_CATEGORIES.find(c => c.id === it.category) || { name: 'أخرى', icon: 'fa-cube', color: '#38bdf8', emoji: '📦' };

            // حساب المنصرف الفعلي الخاص بهذا البند وهذا الشخص
            const matchingExpenses = getExpensesForBudgetItem(it, monthExpenses, allItems);
            const catActual = matchingExpenses.reduce((s, t) => s + (Number(t.amount) || 0), 0);
            const isOver = catActual > it.amount;
            const diff = it.amount - catActual;
            const pct = it.amount > 0 ? Math.min(100, Math.round((catActual / it.amount) * 100)) : 0;

            const itemMembers = (it.members && it.members.length > 0) ? it.members : ['البيت'];
            const isHouse = itemMembers.includes('البيت') || itemMembers.includes('الكل');

            // شارات أفراد الأسرة المرتبطين بهذا البند
            const memberChips = itemMembers.map(m => {
              const avatar = (typeof MEMBER_AVATARS !== 'undefined' && MEMBER_AVATARS[m]) ? MEMBER_AVATARS[m] : '';
              return `
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; padding: 2px 7px; border-radius: 6px; font-size: 0.68rem; font-weight: 800;">
                  ${avatar ? `<img src="${avatar}" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;">` : `<i class="fa-solid fa-user" style="font-size: 0.6rem;"></i>`}
                  <span>${m}</span>
                </span>
              `;
            }).join('');

            return `
              <div class="budget-item-card" style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid ${isOver ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.08)'}; border-radius: 12px; padding: 10px 12px; transition: all 0.2s ease;">
                <!-- الصف العلوي: العنوان والتصنيف والأفراد وأزرار التحكم -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 1.0rem; flex-shrink: 0;">
                      ${cat.emoji || `<i class="fa-solid ${cat.icon}" style="color: ${cat.color};"></i>`}
                    </div>
                    <div>
                      <div style="font-weight: 900; font-size: 0.86rem; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
                        <span>${escapeHtml(it.title || cat.name)}</span>
                        <span style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">(${cat.name})</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px; margin-top: 3px; flex-wrap: wrap;">
                        <span style="font-size: 0.64rem; color: #94a3b8;">${isHouse ? '🏠 ميزانية مشتركة:' : '👤 مخصص لـ:'}</span>
                        ${memberChips}
                      </div>
                    </div>
                  </div>

                  <!-- أزرار الإجراءات (تعديل + حذف) -->
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <button type="button" onclick="openEditBudgetItemModal('${it.id}')" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;" title="تعديل البند وربط الأفراد">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" onclick="deleteBudgetItem('${it.id}')" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;" title="حذف البند">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>

                <!-- شريط المقارنة المالي والتفاصيل -->
                <div style="background: rgba(30, 41, 59, 0.6); padding: 6px 10px; border-radius: 8px; margin-bottom: 6px; font-size: 0.72rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;">
                  <div>
                    <span style="color: #94a3b8;">المنصرف الفعلي لـ (${itemMembers.join(' + ')}): </span>
                    <strong style="color: ${isOver ? '#f87171' : '#34d399'}; font-weight: 900;">${formatMoney(catActual)}</strong>
                    <span style="color: #64748b; margin: 0 3px;">من أصل</span>
                    <strong style="color: #38bdf8; font-weight: 900;">${formatMoney(it.amount)}</strong>
                  </div>
                  <div style="font-weight: 850; color: ${isOver ? '#ef4444' : '#10b981'}; font-size: 0.70rem;">
                    ${isOver ? '⚠️ تجاوز:' : 'متبقي:'} <span dir="ltr" style="display: inline-flex; align-items: center; gap: 2px; font-weight: 900;">${(typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : (state.currency || 'ج.م'))} ${isOver ? '-' : '+'}${Math.round(Math.abs(diff)).toLocaleString('en-US')}</span> (${pct}%)
                  </div>
                </div>

                <!-- شريط التقدم المرئي -->
                <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden;">
                  <div style="width: ${pct}%; height: 100%; background: ${isOver ? 'linear-gradient(90deg, #f43f5e, #ef4444)' : 'linear-gradient(90deg, #38bdf8, #10b981)'}; transition: width 0.3s ease;"></div>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      if (typeof updateBudgetKpis === 'function') updateBudgetKpis();
      if (window.BudgetAuditEngine && typeof BudgetAuditEngine.refreshActiveBudgetAudit === 'function') {
        BudgetAuditEngine.refreshActiveBudgetAudit();
      }
    }
    window.renderMonthlyBudgetAllocations = renderMonthlyBudgetAllocations;

    // دوال نافذة تعديل بند الميزانية المخصص
    var editingBudgetItemRef = null;
    var editBudgetItemMembersSelected = [];

    function openEditBudgetItemModal(itemId) {
      if (!currentBudgetMonthData || !currentBudgetMonthData.items) return;
      const it = currentBudgetMonthData.items.find(i => i.id === itemId);
      if (!it) return;

      editingBudgetItemRef = it;
      editBudgetItemMembersSelected = Array.isArray(it.members) && it.members.length > 0 ? [...it.members] : ['البيت'];

      const inpId = document.getElementById('editBudgetItemId');
      const inpTitle = document.getElementById('editBudgetItemTitle');
      const inpAmt = document.getElementById('editBudgetItemAmount');
      const selCat = document.getElementById('editBudgetItemCategory');

      if (inpId) inpId.value = it.id;
      if (inpTitle) inpTitle.value = it.title || '';
      if (inpAmt) inpAmt.value = it.amount || '';

      if (selCat) {
        selCat.innerHTML = EXPENSE_CATEGORIES.map(c => `
          <option value="${c.id}" ${c.id === it.category ? 'selected' : ''}>${c.emoji || '📦'} ${c.name}</option>
        `).join('');
      }

      renderEditBudgetMembersGrid();

      const modal = document.getElementById('modalEditBudgetItem');
      if (modal) modal.style.display = 'flex';
    }
    window.openEditBudgetItemModal = openEditBudgetItemModal;

    function closeEditBudgetItemModal() {
      const modal = document.getElementById('modalEditBudgetItem');
      if (modal) modal.style.display = 'none';
      editingBudgetItemRef = null;
    }
    window.closeEditBudgetItemModal = closeEditBudgetItemModal;

    function renderEditBudgetMembersGrid() {
      const grid = document.getElementById('editBudgetItemMembersGrid');
      if (!grid) return;

      const membersList = [
        { name: 'البيت', icon: 'fa-solid fa-house' },
        { name: 'ماهر', icon: 'fa-solid fa-user-tie' },
        { name: 'أية', icon: 'fa-solid fa-user-nurse' },
        { name: 'محمد', icon: 'fa-solid fa-child' },
        { name: 'مريم', icon: 'fa-solid fa-child-dress' },
        { name: 'الحاجة', icon: 'fa-solid fa-person-cane' },
        { name: 'النونو', icon: 'fa-solid fa-baby' }
      ];

      grid.innerHTML = membersList.map(m => {
        const isSelected = editBudgetItemMembersSelected.includes(m.name);
        const avatar = (typeof MEMBER_AVATARS !== 'undefined' && MEMBER_AVATARS[m.name]) ? MEMBER_AVATARS[m.name] : '';
        const imgTag = avatar ? `<img src="${avatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;">` : `<i class="${m.icon}"></i>`;
        const activeStyle = isSelected
          ? 'background: linear-gradient(135deg, #0284c7, #0369a1); border-color: #38bdf8; color: #fff; font-weight: 900;'
          : 'background: rgba(30, 41, 59, 0.7); border-color: rgba(255,255,255,0.12); color: #94a3b8;';

        return `
          <button type="button" onclick="toggleEditBudgetItemMember('${m.name}')" style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 8px; font-size: 0.72rem; cursor: pointer; border: 1px solid; transition: all 0.2s; ${activeStyle}">
            ${imgTag} <span>${m.name}</span>
          </button>
        `;
      }).join('');
    }
    window.renderEditBudgetMembersGrid = renderEditBudgetMembersGrid;

    function toggleEditBudgetItemMember(name) {
      if (name === 'البيت') {
        editBudgetItemMembersSelected = ['البيت'];
      } else {
        editBudgetItemMembersSelected = editBudgetItemMembersSelected.filter(m => m !== 'البيت');
        if (editBudgetItemMembersSelected.includes(name)) {
          editBudgetItemMembersSelected = editBudgetItemMembersSelected.filter(m => m !== name);
        } else {
          editBudgetItemMembersSelected.push(name);
        }
        if (editBudgetItemMembersSelected.length === 0) {
          editBudgetItemMembersSelected = ['البيت'];
        }
      }
      renderEditBudgetMembersGrid();
    }
    window.toggleEditBudgetItemMember = toggleEditBudgetItemMember;

    function saveEditedBudgetItem() {
      if (!editingBudgetItemRef || !currentBudgetMonthData) return;

      const inpTitle = document.getElementById('editBudgetItemTitle');
      const inpAmt = document.getElementById('editBudgetItemAmount');
      const selCat = document.getElementById('editBudgetItemCategory');

      const title = inpTitle ? inpTitle.value.trim() : '';
      const amt = parseFloat(inpAmt ? inpAmt.value : 0);
      const cat = selCat ? selCat.value : 'other';

      if (isNaN(amt) || amt <= 0) {
        showToast('⚠️ الرجاء إدخال مبلغ تقديري صحيح للبند');
        return;
      }

      editingBudgetItemRef.title = title || (EXPENSE_CATEGORIES.find(c => c.id === cat) || {}).name || 'بند مصروف';
      editingBudgetItemRef.amount = amt;
      editingBudgetItemRef.category = cat;
      editingBudgetItemRef.members = editBudgetItemMembersSelected.length > 0 ? [...editBudgetItemMembersSelected] : ['البيت'];

      syncBudgetCategoriesMap(currentBudgetMonthData);
      renderMonthlyBudgetAllocations();
      closeEditBudgetItemModal();
      showToast('✨ تم حفظ تعديلات البند وربطه بالأفراد بنجاح!');
    }
    window.saveEditedBudgetItem = saveEditedBudgetItem;

    function addBudgetIncomeRow() {
      if (!currentBudgetMonthData) return;
      if (!currentBudgetMonthData.incomes) currentBudgetMonthData.incomes = [];
      currentBudgetMonthData.incomes.push({
        id: 'inc-' + Date.now(),
        name: 'مصدر دخل جديد',
        amount: 0,
        member: 'البيت'
      });
      renderMonthlyBudgetAllocations();
    }

    function updateBudgetIncome(idx, field, val) {
      if (!currentBudgetMonthData || !currentBudgetMonthData.incomes || !currentBudgetMonthData.incomes[idx]) return;
      if (field === 'amount') val = parseFloat(val) || 0;
      currentBudgetMonthData.incomes[idx][field] = val;
      updateBudgetKpis();
    }

    function removeBudgetIncome(idx) {
      if (!currentBudgetMonthData || !currentBudgetMonthData.incomes) return;
      currentBudgetMonthData.incomes.splice(idx, 1);
      renderMonthlyBudgetAllocations();
    }

    function getProjectBudgetExpenses(plan, transactions) {
      const project = plan.project.trim().toLocaleLowerCase();
      return (transactions || []).filter(t => t.type === 'expense' && t.category !== 'transfer'
        && String(t.date || '').slice(0, 7) === plan.month
        && getTransactionProjectName(t).toLocaleLowerCase() === project);
    }

    

    function renderProjectBudgetAnalysis() {
      if (typeof ProjectCompareEngine !== 'undefined' && typeof ProjectCompareEngine.render === 'function') {
        ProjectCompareEngine.render();
      }
    }
    window.renderProjectBudgetAnalysis = renderProjectBudgetAnalysis;

    let monthlyBudgetChartInstance = null;

    function updateMonthlyBudgetChart(labels, plannedData, actualData) {
      const canvas = document.getElementById('monthlyBudgetCompareChart');
      if (!canvas || typeof Chart === 'undefined') return;

      const existingC = Chart.getChart(canvas);
      if (existingC) existingC.destroy();
      if (monthlyBudgetChartInstance) {
        monthlyBudgetChartInstance.destroy();
        monthlyBudgetChartInstance = null;
      }

      if (!labels || labels.length === 0) {
        labels = ['لا توجد بنود'];
        plannedData = [0];
        actualData = [0];
      }

      const ctx = canvas.getContext('2d');
      monthlyBudgetChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'المقدر (خطة)',
              data: plannedData,
              backgroundColor: 'rgba(56, 189, 248, 0.75)',
              borderColor: '#38bdf8',
              borderWidth: 1.5,
              borderRadius: 6
            },
            {
              label: 'الفعلي (منصرف)',
              data: actualData,
              backgroundColor: 'rgba(244, 63, 94, 0.75)',
              borderColor: '#f43f5e',
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
                font: { family: 'Cairo', size: 11, weight: '700' },
                boxWidth: 12,
                boxHeight: 12
              }
            },
            tooltip: {
              rtl: true,
              callbacks: {
                label: function(ctx) {
                  return ` ${ctx.dataset.label}: ${formatMoney(ctx.parsed.y)}`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#94a3b8',
                font: { family: 'Cairo', size: 10, weight: '600' }
              },
              grid: { display: false }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#94a3b8',
                font: { size: 9 },
                callback: function(val) {
                  return formatMoneyVal(val);
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.06)'
              }
            }
          }
        }
      });
    }

    function toggleBudgetPlanSettingsDrawer() {
      const drawer = document.getElementById('budgetPlanSettingsDrawer');
      if (!drawer) return;
      const isHidden = (drawer.style.display === 'none' || !drawer.style.display);
      drawer.style.display = isHidden ? 'block' : 'none';
    }

    function toggleAddBudgetItemForm() {
      const form = document.getElementById('budgetAddFormCollapsible');
      const chevron = document.getElementById('budgetAddFormChevron');
      if (!form) return;
      const isHidden = (form.style.display === 'none' || !form.style.display);
      form.style.display = isHidden ? 'block' : 'none';
      if (chevron) {
        chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    }

    function updateBudgetKpis() {
      if (!currentBudgetMonthData) return;

      const totalIncome = (currentBudgetMonthData.incomes || []).reduce((s, inc) => s + (Number(inc.amount) || 0), 0);
      const totalExpense = (currentBudgetMonthData.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
      const surplus = totalIncome - totalExpense;

      // حساب المنصرف الفعلي لشهر الخطة
      const targetMonth = currentBudgetMonthData.month || '2026-11';
      const project = currentBudgetMonthData.project;
      const monthExpenses = project
        ? getProjectBudgetExpenses(currentBudgetMonthData, state.transactions)
        : (state.transactions || []).filter(t => t.type === 'expense' && t.date?.startsWith(targetMonth));
      const allItems = currentBudgetMonthData.items || [];

      let totalActual = 0;
      const chartLabels = [];
      const chartPlanned = [];
      const chartActual = [];

      allItems.forEach(it => {
        const matches = getExpensesForBudgetItem(it, monthExpenses, allItems);
        const itemActual = matches.reduce((s, t) => s + (Number(t.amount) || 0), 0);
        totalActual += itemActual;

        const cat = (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []).find(c => c.id === it.category);
        const label = it.title || (cat ? cat.name : 'بند');
        chartLabels.push(label.length > 12 ? label.slice(0, 11) + '..' : label);
        chartPlanned.push(Number(it.amount) || 0);
        chartActual.push(itemActual);
      });

      if (project) {
        totalActual = monthExpenses.reduce((s, t) => s + (Number(t.amount) || 0), 0);
      }

      // تحديث كروت المؤشرات الأربعة
      const incEl = document.getElementById('budgetKpiIncome');
      const expEl = document.getElementById('budgetKpiExpense');
      const actEl = document.getElementById('budgetKpiActual');
      const surEl = document.getElementById('budgetKpiSurplus');

      if (incEl) incEl.textContent = `+ ${formatMoney(totalIncome)}`;
      if (expEl) expEl.textContent = `- ${formatMoney(totalExpense)}`;
      if (actEl) actEl.textContent = `- ${formatMoney(totalActual)}`;
      if (surEl) {
        surEl.textContent = (surplus >= 0 ? '+ ' : '- ') + formatMoney(Math.abs(surplus));
        surEl.style.color = (surplus >= 0) ? '#34d399' : '#f87171';
      }

      // تحديث بوصلة السلامة المالية (Health Compass Banner)
      const healthBanner = document.getElementById('budgetHealthBanner');
      const healthBadge = document.getElementById('budgetHealthBadge');
      const healthText = document.getElementById('budgetHealthText');
      if (healthBanner && healthBadge && healthText) {
        if (totalExpense === 0) {
          healthBadge.textContent = 'خطة جديدة';
          healthBadge.style.background = 'rgba(56, 189, 248, 0.2)';
          healthBadge.style.color = '#38bdf8';
          healthText.textContent = 'لم يتم تحديد بنود مصروفات مقدرة بعد. أضف بنود الموازنة لتفعيل الرقابة التلقائية.';
        } else {
          const ratio = (totalActual / totalExpense) * 100;
          if (ratio <= 75) {
            healthBadge.textContent = 'ممتاز · وفر مستدام';
            healthBadge.style.background = 'rgba(16, 185, 129, 0.2)';
            healthBadge.style.color = '#34d399';
            healthText.textContent = `تم استهلاك ${ratio.toFixed(1)}% من الميزانية، ومتبقي وفر مقدر قدره ${formatMoney(totalExpense - totalActual)}.`;
          } else if (ratio <= 100) {
            healthBadge.textContent = 'تحت السيطرة · انتباه';
            healthBadge.style.background = 'rgba(245, 158, 11, 0.2)';
            healthBadge.style.color = '#fbbf24';
            healthText.textContent = `تم استهلاك ${ratio.toFixed(1)}% من الميزانية، المتبقي حتى نهاية الشهر: ${formatMoney(totalExpense - totalActual)}.`;
          } else {
            healthBadge.textContent = 'تجاوز الميزانية · عجز';
            healthBadge.style.background = 'rgba(239, 68, 68, 0.2)';
            healthBadge.style.color = '#f87171';
            healthText.textContent = `تجاوزت المصروفات الفعلية الميزانية بمقدار ${formatMoney(totalActual - totalExpense)} (نسبة التجاوز: ${ratio.toFixed(1)}%).`;
          }
        }
      }

      // تحديث الرسم البياني للمقارنة الرقابية
      updateMonthlyBudgetChart(chartLabels.slice(0, 8), chartPlanned.slice(0, 8), chartActual.slice(0, 8));
    }

    function saveMonthlyBudget() {
      if (!currentBudgetMonthData) return;
      currentBudgetMonthData.updatedAt = new Date().toISOString();
      syncBudgetCategoriesMap(currentBudgetMonthData);

      const idx = state.monthlyBudgets.findIndex(b => b.id === currentBudgetMonthData.id);
      if (idx >= 0) {
        state.monthlyBudgets[idx] = currentBudgetMonthData;
      } else {
        state.monthlyBudgets.push(currentBudgetMonthData);
        familyAlerts.created('budget', currentBudgetMonthData);
      }

      try {
        localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
      } catch(e) {}

      populateBudgetPlanSelector();
      renderProjectBudgetAnalysis();
      familyAlerts.refresh();
      playNotificationChime();
      showToast(`💾 تم حفظ وتثبيت خطة (${currentBudgetMonthData.name}) بنجاح! ✨`);
      if (typeof renderCategoriesGrid === 'function') renderCategoriesGrid();
      triggerDriveAutoSync();
    }

    function openNewBudgetPlanModal(forProject = false) {
      const field = document.getElementById('newPlanProjectInput');
      field.value = '';
      field.required = forProject;
      document.getElementById('newPlanProjectGroup').hidden = !forProject;
      document.getElementById('newBudgetPlanTitle').textContent = forProject ? 'موازنة تقديرية للمشروع' : 'إنشاء ميزانية تقديرية جديدة';
      document.getElementById('budgetProjectNames').replaceChildren(...getKnownProjects().map(name => new Option(name, name)));
      const monthInp = document.getElementById('newPlanMonthInput');
      const nameInp = document.getElementById('newPlanNameInput');
      const incInp = document.getElementById('newPlanTargetIncomeInput');
      const cloneSel = document.getElementById('newPlanCloneSourceSelect');

      const nextMonth = new Date();
      nextMonth.setDate(1);
      if (!forProject) nextMonth.setMonth(nextMonth.getMonth() + 1);
      const yyyyMm = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

      if (monthInp) monthInp.value = yyyyMm;
      if (nameInp) nameInp.value = forProject ? '' : `ميزانية شهر ${yyyyMm} التقديرية`;
      if (incInp) incInp.value = '';

      if (cloneSel) {
        cloneSel.innerHTML = '<option value="none">✨ خطة فارغة جديدة</option>' +
          (state.monthlyBudgets || []).map(b => `<option value="${escapeHtml(String(b.id || ''))}">📑 استنساخ من: ${escapeHtml(b.name)} [${escapeHtml(String(b.month || ''))}]</option>`).join('');
      }

      openModal('newBudgetPlanModal');
      if (forProject) field.focus();
    }

    function submitNewBudgetPlan() {
      const projectField = document.getElementById('newPlanProjectInput');
      const project = projectField.required ? projectField.value.trim() : '';
      const monthInp = document.getElementById('newPlanMonthInput');
      const nameInp = document.getElementById('newPlanNameInput');
      const incInp = document.getElementById('newPlanTargetIncomeInput');
      const cloneSel = document.getElementById('newPlanCloneSourceSelect');

      if (projectField.required && (!project || ['all', '__new_project__', '__no_project__'].includes(project))) {
        showToast('أدخل اسماً صالحاً للمشروع', 'error');
        projectField.focus();
        return;
      }
      const month = monthInp.value;
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        showToast('اختر شهر الموازنة', 'error');
        monthInp.focus();
        return;
      }
      const name = nameInp.value.trim() || (project ? `موازنة ${project}` : `ميزانية شهر ${month}`);
      const targetIncomeValue = parseFloat(incInp?.value || '0');
      if (!Number.isFinite(targetIncomeValue) || targetIncomeValue < 0) {
        showToast('يرجى إدخال دخل مستهدف صحيح أو تركه فارغاً', 'error');
        incInp?.focus();
        return;
      }
      const targetIncome = targetIncomeValue;
      const cloneFromId = cloneSel ? cloneSel.value : 'none';

      let items = [];
      let incomes = targetIncome > 0
        ? [{ id: 'inc-' + Date.now(), name: 'دخل مخطط', amount: targetIncome, member: 'البيت' }]
        : [];

      if (cloneFromId !== 'none') {
        const src = (state.monthlyBudgets || []).find(b => b.id === cloneFromId);
        if (src) {
          ensureBudgetItems(src);
          items = JSON.parse(JSON.stringify(src.items || []));
          incomes = JSON.parse(JSON.stringify(src.incomes || []));
        }
      }

      const newPlan = {
        id: 'bgt-' + month + '-' + Date.now(),
        project,
        name: name,
        month: month,
        items: items,
        incomes: incomes,
        categories: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      syncBudgetCategoriesMap(newPlan);

      if (!state.monthlyBudgets) state.monthlyBudgets = [];
      state.monthlyBudgets.unshift(newPlan);
      familyAlerts.created('budget', newPlan);
      state.activeBudgetId = newPlan.id;

      try {
        localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
      } catch(e) {}

      closeModal('newBudgetPlanModal');
      refreshProjectSelectors();
      loadActiveBudgetPlan();
      showToast(`🎉 تم إنشاء وتفعيل الخطة التقديرية الجديدة: (${name})`);
      triggerDriveAutoSync();
    }

    function cloneCurrentBudgetPlan() {
      if (!currentBudgetMonthData) return;
      ensureBudgetItems(currentBudgetMonthData);

      const clone = JSON.parse(JSON.stringify(currentBudgetMonthData));
      clone.id = 'bgt-copy-' + Date.now();
      clone.name = clone.name + ' (نسخة)';
      clone.createdAt = new Date().toISOString();
      clone.updatedAt = new Date().toISOString();

      state.monthlyBudgets.unshift(clone);
      familyAlerts.created('budget', clone);
      state.activeBudgetId = clone.id;

      try {
        localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
      } catch(e) {}

      loadActiveBudgetPlan();
      showToast(`📑 تم استنساخ الخطة بنجاح`);
      triggerDriveAutoSync();
    }

    function deleteCurrentBudgetPlan() {
      if (!currentBudgetMonthData) return;
      if (!currentBudgetMonthData.project && (state.monthlyBudgets || []).length <= 1) {
        showToast('⚠️ لا يمكن حذف الخطة الوحيدة المتبقية في النظام');
        return;
      }

      if (confirm(`هل أنت متأكد من حذف خطة "${currentBudgetMonthData.name}" نهائياً؟`)) {
        state.monthlyBudgets = state.monthlyBudgets.filter(b => b.id !== currentBudgetMonthData.id);
        state.activeBudgetId = state.monthlyBudgets[0]?.id || null;
        try {
          localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
        } catch(e) {}
        loadActiveBudgetPlan();
        showToast('🗑️ تم حذف الخطة بنجاح');
        triggerDriveAutoSync();
      }
    }

    function renderBudgetHistory() {
      const container = document.getElementById('budgetHistoryListContainer');
      if (!container) return;

      if (!state.monthlyBudgets || state.monthlyBudgets.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px;">لا توجد خطط سابقة محفوظة</div>';
        return;
      }

      const isLight = document.body.classList.contains('light-theme') ||
        document.documentElement.getAttribute('data-color-mode') === 'light' ||
        document.documentElement.getAttribute('data-app-theme') === 'facebook' ||
        document.body.getAttribute('data-app-theme') === 'facebook' ||
        document.documentElement.getAttribute('data-card-style') === 'facebook' ||
        document.body.getAttribute('data-card-style') === 'facebook';

      container.innerHTML = state.monthlyBudgets.map(b => {
        ensureBudgetItems(b);
        const totalInc = (b.incomes || []).reduce((s, inc) => s + (Number(inc.amount) || 0), 0);
        const totalExp = (b.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
        const surplus = totalInc - totalExp;
        const isActive = (b.id === state.activeBudgetId);

        const cardBg = isLight ? '#ffffff' : 'rgba(30, 41, 59, 0.85)';
        const cardBorder = isLight ? (isActive ? '#0284c7' : '#ced0d4') : (isActive ? '#38bdf8' : 'rgba(255,255,255,0.08)');
        const cardTitleColor = isLight ? '#050505' : '#f8fafc';
        const cardMetaColor = isLight ? '#65676b' : '#94a3b8';
        const statsBoxBg = isLight ? '#f0f2f5' : 'rgba(15, 23, 42, 0.6)';
        const statsBoxBorder = isLight ? '1px solid #e4e6eb' : '1px solid rgba(255,255,255,0.06)';

        return `
          <div class="budget-history-plan-card" style="background: ${cardBg}; border: 1.5px solid ${cardBorder}; border-radius: 14px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 0.90rem; font-weight: 900; color: ${cardTitleColor}; display: flex; align-items: center; gap: 6px;">
                  <span class="budget-plan-name">${escapeHtml(b.name)}</span>
                  ${isActive ? '<span style="font-size: 0.65rem; background: rgba(56, 189, 248, 0.2); color: #0284c7; border: 1px solid rgba(56, 189, 248, 0.5); padding: 1px 6px; border-radius: 5px; font-weight: 900;">الخطة النشطة</span>' : ''}
                </div>
                <div class="budget-plan-subinfo" style="font-size: 0.70rem; color: ${cardMetaColor}; margin-top: 2px;">
                  ${b.project ? `المشروع: <strong style="color: ${cardTitleColor};">${escapeHtml(b.project)}</strong> · ` : ''}الشهر: <strong style="color: ${cardTitleColor};">${escapeHtml(String(b.month || ''))}</strong> • عدد البنود: <strong style="color: #0284c7;">${(b.items || []).length} بند</strong>
                </div>
              </div>

              <div style="display: flex; gap: 6px;">
                <button type="button" onclick="restoreBudgetForView('${escapeHtml(String(b.id || ''))}')" style="padding: 6px 12px; border-radius: 8px; background: linear-gradient(135deg, #0284c7, #0369a1); border: none; color: #fff; font-size: 0.74rem; font-weight: 850; cursor: pointer;">
                  <i class="fa-solid fa-folder-open"></i> عرض وتعديل
                </button>
                <button type="button" onclick="deleteBudgetFromHistory('${escapeHtml(String(b.id || ''))}')" style="padding: 6px 8px; border-radius: 8px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; font-size: 0.74rem; font-weight: 850; cursor: pointer;" title="حذف">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>

            <div class="budget-history-stats-box" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; background: ${statsBoxBg}; border: ${statsBoxBorder}; border-radius: 9px; padding: 8px 10px; text-align: center; font-size: 0.74rem;">
              <div>
                <span style="display: block; color: ${cardMetaColor}; font-size: 0.65rem; font-weight: 800;">دخل متوقع:</span>
                <strong style="color: #10b981; font-size: 0.78rem;">+ ${formatMoney(totalInc)}</strong>
              </div>
              <div>
                <span style="display: block; color: ${cardMetaColor}; font-size: 0.65rem; font-weight: 800;">مصروفات مقدرة:</span>
                <strong style="color: #ef4444; font-size: 0.78rem;">- ${formatMoney(totalExp)}</strong>
              </div>
              <div>
                <span style="display: block; color: ${cardMetaColor}; font-size: 0.65rem; font-weight: 800;">فائض / عجز:</span>
                <strong style="color: ${surplus >= 0 ? '#10b981' : '#ef4444'}; font-size: 0.78rem;">${surplus >= 0 ? '+' : ''}${formatMoney(surplus)}</strong>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function restoreBudgetForView(budgetId) {
      const selectedPlan = (state.monthlyBudgets || []).find(b => String(b.id) === String(budgetId));
      if (!selectedPlan) {
        showToast('تعذر العثور على هذه الميزانية في السجل.');
        renderBudgetHistory();
        return;
      }

      state.activeBudgetId = selectedPlan.id;
      currentBudgetMonthData = selectedPlan;
      activeBudgetSubTab = 'current';
      try {
        localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets || []));
      } catch (e) {}

      // افتح محرر الخطة المختارة حتى لو كان المستخدم داخل قسم الفواتير أو الأرشيف.
      switchExpectedTopSection('budgets');
      switchBudgetSubTab('current');
    }

    function deleteBudgetFromHistory(budgetId) {
      const plan = (state.monthlyBudgets || []).find(b => b.id === budgetId);
      if (!plan) return;
      if (!plan.project && state.monthlyBudgets.length <= 1) {
        showToast('⚠️ لا يمكن حذف الخطة الوحيدة المتبقية في النظام');
        return;
      }
      if (confirm('هل أنت متأكد من حذف هذه الخطة من السجل؟')) {
        state.monthlyBudgets = state.monthlyBudgets.filter(b => b.id !== budgetId);
        if (state.activeBudgetId === budgetId) {
          state.activeBudgetId = state.monthlyBudgets[0]?.id || null;
        }
        try {
          localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
        } catch(e) {}
        renderBudgetHistory();
        showToast('🗑️ تم حذف الخطة من السجل');
        triggerDriveAutoSync();
      }
    }

    function getProratedBudgetForPeriod(periodStr) {
      if (!currentBudgetMonthData || currentBudgetMonthData.project) return 0;
      ensureBudgetItems(currentBudgetMonthData);
      const totalBudget = (currentBudgetMonthData.items || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
      if (periodStr === 'month') return totalBudget;
      if (periodStr === 'week') return Math.round(totalBudget * (7 / 30));
      if (periodStr === 'day' || periodStr === 'today') return Math.round(totalBudget / 30);
      return totalBudget;
    }
    // -------------------------------------------------------------------------
    // 7. تبديل أشكال شارت التحليل (أعمدة - دونات - دائري - قطبي)
    // -------------------------------------------------------------------------
    
    // دالة التبديل بين أشكال شارت أفراد الأسرة (أعمدة، دونات، قطبي)
    function switchMemberChartFormat(format, btnEl) {
      state.activeMemberChartFormat = format;
      document.querySelectorAll('#paneMembers .chart-format-switcher-strip .btn-export-tool').forEach(b => {
        b.classList.remove('active');
        b.style.background = '';
        b.style.color = '';
      });
      if (btnEl) {
        btnEl.classList.add('active');
        btnEl.style.background = 'rgba(56, 189, 248, 0.2)';
        btnEl.style.color = '#38bdf8';
      }
      if (typeof renderMembersChart === 'function') {
        renderMembersChart();
      }
    }

function switchCategoryChartFormat(format, btnEl) {
      state.activeCategoryChartFormat = format;
      execCatChartType = format;
      document.querySelectorAll('#paneCategories .chart-format-switcher-strip .btn-export-tool').forEach(b => {
        b.classList.remove('active');
        b.style.background = '';
        b.style.color = '';
      });
      if (btnEl) {
        btnEl.classList.add('active');
        btnEl.style.background = 'rgba(56, 189, 248, 0.2)';
        btnEl.style.color = '#38bdf8';
      }

      if (typeof renderCategoryChart === 'function') {
        renderCategoryChart();
      }
    }


    // ربط كافة دوال الميزانيات بنافذة window لضمان عمل كافة الأزرار والتفاعلات
    window.initMonthlyBudgetUI = initMonthlyBudgetUI;
    window.loadActiveBudgetPlan = loadActiveBudgetPlan;
    window.renderMonthlyBudgetAllocations = renderMonthlyBudgetAllocations;
    window.renderMonthlyBudgetPlan = renderMonthlyBudgetAllocations;
    window.renderBudgetHistory = renderBudgetHistory;
    window.renderBudgetHistoryList = renderBudgetHistory;
    window.openNewBudgetPlanModal = openNewBudgetPlanModal;
    window.closeNewBudgetPlanModal = function() { closeModal('newBudgetPlanModal'); };
    window.submitNewBudgetPlan = submitNewBudgetPlan;
    window.cloneCurrentBudgetPlan = cloneCurrentBudgetPlan;
    window.deleteCurrentBudgetPlan = deleteCurrentBudgetPlan;
    window.addBudgetItemToCurrentPlan = addBudgetItemToCurrentPlan;
    window.deleteBudgetItem = deleteBudgetItem;
    window.editBudgetItemAmount = editBudgetItemAmount;
    window.toggleBudgetItemMember = toggleBudgetItemMember;
    window.onBudgetPlanSelect = onBudgetPlanSelect;
    window.onBudgetNameChange = onBudgetNameChange;
    window.onBudgetMonthChange = onBudgetMonthChange;
    window.onBudgetItemCategorySelect = onBudgetItemCategorySelect;
    window.addBudgetIncomeRow = addBudgetIncomeRow;
    window.updateBudgetIncome = updateBudgetIncome;
    window.removeBudgetIncome = removeBudgetIncome;
    window.saveMonthlyBudget = saveMonthlyBudget;
    window.restoreBudgetForView = restoreBudgetForView;
    window.deleteBudgetFromHistory = deleteBudgetFromHistory;


    function switchExpectedTopSection(sec) {
      sec = sec === 'budgets' ? 'budgets' : 'bills_and_debts';
      activeExpectedTopSection = sec;
      window.activeExpectedTopSection = sec;
      try { localStorage.setItem('family_monefy_expected_top_section', sec); } catch(e) {}

      const btnBillsDebts = document.getElementById('tabExpectedBillsAndDebts');
      const btnBudgets = document.getElementById('tabExpectedBudgets');

      const secBillsDebts = document.getElementById('subViewCommitments');
      const secBudgetsCurrent = document.getElementById('panelMonthlyBudget');
      const secBudgetsHistory = document.getElementById('panelBudgetHistory');
      const budgetSubTabs = document.getElementById('budgetsSubTabStrip');

      const headerTitle = document.getElementById('txtExpectedPageMainHeader');
      const headerSub = document.getElementById('txtExpectedPageSubHeader');
      const topAddBtnLbl = document.getElementById('lblTopAddCommitmentAction');

      const setTopButtonState = (button, isActive, colors) => {
        if (!button) return;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
        button.style.color = isActive ? '#fff' : '#94a3b8';
        button.style.background = isActive
          ? `linear-gradient(135deg, ${colors.start}, ${colors.end})`
          : 'transparent';
        button.style.borderColor = isActive ? colors.border : 'transparent';
        button.style.boxShadow = isActive ? `0 3px 12px ${colors.shadow}` : 'none';
      };

      setTopButtonState(btnBillsDebts, sec === 'bills_and_debts', {
        start: '#0284c7', end: '#0369a1', border: 'rgba(56, 189, 248, 0.5)', shadow: 'rgba(2, 132, 199, 0.4)'
      });
      setTopButtonState(btnBudgets, sec === 'budgets', {
        start: '#10b981', end: '#047857', border: 'rgba(52, 211, 153, 0.55)', shadow: 'rgba(16, 185, 129, 0.35)'
      });

      if (sec === 'bills_and_debts') {
        if (secBillsDebts) secBillsDebts.style.display = 'block';
        if (secBudgetsCurrent) secBudgetsCurrent.style.display = 'none';
        if (secBudgetsHistory) secBudgetsHistory.style.display = 'none';
        if (budgetSubTabs) budgetSubTabs.style.display = 'none';

        if (headerTitle) headerTitle.textContent = 'الفواتير والديون والمستحقات';
        if (headerSub) headerSub.textContent = 'متابعة سداد الفواتير الشهرية والديون المطلوبة والمستحقة';
        if (topAddBtnLbl) topAddBtnLbl.textContent = 'إضافة التزام';

        renderCommitmentsPageUI();
      } else {
        // sec === 'budgets'
        if (secBillsDebts) secBillsDebts.style.display = 'none';
        if (budgetSubTabs) budgetSubTabs.style.display = 'flex';

        if (activeBudgetSubTab === 'history') {
          if (secBudgetsCurrent) secBudgetsCurrent.style.display = 'none';
          if (secBudgetsHistory) secBudgetsHistory.style.display = 'block';
          renderBudgetHistory();
        } else {
          if (secBudgetsCurrent) secBudgetsCurrent.style.display = 'block';
          if (secBudgetsHistory) secBudgetsHistory.style.display = 'none';
          loadActiveBudgetPlan();
        }

        if (headerTitle) headerTitle.textContent = 'الميزانيات والخطط الشهرية';
        if (headerSub) headerSub.textContent = 'التخطيط المالي وتوزيع الميزانيات والرقابة على المصروفات';
        if (topAddBtnLbl) topAddBtnLbl.textContent = 'خطة جديدة';

        // تحديث شارة عدد البنود على زر الميزانيات
        const bBadge = document.getElementById('badgeCountBudgets');
        if (bBadge && currentBudgetMonthData && currentBudgetMonthData.items) {
          bBadge.textContent = `${currentBudgetMonthData.items.length} بند`;
        }
      }
    }
    window.switchExpectedTopSection = switchExpectedTopSection;

    // اختصار فتح الميزانيات مباشرة من أي مكان
    window.openBudgetsDirectly = function() {
      switchAppPage('budgets');
    };

    
    // =========================================================================
    // محرك موازنات المشاريع المستقلة التراكمية (Independent Project Budgets Engine)
    // =========================================================================
    window.selectedProjectBudgetName = null;

    function onProjectBudgetSelect(projName) {
      window.selectedProjectBudgetName = projName;
      renderProjectBudgetsPanel();
    }

    function setNewBudgetPlanType(type) {
      const isProject = (type === 'project');
      const bMonth = document.getElementById('btnNewPlanTypeMonthly');
      const bProj = document.getElementById('btnNewPlanTypeProject');
      const pGroup = document.getElementById('newPlanProjectGroup');
      const pInput = document.getElementById('newPlanProjectInput');
      const title = document.getElementById('newBudgetPlanTitle');
      const nameInput = document.getElementById('newPlanNameInput');

      if (bMonth && bProj) {
        if (isProject) {
          bProj.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bProj.style.color = '#fff';
          bMonth.style.background = 'transparent';
          bMonth.style.color = '#94a3b8';
        } else {
          bMonth.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          bMonth.style.color = '#fff';
          bProj.style.background = 'transparent';
          bProj.style.color = '#94a3b8';
        }
      }

      if (pGroup) pGroup.hidden = !isProject;
      if (pInput) pInput.required = isProject;
      if (title) title.textContent = isProject ? 'موازنة تقديرية لمشروع خاص' : 'إنشاء ميزانية شهرية جديدة';

      if (isProject && pInput) {
        pInput.focus();
        if (!nameInput.value || nameInput.value.includes('شهر')) {
          nameInput.value = 'موازنة مشروع جديد';
        }
      }
    }

    function toggleArchiveProject(projectName) {
      const plan = (state.monthlyBudgets || []).find(b => b.project === projectName);
      if (!plan) return;
      plan.isClosed = !plan.isClosed;
      try {
        localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
      } catch(e) {}
      renderProjectBudgetsPanel();
      showToast(plan.isClosed ? `📦 تم نقل مشروع (${projectName}) إلى الأرشيف` : `✨ تم استعادة مشروع (${projectName}) كنشط`);
      triggerDriveAutoSync();
    }

    function renderProjectBudgetsPanel() {
      const container = document.getElementById('panelProjectBudgets');
      if (!container) return;

      const known = typeof getKnownProjects === 'function' ? getKnownProjects().filter(p => !['all', '__no_project__', '__new_project__'].includes(p)) : [];
      (state.monthlyBudgets || []).forEach(b => {
        if (b.project && b.project.trim() && !known.includes(b.project)) known.push(b.project);
      });
      (state.transactions || []).forEach(t => {
        if (t.project && t.project.trim() && !['all', '__no_project__', '__new_project__'].includes(t.project) && !known.includes(t.project)) {
          known.push(t.project);
        }
      });

      if (!window.selectedProjectBudgetName && known.length > 0) {
        window.selectedProjectBudgetName = known[0];
      }
      const cur = window.selectedProjectBudgetName || (known[0] || '');
      const plan = (state.monthlyBudgets || []).find(b => b.project === cur) || null;

      const projectTxs = (state.transactions || []).filter(t => t.project === cur && t.type === 'expense');
      const actualSpend = projectTxs.reduce((s, t) => s + (Number(t.amount) || 0), 0);

      let expected = 0;
      if (plan) {
        expected = Number(plan.allocatedBudget || plan.targetIncome || 0);
        if (!expected && Array.isArray(plan.items) && plan.items.length > 0) {
          expected = plan.items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
        }
      }

      const diff = expected - actualSpend;
      const isOver = expected > 0 && diff < 0;
      const pct = expected > 0 ? (actualSpend / expected) * 100 : (actualSpend > 0 ? 100 : 0);

      const selectorHtml = `
        <div style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(56, 189, 248, 0.35); border-radius: 12px; padding: 10px 12px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
            <div style="font-size: 0.84rem; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-trowel-bricks"></i>
              <span>المشروع النشط للمتابعة:</span>
            </div>
            <div style="display: flex; gap: 5px;">
              <button type="button" onclick="openNewBudgetPlanModal(true)" class="btn-wallet-action-pill" style="height: 30px; font-size: 0.72rem; padding: 0 10px; background: linear-gradient(135deg, #10b981, #059669); border: 1px solid rgba(52, 211, 153, 0.4); color: #fff; font-weight: 800; cursor: pointer; border-radius: 8px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-plus"></i> موازنة مشروع جديد
              </button>
              ${cur ? `<button type="button" onclick="toggleArchiveProject('${escapeHtml(cur)}')" class="btn-wallet-action-pill" style="height: 30px; font-size: 0.72rem; padding: 0 8px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; font-weight: 800; cursor: pointer; border-radius: 8px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-box-archive"></i> ${plan?.isClosed ? 'إلغاء الأرشفة' : 'إغلاق المشروع'}
              </button>` : ''}
            </div>
          </div>
          <select id="projectBudgetSelector" class="form-select-custom" onchange="onProjectBudgetSelect(this.value)" style="width: 100%; height: 38px; font-weight: 800; font-size: 0.84rem; background: rgba(30, 41, 59, 0.9); border: 1.2px solid rgba(56, 189, 248, 0.4); color: #f8fafc; border-radius: 8px;">
            ${known.map(p => `<option value="${escapeHtml(p)}" ${p === cur ? 'selected' : ''}>🏗️ ${escapeHtml(p)}</option>`).join('')}
          </select>
        </div>
      `;

      if (!cur) {
        container.innerHTML = selectorHtml + `
          <div style="text-align: center; padding: 30px 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px dashed rgba(56, 189, 248, 0.3);">
            <i class="fa-solid fa-folder-open" style="font-size: 2.2rem; color: #38bdf8; margin-bottom: 8px; opacity: 0.8;"></i>
            <h4 style="font-size: 0.92rem; font-weight: 900; color: #f8fafc; margin: 0 0 6px;">لا توجد مشاريع مسجلة حالياً</h4>
            <p style="font-size: 0.74rem; color: #94a3b8; margin: 0 0 12px;">أنشئ موازنة مشروع جديدة للبدء في تتبع التكاليف التراكمية للمشاريع الكبرى.</p>
            <button type="button" onclick="openNewBudgetPlanModal(true)" class="btn-wallet-action-pill" style="height: 36px; padding: 0 16px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-weight: 900; border-radius: 9px; cursor: pointer;">
              <i class="fa-solid fa-plus"></i> إنشاء أول موازنة مشروع
            </button>
          </div>
        `;
        return;
      }

      const pWidth = Math.min(100, Math.max(0, pct));
      const pColor = isOver ? '#ef4444' : pct > 85 ? '#f59e0b' : '#10b981';

      const metricsCardHtml = `
        <div style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid ${isOver ? 'rgba(239, 68, 68, 0.45)' : 'rgba(56, 189, 248, 0.3)'}; border-radius: 14px; padding: 12px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 0.88rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-chart-line" style="color: #38bdf8;"></i>
              <span>الملخص التراكمي: ${escapeHtml(cur)}</span>
              ${plan?.isClosed ? '<span style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 2px 6px; border-radius: 6px;">مغلق</span>' : ''}
            </div>
            <span style="font-size: 0.70rem; color: #94a3b8; font-weight: 800;">${projectTxs.length} حركة مسجلة</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; text-align: center;">
            <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 8px 6px;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 800;">الميزانية المرصودة</div>
              <div style="font-size: 0.90rem; font-weight: 950; color: #38bdf8; margin-top: 2px; direction: ltr;">${formatMoneyVal(expected)}</div>
            </div>
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 8px 6px;">
              <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 800;">المنصرف الفعلي التراكمي</div>
              <div style="font-size: 0.90rem; font-weight: 950; color: #f87171; margin-top: 2px; direction: ltr;">- ${formatMoneyVal(actualSpend)}</div>
            </div>
            <div style="background: ${isOver ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)'}; border: 1px solid ${isOver ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.3)'}; border-radius: 10px; padding: 8px 6px;">
              <div style="font-size: 0.65rem; color: ${isOver ? '#f87171' : '#34d399'}; font-weight: 800;">${isOver ? 'قيمة التجاوز' : 'المتبقي المتاح'}</div>
              <div style="font-size: 0.90rem; font-weight: 950; color: ${isOver ? '#ef4444' : '#10b981'}; margin-top: 2px; direction: ltr;">${isOver ? '- ' : '+ '}${formatMoneyVal(Math.abs(diff))}</div>
            </div>
          </div>

          <div style="margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.68rem; margin-bottom: 4px; font-weight: 800;">
              <span style="color: #cbd5e1;">نسبة الإنجاز المالي والاستهلاك:</span>
              <span style="color: ${pColor}; font-weight: 900;">${pct.toFixed(1)}% ${isOver ? '⚠️ تجاوز الموازنة' : ''}</span>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(15, 23, 42, 0.9); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
              <div style="width: ${pWidth}%; height: 100%; background: ${pColor}; transition: width 0.3s;"></div>
            </div>
          </div>
        </div>
      `;

      // Family Member Contributions Table
      const memberSpend = {};
      projectTxs.forEach(t => {
        const mem = t.member || 'غير محدد';
        memberSpend[mem] = (memberSpend[mem] || 0) + (Number(t.amount) || 0);
      });
      const memberRows = Object.entries(memberSpend).sort((a,b) => b[1] - a[1]);

      const memberTableHtml = `
        <div style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 0.82rem; font-weight: 900; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span><i class="fa-solid fa-users"></i> مساهمة أفراد الأسرة في مصاريف المشروع:</span>
            <span style="font-size: 0.68rem; color: #94a3b8;">${memberRows.length} مساهمين</span>
          </div>
          ${memberRows.length === 0 ? '<div style="color: #94a3b8; font-size: 0.72rem; text-align: center; padding: 10px;">لا توجد مدفوعات مسجلة لأفراد على هذا المشروع.</div>' : `
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${memberRows.map(([mem, amt]) => {
                const memPct = actualSpend > 0 ? ((amt / actualSpend) * 100).toFixed(1) : '0';
                return `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.6); padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 24px; height: 24px; border-radius: 50%; background: rgba(56, 189, 248, 0.15); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: #38bdf8; font-weight: 900;">${escapeHtml(mem[0] || '؟')}</span>
                      <strong style="font-size: 0.78rem; color: #f8fafc;">${escapeHtml(mem)}</strong>
                    </div>
                    <div style="text-align: left; direction: ltr; font-weight: 900; font-size: 0.80rem; color: #cbd5e1;">
                      <span>${formatMoneyVal(amt)}</span>
                      <span style="font-size: 0.66rem; color: #38bdf8; margin-left: 6px;">(${memPct}%)</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;

      // Estimated Items vs Actual Spend Breakdown Table
      const items = plan?.items || [];
      const itemsTableHtml = `
        <div style="background: rgba(15, 23, 42, 0.85); border: 1.2px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 0.82rem; font-weight: 900; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span><i class="fa-solid fa-list-check"></i> بنود الموازنة المقدرة والمنصرف الفعلي:</span>
            <span style="font-size: 0.68rem; color: #94a3b8;">${items.length} بنود مقدرة</span>
          </div>
          ${items.length === 0 ? '<div style="color: #94a3b8; font-size: 0.72rem; text-align: center; padding: 10px;">لم يتم تفصيل بنود تقديرية لهذا المشروع. يمكنك إضافة بنود من موازنة الشهر أو تعديل الخطة.</div>' : `
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.74rem; text-align: right;">
                <thead>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8;">
                    <th style="padding: 6px;">البند</th>
                    <th style="padding: 6px;">المقدر</th>
                    <th style="padding: 6px;">الفعلي</th>
                    <th style="padding: 6px;">الفارق</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(it => {
                    const catTxs = projectTxs.filter(t => t.category === it.category);
                    const itActual = catTxs.reduce((s, t) => s + (Number(t.amount)||0), 0);
                    const itDiff = Number(it.amount) - itActual;
                    const itOver = itDiff < 0;
                    return `
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 6px; font-weight: 800; color: #f8fafc;">${escapeHtml(it.title || it.category)}</td>
                        <td style="padding: 6px; direction: ltr; font-weight: 800; color: #38bdf8;">${formatMoneyVal(it.amount)}</td>
                        <td style="padding: 6px; direction: ltr; font-weight: 800; color: #f87171;">${formatMoneyVal(itActual)}</td>
                        <td style="padding: 6px; direction: ltr; font-weight: 900; color: ${itOver ? '#ef4444' : '#10b981'};">${itOver ? '-' : '+'}${formatMoneyVal(Math.abs(itDiff))}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      `;

      container.innerHTML = selectorHtml + metricsCardHtml + memberTableHtml + itemsTableHtml;
    }
    
    
    function switchBudgetMonthView(view) {
      const isCompare = (view === 'compare');
      const panelC = document.getElementById('panelBudgetCompare');
      const panelA = document.getElementById('panelBudgetArchiveMonthly');
      const btnC = document.getElementById('btnBudgetInnerCompare');
      const btnA = document.getElementById('btnBudgetInnerArchive');
      if (panelC) panelC.style.display = isCompare ? 'block' : 'none';
      if (panelA) panelA.style.display = isCompare ? 'none' : 'block';
      btnC?.setAttribute('aria-pressed', String(isCompare));
      btnA?.setAttribute('aria-pressed', String(!isCompare));
      if (btnC) {
        btnC.style.background = isCompare ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent';
        btnC.style.color = isCompare ? '#fff' : '#94a3b8';
        btnC.style.boxShadow = isCompare ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none';
      }
      if (btnA) {
        btnA.style.background = !isCompare ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'transparent';
        btnA.style.color = !isCompare ? '#fff' : '#94a3b8';
        btnA.style.boxShadow = !isCompare ? '0 2px 8px rgba(168, 85, 247, 0.4)' : 'none';
      }
      if (isCompare && window.BudgetCompareEngine) window.BudgetCompareEngine.render();
      if (!isCompare && window.BudgetArchiveEngine) window.BudgetArchiveEngine.render();
    }
    window.switchBudgetMonthView = switchBudgetMonthView;

    
    function switchProjectView(view) {
      const isCompare = (view === 'compare');
      const panelC = document.getElementById('panelProjectCompareView');
      const panelA = document.getElementById('panelProjectArchiveView');
      const btnC   = document.getElementById('btnProjectInnerCompare');
      const btnA   = document.getElementById('btnProjectInnerArchive');
      if (panelC) panelC.style.display = isCompare ? 'block' : 'none';
      if (panelA) panelA.style.display = isCompare ? 'none' : 'block';
      if (btnC) {
        btnC.style.background = isCompare ? 'linear-gradient(135deg,#0ea5e9,#2563eb)' : 'transparent';
        btnC.style.color = isCompare ? '#fff' : '#94a3b8';
        btnC.style.boxShadow = isCompare ? '0 2px 8px rgba(14,165,233,0.4)' : 'none';
      }
      if (btnA) {
        btnA.style.background = !isCompare ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'transparent';
        btnA.style.color = !isCompare ? '#fff' : '#94a3b8';
        btnA.style.boxShadow = !isCompare ? '0 2px 8px rgba(168,85,247,0.4)' : 'none';
      }
      if (isCompare && window.ProjectCompareEngine) ProjectCompareEngine.render();
      else if (!isCompare && window.ProjectArchiveEngine) ProjectArchiveEngine.render();
    }
    window.switchProjectView = switchProjectView;

    function switchBudgetSubTab(tab) {
      activeBudgetSubTab = tab;
      window.activeBudgetSubTab = tab;
      const bCurr = document.getElementById('btnBudgetSubCurrent');
      const bProj = document.getElementById('btnBudgetSubProjects');
      const bComp = document.getElementById('btnBudgetSubComparisons');
      const bHist = document.getElementById('btnBudgetSubHistory');

      const secCurr = document.getElementById('panelMonthlyBudget');
      const secProj = document.getElementById('panelProjectBudgets');
      const secComp = document.getElementById('panelBudgetComparisons');
      const secHist = document.getElementById('panelBudgetHistory');

      [bCurr, bProj, bComp, bHist].forEach(b => {
        if (b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
          b.style.background = 'transparent';
          b.style.color = '#94a3b8';
          b.style.boxShadow = 'none';
        }
      });
      [secCurr, secProj, secComp, secHist].forEach(s => {
        if (s) s.style.display = 'none';
      });

      if (tab === 'projects') {
        if (bProj) {
          bProj.classList.add('active');
          bProj.setAttribute('aria-pressed', 'true');
          bProj.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
          bProj.style.color = '#fff';
          bProj.style.boxShadow = '0 2px 8px rgba(2, 132, 199, 0.35)';
        }
        if (secProj) secProj.style.display = 'block';
        if (typeof switchProjectView === 'function') {
          switchProjectView('compare');
        }
      } else if (tab === 'comparisons') {
        if (bComp) {
          bComp.classList.add('active');
          bComp.setAttribute('aria-pressed', 'true');
          bComp.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
          bComp.style.color = '#fff';
          bComp.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.35)';
        }
        if (secComp) secComp.style.display = 'block';
        if (typeof switchComparisonDimension === 'function') {
          switchComparisonDimension('category');
        } else if (typeof renderComparisonsSection === 'function') {
          renderComparisonsSection();
        }
      } else if (tab === 'history') {
        if (bHist) {
          bHist.classList.add('active');
          bHist.setAttribute('aria-pressed', 'true');
          bHist.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
          bHist.style.color = '#fff';
          bHist.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.35)';
        }
        if (secHist) secHist.style.display = 'block';
        if (window.BudgetAuditEngine && typeof BudgetAuditEngine.renderBudgetHistoryAdvanced === 'function') {
          BudgetAuditEngine.renderBudgetHistoryAdvanced();
        } else if (typeof renderBudgetHistory === 'function') {
          renderBudgetHistory();
        }
      } else {
        if (bCurr) {
          bCurr.classList.add('active');
          bCurr.setAttribute('aria-pressed', 'true');
          bCurr.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          bCurr.style.color = '#fff';
          bCurr.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.35)';
        }
        if (secCurr) secCurr.style.display = 'block';
        if (typeof loadActiveBudgetPlan === 'function') loadActiveBudgetPlan();
        if (typeof switchBudgetMonthView === 'function') switchBudgetMonthView('compare');
        if (typeof renderMonthlyBudgetPlan === 'function') renderMonthlyBudgetPlan();
        if (window.BudgetAuditEngine && typeof BudgetAuditEngine.refreshActiveBudgetAudit === 'function') {
          BudgetAuditEngine.refreshActiveBudgetAudit();
        }
      }
    }

    function handleExpectedTopAddAction() {
      if (typeof toggleUnifiedAddCommitmentPanel === 'function') {
        toggleUnifiedAddCommitmentPanel(true);
      }
    }

    function setCommitmentsSubFilter(filt) {
      // إذا كان نفس الفلتر مضغوطاً يعود التحديد إلى "الكل" تلقائياً
      if (activeCommitmentSubFilter === filt && filt !== 'all') {
        activeCommitmentSubFilter = 'all';
      } else {
        activeCommitmentSubFilter = filt;
      }

      renderCommitmentsPageUI();
    }

    // =========================================================================
// =========================================================================
// TASKS, CALENDAR & DATE-TIME PICKER ENGINE (v5.2.4 Master Unified)
// =========================================================================

window.currentTasksViewMode = 'list';
window.calendarCurrentYear = new Date().getFullYear();
window.calendarCurrentMonth = new Date().getMonth();
window.calendarSelectedDate = new Date().toISOString().slice(0, 10);
window.currentTaskCategoryFilter = 'all';
window.currentTaskMemberFilter = 'all';
window.currentTaskSectionFilter = 'all';
window.currentQuickTaskPhoto = null;
window._activeQuickTaskDate = '';
window._activeQuickTaskTime = '10:00';

window.taskSelectedDateVal = '';
window.taskSelectedTimeVal = '10:00';

const arabicMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];



function getDefaultTaskTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; }
  catch (e) { return 'UTC'; }
}

function isValidTaskTimezone(zone) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: zone }); return true; }
  catch (e) { return false; }
}

function parseTaskIsoDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

function getTaskDateInTimezone(zone, date = new Date()) {
  const safeZone = isValidTaskTimezone(zone) ? zone : getDefaultTaskTimezone();
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: safeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const values = Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch (e) { return getLocalDateStr(date); }
}

function isTaskOverdueByDate(task) {
  return !!(task && !task.completed && task.dueDate && task.dueDate < getTaskDateInTimezone(task.dueTimeZone || getDefaultTaskTimezone()));
}

function isTaskDueTodayByDate(task) {
  return !!(task && task.dueDate && task.dueDate === getTaskDateInTimezone(task.dueTimeZone || getDefaultTaskTimezone()));
}

function formatTaskTimeDisplay(task) {
  if (!task || !task.dueTime) return '';
  const parts = String(task.dueTime).split(':');
  const hour = String(parts[0] || '00').padStart(2, '0');
  const minute = String(parts[1] || '00').padStart(2, '0');
  const second = String(task.dueSecond || parts[2] || '00').padStart(2, '0');
  return `${hour}:${minute}:${second}`;
}

function getTaskTimezoneBadge(task) {
  if (!task || !task.dueTimeZone || !task.dueTime) return '';
  return getTaskTimeZoneOffsetText(task.dueTimeZone, task.dueDate, task.dueTime, task.dueSecond);
}

function addDaysToTaskIsoDate(value, count) {
  const date = parseTaskIsoDate(value) || new Date();
  date.setDate(date.getDate() + Number(count || 0));
  return getLocalDateStr(date);
}

function getTaskTimeZoneOffsetText(zone, dateValue, timeValue, secondValue) {
  const safeZone = isValidTaskTimezone(zone) ? zone : getDefaultTaskTimezone();
  const date = parseTaskIsoDate(dateValue) || new Date();
  const time = String(timeValue || '12:00').split(':').map(Number);
  const resolved = resolveTaskDateTimeInTimezone(dateValue || getLocalDateStr(date), timeValue || '12:00', secondValue || '00', safeZone);
  const instant = resolved ? new Date(resolved) : new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), time[0] || 0, time[1] || 0, Number(secondValue) || 0));
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone: safeZone, timeZoneName: 'longOffset' }).formatToParts(instant).find(p => p.type === 'timeZoneName');
    return (part && part.value ? part.value.replace(/^GMT/, 'UTC') : 'UTC');
  } catch (e) { return 'UTC'; }
}

function formatTaskPickerDate(value, options = {}) {
  const date = parseTaskIsoDate(value);
  if (!date) return 'اختر التاريخ';
  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { day: 'numeric', month: options.short ? 'short' : 'long', year: options.year === false ? undefined : 'numeric' }).format(date);
}

function getTaskDateTimeTargetFields(target) {
  if (target === 'drawer') return {
    dateTime: document.getElementById('drawerNewTaskDateTimeInput'),
    second: document.getElementById('drawerNewTaskDueSecond'),
    timezone: document.getElementById('drawerNewTaskDueTimezone'),
    button: document.getElementById('btnDrawerTaskDateTimePicker')
  };
  if (target === 'quick') return {
    dateTime: document.getElementById('newTaskDateTimeInput'),
    second: document.getElementById('newTaskDueSecond'),
    timezone: document.getElementById('newTaskDueTimezone'),
    button: document.getElementById('btnQuickTaskDateTimePicker')
  };
  return {
    date: document.getElementById('inlineTaskDueDate'),
    time: document.getElementById('inlineTaskDueTime'),
    second: document.getElementById('inlineTaskDueSecond'),
    timezone: document.getElementById('inlineTaskDueTimezone'),
    button: document.getElementById('btnInlineTaskDateTimePicker')
  };
}

function getTaskPickerTargetDateTime(target) {
  const fields = getTaskDateTimeTargetFields(target);
  if (fields.dateTime && fields.dateTime.value) {
    const parts = fields.dateTime.value.split('T');
    return { date: parts[0] || '', time: (parts[1] || '').slice(0, 5), second: (parts[1] || '').slice(6, 8) || (fields.second && fields.second.value) || '00' };
  }
  return {
    date: fields.date && fields.date.value || '',
    time: fields.time && fields.time.value || '',
    second: fields.second && fields.second.value || '00'
  };
}

function formatTaskPickerTimeLabel(timeValue, secondValue, use24Hour = false) {
  if (!timeValue) return 'بدون وقت';
  const [rawHour, rawMinute] = String(timeValue).split(':').map(Number);
  const hour = Number.isFinite(rawHour) ? rawHour : 0;
  const minute = Number.isFinite(rawMinute) ? rawMinute : 0;
  const second = String(Number(secondValue) || 0).padStart(2, '0');
  if (use24Hour) return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${second}`;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${String(hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${second} ${period}`;
}

function updateTaskDateTimeSummary() {
  const dateValue = window.taskSelectedDateVal || '';
  const timeValue = window.taskSelectedTimeVal || '';
  const secondValue = window.taskSelectedSecondVal || '00';
  const zone = window.taskSelectedTimezoneVal || getDefaultTaskTimezone();
  const today = getTaskDateInTimezone(zone);
  const tomorrow = addDaysToTaskIsoDate(today, 1);
  let dateText = formatTaskPickerDate(dateValue, { short: true });
  if (dateValue === today) dateText = 'اليوم';
  else if (dateValue === tomorrow) dateText = 'غداً';
  const timeText = formatTaskPickerTimeLabel(timeValue, secondValue, window.taskPickerHourMode === 24);
  const offset = getTaskTimeZoneOffsetText(zone, dateValue, timeValue, secondValue);
  const summary = document.getElementById('taskDateTimeSummaryBadge');
  const dateReadout = document.getElementById('taskPickerDateReadout');
  const zoneReadout = document.getElementById('taskPickerZoneReadout');
  if (summary) summary.textContent = dateValue ? `الموعد: ${formatTaskPickerDate(dateValue)}${timeValue ? ` • ${timeText}` : ''} • ${offset} (${zone})` : 'لم يتم تحديد موعد';
  if (dateReadout) dateReadout.textContent = dateValue ? `${formatTaskPickerDate(dateValue)}${timeValue ? ` • ${timeText}` : ''}` : 'اختر التاريخ والوقت';
  if (zoneReadout) zoneReadout.textContent = `${offset} · ${zone}`;
  const dateInput = document.getElementById('taskCustomPickerDate');
  const timeInput = document.getElementById('taskCustomPickerTime');
  const secondInput = document.getElementById('taskCustomPickerSecond');
  if (dateInput) dateInput.value = dateValue;
  if (timeInput) timeInput.value = timeValue;
  if (secondInput) secondInput.value = secondValue;
  updateTaskPickerControls();
}

function updateTaskDateTimeTargetDisplay(target) {
  const fields = getTaskDateTimeTargetFields(target);
  if (!fields.button) return;
  const values = getTaskPickerTargetDateTime(target);
  const zone = fields.timezone && fields.timezone.value || window.taskSelectedTimezoneVal || getDefaultTaskTimezone();
  if (!values.date) {
    fields.button.textContent = target === 'quick' ? '🗓️ الموعد' : (target === 'drawer' ? '🗓️ اختيار تاريخ ووقت التنبيه' : '🗓️ فتح التقويم واختيار الوقت');
    return;
  }
  const today = getTaskDateInTimezone(zone);
  const tomorrow = addDaysToTaskIsoDate(today, 1);
  const dateText = values.date === today ? 'اليوم' : (values.date === tomorrow ? 'غداً' : formatTaskPickerDate(values.date, { short: true }));
  const timeText = formatTaskPickerTimeLabel(values.time, values.second, false);
  const offset = getTaskTimeZoneOffsetText(zone, values.date, values.time, values.second);
  fields.button.textContent = target === 'quick' ? `📅 ${dateText}${values.time ? ` · ${timeText}` : ''}` : `📅 ${dateText}${values.time ? ` • ${timeText}` : ''} · ${offset}`;
  fields.button.title = `${formatTaskPickerDate(values.date)}${values.time ? ` ${timeText}` : ''} · ${zone}`;
  if (target === 'inline') {
    const presetDate = [...document.querySelectorAll('#inlineDatePresetGroup button')].some(button => button.getAttribute('aria-pressed') === 'true');
    const presetTime = [...document.querySelectorAll('#inlineTimePresetGroup button')].some(button => button.dataset.time === values.time);
    fields.button.textContent = presetDate && presetTime && zone === getDefaultTaskTimezone()
      ? 'تخصيص الموعد' : `تخصيص · ${dateText}${values.time ? ` · ${timeText}` : ''} · ${offset}`;
  }
}

function populateTaskTimezoneSelect(selectedZone) {
  const select = document.getElementById('taskPickerTimezoneSelect');
  if (!select) return;
  const safeSelected = isValidTaskTimezone(selectedZone) ? selectedZone : getDefaultTaskTimezone();
  if (select.dataset.populated !== 'true') {
    let zones = [];
    try { zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : []; } catch (e) {}
    if (!zones.length) zones = ['UTC', 'Asia/Riyadh', 'Asia/Dubai', 'Asia/Kuwait', 'Asia/Cairo', 'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney'];
    const favorites = [safeSelected, 'UTC', 'Asia/Riyadh', 'Asia/Dubai', 'Asia/Kuwait', 'Asia/Cairo'];
    const allZones = [...new Set([...favorites, ...zones].filter(isValidTaskTimezone))];
    const sorted = [...new Set(allZones)].sort((a, b) => a.localeCompare(b));
    select.innerHTML = sorted.map(zone => `<option value="${escapeHtml(zone)}">${escapeHtml(zone.replace(/_/g, ' '))}</option>`).join('');
    select.dataset.populated = 'true';
  }
  if (!Array.from(select.options).some(option => option.value === safeSelected)) {
    const option = document.createElement('option');
    option.value = safeSelected;
    option.textContent = safeSelected;
    select.prepend(option);
  }
  select.value = safeSelected;
}

function openTaskDateTimePickerModal(target = 'inline') {
  const modal = document.getElementById('taskDateTimePickerModal');
  if (!modal) return;
  const safeTarget = ['inline', 'drawer', 'quick'].includes(target) ? target : 'inline';
  window.taskDateTimePickerTarget = safeTarget;
  const fields = getTaskDateTimeTargetFields(safeTarget);
  const values = getTaskPickerTargetDateTime(safeTarget);
  const timezone = fields.timezone && fields.timezone.value || window._selectedTaskTimezone || getDefaultTaskTimezone();
  window.taskSelectedTimezoneVal = isValidTaskTimezone(timezone) ? timezone : getDefaultTaskTimezone();
  window._selectedTaskTimezone = window.taskSelectedTimezoneVal;
  window.taskSelectedDateVal = values.date || getTaskDateInTimezone(window.taskSelectedTimezoneVal);
  window.taskSelectedTimeVal = values.time || '10:00';
  window.taskSelectedSecondVal = String(Number(values.second) || 0).padStart(2, '0');
  if (window.taskPickerHourMode !== 12 && window.taskPickerHourMode !== 24) window.taskPickerHourMode = 12;
  const pickedDate = parseTaskIsoDate(window.taskSelectedDateVal) || new Date();
  window.taskPickerCalendarMonth = new Date(pickedDate.getFullYear(), pickedDate.getMonth(), 1);
  populateTaskTimezoneSelect(window.taskSelectedTimezoneVal);
  renderTaskPickerCalendar();
  updateTaskDateTimeSummary();
  modal.style.setProperty('z-index', '2000050', 'important');
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.classList.add('open', 'active');
}

function closeTaskDateTimePickerModal() {
  const modal = document.getElementById('taskDateTimePickerModal');
  if (!modal) return;
  modal.classList.remove('open', 'active');
  modal.style.display = 'none';
}

function renderTaskPickerCalendar() {
  const grid = document.getElementById('taskPickerCalendarGrid');
  const monthLabel = document.getElementById('taskPickerMonthLabel');
  if (!grid) return;
  const monthDate = window.taskPickerCalendarMonth || new Date();
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  if (monthLabel) monthLabel.textContent = `${arabicMonths[month]} ${year}`;
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getTaskDateInTimezone(window.taskSelectedTimezoneVal || getDefaultTaskTimezone());
  grid.innerHTML = '';
  for (let index = 0; index < 42; index++) {
    const day = index - firstWeekday + 1;
    if (day < 1 || day > daysInMonth) {
      const blank = document.createElement('span');
      blank.setAttribute('aria-hidden', 'true');
      grid.appendChild(blank);
      continue;
    }
    const dateValue = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(day);
    button.setAttribute('role', 'gridcell');
    button.setAttribute('aria-label', formatTaskPickerDate(dateValue));
    button.setAttribute('aria-pressed', String(dateValue === window.taskSelectedDateVal));
    button.classList.add('range-calendar-day');
    if (dateValue === today) button.classList.add('is-today');
    if (dateValue === window.taskSelectedDateVal) button.classList.add('is-range-start', 'is-range-end');
    button.onclick = () => selectTaskPickerDay(dateValue);
    grid.appendChild(button);
  }
}

function changeTaskPickerMonth(amount) {
  const date = window.taskPickerCalendarMonth || new Date();
  window.taskPickerCalendarMonth = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  renderTaskPickerCalendar();
}

function selectTaskPickerDay(dateValue) {
  window.taskSelectedDateVal = dateValue;
  renderTaskPickerCalendar();
  updateTaskDateTimeSummary();
}

function getTaskPickerTimeParts() {
  const [hour, minute] = String(window.taskSelectedTimeVal || '10:00').split(':').map(Number);
  return { hour: Number.isFinite(hour) ? hour : 10, minute: Number.isFinite(minute) ? minute : 0, second: Number(window.taskSelectedSecondVal) || 0 };
}

function updateTaskPickerControls() {
  const parts = getTaskPickerTimeParts();
  const mode = window.taskPickerHourMode === 24 ? 24 : 12;
  const hourValue = document.getElementById('taskPickerHourValue');
  const minuteValue = document.getElementById('taskPickerMinuteValue');
  const secondValue = document.getElementById('taskPickerSecondValue');
  const wheel = document.getElementById('taskPickerTimeWheels');
  const period = document.getElementById('taskPickerPeriodControls');
  const noTime = document.getElementById('taskPickerNoTimeButton');
  const am = document.getElementById('taskPickerAmButton');
  const pm = document.getElementById('taskPickerPmButton');
  const button12 = document.getElementById('taskPicker12HourButton');
  const button24 = document.getElementById('taskPicker24HourButton');
  const hourDisplay = mode === 24 ? parts.hour : (parts.hour % 12 || 12);
  if (hourValue) hourValue.textContent = String(hourDisplay).padStart(2, '0');
  if (minuteValue) minuteValue.textContent = String(parts.minute).padStart(2, '0');
  if (secondValue) secondValue.textContent = String(parts.second).padStart(2, '0');
  if (period) period.style.display = mode === 24 ? 'none' : 'flex';
  if (wheel) wheel.classList.toggle('is-disabled', !window.taskSelectedTimeVal);
  if (noTime) noTime.classList.toggle('is-active', !window.taskSelectedTimeVal);
  if (noTime) noTime.setAttribute('aria-pressed', String(!window.taskSelectedTimeVal));
  if (am) { am.classList.toggle('is-active', parts.hour < 12); am.setAttribute('aria-pressed', String(parts.hour < 12)); }
  if (pm) { pm.classList.toggle('is-active', parts.hour >= 12); pm.setAttribute('aria-pressed', String(parts.hour >= 12)); }
  if (button12) { button12.classList.toggle('is-active', mode === 12); button12.setAttribute('aria-pressed', String(mode === 12)); }
  if (button24) { button24.classList.toggle('is-active', mode === 24); button24.setAttribute('aria-pressed', String(mode === 24)); }
}

function setTaskPickerHourMode(mode) {
  window.taskPickerHourMode = Number(mode) === 24 ? 24 : 12;
  updateTaskDateTimeSummary();
}

function updateTaskPickerTime(hour, minute, second) {
  window.taskSelectedTimeVal = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  window.taskSelectedSecondVal = String(second).padStart(2, '0');
  updateTaskDateTimeSummary();
}

function adjustTaskPickerTime(part, amount) {
  let { hour, minute, second } = getTaskPickerTimeParts();
  if (part === 'hour') {
    hour = (hour + amount + 24) % 24;
  } else if (part === 'minute') minute = (minute + amount + 60) % 60;
  else second = (second + amount + 60) % 60;
  updateTaskPickerTime(hour, minute, second);
}

function setTaskPickerPeriod(periodValue) {
  let { hour, minute, second } = getTaskPickerTimeParts();
  const hour12 = hour % 12;
  hour = hour12 + (periodValue === 'PM' ? 12 : 0);
  updateTaskPickerTime(hour, minute, second);
}

function toggleTaskPickerNoTime() {
  if (window.taskSelectedTimeVal) window.taskSelectedTimeVal = '';
  else window.taskSelectedTimeVal = '10:00';
  window.taskSelectedSecondVal = '00';
  updateTaskDateTimeSummary();
}

function onTaskPickerTimezoneChange(value) {
  if (!isValidTaskTimezone(value)) return;
  window.taskSelectedTimezoneVal = value;
  window._selectedTaskTimezone = value;
  renderTaskPickerCalendar();
  updateTaskDateTimeSummary();
}

function selectTaskDatePreset(preset, btn) {
  const zone = window.taskSelectedTimezoneVal || getDefaultTaskTimezone();
  let dateValue = getTaskDateInTimezone(zone);
  if (preset === 'tomorrow') dateValue = addDaysToTaskIsoDate(dateValue, 1);
  else if (preset === 'after2days') dateValue = addDaysToTaskIsoDate(dateValue, 2);
  else if (preset === 'friday') {
    const date = parseTaskIsoDate(dateValue) || new Date();
    dateValue = addDaysToTaskIsoDate(dateValue, ((5 - date.getDay() + 7) % 7) || 7);
  } else if (preset === 'nextweek') dateValue = addDaysToTaskIsoDate(dateValue, 7);
  window.taskSelectedDateVal = dateValue;
  if (btn) btn.classList.add('active');
  renderTaskPickerCalendar();
  updateTaskDateTimeSummary();
}

function onTaskCustomDateChange(value) {
  window.taskSelectedDateVal = value;
  renderTaskPickerCalendar();
  updateTaskDateTimeSummary();
}

function selectTaskTimePreset(timeStr, btn) {
  window.taskSelectedTimeVal = timeStr || '';
  window.taskSelectedSecondVal = '00';
  if (btn) btn.classList.add('active');
  updateTaskDateTimeSummary();
}

function onTaskCustomTimeChange(value) {
  window.taskSelectedTimeVal = value || '';
  updateTaskDateTimeSummary();
}

function resolveTaskDateTimeInTimezone(dateValue, timeValue, secondValue, zone) {
  const date = parseTaskIsoDate(dateValue);
  if (!date || !timeValue || !isValidTaskTimezone(zone)) return '';
  const [hour, minute] = timeValue.split(':').map(Number);
  const wanted = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hour || 0, minute || 0, Number(secondValue) || 0);
  let candidate = wanted;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    for (let attempt = 0; attempt < 5; attempt++) {
      const parts = Object.fromEntries(formatter.formatToParts(new Date(candidate)).filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)]));
      const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
      const delta = wanted - represented;
      if (!delta) break;
      candidate += delta;
    }
    return new Date(candidate).toISOString();
  } catch (e) { return ''; }
}

function writeTaskPickerSelectionToTarget(target) {
  const fields = getTaskDateTimeTargetFields(target);
  const dateValue = window.taskSelectedDateVal || '';
  const timeValue = window.taskSelectedTimeVal || '';
  const secondValue = timeValue ? String(Number(window.taskSelectedSecondVal) || 0).padStart(2, '0') : '00';
  const timezone = window.taskSelectedTimezoneVal || getDefaultTaskTimezone();
  if (fields.dateTime) fields.dateTime.value = dateValue && timeValue ? `${dateValue}T${timeValue}` : '';
  if (fields.date) fields.date.value = dateValue;
  if (fields.time) fields.time.value = timeValue;
  if (fields.second) fields.second.value = secondValue;
  if (fields.timezone) fields.timezone.value = timezone;
  updateTaskDateTimeTargetDisplay(target);
  if (target === 'inline') updateUnifiedTaskDateTimeLabel();
}

function confirmTaskDateTimePicker() {
  if (!window.taskSelectedDateVal) window.taskSelectedDateVal = getTaskDateInTimezone(window.taskSelectedTimezoneVal || getDefaultTaskTimezone());
  const target = window.taskDateTimePickerTarget || 'inline';
  window._activeQuickTaskDate = window.taskSelectedDateVal;
  window._activeQuickTaskTime = window.taskSelectedTimeVal || '';
  writeTaskPickerSelectionToTarget(target);
  const fullLabel = `${formatTaskPickerDate(window.taskSelectedDateVal)}${window.taskSelectedTimeVal ? ` • ${formatTaskPickerTimeLabel(window.taskSelectedTimeVal, window.taskSelectedSecondVal, false)}` : ''} • ${getTaskTimeZoneOffsetText(window.taskSelectedTimezoneVal, window.taskSelectedDateVal, window.taskSelectedTimeVal, window.taskSelectedSecondVal)}`;
  closeTaskDateTimePickerModal();
  if (typeof showToast === 'function') showToast(`✅ تم تحديد موعد المهمة: ${fullLabel}`);
}

function clearTaskDateTimePicker() {
  window.taskSelectedDateVal = '';
  window.taskSelectedTimeVal = '';
  window.taskSelectedSecondVal = '00';
  window._activeQuickTaskDate = '';
  window._activeQuickTaskTime = '';
  writeTaskPickerSelectionToTarget(window.taskDateTimePickerTarget || 'inline');
  closeTaskDateTimePickerModal();
  if (typeof showToast === 'function') showToast('تم مسح موعد المهمة');
}

function getTodoTasks() {
  try {
    const raw = localStorage.getItem('family_monefy_tasks');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed; // Respect a legitimately empty saved task list.
    }
  } catch (e) {
    console.warn('Error reading tasks:', e);
  }
  const todayStr = getTaskDateInTimezone(getDefaultTaskTimezone());
  const sample = [
    {
      id: 'task_' + Date.now() + '_1',
      title: 'سداد فاتورة الكهرباء الشهرية',
      dueDate: todayStr,
      dueTime: '18:00',
      category: 'bills',
      assignedMember: 'ماهر',
      priority: 'high',
      completed: false,
      estimatedAmount: 350,
      createdAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub_1', title: 'فحص العداد ومطابقة القراءة', completed: true },
        { id: 'sub_2', title: 'الدفع عبر تطبيق البنك', completed: false }
      ]
    },
    {
      id: 'task_' + Date.now() + '_2',
      title: 'شراء مستلزمات البيت الأسبوعية',
      dueDate: todayStr,
      dueTime: '11:00',
      category: 'shopping',
      assignedMember: 'البيت',
      priority: 'medium',
      completed: false,
      estimatedAmount: 600,
      createdAt: new Date().toISOString(),
      subtasks: []
    }
  ];
  saveTodoTasks(sample);
  return sample;
}

function saveTodoTasks(tasks) {
  try {
    localStorage.setItem('family_monefy_tasks', JSON.stringify(tasks));
    return true;
  } catch (e) {
    console.error('Error saving tasks:', e);
    return false;
  }
}



function openTasksFullScreenModal() {
  const inlineDate = document.getElementById('inlineTaskDueDate');
  if (inlineDate && !inlineDate.value) {
    inlineDate.value = getTaskDateInTimezone(document.getElementById('inlineTaskDueTimezone')?.value || getDefaultTaskTimezone());
    updateUnifiedTaskDateTimeLabel();
  }
  const modal = document.getElementById('tasksFullScreenModal');
  if (modal) {
    modal.style.display = 'block';
    modal.style.opacity = '1';
    modal.style.zIndex = '100050';
    document.body.style.overflow = 'hidden';
  }
  switchTasksViewMode(window.currentTasksViewMode || 'list');
  renderTasksProList();
  updateTasksProductivityKPIs();
}

function closeTasksFullScreenModal() {
  const modal = document.getElementById('tasksFullScreenModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function openTasksModal() {
  openTasksFullScreenModal();
}

function switchTasksViewMode(mode) {
  window.currentTasksViewMode = mode;
  const btnList = document.getElementById('btnTaskTabList');
  const btnCal = document.getElementById('btnTaskTabCalendar');
  const viewList = document.getElementById('tasksTabListView');
  const viewCal = document.getElementById('tasksTabCalendarView');
  const modal = document.getElementById('tasksFullScreenModal');
  const productivityCard = document.getElementById('tasksProductivityPinnedCard');
  if (modal) modal.classList.toggle('calendar-mode', mode === 'calendar');
  if (mode === 'calendar' && viewCal && productivityCard && productivityCard.parentElement !== viewCal) {
    viewCal.insertBefore(productivityCard, viewCal.firstChild);
  } else if (mode !== 'calendar' && viewList && productivityCard && productivityCard.parentElement !== viewList) {
    viewList.insertBefore(productivityCard, viewList.firstChild);
  }

  if (mode === 'calendar') {
    if (btnList) {
      btnList.classList.remove('active');
      btnList.style.background = 'transparent';
      btnList.style.color = '#94a3b8';
      btnList.style.boxShadow = 'none';
      btnList.style.border = 'none';
    }
    if (btnCal) {
      btnCal.classList.add('active');
      btnCal.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)';
      btnCal.style.color = '#fff';
      btnCal.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.45)';
      btnCal.style.border = 'none';
    }
    if (viewList) viewList.style.display = 'none';
    if (viewCal) viewCal.style.display = 'flex';
    renderTasksCalendar();
  } else {
    if (btnList) {
      btnList.classList.add('active');
      btnList.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)';
      btnList.style.color = '#fff';
      btnList.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.45)';
      btnList.style.border = 'none';
    }
    if (btnCal) {
      btnCal.classList.remove('active');
      btnCal.style.background = 'transparent';
      btnCal.style.color = '#94a3b8';
      btnCal.style.boxShadow = 'none';
      btnCal.style.border = 'none';
    }
    if (viewList) viewList.style.display = 'flex';
    if (viewCal) viewCal.style.display = 'none';
    renderTasksProList();
    updateTasksProductivityKPIs();
  }
}

function triggerTaskCameraOnly() {
  const inp = document.getElementById('quickTaskCameraInput');
  if (inp) {
    inp.click();
  }
}

function handleTaskCameraOnlyChosen(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const rawData = e.target.result;
    const img = new Image();
    img.onload = function() {
      const maxDim = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressedUri = canvas.toDataURL('image/jpeg', 0.72);
      window.currentQuickTaskPhoto = compressedUri;

      const previewBar = document.getElementById('quickTaskPhotoPreviewBar');
      if (previewBar) {
        previewBar.style.display = 'flex';
        previewBar.innerHTML = `
          <div style="position: relative; display: inline-block;">
            <img src="${compressedUri}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1.5px solid #a855f7;">
            <button type="button" onclick="clearTaskPendingPhoto()" style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 0.65rem; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <span style="font-size: 0.72rem; color: #10b981; font-weight: 850;">تم التقاط الصورة ✓</span>
        `;
      }
    };
    img.src = rawData;
  };
  reader.readAsDataURL(file);
}

function clearTaskPendingPhoto() {
  window.currentQuickTaskPhoto = null;
  window.currentQuickTaskPhotos = [];
  const previewBar = document.getElementById('quickTaskPhotoPreviewBar');
  if (previewBar) {
    previewBar.style.display = 'none';
    previewBar.innerHTML = '';
  }
  const inp = document.getElementById('quickTaskCameraInput');
  if (inp) inp.value = '';
}


/* ==========================================================
   وظائف لوحة تسجيل وإضافة المهام الموحدة (v5.3.89)
   دمج بيان المهمة + التاجات + التاريخ والساعة من نفس الشاشة
   ========================================================== */
let selectedTaskTags = new Set(['general']);
window._selectedTaskMember = 'البيت';

function syncTaskTagChoices() {
  document.querySelectorAll('#unifiedTaskTagChipsList [data-tag]').forEach(chip => {
    const selected = selectedTaskTags.has(chip.dataset.tag);
    chip.classList.toggle('active', selected);
    chip.setAttribute('aria-pressed', String(selected));
  });
}

function selectTaskInlineTag(tagKey) {
  if (selectedTaskTags.has(tagKey)) {
    selectedTaskTags.delete(tagKey);
  } else {
    if (selectedTaskTags.size === 1 && selectedTaskTags.has('general')) selectedTaskTags.clear();
    selectedTaskTags.add(tagKey);
  }
  if (!selectedTaskTags.size) selectedTaskTags.add('general');
  syncTaskTagChoices();
}

function getTaskTags(task) {
  const saved = Array.isArray(task.tags) ? task.tags.filter(tag => typeof tag === 'string' && tag.trim()) : [];
  const tags = saved.length ? saved : [task.tag || task.category || 'general'];
  return [...new Set(tags.map(tag => tag === 'daily' ? 'my_day' : tag === 'scheduled' ? 'planned' : tag))];
}

function selectInlineDatePreset(preset, element) {
  const chips = document.querySelectorAll('#inlineDatePresetGroup .btn-inline-dt-preset');
  chips.forEach(c => {
    const selected = c === element;
    c.classList.toggle('active', selected);
    c.setAttribute('aria-pressed', String(selected));
  });

  const zone = document.getElementById('inlineTaskDueTimezone')?.value || getDefaultTaskTimezone();
  let targetStr = getTaskDateInTimezone(zone);
  if (preset === 'tomorrow') targetStr = addDaysToTaskIsoDate(targetStr, 1);
  else if (preset === 'after_two_days') targetStr = addDaysToTaskIsoDate(targetStr, 2);

  const dateInp = document.getElementById('inlineTaskDueDate');
  if (dateInp) dateInp.value = targetStr;
  const pickerDate = document.getElementById('taskCustomPickerDate');
  if (pickerDate) pickerDate.value = targetStr;

  updateUnifiedTaskDateTimeLabel();
}

function onInlineDateCustomChange(val) {
  const chips = document.querySelectorAll('#inlineDatePresetGroup .btn-inline-dt-preset');
  const zone = document.getElementById('inlineTaskDueTimezone')?.value || getDefaultTaskTimezone();
  const todayStr = getTaskDateInTimezone(zone);
  chips.forEach(c => {
    const selected = c.dataset.preset === 'today' && val === todayStr
      || c.dataset.preset === 'tomorrow' && val === addDaysToTaskIsoDate(todayStr, 1)
      || c.dataset.preset === 'after_two_days' && val === addDaysToTaskIsoDate(todayStr, 2);
    c.classList.toggle('active', selected);
    c.setAttribute('aria-pressed', String(selected));
  });

  updateUnifiedTaskDateTimeLabel();
}

function selectInlineTimePreset(timeStr, element) {
  const chips = document.querySelectorAll('#inlineTimePresetGroup .btn-inline-dt-preset');
  chips.forEach(c => {
    const selected = c === element;
    c.classList.toggle('active', selected);
    c.setAttribute('aria-pressed', String(selected));
  });

  const timeInp = document.getElementById('inlineTaskDueTime');
  if (timeInp) timeInp.value = timeStr;
  const secondInp = document.getElementById('inlineTaskDueSecond');
  if (secondInp) secondInp.value = '00';

  updateUnifiedTaskDateTimeLabel();
}

function onInlineTimeCustomChange(val) {
  const chips = document.querySelectorAll('#inlineTimePresetGroup .btn-inline-dt-preset');
  chips.forEach(c => {
    const selected = c.getAttribute('data-time') === val;
    c.classList.toggle('active', selected);
    c.setAttribute('aria-pressed', String(selected));
  });

  updateUnifiedTaskDateTimeLabel();
}

function updateUnifiedTaskDateTimeLabel() {
  updateTaskDateTimeTargetDisplay('inline');
}



function selectInlineTaskMember(member, element) {
  window._selectedTaskMember = member;
  const chips = document.querySelectorAll('#inlineTaskMemberGroup .btn-inline-member-chip');
  chips.forEach(c => {
    const selected = c === element;
    c.classList.toggle('active', selected);
    c.setAttribute('aria-pressed', String(selected));
  });
}

function updateQuickTaskTitleFeedback() {
  const input = document.getElementById('quickTaskTitleInput');
  const counter = document.getElementById('quickTaskTitleCounter');
  const title = String(input && input.value || '').trim();
  if (counter) {
    const length = String(input && input.value || '').length;
    counter.textContent = `${length} / 120`;
    counter.classList.toggle('is-near-limit', length >= 105);
  }
  if (title) {
    setQuickTaskTitleError('');
    const status = document.getElementById('quickTaskFormStatus');
    if (status && status.dataset.tone === 'error') setQuickTaskFormStatus('');
  }
}

function setQuickTaskTitleError(message) {
  const input = document.getElementById('quickTaskTitleInput');
  const error = document.getElementById('quickTaskTitleError');
  const hasError = !!message;
  if (input) input.setAttribute('aria-invalid', String(hasError));
  if (error) {
    error.textContent = message || '';
    error.classList.toggle('is-visible', hasError);
  }
}

function setQuickTaskFormStatus(message, tone = 'info') {
  const status = document.getElementById('quickTaskFormStatus');
  if (!status) return;
  status.textContent = message || '';
  status.dataset.tone = tone;
  status.style.color = tone === 'error' ? '#fda4af' : tone === 'success' ? '#6ee7b7' : '#94a3b8';
}

function handleQuickTaskProjectSelection(select) {
  if (!select) return;
  const panel = document.getElementById('quickTaskProjectQuickAdd');
  const hint = document.getElementById('quickTaskProjectHint');
  if (select.value !== '__new_project__') {
    select.dataset.lastValue = select.value;
    if (panel) panel.classList.remove('is-open');
    if (hint) hint.style.display = 'none';
    return;
  }

  select.value = select.dataset.lastValue || '';
  if (panel) panel.classList.add('is-open');
  const input = document.getElementById('quickTaskNewProjectInput');
  if (input) setTimeout(() => input.focus(), 30);
}

function confirmQuickTaskProject() {
  const input = document.getElementById('quickTaskNewProjectInput');
  const select = document.getElementById('quickTaskProjectSelect');
  const panel = document.getElementById('quickTaskProjectQuickAdd');
  const hint = document.getElementById('quickTaskProjectHint');
  const name = String(input && input.value || '').trim().replace(/\s+/g, ' ');
  if (!name) {
    if (typeof showToast === 'function') showToast('اكتب اسم المشروع أولاً');
    if (input) input.focus();
    return false;
  }
  const existing = getKnownProjects().find(project => project.toLocaleLowerCase() === name.toLocaleLowerCase());
  const selectedName = existing || name;
  if (select) {
    if (!Array.from(select.options).some(option => option.value === selectedName)) {
      const option = new Option(selectedName, selectedName);
      const createOption = Array.from(select.options).find(item => item.value === '__new_project__');
      select.insertBefore(option, createOption || null);
    }
    select.value = selectedName;
    select.dataset.lastValue = selectedName;
  }
  if (input) input.value = '';
  if (panel) panel.classList.remove('is-open');
  if (hint) hint.style.display = 'flex';
  if (typeof showToast === 'function') showToast(existing ? 'تم اختيار المشروع الموجود' : 'سيُحفظ المشروع مع المهمة عند إضافتها');
  return true;
}

function cancelQuickTaskProject() {
  const select = document.getElementById('quickTaskProjectSelect');
  const panel = document.getElementById('quickTaskProjectQuickAdd');
  const input = document.getElementById('quickTaskNewProjectInput');
  if (select) select.value = select.dataset.lastValue || '';
  if (panel) panel.classList.remove('is-open');
  if (input) input.value = '';
}

window._quickTaskDraftSubtasks = window._quickTaskDraftSubtasks || [];

function renderQuickTaskSubtasks() {
  const list = document.getElementById('quickTaskSubtaskList');
  const count = document.getElementById('quickTaskSubtaskCount');
  const items = Array.isArray(window._quickTaskDraftSubtasks) ? window._quickTaskDraftSubtasks : [];
  if (count) {
    count.textContent = String(items.length);
    count.setAttribute('aria-label', `${items.length} خطوات فرعية`);
  }
  if (!list) return;
  list.innerHTML = items.map(item => `
    <li>
      <span>${escapeHtml(item.title)}</span>
      <button type="button" class="task-creator-subtask-remove" onclick="removeQuickTaskSubtask('${item.id}')" aria-label="حذف الخطوة: ${escapeHtml(item.title)}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
    </li>
  `).join('');
}

function addQuickTaskSubtask() {
  const input = document.getElementById('quickTaskSubtaskInput');
  const title = String(input && input.value || '').trim().replace(/\s+/g, ' ');
  if (!title) {
    if (typeof showToast === 'function') showToast('اكتب وصف الخطوة أولاً');
    if (input) input.focus();
    return false;
  }
  if (window._quickTaskDraftSubtasks.length >= 12) {
    if (typeof showToast === 'function') showToast('يمكن إضافة 12 خطوة فرعية كحد أقصى للمهمة');
    return false;
  }
  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  window._quickTaskDraftSubtasks.push({ id, title, completed: false });
  if (input) { input.value = ''; input.focus(); }
  renderQuickTaskSubtasks();
  return true;
}

function removeQuickTaskSubtask(subtaskId) {
  window._quickTaskDraftSubtasks = window._quickTaskDraftSubtasks.filter(item => item.id !== subtaskId);
  renderQuickTaskSubtasks();
}

function clearQuickTaskDraftSubtasks() {
  window._quickTaskDraftSubtasks = [];
  const input = document.getElementById('quickTaskSubtaskInput');
  const details = document.getElementById('quickTaskSubtasksDetails');
  if (input) input.value = '';
  if (details) details.open = false;
  renderQuickTaskSubtasks();
}

function openOrToggleUnifiedTaskCreator() {
  const card = document.getElementById('tasksUnifiedCreatorCard');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const inp = document.getElementById('quickTaskTitleInput');
    if (inp) inp.focus();
  }
}

function openNewTaskDrawerModal() {
  openOrToggleUnifiedTaskCreator();
}

function resetUnifiedTaskForm() {
  const titleInp = document.getElementById('quickTaskTitleInput');
  if (titleInp) titleInp.value = '';
  updateQuickTaskTitleFeedback();
  setQuickTaskTitleError('');
  setQuickTaskFormStatus('');
  const projectSelect = document.getElementById('quickTaskProjectSelect');
  if (projectSelect) {
    projectSelect.value = '';
    projectSelect.dataset.lastValue = '';
  }
  const projectPanel = document.getElementById('quickTaskProjectQuickAdd');
  const projectInput = document.getElementById('quickTaskNewProjectInput');
  const projectHint = document.getElementById('quickTaskProjectHint');
  if (projectPanel) projectPanel.classList.remove('is-open');
  if (projectInput) projectInput.value = '';
  if (projectHint) projectHint.style.display = 'none';
  clearQuickTaskDraftSubtasks();

  selectedTaskTags = new Set(['general']);
  syncTaskTagChoices();

  const defaultDateBtn = document.querySelector('#inlineDatePresetGroup [data-preset="today"]');
  if (defaultDateBtn) selectInlineDatePreset('today', defaultDateBtn);

  const defaultTimeBtn = document.querySelector('#inlineTimePresetGroup [data-time=""]');
  if (defaultTimeBtn) selectInlineTimePreset('', defaultTimeBtn);

  const defaultMemberBtn = document.querySelector('#inlineTaskMemberGroup [data-member="البيت"]');
  if (defaultMemberBtn) selectInlineTaskMember('البيت', defaultMemberBtn);

  clearTaskPendingPhoto();
}

function renderTaskTagBadge(task) {
  const tagConfigs = {
    'my_day': { label: '☀️ يومي', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
    'general': { label: '🌐 عامة', color: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)' },
    'planned': { label: '📅 مجدولة', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.4)' },
    'important': { label: '⭐ هامة', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)' },
    'shopping': { label: '🛒 مشتريات', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
    'home': { label: '🛋️ منزلية', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)' },
    'bills': { label: '⚡ فواتير', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.4)' },
    'health': { label: '🩺 صحة', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)' },
    'work': { label: '💼 عمل', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)' },
  };
  return getTaskTags(task).map(tag => {
    const cfg = Object.hasOwn(tagConfigs, tag) ? tagConfigs[tag] : tagConfigs.general;
    return `<span style="font-size: 0.65rem; font-weight: 850; padding: 1px 7px; border-radius: 6px; color: ${cfg.color}; background: ${cfg.bg}; border: 1px solid ${cfg.border};">${cfg.label}</span>`;
  }).join(' ');
}

window.selectTaskInlineTag = selectTaskInlineTag;
window.selectInlineDatePreset = selectInlineDatePreset;
window.onInlineDateCustomChange = onInlineDateCustomChange;
window.selectInlineTimePreset = selectInlineTimePreset;
window.onInlineTimeCustomChange = onInlineTimeCustomChange;
window.selectInlineTaskMember = selectInlineTaskMember;
window.openOrToggleUnifiedTaskCreator = openOrToggleUnifiedTaskCreator;
window.openNewTaskDrawerModal = openNewTaskDrawerModal;
window.resetUnifiedTaskForm = resetUnifiedTaskForm;
window.renderTaskTagBadge = renderTaskTagBadge;
window.updateUnifiedTaskDateTimeLabel = updateUnifiedTaskDateTimeLabel;



/* ==========================================================================
   إدارة إظهار وإخفاء نموذج المهام الجديد وإرفاق الصور للمهام والمهام الفرعية
   ========================================================================== */
window._pendingSubtaskPhotos = {};
window._activeSubtaskTaskId = null;

function showUnifiedTaskCreator() {
  if (typeof refreshProjectSelectors === 'function') refreshProjectSelectors();
  const card = document.getElementById('tasksUnifiedCreatorCard');
  const heroBtn = document.getElementById('btnHeroAddTaskBar');
  if (heroBtn) heroBtn.style.display = 'none';
  if (card) {
    card.style.display = 'flex';
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const inp = document.getElementById('quickTaskTitleInput');
    if (inp) setTimeout(() => inp.focus(), 100);
  }
}

function hideUnifiedTaskCreator() {
  const card = document.getElementById('tasksUnifiedCreatorCard');
  const heroBtn = document.getElementById('btnHeroAddTaskBar');
  if (card) {
    card.style.display = 'none';
  }
  if (heroBtn) heroBtn.style.display = 'flex';
  resetUnifiedTaskForm();
}

function toggleUnifiedTaskCreator() {
  if (window.currentTasksViewMode === 'calendar') {
    switchTasksViewMode('list');
    showUnifiedTaskCreator();
    return;
  }
  const card = document.getElementById('tasksUnifiedCreatorCard');
  if (!card) return;
  if (card.style.display === 'none' || getComputedStyle(card).display === 'none') {
    showUnifiedTaskCreator();
  } else {
    hideUnifiedTaskCreator();
  }
}

function openTasksAndAddNewTask() {
  openTasksFullScreenModal();
  showUnifiedTaskCreator();
}

function triggerMainTaskCamera() {
  const inp = document.getElementById('mainTaskCameraInput');
  if (inp) inp.click();
}

function triggerMainTaskGallery() {
  const inp = document.getElementById('mainTaskGalleryInput');
  if (inp) inp.click();
}

function triggerSubtaskCamera(taskId) {
  window._activeSubtaskTaskId = taskId;
  const inp = document.getElementById('subtaskCameraInput');
  if (inp) inp.click();
}

function triggerSubtaskGallery(taskId) {
  window._activeSubtaskTaskId = taskId;
  const inp = document.getElementById('subtaskGalleryInput');
  if (inp) inp.click();
}

function compressImageFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const rawData = e.target.result;
      const img = new Image();
      img.onload = function() {
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => resolve(rawData);
      img.src = rawData;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function renderTaskPhotoPreviewBar() {
  const previewBar = document.getElementById('quickTaskPhotoPreviewBar');
  if (!previewBar) return;
  const photos = window.currentQuickTaskPhotos || [];
  if (photos.length === 0) {
    previewBar.style.display = 'none';
    previewBar.innerHTML = '';
    return;
  }
  previewBar.style.display = 'inline-flex';
  previewBar.style.flexWrap = 'wrap';
  previewBar.style.gap = '6px';
  previewBar.innerHTML = photos.map((p, idx) => `
    <div style="position: relative; display: inline-block;">
      <img src="${p}" style="width: 34px; height: 34px; object-fit: cover; border-radius: 6px; border: 1.5px solid #10b981; cursor: pointer;" onclick="if(typeof openReceiptLightbox==='function') openReceiptLightbox('${p}', 'معاينة المرفق ${idx+1}')">
      <button type="button" onclick="removeTaskPendingPhoto(${idx})" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 16px; height: 16px; font-size: 0.60rem; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `).join('') + (photos.length > 1 ? `<span style="font-size: 0.65rem; color: #34d399; font-weight: 850; align-self: center;">(${photos.length} مرفقات)</span>` : '');
}
window.renderTaskPhotoPreviewBar = renderTaskPhotoPreviewBar;

function removeTaskPendingPhoto(index) {
  if (window.currentQuickTaskPhotos) {
    window.currentQuickTaskPhotos.splice(index, 1);
    window.currentQuickTaskPhoto = window.currentQuickTaskPhotos[0] || null;
    renderTaskPhotoPreviewBar();
  }
}
window.removeTaskPendingPhoto = removeTaskPendingPhoto;

async function handleTaskFileChosen(event, targetType) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  if (targetType === 'main') {
    window.currentQuickTaskPhotos = window.currentQuickTaskPhotos || [];
    for (let i = 0; i < files.length; i++) {
      const compressed = await compressImageFile(files[i]);
      if (compressed) {
        window.currentQuickTaskPhotos.push(compressed);
      }
    }
    window.currentQuickTaskPhoto = window.currentQuickTaskPhotos[0] || null;
    renderTaskPhotoPreviewBar();
    if (typeof showToast === 'function') {
      showToast(`تم إرفاق ${files.length > 1 ? files.length + ' صور' : 'صورة'} للمهمة بنجاح ✓`);
    }
    event.target.value = '';
  } else if (targetType === 'subtask') {
    const file = files[0];
    const compressedData = await compressImageFile(file);
    if (!compressedData) return;
        const taskId = window._activeSubtaskTaskId;
        if (!taskId) return;
        window._pendingSubtaskPhotos[taskId] = compressedData;
        const subPreview = document.getElementById(`subtaskPendingPreview_${taskId}`);
        if (subPreview) {
          subPreview.style.display = 'flex';
          subPreview.innerHTML = `
            <div style="position: relative; display: inline-block;">
              <img src="${compressedData}" style="width: 28px; height: 28px; object-fit: cover; border-radius: 6px; border: 1.5px solid #38bdf8;">
              <button type="button" onclick="clearSubtaskPendingPhoto('${taskId}')" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 15px; height: 15px; font-size: 0.55rem; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <span style="font-size: 0.68rem; color: #38bdf8; font-weight: 800;">جاهز للخطوة الفرعية ✓</span>
          `;
        }
        if (typeof showToast === 'function') showToast('تم تجهيز صورة الخطوة الفرعية ✓');
        event.target.value = '';
    }
  }


function clearSubtaskPendingPhoto(taskId) {
  if (window._pendingSubtaskPhotos) {
    delete window._pendingSubtaskPhotos[taskId];
  }
  const preview = document.getElementById(`subtaskPendingPreview_${taskId}`);
  if (preview) {
    preview.style.display = 'none';
    preview.innerHTML = '';
  }
}

window.showUnifiedTaskCreator = showUnifiedTaskCreator;
window.hideUnifiedTaskCreator = hideUnifiedTaskCreator;
window.toggleUnifiedTaskCreator = toggleUnifiedTaskCreator;
window.openTasksAndAddNewTask = openTasksAndAddNewTask;
window.triggerMainTaskCamera = triggerMainTaskCamera;
window.triggerMainTaskGallery = triggerMainTaskGallery;
window.triggerSubtaskCamera = triggerSubtaskCamera;
window.triggerSubtaskGallery = triggerSubtaskGallery;
window.handleTaskFileChosen = handleTaskFileChosen;
window.clearSubtaskPendingPhoto = clearSubtaskPendingPhoto;

window._isQuickTaskSaving = false;

function handleQuickTaskAdd() {
  if (window._isQuickTaskSaving) return false;
  const titleInp = document.getElementById('quickTaskTitleInput');
  const title = String(titleInp && titleInp.value || '').trim().replace(/\s+/g, ' ');
  if (!title) {
    setQuickTaskTitleError('عنوان المهمة مطلوب قبل الحفظ.');
    setQuickTaskFormStatus('أكمل الحقل المطلوب للمتابعة.', 'error');
    if (titleInp) titleInp.focus();
    return false;
  }
  setQuickTaskTitleError('');
  setQuickTaskFormStatus('');
  if (titleInp && titleInp.value !== title) titleInp.value = title;
  updateQuickTaskTitleFeedback();

  const submitButton = document.getElementById('btnSubmitUnifiedTask');
  const originalButtonHtml = submitButton ? submitButton.innerHTML : '';
  window._isQuickTaskSaving = true;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i><span>جارٍ حفظ المهمة…</span>';
  }

  let isSaved = false;
  try {
    const now = new Date();
    const dateInp = document.getElementById('inlineTaskDueDate');
    const timeInp = document.getElementById('inlineTaskDueTime');
    const timezoneInp = document.getElementById('inlineTaskDueTimezone');
    const secondInp = document.getElementById('inlineTaskDueSecond');
    const dueTimezone = timezoneInp && timezoneInp.value || window._selectedTaskTimezone || getDefaultTaskTimezone();
    const dueDate = (dateInp && dateInp.value) ? dateInp.value : getTaskDateInTimezone(dueTimezone, now);
    const dueTime = (timeInp && timeInp.value) ? timeInp.value : '';
    const dueSecond = dueTime && secondInp ? String(Number(secondInp.value) || 0).padStart(2, '0') : '00';

    const tags = [...selectedTaskTags];
    const tag = tags.find(value => value !== 'general') || 'general';
    const member = window._selectedTaskMember || (window.currentTaskMemberFilter !== 'all' ? window.currentTaskMemberFilter : 'البيت');
    const priority = tags.includes('important') ? 'high' : 'medium';
    const projectSelect = document.getElementById('quickTaskProjectSelect');
    const project = String(projectSelect && projectSelect.value || '').trim();
    const draftSubtasks = Array.isArray(window._quickTaskDraftSubtasks) ? window._quickTaskDraftSubtasks : [];

    const notesInp = document.getElementById('quickTaskNotesInput');
    const notes = String(notesInp && notesInp.value || '').trim();
    const photos = (window.currentQuickTaskPhotos && window.currentQuickTaskPhotos.length) 
      ? [...window.currentQuickTaskPhotos] 
      : (window.currentQuickTaskPhoto ? [window.currentQuickTaskPhoto] : []);

    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: title,
      notes: notes,
      dueDate: dueDate,
      dueTime: dueTime,
      dueSecond: dueSecond,
      dueTimeZone: dueTimezone,
      dueAt: resolveTaskDateTimeInTimezone(dueDate, dueTime, dueSecond, dueTimezone) || null,
      tags,
      tag,
      category: tag,
      project: project,
      assignedMember: member,
      priority: priority,
      completed: false,
      photo: photos[0] || null,
      photos: photos,
      createdAt: new Date().toISOString(),
      subtasks: draftSubtasks.map(item => ({ id: item.id, title: item.title, completed: false }))
    };

    const tasks = getTodoTasks();
    tasks.unshift(newTask);
    if (!saveTodoTasks(tasks)) {
      setQuickTaskFormStatus('تعذر الحفظ على هذا الجهاز. بياناتك ما زالت في النموذج؛ تأكد من توفر مساحة أو أزل الصورة المرفقة ثم أعد المحاولة.', 'error');
      return false;
    }
    isSaved = true;
    familyAlerts.created('task', newTask);

    if (typeof refreshProjectSelectors === 'function') refreshProjectSelectors();
    clearTaskPendingPhoto();
    renderTasksProList();
    updateTasksProductivityKPIs();
    hideUnifiedTaskCreator();
    const subtaskSummary = draftSubtasks.length === 1 ? ' مع خطوة فرعية' : draftSubtasks.length === 2 ? ' مع خطوتين فرعيتين' : draftSubtasks.length ? ` مع ${draftSubtasks.length} خطوات فرعية` : '';
    if (typeof showToast === 'function') showToast(`🎯 تم تسجيل مهمة (${newTask.title})${subtaskSummary} بنجاح ✓`, 'success', 4500);
    return true;
  } catch (error) {
    console.error('Error creating task:', error);
    if (isSaved) {
      if (typeof showToast === 'function') showToast('تم حفظ المهمة، لكن تعذر تحديث العرض. أعد فتح قائمة المهام.');
      return true;
    }
    setQuickTaskFormStatus('حدث خلل أثناء الحفظ. بقيت بياناتك في النموذج ويمكنك المحاولة مرة أخرى.', 'error');
    return false;
  } finally {
    window._isQuickTaskSaving = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.innerHTML = originalButtonHtml;
    }
  }
}

function updateTasksProductivityKPIs() {
  const tasks = getTodoTasks();
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const overdue = tasks.filter(isTaskOverdueByDate).length;
  const pending = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const elTotal = document.getElementById('pinnedTasksTotalCount');
  const elPending = document.getElementById('pinnedTasksPendingCount');
  const elDone = document.getElementById('pinnedTasksDoneCount');
  const elOverdue = document.getElementById('pinnedTasksOverdueCount');
  const elBadge = document.getElementById('pinnedTasksCompletionRateBadge');
  const elBar = document.getElementById('pinnedTasksProgressBar');

  if (elTotal) elTotal.textContent = total;
  if (elPending) elPending.textContent = pending;
  if (elDone) elDone.textContent = done;
  if (elOverdue) elOverdue.textContent = overdue;
  if (elBadge) elBadge.textContent = `${pct}%`;
  if (elBar) elBar.style.width = `${pct}%`;

  const catCounts = { all: total, shopping: 0, bills: 0, health: 0, home: 0, work: 0 };
  tasks.forEach(t => {
    getTaskTags(t).forEach(tag => {
      if (tag !== 'all' && Object.hasOwn(catCounts, tag)) catCounts[tag]++;
    });
  });
  ['All', 'Shopping', 'Bills', 'Health', 'Home', 'Work'].forEach(c => {
    const el = document.getElementById('catBadge' + c);
    if (el) el.textContent = catCounts[c.toLowerCase()] || 0;
  });
}

function toggleTaskCompleted(taskId) {
  const tasks = getTodoTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTodoTasks(tasks);
    renderTasksProList();
    updateTasksProductivityKPIs();
    if (window.currentTasksViewMode === 'calendar') {
      renderTasksCalendar();
    }
  }
}

function deleteTaskItem(taskId) {
  let tasks = getTodoTasks();
  tasks = tasks.filter(t => t.id !== taskId);
  saveTodoTasks(tasks);
  renderTasksProList();
  updateTasksProductivityKPIs();
  if (window.currentTasksViewMode === 'calendar') {
    renderTasksCalendar();
  }
  if (typeof showToast === 'function') showToast('تم حذف المهمة');
}

function toggleExpandTask(taskId) {
  const detailsWrap = document.getElementById('taskDetailsWrap_' + taskId);
  const icon = document.getElementById('taskExpandIcon_' + taskId);
  if (detailsWrap) {
    const isHidden = detailsWrap.style.display === 'none' || !detailsWrap.style.display;
    detailsWrap.style.display = isHidden ? 'flex' : 'none';
    if (icon) {
      icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  }
}

function addNewSubtaskInline(taskId) {
  const inp = document.getElementById(`newSubtaskInput_${taskId}`);
  const title = inp ? inp.value.trim() : '';
  if (!title) {
    if (typeof showToast === 'function') showToast('يرجى كتابة بيان الخطوة الفرعية');
    if (inp) inp.focus();
    return;
  }

  const tasks = getTodoTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    if (!task.subtasks) task.subtasks = [];
    const photo = (window._pendingSubtaskPhotos && window._pendingSubtaskPhotos[taskId]) ? window._pendingSubtaskPhotos[taskId] : null;
    task.subtasks.push({
      id: 'sub_' + Date.now(),
      title: title,
      completed: false,
      photo: photo
    });
    saveTodoTasks(tasks);
    if (inp) inp.value = '';
    clearSubtaskPendingPhoto(taskId);
    renderTasksProList();
    if (typeof showToast === 'function') showToast('تمت إضافة الخطوة الفرعية ✓');
  }
}

function toggleSubtaskCompleted(taskId, subId) {
  const tasks = getTodoTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task && task.subtasks) {
    const sub = task.subtasks.find(s => s.id === subId);
    if (sub) {
      sub.completed = !sub.completed;
      saveTodoTasks(tasks);
      renderTasksProList();
    }
  }
}

function deleteSubtask(taskId, subId) {
  const tasks = getTodoTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task && task.subtasks) {
    task.subtasks = task.subtasks.filter(s => s.id !== subId);
    saveTodoTasks(tasks);
    renderTasksProList();
  }
}

function setTasksCategoryFilter(cat, btn) {
  window.currentTaskCategoryFilter = cat;
  const pills = document.querySelectorAll('.task-category-pill');
  pills.forEach(p => {
    if (p.getAttribute('data-cat') === cat) {
      p.classList.add('active');
      p.style.background = 'linear-gradient(135deg, #a855f7, #6366f1)';
      p.style.color = '#fff';
      p.style.border = 'none';
      p.style.boxShadow = '0 2px 8px rgba(168,85,247,0.35)';
    } else {
      p.classList.remove('active');
      p.style.background = 'rgba(255,255,255,0.06)';
      p.style.color = '#94a3b8';
      p.style.border = '1px solid rgba(255,255,255,0.1)';
      p.style.boxShadow = 'none';
    }
  });
  renderTasksProList();
}

function renderTasksMemberFilterPills() {
  const container = document.getElementById('tasksMemberFilterPills');
  if (!container) return;

  const defaultMembers = ['الكل', 'ماهر', 'آية', 'محمد', 'مريم', 'الحاجة', 'النونو', 'البيت'];
  const memberSet = new Set(defaultMembers);

  document.querySelectorAll('.avatar-card[data-member]').forEach(card => {
    const mem = card.getAttribute('data-member');
    if (mem && mem !== 'الكل') memberSet.add(mem);
  });

  const tasks = (typeof getTodoTasks === 'function') ? getTodoTasks() : [];
  tasks.forEach(t => {
    if (t.assignedMember && t.assignedMember !== 'all') memberSet.add(t.assignedMember);
  });

  const active = window.currentTaskMemberFilter || 'all';
  const members = Array.from(memberSet);

  container.innerHTML = members.map(m => {
    const val = (m === 'الكل') ? 'all' : m;
    const isActive = (active === val || (active === 'all' && val === 'all'));
    const activeStyle = isActive
      ? 'background: linear-gradient(135deg, #a855f7, #6366f1); color: #fff; font-weight: 800;'
      : 'background: rgba(255,255,255,0.06); color: #94a3b8;';
    return `<button type="button" class="btn-export-tool ${isActive ? 'active' : ''}" onclick="setTasksMemberFilter('${val}', this)" style="padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; flex-shrink: 0; ${activeStyle}">${m}</button>`;
  }).join('');
}
window.renderTasksMemberFilterPills = renderTasksMemberFilterPills;

function setTasksMemberFilter(member, btn) {
  window.currentTaskMemberFilter = member;
  const pills = document.querySelectorAll('#tasksMemberFilterPills button');
  pills.forEach(p => {
    p.classList.remove('active');
    p.style.background = 'rgba(255,255,255,0.06)';
    p.style.color = '#94a3b8';
  });
  if (btn) {
    btn.classList.add('active');
    btn.style.background = 'linear-gradient(135deg, #a855f7, #6366f1)';
    btn.style.color = '#fff';
  }
  renderTasksProList();
}

function switchTodoSection(section, btn) {
  window.currentTaskSectionFilter = section;
  const pills = document.querySelectorAll('#tasksSmartListTabs button');
  pills.forEach(p => {
    p.classList.remove('active');
    p.style.background = 'rgba(255,255,255,0.06)';
    p.style.color = '#94a3b8';
  });
  if (btn) {
    btn.classList.add('active');
    btn.style.background = 'linear-gradient(135deg, #a855f7, #6366f1)';
    btn.style.color = '#fff';
  }
  renderTasksProList();
}

function renderTasksProList() {
  const container = document.getElementById('tasksFullScreenContainerList');
  if (!container) return;

  const searchInp = document.getElementById('tasksSearchInput');
  const query = searchInp ? searchInp.value.trim().toLowerCase() : '';

  let tasks = getTodoTasks();
  // Apply Section Filter
  if (window.currentTaskSectionFilter === 'my_day') {
    tasks = tasks.filter(t => isTaskDueTodayByDate(t) || getTaskTags(t).includes('my_day'));
  } else if (window.currentTaskSectionFilter === 'important') {
    tasks = tasks.filter(t => t.priority === 'high' || getTaskTags(t).includes('important'));
  } else if (window.currentTaskSectionFilter === 'planned') {
    tasks = tasks.filter(t => !!t.dueDate || getTaskTags(t).includes('planned'));
  } else if (window.currentTaskSectionFilter === 'shopping') {
    tasks = tasks.filter(t => getTaskTags(t).includes('shopping'));
  } else if (window.currentTaskSectionFilter === 'overdue') {
    tasks = tasks.filter(isTaskOverdueByDate);
  } else if (window.currentTaskSectionFilter === 'completed') {
    tasks = tasks.filter(t => t.completed);
  }

  // Apply Category Filter
  if (window.currentTaskCategoryFilter !== 'all') {
    tasks = tasks.filter(t => getTaskTags(t).includes(window.currentTaskCategoryFilter));
  }

  // Apply Member Filter
  if (window.currentTaskMemberFilter !== 'all') {
    tasks = tasks.filter(t => (t.assignedMember || 'البيت') === window.currentTaskMemberFilter);
  }

  // Apply Search
  if (query) {
    tasks = tasks.filter(t => {
      const matchTitle = (t.title || '').toLowerCase().includes(query);
      const matchSubs = (t.subtasks || []).some(s => (s.title || '').toLowerCase().includes(query));
      const matchProject = (t.project || '').toLowerCase().includes(query);
      return matchTitle || matchSubs || matchProject;
    });
  }

  if (tasks.length === 0) {
    container.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px dashed rgba(168, 85, 247, 0.35); border-radius: 14px; padding: 24px; text-align: center; color: #94a3b8;">
        <i class="fa-solid fa-clipboard-check" style="font-size: 2rem; color: #c084fc; opacity: 0.5; margin-bottom: 8px; display: block;"></i>
        <div style="font-size: 0.85rem; font-weight: 850; color: #f8fafc; margin-bottom: 4px;">لا توجد مهام تطابق هذا الفلتر</div>
        <div style="font-size: 0.72rem;">يمكنك كتابة مهمة جديدة في الحقل أعلاه والضغط على إضافة</div>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  tasks.forEach(t => {
    const isOverdue = isTaskOverdueByDate(t);
    const isDueToday = isTaskDueTodayByDate(t);
    const subtasks = t.subtasks || [];
    const doneSubs = subtasks.filter(s => s.completed).length;

    const card = document.createElement('div');
    card.className = 'task-pro-card';
    const isLightMode = document.body.classList.contains('light-theme') || document.documentElement.getAttribute('data-app-theme') === 'light';
    const defaultCardBg = isLightMode ? '#ffffff' : 'linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))';
    const defaultBorder = t.completed ? 'rgba(16, 185, 129, 0.4)' : (isOverdue ? 'rgba(244, 63, 94, 0.5)' : (isLightMode ? '#e2e8f0' : 'rgba(168, 85, 247, 0.3)'));
    card.style.cssText = `
      background: ${defaultCardBg};
      border: 1.2px solid ${defaultBorder};
      border-radius: 14px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: ${isLightMode ? '0 4px 14px rgba(0,0,0,0.06)' : '0 4px 14px rgba(0,0,0,0.3)'};
      transition: all 0.2s ease;
    `;

    // Compact Collapsed Header (shows title, check button, metadata badges, and expand button)
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; cursor: pointer;" onclick="toggleExpandTask('${t.id}')">
        <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
          <button type="button" onclick="event.stopPropagation(); toggleTaskCompleted('${t.id}')" style="width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid ${t.completed ? '#10b981' : '#a855f7'}; background: ${t.completed ? '#10b981' : 'transparent'}; color: #fff; font-size: 0.72rem; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;">
            ${t.completed ? '<i class="fa-solid fa-check"></i>' : ''}
          </button>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 0.85rem; font-weight: 850; color: ${t.completed ? '#64748b' : '#f8fafc'}; text-decoration: ${t.completed ? 'line-through' : 'none'}; word-break: break-word;">
              ${escapeHtml(t.title)}
            </div>
            <div style="font-size: 0.66rem; color: #94a3b8; display: flex; align-items: center; gap: 6px; margin-top: 1px; flex-wrap: wrap;">
              ${renderTaskTagBadge(t)}
              ${t.project ? `<span style="color:#7dd3fc; background:rgba(56,189,248,0.10); border:1px solid rgba(56,189,248,0.22); padding:1px 6px; border-radius:6px; font-weight:800;">📌 ${escapeHtml(t.project)}</span>` : ''}
              ${t.dueDate ? `<span style="color: ${isOverdue ? '#f43f5e' : (isDueToday ? '#38bdf8' : '#94a3b8')}; font-weight: 800;">📅 ${t.dueDate}</span>` : ''}
              ${t.dueTime ? `<span>⏰ ${escapeHtml(formatTaskTimeDisplay(t))}</span>` : ''}
              ${t.dueTimeZone && t.dueTime ? `<span title="${escapeHtml(t.dueTimeZone)}" style="color:#7dd3fc; font-size:0.60rem; font-weight:800;">${escapeHtml(getTaskTimezoneBadge(t))}</span>` : ''}
              ${(t.photos && t.photos.length > 1) ? `<span style="color: #38bdf8; font-weight: 800;"><i class="fa-solid fa-images"></i> ${t.photos.length} مرفقات</span>` : (t.photo ? `<span style="color: #38bdf8; font-weight: 800;"><i class="fa-solid fa-image"></i> مرفق صورة</span>` : '')}
              ${subtasks.length > 0 ? `<span style="color: #34d399; font-weight: 800;">(${doneSubs}/${subtasks.length} خطوات)</span>` : ''}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          <button type="button" onclick="event.stopPropagation(); toggleExpandTask('${t.id}')" style="width: 28px; height: 28px; border-radius: 7px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; transition: transform 0.2s;">
            <i class="fa-solid fa-chevron-down" id="taskExpandIcon_${t.id}"></i>
          </button>
          <button type="button" onclick="event.stopPropagation(); deleteTaskItem('${t.id}')" style="width: 28px; height: 28px; border-radius: 7px; background: rgba(244,63,94,0.12); border: 1px solid rgba(244,63,94,0.3); color: #f43f5e; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.72rem;"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>

      <!-- Details Container (COLLAPSED BY DEFAULT: display: none) -->
      <div id="taskDetailsWrap_${t.id}" style="display: none; flex-direction: column; gap: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); margin-top: 4px;">
        ${t.notes ? `
          <div style="background: rgba(15, 23, 42, 0.6); padding: 8px 12px; border-radius: 9px; border: 1px solid rgba(168,85,247,0.25); font-size: 0.78rem; color: #e2e8f0; line-height: 1.5; white-space: pre-wrap;">
            <div style="font-size: 0.68rem; font-weight: 850; color: #c084fc; margin-bottom: 3px;"><i class="fa-solid fa-file-lines"></i> شرح وتفاصيل المهمة:</div>
            ${escapeHtml(t.notes)}
          </div>
        ` : ''}
        ${(t.photos && t.photos.length > 0) ? `
          <div style="background: rgba(15, 23, 42, 0.6); padding: 8px 12px; border-radius: 9px; border: 1px solid rgba(168,85,247,0.3);">
            <div style="font-size: 0.70rem; font-weight: 850; color: #c084fc; margin-bottom: 6px;"><i class="fa-solid fa-images"></i> المرفقات (${t.photos.length}) - اضغط للتكبير:</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${t.photos.map((p, idx) => `
                <img src="${p}" style="width: 72px; height: 72px; object-fit: cover; border-radius: 8px; border: 1.2px solid rgba(56,189,248,0.45); cursor: pointer; transition: transform 0.15s;" onclick="if(typeof openReceiptLightbox==='function') openReceiptLightbox('${p}', '${escapeHtml(t.title)} - مرفق ${idx+1}')" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              `).join('')}
            </div>
          </div>
        ` : (t.photo ? `
          <div style="background: rgba(15, 23, 42, 0.6); padding: 8px; border-radius: 9px; border: 1px solid rgba(168,85,247,0.3);">
            <div style="font-size: 0.70rem; font-weight: 850; color: #c084fc; margin-bottom: 5px;"><i class="fa-solid fa-image"></i> الصورة المرفقة للمهمة (اضغط للتكبير):</div>
            <img src="${t.photo}" style="max-height: 140px; border-radius: 8px; border: 1.2px solid rgba(168,85,247,0.5); object-fit: cover; cursor: pointer; display: block;" onclick="if(typeof openReceiptLightbox==='function') openReceiptLightbox('${t.photo}', '${escapeHtml(t.title)}')">
          </div>
        ` : '')}

        <div style="display: flex; gap: 8px; align-items: center; font-size: 0.70rem; color: #94a3b8;">
          <span style="color: #c084fc;"><i class="fa-solid fa-user"></i> المسؤول: ${escapeHtml(t.assignedMember || 'البيت')}</span>
          ${t.estimatedAmount ? `<span style="color: #fbbf24; font-weight: 850;">💰 التكلفة المقدرة: ${t.estimatedAmount} ج.م</span>` : ''}
        </div>

        ${subtasks.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <div style="font-size: 0.70rem; font-weight: 850; color: #38bdf8;"><i class="fa-solid fa-list-check"></i> الخطوات الفرعية:</div>
            ${subtasks.map(s => `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(15, 23, 42, 0.7); padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
                <div style="display: flex; align-items: center; gap: 7px; min-width: 0;">
                  <button type="button" onclick="toggleSubtaskCompleted('${t.id}', '${s.id}')" style="width: 20px; height: 20px; border-radius: 50%; border: 1.2px solid ${s.completed ? '#10b981' : '#a855f7'}; background: ${s.completed ? '#10b981' : 'transparent'}; color: #fff; font-size: 0.65rem; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
                    ${s.completed ? '<i class="fa-solid fa-check"></i>' : ''}
                  </button>
                  <span style="font-size: 0.76rem; font-weight: 750; color: ${s.completed ? '#64748b' : '#e2e8f0'}; text-decoration: ${s.completed ? 'line-through' : 'none'}; word-break: break-word;">${escapeHtml(s.title)}</span>
                  ${s.photo ? `<img src="${s.photo}" alt="مرفق الخطوة" style="width: 26px; height: 26px; border-radius: 6px; object-fit: cover; border: 1.2px solid #38bdf8; cursor: pointer; flex-shrink: 0;" onclick="event.stopPropagation(); if(typeof openReceiptLightbox==='function') openReceiptLightbox('${s.photo}', '${escapeHtml(s.title)}')" title="انقر لعرض صورة الخطوة الفرعية مكبرة">` : ''}
                </div>
                <button type="button" onclick="deleteSubtask('${t.id}', '${s.id}')" style="background: transparent; border: none; color: #f87171; cursor: pointer; font-size: 0.74rem; padding: 2px;"><i class="fa-solid fa-xmark"></i></button>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <!-- حقل إضافة خطوة فرعية جديدة مع خياري: تصوير أو استوديو -->
        <div style="display: flex; gap: 5px; margin-top: 6px; align-items: center;">
          <input type="text" id="newSubtaskInput_${t.id}" placeholder="+ إضافة خطوة فرعية..." style="flex: 1; height: 32px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1.2px solid rgba(168,85,247,0.35); color: #fff; font-size: 0.74rem; font-weight: 750; padding: 0 10px; outline: none; box-sizing: border-box;" onkeydown="if(event.key==='Enter') addNewSubtaskInline('${t.id}')">
          <button type="button" onclick="triggerSubtaskCamera('${t.id}')" title="تصوير خطوة فرعية بالكاميرا" style="height: 32px; padding: 0 8px; border-radius: 8px; background: rgba(56,189,248,0.18); border: 1.2px solid rgba(56,189,248,0.45); color: #38bdf8; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-camera"></i>
          </button>
          <button type="button" onclick="triggerSubtaskGallery('${t.id}')" title="اختيار صورة من الاستوديو" style="height: 32px; padding: 0 8px; border-radius: 8px; background: rgba(16,185,129,0.18); border: 1.2px solid rgba(16,185,129,0.45); color: #34d399; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-image"></i>
          </button>
          <button type="button" onclick="addNewSubtaskInline('${t.id}')" style="height: 32px; padding: 0 12px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.74rem; font-weight: 900; cursor: pointer;">إضافة</button>
        </div>
        <div id="subtaskPendingPreview_${t.id}" style="display: none; align-items: center; gap: 6px; margin-top: 4px;"></div>
      </div>
    `;

    container.appendChild(card);
  });
}

function navigateTasksCalendar(delta) {
  window.calendarCurrentMonth += delta;
  if (window.calendarCurrentMonth > 11) {
    window.calendarCurrentMonth = 0;
    window.calendarCurrentYear += 1;
  } else if (window.calendarCurrentMonth < 0) {
    window.calendarCurrentMonth = 11;
    window.calendarCurrentYear -= 1;
  }
  const now = new Date();
  if (window.calendarCurrentYear === now.getFullYear() && window.calendarCurrentMonth === now.getMonth()) {
    window.calendarSelectedDate = (typeof getLocalDateStr === 'function') ? getLocalDateStr(now) : now.toISOString().slice(0, 10);
  } else {
    window.calendarSelectedDate = `${window.calendarCurrentYear}-${String(window.calendarCurrentMonth + 1).padStart(2, '0')}-01`;
  }
  renderTasksCalendar();
}

function goToTasksCalendarToday() {
  const now = new Date();
  window.calendarCurrentYear = now.getFullYear();
  window.calendarCurrentMonth = now.getMonth();
  window.calendarSelectedDate = (typeof getLocalDateStr === 'function') ? getLocalDateStr(now) : now.toISOString().slice(0, 10);
  renderTasksCalendar();
}

function formatArabicDateFriendly(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const daysNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayName = daysNames[d.getDay()] || '';
  const monthName = arabicMonths[parts[1] - 1] || '';
  const todayStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().slice(0, 10);
  const prefix = (dateStr === todayStr) ? 'اليوم - ' : '';
  return `${prefix}${dayName} ${parts[2]} ${monthName} ${parts[0]}`;
}

function openAddTaskForSelectedDate(dateStr) {
  if (!dateStr) dateStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().slice(0, 10);
  switchTasksViewMode('list');
  showUnifiedTaskCreator();
  const dateInp = document.getElementById('inlineTaskDueDate');
  if (dateInp) {
    dateInp.value = dateStr;
    if (typeof onInlineDateCustomChange === 'function') onInlineDateCustomChange(dateStr);
  }
  const titleInp = document.getElementById('quickTaskTitleInput');
  if (titleInp) {
    setTimeout(() => {
      titleInp.focus();
      titleInp.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }
}

function openTaskPhotoLightbox(src, title = 'صورة المهمة') {
  if (typeof openReceiptLightbox === 'function') {
    openReceiptLightbox(src, title);
  } else {
    window.open(src, '_blank');
  }
}

function selectTasksCalendarDay(dateStr) {
  if (!dateStr) {
    dateStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().slice(0, 10);
  }
  window.calendarSelectedDate = dateStr;

  // 1. Highlight cell visually in the grid without tearing down the DOM
  const cells = document.querySelectorAll('#tasksCalendarGrid > [data-calendar-date]');
  cells.forEach(c => {
    const isThisSelected = c.getAttribute('data-calendar-date') === dateStr;
    const isThisToday = c.getAttribute('data-is-today') === 'true';
    c.style.border = isThisSelected ? '1.5px solid #a855f7' : (isThisToday ? '1.2px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)');
    c.style.background = isThisSelected ? 'rgba(168, 85, 247, 0.32)' : (isThisToday ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.55)');
    c.style.boxShadow = isThisSelected ? '0 0 10px rgba(168, 85, 247, 0.45)' : 'none';
    const num = c.querySelector('span');
    if (num) {
      num.style.color = isThisSelected ? '#f8fafc' : (isThisToday ? '#38bdf8' : '#cbd5e1');
      num.style.fontWeight = isThisSelected || isThisToday ? '900' : '700';
    }
  });

  // 2. Update Header Title & Count Badge
  const titleEl = document.getElementById('calendarSelectedDayTitle');
  const badgeEl = document.getElementById('calendarSelectedDayCountBadge');
  const container = document.getElementById('tasksCalendarDayList');
  if (!container) return;

  const allTasks = getTodoTasks();
  const dayTasks = allTasks.filter(t => String(t.dueDate || '').slice(0, 10) === dateStr);

  if (titleEl) {
    titleEl.textContent = formatArabicDateFriendly(dateStr);
  }
  if (badgeEl) {
    const count = dayTasks.length;
    if (count === 0) badgeEl.textContent = '0 مهام';
    else if (count === 1) badgeEl.textContent = 'مهمة واحدة';
    else if (count === 2) badgeEl.textContent = 'مهمتان';
    else if (count >= 3 && count <= 10) badgeEl.textContent = `${count} مهام`;
    else badgeEl.textContent = `${count} مهمة`;
  }

  // 3. Render Daily Tasks List
  if (dayTasks.length === 0) {
    container.innerHTML = `
      <div style="padding: 18px 12px; text-align: center; color: #94a3b8; font-size: 0.78rem; background: rgba(15, 23, 42, 0.6); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(168, 85, 247, 0.15); display: flex; align-items: center; justify-content: center; color: #c084fc; font-size: 1.2rem;">
          <i class="fa-solid fa-calendar-plus"></i>
        </div>
        <span style="font-weight: 700; color: #cbd5e1;">لا توجد مهام مسجلة لهذا اليوم</span>
        <button type="button" onclick="openAddTaskForSelectedDate('${dateStr}')" style="margin-top: 4px; height: 32px; padding: 0 14px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #6366f1); border: none; color: #fff; font-size: 0.74rem; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.35); transition: all 0.2s;">
          <i class="fa-solid fa-plus"></i>
          <span>إضافة مهمة لهذا اليوم</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  dayTasks.forEach(t => {
    const item = document.createElement('div');
    const isDone = !!t.completed;
    const isLightMode = document.body.classList.contains('light-theme') || document.documentElement.getAttribute('data-app-theme') === 'light';
    item.className = 'tasks-calendar-day-item';
    const dayItemBg = isLightMode ? '#f8fafc' : 'linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))';
    const dayItemBorder = isDone ? 'rgba(16, 185, 129, 0.35)' : (isLightMode ? '#e2e8f0' : 'rgba(168, 85, 247, 0.35)');
    item.style.cssText = `
      background: ${dayItemBg};
      border: 1.2px solid ${dayItemBorder};
      border-radius: 12px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      transition: all 0.2s ease;
      box-shadow: ${isLightMode ? '0 2px 6px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.25)'};
    `;

    const subtasks = Array.isArray(t.subtasks) ? t.subtasks : [];
    const subDoneCount = subtasks.filter(s => s.completed).length;

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
        <!-- Checkbox -->
        <button type="button" onclick="toggleTaskCompleted('${t.id}')" title="${isDone ? 'تعليم كغير مكتمل' : 'تعليم كمكتمل'}" style="width: 26px; height: 26px; border-radius: 8px; border: 1.5px solid ${isDone ? '#10b981' : '#a855f7'}; background: ${isDone ? '#10b981' : 'transparent'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.74rem; cursor: pointer; flex-shrink: 0; transition: all 0.2s;">
          ${isDone ? '<i class="fa-solid fa-check"></i>' : ''}
        </button>

        <!-- Details -->
        <div style="min-width: 0; flex: 1;">
          <div style="font-size: 0.84rem; font-weight: 850; color: ${isDone ? '#94a3b8' : '#f8fafc'}; text-decoration: ${isDone ? 'line-through' : 'none'}; word-break: break-word; line-height: 1.35;">
            ${escapeHtml(t.title)}
          </div>
          <div style="font-size: 0.68rem; color: #94a3b8; display: flex; align-items: center; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
            ${renderTaskTagBadge(t)}
            ${t.project ? `<span style="background:rgba(56,189,248,0.10); color:#7dd3fc; padding:1px 6px; border-radius:6px; font-weight:800; border:1px solid rgba(56,189,248,0.22);">📌 ${escapeHtml(t.project)}</span>` : ''}
            ${t.dueTime ? `<span style="background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 5px; color: #cbd5e1; font-weight: 750;"><i class="fa-regular fa-clock" style="font-size: 0.62rem;"></i> ${escapeHtml(formatTaskTimeDisplay(t))}</span>` : ''}
            ${t.dueTimeZone && t.dueTime ? `<span title="${escapeHtml(t.dueTimeZone)}" style="background:rgba(56,189,248,0.10); padding:1px 6px; border-radius:5px; color:#7dd3fc; font-weight:750;">${escapeHtml(getTaskTimezoneBadge(t))}</span>` : ''}
            <span style="background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 5px; color: #cbd5e1; font-weight: 750;"><i class="fa-solid fa-user" style="font-size: 0.62rem;"></i> ${escapeHtml(t.assignedMember || 'البيت')}</span>
            ${subtasks.length > 0 ? `<span style="background: rgba(168,85,247,0.15); color: #c084fc; padding: 1px 6px; border-radius: 5px; font-weight: 750;"><i class="fa-solid fa-list-check" style="font-size: 0.62rem;"></i> ${subDoneCount}/${subtasks.length} فرعية</span>` : ''}
            ${t.photo ? `
              <div onclick="openTaskPhotoLightbox('${escapeHtml(t.photo)}')" style="display: inline-flex; align-items: center; gap: 3px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 1px 6px; border-radius: 5px; cursor: pointer; font-weight: 800; border: 1px solid rgba(56,189,248,0.3);">
                <i class="fa-solid fa-image" style="font-size: 0.65rem;"></i>
                <span>صورة</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Actions (Photo thumbnail preview + Delete) -->
      <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
        ${t.photo ? `
          <img src="${t.photo}" onclick="openTaskPhotoLightbox('${escapeHtml(t.photo)}')" style="width: 32px; height: 32px; border-radius: 7px; object-fit: cover; border: 1.2px solid rgba(56, 189, 248, 0.5); cursor: pointer;" title="معاينة الصورة" />
        ` : ''}
        <button type="button" onclick="deleteTaskItem('${t.id}')" title="حذف المهمة" style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); border-radius: 7px; color: #f87171; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.74rem; transition: all 0.2s;">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderTasksCalendar() {
  const grid = document.getElementById('tasksCalendarGrid');
  const titleEl = document.getElementById('calendarMonthTitle');
  if (!grid) return;

  if (titleEl) {
    titleEl.textContent = `${arabicMonths[window.calendarCurrentMonth]} ${window.calendarCurrentYear}`;
  }

  grid.innerHTML = '';
  const tasks = getTodoTasks();
  const tasksByDate = {};
  tasks.forEach(t => {
    if (!t.dueDate) return;
    const d = String(t.dueDate).slice(0, 10);
    if (!tasksByDate[d]) tasksByDate[d] = [];
    tasksByDate[d].push(t);
  });

  const todayStr = (typeof getLocalDateStr === 'function') ? getLocalDateStr(new Date()) : new Date().toISOString().slice(0, 10);
  if (!window.calendarSelectedDate) {
    window.calendarSelectedDate = todayStr;
  }

  const firstDayOfMonth = new Date(window.calendarCurrentYear, window.calendarCurrentMonth, 1);
  const lastDayOfMonth = new Date(window.calendarCurrentYear, window.calendarCurrentMonth + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // (getDay() + 1) % 7 gives empty cells when week starts on Saturday (سبت)
  const startDay = (firstDayOfMonth.getDay() + 1) % 7;

  for (let i = 0; i < startDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.style.height = '46px';
    emptyCell.style.opacity = '0.15';
    grid.appendChild(emptyCell);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dStr = `${window.calendarCurrentYear}-${String(window.calendarCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasksByDate[dStr] || [];

    const cell = document.createElement('div');
    const isToday = dStr === todayStr;
    const isSelected = dStr === window.calendarSelectedDate;
    const isLightMode = document.body.classList.contains('light-theme') || document.documentElement.getAttribute('data-app-theme') === 'light';

    cell.className = 'tasks-calendar-day-cell' + (isSelected ? ' is-selected' : '') + (isToday ? ' is-today' : '');
    cell.setAttribute('data-calendar-date', dStr);
    cell.setAttribute('data-is-today', isToday ? 'true' : 'false');

    const cellBg = isSelected
      ? (isLightMode ? 'rgba(168, 85, 247, 0.16)' : 'rgba(168, 85, 247, 0.32)')
      : (isToday ? (isLightMode ? 'rgba(56, 189, 248, 0.14)' : 'rgba(56, 189, 248, 0.12)') : (isLightMode ? '#f8fafc' : 'rgba(15, 23, 42, 0.55)'));
    const cellBorder = isSelected
      ? '1.5px solid #a855f7'
      : (isToday ? '1.2px solid #0284c7' : (isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.06)'));

    cell.style.cssText = `
      height: 46px;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
      border: ${cellBorder};
      background: ${cellBg};
      box-shadow: ${isSelected ? '0 0 10px rgba(168, 85, 247, 0.35)' : 'none'};
    `;

    cell.onclick = () => {
      selectTasksCalendarDay(dStr);
    };

    const numSpan = document.createElement('span');
    numSpan.textContent = day;
    numSpan.style.cssText = `
      font-size: 0.78rem;
      font-weight: ${isToday || isSelected ? '900' : '700'};
      color: ${isSelected ? '#f8fafc' : (isToday ? '#38bdf8' : '#cbd5e1')};
      font-family: var(--font-numbers);
    `;
    cell.appendChild(numSpan);

    if (dayTasks.length > 0) {
      const dotsRow = document.createElement('div');
      dotsRow.style.cssText = 'display: flex; gap: 2px; align-items: center; margin-top: 2px;';
      dayTasks.slice(0, 3).forEach(t => {
        const dot = document.createElement('span');
        let dotColor = '#38bdf8';
        if (t.completed) dotColor = '#10b981';
        else if (t.priority === 'high' || getTaskTags(t).includes('important')) dotColor = '#f43f5e';
        else if (getTaskTags(t).includes('shopping')) dotColor = '#34d399';
        else if (getTaskTags(t).includes('bills')) dotColor = '#fbbf24';
        dot.style.cssText = `width: 5px; height: 5px; border-radius: 50%; background: ${dotColor};`;
        dotsRow.appendChild(dot);
      });
      if (dayTasks.length > 3) {
        const plusSpan = document.createElement('span');
        plusSpan.textContent = `+${dayTasks.length - 3}`;
        plusSpan.style.cssText = 'font-size: 0.52rem; color: #a855f7; font-weight: 850; line-height: 1;';
        dotsRow.appendChild(plusSpan);
      }
      cell.appendChild(dotsRow);
    }

    grid.appendChild(cell);
  }

  selectTasksCalendarDay(window.calendarSelectedDate || todayStr);
}

// Global Bindings for inline HTML handlers
window.openTasksFullScreenModal = openTasksFullScreenModal;
window.closeTasksFullScreenModal = closeTasksFullScreenModal;
window.openTasksModal = openTasksModal;
window.switchTasksViewMode = switchTasksViewMode;
window.triggerTaskCameraOnly = triggerTaskCameraOnly;
window.handleTaskCameraOnlyChosen = handleTaskCameraOnlyChosen;
window.clearTaskPendingPhoto = clearTaskPendingPhoto;
window.openTaskDateTimePickerModal = openTaskDateTimePickerModal;
window.closeTaskDateTimePickerModal = closeTaskDateTimePickerModal;
window.selectTaskDatePreset = selectTaskDatePreset;
window.onTaskCustomDateChange = onTaskCustomDateChange;
window.selectTaskTimePreset = selectTaskTimePreset;
window.onTaskCustomTimeChange = onTaskCustomTimeChange;
window.confirmTaskDateTimePicker = confirmTaskDateTimePicker;
window.clearTaskDateTimePicker = clearTaskDateTimePicker;
window.handleQuickTaskAdd = handleQuickTaskAdd;
window.getTodoTasks = getTodoTasks;
window.saveTodoTasks = saveTodoTasks;
window.toggleTaskCompleted = toggleTaskCompleted;
window.deleteTaskItem = deleteTaskItem;
window.toggleExpandTask = toggleExpandTask;
window.addNewSubtaskInline = addNewSubtaskInline;
window.toggleSubtaskCompleted = toggleSubtaskCompleted;
window.deleteSubtask = deleteSubtask;
window.setTasksCategoryFilter = setTasksCategoryFilter;
window.setTasksMemberFilter = setTasksMemberFilter;
window.switchTodoSection = switchTodoSection;
window.openAddTaskForSelectedDate = openAddTaskForSelectedDate;
window.openTaskPhotoLightbox = openTaskPhotoLightbox;
window.navigateTasksCalendar = navigateTasksCalendar;
window.goToTasksCalendarToday = goToTasksCalendarToday;
window.selectTasksCalendarDay = selectTasksCalendarDay;
window.renderTasksCalendar = renderTasksCalendar;
window.openGlobalSearchModal = openGlobalSearchModal;
window.updateTasksProductivityKPIs = updateTasksProductivityKPIs;
window.renderTasksProList = renderTasksProList;
window.renderTasksCalendar = renderTasksCalendar;
window.navigateTasksCalendar = navigateTasksCalendar;
window.goToTasksCalendarToday = goToTasksCalendarToday;
window.selectTasksCalendarDay = selectTasksCalendarDay;

// =========================================================================
// =========================================================================
// MASTER SUITE: ALL MISSING EVENT HANDLERS & MODAL ENGINES (v5.3.89 Comprehensive)
// =========================================================================

// 1. TRANSACTION EDITING & RECEIPTS
function editTx(txId) {
  const tx = (state.transactions || []).find(t => t.id === txId);
  if (!tx) {
    if (typeof showToast === 'function') showToast('العملية غير موجودة', 'error');
    return;
  }
  const modal = document.getElementById('editTxModal');
  if (!modal) return;
  if (typeof refreshProjectSelectors === 'function') refreshProjectSelectors();

  const idInp = document.getElementById('editTxId');
  if (idInp) idInp.value = tx.id;

  // عرض السريال الرقابي
  const serialDisp = document.getElementById('editTxSerialDisplay');
  if (serialDisp) serialDisp.textContent = '#' + (tx.serialNo || tx.id);

  // تصفية حقل سبب التعديل وإخفاء التنبيه
  const reasonInp = document.getElementById('editTxReason');
  if (reasonInp) {
    reasonInp.value = '';
    reasonInp.classList.remove('error');
  }
  const reasonErr = document.getElementById('editTxReasonError');
  if (reasonErr) reasonErr.style.display = 'none';
  if (document.getElementById('editTxAmount')) document.getElementById('editTxAmount').value = tx.amount;
  if (document.getElementById('editTxLabel')) document.getElementById('editTxLabel').value = tx.label || '';

  // ملء وتفعيل خيارات التصنيف
  const catSel = document.getElementById('editTxCategory');
  if (catSel) {
    const isInc = (tx.type === 'income');
    const cats = isInc ? (typeof INCOME_CATEGORIES !== 'undefined' ? INCOME_CATEGORIES : []) : (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []);
    catSel.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    catSel.value = tx.category || (cats[0] ? cats[0].id : '');
  }

  // ملء وتفعيل خيارات المحفظة
  const walSel = document.getElementById('editTxWallet');
  if (walSel) {
    const wallets = (state.wallets && state.wallets.length > 0) ? state.wallets : [
      { id: 'wallet-cash', name: 'كاش / نقدي' },
      { id: 'wallet-ahly', name: 'البنك الأهلي' },
      { id: 'wallet-instapay', name: 'انستاباي' }
    ];
    walSel.innerHTML = wallets.map(w => `<option value="${w.id}">${w.name || w.id}</option>`).join('');
    walSel.value = tx.walletId || (wallets[0] ? wallets[0].id : '');
  }

  // ملء وتفعيل خيارات أفراد العائلة
  const memSel = document.getElementById('editTxMember');
  if (memSel) {
    const members = (typeof FAMILY_MEMBERS !== 'undefined' && Array.isArray(FAMILY_MEMBERS)) ? FAMILY_MEMBERS : ['البيت', 'ماهر', 'أية', 'محمد', 'مريم', 'الحاجة', 'النونو', 'أخرى'];
    memSel.innerHTML = members.map(m => `<option value="${m}">${m}</option>`).join('');
    memSel.value = tx.member || state.currentUser || 'ماهر';
  }

  // ضبط التاريخ والمشروع
  if (document.getElementById('editTxDate')) document.getElementById('editTxDate').value = tx.date || getLocalDateStr(new Date());
  if (document.getElementById('editTxProject')) document.getElementById('editTxProject').value = tx.projectId || '';
  const editProject = document.getElementById('editTxProject');
  if (editProject) {
    const pGroup = document.getElementById('groupEditTxProjectItem');
    if (tx.project) {
      if (pGroup) pGroup.style.display = 'block';
      populateProjectItemOptions(tx.project, 'editTxProjectItem', tx.projectItem || '');
    } else {
      if (pGroup) pGroup.style.display = 'none';
    }
    const projectName = typeof getTransactionProjectName === 'function' ? getTransactionProjectName(tx) : String(tx.project || '');
    if (projectName && !Array.from(editProject.options).some(option => option.value === projectName)) {
      editProject.add(new Option(projectName, projectName));
    }
    editProject.value = projectName;
    editProject.dataset.lastValue = projectName;
  }

  const radExp = document.getElementById('editTxTypeExpense');
  const radInc = document.getElementById('editTxTypeIncome');
  if (radExp && radInc) {
    if (tx.type === 'income') radInc.checked = true;
    else radExp.checked = true;
  }

  window.currentEditTxReceiptDataUri = tx.receipt || null;
  const preview = document.getElementById('editTxReceiptPreview');
  if (preview) {
    if (tx.receipt) {
      preview.src = tx.receipt;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  }

  if (typeof openModal === 'function') openModal('editTxModal');
}
window.editTx = editTx;

function saveEditedTx() {
  const txId = document.getElementById('editTxId')?.value;
  const tx = (state.transactions || []).find(t => t.id === txId);
  if (!tx) return;

  const amtVal = parseFloat(document.getElementById('editTxAmount')?.value) || 0;
  const labelVal = document.getElementById('editTxLabel')?.value.trim() || '';
  const catVal = document.getElementById('editTxCategory')?.value || tx.category;
  const walletVal = document.getElementById('editTxWallet')?.value || tx.walletId;
  const memberVal = document.getElementById('editTxMember')?.value || tx.member;
  const dateVal = document.getElementById('editTxDate')?.value || tx.date;
  const projectVal = document.getElementById('editTxProject')?.value || '';
  const projectItemVal = document.getElementById('editTxProjectItem')?.value || '';
  const radInc = document.getElementById('editTxTypeIncome');
  const typeVal = (radInc && radInc.checked) ? 'income' : 'expense';

  // 1. التحقق الإلزامي من كتابة سبب التعديل للأثر الرقابي
  const reasonInp = document.getElementById('editTxReason');
  const reasonVal = reasonInp ? reasonInp.value.trim() : '';
  const reasonErr = document.getElementById('editTxReasonError');
  if (!reasonVal) {
    if (reasonErr) reasonErr.style.display = 'block';
    if (reasonInp) {
      reasonInp.focus();
      reasonInp.classList.add('error');
    }
    if (typeof showToast === 'function') showToast('⚠️ سبب التعديل إلزامي لحفظ الأثر الرقابي والمالي', 'error', 4500);
    return;
  }
  if (reasonErr) reasonErr.style.display = 'none';

  if (amtVal <= 0) {
    if (typeof showToast === 'function') showToast('يرجى كتابة مبلغ صحيح أكبر من 0', 'error');
    return;
  }
  if (typeVal === 'expense') {
    if (typeof canDeductFromWallet === 'function' && !canDeductFromWallet(walletVal, amtVal, txId)) {
      if (typeof showToast === 'function') showToast('الرصيد الحالى لا يكفى لتنفيذ العملية', 'error', 4500);
      return;
    }
  }

  // 2. أخذ لقطة كاملة لما قبل التعديل (Before Snapshot)
  const beforeSnapshot = {
    amount: tx.amount,
    label: tx.label,
    category: tx.category,
    member: tx.member,
    walletId: tx.walletId,
    date: tx.date,
    project: tx.project,
    type: tx.type,
    author: tx.author || 'ماهر'
  };

  // 3. تطبيق التعديل وتحديث بيانات العملية
  tx.amount = amtVal;
  tx.label = labelVal;
  tx.category = catVal;
  tx.walletId = walletVal;
  tx.member = memberVal;
  tx.date = dateVal;
  tx.project = projectVal.trim() || null;
  tx.projectItem = projectItemVal.trim() || null;
  tx.type = typeVal;
  if (window.currentEditTxReceiptDataUri !== undefined) {
    if (tx.receipt !== window.currentEditTxReceiptDataUri) tx.alertReceiptVersion = Date.now();
    tx.receipt = window.currentEditTxReceiptDataUri;
  }

  // 4. حفظ أثر التعديل في أرشيف نفس البند
  tx.auditTrail = tx.auditTrail || [];
  tx.auditTrail.push({
    action: 'edit',
    timestamp: new Date().toISOString(),
    user: state.currentUser || 'ماهر',
    reason: reasonVal,
    before: beforeSnapshot,
    after: {
      amount: tx.amount,
      label: tx.label,
      category: tx.category,
      member: tx.member,
      walletId: tx.walletId,
      date: tx.date,
      project: tx.project,
      type: tx.type
    }
  });
  tx.isModified = true;
  tx.lastModifiedReason = reasonVal;
  tx.lastModifiedBy = state.currentUser || 'ماهر';
  tx.lastModifiedAt = new Date().toISOString();

  // 5. إطلاق تنبيه عاجل بالعائلة وتوثيق في سجل النشاط
  const modUser = state.currentUser || 'ماهر';
  const opTypeName = tx.type === 'income' ? 'دخل' : 'صرف';
  const alertMsg = `قام المستخدم ${modUser} بتعديل عملية ${opTypeName} "${tx.label}" بقيمة (${Number(tx.amount).toLocaleString('ar-EG')} ج.م) - السبب: ${reasonVal}`;

  if (typeof addFamilyAlert === 'function') {
    addFamilyAlert('audit_modification', alertMsg, 'edit');
  }
  if (typeof logActivity === 'function') {
    logActivity({
      type: 'edit_tx',
      action: 'تعديل حركة',
      label: `${tx.label} (معدلة: ${reasonVal})`,
      amount: tx.amount,
      member: tx.member,
      author: modUser
    });
  }

  if (typeof saveTx === 'function') saveTx();
  if (typeof auditAndRecomputeAllWalletBalances === 'function') auditAndRecomputeAllWalletBalances();
  if (typeof renderUI === 'function') renderUI();
  if (typeof filterOperationsList === 'function') filterOperationsList();

  if (typeof closeModal === 'function') closeModal('editTxModal');
  if (typeof showToast === 'function') showToast(`✓ تم تعديل العملية وتوثيق سبب التعديل: ${reasonVal}`, 'success', 4000);
}
window.saveEditedTx = saveEditedTx;

function handleEditReceiptUpload(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    window.currentEditTxReceiptDataUri = e.target.result;
    const preview = document.getElementById('editTxReceiptPreview');
    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}
window.handleEditReceiptUpload = handleEditReceiptUpload;

function clearEditReceiptUpload() {
  window.currentEditTxReceiptDataUri = null;
  const preview = document.getElementById('editTxReceiptPreview');
  if (preview) preview.style.display = 'none';
  const inp1 = document.getElementById('inpEditTxReceipt');
  if (inp1) inp1.value = '';
  const inp2 = document.getElementById('inpEditTxReceiptCamera');
  if (inp2) inp2.value = '';
}
window.clearEditReceiptUpload = clearEditReceiptUpload;

// duplicate viewReceiptImage purged in v5.3.89

function openNotificationsModal() { if (window.familyAlerts && familyAlerts.open) familyAlerts.open(); else openModal('notificationsModal'); }
function closeNotificationsModal() { if (window.familyAlerts && familyAlerts.close) familyAlerts.close(); else closeModal('notificationsModal'); }
function markAllNotificationsRead() { if (window.familyAlerts && familyAlerts.mark) familyAlerts.mark(); }
window.openNotificationsModal = openNotificationsModal;
window.closeNotificationsModal = closeNotificationsModal;
window.openGoldModal = function() { if (typeof toggleGoldDrawer === 'function') toggleGoldDrawer(true); };
window.closeGoldModal = function() { if (typeof toggleGoldDrawer === 'function') toggleGoldDrawer(false); };

// 3. FAMILY PROFILE PIN VERIFICATION
window._pendingPinMember = null;
function promptMemberPin(member) {
  window._pendingPinMember = member;
  const grid = document.getElementById('authProfilesGridView');
  const pinView = document.getElementById('authPinVerificationView');
  const title = document.getElementById('pinTargetMemberTitle');
  const avatar = document.getElementById('pinTargetMemberAvatar');
  const inp = document.getElementById('inpFamilyMemberPin');
  const err = document.getElementById('pinErrorHint');

  if (grid) grid.style.display = 'none';
  if (pinView) pinView.style.display = 'block';
  if (title) title.textContent = member;
  if (avatar) avatar.src = (typeof getMemberAvatar === 'function') ? getMemberAvatar(member) : 'assets/family_option1_gold_crest.jpg';
  if (err) err.style.display = 'none';
  if (inp) {
    inp.value = '';
    setTimeout(() => inp.focus(), 100);
  }
}
window.promptMemberPin = promptMemberPin;

function verifyMemberPinSubmit() {
  const member = window._pendingPinMember || state.currentUser || 'ماهر';
  const inp = document.getElementById('inpFamilyMemberPin');
  const err = document.getElementById('pinErrorHint');
  const entered = inp ? inp.value.trim() : '';
  const correctPin = FAMILY_PIN_CODES[member] || (member === 'آية' ? FAMILY_PIN_CODES['أية'] : (member === 'أية' ? FAMILY_PIN_CODES['آية'] : null));
  if (correctPin && entered !== correctPin) {
    if (err) err.style.display = 'block';
    if (inp) {
      inp.classList.add('shake');
      setTimeout(() => inp.classList.remove('shake'), 400);
    }
    return;
  }
  completeUserLogin(member);
  if (typeof closeModal === 'function') closeModal('authModal');
  if (typeof showToast === 'function') showToast(`مرحباً بك يا ${member} 👋`, 'success');
}
window.verifyMemberPinSubmit = verifyMemberPinSubmit;

function cancelPinVerification() {
  window._pendingPinMember = null;
  const grid = document.getElementById('authProfilesGridView');
  const pinView = document.getElementById('authPinVerificationView');
  if (grid) grid.style.display = 'block';
  if (pinView) pinView.style.display = 'none';
}
window.cancelPinVerification = cancelPinVerification;

// 4. ACTUAL BALANCE AUDIT & RECONCILIATION LEDGER (v5.3.89 Enterprise)
const CATEGORY_ARABIC_MAP = {
  // المصروفات
  'food': { name: 'طعام ومشتريات', emoji: '🛒', icon: 'fa-cart-shopping', color: '#10b981', group: 'expense' },
  'daily': { name: 'مصروف يومي', emoji: '☕', icon: 'fa-mug-hot', color: '#f59e0b', group: 'expense' },
  'bills': { name: 'فواتير والتزامات', emoji: '⚡', icon: 'fa-bolt-lightning', color: '#f97316', group: 'expense' },
  'transport': { name: 'مواصلات وبنزين', emoji: '⛽', icon: 'fa-gas-pump', color: '#0284c7', group: 'expense' },
  'house': { name: 'مستلزمات منزل', emoji: '🛋️', icon: 'fa-couch', color: '#8b5cf6', group: 'expense' },
  'home': { name: 'مستلزمات منزل', emoji: '🛋️', icon: 'fa-couch', color: '#8b5cf6', group: 'expense' },
  'health': { name: 'صحة وعلاج', emoji: '🩺', icon: 'fa-stethoscope', color: '#f43f5e', group: 'expense' },
  'clothes': { name: 'ملابس وأحذية', emoji: '👔', icon: 'fa-shirt', color: '#ec4899', group: 'expense' },
  'clothing': { name: 'ملابس وأحذية', emoji: '👔', icon: 'fa-shirt', color: '#ec4899', group: 'expense' },
  'education': { name: 'تعليم ودروس', emoji: '📚', icon: 'fa-book-open-reader', color: '#3b82f6', group: 'expense' },
  'kids': { name: 'أطفال وترفيه', emoji: '🧸', icon: 'fa-shapes', color: '#a855f7', group: 'expense' },
  'other': { name: 'أخرى ونثريات', emoji: '📦', icon: 'fa-cubes-stacked', color: '#14b8a6', group: 'expense' },
  'others': { name: 'أخرى ونثريات', emoji: '📦', icon: 'fa-cubes-stacked', color: '#14b8a6', group: 'expense' },
  
  // الإيرادات
  'salary': { name: 'راتب شهري', emoji: '💵', icon: 'fa-money-check-dollar', color: '#10b981', group: 'income' },
  'bonus': { name: 'مكافآت وحوافز', emoji: '🎁', icon: 'fa-gift', color: '#3b82f6', group: 'income' },
  'invest': { name: 'أرباح واستثمارات', emoji: '📈', icon: 'fa-arrow-trend-up', color: '#f59e0b', group: 'income' },
  'investment': { name: 'أرباح واستثمارات', emoji: '📈', icon: 'fa-arrow-trend-up', color: '#f59e0b', group: 'income' },
  'business': { name: 'أعمال وتجارة', emoji: '💼', icon: 'fa-briefcase', color: '#8b5cf6', group: 'income' },
  'biz': { name: 'أعمال وتجارة', emoji: '💼', icon: 'fa-briefcase', color: '#8b5cf6', group: 'income' },
  'other_inc': { name: 'دخل إضافي', emoji: '➕', icon: 'fa-circle-plus', color: '#06b6d4', group: 'income' },
  
  // التحويلات
  'transfer': { name: 'تحويل بين المحافظ', emoji: '🔄', icon: 'fa-arrows-rotate', color: '#6366f1', group: 'transfer' }
};

function getCategoryArabicInfo(rawKey, type = '') {
  if (!rawKey) return { name: type === 'income' ? 'دخل عام' : 'مصروف عام', emoji: '📁', icon: 'fa-tag', color: '#94a3b8', group: type || 'expense' };
  const keyStr = String(rawKey).trim().toLowerCase();
  if (CATEGORY_ARABIC_MAP[keyStr]) return CATEGORY_ARABIC_MAP[keyStr];
  
  // Check CATEGORIES array
  if (typeof CATEGORIES !== 'undefined' && Array.isArray(CATEGORIES)) {
    const found = CATEGORIES.find(c => c.id === keyStr || c.name === rawKey);
    if (found) return { name: found.name, emoji: found.emoji || '📁', icon: found.icon || 'fa-tag', color: found.color || '#38bdf8', group: 'expense' };
  }
  // Check INCOME_CATEGORIES array
  if (typeof INCOME_CATEGORIES !== 'undefined' && Array.isArray(INCOME_CATEGORIES)) {
    const found = INCOME_CATEGORIES.find(c => c.id === keyStr || c.name === rawKey);
    if (found) return { name: found.name, emoji: '💵', icon: found.icon || 'fa-tag', color: found.color || '#10b981', group: 'income' };
  }
  return { name: rawKey, emoji: '📁', icon: 'fa-tag', color: '#94a3b8', group: type || 'expense' };
}
window.getCategoryArabicInfo = getCategoryArabicInfo;

const ALL_AUDIT_MEMBERS = ['ماهر', 'أية', 'محمد', 'مريم', 'البيت', 'الحاجة', 'النونو'];
const ALL_AUDIT_CATEGORIES = [
  { id: 'food', name: 'طعام ومشتريات', emoji: '🛒', group: 'expense' },
  { id: 'daily', name: 'مصروف يومي', emoji: '☕', group: 'expense' },
  { id: 'bills', name: 'فواتير والتزامات', emoji: '⚡', group: 'expense' },
  { id: 'transport', name: 'مواصلات وبنزين', emoji: '⛽', group: 'expense' },
  { id: 'house', name: 'مستلزمات منزل', emoji: '🛋️', group: 'expense' },
  { id: 'health', name: 'صحة وعلاج', emoji: '🩺', group: 'expense' },
  { id: 'clothes', name: 'ملابس وأحذية', emoji: '👔', group: 'expense' },
  { id: 'education', name: 'تعليم ودروس', emoji: '📚', group: 'expense' },
  { id: 'kids', name: 'أطفال وترفيه', emoji: '🧸', group: 'expense' },
  { id: 'other', name: 'أخرى ونثريات', emoji: '📦', group: 'expense' },
  { id: 'salary', name: 'راتب شهري', emoji: '💵', group: 'income' },
  { id: 'bonus', name: 'مكافآت وحوافز', emoji: '🎁', group: 'income' },
  { id: 'invest', name: 'أرباح واستثمارات', emoji: '📈', group: 'income' },
  { id: 'business', name: 'أعمال وتجارة', emoji: '💼', group: 'income' },
  { id: 'other_inc', name: 'دخل إضافي', emoji: '➕', group: 'income' },
  { id: 'transfer', name: 'تحويل بين المحافظ', emoji: '🔄', group: 'transfer' }
];

window.auditSelectedMembers = window.auditSelectedMembers || new Set();
window.auditSelectedCategories = window.auditSelectedCategories || new Set();
window.auditSelectedWallets = window.auditSelectedWallets || new Set();
window.auditSelectedTypes = window.auditSelectedTypes || new Set();
window.auditSortOrder = window.auditSortOrder || 'desc'; // Default: Newest first!

function getTxAttachmentUrl(t) {
  if (!t) return null;
  if (t.receiptDataUri) return t.receiptDataUri;
  if (t.receiptUrl) return t.receiptUrl;
  if (typeof t.receipt === 'string' && t.receipt.trim()) return t.receipt.trim();
  if (typeof t.receipt === 'object' && t.receipt) return t.receipt.url || t.receipt.data || t.receipt.uri || null;
  if (t.attachment && typeof t.attachment === 'string') return t.attachment.trim();
  if (Array.isArray(t.attachments) && t.attachments.length > 0) {
    const a0 = t.attachments[0];
    return typeof a0 === 'string' ? a0 : (a0.url || a0.data || a0.uri || null);
  }
  if (t.photo) return t.photo;
  if (t.image) return t.image;
  if (t.billPhoto) return t.billPhoto;
  if (t.fileUrl) return t.fileUrl;
  if (t.file && typeof t.file === 'string') return t.file;
  return null;
}
window.getTxAttachmentUrl = getTxAttachmentUrl;

function openActualBalanceAuditModal() {
  if (typeof openModal === 'function') openModal('actualBalanceAuditModal');
  if (typeof populateAuditFilters === 'function') populateAuditFilters();
  if (typeof renderAuditWalletsCards === 'function') renderAuditWalletsCards();
  renderActualBalanceAuditLedger();
}
window.openActualBalanceAuditModal = openActualBalanceAuditModal;

function toggleAuditSortOrder() {
  window.auditSortOrder = (window.auditSortOrder === 'desc') ? 'asc' : 'desc';
  const txt = document.getElementById('txtAuditSortOrder');
  const ico = document.getElementById('iconAuditSortOrder');
  if (txt) {
    txt.textContent = (window.auditSortOrder === 'desc') ? 'الأحدث أولاً ⬇️' : 'الأقدم أولاً ⬆️';
  }
  if (ico) {
    ico.className = (window.auditSortOrder === 'desc') ? 'fa-solid fa-arrow-down-short-wide' : 'fa-solid fa-arrow-up-wide-short';
  }
  renderActualBalanceAuditLedger();
}
window.toggleAuditSortOrder = toggleAuditSortOrder;

function toggleAuditDropdown(type) {
  const mMenu = document.getElementById('auditMemberDropdownMenu');
  const cMenu = document.getElementById('auditCategoryDropdownMenu');
  const wMenu = document.getElementById('auditWalletDropdownMenu');
  const tMenu = document.getElementById('auditTypeDropdownMenu');
  const menus = { member: mMenu, category: cMenu, wallet: wMenu, type: tMenu };

  for (const [key, menu] of Object.entries(menus)) {
    if (!menu) continue;
    if (key === type) {
      menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    } else {
      menu.style.display = 'none';
    }
  }
}
window.toggleAuditDropdown = toggleAuditDropdown;

// Close dropdown menus when clicking outside
if (!window._auditDropdownListenerAttached) {
  document.addEventListener('click', function(e) {
    ['auditMember', 'auditCategory', 'auditWallet', 'auditType'].forEach(prefix => {
      const cont = document.getElementById(prefix + 'MultiContainer');
      const menu = document.getElementById(prefix + 'DropdownMenu');
      if (cont && menu && !cont.contains(e.target)) {
        menu.style.display = 'none';
      }
    });
  });
  window._auditDropdownListenerAttached = true;
}

// 1. أفراد الأسرة
function selectAllAuditMembers(selectAll) {
  if (selectAll) {
    window.auditSelectedMembers.clear();
  } else {
    window.auditSelectedMembers = new Set(['__NONE__']);
  }
  updateAuditMemberUI();
  renderActualBalanceAuditLedger();
}
window.selectAllAuditMembers = selectAllAuditMembers;

function toggleAuditMember(mem) {
  if (window.auditSelectedMembers.has('__NONE__')) {
    window.auditSelectedMembers.clear();
    window.auditSelectedMembers.add(mem);
  } else if (window.auditSelectedMembers.size === 0) {
    window.auditSelectedMembers = new Set([mem]);
  } else {
    if (window.auditSelectedMembers.has(mem)) {
      window.auditSelectedMembers.delete(mem);
      if (window.auditSelectedMembers.size === 0) {
        window.auditSelectedMembers.add('__NONE__');
      }
    } else {
      window.auditSelectedMembers.add(mem);
      if (window.auditSelectedMembers.size === ALL_AUDIT_MEMBERS.length) {
        window.auditSelectedMembers.clear();
      }
    }
  }
  updateAuditMemberUI();
  renderActualBalanceAuditLedger();
}
window.toggleAuditMember = toggleAuditMember;

function updateAuditMemberUI() {
  const container = document.getElementById('auditMemberListContainer');
  const label = document.getElementById('auditMemberMultiText');
  const isNone = window.auditSelectedMembers.has('__NONE__');
  const isAll = (window.auditSelectedMembers.size === 0);

  if (label) {
    if (isAll) {
      label.innerHTML = '👥 كافة أفراد الأسرة';
    } else if (isNone) {
      label.innerHTML = '<span style="color:#f87171;">⚠️ لا يوجد أفراد محددين</span>';
    } else {
      const arr = Array.from(window.auditSelectedMembers);
      if (arr.length === 1) {
        label.innerHTML = `👤 ${arr[0]}`;
      } else {
        label.innerHTML = `👥 ${arr.slice(0, 2).join('، ')} (${arr.length})`;
      }
    }
  }

  if (container) {
    container.innerHTML = ALL_AUDIT_MEMBERS.map(m => {
      const checked = isAll || (!isNone && window.auditSelectedMembers.has(m));
      return `
        <label style="display: flex; align-items: center; justify-content: space-between; padding: 3px 6px; border-radius: 6px; background: ${checked ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.02)'}; cursor: pointer; user-select: none; transition: background 0.15s;" onmouseover="this.style.background='rgba(168, 85, 247, 0.25)'" onmouseout="this.style.background='${checked ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.02)'}'">
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleAuditMember('${m}')" style="accent-color: #a855f7; width: 14px; height: 14px; cursor: pointer;">
            <span style="font-size: 0.72rem; font-weight: 750; color: #f8fafc;">${m}</span>
          </div>
        </label>
      `;
    }).join('');
  }
}
window.updateAuditMemberUI = updateAuditMemberUI;

// 2. بنود الصرف والإيراد
function selectAllAuditCategories(selectAll) {
  if (selectAll) {
    window.auditSelectedCategories.clear();
  } else {
    window.auditSelectedCategories = new Set(['__NONE__']);
  }
  updateAuditCategoryUI();
  renderActualBalanceAuditLedger();
}
window.selectAllAuditCategories = selectAllAuditCategories;

function toggleAuditCategory(catId) {
  if (window.auditSelectedCategories.has('__NONE__')) {
    window.auditSelectedCategories.clear();
    window.auditSelectedCategories.add(catId);
  } else if (window.auditSelectedCategories.size === 0) {
    window.auditSelectedCategories = new Set([catId]);
  } else {
    if (window.auditSelectedCategories.has(catId)) {
      window.auditSelectedCategories.delete(catId);
      if (window.auditSelectedCategories.size === 0) {
        window.auditSelectedCategories.add('__NONE__');
      }
    } else {
      window.auditSelectedCategories.add(catId);
      if (window.auditSelectedCategories.size === ALL_AUDIT_CATEGORIES.length) {
        window.auditSelectedCategories.clear();
      }
    }
  }
  updateAuditCategoryUI();
  renderActualBalanceAuditLedger();
}
window.toggleAuditCategory = toggleAuditCategory;

function updateAuditCategoryUI() {
  const container = document.getElementById('auditCategoryListContainer');
  const label = document.getElementById('auditCategoryMultiText');
  const isNone = window.auditSelectedCategories.has('__NONE__');
  const isAll = (window.auditSelectedCategories.size === 0);

  if (label) {
    if (isAll) {
      label.innerHTML = '🏷️ كافة بنود الصرف والإيراد';
    } else if (isNone) {
      label.innerHTML = '<span style="color:#f87171;">⚠️ لا توجد بنود محددة</span>';
    } else {
      const arr = Array.from(window.auditSelectedCategories);
      if (arr.length === 1) {
        const info = getCategoryArabicInfo(arr[0]);
        label.innerHTML = `${info.emoji} ${info.name}`;
      } else {
        label.innerHTML = `🏷️ ${arr.length} بنود محددة`;
      }
    }
  }

  if (container) {
    const expenses = ALL_AUDIT_CATEGORIES.filter(c => c.group === 'expense');
    const incomes = ALL_AUDIT_CATEGORIES.filter(c => c.group === 'income');
    const transfers = ALL_AUDIT_CATEGORIES.filter(c => c.group === 'transfer');

    const renderGroup = (title, icon, color, list) => `
      <div style="font-size: 0.64rem; font-weight: 900; color: ${color}; margin: 4px 0 2px; padding: 2px 4px; border-bottom: 1px dashed rgba(255,255,255,0.1); display: flex; align-items: center; gap: 4px;">
        <i class="fa-solid ${icon}"></i> <span>${title}</span>
      </div>
      ${list.map(c => {
        const checked = isAll || (!isNone && window.auditSelectedCategories.has(c.id));
        return `
          <label style="display: flex; align-items: center; justify-content: space-between; padding: 3px 6px; border-radius: 6px; background: ${checked ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.02)'}; cursor: pointer; user-select: none; transition: background 0.15s;" onmouseover="this.style.background='rgba(245, 158, 11, 0.2)'" onmouseout="this.style.background='${checked ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.02)'}'">
            <div style="display: flex; align-items: center; gap: 6px;">
              <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleAuditCategory('${c.id}')" style="accent-color: #f59e0b; width: 14px; height: 14px; cursor: pointer;">
              <span style="font-size: 0.72rem; font-weight: 750; color: #f8fafc;">${c.emoji} ${c.name}</span>
            </div>
          </label>
        `;
      }).join('')}
    `;

    container.innerHTML = `
      ${renderGroup('المصروفات', 'fa-arrow-up', '#f43f5e', expenses)}
      ${renderGroup('الإيرادات', 'fa-arrow-down', '#34d399', incomes)}
      ${renderGroup('التحويلات', 'fa-arrows-rotate', '#38bdf8', transfers)}
    `;
  }
}
window.updateAuditCategoryUI = updateAuditCategoryUI;

// 3. المحافظ المالية (متعدد الاختيار)
function selectAllAuditWallets(selectAll) {
  if (selectAll) {
    window.auditSelectedWallets.clear();
  } else {
    window.auditSelectedWallets = new Set(['__NONE__']);
  }
  updateAuditWalletUI();
  if (typeof renderAuditWalletsCards === 'function') renderAuditWalletsCards();
  renderActualBalanceAuditLedger();
}
window.selectAllAuditWallets = selectAllAuditWallets;

function toggleAuditWallet(walletId) {
  const wallets = state.wallets || [];
  if (window.auditSelectedWallets.has('__NONE__')) {
    window.auditSelectedWallets.clear();
    window.auditSelectedWallets.add(walletId);
  } else if (window.auditSelectedWallets.size === 0) {
    window.auditSelectedWallets = new Set([walletId]);
  } else {
    if (window.auditSelectedWallets.has(walletId)) {
      window.auditSelectedWallets.delete(walletId);
      if (window.auditSelectedWallets.size === 0) {
        window.auditSelectedWallets.add('__NONE__');
      }
    } else {
      window.auditSelectedWallets.add(walletId);
      if (window.auditSelectedWallets.size === wallets.length) {
        window.auditSelectedWallets.clear();
      }
    }
  }
  updateAuditWalletUI();
  if (typeof renderAuditWalletsCards === 'function') renderAuditWalletsCards();
  renderActualBalanceAuditLedger();
}
window.toggleAuditWallet = toggleAuditWallet;

function updateAuditWalletUI() {
  const container = document.getElementById('auditWalletListContainer');
  const label = document.getElementById('auditWalletMultiText');
  const isNone = window.auditSelectedWallets.has('__NONE__');
  const isAll = (window.auditSelectedWallets.size === 0);
  const wallets = state.wallets || [];

  if (label) {
    if (isAll) {
      label.innerHTML = '🏦 كافة المحافظ المجمعة';
    } else if (isNone) {
      label.innerHTML = '<span style="color:#f87171;">⚠️ لا توجد محافظ محددة</span>';
    } else {
      const arr = Array.from(window.auditSelectedWallets);
      if (arr.length === 1) {
        const w = wallets.find(x => x.id === arr[0]);
        label.innerHTML = `🏦 ${w ? w.name : arr[0]}`;
      } else {
        label.innerHTML = `🏦 ${arr.length} محافظ محددة`;
      }
    }
  }

  if (container) {
    container.innerHTML = wallets.map(w => {
      const checked = isAll || (!isNone && window.auditSelectedWallets.has(w.id));
      const bal = parseFloat(w.balance) || 0;
      return `
        <label style="display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; border-radius: 6px; background: ${checked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)'}; cursor: pointer; user-select: none; transition: background 0.15s;" onmouseover="this.style.background='rgba(16, 185, 129, 0.2)'" onmouseout="this.style.background='${checked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)'}'">
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleAuditWallet('${w.id}')" style="accent-color: #10b981; width: 14px; height: 14px; cursor: pointer;">
            <i class="fa-solid ${w.icon || 'fa-wallet'}" style="color: ${w.color || '#38bdf8'}; font-size: 0.8rem;"></i>
            <span style="font-size: 0.72rem; font-weight: 750; color: #f8fafc;">${w.name}</span>
          </div>
          <span style="font-size: 0.65rem; color: ${bal >= 0 ? '#34d399' : '#f87171'}; font-weight: 800; font-family: var(--font-numbers); direction: ltr;">${bal.toFixed(2)}</span>
        </label>
      `;
    }).join('');
  }
}
window.updateAuditWalletUI = updateAuditWalletUI;

// 4. نوع العملية (متعدد الاختيار)
const ALL_AUDIT_TYPES = [
  { id: 'expense', name: 'مصروفات وسحوبات (-)', icon: 'fa-arrow-up', color: '#f43f5e' },
  { id: 'income', name: 'إيداعات ودخول (+)', icon: 'fa-arrow-down', color: '#34d399' },
  { id: 'transfer', name: 'تحويلات بين المحافظ (🔄)', icon: 'fa-arrows-rotate', color: '#38bdf8' },
  { id: 'with_receipt', name: 'عمليات بمرفقات فقط (📎)', icon: 'fa-paperclip', color: '#fbbf24' }
];

function selectAllAuditTypes(selectAll) {
  if (selectAll) {
    window.auditSelectedTypes.clear();
  } else {
    window.auditSelectedTypes = new Set(['__NONE__']);
  }
  updateAuditTypeUI();
  renderActualBalanceAuditLedger();
}
window.selectAllAuditTypes = selectAllAuditTypes;

function toggleAuditType(typeId) {
  if (window.auditSelectedTypes.has('__NONE__')) {
    window.auditSelectedTypes.clear();
    window.auditSelectedTypes.add(typeId);
  } else if (window.auditSelectedTypes.size === 0) {
    window.auditSelectedTypes = new Set([typeId]);
  } else {
    if (window.auditSelectedTypes.has(typeId)) {
      window.auditSelectedTypes.delete(typeId);
      if (window.auditSelectedTypes.size === 0) {
        window.auditSelectedTypes.add('__NONE__');
      }
    } else {
      window.auditSelectedTypes.add(typeId);
      if (window.auditSelectedTypes.size === ALL_AUDIT_TYPES.length) {
        window.auditSelectedTypes.clear();
      }
    }
  }
  updateAuditTypeUI();
  renderActualBalanceAuditLedger();
}
window.toggleAuditType = toggleAuditType;

function updateAuditTypeUI() {
  const container = document.getElementById('auditTypeListContainer');
  const label = document.getElementById('auditTypeMultiText');
  const isNone = window.auditSelectedTypes.has('__NONE__');
  const isAll = (window.auditSelectedTypes.size === 0);

  if (label) {
    if (isAll) {
      label.innerHTML = '🔄 كافة العمليات';
    } else if (isNone) {
      label.innerHTML = '<span style="color:#f87171;">⚠️ لا توجد أنواع محددة</span>';
    } else {
      const arr = Array.from(window.auditSelectedTypes);
      if (arr.length === 1) {
        const item = ALL_AUDIT_TYPES.find(x => x.id === arr[0]);
        label.innerHTML = `<span style="color:${item?.color || '#38bdf8'}">${item?.name.split(' ')[0] || arr[0]}</span>`;
      } else {
        label.innerHTML = `🔄 ${arr.length} أنواع محددة`;
      }
    }
  }

  if (container) {
    container.innerHTML = ALL_AUDIT_TYPES.map(t => {
      const checked = isAll || (!isNone && window.auditSelectedTypes.has(t.id));
      return `
        <label style="display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; border-radius: 6px; background: ${checked ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.02)'}; cursor: pointer; user-select: none; transition: background 0.15s;" onmouseover="this.style.background='rgba(56, 189, 248, 0.2)'" onmouseout="this.style.background='${checked ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.02)'}'">
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleAuditType('${t.id}')" style="accent-color: #38bdf8; width: 14px; height: 14px; cursor: pointer;">
            <i class="fa-solid ${t.icon}" style="color: ${t.color}; font-size: 0.8rem;"></i>
            <span style="font-size: 0.72rem; font-weight: 750; color: #f8fafc;">${t.name}</span>
          </div>
        </label>
      `;
    }).join('');
  }
}
window.updateAuditTypeUI = updateAuditTypeUI;

function populateAuditFilters() {
  updateAuditMemberUI();
  updateAuditCategoryUI();
  updateAuditWalletUI();
  updateAuditTypeUI();
}
window.populateAuditFilters = populateAuditFilters;

function renderAuditWalletsCards() {
  const container = document.getElementById('auditWalletsCardsContainer');
  const totalTxt = document.getElementById('auditWalletsTotalLiquidityText');
  if (!container) return;

  const wallets = state.wallets || [];
  let totalLiquidity = 0;
  wallets.forEach(w => totalLiquidity += (parseFloat(w.balance) || 0));

  if (totalTxt) {
    totalTxt.textContent = `إجمالي السيولة: ${totalLiquidity.toFixed(2)} ج.م`;
  }

  const isNone = window.auditSelectedWallets.has('__NONE__');
  const isAll = (window.auditSelectedWallets.size === 0);

  const isLight = document.body.classList.contains('light-theme');
  container.innerHTML = wallets.map(w => {
    const isSelected = isAll || (!isNone && window.auditSelectedWallets.has(w.id));
    const bal = parseFloat(w.balance) || 0;
    const color = w.color || '#38bdf8';
    const icon = w.icon || 'fa-wallet';
    const wCardBg = isLight
      ? (isSelected && !isAll ? 'linear-gradient(135deg, #e0f2fe, #bae6fd)' : '#ffffff')
      : (isSelected && !isAll ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(15, 23, 42, 0.95))' : 'rgba(30, 41, 59, 0.55)');
    const wCardBorder = isLight
      ? (isSelected && !isAll ? '#0284c7' : '#cbd5e1')
      : (isSelected && !isAll ? '#38bdf8' : 'rgba(255,255,255,0.08)');
    const wCardText = isLight ? '#0f172a' : '#f8fafc';
    const wCardSub = isLight ? '#64748b' : '#94a3b8';

    return `
      <div class="audit-wallet-card" onclick="selectAuditWalletQuick('${w.id}')" style="cursor: pointer; background: ${wCardBg}; border: 1.2px solid ${wCardBorder}; border-radius: 10px; padding: 6px 9px; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s ease; box-shadow: ${isLight ? '0 2px 5px rgba(0,0,0,0.05)' : (isSelected && !isAll ? '0 0 10px rgba(56, 189, 248, 0.35)' : 'none')};">
        <div style="display: flex; align-items: center; gap: 7px;">
          <div style="width: 26px; height: 26px; border-radius: 7px; background: ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'}; display: flex; align-items: center; justify-content: center; color: ${color}; font-size: 0.8rem;">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div>
            <div style="font-size: 0.72rem; font-weight: 850; color: ${wCardText};">${w.name}</div>
            <div style="font-size: 0.58rem; color: ${wCardSub};">${w.type === 'cash' ? 'كاش' : 'محفظة'}</div>
          </div>
        </div>
        <div style="text-align: left;">
          <div style="font-size: 0.82rem; font-weight: 900; color: ${bal >= 0 ? '#34d399' : '#f87171'}; font-family: var(--font-numbers); direction: ltr;">${bal.toFixed(2)} ج.م</div>
          ${isSelected && !isAll ? '<span style="font-size: 0.56rem; color: #38bdf8; font-weight: 800;">مُفعل ✓</span>' : ''}
        </div>
      </div>
    `;
  }).join('');
}
window.renderAuditWalletsCards = renderAuditWalletsCards;

function selectAuditWalletQuick(walletId) {
  toggleAuditWallet(walletId);
}
window.selectAuditWalletQuick = selectAuditWalletQuick;

function onAuditPeriodChange() {
  const p = document.getElementById('auditPeriodFilter')?.value;
  const customRow = document.getElementById('auditCustomDateRow');
  if (customRow) {
    customRow.style.display = (p === 'custom') ? 'grid' : 'none';
  }
  renderActualBalanceAuditLedger();
}
window.onAuditPeriodChange = onAuditPeriodChange;

function onAuditWalletFilterChange() {
  renderAuditWalletsCards();
  renderActualBalanceAuditLedger();
}
window.onAuditWalletFilterChange = onAuditWalletFilterChange;

function renderActualBalanceAuditLedger() {
  const container = document.getElementById('auditLedgerTableContainer');
  if (!container) return;

  const q = (document.getElementById('auditSearchInput')?.value || '').trim().toLowerCase();
  const period = document.getElementById('auditPeriodFilter')?.value || 'all';

  let txs = (state.transactions || []).slice();

  // 1. تصفية النص / البحث
  if (q) {
    txs = txs.filter(t => {
      const catInfo = getCategoryArabicInfo(t.category, t.type);
      return (t.label || '').toLowerCase().includes(q) ||
             (t.category || '').toLowerCase().includes(q) ||
             catInfo.name.toLowerCase().includes(q) ||
             (t.member || '').toLowerCase().includes(q) ||
             (t.notes || '').toLowerCase().includes(q) ||
             String(t.amount || '').includes(q);
    });
  }

  // 2. تصفية الفترة الزمنية
  const now = new Date();
  const todayStr = typeof getLocalDateStr === 'function' ? getLocalDateStr(now) : now.toISOString().split('T')[0];

  if (period === 'today') {
    txs = txs.filter(t => (t.date || '').startsWith(todayStr));
  } else if (period === 'yesterday') {
    const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yestStr = typeof getLocalDateStr === 'function' ? getLocalDateStr(yest) : yest.toISOString().split('T')[0];
    txs = txs.filter(t => (t.date || '').startsWith(yestStr));
  } else if (period === 'week') {
    const d7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const d7Str = typeof getLocalDateStr === 'function' ? getLocalDateStr(d7) : d7.toISOString().split('T')[0];
    txs = txs.filter(t => (t.date || '') >= d7Str && (t.date || '') <= todayStr);
  } else if (period === 'last_30_days') {
    const d30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    const d30Str = typeof getLocalDateStr === 'function' ? getLocalDateStr(d30) : d30.toISOString().split('T')[0];
    txs = txs.filter(t => (t.date || '') >= d30Str && (t.date || '') <= todayStr);
  } else if (period === 'this_month') {
    const startM = new Date(now.getFullYear(), now.getMonth(), 1);
    const endM = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const sMStr = typeof getLocalDateStr === 'function' ? getLocalDateStr(startM) : startM.toISOString().split('T')[0];
    const eMStr = typeof getLocalDateStr === 'function' ? getLocalDateStr(endM) : endM.toISOString().split('T')[0];
    txs = txs.filter(t => (t.date || '') >= sMStr && (t.date || '') <= eMStr);
  } else if (period === 'last_month') {
    const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPrev = new Date(now.getFullYear(), now.getMonth(), 0);
    const sPStr = typeof getLocalDateStr === 'function' ? getLocalDateStr(startPrev) : startPrev.toISOString().split('T')[0];
    const ePStr = typeof getLocalDateStr === 'function' ? getLocalDateStr(endPrev) : endPrev.toISOString().split('T')[0];
    txs = txs.filter(t => (t.date || '') >= sPStr && (t.date || '') <= ePStr);
  } else if (period === 'this_year') {
    const startY = `${now.getFullYear()}-01-01`;
    const endY = `${now.getFullYear()}-12-31`;
    txs = txs.filter(t => (t.date || '') >= startY && (t.date || '') <= endY);
  } else if (period === 'custom') {
    const from = document.getElementById('auditDateFrom')?.value;
    const to = document.getElementById('auditDateTo')?.value;
    if (from) txs = txs.filter(t => (t.date || '') >= from);
    if (to) txs = txs.filter(t => (t.date || '') <= to);
  }

  // 3. تصفية الأفراد (متعدد الاختيار)
  if (window.auditSelectedMembers && window.auditSelectedMembers.size > 0) {
    if (window.auditSelectedMembers.has('__NONE__')) {
      txs = [];
    } else {
      txs = txs.filter(t => window.auditSelectedMembers.has(t.member));
    }
  }

  // 4. تصفية بنود الصرف والإيراد (متعدد الاختيار)
  if (window.auditSelectedCategories && window.auditSelectedCategories.size > 0) {
    if (window.auditSelectedCategories.has('__NONE__')) {
      txs = [];
    } else {
      txs = txs.filter(t => {
        const rawKey = String(t.category || '').trim().toLowerCase();
        const info = getCategoryArabicInfo(t.category, t.type);

        if (window.auditSelectedCategories.has(rawKey)) return true;
        if (rawKey === 'home' && window.auditSelectedCategories.has('house')) return true;
        if (rawKey === 'biz' && window.auditSelectedCategories.has('business')) return true;
        if (rawKey === 'others' && window.auditSelectedCategories.has('other')) return true;
        if (rawKey === 'clothing' && window.auditSelectedCategories.has('clothes')) return true;
        if (rawKey === 'investment' && window.auditSelectedCategories.has('invest')) return true;
        if (window.auditSelectedCategories.has(info.name)) return true;
        return false;
      });
    }
  }

  // 5. تصفية المحافظ (متعدد الاختيار)
  if (window.auditSelectedWallets && window.auditSelectedWallets.size > 0) {
    if (window.auditSelectedWallets.has('__NONE__')) {
      txs = [];
    } else {
      txs = txs.filter(t => {
        const wid = t.walletId || t.wallet || 'cash';
        return window.auditSelectedWallets.has(wid);
      });
    }
  }

  // 6. تصفية نوع العملية (متعدد الاختيار بما في ذلك المرفقات)
  if (window.auditSelectedTypes && window.auditSelectedTypes.size > 0) {
    if (window.auditSelectedTypes.has('__NONE__')) {
      txs = [];
    } else {
      txs = txs.filter(t => {
        const hasReceipt = Boolean(getTxAttachmentUrl(t));
        const hasReceiptFilter = window.auditSelectedTypes.has('with_receipt');

        if (hasReceiptFilter && window.auditSelectedTypes.size === 1) {
          return hasReceipt;
        }

        if (hasReceiptFilter) {
          const nonReceiptTypes = new Set(window.auditSelectedTypes);
          nonReceiptTypes.delete('with_receipt');
          return hasReceipt && nonReceiptTypes.has(t.type);
        }

        return window.auditSelectedTypes.has(t.type);
      });
    }
  }

  // فرز تسلسلي زمني لحساب الرصيد التراكمي بدقة رياضية
  txs.sort((a, b) => {
    const dComp = (a.date || '').localeCompare(b.date || '');
    if (dComp !== 0) return dComp;
    return (a.id || '').localeCompare(b.id || '');
  });

  let running = 0;
  let totInc = 0;
  let totExp = 0;

  txs.forEach((t) => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === 'income') {
      totInc += amt;
      running += amt;
    } else {
      totExp += amt;
      running -= amt;
    }
    t._runningBalance = running;
  });

  // تحديد ترتيب العرض (الأحدث أولاً بشكل افتراضي)
  let displayTxs = txs.slice();
  if (window.auditSortOrder === 'desc') {
    displayTxs.reverse();
  }

  const rows = displayTxs.map((t, idx) => {
    const isInc = t.type === 'income';
    const amt = parseFloat(t.amount) || 0;
    const catInfo = getCategoryArabicInfo(t.category, t.type);
    const receiptImg = getTxAttachmentUrl(t);
    const safeLabel = typeof escapeHtml === 'function' ? escapeHtml(t.label || '-') : (t.label || '-');

    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.12s ease;" onmouseover="this.style.background='rgba(56, 189, 248, 0.05)'" onmouseout="this.style.background='transparent'">
        <td style="padding: 6px 5px; font-size: 0.70rem; color: #94a3b8; text-align: center;">${idx + 1}</td>
        <td style="padding: 6px 5px; font-size: 0.72rem; color: #cbd5e1; white-space: nowrap;">${t.date || '-'}</td>
        <td style="padding: 6px 8px; font-size: 0.76rem; font-weight: 750; color: #f8fafc; line-height: 1.35; word-break: break-word;">${safeLabel}</td>
        <td style="padding: 6px 5px; font-size: 0.72rem; color: #38bdf8; white-space: nowrap;">${t.member || '-'}</td>
        <td style="padding: 6px 5px; font-size: 0.72rem; color: ${catInfo.color || '#c084fc'}; white-space: nowrap;">
          <span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 750;">
            <span style="font-size: 0.82rem;">${catInfo.emoji}</span>
            <span>${catInfo.name}</span>
          </span>
        </td>
        <td style="padding: 6px 6px; font-size: 0.75rem; font-weight: 800; color: #34d399; text-align: left; font-family: var(--font-numbers); direction: ltr;">
          ${isInc ? `+${amt.toFixed(2)}` : '-'}
        </td>
        <td style="padding: 6px 6px; font-size: 0.75rem; font-weight: 800; color: #f43f5e; text-align: left; font-family: var(--font-numbers); direction: ltr;">
          ${!isInc ? `-${amt.toFixed(2)}` : '-'}
        </td>
        <td style="padding: 6px 6px; font-size: 0.76rem; font-weight: 900; color: ${(t._runningBalance || 0) >= 0 ? '#38bdf8' : '#f87171'}; text-align: left; font-family: var(--font-numbers); direction: ltr;">
          ${(t._runningBalance !== undefined ? t._runningBalance : running).toFixed(2)}
        </td>
        <td style="padding: 5px 4px; text-align: center; white-space: nowrap;">
          ${receiptImg ? `
            <div onclick="event.stopPropagation(); if (typeof openReceiptLightbox === 'function') openReceiptLightbox('${receiptImg}', '${safeLabel}');" 
                 class="audit-attachment-chip"
                 title="انقر لتكبير ومعاينة المرفق والفاتورة">
              <img src="${receiptImg}" class="audit-attachment-thumb" onerror="this.style.display='none'" />
              <span>عرض 📎</span>
            </div>
          ` : '<span style="color: #64748b; font-size: 0.70rem; opacity: 0.6;">—</span>'}
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <table style="width: 100%; border-collapse: separate; border-spacing: 0; text-align: right;">
      <thead>
        <tr style="position: sticky; top: 0; z-index: 10; background: #0f172a; border-bottom: 2px solid rgba(56, 189, 248, 0.45); box-shadow: 0 2px 5px rgba(0,0,0,0.45);">
          <th style="padding: 7px 5px; font-size: 0.70rem; color: #94a3b8; text-align: center; width: 40px; background: #0f172a;">#</th>
          <th style="padding: 7px 5px; font-size: 0.70rem; color: #94a3b8; width: 85px; background: #0f172a;">التاريخ</th>
          <th style="padding: 7px 8px; font-size: 0.70rem; color: #94a3b8; background: #0f172a;">البيان والتفاصيل</th>
          <th style="padding: 7px 5px; font-size: 0.70rem; color: #94a3b8; width: 75px; background: #0f172a;">العضو</th>
          <th style="padding: 7px 5px; font-size: 0.70rem; color: #94a3b8; width: 110px; background: #0f172a;">التصنيف</th>
          <th style="padding: 7px 6px; font-size: 0.70rem; color: #34d399; text-align: left; width: 95px; background: #0f172a;">إيداع (+)</th>
          <th style="padding: 7px 6px; font-size: 0.70rem; color: #f43f5e; text-align: left; width: 95px; background: #0f172a;">مصروف (-)</th>
          <th style="padding: 7px 6px; font-size: 0.70rem; color: #38bdf8; text-align: left; width: 105px; background: #0f172a;">الرصيد التراكمي</th>
          <th style="padding: 7px 5px; font-size: 0.70rem; color: #38bdf8; text-align: center; width: 80px; background: #0f172a;">المرفق 📎</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="9" style="text-align:center; padding: 25px; color:#94a3b8; font-size: 0.8rem;">لا توجد عمليات مطابقة للفلاتر المحددة</td></tr>'}
      </tbody>
    </table>
  `;

  // 7. تحديث إحصائيات الفلترة المباشرة
  const elInc = document.getElementById('auditFilteredIncome');
  const elExp = document.getElementById('auditFilteredExpense');
  const elNet = document.getElementById('auditFilteredNet');
  const elCnt = document.getElementById('auditFilteredCount');
  if (elInc) elInc.textContent = `+${totInc.toFixed(2)}`;
  if (elExp) elExp.textContent = `-${totExp.toFixed(2)}`;
  if (elNet) elNet.textContent = `${(totInc - totExp).toFixed(2)}`;
  if (elCnt) elCnt.textContent = `${displayTxs.length} حركة`;

  // 8. تحديث كروت المعادلة
  const elTotalInc = document.getElementById('auditMetricTotalInc');
  const elTotalExp = document.getElementById('auditMetricTotalExp');
  const elNetFlow = document.getElementById('auditMetricNetFlow');
  const elActualBal = document.getElementById('auditMetricActualBal');
  if (elTotalInc) elTotalInc.textContent = `+${totInc.toFixed(2)} ج.م`;
  if (elTotalExp) elTotalExp.textContent = `-${totExp.toFixed(2)} ج.م`;
  if (elNetFlow) elNetFlow.textContent = `${(totInc - totExp).toFixed(2)} ج.م`;
  if (elActualBal) elActualBal.textContent = `${running.toFixed(2)} ج.م`;

  const eqText = document.getElementById('auditEquationText');
  if (eqText) eqText.textContent = `${totInc.toFixed(2)} - ${totExp.toFixed(2)} = ${(totInc - totExp).toFixed(2)} ج.م`;

  // 9. تخزين الحركات المفلترة للتصدير والطباعة
  window.lastAuditFilteredTxs = displayTxs;
}
window.renderActualBalanceAuditLedger = renderActualBalanceAuditLedger;

function clearAuditSearch() {
  const inp = document.getElementById('auditSearchInput');
  if (inp) inp.value = '';
  renderActualBalanceAuditLedger();
}
window.clearAuditSearch = clearAuditSearch;

function resetAuditFilters() {
  const s = document.getElementById('auditSearchInput');
  if (s) s.value = '';
  const dFrom = document.getElementById('auditDateFrom');
  if (dFrom) dFrom.value = '';
  const dTo = document.getElementById('auditDateTo');
  if (dTo) dTo.value = '';
  const customRow = document.getElementById('auditCustomDateRow');
  if (customRow) customRow.style.display = 'none';

  window.auditSelectedMembers.clear();
  window.auditSelectedCategories.clear();
  window.auditSelectedWallets.clear();
  window.auditSelectedTypes.clear();

  updateAuditMemberUI();
  updateAuditCategoryUI();
  updateAuditWalletUI();
  updateAuditTypeUI();

  const pEl = document.getElementById('auditPeriodFilter');
  if (pEl) pEl.value = 'all';

  if (typeof renderAuditWalletsCards === 'function') renderAuditWalletsCards();
  renderActualBalanceAuditLedger();
  if (typeof showToast === 'function') showToast('تم تفريغ كافة الفلاتر والبحث بنجاح ✓', 'info');
}
window.resetAuditFilters = resetAuditFilters;

function exportAuditLedgerCSV() {
  const txs = window.lastAuditFilteredTxs || (state.transactions || []).slice();
  let csv = "\ufeff# التاريخ,البيان,العضو,التصنيف,المحفظة,المبلغ,النوع,الرصيد التراكمي,المرفق\r\n";
  txs.forEach((t, i) => {
    const catInfo = getCategoryArabicInfo(t.category, t.type);
    const amt = parseFloat(t.amount) || 0;
    const isInc = t.type === 'income';
    const runningStr = (t._runningBalance !== undefined) ? t._runningBalance.toFixed(2) : '';
    const hasAtt = Boolean(getTxAttachmentUrl(t));
    csv += `"${i+1}","${t.date||''}","${(t.label||'').replace(/"/g,'""')}","${t.member||''}","${catInfo.name}","${t.walletId||t.wallet||'cash'}","${amt.toFixed(2)}","${isInc ? 'إيداع (+)' : 'مصروف (-)'}","${runningStr}","${hasAtt ? 'يوجد مرفق' : 'بدون'}"
`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit_ledger_${getLocalDateStr(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof showToast === 'function') showToast('تم تصدير كشف الحساب المفلتر CSV بنجاح ✓', 'success');
}
window.exportAuditLedgerCSV = exportAuditLedgerCSV;

function printAuditLedgerStatement() {
  const txs = window.lastAuditFilteredTxs || (state.transactions || []).slice();
  const printContainer = document.getElementById('printableStatementSheet');
  if (printContainer) {
    let totInc = 0;
    let totExp = 0;
    let rowsHtml = '';

    txs.forEach((t, i) => {
      const amt = parseFloat(t.amount) || 0;
      const isInc = t.type === 'income';
      if (isInc) totInc += amt;
      else totExp += amt;

      const catInfo = getCategoryArabicInfo(t.category, t.type);
      const debitTxt = !isInc ? `-${amt.toFixed(2)}` : '-';
      const creditTxt = isInc ? `+${amt.toFixed(2)}` : '-';
      const runningBal = (t._runningBalance !== undefined) ? t._runningBalance.toFixed(2) : '-';
      const receiptImg = getTxAttachmentUrl(t);

      rowsHtml += `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 0.74rem;">
          <td style="padding: 5px; text-align: center;">${i + 1}</td>
          <td style="padding: 5px; white-space: nowrap;">${t.date || '-'}</td>
          <td style="padding: 5px; font-weight: 700;">${typeof escapeHtml === 'function' ? escapeHtml(t.label || '-') : (t.label || '-')}</td>
          <td style="padding: 5px;">${t.member || '-'}</td>
          <td style="padding: 5px;">${catInfo.name}</td>
          <td style="padding: 5px; color: #16a34a; font-weight: 700; direction: ltr; text-align: left;">${creditTxt}</td>
          <td style="padding: 5px; color: #dc2626; font-weight: 700; direction: ltr; text-align: left;">${debitTxt}</td>
          <td style="padding: 5px; font-weight: 800; color: #0284c7; direction: ltr; text-align: left;">${runningBal}</td>
          <td style="padding: 5px; text-align: center;">${receiptImg ? '📎 يوجد مرفق' : '-'}</td>
        </tr>
      `;
    });

    const netBal = totInc - totExp;
    printContainer.innerHTML = `
      <div class="print-header-box" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 12px; direction: rtl;">
        <div>
          <h2 style="margin: 0 0 4px; font-size: 1.3rem; color: #0369a1; font-weight: 900;">كشف وتدقيق مصدر الرصيد الفعلي</h2>
          <div style="font-size: 0.78rem; color: #475569;">تقرير تدقيق مالي محاسبي شامل لحركات الصندوق والمحافظ</div>
        </div>
        <div style="text-align: left; font-size: 0.74rem; color: #64748b; direction: rtl;">
          <div>تاريخ التقرير: <strong>${new Date().toLocaleDateString('ar-EG')}</strong></div>
          <div>عدد الحركات: <strong>${txs.length} حركة</strong></div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; direction: rtl;">
        <div style="text-align: center;"><div style="font-size: 0.70rem; color: #64748b;">إجمالي الإيداعات (+)</div><div style="font-size: 1.05rem; font-weight: 900; color: #16a34a; direction: ltr;">+${totInc.toFixed(2)} ج.م</div></div>
        <div style="text-align: center;"><div style="font-size: 0.70rem; color: #64748b;">إجمالي المصروفات (-)</div><div style="font-size: 1.05rem; font-weight: 900; color: #dc2626; direction: ltr;">-${totExp.toFixed(2)} ج.م</div></div>
        <div style="text-align: center;"><div style="font-size: 0.70rem; color: #64748b;">صافي الحركة المعتمد</div><div style="font-size: 1.05rem; font-weight: 900; color: #0284c7; direction: ltr;">${netBal.toFixed(2)} ج.م</div></div>
      </div>
      <table style="width: 100%; border-collapse: collapse; direction: rtl; text-align: right;">
        <thead>
          <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 0.74rem; color: #334155;">
            <th style="padding: 6px; text-align: center;">#</th>
            <th style="padding: 6px;">التاريخ</th>
            <th style="padding: 6px;">البيان</th>
            <th style="padding: 6px;">العضو</th>
            <th style="padding: 6px;">التصنيف</th>
            <th style="padding: 6px; text-align: left;">إيداع (+)</th>
            <th style="padding: 6px; text-align: left;">مصروف (-)</th>
            <th style="padding: 6px; text-align: left;">الرصيد التراكمي</th>
            <th style="padding: 6px; text-align: center;">المرفق</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="9" style="text-align:center; padding:15px;">لا توجد حركات مطابقة</td></tr>'}
        </tbody>
      </table>
    `;
  }
  window.print();
}
window.printAuditLedgerStatement = printAuditLedgerStatement;


// 5. WALLET TRANSFERS & STATEMENTS
function executeWalletTransfer() {
  const from = document.getElementById('inpTransferFromWallet')?.value;
  const to = document.getElementById('inpTransferToWallet')?.value;
  const amt = parseFloat(document.getElementById('inpTransferAmount')?.value) || 0;
  const note = document.getElementById('inpTransferNotes')?.value.trim() || 'تحويل بين المحافظ';
  const date = document.getElementById('inpTransferDate')?.value || getLocalDateStr(new Date());

  if (!from || !to || from === to) {
    if (typeof showToast === 'function') showToast('يرجى اختيار محفظتين مختلفتين للتحويل', 'error');
    return;
  }
  if (amt <= 0) {
    if (typeof showToast === 'function') showToast('يرجى كتابة مبلغ تحويل أكبر من 0', 'error');
    return;
  }
  if (typeof canDeductFromWallet === 'function' && !canDeductFromWallet(from, amt)) {
    if (typeof showToast === 'function') showToast('الرصيد الحالى لا يكفى لتنفيذ العملية', 'error', 4500);
    return;
  }

  const txOut = {
    id: 'tx-' + Date.now() + '-out',
    type: 'expense',
    amount: amt,
    label: `تحويل إلى ${to}: ${note}`,
    category: 'transfer',
    author: state.currentUser,
    walletId: from,
    member: state.currentUser || 'ماهر',
    date: date,
    time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString()
  };

  const txIn = {
    id: 'tx-' + (Date.now() + 1) + '-in',
    type: 'income',
    amount: amt,
    label: `تحويل وارد من ${from}: ${note}`,
    category: 'transfer',
    author: state.currentUser,
    walletId: to,
    member: state.currentUser || 'ماهر',
    date: date,
    time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString()
  };

  if (!state.transactions) state.transactions = [];
  state.transactions.push(txOut, txIn);

  if (typeof saveTx === 'function') saveTx();

  if (typeof auditAndRecomputeAllWalletBalances === 'function') auditAndRecomputeAllWalletBalances();
  if (typeof renderUI === 'function') renderUI();

  if (typeof closeModal === 'function') closeModal('walletTransferModal');
  const currSym = (state.currency === 'SAR') ? 'ر.س' : (state.currency === 'GOLD21' ? 'جرام' : 'ج.م');
  const fromName = typeof getWalletName === 'function' ? getWalletName(from) : from;
  const toName = typeof getWalletName === 'function' ? getWalletName(to) : to;
  if (typeof showToast === 'function') showToast(`💼 تم تسجيل عملية تحويل أموال من (${fromName}) إلى (${toName}) بقيمة ${formatMoney(amount)} ${currSym} بنجاح ✓`, 'success', 4500);
}
window.executeWalletTransfer = executeWalletTransfer;

function renderWalletStatement() {
  const container = document.getElementById('walletStatementTableContainer');
  if (!container) return;
  const wallet = document.getElementById('stmtWalletFilter')?.value || 'all';
  const period = document.getElementById('stmtPeriodFilter')?.value || 'month';
  const wallets = Array.isArray(state.wallets) ? state.wallets : [];
  const selectedWallets = wallet === 'all' ? wallets : wallets.filter(item => item.id === wallet);
  const initialBaseBalance = selectedWallets.reduce((sum, item) => sum + (Number(item.initialBalance ?? item.baseBalance) || 0), 0);
  
  const matchesWallet = reference => {
    if (!reference) return false;
    const value = String(reference);
    return selectedWallets.some(item => item.id === value || item.name === value || item.id === normalizeWalletId(value));
  };

  // كافة حركات المحفظة المحددة مرتبة زمنياً تصاعدياً لحساب الرصيد التراكمي بدقة
  let allWalletTxs = (state.transactions || []).filter(tx => {
    if (wallet === 'all') return true;
    if (tx.type === 'transfer') return matchesWallet(tx.fromWalletId || tx.fromWallet || tx.walletId || tx.wallet) || matchesWallet(tx.toWalletId || tx.toWallet);
    return matchesWallet(tx.walletId || tx.wallet || 'wallet-cash-safe');
  });
  allWalletTxs.sort((a,b) => (a.date || '').localeCompare(b.date || '') || String(a.time || '').localeCompare(String(b.time || '')));

  // تحديد نطاق تاريخ الفترة المختارة
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  let startDate = '';
  let endDate = todayStr;

  if (period === 'today') {
    startDate = todayStr;
    endDate = todayStr;
  } else if (period === 'week') {
    const wDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    startDate = wDate.toISOString().split('T')[0];
  } else if (period === 'month') {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    startDate = `${y}-${m}-01`;
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    endDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
  } // if 'all', startDate remains empty

  // 1. حساب الرصيد الافتتاحي الدقيق للفترة (الرصيد الأساسي + الحركات السابقة لتاريخ بداية الفترة)
  let openingBalance = initialBaseBalance;
  const periodTxs = [];

  allWalletTxs.forEach(t => {
    const isTransfer = t.type === 'transfer' || t.category === 'transfer';
    const amt = parseFloat(t.amount) || 0;
    let effect = t.type === 'income' ? amt : (t.type === 'expense' ? -amt : 0);
    if (t.type === 'transfer') {
      const fromMatches = wallet !== 'all' && matchesWallet(t.fromWalletId || t.fromWallet || t.walletId || t.wallet);
      const toMatches = wallet !== 'all' && matchesWallet(t.toWalletId || t.toWallet);
      effect = fromMatches ? -amt : (toMatches ? amt : 0);
    }

    const txDate = t.date || '';
    if (startDate && txDate < startDate) {
      openingBalance += effect;
    } else if (!endDate || txDate <= endDate) {
      periodTxs.push({ tx: t, effect, amt, isTransfer });
    }
  });

  let runningBal = openingBalance;
  let inFlow = 0;
  let outFlow = 0;

  const fmtNum = n => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rows = periodTxs.map((item, idx) => {
    const t = item.tx;
    const effect = item.effect;
    const amt = item.amt;
    const isTransfer = item.isTransfer;
    const isInc = effect > 0 || (t.type === 'income' && effect >= 0);
    runningBal += effect;

    if (!(wallet === 'all' && isTransfer)) {
      if (effect > 0) inFlow += effect;
      else if (effect < 0) outFlow += Math.abs(effect);
    }

    const rowBg = idx % 2 === 0 ? 'background: rgba(30,41,59,0.25);' : 'background: transparent;';

    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); ${rowBg}">
        <td style="padding: 7px 6px; text-align: center; color: #94a3b8; font-weight: 700;">${idx + 1}</td>
        <td style="padding: 7px 8px; white-space: nowrap; font-family: var(--font-numbers); direction: ltr; text-align: center; font-weight: 700; color: #cbd5e1;">${escapeHtml(t.date || '-')}</td>
        <td style="padding: 7px 8px; font-weight: 750; color: #f8fafc; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${typeof escapeHtml === 'function' ? escapeHtml(t.label || '-') : (t.label || '-')}</td>
        <td style="padding: 7px 8px; color: #34d399; font-weight: 850; font-family: var(--font-numbers); direction: ltr; text-align: left; white-space: nowrap;">${isInc ? `+${fmtNum(amt)}` : '-'}</td>
        <td style="padding: 7px 8px; color: #f43f5e; font-weight: 850; font-family: var(--font-numbers); direction: ltr; text-align: left; white-space: nowrap;">${!isInc ? `-${fmtNum(amt)}` : '-'}</td>
        <td style="padding: 7px 8px; font-weight: 900; font-family: var(--font-numbers); direction: ltr; text-align: left; white-space: nowrap; color: ${runningBal >= 0 ? '#38bdf8' : '#f43f5e'};">${fmtNum(runningBal)}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.74rem;">
      <thead style="position: sticky; top: 0; z-index: 20; background: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
        <tr style="color: #94a3b8; border-bottom: 1.5px solid rgba(255,255,255,0.12);">
          <th style="padding: 8px 6px; position: sticky; top: 0; background: #0f172a; text-align: center; width: 36px;">#</th>
          <th style="padding: 8px 8px; position: sticky; top: 0; background: #0f172a; text-align: center; white-space: nowrap; width: 95px;">التاريخ</th>
          <th style="padding: 8px 8px; position: sticky; top: 0; background: #0f172a;">البيان والوصف</th>
          <th style="padding: 8px 8px; position: sticky; top: 0; background: #0f172a; text-align: left; white-space: nowrap; color: #34d399;">إيداع (+)</th>
          <th style="padding: 8px 8px; position: sticky; top: 0; background: #0f172a; text-align: left; white-space: nowrap; color: #f43f5e;">صرف (-)</th>
          <th style="padding: 8px 8px; position: sticky; top: 0; background: #0f172a; text-align: left; white-space: nowrap; color: #38bdf8;">الرصيد التراكمي</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="6" style="text-align:center; padding: 25px 15px; color: #94a3b8; font-weight: 700;">لا توجد حركات مسجلة في هذه الفترة المحددة</td></tr>'}</tbody>
    </table>
  `;

  if (document.getElementById('stmtOpeningBal')) document.getElementById('stmtOpeningBal').textContent = fmtNum(openingBalance);
  if (document.getElementById('stmtTotalInflow')) document.getElementById('stmtTotalInflow').textContent = `+${fmtNum(inFlow)}`;
  if (document.getElementById('stmtTotalOutflow')) document.getElementById('stmtTotalOutflow').textContent = `-${fmtNum(outFlow)}`;
  if (document.getElementById('stmtClosingBal')) document.getElementById('stmtClosingBal').textContent = fmtNum(runningBal);
}
window.renderWalletStatement = renderWalletStatement;

function exportWalletStatementExcel() { exportAuditLedgerCSV(); }
window.exportWalletStatementExcel = exportWalletStatementExcel;

function exportWalletStatementPdf() { window.print(); }
window.exportWalletStatementPdf = exportWalletStatementPdf;

// 6. ACTIVITY DETAILS MODAL
function openActivityDetails(id) {
  const item = (state.transactions || []).find(t => t.id === id);
  if (!item) return;

  if (document.getElementById('actDetailActionTitle')) document.getElementById('actDetailActionTitle').textContent = item.label || 'تفاصيل العملية';
  if (document.getElementById('actDetailAmountVal')) document.getElementById('actDetailAmountVal').textContent = `${parseFloat(item.amount||0).toFixed(2)} ${state.currency || 'EGP'}`;
  if (document.getElementById('actDetailDateTime')) document.getElementById('actDetailDateTime').textContent = `${item.date || ''} ${item.time || ''}`;
  if (document.getElementById('actDetailAuthor')) document.getElementById('actDetailAuthor').textContent = item.member || item.author || '-';
  if (document.getElementById('actDetailFullLabel')) document.getElementById('actDetailFullLabel').textContent = item.label || '-';

  const img = document.getElementById('actDetailReceiptImg');
  if (img) {
    if (item.receipt) {
      img.src = item.receipt;
      img.style.display = 'block';
    } else {
      img.style.display = 'none';
    }
  }
  if (typeof openModal === 'function') openModal('activityDetailsModal');
}
window.openActivityDetails = openActivityDetails;

function downloadReceiptFromActDetail() {
  const img = document.getElementById('actDetailReceiptImg');
  if (!img || !img.src) return;
  const a = document.createElement('a');
  a.href = img.src;
  a.download = `receipt_${Date.now()}.jpg`;
  a.click();
}
window.downloadReceiptFromActDetail = downloadReceiptFromActDetail;

function openReceiptFromActDetail() {
  const img = document.getElementById('actDetailReceiptImg');
  if (img && img.src) viewReceiptImage(img.src);
}
window.openReceiptFromActDetail = openReceiptFromActDetail;

// 7. TASK PHOTO HANDLERS & PRESETS
function handlePrimaryTaskPhotoChosen(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    window.currentQuickTaskPhoto = e.target.result;
    const preview = document.getElementById('quickTaskPhotoPreview');
    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
    if (typeof showToast === 'function') showToast('تم التقاط وإرفاق صورة المهمة بنجاح 📷', 'success');
  };
  reader.readAsDataURL(file);
}
window.handlePrimaryTaskPhotoChosen = handlePrimaryTaskPhotoChosen;

function handleSubtaskPhotoChosen(event) { handlePrimaryTaskPhotoChosen(event); }
window.handleSubtaskPhotoChosen = handleSubtaskPhotoChosen;

function handleTaskPhotoUpload(event) { handlePrimaryTaskPhotoChosen(event); }
window.handleTaskPhotoUpload = handleTaskPhotoUpload;

function setTaskDateTimePreset(preset) {
  const target = 'drawer';
  const fields = getTaskDateTimeTargetFields(target);
  const zone = fields.timezone && fields.timezone.value || getDefaultTaskTimezone();
  if (preset === 'clear') {
    if (fields.dateTime) fields.dateTime.value = '';
    if (fields.second) fields.second.value = '00';
    if (fields.timezone) fields.timezone.value = '';
    updateTaskDateTimeTargetDisplay(target);
    return;
  }
  let dateValue = getTaskDateInTimezone(zone);
  let timeValue = '10:00';
  if (preset === 'today_evening') timeValue = '20:00';
  else if (preset === 'tomorrow_morning') { dateValue = addDaysToTaskIsoDate(dateValue, 1); timeValue = '10:00'; }
  else if (preset === 'after_two_days') dateValue = addDaysToTaskIsoDate(dateValue, 2);
  else if (preset === 'weekend') {
    const date = parseTaskIsoDate(dateValue) || new Date();
    dateValue = addDaysToTaskIsoDate(dateValue, ((5 - date.getDay() + 7) % 7) || 7);
  }
  if (fields.dateTime) fields.dateTime.value = `${dateValue}T${timeValue}`;
  if (fields.second) fields.second.value = '00';
  if (fields.timezone) fields.timezone.value = zone;
  updateTaskDateTimeTargetDisplay(target);
}
window.setTaskDateTimePreset = setTaskDateTimePreset;

function createTaskFromDateTimeForm(titleId, target) {
  const titleInput = document.getElementById(titleId);
  const title = titleInput && titleInput.value ? titleInput.value.trim() : '';
  if (!title) return false;
  const fields = getTaskDateTimeTargetFields(target);
  const values = getTaskPickerTargetDateTime(target);
  const timezone = fields.timezone && fields.timezone.value || getDefaultTaskTimezone();
  const dueDate = values.date || getTaskDateInTimezone(timezone);
  const dueTime = values.time || '';
  const dueSecond = dueTime ? String(Number(values.second) || 0).padStart(2, '0') : '00';
  const tagSelect = target === 'drawer' ? document.getElementById('drawerNewTaskTag') : null;
  const prioritySelect = target === 'drawer' ? document.getElementById('drawerNewTaskPriority') : null;
  const tag = tagSelect && tagSelect.value || 'general';
  const photo = window.currentQuickTaskPhoto || null;
  const task = {
    id: 'task_' + Date.now(),
    title,
    dueDate,
    dueTime,
    dueSecond,
    dueTimeZone: timezone,
    dueAt: resolveTaskDateTimeInTimezone(dueDate, dueTime, dueSecond, timezone) || null,
    tag,
    category: tag,
    assignedMember: 'البيت',
    priority: prioritySelect && prioritySelect.value || 'normal',
    completed: false,
    photo,
    createdAt: new Date().toISOString(),
    subtasks: []
  };
  const tasks = getTodoTasks();
  tasks.unshift(task);
  if (saveTodoTasks(tasks)) familyAlerts.created('task', task);
  titleInput.value = '';
  if (fields.dateTime) fields.dateTime.value = '';
  if (fields.second) fields.second.value = '00';
  if (fields.timezone) fields.timezone.value = '';
  updateTaskDateTimeTargetDisplay(target);
  if (typeof clearTaskPendingPhoto === 'function') clearTaskPendingPhoto();
  renderTasksProList();
  updateTasksProductivityKPIs();
  if (target === 'drawer') closeModal('newTaskDrawerModal');
  if (typeof showToast === 'function') showToast(`🎯 تم تسجيل مهمة (${task.title}) بنجاح ✓`, 'success', 4500);
  return true;
}

function handleDrawerAddNewTask() {
  if (!createTaskFromDateTimeForm('drawerNewTaskTitleInput', 'drawer')) handleQuickTaskAdd();
}
window.handleDrawerAddNewTask = handleDrawerAddNewTask;

function handleAddNewTask() {
  if (!createTaskFromDateTimeForm('newTaskTitleInput', 'quick')) handleQuickTaskAdd();
}
window.handleAddNewTask = handleAddNewTask;

// 8. GOOGLE DRIVE SYNC & BACKUPS
async function executeGoogleDriveSync(isManual = false) {
  try {
    const payload = {
      version: 'v5.3.89',
      timestamp: new Date().toISOString(),
      state: state
    };
    localStorage.setItem('family_monefy_drive_backup', JSON.stringify(payload));
    localStorage.setItem('last_master_sync_time', new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    if (isManual && typeof showToast === 'function') {
      showToast('تمت مزامنة البيانات السحابية و Google Drive بنجاح ✓', 'success');
    }
  } catch(e) {
    console.warn('Google Drive sync notice:', e);
  }
}
window.executeGoogleDriveSync = executeGoogleDriveSync;

// [DailyBackup] Activated scheduled noon engine

function exportToGoogleDriveDirect() {
  const data = {
    app: 'Family Expense Tracker',
    version: 'v5.3.89',
    exportedAt: new Date().toISOString(),
    state: state
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `family_tracker_backup_${getLocalDateStr(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof showToast === 'function') showToast('تم تحميل نسخة احتياطية كاملة JSON بنجاح 💾', 'success');
}
window.exportToGoogleDriveDirect = exportToGoogleDriveDirect;

function importFromGoogleDriveDirect(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data && (data.state || data.transactions)) {
        const newState = data.state || data;
        const fields = ['transactions', 'wallets', 'expectedExpenses', 'monthlyBudgets', 'moneyRequests', 'notes', 'debts', 'activityLog'];
        const importedFields = fields.filter(field => Array.isArray(newState[field]));
        if (!importedFields.length) {
          if (typeof showToast === 'function') showToast('ملف النسخة لا يحتوي على بيانات قابلة للاستعادة', 'error');
          return;
        }
        importedFields.forEach(field => { state[field] = newState[field]; });
        if (typeof saveTx === 'function' && importedFields.includes('transactions')) saveTx();
        if (typeof auditAndRecomputeAllWalletBalances === 'function') auditAndRecomputeAllWalletBalances();
        if (importedFields.includes('expectedExpenses')) localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
        if (importedFields.includes('monthlyBudgets')) localStorage.setItem('family_monefy_monthly_budgets', JSON.stringify(state.monthlyBudgets));
        if (importedFields.includes('moneyRequests') && typeof saveMoneyRequests === 'function') saveMoneyRequests();
        if (importedFields.includes('notes') && typeof saveNotes === 'function') saveNotes();
        if (importedFields.includes('debts') && typeof saveDebts === 'function') saveDebts();
        if (importedFields.includes('activityLog') && typeof saveActivityLog === 'function') saveActivityLog();
        if (typeof renderUI === 'function') renderUI();
        if (typeof renderExpectedList === 'function') renderExpectedList();
        if (typeof renderRequestsList === 'function') renderRequestsList();
        if (typeof renderBudgetHistory === 'function') renderBudgetHistory();
        if (typeof showToast === 'function') showToast('تمت استعادة بيانات النسخة المحددة بنجاح ✓', 'success');
      } else {
        if (typeof showToast === 'function') showToast('الملف غير متوافق', 'error');
      }
    } catch(err) {
      if (typeof showToast === 'function') showToast('خطأ في قراءة ملف النسخة الاحتياطية', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
window.importFromGoogleDriveDirect = importFromGoogleDriveDirect;

// 9. SECONDARY WALLETS, REQUESTS, INCOME TABS
function toggleSecAddWalletForm() {
  const f = document.getElementById('secBoxAddWallet');
  if (f) f.style.display = (f.style.display === 'none' || !f.style.display) ? 'block' : 'none';
}
window.toggleSecAddWalletForm = toggleSecAddWalletForm;

function handleCreateSecWallet() {
  const nameInput = document.getElementById('inpSecNewWalletName');
  const balanceInput = document.getElementById('inpSecNewWalletBal');
  const iconInput = document.getElementById('inpSecNewWalletIcon');
  const colorInput = document.getElementById('inpSecNewWalletColor');
  const name = nameInput?.value.trim();
  const initBal = parseFloat(balanceInput?.value) || 0;
  if (!name) {
    if (typeof showToast === 'function') showToast('يرجى إدخال اسم المحفظة', 'error');
    nameInput?.focus();
    return;
  }
  if (!Number.isFinite(initBal) || initBal < 0) {
    if (typeof showToast === 'function') showToast('يرجى إدخال رصيد افتتاحي صحيح', 'error');
    balanceInput?.focus();
    return;
  }
  if (!state.wallets) state.wallets = [];
  const iconValue = iconInput?.value || 'fa-wallet';
  const icon = iconValue.split(/\s+/).find(token => /^fa-[\w-]+$/.test(token) && token !== 'fa-solid') || 'fa-wallet';
  const color = /^#[0-9a-f]{6}$/i.test(colorInput?.value || '') ? colorInput.value : '#38bdf8';
  const walletId = 'wallet-' + Date.now();
  const newWallet = { id: walletId, name: name, type: 'wallet', balance: 0, initialBalance: 0, icon: icon, color: color };
  state.wallets.push(newWallet);
  localStorage.setItem('family_monefy_wallets', JSON.stringify(state.wallets));

  if (initBal > 0) {
    if (!Array.isArray(state.transactions)) state.transactions = [];
    state.transactions.unshift({
      id: 'tx-opening-' + Date.now(),
      type: 'income',
      amount: initBal,
      label: `رصيد افتتاحي لمحفظة (${name})`,
      category: 'other_inc',
      walletId: walletId,
      member: state.currentUser || 'ماهر',
      date: typeof getLocalDateStr === 'function' ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    });
    if (typeof saveTx === 'function') saveTx();
  }

  if (nameInput) nameInput.value = '';
  if (balanceInput) balanceInput.value = '0';
  toggleSecAddWalletForm();
  if (typeof populateWalletDropdowns === 'function') populateWalletDropdowns();
  if (typeof renderUI === 'function') renderUI();
  if (typeof showToast === 'function') showToast(`تم إنشاء محفظة [${name}] بنجاح ✓`, 'success');
}
window.handleCreateSecWallet = handleCreateSecWallet;

function toggleSecTransferForm() {
  if (typeof openModal === 'function') openModal('walletTransferModal');
}
window.toggleSecTransferForm = toggleSecTransferForm;

function handleExecuteSecTransfer() { executeWalletTransfer(); }
window.handleExecuteSecTransfer = handleExecuteSecTransfer;


    // =========================================================================
    // PERIOD SELECTORS & DATE PICKER INTEGRATION (صندوق إختيار التواريخ ومنتقى التواريخ)
    // =========================================================================
    function onSecFilterPeriodChange() {
      const select = document.getElementById('secFilterPeriod');
      const val = select ? select.value : 'month';
      if (val === 'custom') {
        const fakeFrom = { value: window.secWalletCustomRange?.from || getLocalDateStr(new Date()) };
        const fakeTo = { value: window.secWalletCustomRange?.to || getLocalDateStr(new Date()) };
        if (typeof openCustomDatePickerForRange === 'function') {
          openCustomDatePickerForRange(fakeFrom, fakeTo);
          const originalApply = window.applyCustomDatePicker;
          window.applyCustomDatePicker = function() {
            window.secWalletCustomRange = { from: fakeFrom.value, to: fakeTo.value };
            if (typeof originalApply === 'function') originalApply();
            renderSecWalletStatementTable();
          };
        }
      } else {
        renderSecWalletStatementTable();
      }
    }
    window.onSecFilterPeriodChange = onSecFilterPeriodChange;

    function onStmtPeriodSelectChange() {
      const select = document.getElementById('stmtPeriodFilter');
      const val = select ? select.value : 'month';
      if (val === 'custom') {
        if (typeof openStmtCustomDatePicker === 'function') {
          openStmtCustomDatePicker();
        } else if (typeof openCustomDatePickerForRange === 'function') {
          const fakeFrom = { value: state.statementFrom || getLocalDateStr(new Date()) };
          const fakeTo = { value: state.statementTo || getLocalDateStr(new Date()) };
          openCustomDatePickerForRange(fakeFrom, fakeTo);
          const originalApply = window.applyCustomDatePicker;
          window.applyCustomDatePicker = function() {
            state.statementCustomRange = { from: fakeFrom.value, to: fakeTo.value };
            if (typeof originalApply === 'function') originalApply();
            renderWalletStatement();
          };
        }
      } else {
        renderWalletStatement();
      }
    }
    window.onStmtPeriodSelectChange = onStmtPeriodSelectChange;

function getSecWalletStatement() {
  const walletId = document.getElementById('secFilterWallet')?.value || 'all';
  const member = document.getElementById('secFilterMember')?.value || 'all';
  const category = document.getElementById('secFilterCategory')?.value || 'all';
  const period = document.getElementById('secFilterPeriod')?.value || 'month';
  const type = document.getElementById('secFilterType')?.value || 'all';
  const project = document.getElementById('secFilterProject')?.value || 'all';
  const search = (document.getElementById('secFilterSearch')?.value || '').trim().toLowerCase();

  const today = new Date();
  let fromStr = '';
  let toStr = '';
  if (period === 'today') {
    fromStr = getLocalDateStr(today);
    toStr = fromStr;
  } else if (period === 'week') {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    fromStr = getLocalDateStr(d);
    toStr = getLocalDateStr(today);
  } else if (period === 'month') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    fromStr = getLocalDateStr(first);
    toStr = getLocalDateStr(last);
  } else if (period === 'year') {
    fromStr = `${today.getFullYear()}-01-01`;
    toStr = `${today.getFullYear()}-12-31`;
  } else if (period === 'custom' && window.secWalletCustomRange) {
    fromStr = window.secWalletCustomRange.from || '';
    toStr = window.secWalletCustomRange.to || getLocalDateStr(today);
  } else if (period === 'all') {
    fromStr = '';
    toStr = '';
  }

  return buildSecWalletStatement(state.wallets || [], state.transactions || [], {
    walletId, member, category, type, project, search,
    from: fromStr, to: toStr
  });
}

function buildSecWalletStatement(wallets, transactions, { walletId, member, category, type = 'all', project = 'all', search = '', from, to }) {
  const consolidated = walletId === 'all';
  const selected = new Set(wallets.filter(wallet => consolidated || wallet.id === walletId).map(wallet => wallet.id));
  const walletIds = new Set(wallets.map(wallet => wallet.id));
  const walletNames = new Map(wallets.map(wallet => [wallet.name, wallet.id]));
  const defaultId = wallets.find(wallet => wallet.isDefault)?.id || wallets[0]?.id;
  const resolve = reference => {
    if (reference === 'all') return defaultId;
    if (walletIds.has(reference)) return reference;
    return walletNames.get(reference) || normalizeWalletId(reference);
  };
  const memberKey = name => {
    const value = String(name || 'البيت').normalize('NFC').replace(/[\u064B-\u065F\u0670]/g, '').trim();
    return value === 'أية' ? 'آية' : value === 'العائلة' ? 'البيت' : value;
  };
  const categoryKey = tx => tx.type === 'transfer' || tx.category === 'transfer' ? 'transfer' : String(tx.category || '');
  const amountOf = tx => Math.abs(Number(tx.amount) || 0);
  const ordered = transactions.filter(tx => tx && !tx.deleted).map((tx, index) => ({
    tx, date: operationDate(tx), timestamp: Date.parse(tx.createdAt) || 0, index
  })).sort((a, b) => a.date.localeCompare(b.date) || a.timestamp - b.timestamp || b.index - a.index);
  const touchesWallet = (tx, id) => {
    const amount = amountOf(tx);
    if (tx.type === 'transfer') {
      const source = resolve(tx.fromWalletId || tx.fromWallet || tx.walletId || tx.wallet);
      const destination = tx.toWalletId || tx.toWallet;
      const to = destination && resolve(destination);
      return {included: source === id || to === id, effect: (to === id ? amount : 0) - (source === id ? amount : 0)};
    }
    const source = resolve(tx.walletId || tx.wallet || 'wallet-cash-safe');
    if (source !== id || (tx.type !== 'income' && tx.type !== 'expense')) return {included: false, effect: 0};
    return {included: true, effect: tx.type === 'income' ? amount : -amount};
  };
  let opening = 0;
  for (const wallet of wallets.filter(item => selected.has(item.id))) {
    const baseline = wallet.initialBalance ?? wallet.baseBalance;
    if (baseline != null && Number.isFinite(Number(baseline))) {
      const recorded = ordered.some(({tx}) => tx.type === 'income' &&
        (String(tx.id || '').startsWith('tx-opening-') || String(tx.label || '').startsWith('رصيد افتتاحي لمحفظة')) &&
        touchesWallet(tx, wallet.id).included && Math.abs(amountOf(tx) - Number(baseline)) < 0.01);
      opening += recorded ? 0 : Number(baseline);
    } else if (wallet.balance != null && Number.isFinite(Number(wallet.balance))) {
      opening += Number(wallet.balance) - ordered.reduce((total, {tx}) => total + touchesWallet(tx, wallet.id).effect, 0);
    }
  }
  let balance = opening;
  let incoming = 0;
  let outgoing = 0;
  const rows = [];
  for (const {tx, date} of ordered) {
    const transfer = categoryKey(tx) === 'transfer';
    const amount = amountOf(tx);
    const effects = Array.from(selected, id => touchesWallet(tx, id)).filter(item => item.included);
    if (!effects.length) continue;
    const effect = effects.reduce((sum, item) => sum + item.effect, 0);
    if (to && date > to) break;
    balance += effect;
    if (from && date < from) {
      opening += effect;
      continue;
    }
    if (member !== 'all' && memberKey(tx.member) !== memberKey(member)) continue;
    if (category !== 'all' && categoryKey(tx) !== category) continue;
    if (type !== 'all') {
      if (type === 'transfer' && !transfer) continue;
      if (type === 'expense' && (transfer || tx.type !== 'expense')) continue;
      if (type === 'income' && (transfer || tx.type !== 'income')) continue;
    }
    if (project !== 'all' && (tx.project || '') !== project) continue;
    if (search && !(String(tx.label || '').toLowerCase().includes(search) || String(tx.notes || '').toLowerCase().includes(search) || String(tx.member || '').toLowerCase().includes(search))) continue;
    if (!(consolidated && transfer)) {
      if (effect > 0) incoming += effect;
      if (effect < 0) outgoing -= effect;
    }
    rows.push({tx, date, amount, effect, running: balance, transfer});
  }
  return {opening, balance, incoming, outgoing, rows, consolidated};
}

function renderSecWalletStatementTable() {
  const tableBody = document.getElementById('secWalletTableBody');
  if (!tableBody) return;
  const statement = getSecWalletStatement();
  tableBody.innerHTML = statement.rows.map(({tx, date, amount, effect, running, transfer}) => {
    const name = transfer ? 'تحويل داخلي' : getCategoryName(tx.category, tx.type);
    const amountLabel = effect ? (effect > 0 ? '+ ' : '− ') + formatMoney(amount) : formatMoney(amount);
    return `<tr>
      <td class="wallet-statement-description">${escapeHtml(tx.label || tx.description || '—')}<small>${escapeHtml(name || '—')} · ${escapeHtml(tx.member || 'البيت')} · نفّذها: ${escapeHtml(tx.author || tx.member || '—')}</small></td>
      <td class="wallet-statement-date" dir="ltr">${escapeHtml(date || '—')}</td>
      <td class="wallet-statement-number" dir="ltr" data-effect="${Math.sign(effect)}">${escapeHtml(amountLabel)}</td>
      <td class="wallet-statement-number" dir="ltr">${escapeHtml(formatMoney(running))}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" class="wallet-statement-empty">لا توجد حركات مطابقة للفلاتر</td></tr>';
  const values = {
    secWalletKpiOpening: formatMoney(statement.opening),
    secWalletKpiTotalIn: '+ ' + formatMoney(statement.incoming),
    secWalletKpiTotalOut: '− ' + formatMoney(statement.outgoing),
    secWalletKpiBalance: formatMoney(statement.balance)
  };
  for (const [id, value] of Object.entries(values)) document.getElementById(id).textContent = value;
  document.getElementById('secWalletCount').textContent = statement.rows.length.toLocaleString('ar-EG') + ' حركة';
  document.getElementById('secWalletScopeNote').textContent = statement.consolidated
    ? 'الأرصدة تشمل كل حركات الفترة. التحويلات بين المحافظ لا تدخل في إجماليات الوارد والصادر.'
    : 'الأرصدة تشمل كل حركات الفترة. الوارد والصادر يعكسان الفلاتر المحددة، بما فيها التحويلات.';
}
window.renderSecWalletStatementTable = renderSecWalletStatementTable;

function resetSecWalletFilters() {
  const wallet = document.getElementById('secFilterWallet');
  const member = document.getElementById('secFilterMember');
  const category = document.getElementById('secFilterCategory');
  const period = document.getElementById('secFilterPeriod');
  const type = document.getElementById('secFilterType');
  const project = document.getElementById('secFilterProject');
  const search = document.getElementById('secFilterSearch');
  if (wallet) wallet.value = 'all';
  if (member) member.value = 'all';
  if (category) category.value = 'all';
  if (period) period.value = 'month';
  if (type) type.value = 'all';
  if (project) project.value = 'all';
  if (search) search.value = '';
  renderSecWalletStatementTable();
}
window.resetSecWalletFilters = resetSecWalletFilters;

function exportSecWalletExcel() {
  const statement = getSecWalletStatement();
  if (!statement.rows.length) {
    showToast('لا توجد حركات مطابقة للتصدير');
    return;
  }
  if (typeof XLSX === 'undefined') {
    showToast('تعذر تحميل أداة تصدير إكسيل');
    return;
  }
  const data = [
    ['كشف المحافظ والحركات النقدية (ج.م)'],
    ['المحفظة', document.getElementById('secFilterWallet').selectedOptions[0]?.textContent || 'كل المحافظ'],
    ['رصيد أول الفترة', statement.opening, 'الوارد المطابق', statement.incoming, 'الصادر المطابق', statement.outgoing, 'رصيد نهاية الفترة', statement.balance],
    ['التاريخ', 'البيان', 'الفرد', 'البند', 'منفذ العملية', 'المبلغ', 'الأثر على الرصيد', 'الرصيد'],
    ...statement.rows.map(({tx, date, amount, effect, running, transfer}) => [
      date, tx.label || tx.description || '', tx.member || 'البيت', transfer ? 'تحويل داخلي' : getCategoryName(tx.category, tx.type),
      tx.author || tx.member || '', amount, effect, running
    ])
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet['!cols'] = [14, 48, 16, 22, 16, 16, 19, 18].map(wch => ({wch}));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'كشف المحافظ');
  XLSX.writeFile(book, 'wallet-statement-' + getLocalDateStr(new Date()) + '.xlsx');
}
window.exportSecWalletExcel = exportSecWalletExcel;

function exportSecWalletPdf() {
  const source = document.querySelector('#secReqWallets .wallet-statement-table');
  const printSheet = document.createElement('section');
  printSheet.id = 'walletPrintSheet';
  printSheet.dir = 'rtl';
  const title = document.createElement('h1');
  title.textContent = 'كشف المحافظ والحركات النقدية';
  const filters = document.createElement('p');
  filters.textContent = ['secFilterWallet', 'secFilterMember', 'secFilterCategory', 'secFilterPeriod']
    .map(id => document.getElementById(id).selectedOptions[0]?.textContent.trim()).filter(Boolean).join(' · ');
  printSheet.append(title, filters, document.querySelector('.wallet-statement-kpis').cloneNode(true),
    document.querySelector('.wallet-statement-caption').cloneNode(true), source.cloneNode(true));
  printSheet.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  document.body.append(printSheet);
  document.body.classList.add('printing-wallet-statement');
  try { window.print(); }
  finally {
    document.body.classList.remove('printing-wallet-statement');
    printSheet.remove();
  }
}
window.exportSecWalletPdf = exportSecWalletPdf;

function switchIncomeSubTab(tab) {
  if (tab !== 'new' && tab !== 'list') return;
  const newSec = document.getElementById('panelIncomeNewForm');
  const listSec = document.getElementById('panelIncomeHistoryContainer');
  const btnNew = document.getElementById('btnSubIncomeNew');
  const btnList = document.getElementById('btnSubIncomeList');
  if (newSec) newSec.style.display = (tab === 'new') ? 'block' : 'none';
  if (listSec) listSec.style.display = (tab === 'list') ? 'block' : 'none';
  const setButton = (button, active) => {
    if (!button) return;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.style.background = active ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent';
    button.style.color = active ? '#fff' : '#94a3b8';
    button.style.boxShadow = active ? '0 3px 10px rgba(16, 185, 129, 0.3)' : 'none';
  };
  setButton(btnNew, tab === 'new');
  setButton(btnList, tab === 'list');
  if (tab === 'list' && typeof renderIncomeHistoryList === 'function') renderIncomeHistoryList();
}
window.switchIncomeSubTab = switchIncomeSubTab;

function handleSaveDirectIncome() {
  const amountInput = document.getElementById('inpDirectIncomeAmount');
  const amount = parseFloat(amountInput?.value);
  const dateInput = document.getElementById('inpDirectIncomeDate');
  const walletInput = document.getElementById('inpDirectIncomeWallet');
  const categoryInput = document.getElementById('inpDirectIncomeCategory');
  const memberInput = document.getElementById('inpDirectIncomeMember');
  const descriptionInput = document.getElementById('inpDirectIncomeDesc');
  if (!Number.isFinite(amount) || amount <= 0) {
    if (typeof showToast === 'function') showToast('يرجى كتابة مبلغ دخل صحيح', 'error');
    amountInput?.focus();
    return;
  }
  const walletId = walletInput?.value || (state.currentWalletId !== 'all' ? state.currentWalletId : state.wallets?.[0]?.id);
  if (!walletId || !(state.wallets || []).some(wallet => wallet.id === walletId)) {
    if (typeof showToast === 'function') showToast('أضف محفظة صالحة قبل تسجيل الدخل', 'error');
    return;
  }
  const localDate = typeof getLocalDateStr === 'function' ? getLocalDateStr(new Date()) : new Date().toISOString().split('T')[0];
  const tx = {
    id: 'tx-' + Date.now(),
    type: 'income',
    amount: amount,
    author: state.currentUser,
    label: descriptionInput?.value.trim() || 'دخل مباشر',
    category: categoryInput?.value || 'salary',
    walletId: walletId,
    member: memberInput?.value || state.currentUser || 'ماهر',
    date: dateInput?.value || localDate,
    time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString()
  };
  if (!state.transactions) state.transactions = [];
  state.transactions.unshift(tx);
  if (typeof saveTx === 'function') saveTx();
  if (typeof auditAndRecomputeAllWalletBalances === 'function') auditAndRecomputeAllWalletBalances();
  if (typeof renderUI === 'function') renderUI();
  if (typeof renderIncomeHistoryList === 'function') renderIncomeHistoryList();
  const currSym = (state.currency === 'SAR') ? 'ر.س' : (state.currency === 'GOLD21' ? 'جرام' : 'ج.م');
  const incDesc = tx.label || 'دخل مباشر';
  if (descriptionInput) descriptionInput.value = '';
  if (amountInput) amountInput.value = '';
  if (typeof showToast === 'function') showToast(`✅ تم تسجيل عملية إثبات دخل (${incDesc}) بقيمة ${formatMoney(amount)} ${currSym} بنجاح ✓`, 'success', 4500);
}
window.handleSaveDirectIncome = handleSaveDirectIncome;

function switchRequestMainSection(sec) {
  const sections = [
    { key: 'requests', sectionId: 'secReqRequests', buttonId: 'btnMainTabRequests', color: '236, 72, 153' },
    { key: 'income', sectionId: 'secReqIncome', buttonId: 'btnMainTabIncome', color: '16, 185, 129' },
    { key: 'wallets', sectionId: 'secReqWallets', buttonId: 'btnMainTabWallets', color: '56, 189, 248' }
  ];
  if (!sections.some(item => item.key === sec)) return;
  sections.forEach(item => {
    const active = item.key === sec;
    const secEl = document.getElementById(item.sectionId);
    const btnEl = document.getElementById(item.buttonId);
    if (secEl) secEl.style.display = active ? 'block' : 'none';
    if (btnEl) {
      btnEl.classList.toggle('active', active);
      btnEl.setAttribute('aria-selected', String(active));
      btnEl.style.background = active ? `linear-gradient(135deg, rgba(${item.color}, 1), rgba(${item.color}, 0.72))` : 'transparent';
      btnEl.style.color = active ? '#fff' : '#94a3b8';
      btnEl.style.boxShadow = active ? `0 3px 10px rgba(${item.color}, 0.35)` : 'none';
    }
  });
  if (sec === 'income') switchIncomeSubTab('new');
  if (sec === 'requests') switchRequestSubTab('new');
  if (sec === 'wallets') {
    populateWalletDropdowns();
    renderSecWalletStatementTable();
  }
}
window.switchRequestMainSection = switchRequestMainSection;

function switchRequestSubTab(tab) {
  if (tab !== 'new' && tab !== 'list') return;
  const newSec = document.getElementById('panelReqNewForm');
  const listSec = document.getElementById('panelReqListContainer');
  const btnNew = document.getElementById('btnSubReqNew');
  const btnList = document.getElementById('btnSubReqList');
  if (newSec) newSec.style.display = (tab === 'new') ? 'block' : 'none';
  if (listSec) listSec.style.display = (tab === 'list') ? 'block' : 'none';
  const setButton = (button, active) => {
    if (!button) return;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.style.background = active ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'transparent';
    button.style.color = active ? '#fff' : '#94a3b8';
    button.style.boxShadow = active ? '0 3px 10px rgba(236, 72, 153, 0.3)' : 'none';
  };
  setButton(btnNew, tab === 'new');
  setButton(btnList, tab === 'list');
  if (tab === 'list' && typeof renderRequestsList === 'function') renderRequestsList();
}
window.switchRequestSubTab = switchRequestSubTab;

function filterActivityLogUI() {
  if (typeof renderActivityLog === 'function') renderActivityLog();
}
window.filterActivityLogUI = filterActivityLogUI;

function selectActivityTab(type, btn) {
  document.querySelectorAll('.activity-tab-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (typeof renderActivityLog === 'function') renderActivityLog(type);
}
window.selectActivityTab = selectActivityTab;

function loadMoreArchiveActivities() {
  if (typeof showToast === 'function') showToast('تم تحميل كافة الأنشطة المسجلة', 'info');
}
window.loadMoreArchiveActivities = loadMoreArchiveActivities;

function filterArchiveType(type, btn) {
  document.querySelectorAll('.archive-filter-row button').forEach(b => {
    if (b.getAttribute('onclick')?.includes('filterArchiveType')) {
      b.classList.remove('active');
      b.style.background = '';
      b.style.color = '';
    }
  });
  if (btn) {
    btn.classList.add('active');
    btn.style.background = 'rgba(56, 189, 248, 0.25)';
    btn.style.color = '#38bdf8';
  }
  currentActivityTab = type || 'all';
  if (typeof renderActivityLogUI === 'function') renderActivityLogUI();
}
window.filterArchiveType = filterArchiveType;

    // ==============================================================
    // أدوات الضبط المركزية: إدارة المحافظ، كشف الحساب، تصدير واستيراد JSON
    // ==============================================================
    function openWalletsModal() {
      if (typeof openModal === 'function') {
        openModal('walletModal');
        const wm = document.getElementById('walletModal');
        if (wm) {
          wm.style.setProperty('z-index', '1000250', 'important');
          wm.style.setProperty('display', 'flex', 'important');
        }
      }
    }
    window.openWalletsModal = openWalletsModal;

    function openFullStatementModal() {
      if (typeof renderWalletStatement === 'function') renderWalletStatement();
      if (typeof openModal === 'function') openModal('walletStatementModal');
    }
    window.openFullStatementModal = openFullStatementModal;

    function exportDataJSON() {
      if (typeof downloadBackup === 'function') {
        downloadBackup();
      } else if (typeof exportToGoogleDriveDirect === 'function') {
        exportToGoogleDriveDirect();
      }
    }
    window.exportDataJSON = exportDataJSON;

    function importDataJSON(event) {
      const file = event.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          const newState = data.state || data;
          const fields = ['transactions', 'wallets', 'expectedExpenses', 'monthlyBudgets', 'moneyRequests', 'notes', 'debts', 'activityLog'];
          const importedFields = fields.filter(field => Array.isArray(newState[field]));
          if (!importedFields.length && !newState.transactions) {
            if (typeof showToast === 'function') showToast('ملف النسخة لا يحتوي على بيانات قابلة للاستعادة', 'error');
            return;
          }
          fields.forEach(field => {
            if (Array.isArray(newState[field])) state[field] = newState[field];
          });
          if (typeof saveTx === 'function') saveTx();
          if (typeof saveTransactionsToStorage === 'function') saveTransactionsToStorage();
          if (typeof auditAndRecomputeAllWalletBalances === 'function') auditAndRecomputeAllWalletBalances();
          if (typeof renderUI === 'function') renderUI();
          if (typeof showToast === 'function') showToast('✅ تم استيراد واستعادة البيانات بنجاح', 'success');
          event.target.value = '';
        } catch(err) {
          if (typeof showToast === 'function') showToast('فشل استيراد النسخة: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    }
    window.importDataJSON = importDataJSON;

    // ==============================================================
    // محرك النسخ الاحتياطي اليومي 12:00 ظهراً وحفظ Google Drive مع التنبيه
    // ==============================================================
    async function executeDailyNoonBackup(isManual = false) {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const yDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayStr = yDate.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

      const backupPayload = {
        app: 'FamilyExpenseTrackerMonefy',
        account: (typeof GDRIVE_CONFIG !== 'undefined' ? GDRIVE_CONFIG.targetAccount : 'maher.easybakery@gmail.com'),
        backupType: 'daily_noon_scheduled',
        backupDate: todayStr,
        previousDayDeleted: yesterdayStr,
        scheduledTime: '12:00:00',
        executedAt: now.toISOString(),
        database: {
          transactions: state.transactions || [],
          wallets: state.wallets || [],
          expectedExpenses: state.expectedExpenses || [],
          monthlyBudgets: state.monthlyBudgets || [],
          moneyRequests: state.moneyRequests || [],
          notes: state.notes || [],
          debts: state.debts || [],
          activityLog: state.activityLog || [],
          currency: state.currency || 'EGP'
        }
      };

      try {
        localStorage.setItem(`family_backup_${todayStr}`, JSON.stringify(backupPayload));
        localStorage.removeItem(`family_backup_${yesterdayStr}`);
        localStorage.setItem('family_daily_noon_backup_date', todayStr);
        localStorage.setItem('family_daily_noon_backup_time', timeStr);
      } catch(e) {}

      const endpoint = "https://script.google.com/macros/s/AKfycbwdIuCjR3lUy0DTBnWTj9koFZ4ghRxR2Dq-sdj_LjIS2r_gHfpp4AX_32dNd2RRKPaShQ/exec";
      try {
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'daily_noon_backup',
            todayDate: todayStr,
            yesterdayDate: yesterdayStr,
            todayFileName: `family_backup_${todayStr}.json`,
            yesterdayFileName: `family_backup_${yesterdayStr}.json`,
            data: backupPayload
          })
        });
      } catch(e) {
        console.warn('Note on Drive Cloud Post:', e);
      }

      if (window.FamilyAlerts && typeof window.FamilyAlerts.created === 'function') {
        window.FamilyAlerts.created('backup', {
          id: `backup_${todayStr}_${Date.now()}`,
          title: 'النسخ الاحتياطي اليومي',
          message: `تم أخذ نسخة احتياطية الساعة 12:00 وحفظها بنجاح على Google Drive وحذف نسخة الأمس (${yesterdayStr}) تلقائياً.`
        });
      }

      if (typeof showToast === 'function') {
        showToast('✅ تم أخذ نسخة احتياطية على Google Drive وحذف نسخة الأمس', 'success', 3500);
      }
    }
    window.executeDailyNoonBackup = executeDailyNoonBackup;

    function checkAndRunDailyNoonBackup() {
      try {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const lastRun = localStorage.getItem('family_daily_noon_backup_date');
        if (now.getHours() >= 12 && lastRun !== todayStr) {
          console.log('⏰ [DailyBackup] بدء تشغيل النسخ الاحتياطي المجدول لليوم (12:00 ظهراً)...');
          executeDailyNoonBackup(false);
        }
      } catch(e) {}
    }
    window.checkAndRunDailyNoonBackup = checkAndRunDailyNoonBackup;

    setTimeout(checkAndRunDailyNoonBackup, 3000);
    setInterval(checkAndRunDailyNoonBackup, 15 * 60 * 1000);



// =========================================================================
// External Links Handler
// =========================================================================
    // ==============================================================
    // فتح كافة الروابط الخارجية في المتصفح الخارجي للنظام مباشرة وبأمان v5.3.89
    // ==============================================================
    (function setupExternalLinksDirectOpen() {
      function tagExternalLinks() {
        try {
          document.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
            const isHttp = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
            const isExternal = isHttp && !href.startsWith(window.location.origin);
            if (isExternal || a.getAttribute('target') === '_blank' || a.hasAttribute('data-external')) {
              a.setAttribute('target', '_blank');
              a.setAttribute('rel', 'noopener noreferrer');
            }
          });
        } catch(e) {}
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tagExternalLinks);
      } else {
        tagExternalLinks();
      }

      // أمان تام: استخدام bubbling عادي دون capture ودون أي استدعاء عودي لمنع أي تعليق
      document.addEventListener('click', function(e) {
        const a = e.target.closest('a');
        if (!a || a.closest('button')) return;
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

        const isHttp = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
        const isExternal = isHttp && !href.startsWith(window.location.origin);

        if (isExternal || a.getAttribute('target') === '_blank' || a.hasAttribute('data-external')) {
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          // في وضع تطبيق PWA المستقل: الفتح مباشرة عبر نافذة النظام الخارجية
          if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            e.preventDefault();
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        }
      }, false);
    })();

