import io, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
filepath = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(filepath, "r", encoding="utf-8") as f:
    c = f.read()

pos = c.find('id="expectedCountUpcoming"')
print("=== HTML with expectedCountUpcoming ===")
print("pos:", pos)
if pos != -1:
    print(c[pos-500:pos+2500])
