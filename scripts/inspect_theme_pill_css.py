import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "theme-pill-option" in line or "theme-selected-badge" in line or "theme-color-dot" in line:
        print(f"Line {i+1}: {line.strip()[:140]}")
