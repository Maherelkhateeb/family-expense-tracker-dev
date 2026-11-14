/* Public quote loading. Checked time is never substituted for a provider quote time. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MarketData=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const positive=x=>Number.isFinite(Number(x))&&Number(x)>0;
 function stamp(value){if(!value)return null;const n=typeof value==='number'?value*(value<1e12?1000:1):Date.parse(value);return Number.isFinite(n)&&n<=Date.now()+300000?new Date(n).toISOString():null;}
 const age=value=>stamp(value)?Math.max(0,(Date.now()-Date.parse(stamp(value)))/60000):Infinity;
 function valid(feed){return !!(feed&&stamp(feed.checkedAt||feed.updatedAt)&&['USD','SAR'].every(k=>positive(feed.currencies?.[k]?.sell))&&['gold24','gold21','gold18','goldPound'].every(k=>positive(feed.gold?.[k]?.sell)));}
 async function json(url,timeout=8000){const c=new AbortController();const timer=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{cache:'no-store',signal:c.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}finally{clearTimeout(timer);}}
 function estimate(fx,gold){
  const fxAt=stamp(fx.time_last_update_unix||fx.time_last_update||fx.time_last_update_utc),goldAt=stamp(gold.updatedAt);
  if(!fxAt||!goldAt||!positive(fx.rates?.EGP)||!positive(fx.rates?.SAR)||!positive(gold.price))return null;
  if(age(fxAt)>2880||age(goldAt)>4320)return null;
  const currencies={};for(const k of ['USD','SAR','EUR','AED','KWD'])if(positive(fx.rates[k]))currencies[k]={sell:fx.rates.EGP/fx.rates[k],buy:null,chg:null,bank:'ExchangeRate-API · مرجع يومي',sourceUpdatedAt:fxAt};
  const raw=Number(gold.price)*Number(fx.rates.EGP)/31.1034768;
  const quote=n=>({sell:n,buy:null,chg:null,source:'تقدير من الأونصة وسعر الصرف، دون مصنعية',sourceUpdatedAt:goldAt});
  return {schemaVersion:2,checkedAt:new Date().toISOString(),updatedAt:new Date(Math.min(Date.parse(fxAt),Date.parse(goldAt))).toISOString(),rateMode:'estimated',provider:'تقدير عالمي من Gold API وExchangeRate-API',fxProvider:'ExchangeRate-API · مرجع يومي',goldProvider:'Gold API · أونصة عالمية',fxUpdatedAt:fxAt,goldUpdatedAt:goldAt,globalGoldUpdatedAt:goldAt,currencies,gold:{gold24:quote(raw),gold21:quote(raw*21/24),gold18:quote(raw*18/24),goldPound:quote(raw*7),goldOunceUSD:Number(gold.price)}};
 }
 async function load(storage,force){
  const urls=['https://raw.githubusercontent.com/Maherelkhateeb/family-expense-tracker-dev/market-rates/market_rates.json?_t='+Date.now(),'market_rates.json?_t='+Date.now()];
  const results=await Promise.allSettled(urls.map(u=>json(u)));
  const candidates=results.filter(r=>r.status==='fulfilled'&&valid(r.value)).map(r=>({feed:r.value,offline:false}));
  try{const saved=JSON.parse(storage.getItem('family_market_feed_v2')||'null');if(valid(saved))candidates.push({feed:saved,offline:true});}catch(e){}
  candidates.sort((a,b)=>age(a.feed.checkedAt||a.feed.updatedAt)-age(b.feed.checkedAt||b.feed.updatedAt));
  let selected=candidates[0]||null;
  if(!selected||age(selected.feed.checkedAt||selected.feed.updatedAt)>90){
   const [fx,gold]=await Promise.allSettled([json('https://open.er-api.com/v6/latest/USD'),json('https://api.gold-api.com/price/XAU')]);
   if(fx.status==='fulfilled'&&gold.status==='fulfilled'){const feed=estimate(fx.value,gold.value);if(feed)selected={feed,offline:false};}
  }else if(force){
   try{const spot=await json('https://api.gold-api.com/price/XAU');const at=stamp(spot.updatedAt);if(positive(spot.price)&&at&&(!selected.feed.globalGoldUpdatedAt||Date.parse(at)>=Date.parse(selected.feed.globalGoldUpdatedAt))){selected.feed={...selected.feed,gold:{...selected.feed.gold,goldOunceUSD:Number(spot.price)},globalGoldUpdatedAt:at};}}catch(e){}
  }
  if(selected&&!selected.offline){try{storage.setItem('family_market_feed_v2',JSON.stringify(selected.feed));}catch(e){}}
  return selected;
 }
 return {positive,stamp,age,valid,estimate,load};
});
