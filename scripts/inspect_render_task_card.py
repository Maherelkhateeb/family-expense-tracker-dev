import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(28350, min(28550, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")
