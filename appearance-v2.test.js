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
console.log(`PASS: ${combinations} combinations validated`);
