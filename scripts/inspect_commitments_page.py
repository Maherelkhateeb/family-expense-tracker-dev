import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Search for the Commitments page container
matches = [m.start() for m in re.finditer(r'id="pageExpected"|الالتزامات والديون|تسجيل ومتابعة الفواتير', html)]
print(f"Commitments page matches: {len(matches)}")
for idx in matches[:6]:
    start = max(0, idx - 100)
    end = min(len(html), idx + 250)
    print(f"[{idx}]:\n{html[start:end]}\n---")

# Find JS functions for commitments
fn_matches = [m.start() for m in re.finditer(r'function (renderExpected|saveExpected|addExpected|switchExpected|openExpected)', html)]
print(f"Commitments JS functions: {len(fn_matches)}")
for idx in fn_matches:
    start = max(0, idx)
    end = min(len(html), idx + 200)
    print(f"[{idx}]:\n{html[start:end]}\n---")
