import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect all <small>, <p>, descriptive <span>, <div class="help-text"> or similar
patterns = [
    r'<small[^>]*>(.*?)</small>',
    r'<p[^>]*>(.*?)</p>',
    r'<div[^>]*class="[^"]*(?:help|hint|sub|desc|instruction|note|alert|info)[^"]*"[^>]*>(.*?)</div>',
    r'<span[^>]*class="[^"]*(?:help|hint|sub|desc|instruction|note|alert|info)[^"]*"[^>]*>(.*?)</span>'
]

results = []
for p in patterns:
    for m in re.finditer(p, text, re.IGNORECASE | re.DOTALL):
        clean = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        clean = re.sub(r'\s+', ' ', clean)
        if len(clean) > 10:
            results.append((clean, m.group(0)[:100]))

# Deduplicate
seen = set()
unique_results = []
for clean, raw in results:
    if clean not in seen:
        seen.add(clean)
        unique_results.append((clean, raw))

print(f'Total candidates: {len(unique_results)}')
for i, (c, r) in enumerate(unique_results):
    print(f'{i+1}: {c}')
