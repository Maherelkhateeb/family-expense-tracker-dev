with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Find the bottom navigation bar HTML
idx_bottom = text.find('bottom-nav')
if idx_bottom == -1:
    idx_bottom = text.find('id="bottomNav"')
if idx_bottom == -1:
    idx_bottom = text.find('الالتزامات')

print('found at:', idx_bottom)
import re
# Find nav items around bottom
for m in re.finditer(r'<button[^>]*onclick="([^"]+)"[^>]*>[\s\S]*?الالتزامات', text):
    print('Button onclick:', m.group(1))

# Also look for switchTab or navigate
matches = re.findall(r'function\s+nav[a-zA-Z0-9_]*\s*\(|function\s+switch[a-zA-Z0-9_]*\s*\(', text)
print('Nav/switch functions:', set(matches))
