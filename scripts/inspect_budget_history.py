import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'id=["\']budgetHistoryListContainer["\']', html)
if m:
    start = m.start()
    print("=== Around budgetHistoryListContainer ===")
    print(html[start:start+1200])
