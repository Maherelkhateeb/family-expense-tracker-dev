'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const stamp=new Date().toISOString();
const quote=n=>({sell:n,buy:n-5,chg:'0%'});
const fixture={schemaVersion:2,checkedAt:stamp,updatedAt:stamp,rateMode:'official',provider:'Test provider',goldProvider:'Test gold',fxProvider:'Test FX',globalGoldUpdatedAt:stamp,currencies:{USD:quote(50),SAR:quote(13.33),EUR:quote(55),AED:quote(13.61)},gold:{gold24:quote(6000),gold21:quote(5250),gold18:quote(4500),goldPound:quote(42000),goldOunceUSD:3000}};
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});try{
 for(const width of [320,390,430,1365]){
  const context=await browser.newContext({viewport:{width,height:844}}),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/market_rates.json*',r=>r.fulfill({json:fixture}));
  await page.route('https://api.gold-api.com/**',r=>r.fulfill({json:{price:3000,updatedAt:stamp}}));
  await page.goto(process.env.APP_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await page.locator('#btnOpenGold').click();
  await page.waitForFunction(()=>document.getElementById('tvUpdateTime').dataset.status==='fresh');
  for(const mode of ['light','dark']){
   await page.evaluate(m=>window.setAppColorMode(m,false),mode);
   const layout=await page.locator('#goldDrawerPanel').evaluate(e=>({w:e.clientWidth,scroll:e.scrollWidth,cards:e.querySelectorAll('.market-box').length,sections:[...e.querySelectorAll('.gold-grid-cards,.fx-grid-cards')].map(e=>e.scrollWidth<=e.clientWidth+2)}));
   assert(layout.scroll<=layout.w+2,JSON.stringify(layout));assert.equal(layout.cards,9);assert(layout.sections.every(Boolean));
   await page.locator('#goldDrawerPanel').screenshot({path:`screenshots/gold-${width}-${mode}.png`});
  }
  assert((await page.locator('#tvGold21Val').innerText()).includes('٥٬٢٥٠'));
  await page.getByText('حاسبة الذهب والمصنعية',{exact:true}).click();
  await page.locator('#calcQty').fill('2');
  await page.locator('#calcWorkmanshipPerGram').fill('100');
  assert((await page.locator('#calcFinalTotal').innerText()).includes('10,700'));
  const changed=JSON.parse(JSON.stringify(fixture));changed.gold.gold21.sell=5300;
  await page.route('**/market_rates.json*',r=>r.fulfill({json:changed}));
  await page.locator('#btnRefreshTv').click();
  await page.waitForFunction(()=>document.getElementById('tvGold21Val').textContent.includes('٥٬٣٠٠'));
  assert.deepEqual(errors,[]);console.log('PASS gold layout, calculator and quote refresh',width);await context.close();
 }
 const context=await browser.newContext(),page=await context.newPage();
 await page.route('**/market_rates.json*',r=>r.abort());await page.route('https://api.gold-api.com/**',r=>r.abort());await page.route('https://open.er-api.com/**',r=>r.abort());
 await page.goto(process.env.APP_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});await page.locator('#btnOpenGold').click();
 await page.waitForFunction(()=>document.getElementById('tvUpdateTime').dataset.status==='stale');
 assert.equal(await page.locator('#tvGold21Val').innerText(),'—');
 assert((await page.locator('#calcFinalTotal').textContent()).includes('غير متاح'));
 console.log('PASS complete outage: no synthetic quote or calculator total');await context.close();
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
