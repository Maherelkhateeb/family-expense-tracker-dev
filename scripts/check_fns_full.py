import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\budget_engine_full.js", "r", encoding="utf-8") as f:
    code = f.read()

functions = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', code)
print(f"Found {len(functions)} functions in full budget engine:")
for fn in functions:
    print(" -", fn)
