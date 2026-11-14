import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Look for functions related to task datetime
matches = re.findall(r'function\s+([a-zA-Z0-9_]*(?:Task|DateTime|Picker|Preset)[a-zA-Z0-9_]*)\s*\(', text)
print('Functions:', set(matches))

# Look for date/time IDs in newTaskDrawerModal or task modals
for m in re.finditer(r'id="([^"]*(?:task|Task|drawerTask|newTask)[^"]*(?:Date|Time|due|Due)[^"]*)"', text):
    print('ID:', m.group(1))

# Check newTaskDrawerModal content around date/time
idx_modal = text.find('id="newTaskDrawerModal"')
if idx_modal != -1:
    print("\n--- Found newTaskDrawerModal ---")
    chunk = text[idx_modal:idx_modal+6000]
    with open('scripts/newTaskDrawer_chunk.html', 'w', encoding='utf-8') as f_out:
        f_out.write(chunk)
    print("wrote scripts/newTaskDrawer_chunk.html")
