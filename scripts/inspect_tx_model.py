import sys, io

sys.stdout.reconfigure(encoding='utf-8')
HTML_FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('demoTransactions')
if pos == -1:
    pos = c.find('generateRichDemoTransactions')
print("pos of demo:", pos)
if pos != -1:
    print(c[pos:pos+1500])
