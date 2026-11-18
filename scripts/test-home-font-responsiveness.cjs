/* Font-family and accessibility-size regression across all five expense
   home designs. Uses isolated browser storage and never changes family data. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.APP_URL||'http://127.0.0.1:8765/';
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
   await page.goto(base+'?fontHomeQA=1',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#homeInterfaces')?.dataset.design==='0');
   for(let design=1;design<=5;design++){
     await page.locator('#btnHomeDesign').click();
     await page.waitForFunction(n=>document.querySelector('#homeInterfaces')?.dataset.design===String(n),design);
     await page.waitForTimeout(90);
     const before=await page.evaluate(()=>{
       const host=document.getElementById('homeInterfaces');
       const card=host.querySelector('.reference-one-card,.home-design-card');
       const label=card?.querySelector('.reference-one-add strong,.home-design-head strong,[data-add] strong');
       return {height:card?.getBoundingClientRect().height,
         fontSize:parseFloat(getComputedStyle(label||card).fontSize),
         fontFamily:getComputedStyle(label||card).fontFamily};
     });
     await page.evaluate(()=>{
       const view=document.getElementById('viewExpenses');
       view.style.setProperty('font-family','Georgia, serif','important');
       view.style.setProperty('font-size','24px','important');
     });
     await page.waitForFunction(()=>parseFloat(document.querySelector('#homeInterfaces')
       ?.style.getPropertyValue('--dynamic-home-font-scale')||'1')>1.3,null,{timeout:5000});
     await page.waitForTimeout(120);
     const after=await page.evaluate(()=>{
       const host=document.getElementById('homeInterfaces');
       const cards=[...host.querySelectorAll('.reference-one-card,.home-design-card')];
       const first=cards[0],label=first?.querySelector('.reference-one-add strong,.home-design-head strong,[data-add] strong');
       const info={
         fontSize:parseFloat(getComputedStyle(label||first).fontSize),
         fontFamily:getComputedStyle(label||first).fontFamily,
         height:first.getBoundingClientRect().height,
         min:parseFloat(host.style.getPropertyValue('--dynamic-home-content-min')),
         scale:parseFloat(host.style.getPropertyValue('--dynamic-home-font-scale')),
         count:cards.length,docWidth:document.documentElement.scrollWidth,
         navVisible:getComputedStyle(document.getElementById('appBottomNav')).display!=='none'
       };
       if(host.dataset.design==='1'){
         info.badPairs=[];
         for(const card of cards.filter(c=>c.dataset.refCategory!=='voice')){
           const top=card.querySelector('.reference-one-add')?.getBoundingClientRect();
           const details=card.querySelector('.reference-one-details')?.getBoundingClientRect();
           if(top&&details&&top.bottom>details.top+2)info.badPairs.push(card.dataset.refCategory);
         }
       }
       return info;
     });
     assert.equal(after.count,10,'Missing categories with large fonts '+width+'/'+design);
     assert.ok(after.fontFamily.toLowerCase().includes('georgia'),
       'Chosen font not applied '+width+'/'+design+': '+after.fontFamily);
     assert.ok(after.fontSize>before.fontSize+1,
       'Text not resized by dynamic font engine '+width+'/'+design+
       ' initial '+before.fontSize+' actual '+after.fontSize);
     assert.ok(after.height>=before.height-1,'Card shrank after font increase');
     assert.ok(after.min>76,'Content minimum not raised by chosen font');
     assert.ok(after.docWidth<=width+3,'Horizontal overflow after font change');
     assert.ok(after.navVisible,'Bottom navigation missing after font change');
     if(after.badPairs)assert.deepEqual(after.badPairs,[],
       'Expense action and financial amount areas overlap');
     console.log('HOME_FONT_QA '+JSON.stringify({width,design,before,after}));
     await page.evaluate(()=>{
       const view=document.getElementById('viewExpenses');
       view.style.removeProperty('font-family');
       view.style.removeProperty('font-size');
     });
     await page.waitForTimeout(100);
   }
   // User-facing font size control is part of the dynamic engine, not a
   // sixth main toolbar action. It must persist across designs/reloads.
   const sizeControl=page.locator('#dynamicHomeFontSizeSelect');
   assert.ok(await sizeControl.isVisible(),'Font size choice missing '+width);
   assert.equal(await sizeControl.inputValue(),'100');
   const beforeChoice=await page.evaluate(()=>{
     const root=document.getElementById('homeInterfaces');
     return {scale:parseFloat(root.style.getPropertyValue('--dynamic-home-font-scale')),
       height:root.querySelector('.home-design-card')?.getBoundingClientRect().height};
   });
   await sizeControl.selectOption('140');
   await page.waitForFunction(()=>document.querySelector('#homeInterfaces')
     ?.style.getPropertyValue('--dynamic-home-user-font-scale')==='1.40');
   await page.waitForTimeout(120);
   const bigger=await page.evaluate(()=>{
     const root=document.getElementById('homeInterfaces');
     return {scale:parseFloat(root.style.getPropertyValue('--dynamic-home-font-scale')),
       height:root.querySelector('.home-design-card')?.getBoundingClientRect().height,
       count:root.querySelectorAll('.home-design-card').length,
       saved:localStorage.getItem(HomeDynamicLayoutEngine.fontStorageKey)};
   });
   assert.ok(bigger.scale>beforeChoice.scale+0.25,'User font choice did not reach engine '+width);
   assert.ok(bigger.height>=beforeChoice.height,'Larger choice compressed cards '+width);
   assert.equal(bigger.count,10);
   assert.equal(bigger.saved,'140','Font size choice not saved '+width);
   await page.locator('#btnHomeDesign').click(); // original
   await page.waitForFunction(()=>document.querySelector('#homeInterfaces')?.dataset.design==='0');
   assert.ok(!(await sizeControl.isVisible()),'Original home must be unchanged');
   await page.locator('#btnHomeDesign').click(); // first reference
   await page.waitForFunction(()=>document.querySelector('#homeInterfaces')?.dataset.design==='1');
   await page.waitForTimeout(120);
   assert.equal(await sizeControl.inputValue(),'140','Font choice lost on design switch');
   const firstLayout=await page.evaluate(()=>({
     fontScale:parseFloat(document.getElementById('homeInterfaces').style
       .getPropertyValue('--dynamic-home-user-font-scale')),
     cardCount:document.querySelectorAll('#homeInterfaces .reference-one-card').length,
     navVisible:getComputedStyle(document.getElementById('appBottomNav')).display!=='none'
   }));
   assert.equal(firstLayout.fontScale,1.4);
   assert.equal(firstLayout.cardCount,10);
   assert.ok(firstLayout.navVisible);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#homeInterfaces')
     ?.style.getPropertyValue('--dynamic-home-user-font-scale')==='1.40');
   assert.equal(await sizeControl.inputValue(),'140','Saved font size missing after reload');
   await sizeControl.selectOption('80');
   await page.waitForFunction(()=>document.querySelector('#homeInterfaces')
     ?.style.getPropertyValue('--dynamic-home-user-font-scale')==='0.80');
   await sizeControl.selectOption('100');
   await page.waitForFunction(()=>document.querySelector('#homeInterfaces')
     ?.style.getPropertyValue('--dynamic-home-user-font-scale')==='1.00');
   console.log('HOME_FONT_SELECTOR_QA '+JSON.stringify({width,beforeChoice,bigger,firstLayout}));
   assert.deepEqual(errors,[],'Page JS exception '+width);
   await context.close();
  }
  console.log('PASS: responsive typography for all five alternative expense designs');
 } finally{await browser.close();}
})().catch(e=>{console.error('HOME_FONT_QA_FAILED',e.stack||e);process.exitCode=1;});
