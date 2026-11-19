'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const URL=process.env.APP_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  for(const width of [320,430]){
   const context=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForFunction(()=>typeof openNewBudgetPlanModal==='function'&&typeof submitNewBudgetPlan==='function',null,{timeout:20000});
   await page.evaluate(()=>openNewBudgetPlanModal(true));
   await page.locator('#newPlanProjectInput').fill('مشروع الاختبار');
   await page.locator('#newPlanNameInput').fill('ميزانية مشروع الاختبار');
   await page.locator('#newPlanMonthInput').fill('2025-11');
   await page.locator('button[onclick="submitNewBudgetPlan()"]').click();
   let result=await page.evaluate(()=>{
     const stored=JSON.parse(localStorage.getItem('family_monefy_monthly_budgets')||'[]');
     return stored.find(p=>p.project==='مشروع الاختبار'&&p.month==='2025-11');
   });
   assert.ok(result,'Project budget was not created/persisted');
   assert.ok(Array.isArray(result.items),'Project budget items missing');
   const expectedId=result.id;
   await page.reload({waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForFunction(()=>typeof getProjectBudgetExpenses==='function',null,{timeout:20000});
   const checked=await page.evaluate(id=>{
     const plan=(state.monthlyBudgets||[]).find(p=>p.id===id);
     if(!plan)return {persist:false};
     const mk=(project,amount,type='expense',date='2025-11-13')=>({id:'qa-'+project+'-'+amount,project,amount,type,date,category:'house'});
     const selected=getProjectBudgetExpenses(plan,[
       mk('مشروع الاختبار',400),
       mk('مشروع الاختبار',850),
       mk('مشروع آخر',1500),
       mk('مشروع الاختبار',900,'income'),
       mk('مشروع الاختبار',50,'expense','2025-12-13')
     ]);
     return {persist:true,count:selected.length,actual:selected.reduce((sum,t)=>sum+(Number(t.amount)||0),0)};
   },expectedId);
   assert.deepEqual(checked,{persist:true,count:2,actual:1250});
   assert.deepEqual(errors,[],'Browser JS errors');
   console.log('PASS: unified project budget creation, persistence, month/project scoped actuals',width);
   await context.close();
  }
 }finally{await browser.close()}
})().catch(err=>{console.error('PROJECT_BUDGET_QA_FAILED',err.stack||err);process.exitCode=1});
