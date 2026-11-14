# scripts/search_git_history.py
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

cmd = ["git", "log", "--grep=حذف", "--grep=ديباجة", "--grep=تبسيط", "--grep=تنظيف", "--grep=صورة", "--oneline", "-n", "30"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
print("Commits matching keywords:")
print(res.stdout)
