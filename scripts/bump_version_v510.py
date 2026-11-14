import json, re

# 1. Update version.json
ver_data = {
    "version": "v5.1.0",
    "build": "202611081240",
    "releaseDate": "2026-11-08",
    "notes": "Replication of Google Play To-Do List & Schedule Planner App: interactive calendar view, category carousel, datetime picker with quick time shortcuts, subtasks checklist, productivity KPIs, and sleek commitments page overhaul."
}
with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(ver_data, f, ensure_ascii=False, indent=2)
print("Updated version.json to v5.1.0")

# 2. Update sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw_code = f.read()
sw_code = re.sub(r'family-expense-tracker-v[\d\.\-]+', 'family-expense-tracker-v5.1.0-202611081240', sw_code)
with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw_code)
print("Updated sw.js cache name")

# 3. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = re.sub(r'<span class="version-badge">v5\.0\.\d+</span>', '<span class="version-badge">v5.1.0</span>', html)
html = re.sub(r'v5\.0\.\d+\s*(?:مُحدث|تحديث|أحدث)', 'v5.1.0 مُحدث', html)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html to v5.1.0")
