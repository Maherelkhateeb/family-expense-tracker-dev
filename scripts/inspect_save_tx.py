import sys, io

sys.stdout.reconfigure(encoding='utf-8')
HTML_FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('function saveTx')
if pos == -1:
    pos = c.find('function handleSaveTx')
if pos == -1:
    pos = c.find('function submitTx')
print("pos:", pos)
if pos != -1:
    print(c[pos:pos+1500])
