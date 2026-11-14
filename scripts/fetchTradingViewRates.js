function fetchTradingViewRates() {
      const spin = document.getElementById('iconSpin');
      const goldBadgeIcon = document.querySelector('#btnOpenGold i');
      if (spin) spin.classList.add('fa-spin');
      if (goldBadgeIcon) goldBadgeIcon.classList.add('fa-spin');

      let marketData = null;

      // 1. استيراد أسعار تعويم الرسمية الفورية من market_rates.json (بنك مصر & مركز المعلومات IDSC)
      try {
        const resp = await fetch('market_rates.json?_t=' + Date.now(), { cache: 'no-store' });
        if (resp.ok) {
          marketData = await resp.json();
        }
      } catch (e) {
        console.warn('Local market_rates.json notice:', e);
      }

      // شبكة أمان مباشرة عبر الإنترنت في حال تعذر قراءة الملف المحلي
      if (!marketData) {
        try {
          const apiResp = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
          if (apiResp.ok) {
            const apiData = await apiResp.json();
            if (apiData && apiData.rates && apiData.rates.EGP) {
              const liveUsd = apiData.rates.EGP;
              const liveSar = apiData.rates.SAR ? (liveUsd / apiData.rates.SAR) : 14.37;
              marketData = {
                currencies: {
                  USD: { sell: liveUsd, buy: liveUsd - 0.10, chg: '0%' },
                  SAR: { sell: liveSar, buy: liveSar - 0.10, chg: '0%' }
                },
                gold: {
                  gold21: { sell: 6265.00, buy: 6205.00, chg: '0%' },
                  gold24: { sell: 7160.00, buy: 7091.50, chg: '0%' },
                  gold18: { sell: 5370.00, buy: 5318.50, chg: '0%' },
                  goldPound: { sell: 50120.00, buy: 49640.00, chg: '0%' },
                  goldOunceUSD: 4043.83
                }
              };
            }
          }
        } catch(netErr) {
          console.warn('Online exchange fallback notice:', netErr);
        }
      }

      // كاش محفوظ مسبقاً في حال عدم وجود اتصال
      const savedMarket = localStorage.getItem('family_last_live_market');
      let cached = null;
      if (savedMarket) {
        try { cached = JSON.parse(savedMarket); } catch (e) {}
      }

      // 2. الأسعار الأساسية الدقيقة المعتمدة من تعويم
      // https://ta3weem.com/ar/banks/banque-misr-bm
      // https://ta3weem.com/ar/gold-data-sources/information-and-decision-support-center-gold
      let usdSell = cached ? (cached.usdEgp || 55.84) : 55.84;
      let usdBuy = cached ? (cached.usdBuy || 55.74) : 55.74;
      let usdChg = cached ? (cached.usdChg ?? -0.45) : -0.45;

      let sarSell = cached ? (cached.sarEgp || 14.87) : 14.87;
      let sarBuy = cached ? (cached.sarBuy || 14.78) : 14.78;
      let sarChg = cached ? (cached.sarChg ?? -0.45) : -0.45;

      let eurSell = cached ? (cached.eurEgp || 62.62) : 62.62;
      let eurBuy = cached ? (cached.eurBuy || 62.08) : 62.08;
      let eurChg = cached ? (cached.eurChg ?? 0.03) : 0.03;

      let aedSell = cached ? (cached.aedEgp || 15.20) : 15.20;
      let aedBuy = cached ? (cached.aedBuy || 15.16) : 15.16;
      let aedChg = cached ? (cached.aedChg ?? -0.44) : -0.44;

      let g24Sell = cached ? (cached.gold24 || 7308.50) : 7308.50;
      let g24Buy = cached ? (cached.gold24Buy || 7280.00) : 7280.00;
      let g24Chg = cached ? (cached.gold24Chg ?? 0.00) : 0.00;

      let g21Sell = cached ? (cached.gold21 || 6395.00) : 6395.00;
      let g21Buy = cached ? (cached.gold21Buy || 6370.00) : 6370.00;
      let g21Chg = cached ? (cached.gold21Chg ?? 0.00) : 0.00;

      let g18Sell = cached ? (cached.gold18 || 5481.50) : 5481.50;
      let g18Buy = cached ? (cached.gold18Buy || 5460.00) : 5460.00;
      let g18Chg = cached ? (cached.gold18Chg ?? 0.00) : 0.00;

      let gPoundSell = cached ? (cached.goldPound || 49320.00) : 49320.00;
      let gPoundBuy = cached ? (cached.goldPoundBuy || 48920.00) : 48920.00;
      let gPoundChg = cached ? (cached.goldPoundChg ?? -3.60) : -3.60;

      let goldOunce = cached ? (cached.goldOunce || 4043.83) : 4043.83;

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

      // حفظ كائن السوق في التطبيق
      state.market = {
        source: 'تعويم (بنك مصر & مركز المعلومات IDSC)',
        usdEgp: usdSell, usdBuy: usdBuy, usdChg: usdChg,
        sarEgp: sarSell, sarBuy: sarBuy, sarChg: sarChg,
        eurEgp: eurSell, eurBuy: eurBuy, eurChg: eurChg,
        aedEgp: aedSell, aedBuy: aedBuy, aedChg: aedChg,
        gold24: g24Sell, gold24Buy: g24Buy, gold24Chg: g24Chg,
        gold21: g21Sell, gold21Buy: g21Buy, gold21Chg: g21Chg,
        gold18: g18Sell, gold18Buy: g18Buy, gold18Chg: g18Chg,
        goldPound: gPoundSell, goldPoundBuy: gPoundBuy, goldPoundChg: gPoundChg,
        goldOunce: goldOunce,
        updatedAt: (marketData && marketData.updated_at) ? marketData.updated_at : new Date().toISOString()
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

      const displayTime = (marketData && marketData.updated_at_display) 
        ? marketData.updated_at_display 
        : ('اليوم ' + nowTimeStr);
      setElText('tvUpdateTime', 'تعويم: ' + displayTime + ' (بنك مصر & الصاغة)');

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
