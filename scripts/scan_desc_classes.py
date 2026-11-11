import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find all elements with class containing 'sub', 'desc', 'hint', 'help', 'caption'
matches = re.findall(r'<[^>]+class="[^"]*(?:sub|desc|hint|help|caption)[^"]*"[^>]*>(.*?)</[^>]+>', text, re.DOTALL)
print(f'Total matches: {len(matches)}')
for i, m in enumerate(matches[:30]):
    clean = re.sub(r'<[^>]+>', ' ', m).strip()
    clean = re.sub(r'\s+', ' ', clean)
    if clean:
        print(f'{i+1}: {clean[:90]}')
