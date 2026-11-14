import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for line_idx in [8017, 8915, 8935, 8955, 8975, 8995, 9601, 9860]:
    start = max(0, line_idx - 2)
    end = min(len(lines), line_idx + 8)
    print(f"=== BLOCK AROUND LINE {line_idx} ===")
    for i in range(start, end):
        print(f"{i+1}: {lines[i]}", end="")
