import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find('لا تنسي توثيق مصاريف')
if idx1 != -1:
    start = text.rfind('<div style="background:', 0, idx1)
    end = text.find('</div>', idx1)
    end = text.find('</div>', end + 1)
    end = text.find('</div>', end + 1)
    print("=== Aya Box ===")
    print(text[start:end+6])
    text = text[:start] + text[end+6:]

idx2 = text.find('انقر على أي لون لتغيير خلفية التطبيق')
if idx2 != -1:
    start = text.rfind('<div style="margin-bottom:', 0, idx2)
    end = text.find('</div>', idx2)
    print("=== Theme Banner ===")
    print(text[start:end+6])
    text = text[:start] + text[end+6:]

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Cleaned the remaining 2 items.")
