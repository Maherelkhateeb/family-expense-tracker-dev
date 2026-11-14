import json
import re

new_ver = 'v5.2.2'
new_cache = f'family-expense-tracker-{new_ver}-202611081435'
timestamp = '2026-11-08T14:35:00+03:00'

# 1. Update version.json
ver_data = {
    "version": new_ver,
    "updatedAt": timestamp,
    "changelog": [
        "v5.2.2: Commitments page restructured into two clean top sections: [ الفواتير والديون ] & [ الميزانيات ]",
        "v5.2.2: Under Bills & Debts: Comprehensive KPI summary, 5-segment filter pills (الكل, فواتير, ديون علينا, ديون لنا, مسددة), and unified add form",
        "v5.2.2: Under Budgets: Full monthly budget plan management, planned vs actual KPIs, and category/member budget tracking",
        "v5.2.2: Mobile Tasks single-screen inline add with independent date and time rows preventing any digit overlap",
        "v5.2.2: Removed 'قائمة المهام والتخطيط اليومي' from tasks header for clean mobile layout",
        "v5.2.2: Complete icon palette engine across all 6 themes (ملون, ذهبي, زمردي, سماوي, ياقوتي, بلاتيني)",
        "v5.2.2: Complete typography engine applying all 6 fonts (Alexandria, Cairo, IBM Plex, Almarai, Readex Pro, Tajawal) across the entire UI",
        "v5.2.2: Eliminated generic 'بيان' label in operations list, displaying actual category and member statement"
    ]
}

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(ver_data, f, ensure_ascii=False, indent=2)

print("Updated version.json.")

# 2. Update sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw_content = f.read()

sw_content = re.sub(r'const\s+CACHE_NAME\s*=\s*[\'"][^\'"]+[\'"]', f"const CACHE_NAME = '{new_cache}'", sw_content)
with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw_content)

print("Updated sw.js.")

# 3. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

html_content = re.sub(r'family_expense_tracker_version\s*=\s*[\'"][^\'"]+[\'"]', f"family_expense_tracker_version = '{new_ver}'", html_content)
html_content = re.sub(r'APP_VERSION\s*=\s*[\'"][^\'"]+[\'"]', f"APP_VERSION = '{new_ver}'", html_content)
html_content = re.sub(r'version:\s*[\'"][^\'"]+[\'"]', f"version: '{new_ver}'", html_content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Updated index.html to {new_ver}.")
