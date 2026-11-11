with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

print("escapeHtml in index.html:", "function escapeHtml" in c or "const escapeHtml" in c)
print("generateRichDemoBudgets in index.html:", "generateRichDemoBudgets" in c)
