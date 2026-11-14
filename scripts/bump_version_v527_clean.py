# scripts/bump_version_v527_clean.py
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

new_version = "v5.2.7"
new_build = 202611081740
iso_date = "2026-11-08T17:40:00+03:00"

# 1. Update version.json
v_data = {
    "version": new_version,
    "buildId": new_build,
    "updatedAt": iso_date,
    "changelog": [
        "v5.2.7: دمج شاشة تسجيل المهمة وإضافة التاجات والتاريخ والساعة معاً من نفس الشاشة",
        "v5.2.7: إضافة شريط التاجات التفاعلي الفوري (يومي، عامة، مجدولة، هامة، مشتريات، منزلية، فواتير، صحة، عمل)",
        "v5.2.7: محدد التاريخ والساعة المباشر من نفس الصفحة مع اختصارات ذكية بدون نوافذ منبثقة",
        "v5.2.7: إظهار شارات التاجات الملونة على جميع كروت المهام المسجلة",
        "v5.2.7: تعيين فرد العائلة المسؤول وإرفاق الصور بالكاميرا مباشرة مع حفظ فوري"
    ]
}

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(v_data, f, ensure_ascii=False, indent=2)
print("✓ version.json updated to v5.2.7")

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
html = re.sub(r'sw\.js\?v=[^\'"]+', f"sw.js?v={new_version}-{new_build}", html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("✓ index.html updated with version constants")
