import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Search for bottom nav bar
print("=== BOTTOM NAV BAR ===")
matches_nav = [m.start() for m in re.finditer(r'(class=["\'][^"\']*nav-tab|id=["\']bottomNav|class=["\'][^"\']*bottom-nav)', html)]
print("Bottom nav matches:", len(matches_nav))
for idx in matches_nav[:5]:
    print(html[idx-50:idx+250])
    print("-" * 30)

# 2. Search for right side drawer
print("=== RIGHT SIDE DRAWER ===")
matches_right = [m.start() for m in re.finditer(r'(goldDrawer|right-drawer|drawer-right|rightDrawer)', html, re.IGNORECASE)]
print("Right drawer matches:", len(matches_right))
for idx in matches_right[:5]:
    print(html[idx-50:idx+250])
    print("-" * 30)

# 3. Check CSS for bottom nav
matches_nav_css = [m.start() for m in re.finditer(r'\.(bottom-nav|nav-tab|app-bottom-bar)', html)]
print("Nav CSS matches:", len(matches_nav_css))
for idx in matches_nav_css[:5]:
    print(html[idx-20:idx+250])
    print("-" * 30)
