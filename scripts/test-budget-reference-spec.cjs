/* Reference budget dashboard regression, isolated browser context and sample data. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const BASE=process.env.APP_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const mode of ['light','dark']){
   for(const width of [380,1280]){
    const context=await browser.newContext({viewport:{width,height:850},serviceWorkers:'block',locale:'ar-EG',timezoneId:'Asia/Riyadh'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(BASE+'?budget_spec_qa='+width+'_'+mode,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.BudgetCompareEngine&&typeof switchAppPage==='function',{timeout:30000});
    const report=await page.evaluate(mode=>{
     setAppColorMode(mode);
     const entries=[
      ['food',2400],['education',1450],['transport',700],
      ['other',500],['bills',750],['health',900]];
     const estimated=[
      ['food',2000],['education',1500],['transport',800],
      ['other',700],['bills',600],['health',500]];
     const plan={id:'reference-budget-qa-2026-06',month:'2026-06',name:'موازنة مرجعية اختبارية',
      items:estimated.map(([category,amount],i)=>({id:'spec-'+i,category,title:category,amount,members:['البيت']})),categories:{},incomes:[]};
     state.transactions=entries.map(([category,amount],i)=>({
       id:'spec-expense-'+i,type:'expense',date:'2026-06-13',category,amount,member:'البيت',walletId:'cash'}));
     state.monthlyBudgets=[plan];state.activeBudgetId=plan.id;
     state.currentMemberFilter='الكل';state.currentWalletId='all';
     window.currentBudgetMonthData=plan;
     switchAppPage('budgets',true);
     switchBudgetSubTab('monthly');
     switchBudgetMonthView('compare');
     const ref=document.getElementById('cmpPeriodReference');
     document.getElementById('cmpActualFrom').value='2026-06-01';
     document.getElementById('cmpActualTo').value='2026-06-30';
     BudgetCompareEngine.onActualPeriodChange('custom');
     ref.value='plan';BudgetCompareEngine.render();
     const root=document.getElementById('cmpPeriodChartContent');
     const spec=root.querySelector('.budget-spec');
     const charts=[...root.querySelectorAll('.bs-panel h3')].map(el=>el.textContent.trim());
     const sums=root.querySelector('.bs-statline')?.textContent||'';
     const cards=[...root.querySelectorAll('.bs-row-card')];
     const missing=['food','education','transport','other','bills','health','house','daily','clothes']
       .filter(category=>!root.querySelector('.bs-table tr[data-budget-category="'+category+'"]'));
     const noPlanning=root.querySelector('.bs-table tr[data-budget-category="house"]')?.textContent.includes('غير مخطط');
     const mobileCards=getComputedStyle(root.querySelector('.bs-mobile-rows')).display;
     const gridColors=[...root.querySelectorAll('.bs-bullet-track')].map(el=>getComputedStyle(el).backgroundImage);
     const svgTitles=[...root.querySelectorAll('svg[role="img"] title')].map(t=>t.textContent);
     const oldTools=document.querySelector('#cmpPeriodChart .cmp-view-tools');
     const scroll=document.documentElement.scrollWidth;
     return {found:!!spec,charts,sums,categoryCount:cards.length,missing,noPlanning,
       mobileCards,svgTitles,oldToolsHidden:oldTools.hidden,scroll,viewport:innerWidth,
       status:document.getElementById('cmpSummary').textContent};
    },mode);
    console.log('BUDGET_REFERENCE_SPEC '+mode+'/'+width+' '+JSON.stringify(report));
    assert.ok(report.found,'Registered budget reference dashboard did not render');
    assert.equal(report.charts.length,9,'Expected table and eight visualizations');
    assert.equal(report.missing.length,0,'All expense categories, including zeros, must be included');
    assert.equal(report.categoryCount,9,'Nine financial categories must have mobile card alternatives');
    assert.ok(report.noPlanning,'Unplanned zero-budget items must be labeled');
    assert.ok(report.sums.includes('6,100')&&report.sums.includes('6,700')&&report.sums.includes('600'),
      'Reference sample total reconciliation failed');
    assert.ok(report.oldToolsHidden,'Legacy chart modes should not appear in the new budget view');
    assert.ok(report.svgTitles.length>=3,'Charts need accessible SVG titles');
    assert.ok(report.scroll<=report.viewport+3,'No horizontal scroll at '+width);
    assert.equal(report.mobileCards,width===380?'block':'none','Incorrect responsive table/mobile mode');
    assert.deepEqual(errors,[],'New dashboard caused runtime exceptions');
    await context.close();
   }
  }
  console.log('PASS: 8 reference charts, zero-budget categories, totals, theme and 380px viewport');
 } finally{await browser.close();}
})().catch(error=>{console.error('BUDGET_REFERENCE_SPEC_FAILED',error.stack||error);process.exitCode=1;});
