import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find the end of appFrame and end of body
idx_frame = html.find('id="appFrame"')
idx_scroll = html.find('id="appScrollBody"')
idx_view_exp = html.find('id="viewExpected"')
idx_nav = html.find('id="appBottomNav"')
idx_gold = html.find('id="goldDrawerPanel"')

print("Locations in file:")
print(f"appFrame: {idx_frame}")
print(f"appScrollBody: {idx_scroll}")
print(f"viewExpected: {idx_view_exp}")
print(f"appBottomNav: {idx_nav}")
print(f"goldDrawerPanel: {idx_gold}")

# Find where the pages end
for pid in ['viewExpenses', 'viewOperations', 'viewAnalytics', 'viewRequests', 'viewExpected']:
    m = re.search(r'id=["\']' + pid + r'["\']', html)
    if m:
        print(f"{pid} starts at: {m.start()}")
