import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

for term in ['GOLD21', 'market_rates', 'ta3weem', 'gold', 'SAR']:
    matches = [m.start() for m in re.finditer(re.escape(term), html, re.IGNORECASE)]
    print(f"Term '{term}': {len(matches)} occurrences")

# Find where state.rates is initialized or updated
m = re.search(r'rates:\s*\{', html)
if m:
    print("=== state.rates definition ===")
    print(html[m.start()-50:m.start()+400])
