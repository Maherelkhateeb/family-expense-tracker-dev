# scripts/detailed_diff_4f.py
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

cmd = ["git", "diff", "9111a5d..HEAD", "--", "index.html"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')

with open('scripts/full_diff_since_9111a5d.txt', 'w', encoding='utf-8') as f:
    f.write(res.stdout)

print("Saved full diff to scripts/full_diff_since_9111a5d.txt")
print("Total chars:", len(res.stdout))
