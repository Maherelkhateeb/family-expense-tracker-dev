import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. openQuickCategoryExpense
m = re.search(r'function openQuickCategoryExpense\b', html)
if m:
    print("=== openQuickCategoryExpense ===")
    print(html[m.start():m.start()+1200])

# 2. openTxModal
m2 = re.search(r'function openTxModal\b', html)
if m2:
    print("=== openTxModal ===")
    print(html[m2.start():m2.start()+1200])

# 3. handleSaveTx
m3 = re.search(r'function handleSaveTx\b', html)
if m3:
    print("=== handleSaveTx ===")
    print(html[m3.start():m3.start()+1500])
