import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    text = f.read()

print("1. Line 12145 (topCardBalance):")
for i, line in enumerate(text.splitlines()):
    if 'id="topCardBalance"' in line:
        print(f"  Line {i+1}: {line}")

print("\n2. Family and user section in settingsModal:")
for i, line in enumerate(text.splitlines()):
    if 'settings-user-capsule' in line or 'family_portrait_settings_card' in line or 'settingsModal' in line:
        if i > 15150 and i < 15300:
            print(f"  Line {i+1}: {line}")

print("\n3. Theme options in settingsModal:")
for i, line in enumerate(text.splitlines()):
    if 'id="themeOptNavy"' in line or 'id="themeOptLight"' in line:
        print(f"  Line {i+1}: {line}")
