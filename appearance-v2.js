/* Family Expense Tracker appearance presets v2.
   Standalone module: integration into index.html is a separate step.
   Does not read, write, or clear financial records. */
(function (root) {
  "use strict";
  const palettes = [
    ["facebook", "فيسبوك", "#0866FF"],
    ["emerald", "زمردي", "#047857"],
    ["violet", "بنفسجي", "#7C3AED"],
    ["teal", "تركواز", "#0F766E"],
    ["orange", "برتقالي", "#C2410C"],
    ["pink", "وردي", "#BE185D"],
    ["navy", "كحلي", "#1E40AF"],
    ["gold", "ذهبي", "#92400E"],
    ["red", "أحمر", "#B91C1C"],
    ["slate", "رمادي", "#475569"]
  ].map(([id, label, primary]) => ({ id, label, primary }));
  const cardStyles = ["flat", "raised", "outlined", "soft", "glass", "gradient", "side-stripe", "top-accent", "rounded", "minimal"];
  const cardColors = [
    { id: "auto", label: "تلقائي" },
    { id: "blue", label: "أزرق هادئ", background: "#DBEAFE", accent: "#1D4ED8" },
    { id: "green", label: "أخضر", background: "#D1FAE5", accent: "#047857" },
    { id: "purple", label: "بنفسجي", background: "#EDE9FE", accent: "#6D28D9" },
    { id: "sand", label: "رملي", background: "#FEF3C7", accent: "#92400E" },
    { id: "rose", label: "وردي هادئ", background: "#FCE7F3", accent: "#BE185D" }
  ];
  function rgb(hex) {
    const h = hex.replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error("Invalid hex color");
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  }
  function luminance(hex) {
    const [r, g, b] = rgb(hex).map(v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrast(a, b) {
    const x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  function readableText(background) {
    return contrast(background, "#FFFFFF") >= contrast(background, "#111827") ? "#FFFFFF" : "#111827";
  }
  function resolve({ palette = "facebook", cardStyle = "raised", cardColor = "auto", mode = "light" } = {}) {
    const p = palettes.find(x => x.id === palette) || palettes[0];
    const c = cardColors.find(x => x.id === cardColor) || cardColors[0];
    const dark = mode === "dark";
    const background = c.background || (dark ? "#242526" : "#FFFFFF");
    const accent = c.accent || p.primary;
    return {
      palette: p.id, cardStyle: cardStyles.includes(cardStyle) ? cardStyle : "raised",
      cardColor: c.id, mode: dark ? "dark" : "light",
      primary: p.primary, pageBackground: dark ? "#18191A" : "#F0F2F5",
      cardBackground: background, cardText: readableText(background),
      accent, accentText: readableText(accent),
      secondaryText: dark && c.id === "auto" ? "#B0B3B8" : readableText(background)
    };
  }
  const api = Object.freeze({ palettes, cardStyles, cardColors, contrast, readableText, resolve });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.FamilyAppearanceV2 = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
