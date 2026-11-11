# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

THEMES_CONFIG = {
    'navy': {
        'title': 'كحلي ملكي أزرق (Royal Navy Sapphire)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #1e3a8a 0%, #0f172a 45%, #070e1c 100%)',
        'bg_card': 'rgba(18, 29, 51, 0.78)',
        'bg_card_sub': 'rgba(28, 44, 76, 0.85)',
        'border': 'rgba(56, 189, 248, 0.25)',
        'accent': '#38bdf8',
        'accent_light': '#7dd3fc',
        'header_nav_bg': 'rgba(11, 20, 38, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(30, 58, 138, 0.55), rgba(15, 23, 42, 0.90))'
    },
    'black': {
        'title': 'أسود فاحم (OLED Deep Obsidian)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #27272a 0%, #18181b 50%, #000000 100%)',
        'bg_card': 'rgba(24, 24, 27, 0.78)',
        'bg_card_sub': 'rgba(39, 39, 42, 0.85)',
        'border': 'rgba(255, 255, 255, 0.16)',
        'accent': '#e2e8f0',
        'accent_light': '#ffffff',
        'header_nav_bg': 'rgba(9, 9, 11, 0.90)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(39, 39, 42, 0.60), rgba(9, 9, 11, 0.95))'
    },
    'emerald': {
        'title': 'زمردي أخضر فاخر (Imperial Emerald Luxury)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #065f46 0%, #064e3b 35%, #022c22 75%, #011a14 100%)',
        'bg_card': 'rgba(6, 78, 59, 0.55)',
        'bg_card_sub': 'rgba(6, 95, 70, 0.65)',
        'border': 'rgba(52, 211, 153, 0.35)',
        'accent': '#34d399',
        'accent_light': '#6ee7b7',
        'header_nav_bg': 'rgba(2, 44, 34, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(6, 95, 70, 0.65), rgba(2, 44, 34, 0.92))'
    },
    'purple': {
        'title': 'بنفسجي ملكي (Royal Purple Velvet)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #581c87 0%, #3b0764 35%, #1e1b4b 75%, #120b2e 100%)',
        'bg_card': 'rgba(59, 7, 100, 0.55)',
        'bg_card_sub': 'rgba(88, 28, 135, 0.65)',
        'border': 'rgba(192, 132, 252, 0.35)',
        'accent': '#c084fc',
        'accent_light': '#e9d5ff',
        'header_nav_bg': 'rgba(30, 27, 75, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(88, 28, 135, 0.65), rgba(30, 27, 75, 0.92))'
    },
    'rose': {
        'title': 'عنابي ياقوتي (Royal Ruby Rose)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #881337 0%, #4c0519 35%, #2d0b1d 75%, #18050f 100%)',
        'bg_card': 'rgba(76, 5, 25, 0.55)',
        'bg_card_sub': 'rgba(136, 19, 55, 0.65)',
        'border': 'rgba(251, 113, 133, 0.35)',
        'accent': '#fb7185',
        'accent_light': '#fecdd3',
        'header_nav_bg': 'rgba(45, 11, 29, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(136, 19, 55, 0.65), rgba(45, 11, 29, 0.92))'
    },
    'ocean': {
        'title': 'سماوي فيروزي (Ocean Cyan Breeze)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #0e7490 0%, #155e75 30%, #083344 65%, #021e28 100%)',
        'bg_card': 'rgba(14, 116, 144, 0.45)',
        'bg_card_sub': 'rgba(21, 94, 117, 0.60)',
        'border': 'rgba(34, 211, 238, 0.35)',
        'accent': '#22d3ee',
        'accent_light': '#67e8f9',
        'header_nav_bg': 'rgba(8, 51, 68, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(14, 116, 144, 0.65), rgba(8, 51, 68, 0.92))'
    },
    'gold': {
        'title': 'موكا وبرونزي (Warm Golden Bronze)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #78350f 0%, #451a03 35%, #261102 75%, #180901 100%)',
        'bg_card': 'rgba(69, 26, 3, 0.55)',
        'bg_card_sub': 'rgba(120, 53, 15, 0.65)',
        'border': 'rgba(251, 191, 36, 0.35)',
        'accent': '#fbbf24',
        'accent_light': '#fde68a',
        'header_nav_bg': 'rgba(38, 17, 2, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(120, 53, 15, 0.65), rgba(38, 17, 2, 0.92))'
    },
    'slate': {
        'title': 'تيتانيوم رمادي (Titanium Slate Steel)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #334155 0%, #1e293b 40%, #0f172a 80%, #080d17 100%)',
        'bg_card': 'rgba(30, 41, 59, 0.65)',
        'bg_card_sub': 'rgba(51, 65, 85, 0.70)',
        'border': 'rgba(148, 163, 184, 0.30)',
        'accent': '#94a3b8',
        'accent_light': '#cbd5e1',
        'header_nav_bg': 'rgba(15, 23, 42, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(51, 65, 85, 0.60), rgba(15, 23, 42, 0.92))'
    },
    'light': {
        'title': 'أبيض نهار (Daylight Pure Crystal)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #e2e8f0 0%, #f1f5f9 40%, #ffffff 100%)',
        'bg_card': '#ffffff',
        'bg_card_sub': '#f8fafc',
        'border': 'rgba(203, 213, 225, 0.90)',
        'accent': '#0284c7',
        'accent_light': '#38bdf8',
        'header_nav_bg': 'rgba(255, 255, 255, 0.96)',
        'cockpit_grad': '#ffffff'
    },
    'crimson': {
        'title': 'قرمزي روبي (Crimson Velvet)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #9f1239 0%, #831843 35%, #4c0519 75%, #24030d 100%)',
        'bg_card': 'rgba(131, 24, 67, 0.55)',
        'bg_card_sub': 'rgba(159, 18, 57, 0.65)',
        'border': 'rgba(244, 63, 94, 0.35)',
        'accent': '#f43f5e',
        'accent_light': '#fda4af',
        'header_nav_bg': 'rgba(45, 11, 29, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(159, 18, 57, 0.65), rgba(45, 11, 29, 0.92))'
    },
    'amber': {
        'title': 'عنبر ملكي (Fiery Amber Royal)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #c2410c 0%, #9a3412 35%, #431407 75%, #220903 100%)',
        'bg_card': 'rgba(154, 52, 18, 0.55)',
        'bg_card_sub': 'rgba(194, 65, 12, 0.65)',
        'border': 'rgba(217, 119, 6, 0.35)',
        'accent': '#d97706',
        'accent_light': '#fbbf24',
        'header_nav_bg': 'rgba(67, 20, 7, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(194, 65, 12, 0.65), rgba(67, 20, 7, 0.92))'
    },
    'midnight': {
        'title': 'أزرق ليلي عميق (Cosmic Midnight Indigo)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #3730a3 0%, #1e1b4b 40%, #0f0c2e 80%, #070518 100%)',
        'bg_card': 'rgba(30, 27, 75, 0.60)',
        'bg_card_sub': 'rgba(55, 48, 163, 0.65)',
        'border': 'rgba(99, 102, 241, 0.35)',
        'accent': '#6366f1',
        'accent_light': '#a5b4fc',
        'header_nav_bg': 'rgba(15, 12, 46, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(55, 48, 163, 0.65), rgba(15, 12, 46, 0.92))'
    },
    'forest': {
        'title': 'غابة خضراء (Deep Forest Emerald)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #047857 0%, #064e3b 40%, #022c22 80%, #011a13 100%)',
        'bg_card': 'rgba(6, 78, 59, 0.60)',
        'bg_card_sub': 'rgba(4, 120, 87, 0.65)',
        'border': 'rgba(5, 150, 105, 0.35)',
        'accent': '#059669',
        'accent_light': '#34d399',
        'header_nav_bg': 'rgba(2, 44, 34, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(4, 120, 87, 0.65), rgba(2, 44, 34, 0.92))'
    },
    'carbon': {
        'title': 'كربون داكن (Stealth Carbon Charcoal)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #3f3f46 0%, #27272a 45%, #18181b 80%, #09090b 100%)',
        'bg_card': 'rgba(39, 39, 42, 0.60)',
        'bg_card_sub': 'rgba(63, 63, 70, 0.65)',
        'border': 'rgba(234, 88, 12, 0.35)',
        'accent': '#ea580c',
        'accent_light': '#fb923c',
        'header_nav_bg': 'rgba(24, 24, 27, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(63, 63, 70, 0.65), rgba(24, 24, 27, 0.92))'
    },
    'sapphire': {
        'title': 'ياقوت أزرق فاخر (Pure Sapphire Electric Blue)',
        'body_grad': 'radial-gradient(circle at 50% 0%, #2563eb 0%, #1d4ed8 35%, #172554 75%, #0a142e 100%)',
        'bg_card': 'rgba(29, 78, 216, 0.50)',
        'bg_card_sub': 'rgba(37, 99, 235, 0.65)',
        'border': 'rgba(37, 99, 235, 0.35)',
        'accent': '#2563eb',
        'accent_light': '#60a5fa',
        'header_nav_bg': 'rgba(23, 37, 84, 0.88)',
        'cockpit_grad': 'linear-gradient(145deg, rgba(37, 99, 235, 0.65), rgba(23, 37, 84, 0.92))'
    }
}

