# scripts/find_portrait_history.py
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

cmd = ["git", "log", "-S", "family_portrait_settings_card", "--oneline"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
print(res.stdout)
