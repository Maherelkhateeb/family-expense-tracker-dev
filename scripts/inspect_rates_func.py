import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = [m.start() for m in re.finditer(r'function (fetchMarketRates|fetchRates|syncMarketRates|updateMarketRates|fetchTa3weemRates)\b', html)]
print("Rate function occurrences:", len(matches))
for idx in matches:
    print("=== Rate Function ===")
    print(html[idx:idx+1500])
    print("="*40)
