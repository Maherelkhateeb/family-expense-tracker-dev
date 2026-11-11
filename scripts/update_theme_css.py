import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_theme_css_block = """    .theme-pill-option.active {
      border: 2.2px solid #38bdf8 !important;
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.65), inset 0 0 8px rgba(56, 189, 248, 0.22) !important;
      transform: translateY(-2px) scale(1.03) !important;
      background: rgba(56, 189, 248, 0.18) !important;
    }
    body.light-theme .theme-pill-option.active {
      border: 2.2px solid #0284c7 !important;
      box-shadow: 0 0 14px rgba(2, 132, 199, 0.45), inset 0 0 8px rgba(2, 132, 199, 0.15) !important;
      background: rgba(2, 132, 199, 0.12) !important;
    }
    .theme-pill-option .theme-color-dot {
      width: 20px !important;
      height: 20px !important;
      min-width: 20px !important;
      min-height: 20px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 0.65rem !important;
      font-weight: 900 !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      box-sizing: border-box !important;
      margin-bottom: 2px !important;
    }
    .theme-pill-option.active .theme-color-dot {
      background: #38bdf8 !important;
      border: 2px solid #ffffff !important;
      box-shadow: 0 0 10px #38bdf8 !important;
      color: #04101e !important;
    }
    body.light-theme .theme-pill-option.active .theme-color-dot {
      background: #0284c7 !important;
      border: 2px solid #ffffff !important;
      color: #ffffff !important;
    }
    .theme-pill-option .theme-selected-badge {
      display: none;
      font-size: 0.55rem;
      font-weight: 900;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.22);
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 1px 6px;
      border-radius: 6px;
      line-height: 1.2;
      margin-top: 2px;
      box-shadow: 0 2px 6px rgba(56, 189, 248, 0.25);
    }
    .theme-pill-option.active .theme-selected-badge {
      display: inline-block !important;
    }

    /* كروت نافذة خلفيات التطبيق الموسعة */
    .theme-card-box {
      position: relative !important;
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .theme-card-box.active {
      border: 2.2px solid #38bdf8 !important;
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.55), inset 0 0 8px rgba(56, 189, 248, 0.15) !important;
      transform: translateY(-2px) scale(1.02) !important;
    }
    .theme-card-box.active .theme-check-dot {
      background: #38bdf8 !important;
      border: 2px solid #ffffff !important;
    }"""

new_theme_css_block = """    .theme-pill-option.active {
      transform: translateY(-2px) scale(1.04) !important;
      outline: 2px solid rgba(255, 255, 255, 0.35) !important;
    }
    .theme-pill-option .theme-color-dot {
      width: 22px !important;
      height: 22px !important;
      min-width: 22px !important;
      min-height: 22px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 0.72rem !important;
      font-weight: 900 !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      box-sizing: border-box !important;
      margin-bottom: 3px !important;
    }
    .theme-pill-option .theme-selected-badge {
      display: none;
      font-size: 0.60rem;
      font-weight: 900;
      padding: 2px 7px;
      border-radius: 6px;
      line-height: 1.2;
      margin-top: 3px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    }
    .theme-pill-option.active .theme-selected-badge {
      display: inline-block !important;
    }

    /* كروت نافذة خلفيات التطبيق الموسعة */
    .theme-card-box {
      position: relative !important;
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .theme-card-box.active {
      transform: translateY(-2px) scale(1.03) !important;
      outline: 2px solid rgba(255, 255, 255, 0.35) !important;
    }"""

if old_theme_css_block in content:
    content = content.replace(old_theme_css_block, new_theme_css_block)
    print("Cleaned up theme-pill CSS block successfully.")
else:
    print("Warning: old_theme_css_block not found verbatim, checking diff...")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved theme CSS updates.")
