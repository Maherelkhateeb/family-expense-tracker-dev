import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

for m in re.finditer(r'market_rates', html):
    start = m.start()
    print("=== market_rates snippet ===")
    print(html[start-100:start+600])
