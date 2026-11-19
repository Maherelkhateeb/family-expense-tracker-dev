/* Actual antigravity settings viewport QA; runs in isolated fresh browsers. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const URL=process.env.APP_URL||'http://127.0.0.1:8765/';
const viewports=[{name:'mobile-360',width:360,height:780},{name:'mobile-390',width:390,height:844},{name:'desktop',width:1365,height:900}];
const expected={palettes:8,icons:8,styles:9};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  for(const viewport of viewports){
   const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},isMobile:viewport.name!=='desktop',hasTouch:viewport.name!=='desktop',locale:'ar-SA',serviceWorkers:'block'});
   const page=await context.newPage();
   const exceptions=[];
   page.on('pageerror',e=>exceptions.push(e.message));
   const response=await page.goto(URL+'?compactQa=1',{waitUntil:'domcontentloaded',timeout:60000});
   assert.ok(response&&response.ok(),'App HTTP status failed');
   await page.waitForFunction(()=>typeof openSettingsModal==='function'&&typeof setAppTheme==='function'&&typeof setAppIconTheme==='function'&&typeof setAppDesignStyle==='function'&&typeof setAppColorMode==='function');
   await page.evaluate(()=>openSettingsModal());
   await page.locator('#settingsModal').waitFor({state:'visible',timeout:15000});
   const report=await page.evaluate(()=>{
     const root=document.querySelector('#settingsSec_appearance');
     const p=[...root.querySelectorAll('button.theme-pill-option[data-theme]')];
     const i=[...root.querySelectorAll('button.icon-theme-pill[data-icon-theme]')];
     const c=[...root.querySelectorAll('button[data-card-style]')];
     const rootRect=root.getBoundingClientRect();
     const overflow=[...root.querySelectorAll('button[data-card-style]')].map(btn=>({id:btn.id,r:btn.getBoundingClientRect()})).filter(x=>x.r.left<rootRect.left-3||x.r.right>rootRect.right+3).map(x=>x.id);
     return {palettes:p.length,icons:i.length,styles:c.length,
       rootWidth:root.clientWidth,rootScrollWidth:root.scrollWidth,viewportWidth:innerWidth,pageScrollWidth:document.documentElement.scrollWidth,
       overflow,buttonsVisible:[...p,...i,...c].every(btn=>{const cs=getComputedStyle(btn);return cs.display!=='none'&&cs.visibility!=='hidden'&&btn.getBoundingClientRect().width>0}),
       controlsExpanded:root.querySelectorAll('[aria-expanded="false"]').length===0
     };
   });
   console.log('SETTINGS_VIEWPORT '+viewport.name+' '+JSON.stringify(report));
   assert.deepEqual({palettes:report.palettes,icons:report.icons,styles:report.styles},expected);
   assert.ok(report.buttonsVisible,'Appearance buttons are hidden');
   assert.ok(report.controlsExpanded,'Unexpected collapsed appearance controls');
   assert.equal(report.overflow.length,0,'Card styles exceed the settings width: '+report.overflow);
   assert.ok(report.rootScrollWidth<=report.rootWidth+3,'Appearance pane has horizontal overflow');
   assert.ok(report.pageScrollWidth<=report.viewportWidth+3,'Document has horizontal overflow');
   for(const mode of ['dark','light']){
     const outcome=await page.evaluate(mode=>{
       setAppColorMode(mode,false);
       const root=document.querySelector('#settingsSec_appearance');
       const result={mode,errors:[],groups:{},contrasts:[]};
       function check(ok,message){if(!ok)result.errors.push(message)}
       for(const [name,selector,attr,bodyAttr,cssValue] of [
         ['palettes','button.theme-pill-option[data-theme]','theme','appTheme',btn=>getComputedStyle(document.body).backgroundImage],
         ['icons','button.icon-theme-pill[data-icon-theme]','iconTheme','iconTheme',btn=>document.documentElement.style.getPropertyValue('--app-active-icon-color').trim()],
         ['styles','button[data-card-style]','cardStyle','cardStyle',btn=>document.body.dataset.cardStyle]
       ]) {
         const buttons=[...root.querySelectorAll(selector)];
         const seen=new Set();
         for(const btn of buttons){
           btn.click();
           const target=btn.dataset[attr];
           check(document.body.dataset[bodyAttr]===target,name+' did not apply '+target);
           check(btn.getAttribute('aria-pressed')==='true',name+' not marked selected '+target);
           seen.add(cssValue(btn));
         }
         result.groups[name]={count:buttons.length,distinct:seen.size};
       }
       check(result.groups.palettes.distinct===8,'Backgrounds not distinct '+mode);
       check(result.groups.icons.distinct===8,'Icon colors not distinct '+mode);
       const footer=document.querySelector('#viewExpenses .cat-card-bottom-half');
       const value=footer?.querySelector('.cat-number-val,.cat-amount-val');
       if(footer&&value){
         const rgb=c=>{const start=c.indexOf('('),end=c.indexOf(')');return start>=0&&end>start?c.slice(start+1,end).split(',').slice(0,3).map(Number):null;};
         const lum=c=>c.map(v=>{const x=v/255;return x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4}).reduce((s,v,j)=>s+v*[.2126,.7152,.0722][j],0);
         const fg=rgb(getComputedStyle(value).color),bg=rgb(getComputedStyle(footer).backgroundColor);
         if(fg&&bg){const a=lum(fg),b=lum(bg);result.footerContrast=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);check(result.footerContrast>=4.5,'Expense amount contrast below AA: '+result.footerContrast);}
       }
       return result;
     },mode);
     console.log('SETTINGS_CHOICES '+viewport.name+' '+JSON.stringify(outcome));
     assert.deepEqual(outcome.errors,[]);
     assert.equal(outcome.groups.palettes.count,8);
     assert.equal(outcome.groups.icons.count,8);
     assert.equal(outcome.groups.styles.count,9);
   }
   await page.evaluate(()=>{
     localStorage.setItem('__appearance_qa_sentinel','preserved');
     document.querySelector('#settingsSec_appearance button[data-theme="rose"]').click();
     document.querySelector('#settingsSec_appearance button[data-icon-theme="monochrome"]').click();
     document.querySelector('#settingsSec_appearance button[data-card-style="flat"]').click();
     setAppColorMode('light');
   });
   await page.screenshot({path:'screenshots/'+viewport.name+'-appearance.png',fullPage:false});
   await page.reload({waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.body.dataset.appTheme==='rose'&&document.body.dataset.iconTheme==='monochrome'&&document.body.dataset.cardStyle==='flat'&&document.body.dataset.colorMode==='light',null,{timeout:30000});
   const saved=await page.evaluate(()=>({
     theme:localStorage.getItem('family_monefy_theme'),icons:localStorage.getItem('family_monefy_icon_theme'),
     card:localStorage.getItem('family_monefy_design_style'),mode:localStorage.getItem('family_monefy_color_mode'),
     untouched:localStorage.getItem('__appearance_qa_sentinel')
   }));
   console.log('SETTINGS_PERSIST '+viewport.name+' '+JSON.stringify(saved));
   assert.deepEqual(saved,{theme:'rose',icons:'monochrome',card:'flat',mode:'light',untouched:'preserved'});
   assert.deepEqual(exceptions,[],'Uncaught page JS exceptions');
   await context.close();
  }
  console.log('PASS: antigravity settings layouts and all visible controls at 360/390/1365, light/dark, contrast and persistence');
 }finally{await browser.close()}
})().catch(e=>{console.error('COMPACT_QA_FAILED',e);process.exitCode=1});
