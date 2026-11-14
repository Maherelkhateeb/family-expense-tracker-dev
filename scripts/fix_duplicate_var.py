import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    c = f.read()

target = "    let selectedBudgetItemMembers = ['البيت'];\n    let activeBudgetSubTab = 'current';"
replacement = "    let selectedBudgetItemMembers = ['البيت'];\n    // activeBudgetSubTab already defined"

if target in c:
    c = c.replace(target, replacement, 1)
    print("✓ Removed duplicate let activeBudgetSubTab")
else:
    print("! Target string not found, searching alternative")
    import re
    matches = [m.start() for m in re.finditer(r'let\s+activeBudgetSubTab', c)]
    print("Matches:", matches)
    if len(matches) > 1:
        second = matches[1]
        c = c[:second] + "// duplicate: " + c[second:]
        print("✓ Commented out second let activeBudgetSubTab")

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "w", encoding="utf-8") as f:
    f.write(c)

print("Saved index.html")
