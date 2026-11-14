import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('function openSettingsModal(')
idx_end = content.find('function downloadBackup()', idx)

print(content[idx:idx_end])
