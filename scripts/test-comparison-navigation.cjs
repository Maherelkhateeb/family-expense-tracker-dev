/* Browser regression for the merged monthly budget comparison page.
   Test transactions are held only in disposable browser state. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
require('node:fs').mkdirSync('screenshots',{recursive:true});
const BASE=process.env.APP_URL||'http://127.0.0.1:8765/';
const normalizeNumbers=s=>String(s||'').replace(/[٠-٩]/g,ch=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(ch)))
  .replace(/٬/g,',').replace(/٫/g,'.');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try{
    for(const width of [380,1280]){
      const ctx=await browser.newContext({viewport:{width,height:850},locale:'ar-EG',timezoneId:'Asia/Riyadh',serviceWorkers:'block'});
      const page=await ctx.newPage(),errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(BASE+'?comparison_unified_qa='+width,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>typeof switchAppPage==='function'&&typeof switchBudgetSubTab==='function'&&
        !!window.BudgetCompareEngine?.render,null,{timeout:30000});

      // One visible destination for both the monthly tab and the former 'new comparisons' tab.
      await page.locator('#navTabBudgets').click({timeout:12000});
      await page.locator('#btnBudgetSubComparisons').click({timeout:12000});
      await page.waitForFunction(()=>!!document.querySelector('#cmpPeriodChartContent .budget-spec'),null,{timeout:15000});
      let found=await page.evaluate(()=>{
        const monthly=document.getElementById('panelMonthlyBudget'),old=document.getElementById('panelBudgetComparisons');
        const cards=document.querySelector('#cmpPeriodChartContent .budget-spec');
        return {monthlyVisible:getComputedStyle(monthly).display!=='none',
          oldHidden:getComputedStyle(old).display==='none',
          kpi:document.querySelectorAll('#cmpSummary .cmp-unified-kpi').length,
          titles:[...cards.querySelectorAll('.bs-panel h3')].map(x=>x.textContent.trim()),
          advancedOpen:document.getElementById('cmpUnifiedAdvancedCharts')?.open,
          pageWidth:document.documentElement.scrollWidth,viewport:innerWidth};
      });
      console.log('UNIFIED_ENTRY '+width+' '+JSON.stringify(found));
      assert.ok(found.monthlyVisible&&found.oldHidden,'Comparison must use the one monthly workspace');
      assert.equal(found.kpi,4,'Expected four compact summary cards');
      assert.equal(found.titles.length,9,'Expected one table and eight chart panels');
      assert.equal(found.advancedOpen,false,'Additional five charts should be collapsed on first visit');
      assert.ok(found.pageWidth<=found.viewport+3,'Horizontal page overflow');

      // Known isolated actual and previous-month data must drive exactly the same chart totals.
      await page.evaluate(()=>{
        state.transactions=[
          {id:'qa-food-june',type:'expense',date:'2026-06-15',category:'food',amount:2400,member:'البيت'},
          {id:'qa-edu-june',type:'expense',date:'2026-06-15',category:'education',amount:1450,member:'البيت'},
          {id:'qa-transport-june',type:'expense',date:'2026-06-15',category:'transport',amount:700,member:'البيت'},
          {id:'qa-other-june',type:'expense',date:'2026-06-15',category:'other',amount:500,member:'البيت'},
          {id:'qa-bills-june',type:'expense',date:'2026-06-15',category:'bills',amount:750,member:'البيت'},
          {id:'qa-health-june',type:'expense',date:'2026-06-15',category:'health',amount:900,member:'البيت'},
          {id:'qa-food-may',type:'expense',date:'2026-05-15',category:'food',amount:1800,member:'البيت'},
          {id:'qa-edu-may',type:'expense',date:'2026-05-15',category:'education',amount:1300,member:'البيت'},
          {id:'qa-bills-may',type:'expense',date:'2026-05-15',category:'bills',amount:500,member:'البيت'}
        ];
        const planned=[['food',2000],['education',1500],['transport',800],
          ['other',700],['bills',600],['health',500]];
        state.monthlyBudgets=[{id:'qa-unified-plan',name:'QA',month:'2026-06',
          items:planned.map(([category,amount],i)=>({id:'qa-'+i,category,amount,members:['البيت']}))}];
        state.activeBudgetId='qa-unified-plan';
        document.getElementById('cmpActualFrom').value='2026-06-01';
        document.getElementById('cmpActualTo').value='2026-06-30';
        document.getElementById('cmpPeriodReference').value='plan';
        window.BudgetCompareEngine.onActualPeriodChange('custom');
        window.BudgetCompareEngine.render();
      });
      const plan=await page.evaluate(()=>{
        const root=document.getElementById('cmpPeriodChartContent');
        const text=root.innerText||root.textContent;
        return {text,summary:document.getElementById('cmpSummary').innerText,
          count:root.querySelectorAll('.bs-panel h3').length,
          foot:root.querySelector('.bs-table tfoot')?.innerText};
      });
      assert.equal(plan.count,9,'Plan should include all eight reference charts');
      console.log('UNIFIED_PLAN_'+width+' '+JSON.stringify({
        summary:normalizeNumbers(plan.summary),foot:normalizeNumbers(plan.foot)
      }));
      assert.ok(normalizeNumbers(plan.summary).includes('6,700')&&
        normalizeNumbers(plan.summary).includes('6,100')&&
        normalizeNumbers(plan.summary).includes('600'),
        'Plan totals must reconcile from the same selected filters');
      assert.ok(plan.foot.includes('6,700')&&plan.foot.includes('6,100'),'Table totals must equal summary totals');

      await page.locator('#cmpUnifiedShowAll').click({timeout:10000});
      assert.equal(await page.locator('#cmpUnifiedAdvancedCharts').evaluate(e=>e.open),true);
      assert.equal(await page.locator('#cmpPeriodChartContent .bs-panel h3').count(),9);
      await page.screenshot({path:'screenshots/comparison-unified-'+width+'.png',fullPage:true});

      // Compare the same June expenses against May, not the saved June budget.
      const previous=await page.evaluate(()=>{
        document.getElementById('cmpPeriodReference').value='custom';
        document.getElementById('cmpPeriodFrom').value='2026-05-01';
        document.getElementById('cmpPeriodTo').value='2026-05-31';
        window.BudgetCompareEngine.selectReference();
        const grid=document.querySelector('#cmpPeriodChartContent .budget-spec');
        const heat=grid.querySelectorAll('.bs-heat-cell');
        const summary=document.getElementById('cmpSummary').innerText;
        const cumulative=grid.querySelector('.bs-cumulative-legend')?.innerText||'';
        return {summary,cumulative,heatCount:heat.length,
          mainLabel:grid.querySelector('.bs-table th')?.textContent,
          extraOpen:document.getElementById('cmpUnifiedAdvancedCharts').open};
      });
      console.log('UNIFIED_PREVIOUS '+width+' '+JSON.stringify(previous));
      assert.ok(normalizeNumbers(previous.summary).includes('6,700')&&
        normalizeNumbers(previous.summary).includes('3,600'),
        'Selected previous-period totals ignored');
      assert.ok(previous.cumulative.includes('3,600')&&previous.cumulative.includes('6,700'),
        'Cumulative chart must use the selected previous period');
      assert.ok(previous.heatCount>0,'Previous-period heatmap missing');
      assert.ok(previous.extraOpen,'Advanced chart should keep expansion state after filter change');

      // Direct link must land in the SAME unified page, not the old duplicate pane.
      await page.goto(BASE+'?view=comparisons&_b=unified-test',{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>document.getElementById('viewBudgets')?.classList.contains('active')&&
        document.querySelector('#cmpPeriodChartContent .budget-spec'),null,{timeout:20000});
      const deeplink=await page.evaluate(()=>({
        unified:getComputedStyle(document.getElementById('panelMonthlyBudget')).display!=='none',
        oldHidden:getComputedStyle(document.getElementById('panelBudgetComparisons')).display==='none',
        chartCount:document.querySelectorAll('#cmpPeriodChartContent .bs-panel').length,
        pageWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(deeplink.unified&&deeplink.oldHidden);
      assert.equal(deeplink.chartCount,9);
      assert.ok(deeplink.pageWidth<=deeplink.viewport+3,'Deep link horizontal overflow');
      assert.deepEqual(errors,[],'Uncaught browser errors: '+errors.join(' | '));
      await ctx.close();
    }
    console.log('PASS: merged comparisons with 8 synchronized charts on phone and desktop');
  }finally{await browser.close();}
})().catch(e=>{console.error('UNIFIED_COMPARISON_QA_FAILED',e.stack||e);process.exitCode=1;});
