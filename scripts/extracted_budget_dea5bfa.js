ectedExpenses));
        }
      } catch(e) { state.expectedExpenses = []; }
      try { if (typeof initMonthlyBudgetUI === 'function') initMonthlyBudgetUI(); } catch(e) {}
      try { if (typeof renderExpectedList === 'function') renderExpectedList(); } catch(e) {}
      // طھط´ط؛ظٹظ„ ط§ظ„ظ…ط²ط§ظ…ظ†ط© ط§ظ„ط´ط§ظ…ظ„ط© ظˆط³ط­ط¨ ط£ط³ط¹ط§ط± ط§ظ„ط°ظ‡ط¨ ظˆط§ظ„ط¹ظ…ظ„ط§طھ ط§ظ„ط­ظٹط© ظˆط§ظ„ظ…ظˆط§ط²ظ†ط© ط§ظ„طھظ„ظ‚ط§ط¦ظٹط© ظپظˆط±ط§ظ‹ ط¹ظ†ط¯ ط¨ط¯ط، ط§ظ„طھط·ط¨ظٹظ‚
      try { orchestrateAppStartupRefresh(true); } catch(e) { console.error('Startup refresh error:', e); }
      try { if (typeof renderMemberAnalyticsSelectorStrip === 'function') renderMemberAnalyticsSelectorStrip(); } catch(e) {}
      // ظپط­طµ ظˆطھط­ظ…ظٹظ„ ط§ظ„طھط­ط¯ظٹط«ط§طھ ط§ظ„طھظ„ظ‚ط§ط¦ظٹط© ظپظˆط± ط§ظƒطھظ…ط§ظ„ ط±ط³ظ… ظˆط§ط¬ظ‡ط© ط§ظ„ط¨ط±ظ†ط§ظ…ط¬ ط¹ظ†ط¯ ظƒظ„ ط¹ظ…ظ„ظٹط© ظپطھط­
      try {
        setTimeout(() => checkAndApplyAppUpdates({ isManual: false, silent: true }), 1000);
      } catch(e) {}
    }

    // ==========================================
    // 2. ط¥ط¯ط§ط±ط© ط§ظ„ظ…ط­ط§ظپط¸ ط§ظ„ظ…طھط¹ط¯ط¯ط© ط¨ط­ط³ط§ط¨ط§طھ ط®ط§طµط©
    // ==========================================
    function populateWalletDropdowns() {
      // 1. ط§ظ„ظ‚ط§ط¦ظ…ط© ظپظٹ ط§ظ„ط´ط±ظٹط· ط§ظ„ط¹ظ„ظˆظٹ
      const selectTop = document.getElementById('activeWalletSelect');
      let html = `<option value="all">ظƒظ„ ط§ظ„ظ…ط­ط§ظپط¸ ظ…ط¬طھظ…ط¹ط©</option>`;
      state.wallets.forEach(w => {
        html += `<option value="${w.id}">${w.name}</option>`;
      });
      selectTop.innerHTML = html;
      selectTop.value = state.currentWalletId;

      // 2. ط§ظ„ظ‚ط§ط¦ظ…ط© ط¯ط§ط®ظ„ ظ†ظ…ظˆط°ط¬ ط§ظ„ط­ط±ظƒط©
      const selectForm = document.getElementById('inpTxWallet');
      selectForm.innerHTML = state.wallets.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    }

    function handleCreateWallet() {
      const name = document.getElementById('inpNewWalletName').value.trim();
      const initBal = parseFloat(document.getElementById('inpNewWalletBal').value) || 0;
      const icon = document.getElementById('inpNewWalletIcon').value;

      if (!name) {
        alert('ظٹط±ط¬ظ‰ ط¥ط¯ط®ط§ظ„ ط§ط³ظ… ط§ظ„ظ…ط­ظپط¸ط©');
        return;
      }

      const newWallet = {
        id: 'wallet-' + Date.now(),
        name: name,
        icon: icon,
        initialBalance: initBal
      };

      state.wallets.push(newWallet);
      localStorage.setItem('family_monefy_wallets', JSON.stringify(state.wallets));

      // ط¥ط°ط§ ظƒط§ظ† ظ‡ظ†ط§ظƒ ط±طµظٹط¯ ط§ظپطھطھط§ط­ظٹطŒ ظ†ط³ط¬ظ„ظ‡ ظƒط¯ط®ظ„ ظ„ظ„ظ…ط­ظپط¸ط©
      if (initBal > 0) {
        state.transactions.push({
          id: 'tx-init-' + Date.now(),
          type: 'income',
          amount: initBal,
          label: `ط±طµظٹط¯ ط§ظپطھطھط§ط­ظٹ ظ„ظ…ط­ظپط¸ط© (${name})`,
          category: 'other_inc',
          member: state.selectedMember !== 'ط§ظ„ظƒظ„' ? state.selectedMember : 'ظ…ط§ظ‡ط±',
          walletId: newWallet.id,
          date: new Date().toISOString().split('T')[0]
        });
        saveTx();
      }

      closeModal('walletModal');
      populateWalletDropdowns();
      state.currentWalletId = newWallet.id;
      document.getElementById('activeWalletSelect').value = newWallet.id;
      syncChannel.postMessage({ type: 'SYNC_WALLETS', wallets: state.wallets });
      renderUI();
      showToast(`ًں’¼ طھظ… ط¥ظ†ط´ط§ط، ظ…ط­ظپط¸ط© (${name}) ط¨ظ†ط¬ط§ط­`);
    }

    // ==========================================
    // 3. ط§ط®طھظٹط§ط± ط§ظ„ط£ظپط§طھط§ط± ظˆط¶ط¨ط· ط§ظ„ط¯ظٹظپظˆظ„طھ ط§ظ„طھظ„ظ‚ط§ط¦ظٹ
    // ==========================================
    function updateUserAndDefaultDisplay() {
      const defaultPerson = state.selectedMember !== 'ط§ظ„ظƒظ„' ? state.selectedMember : state.currentUser;
      const ful = document.getElementById('footerUserLabel');
      if (ful) ful.textContent = `ط§ظ„ظ…ط­ظ…ظ„ ط¹ظ„ظٹظ‡: ${defaultPerson}`;
      const tch = document.getElementById('targetChargeHint');
      if (tch) tch.textContent = `ظٹطھظ… طھط³ط¬ظٹظ„ ط£ظٹ ط­ط±ظƒط© طھظ„ظ‚ط§ط¦ظٹط§ظ‹ ط¨ط§ط³ظ…: ${defaultPerson}`;
    }

    // ==========================================
    // 4. ط§ظ„ط´ط§ط±طھط§طھ ط§ظ„طھظˆط¶ظٹط­ظٹط© ظˆط§ظ„طھط­ظ„ظٹظ„ظٹط©
    // ==========================================
    let activeExecutiveTab = 'categories';
    let execCatChart = null, execMemChart = null, execTimeChart = null, execReqCompareChart = null, execMonthChart = null;
    let execCatChartType = 'pie';
    let currentGlobalSearchFilter = 'all';

    function toggleAnalyticsView() {
      switchAppPage('analytics');
      setTimeout(() => {
        updateAnalyticsChart();
        if (execCatChart) execCatChart.resize();
        if (execMemChart) execMemChart.resize();
        if (execTimeChart) execTimeChart.resize();
        if (execReqCompareChart) execReqCompareChart.resize();
        if (execMonthChart) execMonthChart.resize();
      }, 80);
    }

    function switchAnalyticsSection(tabId) {
      if (typeof switchExecutiveTab === 'function') {
        switchExecutiveTab(tabId);
      }
    }

    function initAnalyticsChart() {
      if (typeof switchExecutiveTab === 'function') {
        switchExecutiveTab('categories');
      }
    }

    function switchExecutiveTab(tabId) {
      activeExecutiveTab = tabId;
      
      // طھط­ط¯ظٹط« ط£ط²ط±ط§ط± ط§ظ„ط£ظ‚ط³ط§ظ…
      document.querySelectorAll('.analytics-sec-btn').forEach(btn => {
        if (btn.getAttribute('data-sec') === tabId) btn.classList.add('active');
        else btn.classList.remove('active');
      });

      // ط¥ط®ظپط§ط، ظˆط¥ط¸ظ‡ط§ط± ط§ظ„ط£ظ„ظˆط§ط­
      const paneMap = {
        'categories': 'paneCategories',
        'members': 'paneMembers',
        'timeline': 'paneTimeline',
        'wallets': 'paneWallets',
        'monthly': 'paneMonthly'
      };

      Object.values(paneMap).forEach(pId => {
        const el = document.getElementById(pId);
        if (el) el.style.display = 'none';
      });

      const activePane = document.getElementById(paneMap[tabId]);
      if (activePane) activePane.style.display = 'block';

      // ط±ط³ظ… ط§ظ„ط´ط§ط±طھ ط§ظ„ظ…ظ†ط§ط³ط¨ ظپظˆط±ط§ظ‹ ظ„ظ…ظ†ط¹ ط£ظٹ ظپط±ط§ط؛
      setTimeout(() => {
        const filtered = getFilteredTransactions();
        let totalExp = 0, totalInc = 0;
        filtered.forEach(t => {
          const a = parseFloat(t.amount) || 0;
          if (t.type === 'income') totalInc += a;
          else totalExp += a;
        });

        if (tabId === 'categories') renderCategoryChart(filtered, totalExp);
        else if (tabId === 'members') renderMembersChart(filtered, totalExp);
        else if (tabId === 'timeline') renderDailyTimelineChart(filtered);
        else if (tabId === 'wallets') renderWalletsDistributionChart(filtered);
        else if (tabId === 'monthly') renderMonthlyCompareChart(totalInc, totalExp);
      }, 50);
    }

    function toggleCategoryChartType() {
      execCatChartType = (execCatChartType === 'doughnut') ? 'bar' : 'doughnut';
      const iconEl = document.getElementById('categoryChartTypeIcon');
      if (iconEl) {
        iconEl.className = (execCatChartType === 'doughnut') ? 'fa-solid fa-chart-column' : 'fa-solid fa-chart-pie';
      }
      renderCategoryChart();
    }

    function setAnalyticsPeriod(period) {
      setAppPeriod(period === 'day' ? 'today' : period);
      const customBox = document.getElementById('analyticsCustomRangeBox');
      if (customBox) customBox.style.display = (period === 'custom') ? 'block' : 'none';
    }

    function toggleAnalyticsCustomRange() {
      const box = document.getElementById('analyticsCustomRangeBox');
      if (box) {
        box.style.display = (box.style.display === 'none' || !box.style.display) ? 'block' : 'none';
      }
    }

    function applyAnalyticsCustomDate() {
      const inpFrom = document.getElementById('inpAnalyticsDateFrom') || document.getElementById('inpAnaDateFrom');
      const inpTo = document.getElementById('inpAnalyticsDateTo') || document.getElementById('inpAnaDateTo');
      const dFrom = inpFrom ? inpFrom.value : '';
      const dTo = inpTo ? inpTo.value : '';

      if (!dFrom || !dTo) {
        showToast('ظٹط±ط¬ظ‰ طھط­ط¯ظٹط¯ طھط§ط±ظٹط® ط§ظ„ط¨ط¯ط§ظٹط© ظˆط§ظ„ظ†ظ‡ط§ظٹط© ط£ظˆظ„ط§ظ‹');
        return;
      }
      if (dFrom > dTo) {
        showToast('طھط§ط±ظٹط® ط§ظ„ط¨ط¯ط§ظٹط© ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ظ‚ط¨ظ„ ط£ظˆ ظٹط³ط§ظˆظٹ طھط§ط±ظٹط® ط§ظ„ظ†ظ‡ط§ظٹط©');
        return;
      }
      state.period = 'custom';
      state.customDateRange = { from: dFrom, to: dTo };
      renderUI();
      updateAnalyticsChart();
      showToast(`âœ“ طھظ… طھط·ط¨ظٹظ‚ ظپطھط±ط© ط§ظ„طھط­ظ„ظٹظ„: ظ…ظ† ${dFrom} ط¥ظ„ظ‰ ${dTo}`);
    }

    // ط§ظ„ظ…ط­ط±ظƒ ط§ظ„ظ…ط§ظ„ظٹ ط§ظ„ط±ط¦ظٹط³ظٹ ظ„طھط­ط¯ظٹط« ط§ظ„ظ…ط¤ط´ط±ط§طھ ظˆط§ظ„طھط­ظ„ظٹظ„ط§طھ
    
    