// Static appearance validation: no browser data, financial storage or user files accessed.
// Run: node scripts/test-appearance-presets.js
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function extractMap(name) {
  const anchor = 'const ' + name + ' = {';
  const start = html.indexOf(anchor);
  assert.ok(start >= 0, name + ' not found in index.html');
  const tail = html.slice(start + anchor.length);
  const close = tail.indexOf('\n    };');
  assert.ok(close >= 0, name + ' is not a closed object');
  const data = tail.slice(0, close);
  const rows = [...data.matchAll(/^\s*(\w+):\s*\{\s*name:\s*'([^']+)'[^\n]*?dark:\s*'(#[\da-f]{6})',\s*light:\s*'(#[\da-f]{6})'/gim)]
    .map(m => ({key: m[1], name: m[2], dark: m[3], light: m[4]}));
  assert.equal(new Set(rows.map(row => row.key)).size, rows.length, name + ' has duplicate IDs');
  return rows;
}
const palettes = extractMap('APPEARANCE_PALETTES');
const icons = extractMap('APPEARANCE_ICON_THEMES');
assert.equal(palettes.length, 10, 'Expected 10 palettes');
assert.equal(icons.length, 10, 'Expected 10 icon themes');

const styles = ['glass', 'minimal', 'neumorphic', 'neon', 'clear',
  'elevated', 'outlined', 'gradient', 'compact', 'soft'];
const styleDefinition = html.match(/const validStyles\s*=\s*\[([^\]]+)\]/g) || [];
assert.ok(styleDefinition.some(line => styles.every(s => line.includes("'" + s + "'"))),
  'Expected all 10 selectable card styles');

function toRgb(hex) {
  return [1,3,5].map(i => parseInt(hex.slice(i, i+2), 16));
}
function luminance(rgb) {
  const s = rgb.map(v => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055)/1.055, 2.4);
  });
  return 0.2126*s[0] + 0.7152*s[1] + 0.0722*s[2];
}
function contrast(a,b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
function mix(a,b,pct) {
  return a.map((v,i)=>Math.round(v*pct+b[i]*(1-pct)));
}
const panel = {dark:toRgb('#111B2C'),light:toRgb('#F5F8FC')};
const card = {dark:toRgb('#17243A'),light:toRgb('#FFFFFF')};
const text = {dark:toRgb('#F8FAFC'),light:toRgb('#142033')};
let combos = 0, checks = 0, minimum = Infinity;
for (const palette of palettes) {
  for (const style of styles) {
    for (const mode of ['dark','light']) {
      const accent = toRgb(palette[mode]);
      const base = contrast(accent,panel[mode]);
      assert.ok(base >= 4.5,
        'Palette accent contrast below AA: '+palette.key+'/'+style+'/'+mode+' '+base);
      minimum = Math.min(minimum,base);
      checks++;
      const cardTextContrast = contrast(text[mode], card[mode]);
      assert.ok(cardTextContrast >= 4.5,
        'Card text contrast below AA: '+palette.key+'/'+style+'/'+mode);
      checks++;
      if (style === 'gradient') {
        for (let tint = 1; tint <= 9; tint++) {
          const tintColor = mix(accent,card[mode],tint/100);
          const ratio = contrast(text[mode],tintColor);
          assert.ok(ratio >= 4.5,
            'Gradient contrast below AA: '+palette.key+'/'+mode+' tint='+tint);
          minimum=Math.min(minimum,ratio);
          checks++;
        }
      }
      combos++;
    }
  }
}
for (const icon of icons) for (const mode of ['dark','light']) {
  const ratio = contrast(toRgb(icon[mode]),panel[mode]);
  assert.ok(ratio >= 3, 'Icon contrast below 3:1: '+icon.key+'/'+mode);
  minimum=Math.min(minimum,ratio);
  checks++;
}
assert.equal(combos,200);
assert.ok(html.includes('appearanceContrastBadge'), 'Contrast badge missing');
assert.ok(html.includes('appearanceModeLight') && html.includes('appearanceModeDark'),
  'Independent mode controls missing');
assert.ok(html.includes("family_monefy_design_style"), 'Card style persistence key missing');
assert.ok(html.includes("family_monefy_icon_theme"), 'Icon theme persistence key missing');
console.log('PASS: '+palettes.length+' palettes, '+styles.length+' card styles, '+icons.length+' icon themes');
console.log('PASS: '+combos+' combinations, '+checks+' computed contrast checks');
console.log('Minimum computed contrast: '+minimum.toFixed(2)+':1');
console.log('Note: static checks only; manual visual/mobile and storage-regression tests are still required.');
