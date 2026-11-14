import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for line_idx in [1313, 5091, 5744, 6130, 6910, 6952, 7598, 7747, 9390, 9834, 11300]:
    start = max(0, line_idx - 3)
    end = min(len(lines), line_idx + 15)
    print(f"=== BLOCK AROUND LINE {line_idx} ===")
    for i in range(start, end):
        print(f"{i+1}: {lines[i]}", end="")
