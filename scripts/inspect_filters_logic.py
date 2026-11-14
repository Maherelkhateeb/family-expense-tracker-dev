import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx1 = html.find('function setOpsTypeFilter(')
print("=== setOpsTypeFilter ===")
print(html[idx1:idx1+1000])

idx2 = html.find('function selectMemberFilter(')
print("\n=== selectMemberFilter ===")
print(html[idx2:idx2+1500])
