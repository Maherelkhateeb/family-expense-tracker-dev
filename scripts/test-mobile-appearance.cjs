// Real browser verification on a local copy, without private financial data.
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const URL=process.env.APP_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  for(const viewport of [{width:360,height:780},{width:390,height:844},{width:1365,height:900}]) {
   const context=await browser.newContext({viewport,locale:'ar-SA',serviceWorkers:'block'});
   const page=await context.newPage();
   const response=await page.goto(URL+'?appearance_qa=1',{waitUntil:'domcontentloaded',timeout:60000});
   assert.ok(response&&response.ok(),'Application HTTP error');
   await page.waitForFunction(()=>typeof setAppTheme==='function'&&typeof setAppIconTheme==='function'&&typeof setAppDesignStyle==='function'&&typeof setAppColorMode==='function',null,{timeout:25000});
   const result=await page.evaluate(()=>{
     const errors=[],counts={palettes:0,icons:0,styles:0},distinct={};
     const assertDOM=(ok,msg)=>{if(!ok)errors.push(msg);};
     const palettes=[...document.querySelectorAll('#settingsSec_appearance button.theme-pill-option[data-theme]')];
     const icons=[...document.querySelectorAll('#settingsSec_appearance button.icon-theme-pill[data-icon-theme]')];
     const styles=[...document.querySelectorAll('#settingsSec_appearance button[data-card-style]')];
     assertDOM(palettes.length===8&&icons.length===8&&styles.length===9,'Wrong number of appearance options');
     for(const mode of ['dark','light']){
       setAppColorMode(mode,false);
       assertDOM(document.body.dataset.colorMode===mode,'Mode did not apply '+mode);
       const backgrounds=new Set();
       for(const btn of palettes) {
         btn.click();counts.palettes++;
         assertDOM(document.body.dataset.appTheme===btn.dataset.theme,'Palette '+mode+'/'+btn.dataset.theme+' not applied');
         assertDOM(btn.getAttribute('aria-pressed')==='true','Palette selection not active '+btn.dataset.theme);
         backgrounds.add(getComputedStyle(document.body).backgroundImage);
       }
       assertDOM(backgrounds.size===palettes.length,'Backgrounds lack distinct colors '+mode+' '+backgrounds.size);
       const iconColors=new Set();
       for(const btn of icons) {
         btn.click();counts.icons++;
         assertDOM(document.body.dataset.iconTheme===btn.dataset.iconTheme,'Icon theme not applied '+btn.dataset.iconTheme);
         assertDOM(btn.getAttribute('aria-pressed')==='true','Icon selection not active '+btn.dataset.iconTheme);
         iconColors.add(document.documentElement.style.getPropertyValue('--app-active-icon-color').trim());
       }
       assertDOM(iconColors.size===icons.length,'Icon colors lack distinction '+mode+' '+iconColors.size);
       for(const btn of styles) {
         btn.click();counts.styles++;
         assertDOM(document.body.dataset.cardStyle===btn.dataset.cardStyle,'Style not applied '+btn.dataset.cardStyle);
         assertDOM(btn.getAttribute('aria-pressed')==='true','Style selection not active '+btn.dataset.cardStyle);
         const grid=document.getElementById('catGrid');
         if(grid)assertDOM(grid.dataset.cardStyle===btn.dataset.cardStyle,'Category grid style stale '+btn.dataset.cardStyle);
       }
       distinct[mode]={backgrounds:backgrounds.size,icons:iconColors.size};
     }
     return {errors,counts,distinct};
   });
   console.log('APPEARANCE '+viewport.width+' '+JSON.stringify(result));
   assert.deepEqual(result.errors,[],'UI appearance failures');
   await page.evaluate(()=>{
     localStorage.setItem('__appearance_qa_sentinel','preserved');
     document.querySelector('#settingsSec_appearance button[data-theme="rose"]').click();
     document.querySelector('#settingsSec_appearance button[data-icon-theme="monochrome"]').click();
     document.querySelector('#settingsSec_appearance button[data-card-style="flat"]').click();
     setAppColorMode('light');
   });
   await page.reload({waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>document.body.dataset.appTheme==='rose'&&document.body.dataset.iconTheme==='monochrome'&&document.body.dataset.cardStyle==='flat'&&document.body.dataset.colorMode==='light',null,{timeout:30000});
   const persisted=await page.evaluate(()=>({
     theme:localStorage.getItem('family_monefy_theme'),
     icons:localStorage.getItem('family_monefy_icon_theme'),
     style:localStorage.getItem('family_monefy_design_style'),
     mode:localStorage.getItem('family_monefy_color_mode'),
     sentinel:localStorage.getItem('__appearance_qa_sentinel')
   }));
   console.log('PERSIST '+viewport.width+' '+JSON.stringify(persisted));
   assert.deepEqual(persisted,{theme:'rose',icons:'monochrome',style:'flat',mode:'light',sentinel:'preserved'});
   await context.close();
  }
  console.log('PASS: all visible palettes, icon themes, styles, dark/light mode and post-reload persistence in 3 viewports');
 } finally{await browser.close();}
})().catch(err=>{console.error('BROWSER_QA_FAILED',err);process.exitCode=1});
