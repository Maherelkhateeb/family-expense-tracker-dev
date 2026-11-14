import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- LINES 19435-19480 ---")
for i in range(19435, min(19480, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")

print("\n--- LINES 25450-25480 ---")
for i in range(25450, min(25480, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")
