import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos2 = 1934246
funcs = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', text[pos2:])
print("Functions after pos2:", funcs[:25])
