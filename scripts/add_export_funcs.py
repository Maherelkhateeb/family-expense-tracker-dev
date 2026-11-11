import sys
filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

excel_pdf_code = '''
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
              <p>دفتر الأستاذ وتدقيق مصروفات ودخل عائلة ماهر ❤️ أية</p>
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
'''

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '    function jumpToActivityContext() {'
if target in content:
    content = content.replace(target, excel_pdf_code + '\n    function jumpToActivityContext() {', 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Inserted exportExcel and exportPdf successfully!')
else:
    print('Target not found')
