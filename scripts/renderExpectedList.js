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

      const pillCntAll = document.getElementById('pillCountAll');
      const pillCntUp = document.getElementById('pillCountUpcoming');
      const pillCntDebOnUs = document.getElementById('pillCountDebtsOnUs');
      const pillCntDebForUs = document.getElementById('pillCountDebtsForUs');
      const pillCntPaid = document.getElementById('pillCountPaid');

      const badgeTab = document.getElementById('expectedPendingBadgeTab');
      const netLabel = document.getElementById('expectedNetPositionLabel');
      const netVal = document.getElementById('expectedNetPositionVal');

      if (!container) return;

      if (!state.expectedExpenses) state.expectedExpenses = [];

      // تنظيف وترقية البيانات القديمة إن وُجدت
      state.expectedExpenses.forEach(e => {
        if (e.type === 'debt') e.type = 'debt_on_us';
        if (!e.status) e.status = 'upcoming';
      });

      const memberFilter = document.getElementById('selExpectedMemberFilter')?.value || 'all';

      // 1. حساب الإجماليات بدقة محاسبية صارمة 0.00 ج.م
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

      if (elUp) elUp.textContent = formatMoney(totUpcoming);
      if (elDebOnUs) elDebOnUs.textContent = '- ' + formatMoney(totDebtsOnUs);
      if (elDebForUs) elDebForUs.textContent = '+ ' + formatMoney(totDebtsForUs);
      if (elPaid) elPaid.textContent = formatMoney(totPaid);

      const autoScaleKpi = (el) => {
        if (!el) return;
        const l = (el.textContent || '').length;
        if (l > 15) {
          el.style.fontSize = '0.70rem';
          el.style.letterSpacing = '-0.4px';
        } else if (l > 12) {
          el.style.fontSize = '0.78rem';
          el.style.letterSpacing = '-0.2px';
        } else {
          el.style.fontSize = '0.88rem';
          el.style.letterSpacing = '-0.1px';
        }
      };
      autoScaleKpi(elUp);
      autoScaleKpi(elDebOnUs);
      autoScaleKpi(elDebForUs);
      autoScaleKpi(elPaid);

      if (cntUp) cntUp.textContent = `${countUpcoming} بند`;
      if (cntDebOnUs) cntDebOnUs.textContent = `${countDebtsOnUs} بند`;
      if (cntDebForUs) cntDebForUs.textContent = `${countDebtsForUs} بند`;
      if (cntPaid) cntPaid.textContent = `${countPaid} مكتمل`;

      if (pillCntAll) pillCntAll.textContent = state.expectedExpenses.length;
      if (pillCntUp) pillCntUp.textContent = countUpcoming;
      if (pillCntDebOnUs) pillCntDebOnUs.textContent = countDebtsOnUs;
      if (pillCntDebForUs) pillCntDebForUs.textContent = countDebtsForUs;
      if (pillCntPaid) pillCntPaid.textContent = countPaid;

      const totalPendingCount = countUpcoming + countDebtsOnUs + countDebtsForUs;
      if (badgeTab) badgeTab.textContent = totalPendingCount;

      // صافي المركز المالي المستقبلي: (مصاريف قادمة + ديون علينا) - ديون لنا
      const netDue = (totUpcoming + totDebtsOnUs) - totDebtsForUs;
      if (netVal) {
        if (netDue > 0) {
          if (netLabel) netLabel.textContent = 'صافي الالتزامات المستقبلية المطلوب تدبيرها:';
          netVal.textContent = '- ' + formatMoney(netDue);
          netVal.style.color = '#f87171';
        } else if (netDue < 0) {
          if (netLabel) netLabel.textContent = 'صافي المركز إيجابي (فائض مستحق للتحصيل):';
          netVal.textContent = '+ ' + formatMoney(Math.abs(netDue));
          netVal.style.color = '#34d399';
        } else {
          if (netLabel) netLabel.textContent = 'صافي الالتزامات متوازن بالكامل:';
          netVal.textContent = '0.00 ج.م';
          netVal.style.color = '#38bdf8';
        }
      }

      // تحديث حالة كروت الـ KPI النشطة
      const cardUp = document.getElementById('cardExpUpcoming');
      const cardDebOnUs = document.getElementById('cardExpDebtsOnUs');
      const cardDebForUs = document.getElementById('cardExpDebtsForUs');
      const cardPaid = document.getElementById('cardExpPaid');

      if (cardUp) cardUp.classList.toggle('active-filter', state.expectedTypeFilter === 'upcoming_bill');
      if (cardDebOnUs) cardDebOnUs.classList.toggle('active-filter', state.expectedTypeFilter === 'debt_on_us');
      if (cardDebForUs) cardDebForUs.classList.toggle('active-filter', state.expectedTypeFilter === 'debt_for_us');
      if (cardPaid) cardPaid.classList.toggle('active-filter', state.expectedTypeFilter === 'paid');

      // 2. تطبيق التصفية الدقيقة على القائمة المعروضة
      let list = state.expectedExpenses.slice();

      // فلترة النوع
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

      // فلترة الشخص
      if (memberFilter !== 'all') {
        list = list.filter(e => e.member === memberFilter || (memberFilter === 'البيت' && (e.member === 'البيت' || e.member === 'العائلة')));
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 24px 10px; text-align: center;">
            <i class="fa-solid fa-calendar-check" style="color: #38bdf8; font-size: 2rem; margin-bottom: 8px; opacity: 0.6;"></i>
            <div class="empty-title" style="font-weight: 800; color: #cbd5e1;">لا توجد التزامات مطابقة للتصفية الحالية</div>
            <div class="empty-desc" style="font-size: 0.76rem; color: #64748b; margin-top: 4px;">يمكنك إضافة التزام جديد أو تغيير خيارات الفلترة لعرض باقي البنود</div>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-entry-card';

        let typeBadge = '';
        let amountHtml = '';
        if (item.type === 'upcoming_bill') {
          typeBadge = `<span class="period-active-pill" style="color: #fbbf24; background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.35);"><i class="fa-solid fa-receipt"></i> مصروف قادم</span>`;
          amountHtml = `<span style="color: #fbbf24; font-weight: 900; font-size: 1.05rem; direction: ltr; display: inline-block;">- ${formatMoney(item.amount)}</span>`;
        } else if (item.type === 'debt_on_us') {
          typeBadge = `<span class="period-active-pill" style="color: #f87171; background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.35);"><i class="fa-solid fa-arrow-down-long"></i> دين علينا</span>`;
          amountHtml = `<span style="color: #f87171; font-weight: 900; font-size: 1.05rem; direction: ltr; display: inline-block;">- ${formatMoney(item.amount)}</span>`;
        } else {
          typeBadge = `<span class="period-active-pill" style="color: #34d399; background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.35);"><i class="fa-solid fa-arrow-up-long"></i> دين لنا (تحصيل)</span>`;
          amountHtml = `<span style="color: #34d399; font-weight: 900; font-size: 1.05rem; direction: ltr; display: inline-block;">+ ${formatMoney(item.amount)}</span>`;
        }

        let priorityBadge = '';
        if (item.priority === 'urgent') {
          priorityBadge = `<span style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 2px 6px; border-radius: 6px; font-size: 0.65rem; font-weight: 800;"><i class="fa-solid fa-triangle-exclamation"></i> عاجل</span>`;
        }

        let statusBadge = '';
        if (item.status === 'paid') {
          statusBadge = `<span class="status-badge-approved"><i class="fa-solid fa-check-double"></i> مكتمل ومسدد</span>`;
        } else {
          statusBadge = `<span class="status-badge-pending"><i class="fa-solid fa-clock"></i> مستحق: ${item.dueDate || 'قريباً'}</span>`;
        }

        let photoBadge = '';
        if (item.photo) {
          photoBadge = `<button type="button" class="btn-item-action" onclick="openReceiptLightbox('${item.photo}', 'مستند: ${escapeHtml(item.title)}')" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; padding: 2px 7px; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="عرض المستند أو الفاتورة المرفقة"><i class="fa-solid fa-paperclip"></i> مستند مرفق 📷</button>`;
        }

        let actionBtns = '';
        if (item.status !== 'paid') {
          if (item.type === 'debt_for_us') {
            actionBtns = `
              <div class="item-entry-actions">
                <button class="btn-item-action btn-item-approve" onclick="openPayExpectedModal('${item.id}')" title="تسجيل تحصيل المبلغ وإيداعه في المحفظة" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border-color: rgba(16, 185, 129, 0.4);">
                  <i class="fa-solid fa-hand-holding-dollar"></i> تحصيل وإيداع بالمحفظة
                </button>
                <button class="btn-item-action btn-item-delete" onclick="deleteExpected('${item.id}')" title="حذف الالتزام">
                  <i class="fa-solid fa-trash-can"></i> حذف
                </button>
              </div>
            `;
          } else {
            actionBtns = `
              <div class="item-entry-actions">
                <button class="btn-item-action btn-item-approve" onclick="openPayExpectedModal('${item.id}')" title="تسجيل سداد الالتزام وخصمه من المحفظة">
                  <i class="fa-solid fa-circle-check"></i> سداد وصرف من المحفظة
                </button>
                <button class="btn-item-action btn-item-delete" onclick="deleteExpected('${item.id}')" title="حذف الالتزام">
                  <i class="fa-solid fa-trash-can"></i> حذف
                </button>
              </div>
            `;
          }
        } else {
          actionBtns = `
            <div class="item-entry-actions">
              <button class="btn-item-action btn-item-delete" onclick="deleteExpected('${item.id}')" title="حذف من السجل">
                <i class="fa-solid fa-trash-can"></i> حذف من السجل
              </button>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="item-entry-head" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              ${typeBadge}
              ${priorityBadge}
              <span style="font-weight: 800; font-size: 0.88rem; color: #f8fafc;">${escapeHtml(item.title)}</span>
            </div>
            ${statusBadge}
          </div>
          <div class="item-entry-body" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 0.74rem; color: #94a3b8; display: flex; align-items: center; gap: 8px;">
              <span>👤 يخص: <strong style="color: #cbd5e1;">${escapeHtml(item.member || 'البيت')}</strong></span>
              ${item.dueDate ? `<span>• 📅 الاستحقاق: <strong style="color: #38bdf8;">${item.dueDate}</strong></span>` : ''}
            </div>
            ${amountHtml}
          </div>
          ${(item.settleReceipt || item.photo) ? `
            <div style="margin: 4px 0 8px; display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn-item-action" onclick="openReceiptLightbox('${item.settleReceipt || item.photo}', 'إيصال/مستند: ${escapeHtml(item.title)}')" style="background: rgba(56, 189, 248, 0.18); color: #38bdf8; border: 1.2px solid rgba(56, 189, 248, 0.45); border-radius: 7px; padding: 4px 10px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;" title="عرض إيصال أو مستند السداد المرفق">
                <i class="fa-solid fa-file-invoice"></i> إيصال ومستند السداد 📷
              </button>
            </div>
          ` : ''}
          ${actionBtns}
        `;
        container.appendChild(card);
      });
    }

    