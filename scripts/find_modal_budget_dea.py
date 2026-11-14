import subprocess, sys

cmd = ["git", "show", "dea5bfa:index.html"]
r = subprocess.run(cmd, capture_output=True, cwd=r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy")
html = r.stdout.decode('utf-8', errors='replace')

pos = html.find('modalNewBudgetPlan')
print("pos of modalNewBudgetPlan in dea5bfa:", pos)
if pos != -1:
    print(html[pos-100:pos+2500])
