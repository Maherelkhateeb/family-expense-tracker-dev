# -*- coding: utf-8 -*-
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\diff_54_to_2e.txt", 'r', encoding='utf-8') as f:
    text = f.read()

sections = text.split('\n@@')
print(f"Total hunks between 545d563 and 2e12ad3: {len(sections)}")
for idx, s in enumerate(sections):
    lines = s.strip().split('\n')
    header = lines[0] if lines else ""
    adds = sum(1 for l in lines if l.startswith('+'))
    dels = sum(1 for l in lines if l.startswith('-'))
    print(f"Hunk #{idx}: {header} (+{adds}, -{dels})")
    for d in [l for l in lines if l.startswith('-')][:3]:
        print("  DEL:", d[:100].encode('ascii', errors='replace').decode('ascii'))
