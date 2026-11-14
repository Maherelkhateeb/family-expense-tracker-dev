import io, sys, re

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

# Let's search for "تم السداد" or "ديون علينا" or "ديون لنا"
for phrase in ["تم السداد", "ديون علينا", "ديون لنا", "مكتمل"]:
    matches = [m.start() for m in re.finditer(re.escape(phrase), c)]
    print(f"Phrase '{phrase}': count = {len(matches)}")
    for m in matches[:3]:
        print(f"  At {m}: {repr(c[max(0, m-60):min(len(c), m+120)])}")
