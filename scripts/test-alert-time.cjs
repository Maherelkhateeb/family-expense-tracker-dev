/* Verify Arabic alert timestamps against the real app in Riyadh local time.
 * Runs in a disposable browser and never accesses user data.
 */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const URL=process.env.APP_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({timezoneId:'Asia/Riyadh',locale:'ar-SA',serviceWorkers:'block'});
  const page=await context.newPage();
  const exceptions=[];page.on('pageerror',e=>exceptions.push(e.message));
  const response=await page.goto(URL+'?alerts_time_qa=1',{waitUntil:'domcontentloaded',timeout:60000});
  assert.ok(response?.ok(),'Cannot load application');
  await page.waitForFunction(()=>typeof familyAlerts==='object'&&
    typeof familyAlerts.formatArabicDateTime==='function',null,{timeout:25000});
  const actual=await page.evaluate(()=>{
    const f=familyAlerts.formatArabicDateTime;
    const tx=(time)=>({date:'2026-11-17',time});
    const createdAt='2026-11-17T05:42:00.000Z'; // 08:42 Riyadh
    return {
      midnight:f(tx('00:05')),
      zero:f(tx('00:00')),
      singleDigitHour:f(tx('9:30')),
      noon:f(tx('12:05')),
      afternoon:f(tx('15:34')),
      fromCreatedAt:f({date:'2026-11-17',createdAt},createdAt),
      fromIsoFallback:f({},createdAt),
      badDateFallback:f({date:'2026-02-31'},createdAt),
      generated:familyAlerts.generateTransactionAlertText({
        date:'2026-11-17',createdAt,author:'اية',member:'اية',
        category:'daily',type:'expense',amount:175
      })
    };
  });
  console.log('ARABIC_ALERT_TIMESTAMP_REPORT '+JSON.stringify(actual));
  assert.equal(actual.midnight,'الساعة ١٢:٠٥ صباحا 17/11/2026');
  assert.equal(actual.zero,'الساعة ١٢ صباحا 17/11/2026');
  assert.equal(actual.singleDigitHour,'الساعة ٩:٣٠ صباحا 17/11/2026');
  assert.equal(actual.noon,'الساعة ١٢:٠٥ مساء 17/11/2026');
  assert.equal(actual.afternoon,'الساعة ٣:٣٤ مساء 17/11/2026');
  assert.equal(actual.fromCreatedAt,'الساعة ٨:٤٢ صباحا 17/11/2026');
  assert.equal(actual.fromIsoFallback,'الساعة ٨:٤٢ صباحا 17/11/2026');
  assert.equal(actual.badDateFallback,'الساعة ٨:٤٢ صباحا 17/11/2026');
  assert.match(actual.generated,/١٧٥ جنيه/);
  assert.ok(actual.generated.includes('الساعة ٨:٤٢ صباحا 17/11/2026'),'Alert ignored createdAt: '+actual.generated);
  assert.deepEqual(exceptions,[],'Unexpected JavaScript exceptions');
  console.log('PASS Arabic notification timestamps at midnight, noon, 1-digit hours, ISO fallback and real transaction time.');
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error('ARABIC_ALERT_TIME_QA_FAILED',e.stack||e);process.exitCode=1;});
