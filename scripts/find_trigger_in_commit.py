# scripts/find_trigger_in_commit.py
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

cmd = ["git", "show", "56a62fa:index.html"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
text = res.stdout

import re
for m in re.finditer(r'globalSearchModal', text):
    print(text[max(0, m.start()-100):min(len(text), m.end()+100)])
    print("="*40)
