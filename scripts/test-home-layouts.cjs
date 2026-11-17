/* Verify every home alternative is usable on narrow mobile and tablet screens.
   No user data is read, written or uploaded by this isolated browser QA. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const BASE=process.env.APP_URL||'http://127.0.0.1:8765/';
const IDS=['daily','food','bills','house','education','transport','health','other','voice','clothes'];
const WIDTHS=[320,360,390,430,768];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 fs.mkdirSync('screenshots',{recursive:true});
 try{
  for(const width of WIDTHS){
   const context=await browser.newContext({viewport:{width,height:852},locale:'ar-EG',serviceWorkers:'block'});
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
       if(r.width<60||r.height<65||r.left< -2||r.right>viewportWidth+2)errors.push('card-outside:'+i+':'+JSON.stringify(r));
       const head=card.querySelector('.home-design-head strong,.reference-one-add strong');
       if(head&&head.scrollWidth>head.clientWidth+3)errors.push('title-clipped:'+i);
       const amount=card.querySelector('.home-design-value bdi,.reference-one-amount');
       if(amount&&amount.scrollWidth>amount.clientWidth+5)errors.push('value-clipped:'+i);
     }
     const rects=cards.map(readRect);
     for(let i=0;i<rects.length-1;i+=design===4?1:2){
       if(design===0||design===4)continue;
       if(Math.abs(rects[i].top-rects[i+1].top)>3)errors.push('row-height-misaligned:'+i);
     }
     const toolRects=tools.map(readRect);
     tools.forEach((tool,i)=>{
       const r=toolRects[i];if(r.width<20||r.left< -2||r.right>viewportWidth+2)errors.push('tool-outside:'+tool.id+':'+JSON.stringify(r));
     });
     const toolOrder=tools.slice().sort((a,b)=>Number(getComputedStyle(a).order)-Number(getComputedStyle(b).order)).map(x=>x.id);
     const ids=design===1?cards.map(x=>x.dataset.refCategory):design>1?
       cards.map(x=>x.querySelector('[data-add]')?.dataset.add||(x.querySelector('[data-voice]')?'voice':null)):[];
     const bodyOverflow=document.documentElement.scrollWidth>viewportWidth+3;
     const offscreen=bodyOverflow?[...document.querySelectorAll('body *')].map(el=>{
       const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
       return {id:el.id,tag:el.tagName,cls:typeof el.className==='string'?el.className.slice(0,55):'',
         l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width),
         position:cs.position,display:cs.display,visibility:cs.visibility};
     }).filter(o=>o.w>0&&o.display!=='none'&&o.visibility!=='hidden'&&(o.l< -3||o.r>viewportWidth+3)).slice(0,22):[];
     return {offscreen,pageScrollWidth:document.documentElement.scrollWidth,design,width:viewportWidth,originalHidden:document.getElementById('catGrid').hidden,
       count:cards.length,ids,gridCols:grid?getComputedStyle(grid).gridTemplateColumns:'',
       toolOrder,toolCount:tools.length,switcherVisible:cs.display!=='none'&&cs.visibility!=='hidden',
       switcherInside:document.getElementById('btnHomeDesign').parentElement.classList.contains('executive-quick-tools-strip'),
       bodyOverflow,errors};
    });
    console.log('HOME_LAYOUT_QA '+JSON.stringify(report));
    assert.ok(report.switcherVisible&&report.switcherInside,'Switcher missing '+width+'/'+design);
    assert.equal(report.toolCount,5,'Five tools must stay visible '+width+'/'+design);
    assert.deepEqual(report.toolOrder,['btnHomeDesign','btnOpenGold','walletSelectCluster','btnOpenSummaryQuick','btnToggleCurrency'],
      'Unexpected tool order '+width+'/'+design);
    if(design===0){assert.equal(report.originalHidden,false,'Default home grid hidden');}
    else {
     assert.equal(report.count,10,'Missing expense or voice card '+width+'/'+design);
     assert.deepEqual(report.ids,IDS,'Wrong card order '+width+'/'+design);
     assert.ok(report.originalHidden,'Original grid should be hidden on alternatives');
    }
    assert.deepEqual(report.errors,[],'Misaligned/clipped home elements '+width+'/'+design);
    assert.equal(report.bodyOverflow,false,'Horizontal document overflow '+width+'/'+design);
    await page.screenshot({path:'screenshots/home-layout-'+width+'-'+design+'.png',fullPage:false});
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