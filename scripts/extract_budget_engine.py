import subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
cmd = ["git", "show", "dea5bfa:index.html"]
r = subprocess.run(cmd, capture_output=True, text=True, cwd=r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy")
html = r.stdout
print("Extracted html from dea5bfa, length:", len(html))

# Let's find budget functions in dea5bfa
pos = html.find('function initMonthlyBudgetUI')
if pos == -1:
    pos = html.find('initMonthlyBudgetUI')
print("pos of initMonthlyBudgetUI in dea5bfa:", pos)

if pos != -1:
    print("=== Budget Code Snippet from dea5bfa ===")
    print(html[pos-100:pos+2500])

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\extracted_budget_dea5bfa.js", "w", encoding="utf-8") as out:
    # Let's find the start and end of the budget JS block in dea5bfa
    start = html.find('// إدارة الميزانيات الشهرية والخطط التقديرية')
    if start == -1:
        start = html.find('initMonthlyBudgetUI') - 100
    end = html.find('// =========================================================================', start + 1000)
    out.write(html[start:end])
    print(f"Written {end-start} bytes to scripts/extracted_budget_dea5bfa.js")
