/* Regression: a single mobile-friendly comparison, read-only data, accurate variance.
 * QA data live only in the disposable browser context, not in user storage. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
fs.mkdirSync('screenshots',{recursive:true});
const BASE=process.env.APP_URL||'http://127.0.0.1:8765/';
const numbers=s=>String(s||'').replace(/[٠-٩]/g,ch=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(ch)))
  .replace(/٬/g,',').replace(/٫/g,'.');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try{
    for(const width of [380,1280]){
      const context=await browser.newContext({viewport:{width,height:850},locale:'ar-EG',
        timezoneId:'Asia/Riyadh',serviceWorkers:'block'});
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(BASE+'?comparison_mobile_qa='+width,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>typeof switchBudgetSubTab==='function'&&!!window.FamilyComparisonAudit?.render,
        null,{timeout:30000});
      await page.locator('#navTabBudgets').click({timeout:12000});
      await page.locator('#btnBudgetSubComparisons').click({timeout:12000});
      await page.waitForSelector('#cmpAuditApp .cmp-audit-row',{timeout:15000});

      const start=await page.evaluate(()=>{
        const monthly=document.getElementById('panelMonthlyBudget');
        const obsolete=document.getElementById('panelBudgetComparisons');
        const tab=document.getElementById('btnBudgetSubComparisons');
        const rows=document.querySelectorAll('#cmpAuditApp .cmp-audit-row');
        return {monthlyVisible:getComputedStyle(monthly).display!=='none',
          obsoleteHidden:getComputedStyle(obsolete).display==='none',
          tabLabel:tab.textContent.trim(),rowCount:rows.length,
          summaryCount:document.querySelectorAll('#cmpAuditApp .cmp-audit-kpi').length,
          overflow:document.documentElement.scrollWidth-innerWidth};
      });
      assert.equal(start.monthlyVisible,true,'Monthly budget workspace must remain the host');
      assert.equal(start.obsoleteHidden,true,'No secondary comparisons page');
      assert.ok(!start.tabLabel.includes('الجديدة'),'Only one comparisons button remains');
      assert.equal(start.rowCount,9,'Show all expense categories including zero amounts');
      assert.equal(start.summaryCount,4,'Show estimated, actual, difference and rate');
      assert.ok(start.overflow<=3,'Mobile layout must not scroll horizontally');

      await page.evaluate(()=>{
        state.transactions=[
          {id:'q1',type:'expense',date:'2026-06-15',category:'food',amount:2400},
          {id:'q2',type:'expense',date:'2026-06-15',category:'education',amount:1450},
          {id:'q3',type:'expense',date:'2026-06-15',category:'transport',amount:700},
          {id:'q4',type:'expense',date:'2026-06-15',category:'other',amount:500},
          {id:'q5',type:'expense',date:'2026-06-15',category:'bills',amount:750},
          {id:'q6',type:'expense',date:'2026-06-15',category:'health',amount:900},
          {id:'q7',type:'income',date:'2026-06-15',category:'food',amount:9999}
        ];
        const planned=[['food',2000],['education',1500],['transport',800],
          ['other',700],['bills',600],['health',500]];
        state.monthlyBudgets=[{id:'qa-audit',month:'2026-06',
          items:planned.map(([category,amount],i)=>({id:'qa-'+i,category,amount}))}];
        state.activeBudgetId='qa-audit';
        window.FamilyComparisonAudit.render();
        const month=document.getElementById('cmpAuditMonth');
        month.value='2026-06';
        month.dispatchEvent(new Event('change',{bubbles:true}));
      });
      const actual=await page.evaluate(()=>{
        const kpis=[...document.querySelectorAll('#cmpAuditApp .cmp-audit-kpi strong')]
          .map(e=>e.textContent.trim());
        const food=[...document.querySelectorAll('#cmpAuditApp .cmp-audit-row')]
          .find(e=>e.textContent.includes('طعام ومشتريات'));
        return {kpis,food:food?.innerText||'',count:document.querySelectorAll('#cmpAuditApp .cmp-audit-row').length,
          overflow:document.documentElement.scrollWidth-innerWidth};
      });
      assert.ok(numbers(actual.kpis[0]).includes('6,100'),'Estimated 6,100 must come from plan');
      assert.ok(numbers(actual.kpis[1]).includes('6,700'),'Actual 6,700 must come from expense transactions');
      assert.ok(numbers(actual.kpis[2]).includes('600'),'Variance = actual minus estimated = +600');
      assert.ok(numbers(actual.kpis[3]).includes('9.84'),'Percentage = 600/6100 * 100');
      assert.ok(actual.food.includes('400'),'Food variance is 2400 - 2000 = +400');
      assert.equal(actual.count,9);
      assert.ok(actual.overflow<=3,'No horizontal overflow after actual data');
      await page.screenshot({path:'screenshots/comparison-mobile-'+width+'.png',fullPage:true});

      await page.evaluate(()=>{
        state.monthlyBudgets=[];
        state.transactions=[{id:'q-zero',type:'expense',date:'2026-06-20',
          category:'food',amount:100}];
        window.FamilyComparisonAudit.render();
      });
      const noPlan=await page.evaluate(()=>[...document.querySelectorAll('#cmpAuditApp .cmp-audit-kpi strong')]
        .map(e=>e.textContent.trim()));
      assert.equal(numbers(noPlan[0]),'0','Without a plan the estimate is zero');
      assert.equal(numbers(noPlan[1]),'100','Real expenses still count without a plan');
      assert.ok(noPlan[3].includes('غير متاح'),'Never claim 100% variance for a zero budget');

      await page.goto(BASE+'?view=comparisons&_b=audit-test',{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>document.getElementById('viewBudgets')?.classList.contains('active')
        &&!!document.querySelector('#cmpAuditApp .cmp-audit-row'),null,{timeout:20000});
      const deep=await page.evaluate(()=>({
        rows:document.querySelectorAll('#cmpAuditApp .cmp-audit-row').length,
        oldHidden:getComputedStyle(document.getElementById('panelBudgetComparisons')).display==='none',
        overflow:document.documentElement.scrollWidth-innerWidth}));
      assert.equal(deep.rows,9);
      assert.equal(deep.oldHidden,true);
      assert.ok(deep.overflow<=3);
      assert.deepEqual(errors,[],'Uncaught page errors: '+errors.join(' | '));
      await context.close();
      console.log('PASS comparison audit at '+width+'px '+JSON.stringify(start));
    }
    console.log('PASS: one accurate budget comparison UI on phone and desktop');
  }finally{await browser.close();}
})().catch(e=>{console.error('MOBILE_COMPARISON_QA_FAILED',e.stack||e);process.exitCode=1;});
