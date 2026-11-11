import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

heads = list(re.finditer(r'<div class="[^"]*modal-head[^"]*"[^>]*>(.*?)</div>', text, re.DOTALL))
for i, m in enumerate(heads):
    print(f'=== Head {i+1} ===')
    print(text[m.start():m.end()+100][:300])
