with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
scripts = list(re.finditer(r'<script\b[^>]*>(.*?)</script>', text, re.DOTALL))
print(f"Total script tags: {len(scripts)}")
for idx, s in enumerate(scripts):
    content = s.group(1)
    fns = re.findall(r'function\s+([a-zA-Z0-9_]+)', content)
    async_fns = re.findall(r'async\s+function\s+([a-zA-Z0-9_]+)', content)
    print(f"\nScript #{idx}: length {len(content)} chars, {len(fns)} regular fns, {len(async_fns)} async fns")
    print("  First 100 chars:", repr(content[:100].strip()))
    sample_fns = (fns + async_fns)[:8]
    print("  Sample functions:", sample_fns)
