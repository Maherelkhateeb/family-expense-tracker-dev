#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Upgrade fetchTradingViewRates in index.html to Multi-Tier Real-Time Financial Engine
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

path = 'index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('function fetchTradingViewRates()')
end = content.find('\n    // =========================================================================\n    // محرك البدء الشامل والموازنة التلقائية', start)

if start == -1 or end == -1:
    print("Error: Could not find function bounds")
    sys.exit(1)

new_code = '''async function fetchTradingViewRates(forceLive = false) {
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
    }'''

content = content[:start] + new_code + content[end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully upgraded fetchTradingViewRates in {path}!")
