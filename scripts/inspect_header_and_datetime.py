import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print(f"Total HTML length: {len(html)}")

# 1. Search for header brand and عائلة / عيلة
print("\n=== SEARCH FOR BRAND / HEADER ===")
brand_matches = [m.start() for m in re.finditer(r'عائل|عيل|brand', html, re.IGNORECASE)]
for idx in brand_matches[:10]:
    start = max(0, idx - 120)
    end = min(len(html), idx + 120)
    snippet = html[start:end].replace('\n', ' ')
    if 'header' in snippet.lower() or 'app-header' in snippet.lower() or 'عائل' in snippet or 'عيل' in snippet:
        print(f"[{idx}]: {snippet}\n")

# Search specifically for header tags
headers = [m.start() for m in re.finditer(r'<header[^>]*>', html)]
for idx in headers:
    start = idx
    end = min(len(html), idx + 1000)
    print("=== HEADER CONTENT ===")
    print(html[start:end])
    print("======================")

# 2. Search for quickTask date time
print("\n=== SEARCH FOR QUICK TASK DATE TIME ===")
dt_matches = [m.start() for m in re.finditer(r'quickTask|quickTaskDateTime|datetime-local|موعد', html)]
for idx in dt_matches[:8]:
    start = max(0, idx - 150)
    end = min(len(html), idx + 250)
    print(f"[{idx}]:\n{html[start:end]}\n---")
