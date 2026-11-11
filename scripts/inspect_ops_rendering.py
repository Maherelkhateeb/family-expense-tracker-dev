import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

print("--- Inspecting renderOperationsList ---")
idx = c.find('function renderOperationsList')
if idx != -1:
    print(c[idx:idx+2500])

print("\n--- Inspecting transaction card rendering in ops ---")
idx2 = c.find('function renderTransactionItem')
if idx2 != -1:
    print(c[idx2:idx2+1500])
