# scripts/find_global_search_trigger.py
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

cmd = ["git", "log", "-S", "globalSearchModal", "--oneline"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
print("Commits with globalSearchModal:")
print(res.stdout)
