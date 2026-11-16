// Static contract: each visible appearance control must have a supported handler.
// Run: node scripts/test-appearance-presets.js
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
function options(selector, attr) {
  const from=html.indexOf(selector);
  assert.ok(from!==-1,'Missing section '+selector);
  const end=html.indexOf('</div>',from);
  assert.ok(end>from,'Unclosed section '+selector);
  const values=[...html.slice(from,end).matchAll(new RegExp(attr+'="([^"]+)"','g'))].map(m=>m[1]);
  assert.ok(values.length>0,'No options for '+selector);
  assert.equal(values.length,new Set(values).size,'Duplicate options for '+selector);
  return values;
}
function registry(name) {
  const start=html.indexOf('const '+name+' = {');
  assert.ok(start!==-1,'Missing registry '+name);
  const end=html.indexOf('\n    };',start);
  assert.ok(end>start,'Unclosed registry '+name);
  return new Set([...html.slice(start,end).matchAll(/^\s*(\w+):\s*\{/gm)].map(m=>m[1]));
}
const palettes=options('appearance-palette-grid antigravity-palette-grid','data-theme');
const icons=options('appearance-icon-grid antigravity-icon-grid','data-icon-theme');
const cards=options('antigravity-style-grid','data-card-style');
const themeKeys=registry('APPEARANCE_PALETTES');
const iconKeys=registry('APPEARANCE_ICON_THEMES');
const styles=html.match(/function setAppDesignStyle\([^)]*\)\s*\{\s*const validStyles = \[([^\]]+)\]/);
assert.ok(styles,'Missing design style allowlist');
const allowedStyles=new Set([...styles[1].matchAll(/'([^']+)'/g)].map(m=>m[1]));
for(const [controls,keys,action] of [[palettes,themeKeys,'setAppTheme'],[icons,iconKeys,'setAppIconTheme'],[cards,allowedStyles,'setAppDesignStyle']]){
  for(const key of controls){
    assert.ok(keys.has(key),action+' does not support '+key);
    assert.ok(html.includes('onclick="'+action+"('"+key+"')"),'Missing handler for '+action+': '+key);
  }
}
assert.deepEqual([palettes.length,icons.length,cards.length],[8,8,9],'Unexpected visible appearance control counts');
assert.ok(cards.includes('flat')&&icons.includes('monochrome'),'Known regressions were not fixed');
assert.ok(html.includes('family_monefy_theme')&&html.includes('family_monefy_icon_theme')&&html.includes('family_monefy_design_style'),'Missing storage keys');
assert.ok(html.includes('grid.dataset.cardStyle'),'Card style rebuild tracking missing');
assert.ok(html.includes('background: ${cardIconBg}'),'Category icons must use live icon colors');
console.log('PASS: '+palettes.length+' backgrounds, '+icons.length+' icon palettes, '+cards.length+' card styles; all controls map to engine entries.');
