import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Search for setInterval
print("=== SETINTERVAL CALLS ===")
for m in re.finditer(r'setInterval\s*\(', html):
    idx = m.start()
    print(html[idx-50:idx+250])
    print("-" * 30)

# 2. Search for generateRichDemoTransactions
print("=== DEMO TRANSACTIONS GENERATION ===")
for m in re.finditer(r'generateRichDemoTransactions\s*\(', html):
    idx = m.start()
    print(html[idx-50:idx+250])
    print("-" * 30)
