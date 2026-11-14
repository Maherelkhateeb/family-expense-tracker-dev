#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Design System Master Upgrade:
1. Luxury Muted Themes (Obsidian Dark, Executive Midnight Navy, Emerald Jade, Velvet Amethyst, Titanium Slate, Clean Pearl Light)
2. Professional Typography (IBM Plex Sans Arabic as default, Readex Pro, Almarai, clean proportional font scales, no 0.48rem hacks)
3. Refined Card Styles (Glassmorphism, Minimal Modern, Soft Surface, Subtle FinTech Glow)
4. Harmonious Duo-tone & Metallic Icon Styles
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Theme CSS Rules (Lines ~99924)
theme_css_start = text.find(':root, [data-app-theme="navy"]')
theme_css_end = text.find('body {', theme_css_start)

if theme_css_start != -1 and theme_css_end != -1:
    new_theme_css = ''':root, [data-app-theme="black"], body[data-app-theme="black"] {
      --bg-app: #07090e !important;
      --bg-card: rgba(16, 24, 39, 0.88) !important;
      --bg-card-sub: rgba(26, 36, 56, 0.90) !important;
      --border: rgba(148, 163, 184, 0.14) !important;
      --accent: #38bdf8 !important;
      --accent-light: #7dd3fc !important;
      --header-bg: rgba(9, 13, 20, 0.97) !important;
      --nav-bg: rgba(9, 13, 20, 0.97) !important;
      --body-bg: radial-gradient(circle at top, #111827 0%, #07090e 100%) !important;
    }

    [data-app-theme="navy"], body[data-app-theme="navy"] {
      --bg-app: #0a1122 !important;
      --bg-card: rgba(18, 29, 51, 0.90) !important;
      --bg-card-sub: rgba(28, 44, 76, 0.92) !important;
      --border: rgba(56, 189, 248, 0.16) !important;
      --accent: #0284c7 !important;
      --accent-light: #38bdf8 !important;
      --header-bg: rgba(11, 19, 36, 0.97) !important;
      --nav-bg: rgba(10, 17, 32, 0.97) !important;
      --body-bg: radial-gradient(circle at top, #13233f 0%, #0a1122 100%) !important;
    }

    [data-app-theme="emerald"], body[data-app-theme="emerald"] {
      --bg-app: #041410 !important;
      --bg-card: rgba(7, 34, 26, 0.90) !important;
      --bg-card-sub: rgba(14, 52, 40, 0.92) !important;
      --border: rgba(16, 185, 129, 0.16) !important;
      --accent: #10b981 !important;
      --accent-light: #34d399 !important;
      --header-bg: rgba(5, 22, 17, 0.97) !important;
      --nav-bg: rgba(4, 20, 15, 0.97) !important;
      --body-bg: radial-gradient(circle at top, #0a2d21 0%, #041410 100%) !important;
    }

    [data-app-theme="purple"], body[data-app-theme="purple"] {
      --bg-app: #0d0a1a !important;
      --bg-card: rgba(26, 18, 48, 0.90) !important;
      --bg-card-sub: rgba(38, 26, 70, 0.92) !important;
      --border: rgba(168, 85, 247, 0.18) !important;
      --accent: #a855f7 !important;
      --accent-light: #c084fc !important;
      --header-bg: rgba(15, 11, 28, 0.97) !important;
      --nav-bg: rgba(13, 10, 24, 0.97) !important;
      --body-bg: radial-gradient(circle at top, #21153d 0%, #0d0a1a 100%) !important;
    }

    [data-app-theme="slate"], body[data-app-theme="slate"] {
      --bg-app: #0f141c !important;
      --bg-card: rgba(24, 32, 47, 0.90) !important;
      --bg-card-sub: rgba(36, 48, 70, 0.92) !important;
      --border: rgba(148, 163, 184, 0.16) !important;
      --accent: #94a3b8 !important;
      --accent-light: #cbd5e1 !important;
      --header-bg: rgba(16, 22, 31, 0.97) !important;
      --nav-bg: rgba(15, 20, 28, 0.97) !important;
      --body-bg: radial-gradient(circle at top, #1e2838 0%, #0f141c 100%) !important;
    }

    [data-app-theme="light"], body[data-app-theme="light"] {
      --bg-app: #f8fafc !important;
      --bg-card: #ffffff !important;
      --bg-card-sub: #f1f5f9 !important;
      --border: rgba(203, 213, 225, 0.85) !important;
      --accent: #0284c7 !important;
      --accent-light: #38bdf8 !important;
      --header-bg: rgba(255, 255, 255, 0.98) !important;
      --nav-bg: rgba(255, 255, 255, 0.98) !important;
      --body-bg: #f8fafc !important;
    }
    '''
    text = text[:theme_css_start] + new_theme_css + text[theme_css_end:]
    print("✓ Replaced Theme CSS rules with luxury palettes!")
