/* Automatic per-design Arabic typography and existing appearance-setting tests.
   Run in isolated browser profiles; never alter actual family finance data. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.APP_URL||'http://127.0.0.1:8765/';
const profiles={
  1:'Tajawal',
  2:'Cairo',
  3:'Almarai',
  4:'IBM Plex Sans Arabic',
  5:'Readex Pro'
};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [360,430]){
   const context=await browser.newContext({
     viewport:{width,height:width===360?760:932},
     locale:'ar-EG',serviceWorkers:'block'});
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'?fontHomeQA=2',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#homeInterfaces')?.dataset.design==='0');
   const original=await page.evaluate(()=>({
     controls:document.querySelectorAll('.executive-quick-tools-strip > *').length,
     extra:document.getElementById('dynamicHomeFontControls')?.isConnected||false,
     setting:!!document.getElementById('fontSizeBtn_huge')
   }));
   assert.equal(original.controls,5,'Original five quick tools must be untouched');
   assert.equal(original.extra,false,'No font control on the expense home');
   assert.ok(original.setting,'Existing font size buttons must remain in Settings');
   for(let design=1;design<=5;design++){
     await page.locator('#btnHomeDesign').click();
     await page.waitForFunction(n=>document.querySelector('#homeInterfaces')?.dataset.design===String(n)
       && document.querySelector('#homeInterfaces')?.dataset.dynamicHomeMeasured==='true',
       design,{timeout:12000});
     await page.evaluate(()=>{setAppFontSize('medium',false);setAppFont('tajawal',false)});
     await page.waitForFunction(name=>document.getElementById('homeInterfaces')?.style
       .getPropertyValue('--dynamic-home-font-family').includes(name),profiles[design]);
     await page.waitForTimeout(90);
     const before=await page.evaluate(()=>{
       const root=document.getElementById('homeInterfaces');
       const card=root.querySelector('.reference-one-card,.home-design-card');
       return {height:card?.getBoundingClientRect().height,
         scale:parseFloat(root.style.getPropertyValue('--dynamic-home-font-scale')),
         family:root.style.getPropertyValue('--dynamic-home-font-family')};
     });
     assert.ok(before.family.includes(profiles[design]),
       'Automatic typeface did not match design '+design+': '+before.family);
     await page.evaluate(()=>setAppFontSize('huge',false));
     await page.waitForFunction(beforeScale=>parseFloat(document.getElementById('homeInterfaces')
       ?.style.getPropertyValue('--dynamic-home-font-scale'))>beforeScale+.12,
       before.scale,{timeout:9000});
     await page.waitForTimeout(90);
     const enlarged=await page.evaluate(()=>{
       const root=document.getElementById('homeInterfaces');
       const cards=[...root.querySelectorAll('.reference-one-card,.home-design-card')];
       const first=cards[0],label=first?.querySelector('.reference-one-add strong,.home-design-head strong,[data-add] strong');
       const info={scale:parseFloat(root.style.getPropertyValue('--dynamic-home-font-scale')),
         height:first.getBoundingClientRect().height,
         min:parseFloat(root.style.getPropertyValue('--dynamic-home-content-min')),
         family:getComputedStyle(label||first).fontFamily,
         count:cards.length,docWidth:document.documentElement.scrollWidth,
         navVisible:getComputedStyle(document.getElementById('appBottomNav')).display!=='none',
         extra:!!document.getElementById('dynamicHomeFontControls')};
       if(root.dataset.design==='1'){
         info.badPairs=[];
         for(const card of cards.filter(c=>c.dataset.refCategory!=='voice')){
           const action=card.querySelector('.reference-one-add')?.getBoundingClientRect();
           const details=card.querySelector('.reference-one-details')?.getBoundingClientRect();
           if(action&&details&&action.bottom>details.top+2)info.badPairs.push(card.dataset.refCategory);
         }
       }
       return info;
     });
     assert.equal(enlarged.count,10,'Expense categories missing '+width+'/'+design);
     assert.ok(enlarged.scale>before.scale+.12,'Settings size did not reach engine');
     assert.ok(enlarged.height>=before.height-1,'Card collapsed for larger text');
     assert.ok(enlarged.min>76,'Engine content minimum did not grow');
     assert.ok(enlarged.docWidth<=width+3,'Horizontal overflow after font-size change');
     assert.ok(enlarged.navVisible,'Bottom navigation disappeared');
     assert.ok(!enlarged.extra,'Engine must not add main-screen font selector');
     if(enlarged.badPairs)assert.deepEqual(enlarged.badPairs,[],'Action/amount overlap');
     // Explicit global typeface choice overrides auto design recommendations.
     await page.evaluate(()=>setAppFont('ibm',false));
     await page.waitForFunction(()=>document.getElementById('homeInterfaces')?.style
       .getPropertyValue('--dynamic-home-font-family').includes('IBM Plex Sans Arabic'));
     // Reset to automatic profile and standard size before next design.
     await page.evaluate(()=>{setAppFont('tajawal',false);setAppFontSize('medium',false)});
     await page.waitForTimeout(120);
     console.log('HOME_AUTO_FONT_QA '+JSON.stringify({width,design,before,enlarged}));
   }
   // The app's original font settings remain persisted across reloads.
   await page.evaluate(()=>setAppFontSize('large',true));
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.getElementById('homeInterfaces')?.dataset.design==='5');
   assert.equal(await page.evaluate(()=>document.documentElement.getAttribute('data-font-size')),
     'large','Saved Settings font size not restored');
   assert.ok((await page.locator('#homeInterfaces').evaluate(el=>
     el.style.getPropertyValue('--dynamic-home-font-family'))).includes('Readex Pro'),
     'Automatic typeface changed across reload');
   assert.deepEqual(errors,[],'Runtime exception '+width);
   await context.close();
  }
  console.log('PASS: five automatic font profiles, Settings size overrides, no home font selector');
 } finally{await browser.close();}
})().catch(e=>{console.error('HOME_FONT_QA_FAILED',e.stack||e);process.exitCode=1;});