def generate_css():
    chunks = []
    chunks.append("    /* =========================================================================\n       نظام السمات والخلفيات الـ 15 المتجاوب الشفاف فائق التميز (15 Radiant Themes Engine)\n       ========================================================================= */\n")
    
    # Global rule ensuring frames and page views stay transparent so the gradient shines through:
    chunks.append("""    /* إلغاء حجب الخلفيات نهائياً: الإطار وصفحات العرض وقسم التمرير شفافة تماماً لإبراز التدرج اللوني */
    .mobile-frame, #appFrame, .page-view, .app-scroll-body, #catGrid {
      background: transparent !important;
      background-color: transparent !important;
    }
""")
    
    for t_key, cfg in THEMES_CONFIG.items():
        chunk = f"""    /* {cfg['title']} */
    html[data-app-theme="{t_key}"], body[data-app-theme="{t_key}"] {{
      background: {cfg['body_grad']} !important;
      background-attachment: fixed !important;
      --bg-app: transparent !important;
      --bg-card: {cfg['bg_card']} !important;
      --bg-card-sub: {cfg['bg_card_sub']} !important;
      --border: {cfg['border']} !important;
      --accent: {cfg['accent']} !important;
      --accent-light: {cfg['accent_light']} !important;
      --body-bg: {cfg['body_grad']} !important;
    }}
    [data-app-theme="{t_key}"] .mobile-frame,
    [data-app-theme="{t_key}"] #appFrame,
    [data-app-theme="{t_key}"] .page-view,
    [data-app-theme="{t_key}"] .app-scroll-body {{
      background: transparent !important;
      background-color: transparent !important;
    }}
    [data-app-theme="{t_key}"] .app-header {{
      background: {cfg['header_nav_bg']} !important;
      border-bottom: 1.2px solid {cfg['border']} !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
    }}
    [data-app-theme="{t_key}"] .app-bottom-nav {{
      background: {cfg['header_nav_bg']} !important;
      border-top: 1.2px solid {cfg['border']} !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
    }}
    [data-app-theme="{t_key}"] .kpi-master-wealth-cockpit,
    [data-app-theme="{t_key}"] .executive-cockpit-card {{
      background: {cfg['cockpit_grad']} !important;
      border: 1.5px solid {cfg['border']} !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), 0 0 16px {cfg['accent']}22 !important;
    }}
    [data-app-theme="{t_key}"] .modal-content-card,
    [data-app-theme="{t_key}"] .ops-tx-card-clean,
    [data-app-theme="{t_key}"] .expected-clean-card,
    [data-app-theme="{t_key}"] .chart-glass-panel,
    [data-app-theme="{t_key}"] .side-drawer-panel,
    [data-app-theme="{t_key}"] .settings-unified-section,
    [data-app-theme="{t_key}"] .app-card-panel {{
      background: {cfg['bg_card']} !important;
      border: 1.2px solid {cfg['border']} !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45) !important;
    }}
"""
        chunks.append(chunk)
    
    return "\n".join(chunks)

def apply():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    start_marker = "/* 1. "
    pos_start = content.find(start_marker, 180000)
    if pos_start == -1:
        print("Error: start marker not found around 180000")
        return

    # Find where the 15th theme ends
    pos_15 = content.find('15. ', pos_start)
    pos_end = content.find('}', content.find('.app-card-panel {', pos_15)) + 1

    print(f"Replacing CSS from pos {pos_start} to {pos_end} (length: {pos_end - pos_start} chars)")
    
    new_css = generate_css()
    updated_content = content[:pos_start] + new_css + content[pos_end:]

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print("Successfully replaced all 15 themes with transparent-frame rich gradients!")

if __name__ == '__main__':
    apply()
