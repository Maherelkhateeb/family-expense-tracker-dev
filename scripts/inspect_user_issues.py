import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

repo_dir = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy"
html_path = os.path.join(repo_dir, "index.html")

with open(html_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

keywords = [
    "الدرع الملكي",
    "الموزاييك",
    "family-emblem",
    "setEmblem",
    "selectEmblem",
    "الحساب الحالي:",
    "current-user-badge",
    "theme-option",
    "setAppTheme",
    "switchTheme",
    "category-card",
    "cockpit-exp-card",
    "actual-balance"
]

for idx, line in enumerate(lines):
    for kw in keywords:
        if kw in line:
            print(f"[{kw}] Line {idx+1}: {line.strip()[:140]}")
            break
