# scripts/find_open_search_calls.py
import sys
import subprocess
import re

sys.stdout.reconfigure(encoding='utf-8')

cmd = ["git", "show", "3c5f741:index.html"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
text = res.stdout

for m in re.finditer(r'openGlobalSearchModal', text):
    print(text[max(0, m.start()-100):min(len(text), m.end()+100)])
    print("="*40)
