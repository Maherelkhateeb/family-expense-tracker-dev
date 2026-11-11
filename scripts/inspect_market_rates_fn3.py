import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'function fetchTradingViewRates\b', html)
if m:
    print("=== fetchTradingViewRates part 3 ===")
    print(html[m.start()+6500:m.start()+11000])
