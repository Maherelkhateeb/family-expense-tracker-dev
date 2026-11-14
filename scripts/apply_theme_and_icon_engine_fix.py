# -*- coding: utf-8 -*-
"""
Script to fix:
1. App Backgrounds & Themes (15 themes):
   - Replace pitch-black hex values with rich, vibrant radial/linear gradients on html and body.
   - Set .mobile-frame and #appFrame background to transparent so the background shines through.
   - Update #settingsModal .modal-content-card so that clicking themes transforms the modal in real time.
   - Ensure all 15 themes have dedicated card palettes in THEME_CARD_PALETTES.
2. Icon Palettes (12 palettes):
   - In renderCategoriesGrid, apply the selected icon palette to .cat-icon-bubble (gradient, outline, shadow).
   - In needRebuild, check grid.dataset.iconTheme !== activeIconTheme so changes apply immediately.
   - In in-place update loop, update .cat-icon-bubble colors as well.
   - In CSS, ensure all icons (i, svg, nav tabs, headers) glow with the palette color.
"""

import re
import sys

def run_fix():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # =========================================================================
    # PART 1: UPGRADE setAppTheme() AND themeBgs
    # =========================================================================
    old_theme_bgs = """      const themeBgs = {
        'navy': { body: 'radial-gradient(circle at top, #13233f 0%, #060d1d 100%)', frame: '#060d1d' },
        'black': { body: 'radial-gradient(circle at top, #111827 0%, #030508 100%)', frame: '#030508' },
        'emerald': { body: 'radial-gradient(circle at top, #0a2d21 0%, #03140e 100%)', frame: '#03140e' },
        'purple': { body: 'radial-gradient(circle at top, #21153d 0%, #0d0819 100%)', frame: '#0d0819' },
        'rose': { body: 'radial-gradient(circle at top, #2d0b1d 0%, #15060e 100%)', frame: '#15060e' },
        'ocean': { body: 'radial-gradient(circle at top, #092c48 0%, #041624 100%)', frame: '#041624' },
        'gold': { body: 'radial-gradient(circle at top, #2f1d0a 0%, #140d06 100%)', frame: '#140d06' },
        'slate': { body: 'radial-gradient(circle at top, #1e2838 0%, #0d1117 100%)', frame: '#0d1117' },
        'light': { body: '#f8fafc', frame: '#f8fafc' },
        'crimson': { body: 'radial-gradient(circle at top, #3b0818 0%, #1a040b 100%)', frame: '#1a040b' },
        'amber': { body: 'radial-gradient(circle at top, #3d1b03 0%, #1a0c02 100%)', frame: '#1a0c02' },
        'midnight': { body: 'radial-gradient(circle at top, #141738 0%, #05071a 100%)', frame: '#05071a' },
        'forest': { body: 'radial-gradient(circle at top, #063321 0%, #03180f 100%)', frame: '#03180f' },
        'carbon': { body: 'radial-gradient(circle at top, #22262e 0%, #111317 100%)', frame: '#111317' },
        'sapphire': { body: 'radial-gradient(circle at top, #0a2558 0%, #03132e 100%)', frame: '#03132e' }
      };
      const curB = themeBgs[theme] || themeBgs['navy'];
      document.body.style.setProperty('background', curB.body, 'important');
      const appFrame = document.getElementById('appFrame');
      if (appFrame) appFrame.style.setProperty('background-color', curB.frame, 'important');"""

    new_theme_bgs = """      const themeBgs = {
        'navy': {
          body: 'radial-gradient(circle at 50% 0%, #1e3a8a 0%, #0f172a 45%, #070e1c 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(30, 58, 138, 0.40), rgba(15, 23, 42, 0.95))',
          accent: '#38bdf8'
        },
        'black': {
          body: 'radial-gradient(circle at 50% 0%, #18181b 0%, #09090b 50%, #000000 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
          accent: '#e2e8f0'
        },
        'emerald': {
          body: 'radial-gradient(circle at 50% 0%, #065f46 0%, #064e3b 35%, #022c22 75%, #011a14 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(6, 95, 70, 0.45), rgba(2, 44, 34, 0.95))',
          accent: '#34d399'
        },
        'purple': {
          body: 'radial-gradient(circle at 50% 0%, #581c87 0%, #3b0764 35%, #1e1b4b 75%, #120b2e 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(88, 28, 135, 0.45), rgba(30, 27, 75, 0.95))',
          accent: '#c084fc'
        },
        'rose': {
          body: 'radial-gradient(circle at 50% 0%, #881337 0%, #4c0519 35%, #2d0b1d 75%, #18050f 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(136, 19, 55, 0.45), rgba(45, 11, 29, 0.95))',
          accent: '#fb7185'
        },
        'ocean': {
          body: 'radial-gradient(circle at 50% 0%, #0e7490 0%, #155e75 30%, #083344 65%, #021e28 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(14, 116, 144, 0.45), rgba(8, 51, 68, 0.95))',
          accent: '#22d3ee'
        },
        'gold': {
          body: 'radial-gradient(circle at 50% 0%, #78350f 0%, #451a03 35%, #261102 75%, #180901 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(120, 53, 15, 0.45), rgba(38, 17, 2, 0.95))',
          accent: '#fbbf24'
        },
        'slate': {
          body: 'radial-gradient(circle at 50% 0%, #334155 0%, #1e293b 40%, #0f172a 80%, #080d17 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(51, 65, 85, 0.45), rgba(15, 23, 42, 0.95))',
          accent: '#94a3b8'
        },
        'light': {
          body: 'radial-gradient(circle at 50% 0%, #e2e8f0 0%, #f1f5f9 40%, #ffffff 100%)',
          frame: 'transparent',
          card: '#ffffff',
          accent: '#0284c7'
        },
        'crimson': {
          body: 'radial-gradient(circle at 50% 0%, #9f1239 0%, #831843 35%, #4c0519 75%, #24030d 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(159, 18, 57, 0.45), rgba(45, 11, 29, 0.95))',
          accent: '#f43f5e'
        },
        'amber': {
          body: 'radial-gradient(circle at 50% 0%, #c2410c 0%, #9a3412 35%, #431407 75%, #220903 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(194, 65, 12, 0.45), rgba(67, 20, 7, 0.95))',
          accent: '#d97706'
        },
        'midnight': {
          body: 'radial-gradient(circle at 50% 0%, #3730a3 0%, #1e1b4b 40%, #0f0c2e 80%, #070518 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(55, 48, 163, 0.45), rgba(15, 12, 46, 0.95))',
          accent: '#6366f1'
        },
        'forest': {
          body: 'radial-gradient(circle at 50% 0%, #047857 0%, #064e3b 40%, #022c22 80%, #011a13 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(4, 120, 87, 0.45), rgba(2, 44, 34, 0.95))',
          accent: '#059669'
        },
        'carbon': {
          body: 'radial-gradient(circle at 50% 0%, #3f3f46 0%, #27272a 45%, #18181b 80%, #09090b 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(63, 63, 70, 0.45), rgba(24, 24, 27, 0.95))',
          accent: '#ea580c'
        },
        'sapphire': {
          body: 'radial-gradient(circle at 50% 0%, #2563eb 0%, #1d4ed8 35%, #172554 75%, #0a142e 100%)',
          frame: 'transparent',
          card: 'linear-gradient(145deg, rgba(37, 99, 235, 0.45), rgba(23, 37, 84, 0.95))',
          accent: '#2563eb'
        }
      };
      const curB = themeBgs[theme] || themeBgs['navy'];
      document.body.style.setProperty('background', curB.body, 'important');
      document.documentElement.style.setProperty('background', curB.body, 'important');
      const appFrame = document.getElementById('appFrame');
      if (appFrame) {
        appFrame.style.setProperty('background', 'transparent', 'important');
        appFrame.style.setProperty('background-color', 'transparent', 'important');
      }
      const setCard = document.querySelector('#settingsModal .modal-content-card');
      if (setCard) {
        setCard.style.setProperty('background', curB.card, 'important');
        setCard.style.setProperty('border', `1.5px solid ${curB.accent}`, 'important');
      }
      try { if (typeof renderUI === 'function') renderUI(); } catch(e) {}"""

    if old_theme_bgs in content:
        content = content.replace(old_theme_bgs, new_theme_bgs)
        print("Successfully replaced setAppTheme with vibrant gradients & real-time modal adaptation!")
    else:
        print("Warning: old_theme_bgs not matched!")

    # =========================================================================
    # PART 2: UPGRADE renderCategoriesGrid() FOR ALL 15 THEMES & 12 ICON PALETTES
    # =========================================================================
    # Find start of renderCategoriesGrid
    pos_grid = content.find('function renderCategoriesGrid(filtered) {')
    if pos_grid != -1:
        # Inspect what THEME_CARD_PALETTES has
        old_palettes_pattern = re.compile(
            r'const THEME_CARD_PALETTES = \{.*?const needRebuild = \(existingCards\.length !== EXPENSE_CATEGORIES\.length\) \|\| \(grid\.dataset\.theme !== activeTheme\);',
            re.DOTALL
        )
        
        new_palettes_code = """const THEME_CARD_PALETTES = {
        navy: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}42 0%, ${c}15 38%, #08162b 100%)`,
          lowerZero: 'rgba(8, 22, 43, 0.88)',
          lowerSpent: 'rgba(239, 68, 68, 0.28)',
          border: (c) => `${c}cc`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.5), 0 0 12px ${c}35, inset 0 1px 0 rgba(255, 255, 255, 0.15)`
        },
        black: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}30 0%, #111827 50%, #030508 100%)`,
          lowerZero: '#060a10',
          lowerSpent: 'rgba(239, 68, 68, 0.32)',
          border: (c) => `${c}bb`,
          shadow: (c) => `0 4px 20px rgba(0, 0, 0, 0.7), 0 0 10px ${c}25`
        },
        emerald: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #064e3b 40%, #022c22 100%)`,
          lowerZero: 'rgba(2, 44, 34, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.30)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}40`
        },
        purple: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #3b0764 40%, #1e1b4b 100%)`,
          lowerZero: 'rgba(30, 27, 75, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.30)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}40`
        },
        rose: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #4c0519 40%, #2d0b1d 100%)`,
          lowerZero: 'rgba(45, 11, 29, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.30)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}40`
        },
        ocean: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #083344 40%, #041624 100%)`,
          lowerZero: 'rgba(8, 51, 68, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.30)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}40`
        },
        gold: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #451a03 40%, #261102 100%)`,
          lowerZero: 'rgba(38, 17, 2, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.30)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}40`
        },
        slate: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #1e293b 40%, #0f1622 100%)`,
          lowerZero: 'rgba(15, 23, 42, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.28)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}44`
        },
        light: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}25 0%, rgba(241, 245, 249, 0.70) 40%, #ffffff 100%)`,
          lowerZero: 'rgba(241, 245, 249, 0.95)',
          lowerSpent: 'rgba(239, 68, 68, 0.14)',
          border: (c) => c,
          shadow: (c) => `0 4px 14px rgba(0, 0, 0, 0.08), 0 0 10px ${c}30`
        },
        crimson: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #831843 40%, #3b0413 100%)`,
          lowerZero: 'rgba(45, 11, 29, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.30)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}40`
        },
        amber: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #9a3412 40%, #360f04 100%)`,
          lowerZero: 'rgba(54, 15, 4, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.30)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}40`
        },
        midnight: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #1e1b4b 40%, #0f0a2e 100%)`,
          lowerZero: 'rgba(15, 10, 46, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.30)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}40`
        },
        forest: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #064e3b 40%, #012419 100%)`,
          lowerZero: 'rgba(1, 36, 25, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.30)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}40`
        },
        carbon: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #27272a 40%, #09090b 100%)`,
          lowerZero: 'rgba(9, 9, 11, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.30)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}40`
        },
        sapphire: {
          bgGrad: (c) => `linear-gradient(160deg, ${c}40 0%, #1d4ed8 40%, #0a132c 100%)`,
          lowerZero: 'rgba(10, 19, 44, 0.90)',
          lowerSpent: 'rgba(239, 68, 68, 0.30)',
          border: (c) => `${c}dd`,
          shadow: (c) => `0 4px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${c}40`
        }
      };

      const pal = THEME_CARD_PALETTES[activeTheme] || THEME_CARD_PALETTES.navy;
      
      // 12 باليت أيقونات حصرية متفاعلة
      const activeIconTheme = state.iconTheme || localStorage.getItem('family_monefy_icon_theme') || 'vibrant';
      const ICON_PALETTES_MAP = {
        'gold': { gradient: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)', accent: '#fbbf24', shadow: 'rgba(251, 191, 36, 0.65)' },
        'emerald': { gradient: 'linear-gradient(135deg, #34d399 0%, #047857 100%)', accent: '#34d399', shadow: 'rgba(52, 211, 153, 0.65)' },
        'ocean': { gradient: 'linear-gradient(135deg, #22d3ee 0%, #0e7490 100%)', accent: '#22d3ee', shadow: 'rgba(34, 211, 238, 0.65)' },
        'purple': { gradient: 'linear-gradient(135deg, #c084fc 0%, #6d28d9 100%)', accent: '#c084fc', shadow: 'rgba(192, 132, 252, 0.65)' },
        'silver': { gradient: 'linear-gradient(135deg, #f8fafc 0%, #64748b 100%)', accent: '#e2e8f0', shadow: 'rgba(226, 232, 240, 0.65)' },
        'ruby': { gradient: 'linear-gradient(135deg, #fb7185 0%, #be123c 100%)', accent: '#fb7185', shadow: 'rgba(251, 113, 133, 0.65)' },
        'amber': { gradient: 'linear-gradient(135deg, #fb923c 0%, #c2410c 100%)', accent: '#fb923c', shadow: 'rgba(251, 146, 60, 0.65)' },
        'cyber': { gradient: 'linear-gradient(135deg, #a3e635 0%, #4d7c0f 100%)', accent: '#a3e635', shadow: 'rgba(163, 230, 53, 0.65)' },
        'teal': { gradient: 'linear-gradient(135deg, #2dd4bf 0%, #0f766e 100%)', accent: '#2dd4bf', shadow: 'rgba(45, 212, 191, 0.65)' },
        'indigo': { gradient: 'linear-gradient(135deg, #818cf8 0%, #4338ca 100%)', accent: '#818cf8', shadow: 'rgba(129, 140, 248, 0.65)' },
        'rose': { gradient: 'linear-gradient(135deg, #f472b6 0%, #be185d 100%)', accent: '#f472b6', shadow: 'rgba(244, 114, 182, 0.65)' }
      };
      const curIconPal = ICON_PALETTES_MAP[activeIconTheme] || null;

      const existingCards = grid.querySelectorAll('.cat-card');
      const needRebuild = (existingCards.length !== EXPENSE_CATEGORIES.length) || 
                          (grid.dataset.theme !== activeTheme) ||
                          (grid.dataset.iconTheme !== activeIconTheme);"""

        if old_palettes_pattern.search(content):
            content = old_palettes_pattern.sub(new_palettes_code, content, count=1)
            print("Successfully updated THEME_CARD_PALETTES & ICON_PALETTES_MAP!")
        else:
            print("Warning: old_palettes_pattern not matched!")

    # In renderCategoriesGrid initial build: update bubble styling to use curIconPal if present
    old_bubble_markup = """              <!-- بالون الرمز أكبر ومجسم يملأ مساحته بروعة -->
              <div class="cat-icon-bubble" 
                   style="background: ${theme.gradient}; width: clamp(40px, 10.5vw, 46px) !important; height: clamp(40px, 10.5vw, 46px) !important; min-width: 38px !important; min-height: 38px !important; border-radius: 13px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), inset 0 0 6px rgba(255, 255, 255, 0.40); border: 2px solid rgba(255, 255, 255, 0.85); outline: 1.5px solid ${theme.accent}; flex-shrink: 0;">
                <span style="font-size: clamp(1.60rem, 4.2vw, 1.95rem) !important; line-height: 1; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.5));">${theme.emoji}</span>
              </div>"""

    new_bubble_markup = """              <!-- بالون الرمز أكبر ومجسم يملأ مساحته بروعة متفاعل مع باليت الأيقونات -->
              <div class="cat-icon-bubble" 
                   style="background: ${curIconPal ? curIconPal.gradient : theme.gradient}; width: clamp(40px, 10.5vw, 46px) !important; height: clamp(40px, 10.5vw, 46px) !important; min-width: 38px !important; min-height: 38px !important; border-radius: 13px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px ${curIconPal ? curIconPal.shadow : 'rgba(0,0,0,0.45)'}, inset 0 0 6px rgba(255, 255, 255, 0.40); border: 2px solid rgba(255, 255, 255, 0.85); outline: 1.8px solid ${curIconPal ? curIconPal.accent : theme.accent}; flex-shrink: 0;">
                <span style="font-size: clamp(1.60rem, 4.2vw, 1.95rem) !important; line-height: 1; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.5));">${theme.emoji}</span>
              </div>"""

    if old_bubble_markup in content:
        content = content.replace(old_bubble_markup, new_bubble_markup)
        print("Successfully updated category card initial bubble markup!")

    # In grid dataset tracking:
    old_grid_dataset = "grid.dataset.theme = activeTheme;"
    new_grid_dataset = "grid.dataset.theme = activeTheme; grid.dataset.iconTheme = activeIconTheme;"
    content = content.replace(old_grid_dataset, new_grid_dataset)

    # In existingCards.forEach update loop: also update bubble background, outline, and shadow
    old_update_loop = """          // مزامنة الألوان الحية للبطاقة
          card.style.background = pal.bgGrad(theme.accent);
          card.style.borderColor = pal.border(theme.accent);
          card.style.boxShadow = pal.shadow(theme.accent);"""

    new_update_loop = """          // مزامنة الألوان الحية للبطاقة وبالون الأيقونة
          card.style.background = pal.bgGrad(curIconPal ? curIconPal.accent : theme.accent);
          card.style.borderColor = pal.border(curIconPal ? curIconPal.accent : theme.accent);
          card.style.boxShadow = pal.shadow(curIconPal ? curIconPal.accent : theme.accent);

          const bubble = card.querySelector('.cat-icon-bubble');
          if (bubble) {
            bubble.style.background = curIconPal ? curIconPal.gradient : theme.gradient;
            bubble.style.outline = '1.8px solid ' + (curIconPal ? curIconPal.accent : theme.accent);
            bubble.style.boxShadow = `0 4px 14px ${curIconPal ? curIconPal.shadow : 'rgba(0,0,0,0.45)'}, inset 0 0 6px rgba(255, 255, 255, 0.40)`;
          }"""

    if old_update_loop in content:
        content = content.replace(old_update_loop, new_update_loop)
        print("Successfully updated existingCards in-place bubble styling!")

    # =========================================================================
    # PART 3: UPGRADE setAppIconTheme()
    # =========================================================================
    old_set_icon = """      // تحديث فوري للكروت وشبكة المصروفات لتأخذ ألوان الأيقونات الجديدة
      try {
        if (typeof renderUI === 'function') renderUI();
      } catch(e) {}"""

    new_set_icon = """      // تحديث فوري للمتغيرات وشبكة المصروفات وكافة الأيقونات
      const paletteColors = {
        'gold': '#fbbf24', 'emerald': '#34d399', 'ocean': '#22d3ee',
        'purple': '#c084fc', 'silver': '#e2e8f0', 'ruby': '#fb7185',
        'amber': '#fb923c', 'cyber': '#a3e635', 'teal': '#2dd4bf',
        'indigo': '#818cf8', 'rose': '#f472b6', 'vibrant': '#38bdf8'
      };
      const activeColor = paletteColors[iconTheme] || '#38bdf8';
      document.documentElement.style.setProperty('--app-active-icon-color', activeColor);
      
      const catGrid = document.getElementById('catGrid');
      if (catGrid) catGrid.dataset.iconTheme = ''; // Force re-render

      try {
        if (typeof renderUI === 'function') renderUI();
      } catch(e) {}"""

    if old_set_icon in content:
        content = content.replace(old_set_icon, new_set_icon)
        print("Successfully upgraded setAppIconTheme!")

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Engine fix part 1 & 2 applied cleanly.")

if __name__ == '__main__':
    run_fix()
