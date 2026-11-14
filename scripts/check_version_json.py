import sys, json
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\version.json", "r", encoding="utf-8") as f:
    v = json.load(f)
    print("Current version.json:", v)
