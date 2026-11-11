import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_head = text.find('<head>')
pos_head_end = text.find('</head>')
head_chunk = text[pos_head:pos_head_end]

for line in head_chunk.splitlines():
    if 'font' in line.lower() or 'stylesheet' in line.lower() or '@import' in line.lower():
        print(line[:160])
