import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check initial transactions
m = re.search(r'transactions:\s*\[', html)
if m:
    start = m.start()
    print("=== initial transactions ===")
    print(html[start:start+1200])

# Check member filter normalization
print("Checking member normalization in getFilteredTransactions...")
m2 = re.search(r'function normalizeMemberName', html)
if m2:
    print("normalizeMemberName exists!")
else:
    print("normalizeMemberName NOT found")
