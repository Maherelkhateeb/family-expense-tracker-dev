import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Check font-family rules in CSS
matches = list(re.finditer(r'font-family\s*:\s*([^;\}]+)', content[:100000]))
print(f'Font family declarations in first 100k: {len(matches)}')
for m in matches[:15]:
    val = m.group(1).strip()
    idx = m.start()
    print(f'Rule: {val}  | Context: {content[max(0, idx-40):idx+len(m.group(0))+20].replace(chr(10), " ")}')
