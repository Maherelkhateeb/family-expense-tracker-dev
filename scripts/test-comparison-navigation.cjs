/* Real-browser budget comparison navigation and mobile render regression. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const BASE=process.env.APP_URL||'http://127.0.0.1:8765/';
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try{
    for(const width of [380,1280]){
      const context=await browser.newContext({viewport:{width,height:860},locale:'ar-EG',
        timezoneId:'Asia/Riyadh',serviceWorkers:'block'});
      const page=await context.newPage(),exceptions=[];
      page.on('pageerror',e=>exceptions.push(e.message));
      await page.goto(BASE+'?comparison_nav_qa=1',{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>typeof switchAppPage==='function' &&
        typeof switchBudgetSubTab==='function' && typeof window.FamilyBudgetComparison==='object',
        null,{timeout:30000});
      await page.locator('#navTabBudgets').click({timeout:15000});
      await page.locator('#btnBudgetSubComparisons').click({timeout:15000});
      await page.waitForFunction(()=>document.querySelector('#panelBudgetComparisons .fbc h2')!==null,
        null,{timeout:15000});
      const inspect=()=>page.evaluate(()=>{
        const budget=document.getElementById('viewBudgets'),panel=document.getElementById('panelBudgetComparisons');
        const root=panel?.querySelector('.fbc');
        const visible=x=>!!x&&getComputedStyle(x).display!=='none'&&x.getBoundingClientRect().width>0;
        return {budgetVisible:visible(budget),panelVisible:visible(panel),
          headings:[...(root?.querySelectorAll('h2,h3')||[])].map(x=>x.textContent.trim()),
          cards:root?.querySelectorAll('.fbc-card').length||0,
          sampleToggle:!!root?.querySelector('[data-fbc="sample"]'),
          active:window.activeBudgetSubTab,
          scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth
        };
      });
      let result=await inspect();
      console.log('CLICK_COMPARISON_'+width+' '+JSON.stringify(result));
      assert.ok(result.budgetVisible && result.panelVisible,'Comparison panel hidden after click');
      assert.ok(result.headings.some(x=>x.includes('مقارنة الميزانية الفعلية بالتقديرية')));
      assert.equal(result.active,'comparisons');
      assert.ok(result.sampleToggle,'Sample fixture toggle missing');
      await page.locator('[data-fbc="sample"]').check();
      const sample=await page.locator('#panelBudgetComparisons').innerText();
      for(const n of ['6,100','6,700','+600'])assert.ok(sample.includes(n),'Sample data '+n+' missing');
      await page.locator('[data-fbc="toggle"]').click();
      const charts=await page.locator('#panelBudgetComparisons h3').allTextContents();
      assert.ok(charts.length>=9,'Expected table and eight graphs but got '+charts.length);
      if(width===380)assert.ok(result.scrollWidth<=width+3,'Unexpected horizontal page scroll');
      // Direct URL must open the same view without manual tab selection.
      await page.goto(BASE+'?view=comparisons&_b=20261117-nav',{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>document.querySelector('#panelBudgetComparisons .fbc h2') &&
        document.getElementById('viewBudgets')?.classList.contains('active'),null,{timeout:20000});
      result=await inspect();
      console.log('DEEPLINK_COMPARISON_'+width+' '+JSON.stringify(result));
      assert.ok(result.budgetVisible && result.panelVisible && result.active==='comparisons');
      assert.equal(exceptions.length,0,'Uncaught errors: '+exceptions.join(' | '));
      await context.close();
    }
    console.log('PASS: budget comparison link, tabs, sample, 8 charts, mobile and desktop');
  }finally{await browser.close()}
})().catch(e=>{console.error('COMPARISON_NAV_QA_FAILED',e.stack||e);process.exitCode=1});
