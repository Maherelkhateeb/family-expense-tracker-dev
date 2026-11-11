import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if 'tasks-mobile-single-add-card' in line:
        start_idx = i
    if start_idx is not None and 'tasks-sticky-filter-wrapper' in line:
        end_idx = i
        break

print(f'Start idx: {start_idx+1}, End idx: {end_idx+1}')
for k in range(start_idx-2, end_idx+2):
    print(f'{k+1}: {lines[k]}', end='')
