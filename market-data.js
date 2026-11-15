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

  // Tiered gold ounce fetcher (Gold API -> Binance PAXG -> CoinGecko)
  async function fetchGoldOuncePrice() {
    const endpoints = [
      async () => {
        const d = await json('https://api.gold-api.com/price/XAU');
        if (positive(d?.price)) return { price: Number(d.price), at: stamp(d.updatedAt) || new Date().toISOString(), source: 'Gold API' };
        throw new Error('Invalid Gold API');
      },
      async () => {
        const d = await json('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT');
        if (positive(d?.price)) return { price: Number(d.price), at: new Date().toISOString(), source: 'Binance PAXG' };
        throw new Error('Invalid Binance');
      },
      async () => {
        const d = await json('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd');
        if (positive(d?.['pax-gold']?.usd)) return { price: Number(d['pax-gold'].usd), at: new Date().toISOString(), source: 'CoinGecko' };
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

  // Tiered FX rates fetcher (Open ER-API -> jsDelivr Currency API -> Pages dev)
  async function fetchFxRates() {
    const endpoints = [
      async () => {
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
        const d = await json('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        if (positive(d?.usd?.egp) && positive(d?.usd?.sar)) {
          return {
            egp: Number(d.usd.egp),
            sar: Number(d.usd.sar),
            eur: Number(d.usd.eur || 0.92),
            aed: Number(d.usd.aed || 3.67),
            at: stamp(d.date) || new Date().toISOString(),
            source: 'Currency-API'
          };
        }
        throw new Error('Invalid jsdelivr');
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

  function buildFeed(fx, gold) {
    const nowIso = new Date().toISOString();
    const fxAt = fx.at || nowIso;
    const goldAt = gold.at || nowIso;
    const usdEgp = fx.egp;
    const rawGram24 = (Number(gold.price) * usdEgp) / 31.1034768;

    const currencies = {
      USD: { sell: usdEgp, buy: null, chg: null, bank: fx.source, sourceUpdatedAt: fxAt },
      SAR: { sell: positive(fx.sar) ? usdEgp / fx.sar : 14.25, buy: null, chg: null, bank: fx.source, sourceUpdatedAt: fxAt },
      EUR: { sell: positive(fx.eur) ? usdEgp / fx.eur : 58.00, buy: null, chg: null, bank: fx.source, sourceUpdatedAt: fxAt },
      AED: { sell: positive(fx.aed) ? usdEgp / fx.aed : 14.55, buy: null, chg: null, bank: fx.source, sourceUpdatedAt: fxAt }
    };

    const quote = (val, label) => ({
      sell: val,
      buy: null,
      chg: null,
      source: label || 'سعر عيار الذهب دون مصنعية',
      sourceUpdatedAt: goldAt
    });

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
        gold24: quote(rawGram24, 'ذهب عيار 24'),
        gold21: quote(rawGram24 * 21 / 24, 'ذهب عيار 21'),
        gold18: quote(rawGram24 * 18 / 24, 'ذهب عيار 18'),
        goldPound: quote(rawGram24 * 7, 'جنيه ذهب 8 جم عيار 21'),
        goldOunceUSD: Number(gold.price)
      }
    };
  }

  async function load(storage, force) {
    let saved = null;
    try {
      saved = JSON.parse(storage.getItem('family_market_feed_v2') || 'null');
    } catch (e) {}

    // Check if cached feed is very fresh (< 45 minutes) and not forced
    if (!force && valid(saved) && age(saved.checkedAt) < 45) {
      return { feed: saved, offline: false };
    }

    // Try fetching fresh live rates concurrently
    const [goldRes, fxRes] = await Promise.allSettled([
      fetchGoldOuncePrice(),
      fetchFxRates()
    ]);

    const gold = goldRes.status === 'fulfilled' ? goldRes.value : null;
    const fx = fxRes.status === 'fulfilled' ? fxRes.value : null;

    if (gold && fx) {
      const feed = buildFeed(fx, gold);
      if (valid(feed)) {
        try {
          storage.setItem('family_market_feed_v2', JSON.stringify(feed));
        } catch (e) {}
        return { feed, offline: false };
      }
    }

    // If fetch failed or partial, fallback to cache
    if (valid(saved)) {
      return { feed: saved, offline: true };
    }

    // Fallback baseline if first time offline
    const baselineFx = { egp: 53.45, sar: 14.25, eur: 58.50, aed: 14.55, at: new Date().toISOString(), source: 'قاعدة بيانات محلية' };
    const baselineGold = { price: 3887.60, at: new Date().toISOString(), source: 'سعر مرجعي' };
    const fallbackFeed = buildFeed(baselineFx, baselineGold);
    return { feed: fallbackFeed, offline: true };
  }

  return { positive, stamp, age, valid, load };
});
