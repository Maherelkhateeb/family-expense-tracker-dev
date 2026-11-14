import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

script_end = html.rfind('</script>')

commitments_controller_js = '''
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
        const dateInp = document.getElementById('inpUnifiedCommitmentDueDate');
        if (dateInp && !dateInp.value) {
          dateInp.value = getLocalDateStr(new Date());
        }
        const titleInp = document.getElementById('inpUnifiedCommitmentTitle');
        if (titleInp) titleInp.focus();
      }
    }

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

    function handleUnifiedBillPhotoUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        window.currentUnifiedBillPhoto = e.target.result;
        const previewRow = document.getElementById('unifiedBillPhotoPreviewRow');
        const previewImg = document.getElementById('unifiedBillPhotoPreviewImg');
        if (previewImg) previewImg.src = e.target.result;
        if (previewRow) previewRow.style.display = 'flex';
        showToast('📷 تم التقاط وإرفاق صورة الفاتورة');
      };
      reader.readAsDataURL(file);
    }

    function clearUnifiedBillPhoto() {
      window.currentUnifiedBillPhoto = null;
      const previewRow = document.getElementById('unifiedBillPhotoPreviewRow');
      const previewImg = document.getElementById('unifiedBillPhotoPreviewImg');
      if (previewRow) previewRow.style.display = 'none';
      if (previewImg) previewImg.src = '';
    }

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
        photo: isBill ? window.currentUnifiedBillPhoto : null,
        notes: notes,
        status: 'upcoming',
        author: state.currentUser || 'ماهر',
        createdAt: new Date().toISOString()
      };

      state.expectedExpenses.unshift(newCommitment);
      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}

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

    function renderCommitmentsPageUI() {
      if (!state.expectedExpenses || !Array.isArray(state.expectedExpenses)) {
        state.expectedExpenses = [];
      }

      const allItems = state.expectedExpenses;
      const nowStr = getLocalDateStr(new Date());

      // فصل الفواتير عن الديون
      const bills = allItems.filter(e => e.type === 'upcoming_bill' || e.type === 'bill' || e.isBill);
      const debts = allItems.filter(e => e.type === 'debt_on_us' || e.type === 'debt_for_us' || e.type === 'debt');

      // تحديث عدادات التبويب الرئيسي
      const bBillsCount = document.getElementById('badgeCountBillsTab');
      const bDebtsCount = document.getElementById('badgeCountDebtsTab');
      if (bBillsCount) bBillsCount.textContent = bills.filter(b => b.status !== 'paid').length;
      if (bDebtsCount) bDebtsCount.textContent = debts.filter(d => d.status !== 'paid').length;

      const curr = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : (state.currency || 'ج.م');

      // تحديث المركز المالي الذكي
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

      if (activeCommitmentSubSection === 'bills') {
        let upcomingBillsAmt = 0, upcomingBillsCnt = 0;
        let paidBillsAmt = 0, paidBillsCnt = 0;
        let overdueBillsAmt = 0, overdueBillsCnt = 0;

        bills.forEach(b => {
          const amt = Number(b.amount) || 0;
          if (b.status === 'paid') {
            paidBillsAmt += amt;
            paidBillsCnt++;
          } else {
            upcomingBillsAmt += amt;
            upcomingBillsCnt++;
            if (b.dueDate && b.dueDate < nowStr) {
              overdueBillsAmt += amt;
              overdueBillsCnt++;
            }
          }
        });

        if (netIcon) netIcon.className = 'fa-solid fa-file-invoice';
        if (netLabel) netLabel.textContent = 'إجمالي الفواتير القادمة المطلوب سدادها:';
        if (netValue) {
          netValue.innerHTML = `<span style="color: #ff4d6d; direction: rtl; display: inline-flex; align-items: center; gap: 4px;">- ${formatMoneyVal(upcomingBillsAmt)} <span style="font-size: 0.74rem;">${curr}</span></span>`;
        }

        if (c1Title) c1Title.textContent = '⚡ قادمة ومستحقة';
        if (c1Amt) c1Amt.textContent = formatMoneyVal(upcomingBillsAmt);
        if (c1Cnt) c1Cnt.textContent = `${upcomingBillsCnt} فاتورة`;

        if (c2Title) c2Title.textContent = '✅ مسددة ومصروفة';
        if (c2Amt) c2Amt.textContent = formatMoneyVal(paidBillsAmt);
        if (c2Cnt) c2Cnt.textContent = `${paidBillsCnt} مسددة`;

        if (c3Title) c3Title.textContent = '⚠️ متأخرة';
        if (c3Amt) c3Amt.textContent = formatMoneyVal(overdueBillsAmt);
        if (c3Cnt) c3Cnt.textContent = `${overdueBillsCnt} متأخرة`;

      } else {
        let debtsOnUsAmt = 0, debtsOnUsCnt = 0;
        let debtsForUsAmt = 0, debtsForUsCnt = 0;
        let debtsPaidAmt = 0, debtsPaidCnt = 0;

        debts.forEach(d => {
          const amt = Number(d.amount) || 0;
          if (d.status === 'paid') {
            debtsPaidAmt += amt;
            debtsPaidCnt++;
          } else if (d.type === 'debt_on_us' || d.type === 'debt') {
            debtsOnUsAmt += amt;
            debtsOnUsCnt++;
          } else if (d.type === 'debt_for_us') {
            debtsForUsAmt += amt;
            debtsForUsCnt++;
          }
        });

        const netDebt = debtsForUsAmt - debtsOnUsAmt;
        if (netIcon) netIcon.className = 'fa-solid fa-handshake';
        if (netLabel) netLabel.textContent = (netDebt >= 0) ? 'صافي ذمة الديون (فائض لنا عند الغير):' : 'صافي ذمة الديون (مستحق علينا للغير):';
        if (netValue) {
          const color = (netDebt >= 0) ? '#34d399' : '#ff4d6d';
          const sign = (netDebt >= 0) ? '+' : '-';
          netValue.innerHTML = `<span style="color: ${color}; direction: rtl; display: inline-flex; align-items: center; gap: 4px;">${sign} ${formatMoneyVal(Math.abs(netDebt))} <span style="font-size: 0.74rem;">${curr}</span></span>`;
        }

        if (c1Title) c1Title.textContent = '🔻 ديون علينا (واجبة السداد)';
        if (c1Amt) c1Amt.textContent = formatMoneyVal(debtsOnUsAmt);
        if (c1Cnt) c1Cnt.textContent = `${debtsOnUsCnt} ديون`;

        if (c2Title) c2Title.textContent = '🔺 ديون لنا (مستحقة التحصيل)';
        if (c2Amt) c2Amt.textContent = formatMoneyVal(debtsForUsAmt);
        if (c2Cnt) c2Cnt.textContent = `${debtsForUsCnt} ديون`;

        if (c3Title) c3Title.textContent = '🎯 مسددة بالكامل';
        if (c3Amt) c3Amt.textContent = formatMoneyVal(debtsPaidAmt);
        if (c3Cnt) c3Cnt.textContent = `${debtsPaidCnt} مسددة`;
      }

      renderCommitmentsBillsList();
      renderCommitmentsDebtsList();
    }

    function toggleSelectCommitmentRow(id) {
      window.selectedCommitmentRowId = (window.selectedCommitmentRowId === id) ? null : id;
      renderCommitmentsBillsList();
      renderCommitmentsDebtsList();
    }

    function renderCommitmentsBillsList() {
      const container = document.getElementById('billsListContentContainer');
      const countHeader = document.getElementById('billsTotalSubheaderTxt');
      if (!container) return;

      const allBills = (state.expectedExpenses || []).filter(e => e.type === 'upcoming_bill' || e.type === 'bill' || e.isBill);
      if (countHeader) countHeader.textContent = `${allBills.length} فاتورة مسجلة`;

      let list = allBills.slice();
      if (activeBillsFilterStatus === 'upcoming') {
        list = list.filter(b => b.status !== 'paid');
      } else if (activeBillsFilterStatus === 'paid') {
        list = list.filter(b => b.status === 'paid');
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
                  <div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
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

            <!-- درج الإجراءات السريعة للفاتورة (يفتح عند النقر) -->
            <div style="display: ${isSelected ? 'flex' : 'none'}; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.12);">
              ${!isPaid ? `
                <button type="button" onclick="event.stopPropagation(); payBillDirectly('${b.id}')" style="height: 30px; padding: 0 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 850; background: rgba(52, 211, 153, 0.20); border: 1px solid rgba(52, 211, 153, 0.45); color: #34d399; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                  <i class="fa-solid fa-check"></i>
                  <span>سداد وصرف الفاتورة</span>
                </button>
              ` : ''}
              ${b.photo ? `
                <button type="button" onclick="event.stopPropagation(); viewReceiptImage('${b.photo}')" style="height: 30px; padding: 0 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(236, 72, 153, 0.18); border: 1px solid rgba(236, 72, 153, 0.4); color: #f472b6; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                  <i class="fa-solid fa-image"></i>
                  <span>عرض الفاتورة</span>
                </button>
              ` : ''}
              <button type="button" onclick="event.stopPropagation(); deleteCommitmentItem('${b.id}')" style="height: 30px; padding: 0 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(244, 63, 94, 0.18); border: 1px solid rgba(244, 63, 94, 0.4); color: #f43f5e; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
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

      const allDebts = (state.expectedExpenses || []).filter(e => e.type === 'debt_on_us' || e.type === 'debt_for_us' || e.type === 'debt');
      if (countHeader) countHeader.textContent = `${allDebts.length} ديون مسجلة`;

      let list = allDebts.slice();
      if (activeDebtsFilterStatus === 'debt_on_us') {
        list = list.filter(d => (d.type === 'debt_on_us' || d.type === 'debt') && d.status !== 'paid');
      } else if (activeDebtsFilterStatus === 'debt_for_us') {
        list = list.filter(d => d.type === 'debt_for_us' && d.status !== 'paid');
      } else if (activeDebtsFilterStatus === 'paid') {
        list = list.filter(d => d.status === 'paid');
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
                  <div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
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

            <!-- شريط تقدم السداد للديون -->
            <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-top: 6px;">
              <div style="width: ${pct}%; height: 100%; background: ${isPaid ? '#34d399' : badgeColor}; border-radius: 3px;"></div>
            </div>

            <!-- درج إجراءات السداد والتسوية للديون -->
            <div style="display: ${isSelected ? 'flex' : 'none'}; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.12);">
              ${!isPaid ? `
                <button type="button" onclick="event.stopPropagation(); settleDebtPrompt('${d.id}', false)" style="height: 30px; padding: 0 11px; border-radius: 8px; font-size: 0.72rem; font-weight: 850; background: rgba(56, 189, 248, 0.18); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                  <i class="fa-solid fa-coins"></i>
                  <span>سداد جزء من الدين</span>
                </button>
                <button type="button" onclick="event.stopPropagation(); settleDebtPrompt('${d.id}', true)" style="height: 30px; padding: 0 11px; border-radius: 8px; font-size: 0.72rem; font-weight: 850; background: rgba(52, 211, 153, 0.20); border: 1px solid rgba(52, 211, 153, 0.45); color: #34d399; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                  <i class="fa-solid fa-check-double"></i>
                  <span>تسوية كاملة وإغلاق</span>
                </button>
              ` : ''}
              <button type="button" onclick="event.stopPropagation(); deleteCommitmentItem('${d.id}')" style="height: 30px; padding: 0 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; background: rgba(244, 63, 94, 0.18); border: 1px solid rgba(244, 63, 94, 0.4); color: #f43f5e; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-trash-can"></i>
                <span>حذف</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    function payBillDirectly(id) {
      const bill = (state.expectedExpenses || []).find(e => e.id === id);
      if (!bill) return;

      if (!confirm(`هل تريد تأكيد سداد وصرف [${bill.title || bill.label}] بمبلغ ${bill.amount} ج.م وإدراجه كمصروف فعلي في السجل؟`)) {
        return;
      }

      bill.status = 'paid';
      bill.paidAt = new Date().toISOString();

      // تسجيل حركة مصروف في سجل العمليات
      const newTx = {
        id: 'tx-' + Date.now(),
        type: 'expense',
        amount: Number(bill.amount) || 0,
        label: `سداد: ${bill.title || bill.label || 'فاتورة مستحقة'}`,
        category: bill.category || 'bills',
        member: bill.member || 'البيت',
        walletId: state.currentWalletId || 'cash',
        date: getLocalDateStr(new Date()),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        receipt: bill.photo || null,
        author: state.currentUser || 'ماهر',
        createdAt: new Date().toISOString()
      };

      if (!state.transactions) state.transactions = [];
      state.transactions.unshift(newTx);

      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
        localStorage.setItem('family_monefy_txs', JSON.stringify(state.transactions));
      } catch(e) {}

      playNotificationChime();
      renderUI();
      renderCommitmentsPageUI();
      showToast(`✅ تم سداد الفاتورة بنجاح وتسجيلها كمصروف فعلي: ${bill.amount} ج.م`);
    }

    function settleDebtPrompt(id, isFull = false) {
      const debt = (state.expectedExpenses || []).find(e => e.id === id);
      if (!debt) return;

      const amt = Number(debt.amount) || 0;
      const currentPaid = Number(debt.paidAmount) || 0;
      const remaining = Math.max(0, amt - currentPaid);

      if (isFull) {
        if (!confirm(`هل تريد تسوية وإغلاق هذا الدين بالكامل بمبلغ ${remaining} ج.م؟`)) return;
        debt.paidAmount = amt;
        debt.status = 'paid';
        debt.settledAt = new Date().toISOString();
      } else {
        const inp = prompt(`المبلغ المتبقي: ${remaining} ج.م\\nأدخل مبلغ الدفعة المسددة / المحصلة:`, remaining);
        if (!inp) return;
        const payAmt = parseFloat(inp);
        if (isNaN(payAmt) || payAmt <= 0) {
          showToast('⚠️ مبلغ غير صحيح', 'error');
          return;
        }
        debt.paidAmount = Math.min(amt, currentPaid + payAmt);
        if (debt.paidAmount >= amt) {
          debt.status = 'paid';
          debt.settledAt = new Date().toISOString();
        }
      }

      try {
        localStorage.setItem('family_monefy_expected', JSON.stringify(state.expectedExpenses));
      } catch(e) {}

      playNotificationChime();
      renderCommitmentsPageUI();
      showToast('✅ تم تسجيل سداد وتسوية الدين بنجاح');
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
'''

html = html[:script_end] + commitments_controller_js + html[script_end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved commitments master engine. File length:", len(html))
