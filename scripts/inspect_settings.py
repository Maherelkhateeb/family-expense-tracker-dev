import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Search for "خلفيات وألوان التطبيق"
matches = [m.start() for m in re.finditer(r'خلفيات وألوان التطبيق|ألوان ونمط الأيقونات|خط الكلمات والأرقام|نمط الكروت', html)]
print(f"Settings matches found: {len(matches)}")
for idx in matches:
    start = max(0, idx - 100)
    end = min(len(html), idx + 2000)
    print("=== SETTINGS SECTION ===")
    print(html[start:end])
    print("========================")
