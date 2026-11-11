import sys

sys.stdout.reconfigure(encoding='utf-8')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    text = f.read()

import re

# Find rules mentioning category-card
matches = re.findall(r'([^{}]*category-card[^{}]*\{[^}]*\})', text)
print(f"Found {len(matches)} CSS rules for category-card")
for m in matches[:15]:
    print("--- RULE ---")
    print(m.strip()[:300])
