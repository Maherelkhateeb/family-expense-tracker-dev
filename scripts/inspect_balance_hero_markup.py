import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- LINES 11155-11200 ---")
for i in range(11155, min(11200, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")

print("\n--- LINES 12130-12165 ---")
for i in range(12130, min(12165, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")
