/* Regresses Android/Chrome browser chrome shrinking visual viewport and clipping
   the last row of the FIRST supplied reference. Does not use private data. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const BASE=process.env.APP_URL||'http://127.0.0.1:8765/';
const viewports=[
 {width:320,height:535},{width:345,height:590},{width:345,height:650},{width:360,height:620},
 {width:391,height:695},{width:430,height:700}
];
const read=()=>({}); // Purely a test harness; the app handles all transactions.
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 fs.mkdirSync('screenshots',{recursive:true});
 try {
  for(const viewport of viewports) {
   const context=await browser.newContext({viewport,locale:'ar-EG',isMobile:true,hasTouch:true,serviceWorkers:'block'});
   const page=await context.newPage(),runtime=[];
   page.on('pageerror',e=>runtime.push(e.message));
   await page.goto(BASE+'?homeLayout=reference-1&chromeViewportQa=1',
     {waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.querySelector('#homeInterfaces')?.dataset.design==='1'
     && document.querySelectorAll('#homeInterfaces .reference-one-card').length===10,
     null,{timeout:30000});
   // Regression: bottom navigation must remain visible, readable and tappable.
   const bottomNav=await page.evaluate(()=>{
     const nav=document.getElementById('appBottomNav');
     const nr=nav.getBoundingClientRect();
     const tabs=[...nav.querySelectorAll('.nav-tab-item')].map(el=>{
       const r=el.getBoundingClientRect(),style=getComputedStyle(el);
       const x=Math.max(0,Math.min(innerWidth-1,r.left+r.width/2));
       const y=Math.max(0,Math.min(innerHeight-1,r.top+r.height/2));
       const hit=document.elementFromPoint(x,y);
       return {id:el.id,label:el.textContent.trim(),left:r.left,right:r.right,
         top:r.top,bottom:r.bottom,width:r.width,height:r.height,
         display:style.display,visibility:style.visibility,opacity:Number(style.opacity),
         hit:hit===el||el.contains(hit)};
     });
     return {nav:{top:nr.top,bottom:nr.bottom,left:nr.left,right:nr.right,
       display:getComputedStyle(nav).display},tabs,viewport:{width:innerWidth,height:innerHeight}};
   });
   console.log('BOTTOM_NAV_VISIBILITY '+JSON.stringify({viewport,bottomNav}));
   assert.ok(bottomNav.tabs.length>=4,'Missing bottom navigation tabs');
   assert.ok(bottomNav.nav.top>=0&&bottomNav.nav.bottom<=bottomNav.viewport.height+2,
     'Bottom navigation clipped by phone viewport: '+JSON.stringify(bottomNav));
   for(const tab of bottomNav.tabs){
     assert.ok(tab.display!=='none'&&tab.visibility==='visible'&&tab.opacity>0.05,
       'Hidden bottom tab: '+JSON.stringify(tab));
     assert.ok(tab.width>=28&&tab.height>=28&&tab.left>=-1&&tab.right<=bottomNav.viewport.width+1
       &&tab.top>=bottomNav.nav.top-1&&tab.bottom<=bottomNav.viewport.height+2,
       'Clipped bottom tab: '+JSON.stringify(tab));
     assert.ok(tab.hit,'Bottom tab blocked by overlay: '+JSON.stringify(tab));
   }
   const initial=await page.evaluate(()=>{
     const rect=node=>{const r=node.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,left:r.left,right:r.right}};
     const host=document.querySelector('#homeInterfaces'),grid=host.querySelector('.reference-one-grid');
     const view=document.querySelector('#viewExpenses'),nav=document.querySelector('#appBottomNav');
     const sc=document.querySelector('#appScrollBody');
     const last=host.querySelector('[data-ref-category="clothes"]');
     const voice=host.querySelector('[data-ref-category="voice"]');
     return {
      nav:rect(nav),last:rect(last),voice:rect(voice),host:rect(host),
      grid:rect(grid),view:rect(view),scroll:rect(sc),
      height:innerHeight,width:innerWidth,
      cardHeight:last.getBoundingClientRect().height,
      gridRows:getComputedStyle(grid).gridTemplateRows,
      scrollHeight:sc.scrollHeight,clientHeight:sc.clientHeight,
      hostOverflow:getComputedStyle(host).overflowY,
      viewOverflow:getComputedStyle(view).overflowY,
      categoryCount:host.querySelectorAll('.reference-one-card').length,
      engineMeasured:host.dataset.dynamicHomeMeasured,
      engineFit:host.dataset.dynamicHomeFit,
      engineCardHeight:host.style.getPropertyValue('--dynamic-home-card-height'),
      voiceAction:!!voice.querySelector('button[data-voice]'),
      lastAmount:!!last.querySelector('.reference-one-amount'),
      lastDetails:last.querySelector('.reference-one-details')?.getBoundingClientRect().bottom
     };
   });
   console.log('REFERENCE_SHORT_INITIAL '+JSON.stringify({viewport,...initial}));

   const header=await page.evaluate(()=>{
     const status=document.getElementById('topDriveSyncStatusText');
     const sync=document.getElementById('btnHeaderMasterSync');
     const search=document.getElementById('btnGlobalSearch');
     const original=status?.textContent||'';
     if(status)status.textContent='جار تحديث ومزامنة كل بيانات الأسرة';
     const r=el=>{const x=el?.getBoundingClientRect();return x?{left:x.left,right:x.right,width:x.width}:null};
     const result={
       status:status?{overflow:getComputedStyle(status).overflowX,whiteSpace:getComputedStyle(status).whiteSpace,box:r(status)}:null,
       sync:r(sync),search:r(search),hiddenLabel:status?getComputedStyle(status).textOverflow:null
     };
     if(status)status.textContent=original;
     return result;
   });
   console.log('SYNC_LABEL_REGRESSION '+JSON.stringify({viewport,header}));
   assert.ok(header.status&&header.status.overflow==='hidden'
     &&header.hiddenLabel==='ellipsis','Long sync status must ellipsize on a short Android phone');
   assert.ok(header.status.box.right<=header.sync.right+1&&
     header.status.box.left>=header.sync.left-1,
     'Sync label paints beyond its own button: '+JSON.stringify(header));
   assert.equal(initial.categoryCount,10,'Financial categories or voice missing');
   assert.equal(initial.engineMeasured,'true','Dynamic home engine did not measure this viewport');
   assert.ok(parseFloat(initial.engineCardHeight)>=68,'Dynamic home engine returned an invalid card height');
   assert.ok(['fit','scroll'].includes(initial.engineFit),'Dynamic home engine did not report fit/scroll outcome');
   assert.ok(initial.voiceAction && initial.lastAmount,'Last row missing active voice or financial content');
   assert.ok(initial.cardHeight>=67 && initial.cardHeight<=80,
     'Reference image card proportions are wrong: '+JSON.stringify(initial));
   if(viewport.width===345 && viewport.height===650) {
     assert.ok(initial.last.bottom<=initial.nav.top-2 && initial.voice.bottom<=initial.nav.top-2,
       'User-matched 345x650 Android browser viewport should show the entire last row WITHOUT scrolling: '+JSON.stringify(initial));
   }
   assert.ok(initial.hostOverflow!=='hidden' && initial.viewOverflow!=='hidden',
     'Parent hides bottom row: '+JSON.stringify(initial));
   // Screenshot may show the footer on the first frame; collect even if scroll needed.
   await page.screenshot({path:'screenshots/home-reference-one-short-'+viewport.width+'x'+viewport.height+'-initial.png'});
   const after=await page.evaluate(()=>{
     const sc=document.querySelector('#appScrollBody');
     sc.scrollTop=sc.scrollHeight;
     return {requested:sc.scrollHeight,client:sc.clientHeight};
   });
   await page.waitForTimeout(100);
   const end=await page.evaluate(()=>{
     const rect=node=>{const r=node.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height}};
     const sc=document.querySelector('#appScrollBody'),host=document.getElementById('homeInterfaces');
     const last=host.querySelector('[data-ref-category="clothes"]'),
       voice=host.querySelector('[data-ref-category="voice"]');
     const detail=last.querySelector('.reference-one-details');
     const btn=voice.querySelector('button[data-voice]');
     return {last:rect(last),voice:rect(voice),details:rect(detail),voiceButton:rect(btn),
       nav:rect(document.getElementById('appBottomNav')),scrollTop:sc.scrollTop,
       scrollHeight:sc.scrollHeight,clientHeight:sc.clientHeight,
       docScrollWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth};
   });
   console.log('REFERENCE_SHORT_AFTER '+JSON.stringify({viewport,...end}));
   assert.ok(end.last.bottom<=end.nav.top+2 && end.voice.bottom<=end.nav.top+2,
      'Bottom row remains hidden behind footer, even after scrolling: '+JSON.stringify({viewport,initial,end}));
   assert.ok(end.details.bottom<=end.last.bottom+1,'Clothes value/progress not fully inside its card');
   assert.ok(end.voiceButton.bottom<=end.voice.bottom+1,'Voice action cut off');
   assert.ok(end.docScrollWidth<=end.viewportWidth+2,'Horizontal overflow');
   if(initial.last.bottom>initial.nav.top+2){
     assert.ok(end.scrollTop>0,'Short browser viewport cannot scroll to final row');
   }
   await page.screenshot({path:'screenshots/home-reference-one-short-'+viewport.width+'x'+viewport.height+'-bottom.png'});
   assert.deepEqual(runtime,[],'App exceptions at '+viewport.width+'×'+viewport.height);
   await context.close();
  }
  console.log('PASS: first reference rows including voice/clothes reachable on five Android Chrome visual viewport sizes');
 } finally {await browser.close();}
})().catch(e=>{console.error('REFERENCE_SHORT_VIEWPORT_FAILED',e.stack||e);process.exitCode=1;});
