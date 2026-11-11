import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("Initial length:", len(html))

# =========================================================================
# 1. THEMES & CARD STYLES CSS OVERHAUL
# =========================================================================
# Locate block from 175728 (or "/* 1. السمة: كحلي ملكي أزرق") to card styles
s_theme = html.find('/* 1. السمة: كحلي ملكي أزرق (Royal Navy Sapphire) */')
if s_theme == -1:
    s_theme = html.find('html[data-app-theme="navy"], body[data-app-theme="navy"]')
    if s_theme != -1:
        s_theme = html.rfind('/*', 0, s_theme)

e_theme = html.find('/* =========================================================================\n       أنماط وتصاميم عرض الكروت', s_theme)

print(f"Theme CSS block found: {s_theme} to {e_theme}")

new_themes_css = '''/* =========================================================================
       منظومة السمات والخلفيات الفاخرة المحدثة v5.2.1 (Luxury FinTech Themes & Palettes)
       ========================================================================= */

    /* 1. السمة: كحلي ملكي أزرق فاخر (Royal Navy Sapphire) */
    html[data-app-theme="navy"], body[data-app-theme="navy"],
    [data-app-theme="navy"] .mobile-frame,
    [data-app-theme="navy"] #appFrame,
    [data-app-theme="navy"] .app-scroll-body,
    [data-app-theme="navy"] .page-view {
      --bg-app: #060d1d !important;
      --bg-card: rgba(12, 23, 46, 0.85) !important;
      --bg-card-sub: rgba(18, 32, 62, 0.90) !important;
      --border: rgba(56, 189, 248, 0.18) !important;
      --accent: #38bdf8 !important;
      --accent-light: #7dd3fc !important;
      background: #060d1d !important;
    }
    [data-app-theme="navy"] .mobile-frame { background: #060d1d !important; }
    [data-app-theme="navy"] .app-header {
      background: rgba(6, 13, 29, 0.96) !important;
      border-bottom: 1.2px solid rgba(56, 189, 248, 0.22) !important;
      backdrop-filter: blur(16px) !important;
    }
    [data-app-theme="navy"] .app-bottom-nav {
      background: rgba(6, 13, 29, 0.96) !important;
      border-top: 1.2px solid rgba(56, 189, 248, 0.22) !important;
      backdrop-filter: blur(16px) !important;
    }
    [data-app-theme="navy"] .kpi-master-wealth-cockpit,
    [data-app-theme="navy"] .executive-cockpit-card,
    [data-app-theme="navy"] .ops-tx-card-clean,
    [data-app-theme="navy"] .expected-clean-card,
    [data-app-theme="navy"] .chart-glass-panel,
    [data-app-theme="navy"] .modal-content-card,
    [data-app-theme="navy"] .side-drawer-panel,
    [data-app-theme="navy"] .settings-unified-section,
    [data-app-theme="navy"] .app-card-panel {
      background: rgba(12, 23, 46, 0.85) !important;
      border: 1px solid rgba(56, 189, 248, 0.18) !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.40) !important;
    }

    /* 2. السمة: أسود ملكي فاحم (OLED Deep Obsidian) */
    html[data-app-theme="black"], body[data-app-theme="black"],
    [data-app-theme="black"] .mobile-frame,
    [data-app-theme="black"] #appFrame,
    [data-app-theme="black"] .app-scroll-body,
    [data-app-theme="black"] .page-view {
      --bg-app: #020610 !important;
      --bg-card: rgba(15, 23, 42, 0.88) !important;
      --bg-card-sub: rgba(24, 34, 56, 0.90) !important;
      --border: rgba(255, 255, 255, 0.11) !important;
      --accent: #38bdf8 !important;
      --accent-light: #7dd3fc !important;
      background: #020610 !important;
    }
    [data-app-theme="black"] .mobile-frame { background: #020610 !important; }
    [data-app-theme="black"] .app-header {
      background: rgba(4, 9, 20, 0.97) !important;
      border-bottom: 1.2px solid rgba(255, 255, 255, 0.12) !important;
    }
    [data-app-theme="black"] .app-bottom-nav {
      background: rgba(4, 9, 20, 0.97) !important;
      border-top: 1.2px solid rgba(255, 255, 255, 0.12) !important;
    }
    [data-app-theme="black"] .kpi-master-wealth-cockpit,
    [data-app-theme="black"] .executive-cockpit-card,
    [data-app-theme="black"] .ops-tx-card-clean,
    [data-app-theme="black"] .expected-clean-card,
    [data-app-theme="black"] .chart-glass-panel,
    [data-app-theme="black"] .modal-content-card,
    [data-app-theme="black"] .side-drawer-panel,
    [data-app-theme="black"] .settings-unified-section,
    [data-app-theme="black"] .app-card-panel {
      background: rgba(15, 23, 42, 0.88) !important;
      border: 1px solid rgba(255, 255, 255, 0.11) !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.50) !important;
    }

    /* 3. السمة: زمردي ملكي فاخر (Imperial Emerald Luxury) */
    html[data-app-theme="emerald"], body[data-app-theme="emerald"],
    [data-app-theme="emerald"] .mobile-frame,
    [data-app-theme="emerald"] #appFrame,
    [data-app-theme="emerald"] .app-scroll-body,
    [data-app-theme="emerald"] .page-view {
      --bg-app: #03140e !important;
      --bg-card: rgba(6, 32, 22, 0.85) !important;
      --bg-card-sub: rgba(10, 48, 34, 0.90) !important;
      --border: rgba(16, 185, 129, 0.20) !important;
      --accent: #10b981 !important;
      --accent-light: #34d399 !important;
      background: #03140e !important;
    }
    [data-app-theme="emerald"] .mobile-frame { background: #03140e !important; }
    [data-app-theme="emerald"] .app-header {
      background: rgba(3, 20, 14, 0.96) !important;
      border-bottom: 1.2px solid rgba(16, 185, 129, 0.22) !important;
    }
    [data-app-theme="emerald"] .app-bottom-nav {
      background: rgba(3, 20, 14, 0.96) !important;
      border-top: 1.2px solid rgba(16, 185, 129, 0.22) !important;
    }
    [data-app-theme="emerald"] .kpi-master-wealth-cockpit,
    [data-app-theme="emerald"] .executive-cockpit-card,
    [data-app-theme="emerald"] .ops-tx-card-clean,
    [data-app-theme="emerald"] .expected-clean-card,
    [data-app-theme="emerald"] .chart-glass-panel,
    [data-app-theme="emerald"] .modal-content-card,
    [data-app-theme="emerald"] .side-drawer-panel,
    [data-app-theme="emerald"] .settings-unified-section,
    [data-app-theme="emerald"] .app-card-panel {
      background: rgba(6, 32, 22, 0.85) !important;
      border: 1px solid rgba(16, 185, 129, 0.20) !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45) !important;
    }

    /* 4. السمة: بنفسجي إمبراطوري فاخر (Imperial Amethyst) */
    html[data-app-theme="purple"], body[data-app-theme="purple"],
    [data-app-theme="purple"] .mobile-frame,
    [data-app-theme="purple"] #appFrame,
    [data-app-theme="purple"] .app-scroll-body,
    [data-app-theme="purple"] .page-view {
      --bg-app: #0d0819 !important;
      --bg-card: rgba(24, 15, 42, 0.85) !important;
      --bg-card-sub: rgba(38, 22, 66, 0.90) !important;
      --border: rgba(168, 85, 247, 0.20) !important;
      --accent: #a855f7 !important;
      --accent-light: #c084fc !important;
      background: #0d0819 !important;
    }
    [data-app-theme="purple"] .mobile-frame { background: #0d0819 !important; }
    [data-app-theme="purple"] .app-header {
      background: rgba(13, 8, 25, 0.96) !important;
      border-bottom: 1.2px solid rgba(168, 85, 247, 0.22) !important;
    }
    [data-app-theme="purple"] .app-bottom-nav {
      background: rgba(13, 8, 25, 0.96) !important;
      border-top: 1.2px solid rgba(168, 85, 247, 0.22) !important;
    }
    [data-app-theme="purple"] .kpi-master-wealth-cockpit,
    [data-app-theme="purple"] .executive-cockpit-card,
    [data-app-theme="purple"] .ops-tx-card-clean,
    [data-app-theme="purple"] .expected-clean-card,
    [data-app-theme="purple"] .chart-glass-panel,
    [data-app-theme="purple"] .modal-content-card,
    [data-app-theme="purple"] .side-drawer-panel,
    [data-app-theme="purple"] .settings-unified-section,
    [data-app-theme="purple"] .app-card-panel {
      background: rgba(24, 15, 42, 0.85) !important;
      border: 1px solid rgba(168, 85, 247, 0.20) !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45) !important;
    }

    /* 5. السمة: عنابي ياقوتي فخم (Royal Ruby Velvet) */
    html[data-app-theme="rose"], body[data-app-theme="rose"],
    [data-app-theme="rose"] .mobile-frame,
    [data-app-theme="rose"] #appFrame,
    [data-app-theme="rose"] .app-scroll-body,
    [data-app-theme="rose"] .page-view {
      --bg-app: #15060e !important;
      --bg-card: rgba(34, 11, 22, 0.85) !important;
      --bg-card-sub: rgba(52, 16, 34, 0.90) !important;
      --border: rgba(244, 63, 94, 0.20) !important;
      --accent: #f43f5e !important;
      --accent-light: #fb7185 !important;
      background: #15060e !important;
    }
    [data-app-theme="rose"] .mobile-frame { background: #15060e !important; }
    [data-app-theme="rose"] .app-header {
      background: rgba(21, 6, 14, 0.96) !important;
      border-bottom: 1.2px solid rgba(244, 63, 94, 0.22) !important;
    }
    [data-app-theme="rose"] .app-bottom-nav {
      background: rgba(21, 6, 14, 0.96) !important;
      border-top: 1.2px solid rgba(244, 63, 94, 0.22) !important;
    }
    [data-app-theme="rose"] .kpi-master-wealth-cockpit,
    [data-app-theme="rose"] .executive-cockpit-card,
    [data-app-theme="rose"] .ops-tx-card-clean,
    [data-app-theme="rose"] .expected-clean-card,
    [data-app-theme="rose"] .chart-glass-panel,
    [data-app-theme="rose"] .modal-content-card,
    [data-app-theme="rose"] .side-drawer-panel,
    [data-app-theme="rose"] .settings-unified-section,
    [data-app-theme="rose"] .app-card-panel {
      background: rgba(34, 11, 22, 0.85) !important;
      border: 1px solid rgba(244, 63, 94, 0.20) !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45) !important;
    }

    /* 6. السمة: سماوي فيروزي بحري (Nordic Glacier Ocean) */
    html[data-app-theme="ocean"], body[data-app-theme="ocean"],
    [data-app-theme="ocean"] .mobile-frame,
    [data-app-theme="ocean"] #appFrame,
    [data-app-theme="ocean"] .app-scroll-body,
    [data-app-theme="ocean"] .page-view {
      --bg-app: #05131e !important;
      --bg-card: rgba(8, 28, 44, 0.85) !important;
      --bg-card-sub: rgba(12, 44, 68, 0.90) !important;
      --border: rgba(6, 182, 212, 0.20) !important;
      --accent: #06b6d4 !important;
      --accent-light: #67e8f9 !important;
      background: #05131e !important;
    }
    [data-app-theme="ocean"] .mobile-frame { background: #05131e !important; }
    [data-app-theme="ocean"] .app-header {
      background: rgba(5, 19, 30, 0.96) !important;
      border-bottom: 1.2px solid rgba(6, 182, 212, 0.22) !important;
    }
    [data-app-theme="ocean"] .app-bottom-nav {
      background: rgba(5, 19, 30, 0.96) !important;
      border-top: 1.2px solid rgba(6, 182, 212, 0.22) !important;
    }
    [data-app-theme="ocean"] .kpi-master-wealth-cockpit,
    [data-app-theme="ocean"] .executive-cockpit-card,
    [data-app-theme="ocean"] .ops-tx-card-clean,
    [data-app-theme="ocean"] .expected-clean-card,
    [data-app-theme="ocean"] .chart-glass-panel,
    [data-app-theme="ocean"] .modal-content-card,
    [data-app-theme="ocean"] .side-drawer-panel,
    [data-app-theme="ocean"] .settings-unified-section,
    [data-app-theme="ocean"] .app-card-panel {
      background: rgba(8, 28, 44, 0.85) !important;
      border: 1px solid rgba(6, 182, 212, 0.20) !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45) !important;
    }

    /* 7. السمة: موكا وبرونزي دافئ (Warm Bronze Mocha & Coffee) */
    html[data-app-theme="gold"], body[data-app-theme="gold"],
    [data-app-theme="gold"] .mobile-frame,
    [data-app-theme="gold"] #appFrame,
    [data-app-theme="gold"] .app-scroll-body,
    [data-app-theme="gold"] .page-view {
      --bg-app: #120d09 !important;
      --bg-card: rgba(32, 22, 15, 0.85) !important;
      --bg-card-sub: rgba(48, 34, 23, 0.90) !important;
      --border: rgba(245, 158, 11, 0.20) !important;
      --accent: #f59e0b !important;
      --accent-light: #fcd34d !important;
      background: #120d09 !important;
    }
    [data-app-theme="gold"] .mobile-frame { background: #120d09 !important; }
    [data-app-theme="gold"] .app-header {
      background: rgba(18, 13, 9, 0.96) !important;
      border-bottom: 1.2px solid rgba(245, 158, 11, 0.22) !important;
    }
    [data-app-theme="gold"] .app-bottom-nav {
      background: rgba(18, 13, 9, 0.96) !important;
      border-top: 1.2px solid rgba(245, 158, 11, 0.22) !important;
    }
    [data-app-theme="gold"] .kpi-master-wealth-cockpit,
    [data-app-theme="gold"] .executive-cockpit-card,
    [data-app-theme="gold"] .ops-tx-card-clean,
    [data-app-theme="gold"] .expected-clean-card,
    [data-app-theme="gold"] .chart-glass-panel,
    [data-app-theme="gold"] .modal-content-card,
    [data-app-theme="gold"] .side-drawer-panel,
    [data-app-theme="gold"] .settings-unified-section,
    [data-app-theme="gold"] .app-card-panel {
      background: rgba(32, 22, 15, 0.85) !important;
      border: 1px solid rgba(245, 158, 11, 0.20) !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45) !important;
    }

    /* 8. السمة: تيتانيوم رمادي معماري رصين (Matte Titanium Graphite) */
    html[data-app-theme="slate"], body[data-app-theme="slate"],
    [data-app-theme="slate"] .mobile-frame,
    [data-app-theme="slate"] #appFrame,
    [data-app-theme="slate"] .app-scroll-body,
    [data-app-theme="slate"] .page-view {
      --bg-app: #0d1017 !important;
      --bg-card: rgba(20, 24, 33, 0.85) !important;
      --bg-card-sub: rgba(30, 36, 48, 0.90) !important;
      --border: rgba(148, 163, 184, 0.18) !important;
      --accent: #94a3b8 !important;
      --accent-light: #e2e8f0 !important;
      background: #0d1017 !important;
    }
    [data-app-theme="slate"] .mobile-frame { background: #0d1017 !important; }
    [data-app-theme="slate"] .app-header {
      background: rgba(13, 16, 23, 0.96) !important;
      border-bottom: 1.2px solid rgba(148, 163, 184, 0.22) !important;
    }
    [data-app-theme="slate"] .app-bottom-nav {
      background: rgba(13, 16, 23, 0.96) !important;
      border-top: 1.2px solid rgba(148, 163, 184, 0.22) !important;
    }
    [data-app-theme="slate"] .kpi-master-wealth-cockpit,
    [data-app-theme="slate"] .executive-cockpit-card,
    [data-app-theme="slate"] .ops-tx-card-clean,
    [data-app-theme="slate"] .expected-clean-card,
    [data-app-theme="slate"] .chart-glass-panel,
    [data-app-theme="slate"] .modal-content-card,
    [data-app-theme="slate"] .side-drawer-panel,
    [data-app-theme="slate"] .settings-unified-section,
    [data-app-theme="slate"] .app-card-panel {
      background: rgba(20, 24, 33, 0.85) !important;
      border: 1px solid rgba(148, 163, 184, 0.18) !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45) !important;
    }

    /* 9. السمة: النهار الأبيض اللؤلؤي (Royal Pearl Light) */
    html[data-app-theme="light"], body[data-app-theme="light"],
    [data-app-theme="light"] .mobile-frame,
    [data-app-theme="light"] #appFrame,
    [data-app-theme="light"] .app-scroll-body,
    [data-app-theme="light"] .page-view {
      --bg-app: #f8fafc !important;
      --bg-card: #ffffff !important;
      --bg-card-sub: #f1f5f9 !important;
      --border: #e2e8f0 !important;
      --accent: #0284c7 !important;
      --accent-light: #0369a1 !important;
      background: #f8fafc !important;
      color: #0f172a !important;
    }
    [data-app-theme="light"] .mobile-frame { background: #f8fafc !important; }
    [data-app-theme="light"] .app-header {
      background: rgba(255, 255, 255, 0.98) !important;
      border-bottom: 1.2px solid #e2e8f0 !important;
      color: #0f172a !important;
    }
    [data-app-theme="light"] .app-bottom-nav {
      background: rgba(255, 255, 255, 0.98) !important;
      border-top: 1.2px solid #e2e8f0 !important;
    }
    [data-app-theme="light"] .kpi-master-wealth-cockpit,
    [data-app-theme="light"] .executive-cockpit-card,
    [data-app-theme="light"] .ops-tx-card-clean,
    [data-app-theme="light"] .expected-clean-card,
    [data-app-theme="light"] .chart-glass-panel,
    [data-app-theme="light"] .modal-content-card,
    [data-app-theme="light"] .side-drawer-panel,
    [data-app-theme="light"] .settings-unified-section,
    [data-app-theme="light"] .app-card-panel {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06) !important;
      color: #0f172a !important;
    }
    [data-app-theme="light"] .brand-title,
    [data-app-theme="light"] .card-title,
    [data-app-theme="light"] .section-title-lux {
      color: #0f172a !important;
    }

    /* منظومة أيقونات متناسقة راقية */
    [data-icon-theme="silver"] .nav-tab-item.active i,
    [data-icon-theme="silver"] .nav-tab-item.active .nav-tab-svg {
      color: #cbd5e1 !important;
      filter: drop-shadow(0 0 6px rgba(203, 213, 225, 0.5)) !important;
    }
'''

if s_theme != -1 and e_theme != -1:
    html = html[:s_theme] + new_themes_css + html[e_theme:]
    print("✓ Successfully replaced theme CSS block")
else:
    print("! Could not find theme CSS block range")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved theme CSS changes.")
