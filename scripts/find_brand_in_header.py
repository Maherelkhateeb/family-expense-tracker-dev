import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

matches = [m.start() for m in re.finditer(r'عيلة ماهر|عائلة ماهر', text)]
print("Total matches:", len(matches))
for p in matches:
    if p > 10000:
        print(f"--- Match at pos {p} ---")
        print(text[p-200:p+300])
