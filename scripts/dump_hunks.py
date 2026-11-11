# -*- coding: utf-8 -*-
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\diff_summary_clean.txt", 'r', encoding='utf-8') as f:
    text = f.read()

sections = text.split('\n@@')
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\hunk_details.txt", 'w', encoding='utf-8') as out:
    for idx, s in enumerate(sections):
        out.write(f"\n=================== HUNK #{idx} ===================\n")
        out.write(s)
        out.write("\n")

print("Wrote hunk_details.txt")
