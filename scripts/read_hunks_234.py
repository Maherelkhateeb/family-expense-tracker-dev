# -*- coding: utf-8 -*-
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\diff_54_to_2e.txt", 'r', encoding='utf-8') as f:
    text = f.read()

chunks = text.split('\n@@')
for idx in [2, 3, 4]:
    if idx < len(chunks):
        print(f"=== HUNK {idx} ===")
        for line in chunks[idx].split('\n'):
            print(line.encode('ascii', errors='replace').decode('ascii'))