else:
    print("Warning: Could not find theme CSS start/end")

# 2. Update Default Font to IBM Plex Sans Arabic in head & root
text = text.replace(
    "var fk = localStorage.getItem('family_expense_app_font') || 'tajawal';",
    "var fk = localStorage.getItem('family_expense_app_font') || 'ibm';"
)
text = text.replace(
    "let currentAppFont = 'tajawal';",
    "let currentAppFont = 'ibm';"
)

# 3. Clean up font scale definitions and card styles in CSS
font_scale_snippet = '''/* --- 2. Font Size Scaling: Strict Proportional Containment --- */
    html[data-font-size="small"], body[data-font-size="small"] {
      font-size: 13px !important;
      --app-font-scale: 0.92;
    }
    html[data-font-size="medium"], body[data-font-size="medium"] {
      font-size: 14px !important;
      --app-font-scale: 1;
    }
    html[data-font-size="large"], body[data-font-size="large"] {
      font-size: 15px !important;
      --app-font-scale: 1.07;
    }

    /* أنماط الكروت الفاخرة المحدثة */
    body[data-card-style="glass"] .app-card-panel,
    body[data-card-style="glass"] .modal-content-card,
    body[data-card-style="glass"] .ops-tx-card-lux,
    body[data-card-style="glass"] .exp-cockpit-card {
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      border: 1px solid var(--border) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.28) !important;
    }

    body[data-card-style="minimal"] .app-card-panel,
    body[data-card-style="minimal"] .modal-content-card,
    body[data-card-style="minimal"] .ops-tx-card-lux,
    body[data-card-style="minimal"] .exp-cockpit-card {
      border: 1px solid var(--border) !important;
      box-shadow: none !important;
    }

    body[data-card-style="neumorphic"] .app-card-panel,
    body[data-card-style="neumorphic"] .modal-content-card,
    body[data-card-style="neumorphic"] .ops-tx-card-lux,
    body[data-card-style="neumorphic"] .exp-cockpit-card {
      border: 1px solid rgba(255,255,255,0.06) !important;
      box-shadow: 4px 4px 14px rgba(0,0,0,0.4), -3px -3px 10px rgba(255,255,255,0.03) !important;
    }

    body[data-card-style="neon"] .app-card-panel,
    body[data-card-style="neon"] .modal-content-card,
    body[data-card-style="neon"] .ops-tx-card-lux,
    body[data-card-style="neon"] .exp-cockpit-card {
      border: 1.2px solid var(--accent) !important;
      box-shadow: 0 2px 12px rgba(56, 189, 248, 0.20) !important;
    }'''

pos_fs_start = text.find('/* --- 2. Font Size Scaling: Strict Proportional Containment --- */')
if pos_fs_start != -1:
    pos_fs_end = text.find('/* --- 3. Top Header Brand Row Containment --- */', pos_fs_start)
    if pos_fs_end != -1:
        text = text[:pos_fs_start] + font_scale_snippet + '\n\n    ' + text[pos_fs_end:]
        print("✓ Replaced font size scaling and card styles cleanly!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved updated index.html for Design System Upgrade.")
