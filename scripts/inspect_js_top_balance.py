import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line_num in [19689, 25451]:
    start = max(0, line_num - 20)
    end = min(len(lines), line_num + 30)
    print(f'=== AROUND LINE {line_num} ===')
    for i in range(start, end):
        print(f'{i+1}: {lines[i]}', end='')
