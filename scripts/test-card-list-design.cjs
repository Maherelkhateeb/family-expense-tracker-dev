/* Prove each card style updates real expense cards and operation rows. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const URL=process.env.APP_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [360,1365]){
   const context=await browser.newContext({viewport:{width,height:800},locale:'ar-EG',serviceWorkers:'block'});
   const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>typeof setAppDesignStyle==='function'&&typeof renderUI==='function',null,{timeout:30000});
   const initial=await page.evaluate(()=>{
     const d=new Date(),date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
     state.transactions=[{id:'qa-style',date,type:'expense',category:'food',amount:120,label:'اختبار التصميم',member:'البيت',
       walletId:state.wallets?.[0]?.id||'wallet-cash-safe',createdAt:new Date().toISOString()}];
     state.currentMemberFilter='الكل';state.currentWalletId='all';state.projectFilter='all';state.period='all';
     if(typeof resetOperationsFilters==='function')resetOperationsFilters();
     renderUI();if(typeof filterOperationsList==='function')filterOperationsList();
     return {cat:document.querySelectorAll('#catGrid .cat-card').length,
       ops:document.querySelectorAll('#txOperationsList .ops-tx-card-clean').length};
   });
   console.log('ACTUAL_APPEARANCE_SETUP '+width+' '+JSON.stringify(initial));
   assert.ok(initial.cat>0,'No category cards');
   assert.ok(initial.ops>0,'No operations list');
   for(const mode of ['dark','light']){
     const result=await page.evaluate(async(mode)=>{
       setAppColorMode(mode,false);
       const buttons=[...document.querySelectorAll('#settingsSec_appearance button[data-card-style]')];
       const values=[];
       const pause=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
       for(const btn of buttons){
         btn.click();await pause();
         const snap=el=>{
           const c=getComputedStyle(el);
           return {signature:[c.borderRadius,c.boxShadow,c.backgroundImage,c.backgroundColor,c.borderColor].join('|'),
             stamp:el.dataset.appearanceApplied};
         };
         values.push({id:btn.dataset.cardStyle,cat:snap(document.querySelector('#catGrid .cat-card')),
           op:snap(document.querySelector('#txOperationsList .ops-tx-card-clean')),
           pressed:btn.getAttribute('aria-pressed')});
       }
       return {values,catCount:new Set(values.map(x=>x.cat.signature)).size,
          opsCount:new Set(values.map(x=>x.op.signature)).size};
     },mode);
     console.log('ACTUAL_STYLE '+width+' '+mode+' '+JSON.stringify(result));
     assert.equal(result.values.length,9,'9 visible options required');
     assert.ok(result.catCount>=7,'Card designs are not visually distinct');
     assert.ok(result.opsCount>=7,'List designs are not visually distinct');
     for(const item of result.values){
       assert.equal(item.cat.stamp,item.id+':'+mode,'Category style stale');
       assert.equal(item.op.stamp,item.id+':'+mode,'Operations style stale');
       assert.equal(item.pressed,'true','Style selection inactive');
     }
   }
   assert.deepEqual(errors,[],'Browser errors');
   await context.close();
  }
  console.log('PASS: 9 card/list styles on real categories and operations, dark/light, mobile/desktop');
 }finally{await browser.close();}
})().catch(e=>{console.error('CARD_LIST_QA_FAILED',e.stack||e);process.exitCode=1});
