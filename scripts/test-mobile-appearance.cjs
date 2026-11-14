// Browser QA for the deployed family expense tracker. Runs in a fresh, isolated browser profile.
// No real user data, credentials or Google Drive account are used.
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const URL = process.env.APP_URL || 'https://maherelkhateeb.github.io/family-expense-tracker-dev/';
const modes = ['dark', 'light'];
const variants = [{name:'mobile-small', width:360, height:780}, {name:'mobile', width:390, height:844}, {name:'desktop', width:1365, height:900}];
const palettes = ['navy','emerald','purple','rose','ocean','gold','slate','midnight','forest','sapphire'];
const iconThemes = ['vibrant','gold','emerald','ocean','purple','ruby','amber','teal','indigo','rose'];
const cardStyles = ['glass','minimal','neumorphic','neon','clear','elevated','outlined','gradient','compact','soft'];
(async()=>{
  const browser = await chromium.launch({headless:true, args:['--no-sandbox']});
  let failures=0;
  try {
    for (const variant of variants) {
      const context = await browser.newContext({viewport:{width:variant.width,height:variant.height},locale:'ar-SA',deviceScaleFactor:1,isMobile:variant.name!=='desktop',hasTouch:variant.name!=='desktop'});
      const page = await context.newPage();
      const errors=[];
      page.on('pageerror', e=>errors.push(e.message));
      const response=await page.goto(URL+'?appearance_qa='+Date.now(), {waitUntil:'domcontentloaded',timeout:60000});
      assert.ok(response && response.ok(), variant.name+' page HTTP status '+response?.status());
      await page.waitForFunction(()=>typeof window.setAppTheme==='function' && typeof window.setAppColorMode==='function' && typeof window.setAppIconTheme==='function' && typeof window.setAppDesignStyle==='function',null,{timeout:25000});
      const initial=await page.evaluate(()=>({
        title:document.title,
        viewport:window.innerWidth,
        scrollWidth:document.documentElement.scrollWidth,
        palettes:document.querySelectorAll('#settingsSec_appearance .theme-pill-option[data-theme]').length,
        iconThemes:document.querySelectorAll('#settingsSec_appearance .icon-theme-pill[data-icon-theme]').length,
        cardStyles:document.querySelectorAll('#cardStyleButtonsContainer [data-card-style]').length,
        appearancePane:!!document.querySelector('#settingsThemePreview')
      }));
      console.log('INITIAL '+variant.name+' '+JSON.stringify(initial));
      assert.ok(initial.appearancePane, 'Appearance pane missing');
      assert.equal(initial.palettes,10,'Palette controls count');
      assert.equal(initial.iconThemes,10,'Icon theme controls count');
      assert.equal(initial.cardStyles,10,'Card style controls count');
      if(initial.scrollWidth>initial.viewport+2) console.warn('HORIZONTAL_OVERFLOW '+variant.name+' '+initial.scrollWidth+' / '+initial.viewport);
      const results=await page.evaluate(({palettes,iconThemes,cardStyles,modes})=>{
        const failures=[];
        let total=0,minContrast=Infinity;
        for(const mode of modes){
          try{window.setAppColorMode(mode,false)}catch(e){failures.push('mode '+mode+': '+e.message);continue}
          for(const theme of palettes){
            try{window.setAppTheme(theme,false)}catch(e){failures.push('theme '+mode+'/'+theme+': '+e.message);continue}
            for(const style of cardStyles){
              total++;
              try{
                window.setAppDesignStyle(style,false,false);
                window.updateAppearancePreview();
                const badge=document.getElementById('appearanceContrastBadge');
                const match=badge?.textContent?.match(/(\d+(?:\.\d+)?):1/);
                if(!match) throw new Error('contrast badge unavailable: '+badge?.textContent);
                const ratio=Number(match[1]);
                minContrast=Math.min(minContrast,ratio);
                if(ratio<4.5) throw new Error('contrast '+ratio+':1 below WCAG AA');
                if(document.body.getAttribute('data-card-style')!==style) throw new Error('card style not applied');
                if(document.body.getAttribute('data-app-theme')!==theme) throw new Error('palette not applied');
              }catch(e){failures.push(mode+'/'+theme+'/'+style+': '+e.message)}
            }
          }
          for(const icon of iconThemes){
            try{
              window.setAppIconTheme(icon,false);
              if(document.body.getAttribute('data-icon-theme')!==icon) throw new Error('icon theme not applied');
              if(!document.documentElement.style.getPropertyValue('--app-active-icon-color')) throw new Error('icon color empty');
            }catch(e){failures.push('icon '+mode+'/'+icon+': '+e.message)}
          }
        }
        return {total,minimumRatio:minContrast,failures};
      },{palettes,iconThemes,cardStyles,modes});
      console.log('COMBINATIONS '+variant.name+' '+JSON.stringify(results));
      if(results.total!==200||results.failures.length){
        failures+=results.failures.length || 1;
        console.error('FAILURES '+variant.name+' '+JSON.stringify(results.failures.slice(0,30)));
      }
      if(initial.scrollWidth>initial.viewport+2) failures++;
      await page.evaluate(()=>{
        localStorage.setItem('__appearance_qa_sentinel','keep-this-test-only-value');
        window.setAppTheme('rose',true);
        window.setAppIconTheme('teal',true);
        window.setAppDesignStyle('compact',false,true);
        window.setAppColorMode('light',true);
      });
      await page.reload({waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForFunction(()=>document.body.hasAttribute('data-card-style'),null,{timeout:25000});
      const persisted=await page.evaluate(()=>({
        sentinel:localStorage.getItem('__appearance_qa_sentinel'),
        theme:localStorage.getItem('family_monefy_theme'),
        icon:localStorage.getItem('family_monefy_icon_theme'),
        style:localStorage.getItem('family_monefy_design_style'),
        mode:localStorage.getItem('family_monefy_color_mode'),
        bodyMode:document.body.classList.contains('light-theme')?'light':'dark',
        bodyStyle:document.body.getAttribute('data-card-style'),
        bodyTheme:document.body.getAttribute('data-app-theme')
      }));
      console.log('PERSISTENCE '+variant.name+' '+JSON.stringify(persisted));
      if(persisted.sentinel!=='keep-this-test-only-value'||persisted.theme!=='rose'||persisted.icon!=='teal'||persisted.style!=='compact'||persisted.mode!=='light'||persisted.bodyMode!=='light'||persisted.bodyStyle!=='compact'||persisted.bodyTheme!=='rose'){
        failures++;console.error('PERSISTENCE_FAILURE '+variant.name);
      }
      await page.screenshot({path:'screenshots/'+variant.name+'.png',fullPage:false});
      console.log('JS_ERRORS '+variant.name+' '+JSON.stringify(errors.slice(0,10)));
      if(errors.length) failures++;
      await context.close();
    }
    assert.equal(failures,0,'Browser QA detected '+failures+' failure(s)');
    console.log('PASS: deployed mobile and desktop browser appearance QA');
  }finally{await browser.close()}
})().catch(e=>{console.error('BROWSER_QA_FAILED',e);process.exitCode=1});
