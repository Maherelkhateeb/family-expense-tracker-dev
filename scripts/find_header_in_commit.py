# scripts/find_header_in_commit.py
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

cmd = ["git", "show", "01cb697:index.html"]
res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
text = res.stdout

pos = text.find('<header class="app-header">')
if pos != -1:
    print(text[pos:pos+2000])
else:
    print("header not found in 01cb697")
