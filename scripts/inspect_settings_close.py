import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find("closeModal('settingsModal')")
print("Found closeModal('settingsModal') at:", idx)
if idx != -1:
    print(content[idx-200:idx+400])
