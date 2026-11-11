import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("Searching for buttons mentioning 'المهام'...")
for m in re.finditer(r'<button[^>]*>[\s\S]*?المهام[\s\S]*?</button>', text):
    snippet = m.group(0).replace('\n', ' ')
    print("Found button:", snippet[:200])

print("\nSearching for onclick calling task functions...")
for m in re.finditer(r'onclick=[\"\'][^\"\']*(?:Task|tasks|Todo|todo)[^\"\']*[\"\']', text, re.I):
    print("Onclick:", m.group(0))
