# scripts/inspect_what_changed_in_4f.py
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

cmd = ["git", "diff", "9111a5d..4f3f4e0", "index.html"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')

with open('scripts/diff_4f_only.txt', 'w', encoding='utf-8') as f:
    f.write(res.stdout)

print("Diff 4f lines:", len(res.stdout.split('\n')))
