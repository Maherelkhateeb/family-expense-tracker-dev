import sys, io
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

pos = c.find('expected-kpi-cockpit')
print("pos of expected-kpi-cockpit in index.html:", pos)
if pos != -1:
    print(c[pos-100:pos+2500])
