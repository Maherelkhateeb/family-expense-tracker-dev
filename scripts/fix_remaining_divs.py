import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: viewCommitmentsBillsList
content = content.replace(
    '\nid="viewCommitmentsBillsList" style="display: block;">',
    '\n<div id="viewCommitmentsBillsList" style="display: block;">',
    1
)

# Fix 2: tasksCategoryPillsStrip
content = content.replace(
    '\n        id="tasksCategoryPillsStrip">',
    '\n        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0 6px;" class="custom-scrollbar" id="tasksCategoryPillsStrip">',
    1
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed viewCommitmentsBillsList and tasksCategoryPillsStrip div tags!")
