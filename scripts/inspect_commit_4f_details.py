# scripts/inspect_commit_4f_details.py
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

cmd = ["git", "show", "4f3f4e0", "--stat"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
print(res.stdout)

cmd2 = ["git", "show", "4f3f4e0", "scripts/verify_v527_clean.py"]
res2 = subprocess.run(cmd2, capture_output=True, text=True, encoding='utf-8', errors='ignore')
print("verify_v527_clean.py snippet:")
print(res2.stdout[:500])
