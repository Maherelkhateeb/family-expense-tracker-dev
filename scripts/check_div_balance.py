# -*- coding: utf-8 -*-
import re

FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(FILE, 'r', encoding='utf-8') as f:
    lines = f.readlines()

depth = 0
for idx, line in enumerate(lines, 1):
    opens = len(re.findall(r'<div\b', line, re.IGNORECASE))
    closes = len(re.findall(r'</div>', line, re.IGNORECASE))
    depth += (opens - closes)
    if depth < 0:
        print(f"Line {idx} dropped depth below 0 (depth={depth}): {line.strip()[:80]}")
        depth = 0

print(f"Final depth at end of file: {depth}")
