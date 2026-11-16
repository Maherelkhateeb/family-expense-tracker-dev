'use strict';
const assert=require('node:assert/strict');
const api=require('../market-data.js');
assert.equal(typeof api.load,'function','Market loader contract');
assert.equal(typeof api.valid,'function','Market validator contract');
assert.equal(api.valid({checkedAt:'2099-01-01',currencies:{},gold:{}}),false);
assert.equal(api.stamp('2099-01-01'),null,'Future timestamps cannot represent verified rates');
(async()=>{
  const values=new Map();
  const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  const now=new Date().toISOString();
  global.fetch=async url=>{
    if(String(url).includes('binance.com'))return {ok:true,json:async()=>({
      lastPrice:'3000',openPrice:'2950',priceChange:'50',priceChangePercent:'1.6949'
    })};
    if(String(url).includes('jsdelivr.net'))return {ok:true,json:async()=>({
      date:now,usd:{egp:50,sar:3.75,eur:.92,aed:3.67}
    })};
    throw Error('Unexpected mock provider '+url);
  };
  const live=await api.load(storage,true);
  assert(live && live.feed && api.valid(live.feed),'Verified-source quote should load');
  assert.equal(live.offline,false);
  assert.equal(live.feed.rateMode,'estimated','Derived buy/sell must be labelled as estimates');
  assert(Math.abs(live.feed.gold.gold24.sell-(3000*50/31.1034768))<1e-7);
  assert.equal(live.feed.currencies.USD.sell,50);
  assert.equal(live.feed.gold.gold24.sourceUpdatedAt!==undefined,true);
  const cached=await api.load(storage,false);
  assert(cached.fromCache,'Recent verified feed should be cached');
  global.fetch=async()=>{throw Error('offline')};
  const offline=await api.load(storage,true);
  assert(offline && offline.offline && offline.feed.checkedAt===live.feed.checkedAt,
    'Offline must retain the last verified observation timestamp');
  values.clear();
  assert.equal(await api.load(storage,true),null,
    'No fabricated rates when network and verified cache are both absent');
  storage.setItem('family_market_feed_v2',JSON.stringify({checkedAt:now,currencies:{},gold:{}}));
  assert.equal(await api.load(storage,true),null,'Malformed cache should not be displayed as live');
  console.log('PASS: provider-derived gold and FX, honest estimated label, cached offline rates, no fabricated defaults');
})().catch(e=>{console.error('MARKET_QA_FAILED',e);process.exitCode=1});
