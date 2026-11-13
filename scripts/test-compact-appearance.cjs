/* Isolated viewport QA for the compact mobile settings modal. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const URL=process.env.APP_URL || 'http://127.0.0.1:8765/';
const sizes=[{name:'mobile-360',width:360,height:780},{name:'mobile-390',width:390,height:844},{name:'desktop',width:1365,height:900}];

(async function main(){
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try{
    for(const size of sizes){
      const context=await browser.newContext({viewport:{width:size.width,height:size.height},isMobile:size.name!=='desktop',hasTouch:size.name!=='desktop',locale:'ar-SA'});
      const page=await context.newPage();
      const exceptions=[];
      page.on('pageerror',error=>exceptions.push(error.message));
      const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
      assert.ok(response?.ok(),'App page failed HTTP '+response?.status());
      await page.waitForFunction(()=>document.querySelector('#settingsSec_appearance')?.dataset.compactReady==='true',{timeout:20000});
      await page.evaluate(()=>window.openSettingsModal());
      await page.locator('#settingsModal').waitFor({state:'visible',timeout:20000});
      const initial=await page.evaluate(()=>{
        const root=document.querySelector('#settingsSec_appearance');
        const accordions=Array.from(root.querySelectorAll('.compact-appearance-section'));
        return {
          count:accordions.length, keys:accordions.map(x=>x.dataset.appearanceSection),
          expanded:accordions.filter(x=>x.querySelector('.compact-appearance-toggle').getAttribute('aria-expanded')==='true').map(x=>x.dataset.appearanceSection),
          height:Math.round(root.getBoundingClientRect().height),
          width:root.clientWidth, contentWidth:root.scrollWidth,
          viewportWidth:innerWidth, scrollWidth:document.documentElement.scrollWidth,
          palettes:root.querySelectorAll('.theme-pill-option[data-theme]').length,
          icons:root.querySelectorAll('.icon-theme-pill[data-icon-theme]').length,
          cards:root.querySelectorAll('#cardStyleButtonsContainer [data-card-style]').length
        };
      });
      console.log('COMPACT_INITIAL '+size.name+' '+JSON.stringify(initial));
      assert.deepEqual(initial.keys,['basics','colors','icons','font','cards']);
      assert.deepEqual(initial.expanded,['basics']);
      assert.equal(initial.palettes,10);
      assert.equal(initial.icons,10);
      assert.equal(initial.cards,10);
      assert.ok(initial.height<530,'Too tall while collapsed: '+initial.height);
      assert.ok(initial.contentWidth<=initial.width+2,'Appearance panel horizontal overflow');
      assert.ok(initial.scrollWidth<=initial.viewportWidth+2,'Document horizontal overflow');

      // Genuine settings modal in an isolated blank profile, with no user data.
      await page.screenshot({path:'screenshots/'+size.name+'-closed.png',fullPage:false});
      for(const name of ['colors','icons','font','cards']){
        const toggle=page.locator('#compactAppearanceToggle-'+name);
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'),'true');
        assert.equal(await page.locator('#compactAppearancePanel-'+name).getAttribute('hidden'),null);
      }

      // Prevent the exact blank-tail rows reported by the user in appearance
      // options, at every viewport and in both light and dark modes.
      for (const mode of ['light','dark']) {
        await page.evaluate(mode=>window.setAppColorMode(mode),mode);
        const checked=await page.evaluate(()=>{
          const selectors=['.appearance-palette-grid','.appearance-icon-grid'];
          const report={};
          for(const selector of selectors){
            const grid=document.querySelector('#settingsSec_appearance '+selector);
            const bounds=grid.getBoundingClientRect();
            const elements=Array.from(grid.querySelectorAll(':scope > button'));
            const rows=new Map();
            for(const node of elements){
              const rect=node.getBoundingClientRect();
              const key=Math.round(rect.top);
              if(!rows.has(key))rows.set(key,[]);
              rows.get(key).push(rect);
            }
            report[selector]={
              count:elements.length,
              layout:Array.from(rows.values()).map(items=>items.length),
              blankEdges:Array.from(rows.values()).map(items=>{
                const left=Math.min(...items.map(r=>r.left));
                const right=Math.max(...items.map(r=>r.right));
                return Math.round(Math.max(0,left-bounds.left,right-bounds.right));
              }),
              noOverflow:elements.every(node=>{
                const b=node.getBoundingClientRect();
                return b.left>=bounds.left-2 && b.right<=bounds.right+2;
              })
            };
          }
          const footer=document.querySelector('#viewExpenses .cat-card-bottom-half');
          const value=footer?.querySelector('.cat-number-val');
          function rgb(color){const m=color.match(/rgba?\(([^)]+)\)/);return m?m[1].split(',').slice(0,3).map(Number):null}
          function lum(values){const c=values.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
          function contrast(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
          report.footerCount=document.querySelectorAll('#viewExpenses .cat-card-bottom-half .cat-number-val').length;
          report.footerRatio=value&&footer?contrast(rgb(getComputedStyle(value).color),rgb(getComputedStyle(footer).backgroundColor)):0;
          report.footerTextColor=value?getComputedStyle(value).color:'missing';
          report.footerBackground=footer?getComputedStyle(footer).backgroundColor:'missing';
          return report;
        });
        console.log('GRID_GAPS '+size.name+' '+mode+' '+JSON.stringify(checked));
        for (const selector of ['.appearance-palette-grid','.appearance-icon-grid']) {
          assert.equal(checked[selector].count,10,selector+' options changed');
          assert.ok(checked[selector].noOverflow,selector+' overflow');
          assert.ok(checked[selector].blankEdges.every(gap=>gap<=3),
            selector+' contains blank partial rows '+JSON.stringify(checked[selector]));
        }
        assert.ok(checked.footerCount>0,'Expense category values are missing');
        assert.ok(checked.footerRatio>=4.5,
          'Expense amount unreadable ('+mode+'): '+JSON.stringify(checked));
      }

      await page.screenshot({path:'screenshots/'+size.name+'-open.png',fullPage:false});

      // Verify settings continue to work after moving the original controls.
      await page.locator('#settingsSec_appearance .theme-pill-option[data-theme="rose"]').click();
      await page.locator('#settingsSec_appearance .icon-theme-pill[data-icon-theme="teal"]').click();
      await page.locator('#settingsSec_appearance #cardStyleButtonsContainer button[data-card-style="compact"]').click();
      await page.locator('#fontSizeLarge').click();
      await page.locator('#appearanceModeLight').click();
      const selected=await page.evaluate(()=>({
        theme:document.body.dataset.appTheme,
        icon:document.body.dataset.iconTheme,
        card:document.body.dataset.cardStyle,
        fontSize:document.body.dataset.fontSize,
        light:document.body.classList.contains('light-theme'),
        cardsSummary:document.querySelector('#compactAppearanceToggle-cards .compact-appearance-summary')?.textContent?.trim(),
        modeSummary:document.querySelector('#compactAppearanceToggle-basics .compact-appearance-summary')?.textContent?.trim()
      }));
      console.log('COMPACT_SELECTED '+size.name+' '+JSON.stringify(selected));
      assert.equal(selected.theme,'rose');
      assert.equal(selected.icon,'teal');
      assert.equal(selected.card,'compact');
      assert.equal(selected.fontSize,'large');
      assert.equal(selected.light,true);
      assert.equal(selected.cardsSummary,'مدمج');
      assert.equal(selected.modeSummary,'فاتح');

      await page.reload({waitUntil:'domcontentloaded',timeout:45000});
      await page.waitForFunction(()=>document.querySelector('#settingsSec_appearance')?.dataset.compactReady==='true',{timeout:20000});
      const persisted=await page.evaluate(()=>({
        theme:document.body.dataset.appTheme,
        icon:document.body.dataset.iconTheme,
        card:document.body.dataset.cardStyle,
        fontSize:document.body.dataset.fontSize,
        light:document.body.classList.contains('light-theme'),
        count:document.querySelectorAll('#settingsSec_appearance .compact-appearance-section').length
      }));
      console.log('COMPACT_PERSIST '+size.name+' '+JSON.stringify(persisted));
      assert.equal(persisted.theme,'rose');
      assert.equal(persisted.icon,'teal');
      assert.equal(persisted.card,'compact');
      assert.equal(persisted.fontSize,'large');
      assert.equal(persisted.light,true);
      assert.equal(persisted.count,5);
      assert.deepEqual(exceptions,[],'Browser page errors: '+exceptions.join(' / '));
      await context.close();
    }
    console.log('PASS: 5-section compact mobile design, responsive size, settings persistence');
  } finally { await browser.close(); }
})().catch(e=>{console.error('COMPACT_QA_FAILED',e);process.exitCode=1});
