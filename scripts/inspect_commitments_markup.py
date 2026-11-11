import io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
filepath = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(filepath, "r", encoding="utf-8") as f:
    c = f.read()

# Let's inspect the commitment cards HTML and CSS
pos = c.find('commitments-4cards-grid')
if pos == -1:
    pos = c.find('commitmentsExecutiveCardsStrip')
print("commitments cards at pos:", pos)
if pos != -1:
    print(c[pos-300:pos+1500])
