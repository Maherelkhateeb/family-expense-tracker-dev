import io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
filepath = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(filepath, "r", encoding="utf-8") as f:
    c = f.read()

pos = c.find('id="cardExpUpcoming"')
print("=== Card Markup ===")
print(c[pos-200:pos+2500])
