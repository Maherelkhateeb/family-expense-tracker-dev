import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's inspect where themes are styled in CSS
theme_css_matches = [m.start() for m in re.finditer(r'data-app-theme|data-icon-theme|data-font-family|data-card-style', html)]
print(f"Theme CSS references found: {len(theme_css_matches)}")

# Let's see how themes are defined in CSS
first_few = theme_css_matches[:6]
for idx in first_few:
    start = max(0, idx - 100)
    end = min(len(html), idx + 400)
    print(f"[{idx}]:\n{html[start:end]}\n---")
