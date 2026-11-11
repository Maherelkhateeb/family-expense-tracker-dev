import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- LINES 27990-28100 ---")
for i in range(27990, min(28100, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")
