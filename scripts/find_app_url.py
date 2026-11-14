import re

with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html", "r", encoding="utf-8") as f:
    text = f.read()

matches = re.findall(r'https?://[^\s"\'<>]+', text)
gh_links = [m for m in matches if 'github' in m or 'easybakery' in m]
print("Links found:")
for link in set(gh_links):
    print(" ", link)
