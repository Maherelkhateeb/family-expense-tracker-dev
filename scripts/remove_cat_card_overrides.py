import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove [data-card-style="glass"] .cat-card,
target1 = '[data-card-style="glass"] .cat-card,'
if target1 in content:
    content = content.replace(target1, '/* removed [data-card-style="glass"] .cat-card to allow theme gradients */')
    print("1. Removed target1 successfully.")
else:
    print("WARNING: target1 not found verbatim.")

# 2. Remove [data-card-style="minimal"] .cat-card,
target2 = '[data-card-style="minimal"] .cat-card,'
if target2 in content:
    content = content.replace(target2, '/* removed [data-card-style="minimal"] .cat-card to allow theme gradients */')
    print("2. Removed target2 successfully.")
else:
    print("WARNING: target2 not found verbatim.")

# 3. In line ~9849: remove background: linear-gradient(155deg, rgba(30, 41, 59, 0.90) 0%, rgba(15, 23, 42, 0.98) 100%) !important;
target3 = 'background: linear-gradient(155deg, rgba(30, 41, 59, 0.90) 0%, rgba(15, 23, 42, 0.98) 100%) !important;'
if target3 in content:
    content = content.replace(target3, '/* cat-card background handled by theme engine in renderCategoriesGrid */')
    print("3. Removed target3 successfully.")
else:
    print("WARNING: target3 not found verbatim.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved index.html.")
