'use strict';
/* Regression QA: no unfinished palette rows, readable category totals and labels
   in both color modes. Uses only blank Playwright browser storage. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const URL=process.env.APP_URL||'http://127.0.0.1:8765/';
const sizes=[{width:360,height:780},{width:390,height:844},{width:430,height:932},{width:1365,height:900}];
function rgb(color) {
  let m=color.match(/^rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (!m) throw new Error('Expected opaque RGB: '+color);
  return m.slice(1,4).map(Number);
}
function luma(arr) {
  let [r,g,b]=arr.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});
  return .2126*r+.7152*g+.0722*b;
}
function ratio(a,b) {
  const x=luma(rgb(a)),y=luma(rgb(b));
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
async function getGridRows(page,selector) {
  return page.evaluate(selector=>{
    const grid=document.querySelector(selector);
    const bounds=grid.getBoundingClientRect();
    const items=[...grid.querySelectorAll('button')];
    const rows=new Map();
    for(const el of items){
      const r=el.getBoundingClientRect();
      const y=Math.round(r.top);
      if(!rows.has(y))rows.set(y,[]);
      rows.get(y).push({left:r.left,right:r.right,width:r.width});
    }
    return {width:bounds.width,rows:[...rows.values()].map(arr=>({
      count:arr.length,
      leftGap:Math.round(Math.min(...arr.map(x=>x.left))-bounds.left),
      rightGap:Math.round(bounds.right-Math.max(...arr.map(x=>x.right)))
    })), count:items.length};
  },selector);
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try {
    for(const viewport of sizes){
      const context=await browser.newContext({viewport,isMobile:viewport.width<700,hasTouch:viewport.width<700,locale:'ar-SA'});
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
      assert.ok(response?.ok(),'App unavailable: '+response?.status());
      await page.waitForFunction(()=>document.querySelector('#settingsSec_appearance')?.dataset.compactReady==='true',{timeout:30000});
      await page.waitForSelector('#viewExpenses .cat-card .cat-amount-val',{timeout:30000});
      await page.evaluate(()=>window.openSettingsModal());
      for(const [key,query] of [
        ['colors','#settingsSec_appearance .appearance-palette-grid'],
        ['icons','#settingsSec_appearance .appearance-icon-grid']
      ]){
        await page.locator('#compactAppearanceToggle-'+key).click();
        const data=await getGridRows(page,query);
        assert.equal(data.count,10,key+' should have 10 options');
        assert.ok(data.rows.length>=2,key+' should occupy multiple complete rows');
        data.rows.forEach((row,i)=>{
          assert.ok(Math.abs(row.leftGap)<=3 && Math.abs(row.rightGap)<=3,
            key+' incomplete row '+i+' '+JSON.stringify(row));
        });
        console.log('GRID_OK '+viewport.width+' '+key+' '+JSON.stringify(data));
      }

      const palettes=['navy','emerald','purple','rose','ocean','gold','slate','midnight','forest','sapphire'];
      const modes=['dark','light'];
      for(const mode of modes) {
        await page.evaluate(mode=>window.setAppColorMode(mode,false),mode);
        for(const palette of palettes){
          await page.evaluate(palette=>window.setAppTheme(palette,false),palette);
          // Includes both zero and positive spend swatches without writing a transaction.
          const samples=await page.evaluate(()=>{
            const card=document.querySelector('#viewExpenses .cat-card');
            const top=card.querySelector('.cat-card-top-half');
            const lower=card.querySelector('.cat-card-bottom-half');
            const label=card.querySelector('.cat-label-text');
            const num=card.querySelector('.cat-number-val');
            const amount=card.querySelector('.cat-amount-val');
            const theme={
              label:getComputedStyle(label).color,
              top:getComputedStyle(top).backgroundColor,
              amount:getComputedStyle(amount).color,
              number:getComputedStyle(num).color,
              bottom:getComputedStyle(lower).backgroundColor,
              opacity:getComputedStyle(num).opacity,
              visible:getComputedStyle(num).visibility
            };
            lower.classList.add('has-spent');
            const spent={amount:getComputedStyle(amount).color,bottom:getComputedStyle(lower).backgroundColor};
            lower.classList.remove('has-spent');
            return {theme,spent};
          });
          const top=ratio(samples.theme.label,samples.theme.top);
          const money=ratio(samples.theme.number,samples.theme.bottom);
          const positive=ratio(samples.spent.amount,samples.spent.bottom);
          assert.ok(top>=4.5,'Category label contrast '+mode+'/'+palette+': '+top);
          assert.ok(money>=4.5,'Category amount contrast '+mode+'/'+palette+': '+money);
          assert.ok(positive>=4.5,'Spent category contrast '+mode+'/'+palette+': '+positive);
          assert.equal(samples.theme.visible,'visible');
          assert.equal(samples.theme.opacity,'1');
        }
      }
      assert.deepEqual(errors,[],'Console errors: '+errors.join(' / '));
      console.log('CONTRAST_OK '+viewport.width+' 10 palettes x 2 modes x label/amount/spent');
      await context.close();
    }
    console.log('PASS: complete color grids and accessible category totals for all tested mobile/desktop widths.');
  }finally{await browser.close()}
})().catch(e=>{console.error('GRID_CONTRAST_FAILURE',e.stack||e);process.exitCode=1});
