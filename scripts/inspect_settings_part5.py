import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start_idx = text.find('iconThemeOptPurple')
if start_idx != -1:
    end_idx = text.find('id="tasksFullScreenModal"', start_idx)
    if end_idx == -1:
        end_idx = start_idx + 4000
    print(text[start_idx:end_idx])
