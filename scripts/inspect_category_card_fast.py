import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Searching lines with .category-card or categoryCard...")
for i, line in enumerate(lines):
    if ".category-card" in line or "categoryCard" in line or "cockpit-exp-card" in line:
        print(f"Line {i+1}: {line.strip()[:140]}")
