# scripts/inspect_commit_diffs.py
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

cmd = ["git", "diff", "9111a5d..4f3f4e0", "--", "index.html"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
lines = res.stdout.split('\n')

print(f"Total diff lines between 9111a5d and 4f3f4e0: {len(lines)}")
added_lines = [l for l in lines if l.startswith('+') and not l.startswith('+++')]
removed_lines = [l for l in lines if l.startswith('-') and not l.startswith('---')]

print(f"Added lines: {len(added_lines)}, Removed lines: {len(removed_lines)}")

# Look for text content in added lines
for l in added_lines[:50]:
    if any(ar in l for ar in ['نظام', 'شاشة', 'إدارة', 'مصروفات', 'مرحبا', 'توضيح', 'دليل', 'شعار', 'معاينة']):
        print("ADD:", l.strip()[:120])

for l in removed_lines[:50]:
    if any(ar in l for ar in ['نظام', 'شاشة', 'إدارة', 'مصروفات', 'مرحبا', 'توضيح', 'دليل', 'شعار', 'معاينة']):
        print("REM:", l.strip()[:120])
