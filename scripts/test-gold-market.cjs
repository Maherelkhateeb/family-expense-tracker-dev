'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const now=new Date().toISOString();
const q=n=>({sell:n,buy:null,chg:null,sourceUpdatedAt:now});
const quote={schemaVersion:2,checkedAt:now,updatedAt:now,rateMode:'estimated',provider:'Mock verified providers',
 fxProvider:'QA FX',goldProvider:'QA Gold',globalGoldUpdatedAt:now,
 currencies:{USD:q(50),SAR:q(13.33),EUR:q(55),AED:q(13.61)},
 gold:{gold24:q(6000),gold21:q(5250),gold18:q(4500),goldPound:q(42000),goldOunceUSD:3000}};
const URL=process.env.APP_URL||'http://127.0.0.1:8765/';
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const width of [320,390,430,1365]){
  const context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof MarketData?.load==='function'&&typeof fetchTradingViewRates==='function',null,{timeout:20000});
  await page.evaluate(f=>{MarketData.load=async()=>({feed:f,offline:false,isLive:true})},quote);
  await page.locator('#btnOpenGold').click();
  await page.waitForFunction(()=>document.getElementById('tvUpdateTime').dataset.status==='fresh',null,{timeout:20000});
  const rendered=await page.locator('#tvGold21Val').innerText();
  assert.match(rendered,/5,250\.00/,'Gold 21 must show verified fixture value, received '+rendered);
  for(const mode of ['light','dark']){
   await page.evaluate(m=>setAppColorMode(m,false),mode);
   const layout=await page.locator('#goldDrawerPanel').evaluate(el=>({
    w:el.clientWidth,scroll:el.scrollWidth,cards:el.querySelectorAll('.market-box').length,
    grids:[...el.querySelectorAll('.gold-grid-cards,.fx-grid-cards')].map(g=>g.scrollWidth<=g.clientWidth+2)
   }));
   assert(layout.scroll<=layout.w+2,'Gold drawer overflow '+JSON.stringify(layout));
   assert.equal(layout.cards,4,'Current compact UI has two gold cards and two FX cards');
   assert(layout.grids.every(Boolean),'Rates grids overflow');
  }
  await page.getByText('حاسبة الصاغة والمصنعية',{exact:true}).click().catch(()=>{});
  await page.locator('#calcQty').fill('2');
  await page.locator('#calcWorkmanshipPerGram').fill('100');
  const result=await page.locator('#calcFinalTotal').innerText();
  assert.match(result,/10,700/,'Gold 21 grams calculation mismatch: '+result);
  const updated=structuredClone(quote);updated.gold.gold21.sell=5300;
  await page.evaluate(f=>{MarketData.load=async()=>({feed:f,offline:false,isLive:true})},updated);
  await page.locator('#btnRefreshTv').click();
  await page.waitForFunction(()=>document.getElementById('tvGold21Val').textContent.includes('5,300.00'));
  assert.deepEqual(errors,[],'Unexpected UI exceptions');
  console.log('PASS gold rates, no layout overflow, calculator and source refresh at '+width);
  await context.close();
 }
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
 await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>typeof MarketData?.load==='function');
 await page.evaluate(()=>{MarketData.load=async()=>null});
 await page.locator('#btnOpenGold').click();
 await page.waitForFunction(()=>document.getElementById('tvUpdateTime').dataset.status==='stale',null,{timeout:20000});
 assert.equal((await page.locator('#tvGold21Val').innerText()).trim(),'—');
 assert.match(await page.locator('#calcFinalTotal').innerText(),/غير متاح/);
 console.log('PASS complete source outage: unavailable placeholders, no synthetic quotes');
 await context.close();
}finally{await browser.close();}
})().catch(e=>{console.error('GOLD_QA_FAILED',e.stack||e);process.exitCode=1});
