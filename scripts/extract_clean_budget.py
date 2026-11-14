import subprocess, sys

cmd = ["git", "show", "dea5bfa:index.html"]
r = subprocess.run(cmd, capture_output=True, cwd=r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy")
html = r.stdout.decode('utf-8', errors='replace')

start = html.find('function initMonthlyBudgetUI')
# Find the end of all budget functions
end = html.find('// =========================================================================\n    // نظام ومحرك المهام', start)
if end == -1:
    end = html.find('// =========================================================================\n    // المهام', start)
if end == -1:
    end = start + 30000

print(f"Extracted budget code from {start} to {end} ({end-start} bytes)")

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\budget_engine_clean.js", "w", encoding="utf-8") as out:
    out.write(html[start:end])

print("Saved cleanly to scripts/budget_engine_clean.js")
