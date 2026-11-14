import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

repo_dir = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy"

new_version = "v5.2.6"
new_build_id = 202611081720
new_timestamp = "2026-11-08T17:20:00+03:00"

# 1. Update index.html
html_path = f"{repo_dir}\\index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Replace APP_VERSION and APP_BUILD_ID
import re
html_content = re.sub(r"var APP_VERSION = '[^']+';", f"var APP_VERSION = '{new_version}';", html_content)
html_content = re.sub(r"var APP_BUILD_ID = \d+;", f"var APP_BUILD_ID = {new_build_id};", html_content)
html_content = re.sub(r"window\.APP_VERSION = '[^']+';", f"window\.APP_VERSION = '{new_version}';", html_content)
html_content = re.sub(r"window\.APP_BUILD_ID = \d+;", f"window\.APP_BUILD_ID = {new_build_id};", html_content)
html_content = re.sub(r"const APP_VERSION = '[^']+';", f"const APP_VERSION = '{new_version}';", html_content)
html_content = re.sub(r"const APP_BUILD_ID = \d+;", f"const APP_BUILD_ID = {new_build_id};", html_content)

# Update version badges in HTML
html_content = html_content.replace('v5.2.5', new_version)
html_content = html_content.replace('v5.0.9', new_version)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"Updated index.html to {new_version} ({new_build_id})")

# 2. Update version.json
vjson_path = f"{repo_dir}\\version.json"
vdata = {
    "version": new_version,
    "buildId": new_build_id,
    "updatedAt": new_timestamp,
    "changelog": [
        f"{new_version}: تمكين التبديل بين شعارات العائلة الأربعة مع الحفظ الدائم",
        f"{new_version}: إصلاح خروج اسم المستخدم وشارة الحساب الحالي خارج حدود الكارت",
        f"{new_version}: إظهار مؤشر اختيار السمة بوضوح تام بعلامة صح وبادج مفعل وبوردر متوهج",
        f"{new_version}: تكيف ألوان الكروت الداخلية وشبكة المصروفات مع السمة المختارة",
        f"{new_version}: منع تجاوز الأرقام لحدود البطاقات وإزالة أي نقاط اختصار (...)"
    ]
}
with open(vjson_path, "w", encoding="utf-8") as f:
    json.dump(vdata, f, ensure_ascii=False, indent=2)
print(f"Updated version.json to {new_version} ({new_build_id})")

# 3. Update sw.js
sw_path = f"{repo_dir}\\sw.js"
with open(sw_path, "r", encoding="utf-8") as f:
    sw_content = f.read()

sw_content = re.sub(r'const CACHE_NAME = "family-expense-tracker-[^"]+";', f'const CACHE_NAME = "family-expense-tracker-{new_version}-{new_build_id}";', sw_content)

with open(sw_path, "w", encoding="utf-8") as f:
    f.write(sw_content)
print(f"Updated sw.js to CACHE_NAME family-expense-tracker-{new_version}-{new_build_id}")
