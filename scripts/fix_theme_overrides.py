import sys

filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove .cat-card from theme override selectors in lines 6580-6920
themes = ["navy", "black", "emerald", "purple", "rose", "ocean", "gold", "slate", "light"]
for th in themes:
    target_str = f'[data-app-theme="{th}"] .cat-card,\n'
    if target_str in content:
        content = content.replace(target_str, '')
        print(f'Removed [data-app-theme="{th}"] .cat-card,')

# 2. Remove .cat-card from lines 11580-11645
for th in themes:
    t1 = f'    html[data-app-theme="{th}"] body .cat-card,\n'
    t2 = f'    [data-app-theme="{th}"] .cat-card,\n'
    if t1 in content:
        content = content.replace(t1, '')
        print(f'Removed html[data-app-theme="{th}"] body .cat-card')
    if t2 in content:
        content = content.replace(t2, '')
        print(f'Removed [data-app-theme="{th}"] .cat-card')

# 3. Remove body.light-theme .cat-card from line 11639
t_light = '    body.light-theme .cat-card,\n'
if t_light in content:
    content = content.replace(t_light, '')
    print('Removed body.light-theme .cat-card')

# 4. Add high contrast rules for .ops-tx-card-lux and light theme
contrast_css = '''
    /* =========================================================================
       قواعد التباين العالي المحاسبي لكافة التسجيلات والكتابات (High Contrast Rules)
       ========================================================================= */
    .ops-tx-card-lux {
      background: linear-gradient(135deg, rgba(20, 30, 48, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%) !important;
      border: 1.2px solid rgba(255, 255, 255, 0.12) !important;
      border-radius: 14px !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.40) !important;
      contain: content !important;
      touch-action: manipulation !important;
    }
    .ops-tx-label-text {
      color: #ffffff !important;
      font-weight: 850 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6) !important;
    }
    .ops-date-title {
      color: #f8fafc !important;
      font-weight: 800 !important;
    }
    .ops-date-group-header {
      background: rgba(15, 23, 42, 0.90) !important;
      border: 1px solid rgba(255, 255, 255, 0.10) !important;
      border-radius: 10px !important;
      padding: 6px 12px !important;
      margin: 10px 0 6px !important;
    }

    body.light-theme .ops-tx-card-lux {
      background: #ffffff !important;
      border: 1.5px solid #cbd5e1 !important;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08) !important;
    }
    body.light-theme .ops-tx-label-text {
      color: #0f172a !important;
      font-weight: 850 !important;
      text-shadow: none !important;
    }
    body.light-theme .ops-date-title {
      color: #0f172a !important;
      font-weight: 850 !important;
    }
    body.light-theme .ops-date-group-header {
      background: #f1f5f9 !important;
      border: 1.2px solid #cbd5e1 !important;
    }
    body.light-theme .ops-tx-chip {
      border-width: 1.2px !important;
      font-weight: 800 !important;
    }
    body.light-theme .empty-title {
      color: #0f172a !important;
    }
'''

content = content.replace('</head>', contrast_css + '\n</head>', 1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated theme overrides and applied contrast CSS successfully!')
