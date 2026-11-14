import json, re, sys

sys.stdout.reconfigure(encoding='utf-8')
new_ver = "v5.2.5"
new_build = 202611081700

# 1. Update version.json
v_path = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\version.json"
with open(v_path, "r", encoding="utf-8") as f:
    v = json.load(f)

v["version"] = new_ver
v["buildId"] = new_build
v["updatedAt"] = "2026-11-08T17:00:00+03:00"
v["changelog"].insert(0, f"{new_ver}: إصلاح قمرة القيادة المالية بالأيقونات المتجهة عالية الوضوح SVG، إعادة هيكلة كروت الالتزامات ونقل عدد البنود أسفل اسم البند لمنع الاقتصاص، وتفعيل محرك الميزانيات التقديرية واستنساخ الخطط وربط البنود بأفراد الأسرة")

with open(v_path, "w", encoding="utf-8") as f:
    json.dump(v, f, ensure_ascii=False, indent=2)

print("✓ Updated version.json")

# 2. Update sw.js
sw_path = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\sw.js"
with open(sw_path, "r", encoding="utf-8") as f:
    sw = f.read()

sw = re.sub(r"const\s+CACHE_NAME\s*=\s*['\"][^'\"]+['\"]", f"const CACHE_NAME = 'family-monefy-{new_ver}';", sw)
with open(sw_path, "w", encoding="utf-8") as f:
    f.write(sw)

print("✓ Updated sw.js")

# 3. Update index.html
html_path = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html = f.read()

html = re.sub(r"const\s+APP_VERSION\s*=\s*['\"][^'\"]+['\"]", f"const APP_VERSION = '{new_ver}';", html)
html = re.sub(r"const\s+APP_BUILD_ID\s*=\s*\d+", f"const APP_BUILD_ID = {new_build};", html)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)

print("✓ Updated index.html with new APP_VERSION and APP_BUILD_ID")
