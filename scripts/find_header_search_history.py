# scripts/find_header_search_history.py
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

cmd = ["git", "log", "-S", "openSearchModal", "--oneline", "-n", "10"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
print("Commits with openSearchModal:")
print(res.stdout)

cmd2 = ["git", "log", "-S", "fa-magnifying-glass", "--oneline", "-n", "10"]
res2 = subprocess.run(cmd2, capture_output=True, text=True, encoding='utf-8', errors='ignore')
print("\nCommits with fa-magnifying-glass:")
print(res2.stdout)
