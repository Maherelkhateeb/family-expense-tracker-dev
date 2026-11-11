import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

print("--- CSS for .cat-icon-bubble ---")
for m in re.finditer(r'\.cat-icon-bubble\s*\{[^}]*\}', c):
    print(m.group(0))

print("\n--- CSS for .cat-label-text ---")
for m in re.finditer(r'\.cat-label-text\s*\{[^}]*\}', c):
    print(m.group(0))

print("\n--- --app-cat-bubble-size occurrences ---")
for m in re.finditer(r'--app-cat-bubble-size[^\n;]+', c):
    print(m.group(0))
