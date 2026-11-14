import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("HTML size:", len(html))

# 1. Check summaryLeftDrawer
drawer_match = re.search(r'<div[^>]*id=["\']summaryLeftDrawer["\'][^>]*>', html)
if drawer_match:
    start = drawer_match.start()
    print("Found summaryLeftDrawer at:", start)
    print("Snippet:")
    print(html[start:start+600])
else:
    print("summaryLeftDrawer not found!")

# 2. Check renderSummaryDrawer
render_sum = re.search(r'function renderSummaryDrawer\(', html)
if render_sum:
    start = render_sum.start()
    print("Found renderSummaryDrawer at:", start)
    print("Snippet:")
    print(html[start:start+600])

# 3. Check catGrid rendering
cat_match = re.search(r'cat-card', html)
if cat_match:
    print("Found cat-card occurrences:", len(re.findall(r'cat-card', html)))

# 4. Check where 'تسجيل جديد' appears
reg_matches = [m.start() for m in re.finditer(r'تسجيل جديد', html)]
print("Occurrences of 'تسجيل جديد':", len(reg_matches))
for idx in reg_matches[:5]:
    print("Snippet around 'تسجيل جديد':")
    print(html[max(0, idx-60):idx+80])

# 5. Check handleSaveTx
save_match = re.search(r'function handleSaveTx\(', html)
if save_match:
    start = save_match.start()
    print("Found handleSaveTx at:", start)
    print("Snippet:")
    print(html[start:start+400])
