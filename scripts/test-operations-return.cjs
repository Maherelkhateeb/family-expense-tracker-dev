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
   const expense=await page.evaluate(async()=>{
     switchAppPage('expenses',false);
     const spacer=document.createElement('div');
     spacer.style.height='1700px';
     spacer.className='qa-scroll-spacer';
     document.getElementById('viewExpenses').append(spacer);
     state.period='week';state.currentMemberFilter='البيت';state.projectFilter='all';
     const scrollPane=document.createElement('div');
     scrollPane.id='qaExpenseScroller';
     scrollPane.style.cssText='height:180px;max-height:180px;overflow-y:auto;';
     const tall=document.createElement('div');tall.style.height='1300px';
     scrollPane.append(tall);document.getElementById('viewExpenses').append(scrollPane);
     scrollPane.scrollTop=420;
     const before=scrollPane.scrollTop;
     if(before<100)throw Error('QA failed to make expenses page actually scroll');
     const body=document.getElementById('appScrollBody');
     openOperationsFiltered({category:'food',type:'expense'});
     const shown=document.getElementById('btnOpsReturnToSource').getBoundingClientRect().width>0;
     const info=OperationsReturnHub.getState();
     document.getElementById('btnOpsReturnToSource').click();
     await new Promise(r=>setTimeout(r,280));
     return {shown,info,page:state.activePage,period:state.period,member:state.currentMemberFilter,
       scroll:scrollPane.scrollTop,before,shownAfter:document.body.classList.contains('ops-return-context')};
   });
   assert.ok(expense.shown,'Return button hidden on expense drilldown');
   assert.equal(expense.info.page,'expenses');
   assert.equal(expense.page,'expenses');
   assert.equal(expense.period,'week');
   assert.equal(expense.member,'البيت');
   assert.equal(expense.shownAfter,false);
   assert.equal(expense.scroll,expense.before,'Source scroll not restored');

   const budget=await page.evaluate(async()=>{
     switchAppPage('budgets',false);
     const spacer=document.createElement('div');
     spacer.style.height='1700px';
     spacer.className='qa-scroll-spacer';
     document.getElementById('viewBudgets').append(spacer);
     switchBudgetSubTab('current');switchBudgetMonthView('compare');
     const search=document.getElementById('cmpPeriodFrom');
     const sort=document.getElementById('cmpSort');
     if(!search||!sort)throw Error('Budget compare fields unavailable');
     search.value='2025-03-17';
     sort.value='name';
     const scrollPane=document.createElement('div');
     scrollPane.id='qaBudgetScroller';
     scrollPane.style.cssText='height:180px;max-height:180px;overflow-y:auto;';
     const tall=document.createElement('div');tall.style.height='1300px';
     scrollPane.append(tall);document.getElementById('viewBudgets').append(scrollPane);
     scrollPane.scrollTop=610;
     const initialTop=scrollPane.scrollTop;
     if(initialTop<100)throw Error('QA failed to make budgets page actually scroll');
     const body=document.getElementById('appScrollBody');
     openOperationsFiltered({category:'health',type:'expense'});
     const source=OperationsReturnHub.getState()?.page;
     OperationsReturnHub.returnToSource();
     await new Promise(r=>setTimeout(r,280));
     return {source,page:state.activePage,budgetPressed:document.getElementById('btnBudgetSubCurrent').classList.contains('active'),
       comparison:document.getElementById('btnBudgetInnerCompare').getAttribute('aria-pressed'),
       input:document.getElementById('cmpPeriodFrom')?.value,
       sort:document.getElementById('cmpSort')?.value,
       scroll:scrollPane.scrollTop,initialTop};
   });
   assert.equal(budget.source,'budgets');
   assert.equal(budget.page,'budgets');
   assert.ok(budget.budgetPressed,'Budget tab changed after back');
   assert.equal(budget.comparison,'true','Budget comparison mode changed after back');
   assert.equal(budget.input,'2025-03-17','Unfinished budget form was cleared');
   assert.equal(budget.sort,'name','Budget row ordering changed after back');
   assert.equal(budget.scroll,budget.initialTop,'Budget scroll did not restore');

   const comparison=await page.evaluate(async()=>{
     switchAppPage('budgets',false);
     switchBudgetSubTab('comparisons');
     window.FamilyComparisonAudit.render();
     const month=document.getElementById('cmpAuditMonth');
     month.value='2026-04';
     month.dispatchEvent(new Event('change',{bubbles:true}));
     const span=document.getElementById('cmpAuditSpan');
     span.value='3';
     span.dispatchEvent(new Event('change',{bubbles:true}));
     const wrapper=document.createElement('div');
     wrapper.id='qaComparisonScroll';
     wrapper.style.cssText='height:120px;max-height:120px;overflow-y:auto';
     const tall=document.createElement('div');tall.style.height='900px';
     wrapper.append(tall);document.getElementById('viewBudgets').append(wrapper);
     wrapper.scrollTop=310;
     const previous=wrapper.scrollTop;
     if(previous<100)throw Error('QA comparison scroller did not move');
     OperationsReturnHub.stageOrigin();
     openOperationsFiltered({category:'food',type:'expense',
       dateFrom:'2026-02-01',dateTo:'2026-04-30',resetFilters:true});
     const origin=OperationsReturnHub.getState()?.page;
     const buttonShown=document.body.classList.contains('ops-return-context');
     OperationsReturnHub.returnToSource();
     await new Promise(resolve=>setTimeout(resolve,260));
     return {origin,buttonShown,active:state.activePage,
       tab:document.getElementById('btnBudgetSubComparisons').classList.contains('active'),
       month:document.getElementById('cmpAuditMonth')?.value,
       span:document.getElementById('cmpAuditSpan')?.value,
       scroll:wrapper.scrollTop,previous};
   });
   assert.equal(comparison.origin,'budgets','Comparison origin lost');
   assert.ok(comparison.buttonShown,'Comparison filtered drilldown return missing');
   assert.equal(comparison.active,'budgets','Return did not restore budget page');
   assert.ok(comparison.tab,'Return did not restore comparison subtab');
   assert.equal(comparison.month,'2026-04','Comparison month filter was reset');
   assert.equal(comparison.span,'3','Comparison date-range filter was reset');
   assert.equal(comparison.scroll,comparison.previous,'Comparison scroll position was reset');

   const requests=await page.evaluate(async()=>{
     switchAppPage('requests',false);
     const reason=document.getElementById('inpReqReason');
     if(!reason)throw Error('Request draft field missing');
     reason.value='طلب تجريبي لم يتم حفظه';
     openOperationsFiltered({type:'expense'});
     const source=OperationsReturnHub.getState()?.page;
     OperationsReturnHub.returnToSource();
     await new Promise(r=>setTimeout(r,230));
     return {source,page:state.activePage,reason:document.getElementById('inpReqReason')?.value};
   });
   assert.equal(requests.source,'requests');
   assert.equal(requests.page,'requests');
   assert.equal(requests.reason,'طلب تجريبي لم يتم حفظه','Unsaved request draft lost');

   const expected=await page.evaluate(async()=>{
     switchAppPage('expected',false);
     const notes=document.getElementById('inpUnifiedDebtNotes');
     if(!notes)throw Error('Expected/debt draft field missing');
     notes.value='ملاحظات دين تجريبية غير محفوظة';
     openOperationsFiltered({type:'all'});
     const source=OperationsReturnHub.getState()?.page;
     OperationsReturnHub.returnToSource();
     await new Promise(r=>setTimeout(r,230));
     return {source,page:state.activePage,notes:document.getElementById('inpUnifiedDebtNotes')?.value};
   });
   assert.equal(expected.source,'expected');
   assert.equal(expected.page,'expected');
   assert.equal(expected.notes,'ملاحظات دين تجريبية غير محفوظة','Unsaved debt draft lost');

   const summary=await page.evaluate(async()=>{
     switchAppPage('expenses',false);
     openSummaryDrawer();
     const drawer=document.getElementById('summaryLeftDrawer');
     if(!drawer.classList.contains('open'))throw Error('Summary drawer did not open');
     const draft=document.getElementById('summaryCustomDateFrom');
     if(!draft)throw Error('Summary date field missing');
     draft.value='2025-03-09';
     drillDownFromProjectCategory('all','food','طعام ومشتريات');
     const info=OperationsReturnHub.getState();
     const back=document.body.classList.contains('ops-return-context');
     OperationsReturnHub.returnToSource();
     await new Promise(r=>setTimeout(r,260));
     return {source:info?.page,wasSummary:info?.summary,back,page:state.activePage,
       drawerOpen:drawer.classList.contains('open'),draft:document.getElementById('summaryCustomDateFrom')?.value};
   });
   assert.equal(summary.source,'expenses');
   assert.ok(summary.wasSummary,'Summary must be captured before close');
   assert.ok(summary.back,'Back control absent when opened from summary');
   assert.equal(summary.page,'expenses');
   assert.equal(summary.drawerOpen,true,'Summary drawer not reopened');
   assert.equal(summary.draft,'2025-03-09','Unfinished summary date lost');

   const operations=await page.evaluate(()=>{
     document.getElementById('navTabOperations').click();
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
   console.log('UNIVERSAL_LEDGER_BACK',width,JSON.stringify({expense,budget,requests,expected,summary,operations,normal}));
   assert.deepEqual(errors,[],'Application JavaScript errors');
   await context.close();
  }
  console.log('PASS: universal ledger back, exact source tab, filters, unfinished form, ordering and scroll');
 }finally{await browser.close();}
})().catch(err=>{console.error('UNIVERSAL_LEDGER_BACK_FAILED',err.stack||err);process.exitCode=1;});
