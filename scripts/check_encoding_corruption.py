# -*- coding: utf-8 -*-
import re

FILE = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"

with open(FILE, 'r', encoding='utf-8') as f:
    text = f.read()

# Check for multiple question marks in Arabic text (mojibake / encoding loss)
q_marks = re.findall(r'[\u0600-\u06FF\s]*\?{3,}[\u0600-\u06FF\s]*', text)
print(f"Occurrences of 3+ consecutive question marks: {len(q_marks)}")
for q in q_marks[:10]:
    print("  Q:", q.strip())

# Check for \uFFFD replacement characters
repl_count = text.count('\uFFFD')
print(f"Occurrences of \\uFFFD: {repl_count}")
