# -*- coding: utf-8 -*-
import subprocess

cmd = ['git', 'log', '-n', '4', '--stat']
p = subprocess.run(cmd, cwd=r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy', capture_output=True, text=True, encoding='utf-8', errors='replace')
print(p.stdout)
