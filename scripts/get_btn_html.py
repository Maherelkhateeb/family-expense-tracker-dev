import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="btnOpenSummaryDrawer"')
start = text.rfind('<button', 0, pos)
end = text.find('</button>', pos) + 9
print("EXACT BUTTON HTML:")
print(repr(text[start:end]))
