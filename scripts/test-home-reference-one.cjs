/* Test the first reference home as a real RTL phone page, without user data. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const BASE = process.env.APP_URL || 'http://127.0.0.1:8765/';
const order = ['daily','food','bills','house','education','transport','health','other','voice','clothes'];
(async () => {
  const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  try {
    for (const width of [320,360,390,430]) {
      const context = await browser.newContext({
        viewport:{width,height:852},locale:'ar-EG',serviceWorkers:'block'
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(BASE + '?homeLayout=reference-1&mobileQa=1',
        {waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(() => document.querySelector('#homeInterfaces')?.dataset.design === '1'
        && document.querySelectorAll('#homeInterfaces .reference-one-card').length === 10,
        null,{timeout:30000});
      const snap = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('#homeInterfaces .reference-one-card')];
        const rects = cards.map(el => {
          const r = el.getBoundingClientRect();
          return {x:r.x,y:r.y,right:r.right,width:r.width,height:r.height};
        });
        const labels = cards.map(el=>el.querySelector('strong')?.textContent.trim());
        return {
          ids:cards.map(el=>el.dataset.refCategory),
          labels,
          rects,
          gridColumns:getComputedStyle(document.querySelector('.reference-one-grid')).gridTemplateColumns,
          originalHidden:document.querySelector('#catGrid').hidden,
        topHeaderBackground:getComputedStyle(document.querySelector('.app-header')).backgroundColor,
        avatarCount:document.querySelectorAll('#avatarsContainer .avatar-card').length,
        toolCount:[...document.querySelectorAll('#viewExpenses .executive-quick-tools-strip > *')]
          .filter(el=>getComputedStyle(el).display!=='none').length,
          topHeaderPresent:Boolean(document.querySelector('#appFrame .app-header')),
          zeroCards:cards.filter(el=>el.dataset.refCategory!=='voice'
            && el.querySelector('.reference-one-amount')).length,
          actions:cards.filter(el=>el.querySelector('button[data-add],button[data-voice]')).length,
          detailActions:cards.filter(el=>el.querySelector('button[data-details]')).length,
          spritePositions:cards.map(el=>el.querySelector('.reference-one-icon')?.style.getPropertyValue('--icon-x')),
          toolRects:[...document.querySelectorAll('#viewExpenses .executive-quick-tools-strip > *')]
            .map(el => {const r=el.getBoundingClientRect(); return {x:r.x,right:r.right,width:r.width};}),
          switcherVisible:getComputedStyle(document.getElementById('btnHomeDesign')).display!=='none',
          switcherInQuickTools:document.getElementById('btnHomeDesign')?.parentElement?.classList.contains('executive-quick-tools-strip'),
          toolsOrder:[...document.querySelectorAll('#viewExpenses .executive-quick-tools-strip > *')]
            .sort((a,b)=>Number(getComputedStyle(a).order)-Number(getComputedStyle(b).order))
            .map(el=>el.id),
          bodyOverflow:document.documentElement.scrollWidth > window.innerWidth + 2
        };
      });
      assert.deepEqual(snap.ids,order,'Wrong category order or missing zero category');
      assert.deepEqual(snap.labels,[
        'مصروف يومي','طعام ومشتريات','فواتير والتزامات','مستلزمات منزل',
        'تعليم ودروس','مواصلات وبنزين','صحة وعلاج','أخرى ومشتريات',
        'إضافة صوتيةللمصروفات','ملابس وأحذية'
      ],'Reference Arabic card labels changed');
      assert.equal(snap.zeroCards,9);
      assert.equal(snap.actions,10);
      assert.equal(snap.detailActions,9);
      assert.deepEqual(snap.toolsOrder,[
        'btnHomeDesign','btnOpenGold','walletSelectCluster','btnOpenSummaryQuick','btnToggleCurrency'
      ],'Five reference tools are in the wrong RTL order');
      assert.ok(snap.switcherVisible && snap.switcherInQuickTools,'Home switcher was hidden or moved to Settings');
      assert.ok(!snap.bodyOverflow,'Horizontal overflow on phone');
      for(const r of snap.toolRects)assert.ok(r.width>0 && r.x>=-1 && r.right<=width+1,'Quick tool is clipped');
      assert.ok(snap.originalHidden,'Original category grid must hide only for the alternative');
      assert.ok(snap.topHeaderPresent,'Original header must remain');
      assert.equal(snap.toolCount,5,'Reference must show five quick tools');
      assert.equal(snap.avatarCount,9,'All nine family filters stay visible');
      const voiceBox = await page.evaluate(()=>{
        const card=document.querySelector('.reference-one-card[data-ref-category="voice"]');
        const text=card?.querySelector('strong');
        const a=card?.getBoundingClientRect(), b=text?.getBoundingClientRect();
        return {top:a?.top,bottom:a?.bottom,textTop:b?.top,textBottom:b?.bottom};
      });
      assert.ok(voiceBox.textTop>=voiceBox.top-1 && voiceBox.textBottom<=voiceBox.bottom+1,
        'Voice heading protrudes from its card');
      for(const r of snap.rects){
        assert.ok(r.width>0 && r.height>=65,'Collapsed phone card');
        assert.ok(r.x>=-1 && r.right<=width+1,'Card overflows phone viewport');
      }
      for(let i=0;i<10;i+=2){
        assert.ok(Math.abs(snap.rects[i].y-snap.rects[i+1].y)<2,'Two-column row misaligned');
        assert.ok(snap.rects[i].x>snap.rects[i+1].x,'RTL two-column order broken');
      }
      assert.notEqual(snap.spritePositions[0],snap.spritePositions[1],'Artwork mapped by index');
      if(!require('node:fs').existsSync('screenshots'))require('node:fs').mkdirSync('screenshots');
      await page.screenshot({path:'screenshots/home-reference-one-'+width+'.png',fullPage:true});
      await page.screenshot({path:'screenshots/home-reference-one-viewport-'+width+'.png'});
      await page.locator('#btnHomeDesign').click();
      await page.waitForFunction(()=>document.getElementById('homeInterfaces')?.dataset.design==='2');
      assert.ok(await page.locator('#btnHomeDesign').isVisible(),'Switcher disappeared after switching');
      for(let i=0;i<5;i++)await page.locator('#btnHomeDesign').click();
      await page.waitForFunction(()=>document.getElementById('homeInterfaces')?.dataset.design==='1');
      await page.locator('#homeInterfaces button[data-add="food"]').click();
      await page.waitForFunction(()=>document.querySelector('#inpTxCategory')?.value==='food',null,{timeout:8000});
      await page.evaluate(()=>closeModal('txModal'));
      await page.locator('#homeInterfaces button[data-details="food"]').click();
      await page.waitForFunction(()=>document.getElementById('navTabOperations')?.classList.contains('active'),
        null,{timeout:8000});
      console.log('FIRST_REFERENCE_MOBILE',width,JSON.stringify({
        count:snap.ids.length,grid:snap.gridColumns,
        smallestHeight:Math.min(...snap.rects.map(r=>r.height)),
        originalHidden:snap.originalHidden,expenseOpen:true,detailsOpen:true
      }));
      await context.close();
      // Separate fresh browser state: the original is still the initial design.
      const defaultContext = await browser.newContext({
        viewport:{width,height:852},locale:'ar-EG',serviceWorkers:'block'
      });
      const defaultPage = await defaultContext.newPage();
      await defaultPage.goto(BASE+'?homeDefaultQa=1',{waitUntil:'domcontentloaded',timeout:60000});
      await defaultPage.waitForFunction(()=>document.querySelector('#homeInterfaces')?.dataset.design==='0');
      assert.equal(await defaultPage.locator('#catGrid').evaluate(el=>el.hidden),false);
      await defaultPage.locator('#btnHomeDesign').click();
      await defaultPage.waitForFunction(()=>document.querySelector('#homeInterfaces')?.dataset.design==='1');
      await defaultContext.close();
      assert.deepEqual(errors,[],'Browser runtime errors');
    }
    console.log('PASS: first alternative reference, RTL, phone widths, entry/drilldown, original default');
  } finally { await browser.close(); }
})().catch(e=>{console.error('FIRST_REFERENCE_QA_FAILED',e.stack||e);process.exitCode=1;});
