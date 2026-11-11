import subprocess

r = subprocess.run(["git", "diff", "--stat", "index.html"], capture_output=True, text=True, cwd=r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy")
print(r.stdout)
