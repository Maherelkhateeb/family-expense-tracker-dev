import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- switchAppPage area ---")
for i in range(18030, min(18070, len(lines))):
    print(f'{i+1}: {lines[i].rstrip()[:120]}')

print("\n--- renderExpectedList area ---")
for i in range(21280, min(21350, len(lines))):
    print(f'{i+1}: {lines[i].rstrip()[:120]}')
