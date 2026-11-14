import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Settings sync section
m1 = html.find('btnSettingsForceMasterSync')
print(f"btnSettingsForceMasterSync index: {m1}")
if m1 != -1:
    s = html.rfind('<div class="settings-unified-section"', 0, m1)
    e = html.find('</div>\n        </div>', m1)
    print(f"Settings sync section block: {s} to {e}")
    print(html[s:m1+300])

# 2. Theme CSS overrides
m2 = html.find('data-app-theme="navy"')
print(f"data-app-theme=navy first index: {m2}")
# Let's see all blocks with data-app-theme="navy"
for m in re.finditer(r'/\*.*?\bnavy\b.*?\*/', html, re.IGNORECASE):
    print(f"Navy comment at {m.start()}: {m.group(0)}")
