import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- LINES 15150 - 15320 ---")
for i in range(15150, min(15320, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")

print("\n--- LINES 22300 - 22400 ---")
for i in range(22300, min(22400, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")

print("\n--- LINES 22500 - 22600 ---")
for i in range(22500, min(22600, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")
