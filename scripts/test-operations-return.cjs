/* Check reversible ledger drilldowns in temporary Playwright contexts (no user data). */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const BASE=process.env.APP_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [360,390,430]){
   const context=await browser.newContext({viewport:{width,height:830},locale:'ar-EG',
     timezoneId:'Asia/Riyadh',serviceWorkers:'block'});
   const page=await context.newPage(), errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(BASE+'?opsReturnQA=1',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>typeof OperationsReturnHub==='object'&&
     typeof openOperationsFiltered==='function'&&typeof switchAppPage==='function',null,{timeout:30000});
   const expense=await page.evaluate(()=>{
     switchAppPage('expenses',false);
     state.period='week';state.currentMemberFilter='البيت';state.projectFilter='all';
     const body=document.getElementById('appScrollBody');
     body.scrollTop=50;
     const before=body.scrollTop;
     openOperationsFiltered({category:'food',type:'expense'});
     const shown=document.getElementById('btnOpsReturnToSource').getBoundingClientRect().width>0;
     const info=OperationsReturnHub.getState();
     document.getElementById('btnOpsReturnToSource').click();
     return {shown,info,page:state.activePage,period:state.period,member:state.currentMemberFilter,
       scroll:body.scrollTop,before,shownAfter:document.body.classList.contains('ops-return-context')};
   });
   assert.ok(expense.shown,'Return button hidden on expense drilldown');
   assert.equal(expense.info.page,'expenses');
   assert.equal(expense.page,'expenses');
   assert.equal(expense.period,'week');
   assert.equal(expense.member,'البيت');
   assert.equal(expense.shownAfter,false);
   assert.equal(expense.scroll,expense.before,'Source scroll not restored');

   const budget=await page.evaluate(()=>{
     switchAppPage('budgets',false);
     switchBudgetSubTab('current');switchBudgetMonthView('compare');
     const search=document.getElementById('cmpPeriodFrom');
     const sort=document.getElementById('cmpSort');
     if(!search||!sort)throw Error('Budget compare fields unavailable');
     search.value='2025-03-17';
     sort.value='name';
     const body=document.getElementById('appScrollBody');
     body.scrollTop=120;
     const initialTop=body.scrollTop;
     openOperationsFiltered({category:'health',type:'expense'});
     const source=OperationsReturnHub.getState()?.page;
     OperationsReturnHub.returnToSource();
     return {source,page:state.activePage,budgetPressed:document.getElementById('btnBudgetSubCurrent').classList.contains('active'),
       comparison:document.getElementById('btnBudgetInnerCompare').getAttribute('aria-pressed'),
       input:document.getElementById('cmpPeriodFrom')?.value,
       sort:document.getElementById('cmpSort')?.value,
       scroll:body.scrollTop,initialTop};
   });
   assert.equal(budget.source,'budgets');
   assert.equal(budget.page,'budgets');
   assert.ok(budget.budgetPressed,'Budget tab changed after back');
   assert.equal(budget.comparison,'true','Budget comparison mode changed after back');
   assert.equal(budget.input,'2025-03-17','Unfinished budget form was cleared');
   assert.equal(budget.sort,'name','Budget row ordering changed after back');
   assert.equal(budget.scroll,budget.initialTop,'Budget scroll did not restore');

   const operations=await page.evaluate(()=>{
     switchAppPage('operations',false);
     switchOperationsSubTab('analytics');
     const previous=state.activeOpsSubTab;
     openOperationsFiltered({category:'daily',type:'expense'});
     const source=OperationsReturnHub.getState()?.page;
     const backEnabled=document.body.classList.contains('ops-return-context');
     OperationsReturnHub.returnToSource();
     return {previous,source,backEnabled,page:state.activePage,subtab:state.activeOpsSubTab,
       analytics:document.getElementById('opsSubViewAnalytics').style.display};
   });
   assert.equal(operations.previous,'analytics');
   assert.equal(operations.source,'operations');
   assert.ok(operations.backEnabled);
   assert.equal(operations.page,'operations');
   assert.equal(operations.subtab,'analytics');
   assert.equal(operations.analytics,'block');

   // Normal navigation via the bottom tab must not create a false return context.
   const normal=await page.evaluate(()=>{
     switchAppPage('expenses',false);
     document.getElementById('navTabOperations').click();
     return {page:state.activePage,returnContext:OperationsReturnHub.getState()};
   });
   assert.equal(normal.page,'operations');
   assert.equal(normal.returnContext,null,'Bottom-navigation created a false drilldown');
   console.log('UNIVERSAL_LEDGER_BACK',width,JSON.stringify({expense,budget,operations,normal}));
   assert.deepEqual(errors,[],'Application JavaScript errors');
   await context.close();
  }
  console.log('PASS: universal ledger back, exact source tab, filters, unfinished form, ordering and scroll');
 }finally{await browser.close();}
})().catch(err=>{console.error('UNIVERSAL_LEDGER_BACK_FAILED',err.stack||err);process.exitCode=1;});
