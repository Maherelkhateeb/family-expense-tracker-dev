import sys, io
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\full_view_expected.html", "r", encoding="utf-8") as f:
    c = f.read()

pos = c.find('cardExpUpcoming')
print("pos in full_view_expected.html:", pos)
if pos != -1:
    print(c[pos-200:pos+1500])
