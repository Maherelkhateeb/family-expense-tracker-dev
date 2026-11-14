import subprocess, sys

cmd = ["git", "show", "dea5bfa:index.html"]
r = subprocess.run(cmd, capture_output=True, cwd=r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy")
html = r.stdout.decode('utf-8', errors='replace')

start = html.find('function initMonthlyBudgetUI')
end = html.find('function restoreBudgetForView', start)
if end != -1:
    end = html.find('}\n\n    //', end) + 2
else:
    end = start + 35000

print(f"Full budget JS code: {end-start} bytes")

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\budget_engine_full.js", "w", encoding="utf-8") as out:
    out.write(html[start:end])

print("Saved to scripts/budget_engine_full.js")
