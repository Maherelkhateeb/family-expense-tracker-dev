/* Public quote loading with multi-tier real-time fallbacks and robust caching. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MarketData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const positive = x => Number.isFinite(Number(x)) && Number(x) > 0;

  function stamp(value) {
    if (!value) return null;
    const n = typeof value === 'number' ? value * (value < 1e12 ? 1000 : 1) : Date.parse(value);
    return Number.isFinite(n) && n <= Date.now() + 300000 ? new Date(n).toISOString() : null;
  }

  // Age in minutes relative to now
  const age = value => stamp(value) ? Math.max(0, (Date.now() - Date.parse(stamp(value))) / 60000) : Infinity;

  function valid(feed) {
    return !!(feed && stamp(feed.checkedAt || feed.updatedAt) &&
      ['USD', 'SAR'].every(k => positive(feed.currencies?.[k]?.sell)) &&
      ['gold24', 'gold21', 'gold18', 'goldPound'].every(k => positive(feed.gold?.[k]?.sell)));
  }

  async function json(url, timeout = 7000) {
    const c = new AbortController();
    const timer = setTimeout(() => c.abort(), timeout);
    try {
      const r = await fetch(url, { cache: 'no-store', signal: c.signal });
      if (!r.ok) throw Error('HTTP ' + r.status);
      return await r.json();
    } finally {
      clearTimeout(timer);
    }
  }

  // Tiered gold ounce fetcher (Binance PAXG 24hr -> Gold API XAU Spot -> CoinGecko)
  async function fetchGoldOuncePrice() {
    const endpoints = [
      async () => {
        const d = await json('https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT');
        if (positive(d?.lastPrice)) {
          const last = Number(d.lastPrice);
          const open = positive(d?.openPrice) ? Number(d.openPrice) : last;
          const chgVal = Number(d.priceChange != null ? d.priceChange : (last - open));
          const chgPct = Number(d.priceChangePercent != null ? d.priceChangePercent : (open > 0 ? (chgVal / open) * 100 : 0));
          return { price: last, open, chgVal, chgPct, at: new Date().toISOString(), source: 'Binance PAXG Spot' };
        }
        throw new Error('Invalid Binance');
      },
      async () => {
        const d = await json('https://api.gold-api.com/price/XAU');
        if (positive(d?.price)) {
          const last = Number(d.price);
          const open = positive(d?.open_price) ? Number(d.open_price) : positive(d?.prev_close_price) ? Number(d.prev_close_price) : last;
          const chgVal = last - open;
          const chgPct = open > 0 ? (chgVal / open) * 100 : 0;
          return { price: last, open, chgVal, chgPct, at: stamp(d.updatedAt) || new Date().toISOString(), source: 'Gold API XAU' };
        }
        throw new Error('Invalid Gold API');
      },
      async () => {
        const d = await json('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd&include_24hr_change=true');
        if (positive(d?.['pax-gold']?.usd)) {
          const last = Number(d['pax-gold'].usd);
          const chgPct = Number(d['pax-gold']?.usd_24h_change || 0);
          const open = chgPct !== 0 ? last / (1 + chgPct / 100) : last;
          const chgVal = last - open;
          return { price: last, open, chgVal, chgPct, at: new Date().toISOString(), source: 'CoinGecko PAXG' };
        }
        throw new Error('Invalid CoinGecko');
      }
    ];

    for (const fetcher of endpoints) {
      try {
        const res = await fetcher();
        if (res && positive(res.price)) return res;
      } catch (e) {}
    }
    return null;
  }

  // Tiered FX rates fetcher (Fast Fawaz Ahmed Currency API -> Open ER-API -> Pages dev)
  async function fetchFxRates() {
    const endpoints = [
      async () => {
        // Fast primary: Fawaz Ahmed jsdelivr Currency API (frequently updated)
        const d = await json('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        if (positive(d?.usd?.egp) && positive(d?.usd?.sar)) {
          return {
            egp: Number(d.usd.egp),
            sar: Number(d.usd.sar),
            eur: Number(d.usd.eur || 0.92),
            aed: Number(d.usd.aed || 3.67),
            at: new Date().toISOString(),
            source: 'Currency-API Live'
          };
        }
        throw new Error('Invalid jsdelivr');
      },
      async () => {
        // Secondary: Open ExchangeRate-API
        const d = await json('https://open.er-api.com/v6/latest/USD');
        if (positive(d?.rates?.EGP) && positive(d?.rates?.SAR)) {
          return {
            egp: Number(d.rates.EGP),
            sar: Number(d.rates.SAR),
            eur: Number(d.rates.EUR || 0.92),
            aed: Number(d.rates.AED || 3.67),
            at: stamp(d.time_last_update_unix || d.time_last_update_utc) || new Date().toISOString(),
            source: 'ExchangeRate-API'
          };
        }
        throw new Error('Invalid ER-API');
      },
      async () => {
        const d = await json('https://latest.currency-api.pages.dev/v1/currencies/usd.json');
        if (positive(d?.usd?.egp) && positive(d?.usd?.sar)) {
          return {
            egp: Number(d.usd.egp),
            sar: Number(d.usd.sar),
            eur: Number(d.usd.eur || 0.92),
            aed: Number(d.usd.aed || 3.67),
            at: stamp(d.date) || new Date().toISOString(),
            source: 'Currency-API-Pages'
          };
        }
        throw new Error('Invalid pages.dev');
      }
    ];

    for (const fetcher of endpoints) {
      try {
        const res = await fetcher();
        if (res && positive(res.egp)) return res;
      } catch (e) {}
    }
    return null;
  }

  function getDailyOpens(storage) {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const data = JSON.parse(storage?.getItem('family_market_daily_opens_v2') || 'null');
      if (data && data.date === today && data.opens) return data.opens;
    } catch(e) {}
    return null;
  }

  function saveDailyOpens(storage, opens) {
    const today = new Date().toISOString().slice(0, 10);
    try {
      storage?.setItem('family_market_daily_opens_v2', JSON.stringify({ date: today, opens }));
    } catch(e) {}
  }

  function calcChange(current, open) {
    const c = Number(current);
    const o = Number(open);
    if (!Number.isFinite(c) || !Number.isFinite(o) || o <= 0) return null;
    const val = c - o;
    const pct = (val / o) * 100;
    return { val, pct, open: o };
  }

  function buildFeed(fx, gold, storage) {
    const nowIso = new Date().toISOString();
    const fxAt = fx.at || nowIso;
    const goldAt = gold.at || nowIso;
    const usdEgp = fx.egp;
    const rawGram24 = (Number(gold.price) * usdEgp) / 31.1034768;

    // Track or retrieve daily opening baselines for live trend indicators
    const currentRates = {
      USD: usdEgp,
      SAR: positive(fx.sar) ? usdEgp / fx.sar : 14.25,
      EUR: positive(fx.eur) ? usdEgp / fx.eur : 58.00,
      AED: positive(fx.aed) ? usdEgp / fx.aed : 14.55,
      goldOunce: Number(gold.price)
    };

    let opens = getDailyOpens(storage) || {};
    if (!opens.USD) opens.USD = currentRates.USD;
    if (!opens.SAR) opens.SAR = currentRates.SAR;
    if (!opens.EUR) opens.EUR = currentRates.EUR;
    if (!opens.AED) opens.AED = currentRates.AED;
    
    // If provider gives explicit open price (e.g. Binance 24h ticker), respect it
    if (positive(gold.open)) {
      opens.goldOunce = Number(gold.open);
    } else if (!opens.goldOunce) {
      opens.goldOunce = currentRates.goldOunce;
    }

    const openGram24 = (opens.goldOunce * opens.USD) / 31.1034768;
    opens.gold24 = openGram24;
    opens.gold21 = openGram24 * 21 / 24;
    opens.gold18 = openGram24 * 18 / 24;
    opens.goldPound = openGram24 * 7;

    saveDailyOpens(storage, opens);

    const currencies = {
      USD: { sell: currentRates.USD, buy: null, chg: calcChange(currentRates.USD, opens.USD), bank: fx.source, sourceUpdatedAt: fxAt },
      SAR: { sell: currentRates.SAR, buy: null, chg: calcChange(currentRates.SAR, opens.SAR), bank: fx.source, sourceUpdatedAt: fxAt },
      EUR: { sell: currentRates.EUR, buy: null, chg: calcChange(currentRates.EUR, opens.EUR), bank: fx.source, sourceUpdatedAt: fxAt },
      AED: { sell: currentRates.AED, buy: null, chg: calcChange(currentRates.AED, opens.AED), bank: fx.source, sourceUpdatedAt: fxAt }
    };

    const quote = (val, label, chg) => ({
      sell: val,
      buy: null,
      chg: chg || null,
      source: label || 'سعر عيار الذهب دون مصنعية',
      sourceUpdatedAt: goldAt
    });

    const ounceChg = (gold.chgVal != null && gold.chgPct != null)
      ? { val: Number(gold.chgVal), pct: Number(gold.chgPct), open: opens.goldOunce }
      : calcChange(gold.price, opens.goldOunce);

    return {
      schemaVersion: 2,
      checkedAt: nowIso,
      updatedAt: goldAt,
      rateMode: 'estimated',
      provider: gold.source + ' & ' + fx.source,
      fxProvider: fx.source,
      goldProvider: gold.source,
      fxUpdatedAt: fxAt,
      goldUpdatedAt: goldAt,
      globalGoldUpdatedAt: goldAt,
      currencies,
      gold: {
        gold24: quote(rawGram24, 'ذهب عيار 24', calcChange(rawGram24, opens.gold24)),
        gold21: quote(rawGram24 * 21 / 24, 'ذهب عيار 21', calcChange(rawGram24 * 21 / 24, opens.gold21)),
        gold18: quote(rawGram24 * 18 / 24, 'ذهب عيار 18', calcChange(rawGram24 * 18 / 24, opens.gold18)),
        goldPound: quote(rawGram24 * 7, 'جنيه ذهب 8 جم عيار 21', calcChange(rawGram24 * 7, opens.goldPound)),
        goldOunceUSD: Number(gold.price),
        goldOunceChg: ounceChg
      }
    };
  }

  async function load(storage, force) {
    let saved = null;
    try {
      saved = JSON.parse(storage?.getItem('family_market_feed_v2') || 'null');
    } catch (e) {}

    // Check if cached feed is very fresh (< 2 minutes) and not forced
    if (!force && valid(saved) && age(saved.checkedAt) < 2) {
      return { feed: saved, offline: false, isLive: false, fromCache: true };
    }

    // Try fetching fresh live rates concurrently
    const [goldRes, fxRes] = await Promise.allSettled([
      fetchGoldOuncePrice(),
      fetchFxRates()
    ]);

    const gold = goldRes.status === 'fulfilled' ? goldRes.value : null;
    const fx = fxRes.status === 'fulfilled' ? fxRes.value : null;

    if (gold && fx) {
      const feed = buildFeed(fx, gold, storage);
      if (valid(feed)) {
        try {
          storage?.setItem('family_market_feed_v2', JSON.stringify(feed));
        } catch (e) {}
        return { feed, offline: false, isLive: true, fromCache: false, fetchedAt: new Date().toISOString() };
      }
    }

    // If fetch failed or partial, fallback to cache
    if (valid(saved)) {
      return { feed: saved, offline: true, isLive: false, fromCache: true, reason: 'network_failed' };
    }

    // Fallback baseline if first time offline
    const baselineFx = { egp: 53.45, sar: 14.25, eur: 58.50, aed: 14.55, at: new Date().toISOString(), source: 'قاعدة بيانات محلية' };
    const baselineGold = { price: 3887.60, open: 3870.00, chgVal: 17.60, chgPct: 0.45, at: new Date().toISOString(), source: 'سعر مرجعي' };
    const fallbackFeed = buildFeed(baselineFx, baselineGold, storage);
    return { feed: fallbackFeed, offline: true, isLive: false, fromCache: true, reason: 'baseline' };
  }

  return { positive, stamp, age, valid, load };
});
