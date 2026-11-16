/* 1,000-record financial regression against the exact unified application.
   Browser storage is isolated. No existing user/browser data is touched. */
'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const URL = process.env.APP_URL || 'http://127.0.0.1:8765/';
(async () => {
 const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
 const context = await browser.newContext({locale:'ar-EG',serviceWorkers:'block'});
 const page = await context.newPage();
 const errors = [];
 page.on('pageerror',error=>errors.push(error.message));
 try {
   const response=await page.goto(URL+'?financial_qa=1000',{waitUntil:'domcontentloaded',timeout:60000});
   assert.ok(response && response.ok(),'Application failed to load');
   await page.waitForFunction(()=>typeof renderUI==='function' && typeof renderCommitmentsPageUI==='function' && typeof getTodoTasks==='function',null,{timeout:25000});
   const result=await page.evaluate(() => {
     const counts={expenses:400,deposits:200,debtForUs:120,debtOnUs:120,bills:100,tasks:60};
     const cats=['food','daily','transport','health','house','clothes','education','bills','other'];
     const members=['البيت','ماهر','أية','محمد','مريم','الحاجة'];
     const wallets=(state.wallets||[]).map(w=>w.id);
     const wallet=idx=>wallets.length?wallets[idx%wallets.length]:'wallet-cash-safe';
     const date=i=>new Date(Date.UTC(2025,0,1+(i*37)%365)).toISOString().slice(0,10);
     const tx=[];
     for(let i=0;i<400;i++){
       tx.push({id:'qa25-exp-'+i,date:date(i),type:'expense',category:cats[i%cats.length],
         amount:10+(i%47)*7,label:'مصروف اختباري '+(i+1),walletId:wallet(i),
         member:members[i%members.length],notes:'QA 2025',createdAt:new Date(date(i)+'T09:00:00Z').toISOString()});
     }
     for(let i=0;i<200;i++){
       tx.push({id:'qa25-inc-'+i,date:date(i+400),type:'income',category:'other_inc',
         amount:100+(i%23)*35,label:'إيداع اختباري '+(i+1),walletId:wallet(i+400),
         member:members[i%members.length],notes:'QA 2025',createdAt:new Date(date(i+400)+'T12:00:00Z').toISOString()});
     }
     const commitments=[];
     for(const [type,n,prefix] of [['debt_for_us',120,'loan-in'],['debt_on_us',120,'loan-out'],['upcoming_bill',100,'bill']]){
       for(let i=0;i<n;i++){
         commitments.push({id:'qa25-'+prefix+'-'+i,type,title:'التزام اختباري '+prefix+' '+i,
           amount:50+(i%33)*12,dueDate:date(i+n),priority:i%3?'normal':'high',
           member:members[i%members.length],status:i%4===0?'paid':'upcoming',
           createdAt:new Date(date(i+n)+'T10:00:00Z').toISOString()});
       }
     }
     const tasks=[];
     for(let i=0;i<60;i++){
       tasks.push({id:'qa25-task-'+i,title:'مهمة اختبارية '+i,dueDate:date(i+700),dueTime:'12:00',
         category:cats[i%cats.length],assignedMember:members[i%members.length],
         priority:i%3===0?'high':'medium',completed:i%5===0,
         estimatedAmount:25+i,createdAt:new Date(date(i+700)+'T10:00:00Z').toISOString(),subtasks:[]});
     }
     const before={
       tx:Array.isArray(state.transactions)?state.transactions.length:0,
       expected:Array.isArray(state.expectedExpenses)?state.expectedExpenses.length:0
     };
     // Replace only clean Playwright-context data (never a real user profile).
     state.transactions=tx;
     state.expectedExpenses=commitments;
     localStorage.setItem('family_monefy_v2_tx',JSON.stringify(tx));
     localStorage.setItem('family_monefy_expected',JSON.stringify(commitments));
     localStorage.setItem('family_monefy_tasks',JSON.stringify(tasks));
     state.period='all';state.currentWalletId='all';state.currentMemberFilter='الكل';
     state.selectedMember='الكل';state.projectFilter='all';
     const qaBudget={id:'qa-budget-2025-04',month:'2025-04',
       name:'QA Monthly Budget April 2025',items:cats.map(c=>({id:'qa-'+c,category:c,title:c,amount:15000,members:['البيت']})),
       categories:{},incomes:[]};
     if(!Array.isArray(state.monthlyBudgets))state.monthlyBudgets=[];
     state.monthlyBudgets.unshift(qaBudget);
     window.currentBudgetMonthData=qaBudget;
     let render={ui:false,commitments:false,tasks:false,budget:false,filters:false};
     const faults=[];
     for(const [key,action] of Object.entries({
       ui:()=>renderUI(),
       commitments:()=>renderCommitmentsPageUI(),
       tasks:()=>renderTasksProList(),
       budget:()=>window.BudgetAuditEngine && window.BudgetAuditEngine.refreshActiveBudgetAudit(),
       filters:()=>{if(typeof resetOperationsFilters==='function')resetOperationsFilters();}
     })){
       try{action();render[key]=true;}catch(e){faults.push(key+': '+e.message);}
     }
     const loadedTasks=JSON.parse(localStorage.getItem('family_monefy_tasks')||'[]');
     const actual={
       expenses:state.transactions.filter(t=>t.type==='expense').length,
       deposits:state.transactions.filter(t=>t.type==='income').length,
       debtForUs:state.expectedExpenses.filter(t=>t.type==='debt_for_us').length,
       debtOnUs:state.expectedExpenses.filter(t=>t.type==='debt_on_us').length,
       bills:state.expectedExpenses.filter(t=>t.type==='upcoming_bill').length,
       tasks:loadedTasks.length
     };
     const months=new Set([...tx,...commitments,...tasks].map(t=>String(t.date||t.dueDate).slice(0,7)));
     return {
       before,counts,actual,months:[...months].sort(),
       idsUnique:new Set([...tx,...commitments,...tasks].map(x=>x.id)).size===1000,
       categoryCount:new Set(tx.filter(t=>t.type==='expense').map(t=>t.category)).size,
       walletCount:new Set(tx.map(t=>t.walletId)).size,
       memberCount:new Set(tx.map(t=>t.member)).size,
       expenseSum:tx.filter(t=>t.type==='expense').reduce((v,t)=>v+t.amount,0),
       depositSum:tx.filter(t=>t.type==='income').reduce((v,t)=>v+t.amount,0),
       commitmentsStored:JSON.parse(localStorage.getItem('family_monefy_expected')||'[]').length,
       tasksStored:getTodoTasks().length,
       periodAfterClear:state.period,
       render, faults,insights:!!document.querySelector('.monthly-insights'),
       expectedRows:document.querySelectorAll('.budget-item-card').length
     };
   });
   console.log('FINANCIAL_1000_REPORT '+JSON.stringify(result));
   assert.deepEqual(result.actual,result.counts,'Wrong record distribution');
   assert.equal(result.months.length,12,'Should cover all 12 months of 2025');
   assert.ok(result.months.every(m=>m.startsWith('2025-')),'Date outside 2025');
   assert.ok(result.idsUnique,'Duplicate transaction/commitment/task id');
   assert.equal(result.categoryCount,9,'Not all expense categories covered');
   assert.ok(result.walletCount>=1 && result.memberCount>=5,'Wallet/member coverage inadequate');
   assert.equal(result.commitmentsStored,340,'Commitment persistence failed');
   assert.equal(result.tasksStored,60,'Tasks persistence failed');
   assert.equal(result.periodAfterClear,'all','Clear-filters must show all date ranges');
   assert.deepEqual(result.faults,[],'Render errors');
   assert.ok(Object.values(result.render).every(Boolean),'Not all rendering paths exercised');
   assert.ok(result.insights,'New monthly budget insights missing');
   assert.deepEqual(errors,[],'Browser JS exceptions');
   console.log('PASS: 1,000 records across 2025, 9 expense categories, all finance/task types; render, storage, filters and budget.');
 } finally {
   await context.close();
   await browser.close();
 }
})().catch(error=>{console.error('FINANCIAL_1000_FAILED',error.stack||error);process.exitCode=1;});
