// Structural smoke tests for the appearance v2 integration; no financial data is loaded or modified.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const root = fs.readFileSync('index.html','utf8');
const bridge = fs.readFileSync('appearance-bridge-v2.js','utf8');
const css = fs.readFileSync('appearance-bridge-v2.css','utf8');
for (const resource of ['appearance-v2.js','appearance-bridge-v2.js','appearance-bridge-v2.css']) {
  assert.ok(root.includes(resource), 'Missing appearance resource ' + resource);
}
assert.ok(root.includes('id="settingsPane_appearance"'));
assert.ok(bridge.includes("family_monefy_appearance_v2"));
assert.ok(bridge.includes("document.getElementById('themeCardsGrid')"));
assert.ok(bridge.includes("document.getElementById('cardStyleButtonsContainer')"));
assert.ok(!/removeItem\(|localStorage\.clear\(|indexedDB\.deleteDatabase\(/.test(bridge));
assert.ok(css.includes('html[data-appearance-v2] body .app-card-panel'));
assert.ok(css.includes('html[data-appearance-v2] body .history-card'));
assert.ok(css.includes('html[data-appearance-v2] body .summary-card'));
new Function(bridge); // Parse check, does not execute browser code
console.log('PASS: appearance v2 integration structure and JS syntax');


const appearance = require('./appearance-v2.js');
assert.ok(root.includes('id="familyAppearancePaletteGrid"'), 'Missing new palette controls');
assert.ok(root.includes('id="cardStyleButtonsContainer"'), 'Missing new card style controls');
assert.ok(root.includes('id="themeCardsGrid"'), 'Missing new theme drawer controls');
assert.ok(!/id=["']themeOpt[A-Za-z]+["']/.test(root), 'Legacy palette buttons still present');
assert.ok(!/\[data-app-theme\s*=\s*["'][^"']+["']\]/.test(root), 'Legacy theme CSS overrides remain');
assert.ok(root.includes('window.FamilyAppearanceBridgeV2'), 'Missing old theme API delegation');
assert.ok(root.includes("localStorage.getItem('family_monefy_theme')"), 'Old user preferences no longer readable');
assert.ok(!/family_monefy_(wallets|v2_tx|requests|monthly_budgets|expected)/.test(bridge),
  'Visual bridge must not modify financial storage keys');
assert.equal(appearance.palettes.length, 6);
assert.equal(appearance.cardStyles.length, 6);
assert.equal(appearance.cardColors.length, 4);
console.log('PASS: removed legacy UI/CSS and preserved appearance compatibility');
