import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_block = [
    '    .theme-pill-option.active {\n',
    '      transform: translateY(-2px) scale(1.04) !important;\n',
    '      outline: 2px solid rgba(255, 255, 255, 0.35) !important;\n',
    '    }\n',
    '    .theme-pill-option .theme-color-dot {\n',
    '      width: 22px !important;\n',
    '      height: 22px !important;\n',
    '      min-width: 22px !important;\n',
    '      min-height: 22px !important;\n',
    '      border-radius: 50% !important;\n',
    '      display: flex !important;\n',
    '      align-items: center !important;\n',
    '      justify-content: center !important;\n',
    '      font-size: 0.72rem !important;\n',
    '      font-weight: 900 !important;\n',
    '      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;\n',
    '      box-sizing: border-box !important;\n',
    '      margin-bottom: 3px !important;\n',
    '    }\n',
    '    .theme-pill-option .theme-selected-badge {\n',
    '      display: none;\n',
    '      font-size: 0.60rem;\n',
    '      font-weight: 900;\n',
    '      padding: 2px 7px;\n',
    '      border-radius: 6px;\n',
    '      line-height: 1.2;\n',
    '      margin-top: 3px;\n',
    '      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);\n',
    '    }\n',
    '    .theme-pill-option.active .theme-selected-badge {\n',
    '      display: inline-block !important;\n',
    '    }\n',
    '\n',
    '    /* كروت نافذة خلفيات التطبيق الموسعة */\n',
    '    .theme-card-box {\n',
    '      position: relative !important;\n',
    '      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;\n',
    '    }\n',
    '    .theme-card-box.active {\n',
    '      transform: translateY(-2px) scale(1.03) !important;\n',
    '      outline: 2px solid rgba(255, 255, 255, 0.35) !important;\n',
    '    }\n'
]

# Lines 4673 to 4743 (0-indexed: 4673 to 4743)
print("Replacing lines", 4673, "to", 4743, ":")
print("First line being replaced:", repr(lines[4673]))
print("Last line being replaced:", repr(lines[4743]))

lines[4673:4743] = new_block

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Updated lines successfully!")
