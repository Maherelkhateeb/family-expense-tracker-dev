# -*- coding: utf-8 -*-
with open(r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\diff_summary_clean.txt", 'r', encoding='utf-8') as f:
    text = f.read()

sections = text.split('\n@@')
print(f"Total sections: {len(sections)}")
for s in sections:
    lines = s.strip().split('\n')
    header = lines[0] if lines else ""
    adds = sum(1 for l in lines if l.startswith('+'))
    dels = sum(1 for l in lines if l.startswith('-'))
    print(f"Hunk: {header} (+{adds}, -{dels})")
    # Show first 3 deletions if any
    del_lines = [l for l in lines if l.startswith('-')][:5]
    for d in del_lines:
        safe_d = d[:100].encode('ascii', errors='replace').decode('ascii')
        print(f"   DEL: {safe_d}")
