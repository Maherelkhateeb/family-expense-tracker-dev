import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\budget_engine_clean.js", "r", encoding="utf-8") as f:
    lines = f.readlines()
    print("Total lines:", len(lines))
    print("Last 40 lines:")
    print("".join(lines[-40:]))
