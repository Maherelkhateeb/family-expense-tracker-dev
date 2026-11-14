import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m = re.search(r'market_rates\.json', html)
if m:
    # search backwards for function
    fn_start = html.rfind('function', 0, m.start())
    print("=== Function for fetching market rates ===")
    print(html[fn_start:fn_start+3500])
