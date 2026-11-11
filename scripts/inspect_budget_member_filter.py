import sys, io

sys.stdout.reconfigure(encoding='utf-8')
HTML_FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    c = f.read()

pos = c.find('id="panelMonthlyBudget"')
end = c.find('id="panelBudgetHistory"', pos)
snippet = c[pos:end]
print("Member filter in panelMonthlyBudget?:", "Member" in snippet or "عضو" in snippet or "شخص" in snippet or "أفراد" in snippet)
import re
print("Matches for members in panelMonthlyBudget:")
for m in re.finditer(r'(member|عضو|شخص|أفراد)', snippet, re.IGNORECASE):
    print(snippet[max(0, m.start()-30):min(len(snippet), m.start()+50)])
