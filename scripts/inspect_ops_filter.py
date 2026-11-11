import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's inspect renderOperationsList implementation
idx = html.find('function renderOperationsList(')
if idx != -1:
    print("Found renderOperationsList at:", idx)
    print(html[idx:idx+3500])
else:
    print("renderOperationsList not found")
