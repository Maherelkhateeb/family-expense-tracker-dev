import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- LINES 15585-15630 ---")
for i in range(15585, min(15630, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")

print("\n--- LINES 19560-19620 ---")
for i in range(19560, min(19620, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")
