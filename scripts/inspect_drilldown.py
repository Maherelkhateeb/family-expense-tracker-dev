import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.finditer(r'ملخص|الملخص', text)
for m in list(matches)[:15]:
    idx = m.start()
    print(f"Pos {idx}: {text[max(0, idx-30):min(len(text), idx+60)]}")
    print('-'*30)
