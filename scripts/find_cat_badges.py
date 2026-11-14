import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

badges = re.findall(r'id=[\"\']catBadge\w+[\"\']', text)
print('Found category badges:', badges)
