import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace 'let currentEditTxReceiptDataUri = null;' with 'currentEditTxReceiptDataUri = window.currentEditTxReceiptDataUri || null;'
html = re.sub(r'let currentEditTxReceiptDataUri\s*=\s*null;', 'currentEditTxReceiptDataUri = window.currentEditTxReceiptDataUri || null;', html)
print("✓ Fixed currentEditTxReceiptDataUri declaration")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved updated index.html")
