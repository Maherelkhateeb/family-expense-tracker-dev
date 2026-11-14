'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  for(const width of [320,390,430,1365]){
   const page=await browser.newPage({viewport:{width,height:844}});
   await page.goto(process.env.APP_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>typeof window.setAppColorMode==='function');
   for(const mode of ['light','dark']){
    await page.evaluate(mode=>window.setAppColorMode(mode,false),mode);
    for(const id of ['navTabExpenses','navTabOperations','navTabRequests','navTabExpected','navTabAnalytics']){
     await page.locator('#'+id).click();
     const bad=await page.locator('button').evaluateAll(es=>es.filter(e=>{
      const rect=e.getBoundingClientRect();
      if(!rect.width||!rect.height)return false;
      // Descriptive ledger rows and dropdown summaries have intentional text alignment.
      if(e.matches('.summary-group-row,.summary-category-row,.compact-appearance-toggle,[id="auditMemberMultiBtn"],[id="auditCategoryMultiBtn"]'))return false;
      return !['center','start'].includes(getComputedStyle(e).textAlign);
     }).map(e=>({id:e.id,cls:e.className,text:e.textContent.trim().slice(0,45)})));
     assert.deepEqual(bad,[],`${width}/${mode}/${id}: unexpected control alignment`);
    }
    const icons=await page.locator('.btn-modal-close,.summary-close-btn,.range-calendar-nav button,.task-picker-month-heading button,.task-picker-stepper button').evaluateAll(es=>es.map(e=>({text:e.textContent.trim(),align:getComputedStyle(e).textAlign,justify:getComputedStyle(e).justifyContent,items:getComputedStyle(e).alignItems})));
    assert.ok(icons.length>15,'Expected app-wide close and arrow controls');
    assert.ok(icons.every(e=>e.align==='center'&&e.justify==='center'&&e.items==='center'),JSON.stringify(icons));
    console.log('PASS alignment across five app pages and '+icons.length+' close/arrow controls',width,mode);
   }
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
