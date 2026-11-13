/* Visual regression: one-row summary filters and filled card-style rows.
   Runs in a clean profile; no user wallet or transaction data. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const URL=process.env.APP_URL||'http://127.0.0.1:8765/';
const cases=[{name:'narrow',width:320,height:740},{name:'mobile360',width:360,height:780},{name:'mobile390',width:390,height:844},{name:'mobile430',width:430,height:932},{name:'desktop',width:1365,height:900}];
function positions(elements){return elements.map(el=>el.getBoundingClientRect());}
function sameRow(rects){return rects.every(r=>Math.abs(r.top-rects[0].top)<3);}
function fullyFilled(grid,rects){
  const g=grid.getBoundingClientRect();
  const rows=[];
  for(const r of rects){
    const row=rows.find(x=>Math.abs(x[0].top-r.top)<3);
    if(row)row.push(r);else rows.push([r]);
  }
  return rows.map(row=>{
    const min=Math.min(...row.map(r=>r.left)),max=Math.max(...row.map(r=>r.right));
    return {count:row.length,left:Math.round(min-g.left),right:Math.round(g.right-max)};
  });
}
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
  for(const viewport of cases){
    const context=await browser.newContext({viewport,isMobile:viewport.width<700,hasTouch:viewport.width<700,locale:'ar-SA'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
    assert.ok(response?.ok(),'HTTP '+response?.status());
    await page.waitForFunction(()=>typeof window.openSummaryLeftDrawer==='function'&&typeof window.openSettingsModal==='function',null,{timeout:25000});
    await page.evaluate(()=>window.openSummaryLeftDrawer());
    await page.locator('#summaryLeftDrawer').waitFor({state:'visible',timeout:25000});
    await page.waitForSelector('#summaryMemberSelector .summary-member-btn',{timeout:25000});
    const state=await page.evaluate(()=>{
      const drawer=document.querySelector('#summaryLeftDrawer');
      const member=document.querySelector('#summaryMemberSelector');
      const period=document.querySelector('#summaryLeftDrawer .summary-period-grid');
      const controls=drawer.querySelector('.summary-rebuilt-controls');
      const currency=drawer.querySelectorAll('.summary-currency-row');
      const members=Array.from(member.querySelectorAll('button'));
      const dates=Array.from(period.querySelectorAll('button'));
      const memberRect=members.map(e=>e.getBoundingClientRect());
      const dateRect=dates.map(e=>e.getBoundingClientRect());
      return {
        controlsHeight:Math.round(controls.getBoundingClientRect().height),
        members:members.length, dates:dates.length,
        membersSameRow:memberRect.every(r=>Math.abs(r.top-memberRect[0].top)<3),
        datesSameRow:dateRect.every(r=>Math.abs(r.top-dateRect[0].top)<3),
        memberScrollWidth:member.scrollWidth,memberWidth:member.clientWidth,
        dateOverflow:period.scrollWidth>period.clientWidth+2,
        currencyCount:currency.length,
        currencyParent:currency[0]?.parentElement?.className,
        contentParent:drawer.querySelector('#summaryDrawerContent')?.parentElement?.id,
        memberFont: getComputedStyle(members[0]).fontSize,
        periodFont: getComputedStyle(dates[0]).fontSize,
        clippedMembers:members.filter(x=>x.scrollWidth>x.clientWidth+2).map(x=>x.textContent.trim()),
        clippedDates:dates.filter(x=>x.scrollWidth>x.clientWidth+2).map(x=>x.textContent.trim())
      };
    });
    console.log('FILTER_LAYOUT '+viewport.name+' '+JSON.stringify(state));
    assert.equal(state.currencyCount,1,'Duplicated currency row');
    assert.match(state.currencyParent,/summary-rebuilt-controls/,'Currency row nested incorrectly');
    assert.equal(state.contentParent,'summaryLeftDrawer','Summary results accidentally nested in filters');
    assert.equal(state.membersSameRow,true,'Member buttons wrap');
    assert.equal(state.dates,6,'Six date periods expected');
    assert.equal(state.datesSameRow,true,'Period buttons wrap');
    assert.equal(state.dateOverflow,false,'Period row overflows viewport');
    if(viewport.width>=390){
      assert.deepEqual(state.clippedMembers,[],'Member labels clipped');
      assert.deepEqual(state.clippedDates,[],'Period labels clipped');
    }
    assert.ok(state.controlsHeight<200,'Filters still unnecessarily tall: '+state.controlsHeight);
    if(viewport.width>=390)assert.ok(state.memberScrollWidth<=state.memberWidth+3,'Members require scrolling on common phone width');
    assert.equal(await page.locator('.summary-selected-card').count(),0,'Redundant scope card remains');
    const compactRows=await page.locator('.summary-kpi').evaluateAll(cards=>cards.every(card=>{
      const boxes=[...card.children].map(e=>e.getBoundingClientRect());
      return Math.max(...boxes.map(r=>r.top)) < Math.min(...boxes.map(r=>r.bottom));
    }));
    assert.ok(compactRows,'Financial totals must share one line');
    assert.equal(await page.locator('.summary-member-btn').first().evaluate(e=>getComputedStyle(e).justifyContent),'center');
    await page.locator('.summary-period-btn[data-period="custom"]').click();
    await page.locator('#summaryInlineCalendar #customDatePickerDrawer').waitFor({state:'visible'});
    assert.equal(await page.locator('#customDatePickerDialog').getAttribute('aria-modal'),null);
    const fits=await page.locator('#customDatePickerConfirmButton').evaluate(button=>{
      const b=button.getBoundingClientRect(),d=document.getElementById('summaryLeftDrawer').getBoundingClientRect();
      return b.bottom<=d.bottom && b.left>=d.left && b.right<=d.right;
    });
    assert.ok(fits,'Inline calendar confirmation must fit inside summary');
    const days=page.locator('#customRangeCalendarMonths .range-calendar-day');
    await days.nth(0).click();
    await days.nth(12).click();
    await page.locator('#customDatePickerConfirmButton').click();
    await page.locator('#summaryDrawerContent').waitFor({state:'visible'});
    assert.ok(await page.locator('#summaryCustomDateFrom').inputValue());
    assert.ok(await page.locator('#summaryCustomDateTo').inputValue());
    assert.equal(await page.locator('#summaryInlineCalendar #customDatePickerDrawer').count(),0);
    await page.locator('.summary-period-btn[data-period="custom"]').click();
    await page.locator('.summary-period-btn[data-period="month"]').click();
    assert.equal(await page.locator('#customDatePickerDrawer').isVisible(),false);
    await page.screenshot({path:'screenshots/'+viewport.name+'-summary.png',fullPage:false});
    await page.evaluate(()=>window.closeSummaryLeftDrawer());
    await page.evaluate(()=>window.openSettingsModal());
    await page.locator('#settingsModal').waitFor({state:'visible',timeout:25000});
    await page.locator('#compactAppearanceToggle-cards').click();
    const cardRows=await page.evaluate(()=>{
      const grid=document.getElementById('cardStyleButtonsContainer');
      const buttons=[...grid.querySelectorAll('button[data-card-style]')];
      const rects=buttons.map(el=>el.getBoundingClientRect());
      const bounds=grid.getBoundingClientRect();
      const rows=[];
      for(const rect of rects){
        const row=rows.find(x=>Math.abs(x[0].top-rect.top)<3);
        if(row)row.push(rect);else rows.push([rect]);
      }
      return {count:buttons.length,rows:rows.map(row=>({
        count:row.length,
        left:Math.round(Math.min(...row.map(r=>r.left))-bounds.left),
        right:Math.round(bounds.right-Math.max(...row.map(r=>r.right)))
      })),gridHeight:Math.round(bounds.height)};
    });
    console.log('CARD_LAYOUT '+viewport.name+' '+JSON.stringify(cardRows));
    assert.equal(cardRows.count,10);
    assert.ok(cardRows.rows.every(x=>Math.abs(x.left)<=3&&Math.abs(x.right)<=3),
      'Card style grid has incomplete final row: '+JSON.stringify(cardRows.rows));
    await page.screenshot({path:'screenshots/'+viewport.name+'-cards.png',fullPage:false});
    assert.deepEqual(errors,[],'JS errors '+JSON.stringify(errors));
    await context.close();
  }
  console.log('PASS: compact filter rows and card style row spacing across 5 viewports');
}finally{await browser.close()}
})().catch(e=>{console.error('FILTER_COMPACT_QA_FAILURE',e.stack||e);process.exitCode=1});
