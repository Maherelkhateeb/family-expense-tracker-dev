import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'scripts\apply_complete_js_upgrade.py', 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find("function openSummaryDrawer")
idx2 = text.find("function openTasksFullScreenModal", idx1)
print(text[idx1:idx2])
