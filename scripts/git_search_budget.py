import subprocess, sys

sys.stdout.reconfigure(encoding='utf-8')
cmd = ["git", "log", "-S", "الميزاني", "--oneline"]
r = subprocess.run(cmd, capture_output=True, text=True, cwd=r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy")
print(r.stdout[:2000])
