import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's inspect CSS around 180000 - 200000
idx = html.find('html[data-app-theme="slate"]')
if idx != -1:
    print("Found slate theme CSS at:", idx)
    print(html[idx-100:idx+3000])

# Also check where themes are defined
themes = ['navy', 'black', 'emerald', 'purple', 'rose', 'ocean', 'gold', 'slate', 'light']
for th in themes:
    m = list(re.finditer(rf'\[data-app-theme="{th}"\]', html))
    print(f"Theme '{th}': {len(m)} occurrences at {[x.start() for x in m]}")
