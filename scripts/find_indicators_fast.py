with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
for idx, line in enumerate(lines):
    if 'navTab' in line or 'switchView' in line or 'مؤشر' in line or 'analytics' in line.lower() or 'filter' in line.lower():
        if any(term in line for term in ['id="navTab', 'viewAnalytics', 'viewIndicators', 'analyticsFilter', 'renderAnalytics']):
            out.append(f"Line {idx+1}: {line.strip()[:140]}")

with open('scripts/indicators_fast.txt', 'w', encoding='utf-8') as f_out:
    f_out.write('\n'.join(out))

print("Done. Count:", len(out))
