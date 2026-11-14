import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

filepath = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

print("File length:", len(content))

# 1. Search for icons theme options in settings
patterns = ['ألوان ونمط الأيقونات', 'ملون فينتك', 'ذهبي', 'v5.0.9']
for p in patterns:
    matches = [m.start() for m in re.finditer(re.escape(p), content)]
    print(f"Pattern '{p}': {len(matches)} matches")
    for idx in matches[:3]:
        start = max(0, idx - 150)
        end = min(len(content), idx + 250)
        print(f"--- MATCH {p} at {idx} ---")
        print(content[start:end])
        print("----------------------------")

# 2. Search for img tags
img_matches = [m.start() for m in re.finditer(r'<img[^>]+>', content)]
print(f"\nTotal <img> tags: {len(img_matches)}")
for idx in img_matches:
    tag = content[idx:content.find('>', idx)+1]
    if len(tag) > 200:
        print("Long img tag:", tag[:100], "...", tag[-40:])
    else:
        print("Img tag:", tag)
