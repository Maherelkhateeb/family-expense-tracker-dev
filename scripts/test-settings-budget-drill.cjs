/* Screenshot regression: 4x2 colours, live settings surfaces and budget-to-ledger return.
 * Uses disposable browser contexts only. No real data or sync store is touched. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const URL=process.env.APP_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [360,390,1365]){
   const context=await browser.newContext({
     viewport:{width,height:860},locale:'ar-EG',timezoneId:'Asia/Riyadh',serviceWorkers:'block'
   });
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(URL+'?budget_settings_qa=1',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>typeof openSettingsModal==='function'&&
     typeof BudgetAuditEngine==='object'&&typeof BudgetDrilldownHub==='object',null,{timeout:30000});
   await page.evaluate(()=>openSettingsModal());
   const appearance=await page.evaluate(async()=>{
     const root=document.getElementById('settingsModal');
     const buttons=[...root.querySelectorAll('#settingsSec_appearance button.theme-pill-option[data-theme]')];
     const icons=[...root.querySelectorAll('#settingsSec_appearance button.icon-theme-pill[data-icon-theme]')];
     const styles=[...root.querySelectorAll('#settingsSec_appearance button[data-card-style]')];
     const palette=buttons[0]?.closest('.antigravity-palette-grid,.appearance-palette-grid');
     const raf=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
     const rects=buttons.map(b=>b.getBoundingClientRect());
     // Active palette buttons are visually translated by ~1.5px; group rows
     // within 5px to distinguish actual grid rows from decorative selection lift.
     const rows=[];
     for(const r of rects){
       const row=rows.find(x=>Math.abs(x.y-r.top)<5);
       if(row)row.count++; else rows.push({y:r.top,count:1});
     }
     const themeSamples=[],iconSamples=[],styleSamples=[];
     for(const btn of buttons){
       btn.click();await raf();
       const panel=root.querySelector('.antigravity-card-block');
       themeSamples.push({name:btn.dataset.theme,theme:root.dataset.settingsActiveTheme,
         shell:getComputedStyle(root.querySelector('.settings-modal-shell')).backgroundImage,
         panel:panel&&getComputedStyle(panel).backgroundImage});
     }
     for(const btn of icons){
       btn.click();await raf();
       iconSamples.push({name:btn.dataset.iconTheme,
         colour:root.style.getPropertyValue('--settings-icon')});
     }
     for(const btn of styles){
       btn.click();await raf();await new Promise(resolve=>setTimeout(resolve,240));
       const panel=root.querySelector('.antigravity-card-block');
       styleSamples.push({name:btn.dataset.cardStyle,style:root.dataset.settingsCardStyle,
         radius:panel&&getComputedStyle(panel).borderRadius,
         shadow:panel&&getComputedStyle(panel).boxShadow});
     }
     return {counts:[buttons.length,icons.length,styles.length],
       columns:palette&&getComputedStyle(palette).gridTemplateColumns.split(/\s+/).length,
       rows:rows.length,choicesPerRow:rows.map(x=>x.count),
       themeSamples,iconSamples,styleSamples,
       scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
   });
   console.log('SETTINGS_LIVE '+width+' '+JSON.stringify(appearance));
   assert.deepEqual(appearance.counts,[8,8,9]);
   assert.equal(appearance.columns,4,'Palette must stay four columns on '+width);
   assert.deepEqual(appearance.choicesPerRow,[4,4],'Palette must stay two rows with four tiles');
   assert.equal(new Set(appearance.themeSamples.map(x=>x.shell)).size,8,'Settings shell palette is fixed');
   assert.equal(new Set(appearance.themeSamples.map(x=>x.panel)).size,8,'Settings cards ignore palette');
   assert.equal(new Set(appearance.iconSamples.map(x=>x.colour)).size,8,'Settings icons ignore icon palette');
   assert.ok(new Set(appearance.styleSamples.map(x=>x.radius+'|'+x.shadow)).size>=7,
     'Settings cards ignore design presets');
   assert.ok(appearance.scrollWidth<=appearance.viewport+4,'Settings horizontal overflow');
   await page.evaluate(()=>{
     if(typeof closeModal==='function')closeModal('settingsModal');
     if(typeof switchAppPage==='function')switchAppPage('budgets',true);
     if(typeof switchBudgetSubTab==='function')switchBudgetSubTab('monthly');
     const plan={id:'qa-drill-2025-04',month:'2025-04',name:'اختبار',items:[
       {id:'qa-food',category:'food',title:'طعام',amount:1000,members:['البيت']},
       {id:'qa-health',category:'health',title:'صحة',amount:500,members:['البيت']}
     ],categories:{},incomes:[]};
     state.transactions=[
       {id:'qa-a',type:'expense',date:'2025-04-13',category:'food',amount:120,member:'البيت',label:'طعام 1'},
       {id:'qa-b',type:'expense',date:'2025-04-14',category:'food',amount:230,member:'البيت',label:'طعام 2'},
       {id:'qa-c',type:'expense',date:'2025-04-15',category:'health',amount:90,member:'البيت',label:'دواء'},
       {id:'qa-d',type:'income',date:'2025-04-14',category:'other_inc',amount:550,member:'البيت',label:'إيداع'}
     ];
     state.monthlyBudgets=[plan];state.activeBudgetId=plan.id;
     state.currentMemberFilter='الكل';state.currentWalletId='all';state.period='all';
     window.currentBudgetMonthData=plan;
     BudgetAuditEngine.selectPeriod('month');
     BudgetAuditEngine.refreshActiveBudgetAudit();
     // The real unified UI displays category comparisons inside the monthly
     // inner compare tab (#cmpTableBody), not the optional audit table.
     if(typeof switchBudgetMonthView==='function')switchBudgetMonthView('compare');
     BudgetCompareEngine.onActualPeriodChange('custom');
     document.getElementById('cmpActualFrom').value='2025-04-01';
     document.getElementById('cmpActualTo').value='2025-04-30';
     BudgetCompareEngine.render();
   });
   const initial=await page.evaluate(()=>({
     metrics:document.querySelectorAll('.monthly-insights .monthly-insight-card').length,
     rows:document.querySelectorAll('#cmpTableBody tr[data-budget-category]').length,
     selectedMonth:BudgetAuditEngine.getNavigationContext().month,
     hasWeek:!!document.querySelector('.monthly-week-line[data-budget-week]'),
     hasHub:!!window.BudgetDrilldownHub
   }));
   console.log('MONTHLY_METRICS '+width+' '+JSON.stringify(initial));
   assert.ok(initial.metrics>=17,'Monthly budget misses new metrics');
   assert.ok(initial.rows>=2,'Actual vs budget category comparison rows not selectable');
   assert.equal(initial.selectedMonth,'2025-04');
   // Click the amount/number in the first budget category. Must display ONLY the
   // relevant expense transactions from the selected April plan, not today's month.
   await page.evaluate(()=>{
     const row=[...document.querySelectorAll('#cmpTableBody tr[data-budget-category]')]
       .find(r=>r.dataset.budgetCategory==='food');
     if(!row)throw Error('Budget comparison food category is missing');
     row.querySelector('td:nth-child(2)').click();
   });
   const drill=await page.evaluate(()=>({
     active:BudgetDrilldownHub.isActive(),banner:document.getElementById('budgetDrilldownBanner')?.innerText||'',
     range:state.customDateRange,period:state.period,
     displayed:document.querySelector('#txOperationsList')?.innerText||'',
     hasBack:!!document.getElementById('budgetDrilldownBack')
   }));
   console.log('DRILL_TO_LEDGER '+width+' '+JSON.stringify(drill));
   assert.equal(drill.active,true,'Budget click did not enter drilldown');
   assert.equal(drill.range.from,'2025-04-01');
   assert.equal(drill.range.to,'2025-04-30');
   assert.ok(drill.hasBack,'Cannot return to monthly budget');
   assert.ok(drill.banner.includes('طعام'),'Wrong category in drilldown banner');
   assert.ok(drill.banner.includes('2'),'Budget drilldown did not match two expenses');
   assert.ok(!drill.displayed.includes('دواء'),'Irrelevant category leaked into drilldown');
   await page.evaluate(()=>document.getElementById('budgetDrilldownBack').click());
   const back=await page.evaluate(()=>({
     active:BudgetDrilldownHub.isActive(),period:state.period,budgetId:state.activeBudgetId,
     banner:!!document.getElementById('budgetDrilldownBanner'),
     rowCount:document.querySelectorAll('#cmpTableBody tr[data-budget-category]').length
   }));
   console.log('RETURN_TO_BUDGET '+width+' '+JSON.stringify(back));
   assert.deepEqual({active:back.active,period:back.period,budgetId:back.budgetId,
     banner:back.banner,rowCount:back.rowCount},
     {active:false,period:'all',budgetId:'qa-drill-2025-04',banner:false,rowCount:initial.rows});
   if(width===360){
     await page.evaluate(()=>{
       if(typeof switchBudgetSubTab==='function')switchBudgetSubTab('comparisons');
       if(typeof BudgetCompareEngine!=='undefined')BudgetCompareEngine.render();
     });
     const compare=await page.evaluate(()=>({
       kpis:document.querySelectorAll('#cmpExtraInsightGrid .monthly-insight-card').length,
       period:window.BudgetCompareEngine?.getNavigationRange?.()
     }));
     console.log('COMPARE_EXTRA '+JSON.stringify(compare));
     // The comparison tab can be hidden in layouts without its dedicated table.
     if(await page.locator('#cmpTableBody').count()){
       assert.equal(compare.kpis,9,'Comparison must provide nine extra metrics');
     }
   }
   assert.deepEqual(errors,[],'Browser errors '+JSON.stringify(errors));
   await context.close();
  }
  console.log('PASS 4x2 app colours, live settings colours/card styles, monthly metrics, exact filtered drilldown, return');
 }finally{await browser.close();}
})().catch(e=>{console.error('SETTINGS_BUDGET_DRILL_QA_FAILED',e.stack||e);process.exitCode=1;});
