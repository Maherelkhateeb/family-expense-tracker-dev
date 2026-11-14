import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('ألوان ونمط الأيقونات (Icon Color Palettes)')
print("Found at:", idx)
if idx != -1:
    print(content[idx:idx+2500])
