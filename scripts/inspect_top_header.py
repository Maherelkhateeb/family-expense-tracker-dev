import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect the top header (lines 13500 to 13800)
lines = text.splitlines()
for i in range(13480, 13750):
    if i < len(lines):
        line = lines[i]
        if any(tag in line for tag in ['<h', '<span', '<p', '<div', 'title=']):
            clean = re.sub(r'<[^>]+>', ' ', line).strip()
            clean = re.sub(r'\s+', ' ', clean)
            if clean:
                print(f'{i+1}: {clean[:100]}')
