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
   assert.ok(appearance.themeSamples.every(x=>x.panel.startsWith('linear-gradient')), 'A palette ignored the settings cards');
   assert.equal(new Set(appearance.iconSamples.map(x=>x.colour)).size,8,'Settings icons ignore icon palette');
   assert.ok(new Set(appearance.styleSamples.map(x=>x.radius+'|'+x.shadow)).size>=7,
     'Settings cards ignore design presets');
   assert.ok(appearance.scrollWidth<=appearance.viewport+4,'Settings horizontal overflow');
   for (const mode of ['dark','light']) {
     const labels=await page.evaluate(async mode=>{
       setAppColorMode(mode);
       const root=document.getElementById('settingsModal');
       const output=[];
       for(const choice of root.querySelectorAll('.card-style-option')){
         choice.click();
         await new Promise(resolve=>setTimeout(resolve,50));
         const label=choice.querySelector('strong');
         const styles=getComputedStyle(label);
         const color=getComputedStyle(choice);
         const luminance=rgb=>{
           const [r,g,b]=rgb.match(/\d+(?:\.\d+)?/g).slice(0,3).map(Number).map(value=>{
             const srgb=value/255;
             return srgb<=.04045?srgb/12.92:((srgb+.055)/1.055)**2.4;
           });
           return .2126*r+.7152*g+.0722*b;
         };
         const toRgb=value=>{
           const ctx=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
           ctx.fillStyle=value;ctx.fillRect(0,0,1,1);
           return Array.from(ctx.getImageData(0,0,1,1).data).slice(0,3).join(' ');
         };
         const text=luminance(toRgb(styles.webkitTextFillColor));
         const background=luminance(toRgb(color.backgroundColor));
         output.push({label:label.textContent.trim(),visible:label.getBoundingClientRect().width>0&&
           label.getBoundingClientRect().height>0&&styles.visibility==='visible',selected:choice.getAttribute('aria-pressed'),
           contrast:(Math.max(text,background)+.05)/(Math.min(text,background)+.05)});
       }
       return output;
     },mode);
     assert.equal(labels.length,9);
     assert.ok(labels.every(x=>x.label&&x.visible&&x.selected==='true'&&x.contrast>=4.5),JSON.stringify(labels));
   }

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
   const picker=page.locator('#customDatePickerDrawer');
   await page.locator('#cmpActualPeriod').selectOption('thisMonth');
   await page.locator('#cmpActualPeriod').selectOption('custom');
   assert.ok(await picker.isVisible(),'Custom primary period must open the date picker immediately');
   await page.locator('#customDatePickerConfirmButton').click();
   assert.equal(await page.locator('#cmpActualTo').inputValue(),'2025-04-30');
   await page.evaluate(()=>{
     document.getElementById('cmpPeriodFrom').value='2025-03-01';
     document.getElementById('cmpPeriodTo').value='2025-03-31';
   });
   await page.locator('#cmpPeriodReference').selectOption('custom');
   assert.ok(await picker.isVisible(),'Custom reference must open the date picker immediately');
   await page.locator('#customDatePickerConfirmButton').click();
   assert.equal(await page.locator('#cmpPeriodFrom').inputValue(),'2025-03-01');
   assert.equal(await page.locator('#cmpPeriodTo').inputValue(),'2025-03-31');
   assert.equal(await page.locator('#cmpActualTo').inputValue(),'2025-04-30');
   await page.locator('#cmpPeriodCustom button').click();
   await page.locator('#customDatePickerResetButton').click();
   assert.equal(await page.locator('#cmpPeriodFrom').inputValue(),'');
   const display=await page.evaluate(()=>{
     const root=document.getElementById('cmpPeriodChart');
     const content=document.getElementById('cmpPeriodChartContent');
     const reference=document.getElementById('cmpPeriodReference');
     const select=value=>{reference.value=value;BudgetCompareEngine.selectReference();};
     state.transactions.push({id:'qa-prev',type:'expense',date:'2025-03-13',category:'food',amount:200,member:'البيت'});
     select('custom');
     const invalid=document.getElementById('cmpSummary').textContent.includes('اختر تاريخ البداية والنهاية');
     document.getElementById('cmpPeriodFrom').value='2025-03-01';
     document.getElementById('cmpPeriodTo').value='2025-03-31';
     BudgetCompareEngine.render();
     root.querySelector('[data-mode="paired"]').click();
     const foodPlot=root.querySelector('.cmp-column-chart [data-budget-category="food"] .cmp-column-plot');
     const actualBar=foodPlot.querySelector('.cmp-column-actual i');
     const referenceBar=foodPlot.querySelector('.cmp-column-reference i');
     const aRect=actualBar.getBoundingClientRect(),bRect=referenceBar.getBoundingClientRect();
     const paired=aRect.x!==bRect.x&&aRect.bottom===bRect.bottom&&aRect.height>bRect.height&&
       getComputedStyle(actualBar).backgroundColor!==getComputedStyle(referenceBar).backgroundColor;
     root.querySelector('[data-mode="change"]').click();
     const change=!!root.querySelector('.cmp-period-delta .positive');
     const axis=root.querySelector('.cmp-direction-key');
     if(axis.firstElementChild.getBoundingClientRect().left>=axis.lastElementChild.getBoundingClientRect().left)throw Error('Change axis labels must follow the bar direction');
     root.querySelector('[data-mode="table"]').click();
     const rankedRows=[...root.querySelectorAll('.budget-spec .bs-table tbody tr')];
     const ranking=new Intl.NumberFormat('ar-EG');
     if (EXPENSE_CATEGORIES.some(category=>!rankedRows.some(row=>row.dataset.budgetCategory===category.id))) {
       throw Error('All expense categories must appear even when both amounts are zero');
     }
     if (rankedRows.some((row,index)=>!row.querySelector('th')?.textContent.trim().startsWith(ranking.format(index+1)+'.'))) {
       throw Error('Category ranking must follow the displayed row order');
     }
     const firstRow=root.querySelector('.budget-spec .bs-table tr[data-budget-category="food"]');
     const actualColor=getComputedStyle(firstRow.querySelector('td:nth-child(3)')).backgroundColor;
     const referenceColor=getComputedStyle(firstRow.querySelector('td:nth-child(2)')).backgroundColor;
     if(actualColor===referenceColor)throw Error('Actual and reference must use distinct backgrounds');
     if(firstRow.querySelector('td:nth-child(4) bdi').dir!=='ltr')throw Error('Difference sign must use numeric direction');
     const nums=[...firstRow.querySelectorAll('td bdi')].map(el=>el.textContent.trim());
     select('sample');
     const digits=new Intl.NumberFormat('ar-EG');
     const totals=root.querySelector('#cmpSummary .cmp-unified-kpi:nth-child(2) strong').textContent;
     const sample=totals.includes(digits.format(12000));
     select('sample-low');
     const low=root.querySelector('#cmpSummary .cmp-unified-kpi:nth-child(2) strong').textContent.includes(digits.format(10000));
     select('sample-high');
     const high=root.querySelector('#cmpSummary .cmp-unified-kpi:nth-child(2) strong').textContent.includes(digits.format(14000));
     select('sample');
     document.getElementById('cmpActualFrom').value='2024-02-01';
     document.getElementById('cmpActualTo').value='2024-02-29';
     BudgetCompareEngine.render();
     const leap=root.querySelector('#cmpSummary .cmp-unified-kpi:nth-child(2) strong').textContent.includes(digits.format(12000));
     document.getElementById('cmpActualFrom').value='2025-04-01';
     document.getElementById('cmpActualTo').value='2025-04-07';
     BudgetCompareEngine.render();
     const week=root.querySelector('#cmpSummary .cmp-unified-kpi:nth-child(2) strong').textContent.includes(digits.format(2800));
     document.getElementById('cmpActualTo').value='2025-04-01';
     BudgetCompareEngine.render();
     const day=root.querySelector('#cmpSummary .cmp-unified-kpi:nth-child(2) strong').textContent.includes(digits.format(400));
     document.getElementById('cmpActualTo').value='2025-04-30';
     select('previous');
     state.transactions=state.transactions.filter(tx=>tx.id!=='qa-prev');
     BudgetCompareEngine.render();
     document.getElementById('cmpInsightDetails').open=true;
     return {invalid,paired,change,nums,sample,low,high,leap,week,day,columns:getComputedStyle(
       document.querySelector('#cmpExtraInsightGrid  .cmp-metrics')).gridTemplateColumns.split(/\s+/).length};
   });
   assert.deepEqual(display,{invalid:true,paired:true,change:true,nums:['٣٥٠','٢٠٠','+١٥٠','+٧٥٪'],
     sample:true,low:true,high:true,leap:true,week:true,day:true,columns:3});
   await page.evaluate(()=>{
     switchAppPage('expected',true);
     const nav=document.querySelector('.commitments-calendar-month');
     const title=document.getElementById('commitmentsCalendarMonthTitle');
     const toggle=document.getElementById('btnCommitmentsCalendarToggle');
     renderCommitmentsCalendar();
     const initial=title.textContent;
     const initialExpanded=toggle.getAttribute('aria-expanded');
     nav.lastElementChild.click();
     if(title.textContent===initial||toggle.getAttribute('aria-expanded')!==initialExpanded)throw Error('Calendar next/collapse interaction failed');
     nav.firstElementChild.click();
     if(title.textContent!==initial)throw Error('Calendar previous did not restore month');
     const labelBox=toggle.getBoundingClientRect(), navBox=nav.getBoundingClientRect();
     if(labelBox.width>0 && (navBox.right>labelBox.left+1||navBox.bottom<labelBox.top||navBox.top>labelBox.bottom))throw Error('Calendar navigation is not left of title');
     toggle.click();
     if(toggle.getAttribute('aria-expanded')===initialExpanded)throw Error('Calendar toggle did not update expanded state');
     toggle.click();
     switchAppPage('budgets',true);
     switchBudgetSubTab('monthly');
     switchBudgetMonthView('compare');
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
     row.querySelector('button[data-period-series="actual"]').click();
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
   const layout=await page.evaluate(()=>{
     const tabs=document.getElementById('opsSectionTabs');
     const toolbar=document.querySelector('#viewOperations .ops-search-row');
     const box=el=>el.getBoundingClientRect();
     const fits=(outer,inner)=>inner.left>=outer.left-1&&inner.right<=outer.right+1;
     const controls=[...toolbar.children].map(box);
     const panels=[tabs,toolbar,document.getElementById('budgetDrilldownBanner')];
     return {
       tabs:tabs.children.length,
       labels:[...tabs.querySelectorAll('button span')].every(label=>fits(box(label.parentElement),box(label))),
       toolbar:controls.every(item=>fits(box(toolbar),item))&&new Set(controls.map(item=>Math.round(item.top))).size===2,
       panels:panels.every(panel=>fits(box(document.getElementById('appFrame')),box(panel))),
       chips:[...document.querySelectorAll('#txOperationsList .ops-compact-chips')]
          .every(row=>[...row.children].every(chip=>fits(box(row),box(chip))))
     };
   });
   assert.deepEqual(layout,{tabs:4,labels:true,toolbar:true,panels:true,chips:true});
   await page.locator('#btnToggleOpsFilters').click();
   assert.equal(await page.locator('#btnToggleOpsFilters').getAttribute('aria-expanded'),'true');
   await page.locator('#btnToggleOpsFilters').click();
   assert.equal(await page.locator('#btnToggleOpsFilters').getAttribute('aria-expanded'),'false');

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
   await page.evaluate(()=>{
     switchBudgetSubTab('monthly');
     switchBudgetMonthView('compare');
     BudgetCompareEngine.onActualPeriodChange('custom');
     document.getElementById('cmpPeriodReference').value='plan';
     document.getElementById('cmpEstimFrom').value='2025-04-01';
     document.getElementById('cmpEstimTo').value='2025-04-30';
     BudgetCompareEngine.render();
   });
   await page.locator('#cmpEstimCustomRange .cmp-month-range-button').click();
   assert.ok(await page.locator('#customDatePickerDrawer').isVisible());
   for(const date of ['2025-04-03','2025-04-07']){
     await page.locator('#customRangeCalendarMonths [onclick="selectCustomRangeDate(\''+date+'\')"]').click();
   }
   await page.locator('#customDatePickerConfirmButton').click();
   assert.equal(await page.locator('#cmpEstimFrom').inputValue(),'2025-04-03');
   assert.equal(await page.locator('#cmpEstimTo').inputValue(),'2025-04-07');
   assert.equal((await page.locator('.cmp-summary-reference strong').innerText()).trim(),'٢٥٠');
   assert.match(await page.locator('#cmpEstimCustomRangeLabel').innerText(),/2025-04-03.*2025-04-07/);
   assert.ok(!(await page.locator('#cmpEstimFrom').isVisible()));
   assert.ok(!(await page.locator('#cmpEstimTo').isVisible()));
   assert.equal(await page.locator('#cmpActualFrom').inputValue(),'2025-04-01');
   assert.match(await page.locator('#cmpReferenceDates').innerText(),/2025-04-03.*2025-04-07/);
   await page.locator('#cmpRestoreDateLink').click();
   assert.equal(await page.locator('#cmpEstimFrom').inputValue(),'');
   assert.equal(await page.locator('#cmpEstimTo').inputValue(),'');
   assert.equal(await page.locator('#cmpEstimCustomRangeLabel').innerText(),'تاريخ الموازنة');
   assert.match(await page.locator('#cmpReferenceDates').innerText(),/2025-04-01.*2025-04-30/);
   await page.locator('#cmpPeriodReference').selectOption('previous');
   assert.match(await page.locator('#cmpReferenceDates').innerText(),/2025-03-02.*2025-03-31/);

   if(width===360){
     await page.evaluate(()=>{
       if(typeof switchBudgetSubTab==='function')switchBudgetSubTab('comparisons');
       if(typeof BudgetCompareEngine!=='undefined')BudgetCompareEngine.render();
     });
     const compare=await page.evaluate(()=>({
       kpis:document.querySelectorAll('#cmpExtraInsightGrid .cmp-metrics dt').length,
       period:window.BudgetCompareEngine?.getNavigationRange?.()
     }));
     console.log('COMPARE_EXTRA '+JSON.stringify(compare));
     // The comparison tab can be hidden in layouts without its dedicated table.
     if(await page.locator('#cmpTableBody').count()){
       assert.equal(compare.kpis,9,'Comparison must provide nine extra metrics');
     }
   }
   await page.evaluate(async()=>{
     switchAppPage('budgets',true);
     switchBudgetSubTab('monthly');
     switchBudgetMonthView('compare');
     const ledgerKey='family_monefy_budget_trial_operations_v1';
     await navigator.locks.request(ledgerKey,()=>localStorage.removeItem(ledgerKey));
     const from=document.getElementById('cmpActualFrom'), to=document.getElementById('cmpActualTo');
     BudgetCompareEngine.onActualPeriodChange('custom');
     from.value='2025-04-01';to.value='2025-04-07';
     const actual=JSON.stringify(state.transactions);
     const reference=document.getElementById('cmpPeriodReference');
     reference.value='sample';
     await BudgetCompareEngine.selectReference();
     const stored=localStorage.getItem(ledgerKey);
     const week=JSON.parse(stored).sample;
     if(Object.keys(week).length!==7||Object.values(week).flat().reduce((sum,cents)=>sum+cents,0)!==280000) {
       throw Error('Sample operations do not match the one-week total');
     }
     await BudgetCompareEngine.recordSampleOperations();
     if(localStorage.getItem(ledgerKey)!==stored)throw Error('Sample registration produced duplicates');
     to.value='2025-04-08';
     BudgetCompareEngine.render();
     await BudgetCompareEngine.recordSampleOperations();
     if(Object.keys(JSON.parse(localStorage.getItem(ledgerKey)).sample).length!==8)throw Error('Overlapping registration did not merge days');
     if(JSON.stringify(state.transactions)!==actual)throw Error('Sample registration changed real transactions');
     document.querySelector('#cmpPeriodChart [data-period-series="reference"][data-period-category="food"]').click();
   });
   await page.waitForFunction(()=>state.activeOpsSubTab==='sample');
   const sampleDetails=await page.locator('#sampleOperationsList tbody tr').allTextContents();
   assert.equal(sampleDetails.length,8);
   assert.ok(sampleDetails.every(row=>row.includes('طعام ومشتريات')&&row.includes('موازنة تجريبية أساسية')));
   await page.locator('#sampleOperationsBack').click();
   await page.waitForFunction(()=>getComputedStyle(document.getElementById('panelBudgetCompare')).display!=='none');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>typeof BudgetCompareEngine==='object'&&typeof switchAppPage==='function');
   await page.evaluate(()=>{switchAppPage('operations');switchOperationsSubTab('sample');});
   assert.match(await page.locator('#sampleOperationsList').innerText(),/٧٢ عملية تجريبية/);

   await page.evaluate(()=>{
     switchAppPage('budgets',true);
     switchBudgetSubTab('monthly');
     switchBudgetMonthView('compare');
   });
   const realCount=await page.evaluate(()=>state.transactions.length);
   await page.locator('#cmpDataMode').click();
   await page.waitForFunction(()=>document.getElementById('cmpDataMode').getAttribute('aria-pressed')==='true');
   assert.equal((await page.locator('.cmp-summary-primary strong').innerText()).trim(),'١٢٬٩٠٠');
   assert.equal((await page.locator('.cmp-summary-reference strong').innerText()).trim(),'١٢٬٠٥٠');
   assert.match(await page.locator('#cmpSummary').innerText(),/\+٨٥٠/);
   const check=await page.locator('#cmpTableBody tr').evaluateAll(rows=>Object.fromEntries(rows.map(row=>
     [row.dataset.budgetCategory,[...row.querySelectorAll('td')].map((cell,i)=>i<2?cell.querySelector('bdi').textContent.trim():cell.textContent.trim())])));
   assert.deepEqual(check['food'].slice(0,2),['٣٬٤٠٠','٢٬٨٠٠']);
   assert.deepEqual(check['bills'].slice(0,2),['٢٬١٠٠','٢٬١٠٠']);
    assert.equal(check['trial-leisure'][3],'—');
    assert.match(check['trial-gifts'][3],/-١٠٠٪/);
   assert.equal(await page.locator('#cmpPeriodChartContent .cmp-period-table').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
    await page.locator('#cmpPeriodChart [data-mode="change"]').click();
    assert.match(await page.locator('.cmp-period-bars [data-budget-category="trial-leisure"]').innerText(),/بند جديد/);
    assert.match(await page.locator('.cmp-period-bars [data-budget-category="trial-gifts"]').innerText(),/توقف الصرف/);
    await page.locator('#cmpPeriodChart [data-mode="table"]').click();
   await page.locator('#cmpTableBody tr[data-budget-category="food"] button[data-period-series="reference"]').click();
   assert.match(await page.locator('#sampleOperationsList').innerText(),/٢٬٨٠٠ ج.م/);
   await page.locator('#sampleOperationsBack').click();
   assert.equal(await page.locator('#cmpDataMode').getAttribute('aria-pressed'),'true');
   await page.locator('#cmpDataMode').click();
   assert.equal(await page.locator('#cmpDataMode').getAttribute('aria-pressed'),'false');
   assert.equal(await page.evaluate(()=>state.transactions.length),realCount);

   assert.deepEqual(errors,[],'Browser errors '+JSON.stringify(errors));
   await context.close();
  }
  console.log('PASS 4x2 app colours, live settings colours/card styles, monthly metrics, exact filtered drilldown, return');
 }finally{await browser.close();}
})().catch(e=>{console.error('SETTINGS_BUDGET_DRILL_QA_FAILED',e.stack||e);process.exitCode=1;});
