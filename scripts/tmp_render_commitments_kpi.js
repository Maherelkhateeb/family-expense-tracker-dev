sForUs;

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
        const netSign = (netCommitmentsToPrepare > 0) ? '-' : '+';
        netValue.innerHTML = `<span style="color: ${netColor}; direction: rtl; display: inline-flex; align-items: center; gap: 4px;">${netSign} ${formatMoneyVal(Math.abs(netCommitmentsToPrepare))}</span>`;
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

      [cardBills, cardOnUs, cardForUs, cardSettled].forEach(c => {
        if (c) {
          c.style.transform = 'none';
          c.style.boxShadow = 'none';
        }
      });

      if (activeCommitmentSubFilter === 'bills' && cardBills) {
        cardBills.style.transform = 'translateY(-2px)';
        cardBills.style.boxShadow = '0 0 0 2px #fbbf24, 0 6px 18px rgba(245, 158, 11, 0.4)';
      } else if (activeCommitmentSubFilter === 'debts_on_us' && cardOnUs) {
        cardOnUs.