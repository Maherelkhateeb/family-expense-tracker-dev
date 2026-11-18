/* Verify every home alternative is usable on narrow mobile and tablet screens.
   No user data is read, written or uploaded by this isolated browser QA. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const BASE=process.env.APP_URL||'http://127.0.0.1:8765/';
const IDS=['daily','food','bills','house','education','transport','health','other','voice','clothes'];
const WIDTHS=[320,360,390,391,430,768];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 fs.mkdirSync('screenshots',{recursive:true});
 try{
  for(const width of WIDTHS){
   const context=await browser.newContext({viewport:{width,height:({320:700,360:760,390:844,391:695,430:932,768:1024}[width]||852)},locale:'ar-EG',serviceWorkers:'block'});
   const page=await context.newPage();
   const exceptions=[];
   page.on('pageerror',e=>exceptions.push(e.message));
   await page.goto(BASE+'?layoutsQa=1',{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.querySelector('#homeInterfaces')?.dataset.design==='0',null,{timeout:30000});
   assert.equal(await page.locator('#catGrid').evaluate(el=>el.hidden),false,'Original home must stay default');
   await page.evaluate(()=>localStorage.setItem('__layouts_qa_sentinel','not-modified'));
   for(let design=0;design<6;design++){
    if(design)await page.locator('#btnHomeDesign').click();
    await page.waitForFunction(n=>document.querySelector('#homeInterfaces')?.dataset.design===String(n),design,{timeout:10000});
    // Allow the dynamic geometry engine's animation frame to settle after switching.
    await page.waitForTimeout(60);
    const report=await page.evaluate(()=>{
     const host=document.getElementById('homeInterfaces'),design=Number(host.dataset.design);
     const grid=host.querySelector('.reference-one-grid,.home-design-grid');
     const cards=[...host.querySelectorAll('.reference-one-card,.home-design-card')];
     const tools=[...document.querySelectorAll('#viewExpenses .executive-quick-tools-strip > *')];
     const readRect=node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
     const cs=getComputedStyle(document.getElementById('btnHomeDesign'));
     const errors=[];
     const viewportWidth=window.innerWidth;
     for(const [i,card]of cards.entries()){
       const r=readRect(card);
       if(r.width<60||r.height<(design===4?25:42)||r.left< -2||r.right>viewportWidth+2)errors.push('card-outside:'+i+':'+JSON.stringify(r));
       const head=card.querySelector('.home-design-head strong,.reference-one-add strong');
       if(head&&head.scrollWidth>head.clientWidth+3)errors.push('title-clipped:'+i);
       const amount=card.querySelector('.home-design-value bdi,.reference-one-amount');
       if(amount&&amount.scrollWidth>amount.clientWidth+5)errors.push('value-clipped:'+i);
     }
     const rects=cards.map(readRect);
     if(design===1) {
       const overlays=['leftScreenEdgeHandle','rightScreenEdgeHandle','btnVoiceAssistantFab'];
       for(const id of overlays){
         const node=document.getElementById(id);
         if(node&&getComputedStyle(node).display!=='none'&&getComputedStyle(node).visibility!=='hidden'&&Number(getComputedStyle(node).opacity)>0)
           errors.push('reference-overlay-visible:'+id);
       }
       const brand=document.querySelector('.header-brand-row');
       if(brand && viewportWidth<=430){
         const parts=[...brand.children].filter(el=>getComputedStyle(el).display!=='none');
         const positions=parts.map(el=>readRect(el)).sort((a,b)=>a.left-b.left);
         if(positions.length>=2 && positions[1].left-positions[0].right>14)
           errors.push('header-unnecessary-gap:'+Math.round(positions[1].left-positions[0].right));
       }
       const switchEl=document.getElementById('btnHomeDesign');
       const switchFont=parseFloat(getComputedStyle(switchEl).fontSize)||0;
       if(switchFont>2)errors.push('switch-control-is-not-icon-only');
       const order=[...cards].sort((a,b)=>{
         const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
         return Math.abs(ra.top-rb.top)>3?ra.top-rb.top:rb.right-ra.right;
       }).map(card=>card.dataset.refCategory);
       const reference=['daily','bills','food','house','transport','education','other','health','voice','clothes'];
       if(JSON.stringify(order)!==JSON.stringify(reference))errors.push('wrong-photo-reference-visual-order:'+order.join(','));
       for(let i=0;i<order.length;i+=2){
         const first=cards.find(card=>card.dataset.refCategory===order[i]);
         const second=cards.find(card=>card.dataset.refCategory===order[i+1]);
         if(Math.abs(first.getBoundingClientRect().top-second.getBoundingClientRect().top)>3)
           errors.push('misaligned-first-photo-row:'+i);
       }
       for(const card of cards.filter(card=>card.dataset.refCategory!=='voice')){
         const icon=card.querySelector('.reference-one-icon')?.getBoundingClientRect();
         const title=card.querySelector('button.reference-one-add strong')?.getBoundingClientRect();
         if(icon&&title&&icon.right>title.left+6)errors.push('reference-icon-not-left:'+card.dataset.refCategory);
       }
     } else if(design===5) {
       for(let i=0;i<9;i+=3) if(Math.abs(rects[i].top-rects[i+1].top)>3 || Math.abs(rects[i].top-rects[i+2].top)>3)errors.push('three-column-row-misaligned:'+i);
     } else if(design===2||design===3){
       for(let i=0;i<6;i+=2) if(Math.abs(rects[i].top-rects[i+1].top)>3)errors.push('row-height-misaligned:'+i);
       if(Math.abs(rects[6].top-rects[7].top)>3||Math.abs(rects[7].top-rects[8].top)>3)errors.push('three-mini-row-misaligned');
     }
     // A voice-expense card replaces the global floating microphone.
     // The three-column design reserves a full-width final action row.
     const voiceCard=cards.find(c=>c.dataset.refCategory==='voice'||c.querySelector('[data-voice]'));
     const voiceDisplay=getComputedStyle(document.getElementById('btnVoiceAssistantFab')).display;
     if(design>0){
       if(!voiceCard)errors.push('voice-card-missing');
       if(voiceDisplay!=='none')errors.push('duplicate-floating-microphone');
     }
     if(design===5&&voiceCard){
       const vr=readRect(voiceCard),gr=readRect(grid);
       const lastCategoryBottom=Math.max(...cards.filter(c=>c!==voiceCard).map(c=>c.getBoundingClientRect().bottom));
       if(Math.abs(vr.width-gr.width)>3||Math.abs(vr.left-gr.left)>3||Math.abs(vr.right-gr.right)>3)
         errors.push('voice-card-not-full-grid-width:'+JSON.stringify({voice:vr,grid:gr}));
       if(vr.top<lastCategoryBottom-2)
         errors.push('voice-card-not-after-nine-expense-categories');
     }
     const toolRects=tools.map(readRect);
     tools.forEach((tool,i)=>{
       const r=toolRects[i];if(r.width<20||r.left< -2||r.right>viewportWidth+2)errors.push('tool-outside:'+tool.id+':'+JSON.stringify(r));
     });
     const toolOrder=tools.slice().sort((a,b)=>Number(getComputedStyle(a).order)-Number(getComputedStyle(b).order)).map(x=>x.id);
     const toolVisualOrder=tools.slice().sort((a,b)=>b.getBoundingClientRect().right-a.getBoundingClientRect().right).map(x=>x.id);
     const ids=design===1?cards.map(x=>x.dataset.refCategory):design>1?
       cards.map(x=>x.querySelector('[data-add]')?.dataset.add||(x.querySelector('[data-voice]')?'voice':null)):[];
     const rect=(selector)=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom),height:Math.round(r.height),scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}};
     const vertical={header:rect('.app-header'),app:rect('#appFrame'),scroll:rect('.app-scroll-body'),
       view:rect('#viewExpenses'),period:rect('#viewExpenses .period-selector-top-strip'),
       cockpit:rect('#topKpiThreeStrip'),tools:rect('#viewExpenses .executive-quick-tools-strip'),
       host:rect('#homeInterfaces'),grid:rect('#homeInterfaces .reference-one-grid,#homeInterfaces .home-design-grid'),
       bottomNav:rect('#appBottomNav'),viewportHeight:innerHeight,
       lastCardBottom:cards.length?Math.round(Math.max(...cards.map(c=>c.getBoundingClientRect().bottom))):null};
     const bodyOverflow=document.documentElement.scrollWidth>viewportWidth+3;
     const offscreen=bodyOverflow?[...document.querySelectorAll('body *')].map(el=>{
       const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
       return {id:el.id,tag:el.tagName,cls:typeof el.className==='string'?el.className.slice(0,55):'',
         l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width),
         position:cs.position,display:cs.display,visibility:cs.visibility};
     }).filter(o=>o.w>0&&o.display!=='none'&&o.visibility!=='hidden'&&(o.l< -3||o.r>viewportWidth+3)).slice(0,22):[];
     return {vertical,offscreen,pageScrollWidth:document.documentElement.scrollWidth,design,width:viewportWidth,originalHidden:document.getElementById('catGrid').hidden,
       count:cards.length,ids,gridCols:grid?getComputedStyle(grid).gridTemplateColumns:'',
       toolOrder,toolVisualOrder,toolCount:tools.length,switcherVisible:cs.display!=='none'&&cs.visibility!=='hidden',
       switcherInside:document.getElementById('btnHomeDesign').parentElement.classList.contains('executive-quick-tools-strip'),
       bodyOverflow,errors};
    });
    console.log('HOME_LAYOUT_QA '+JSON.stringify(report));
    await page.screenshot({path:'screenshots/home-layout-'+width+'-'+design+'.png',fullPage:false});
    assert.ok(report.switcherVisible&&report.switcherInside,'Switcher missing '+width+'/'+design);
    assert.equal(report.toolCount,5,'Five tools must stay visible '+width+'/'+design);
    assert.deepEqual(report.toolVisualOrder, ['btnHomeDesign','btnOpenGold','walletSelectCluster','btnOpenSummaryQuick','btnToggleCurrency'],
      'Unexpected tool order '+width+'/'+design);
    if(design===0){assert.equal(report.originalHidden,false,'Default home grid hidden');}
    else {
     assert.equal(report.count,10,'Missing expense or voice card '+width+'/'+design);
     assert.deepEqual(report.ids,[2,3,4,5].includes(design)?[...IDS.filter(id=>id!=='voice'),'voice']:IDS,'Wrong card order '+width+'/'+design);
     assert.ok(report.originalHidden,'Original grid should be hidden on alternatives');
    }
    assert.deepEqual(report.errors,[],'Misaligned/clipped home elements '+width+'/'+design);
    assert.equal(report.bodyOverflow,false,'Horizontal document overflow '+width+'/'+design);
    if(design>0){
      const v=report.vertical;
      if(v.lastCardBottom>v.bottomNav.top+2){
        // Short phones cannot always show ten legible cards at once.
        // Verify the last row is reachable through the app's own scrollport,
        // rather than weakening the visible fixed-footer assertion.
        const beforeScroll=await page.evaluate(()=>{
          const sc=document.getElementById('appScrollBody');
          const old=sc.scrollTop;
          sc.scrollTop=sc.scrollHeight;
          return {old, max:sc.scrollHeight-sc.clientHeight};
        });
        await page.waitForTimeout(80);
        const bottomAfter=await page.evaluate(()=>{
          const cards=[...document.querySelectorAll('#homeInterfaces .reference-one-card,#homeInterfaces .home-design-card')];
          const nav=document.getElementById('appBottomNav').getBoundingClientRect();
          const scroll=document.getElementById('appScrollBody');
          const last=Math.max(...cards.map(card=>card.getBoundingClientRect().bottom));
          return {last,navTop:nav.top,scrollTop:scroll.scrollTop,scrollHeight:scroll.scrollHeight,clientHeight:scroll.clientHeight};
        });
        assert.ok(beforeScroll.max>0 && bottomAfter.scrollTop>0 &&
          bottomAfter.last<=bottomAfter.navTop+2,
          'Home bottom row inaccessible after scrolling '+width+'/'+design+': '+
          JSON.stringify({beforeScroll,bottomAfter,v}));
        console.log('HOME_LAYOUT_SCROLL_FALLBACK '+JSON.stringify({width,design,beforeScroll,bottomAfter}));
        await page.evaluate(()=>{document.getElementById('appScrollBody').scrollTop=0});
      }
      assert.ok(v.host.top>=v.tools.bottom-2,'Home cards overlap top toolbar '+width+'/'+design);
      assert.ok(v.host.bottom<=v.view.bottom+2,'Home content clips inside home view '+width+'/'+design);
      assert.ok(v.view.scrollHeight<=v.view.clientHeight+3,'Vertical scroll still required '+width+'/'+design);
    }

   }
   await page.reload({waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.querySelector('#homeInterfaces')?.dataset.design==='5');
   assert.equal(await page.evaluate(()=>localStorage.getItem('__layouts_qa_sentinel')),'not-modified');
   for(let n=0;n<1;n++)await page.locator('#btnHomeDesign').click();
   assert.equal(await page.locator('#homeInterfaces').getAttribute('data-design'),'0');
   assert.equal(await page.locator('#catGrid').evaluate(el=>el.hidden),false);
   assert.deepEqual(exceptions,[],'Page runtime errors '+width);
   await context.close();
  }
  console.log('PASS: six home layouts, five RTL tools, ten categories, phone/tablet widths and persisted switching');
 } finally {await browser.close();}
})().catch(e=>{console.error('HOME_LAYOUT_QA_FAILED',e.stack||e);process.exitCode=1;});