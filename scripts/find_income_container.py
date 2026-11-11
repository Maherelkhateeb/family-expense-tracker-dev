import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

p = text.find('incomeHistoryListContainer')
while p != -1:
    line_no = text[:p].count('\n') + 1
    print(f'Line {line_no}: {repr(text[p:p+100])}')
    p = text.find('incomeHistoryListContainer', p+1)
