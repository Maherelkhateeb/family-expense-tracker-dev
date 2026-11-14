# scripts/bump_v528.py
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

new_version = "v5.2.8"
new_build = 202611081805
iso_date = "2026-11-08T18:05:00+03:00"

# 1. Update version.json
v_data = {
    "version": new_version,
    "buildId": new_build,
    "updatedAt": iso_date,
    "changelog": [
        "v5.2.8: زر جديد مخصص لإضافة مهمة بجانب زر المهام في الهيدر وبجانب مؤشرات الإنتاجية",
        "v5.2.8: إخفاء نموذج إضافة مهمة افتراضياً ليظهر فقط عند الضغط على زر إضافة مهمة",
        "v5.2.8: دعم خياري التصوير بالكاميرا واختيار صورة من الاستوديو للمهمة الرئيسية والمهام الفرعية",
        "v5.2.8: إعادة تنظيم وتنسيق صفحة المهام بالكامل من الصفر بتصميم FinTech فاخر ونظيف",
        "v5.2.8: ضبط أزرار الهيدر ومنع تداخل أو انضغاط زر الضبط على جميع شاشات الموبايل"
    ]
}

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(v_data, f, ensure_ascii=False, indent=2)
print("✓ version.json updated to v5.2.8")

# 2. Update sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw_code = f.read()

sw_code = re.sub(r'const\s+CACHE_NAME\s*=\s*[\'"][^\'"]+[\'"]', f"const CACHE_NAME = 'family-finance-{new_version}-{new_build}'", sw_code)
sw_code = re.sub(r'const\s+APP_VERSION\s*=\s*[\'"][^\'"]+[\'"]', f"const APP_VERSION = '{new_version}'", sw_code)

with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw_code)
print("✓ sw.js updated with new cache name")

# 3. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = re.sub(r'APP_VERSION\s*=\s*[\'"][^\'"]+[\'"]', f"APP_VERSION = '{new_version}'", html)
html = re.sub(r'BUILD_ID\s*=\s*[\'"][^\'"]+[\'"]', f"BUILD_ID = '{new_build}'", html)
html = html.replace('202611081740', str(new_build))
html = html.replace('202611081730', str(new_build))
html = html.replace('v5.2.7', new_version)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("✓ index.html updated with v5.2.8 and build id")
