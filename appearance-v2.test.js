// Run with: node appearance-v2.test.js
const assert = require("node:assert/strict");
const appearance = require("./appearance-v2.js");
assert.equal(appearance.palettes.length, 6);
assert.equal(appearance.cardStyles.length, 6);
assert.equal(appearance.cardColors.length, 4);
let combinations = 0;
for (const p of appearance.palettes) {
  for (const style of appearance.cardStyles) {
    for (const c of appearance.cardColors) {
      for (const mode of ["light", "dark"]) {
        const t = appearance.resolve({ palette: p.id, cardStyle: style, cardColor: c.id, mode });
        assert.equal(t.palette, p.id);
        assert.equal(t.cardStyle, style);
        assert.equal(t.cardColor, c.id);
        assert.ok(appearance.contrast(t.cardBackground, t.cardText) >= 4.5,
          `Card text contrast failed: ${p.id}/${style}/${c.id}/${mode}`);
        assert.ok(appearance.contrast(t.accent, t.accentText) >= 4.5,
          `Accent text contrast failed: ${p.id}/${style}/${c.id}/${mode}`);
        combinations++;
      }
    }
  }
}
assert.equal(combinations, 288);

// Custom colors are user input: verify multiple extreme and mid-tone backgrounds.
const customSamples = [
  ['#000000', '#FFFFFF'], ['#FFFFFF', '#000000'],
  ['#777777', '#777777'], ['#ABCDEF', '#FFED40'],
  ['#223344', '#99AABB'], ['#EEEEEE', '#BBBBBB']
];
let customChecks = 0;
for (const [customBackground, customAccent] of customSamples) {
  for (const p of appearance.palettes) {
    for (const style of appearance.cardStyles) {
      for (const mode of ['light', 'dark']) {
        const theme = appearance.resolve({
          palette: p.id, cardStyle: style, cardColor: 'custom',
          mode, customBackground, customAccent
        });
        assert.equal(theme.cardBackground, customBackground);
        assert.equal(theme.accent, customAccent);
        assert.ok(appearance.contrast(theme.cardBackground, theme.cardText) >= 4.5,
          'Custom card text failed: ' + [customBackground, p.id, style, mode].join('/'));
        assert.ok(appearance.contrast(theme.gradientEnd, theme.cardText) >= 4.5,
          'Custom gradient endpoint failed: ' + [customBackground, p.id, style, mode].join('/'));
        assert.ok(appearance.contrast(theme.cardBackground, theme.cardIcon) >= 3,
          'Custom card icon failed: ' + [customBackground, p.id, style, mode].join('/'));
        assert.ok(appearance.contrast(theme.accent, theme.accentText) >= 4.5,
          'Custom accent text failed: ' + [customAccent, p.id, style, mode].join('/'));
        customChecks++;
      }
    }
  }
}
assert.equal(customChecks, 432);
console.log('PASS: ' + customChecks + ' custom color combinations and gradient contrasts');

console.log(`PASS: ${combinations} combinations validated`);
