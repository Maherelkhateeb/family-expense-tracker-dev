import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

p_start = text.find('function renderDrawerTasksList()')
p_end = text.find('// 2. مهام Microsoft To-Do المتكاملة', p_start)

print("Start pos:", p_start)
print("End pos:", p_end)
print("Lines in between:")
lines = text[p_start:p_end].count('\n')
print(f"Total lines in renderDrawerTasksList: {lines}")
