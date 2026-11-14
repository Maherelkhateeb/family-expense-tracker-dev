import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

heads = list(re.finditer(r'<div class="[^"]*modal-head[^"]*"[^>]*>(.*?)</div>', text, re.DOTALL))
indices = [4, 5, 8, 9, 11, 18, 21, 22] # 0-indexed for 5, 6, 9, 10, 12, 19, 22, 23
for idx in indices:
    if idx < len(heads):
        m = heads[idx]
        print(f'=== Head {idx+1} ===')
        print(m.group(0))
