import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find all modal heads and their inner text
heads = re.findall(r'<div class="[^"]*modal-head[^"]*"[^>]*>(.*?)</div>', text, re.DOTALL)
print(f'Found {len(heads)} modal-heads')
for i, h in enumerate(heads):
    clean = re.sub(r'<[^>]+>', ' ', h).strip()
    clean = re.sub(r'\s+', ' ', clean)
    print(f'Head {i+1}: {clean[:100]}')
