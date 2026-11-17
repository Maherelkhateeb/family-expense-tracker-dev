/* Regresses Android/Chrome browser chrome shrinking visual viewport and clipping
   the last row of the FIRST supplied reference. Does not use private data. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const BASE=process.env.APP_URL||'http://127.0.0.1:8765/';
const viewports=[
 {width:320,height:535},{width:345,height:590},{width:360,height:620},
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
      voiceAction:!!voice.querySelector('button[data-voice]'),
      lastAmount:!!last.querySelector('.reference-one-amount'),
      lastDetails:last.querySelector('.reference-one-details')?.getBoundingClientRect().bottom
     };
   });
   console.log('REFERENCE_SHORT_INITIAL '+JSON.stringify({viewport,...initial}));
   assert.equal(initial.categoryCount,10,'Financial categories or voice missing');
   assert.ok(initial.voiceAction && initial.lastAmount,'Last row missing active voice or financial content');
   assert.ok(initial.cardHeight>=68 && initial.cardHeight<=80,
     'Reference image card proportions are wrong: '+JSON.stringify(initial));
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
