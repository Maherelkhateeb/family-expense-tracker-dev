import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Check key sections existence
checks = [
    'id="settingsModal"',
    'id="summaryLeftDrawer"',
    'id="tasksFullScreenModal"',
    'function formatMoneyWithSignHtml',
    'function formatMoney',
    'function renderSummaryDrawer',
    'function renderDrawerTasksList',
    'function openOperationsFiltered',
    'function filterOperationsList'
]

for c in checks:
    print(f"Check '{c}': {'FOUND' if c in content else 'NOT FOUND'}")
