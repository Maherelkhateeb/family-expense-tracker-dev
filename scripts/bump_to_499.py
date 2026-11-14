import sys, json, re
sys.stdout.reconfigure(encoding='utf-8')

new_ver = '4.9.9'
new_build = 202611071745

# 1. version.json
v_path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\version.json'
v_data = {
    'version': new_ver,
    'buildId': new_build,
    'updatedAt': '2026-11-07T17:45:00+03:00',
    'releaseNotes': 'فصل إضافة المهمة في زر منفصل ونافذة فاخرة مخصصة، إتاحة المساحة الكاملة لقائمة المهام والخطوات الفرعية، تسريع دورة الفحص التلقائي للتحديثات إلى 15 ثانية لضمان ظهور التحديثات على الهاتف فوراً'
}
with open(v_path, 'w', encoding='utf-8') as f:
    json.dump(v_data, f, ensure_ascii=False, indent=2)

# 2. sw.js
sw_path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\sw.js'
with open(sw_path, 'r', encoding='utf-8') as f:
    sw_code = f.read()
sw_code = re.sub(r'const CACHE_NAME = [^;]+;', f'const CACHE_NAME = "family-expense-tracker-v{new_ver}-{new_build}";', sw_code)
with open(sw_path, 'w', encoding='utf-8') as f:
    f.write(sw_code)

# 3. index.html version references
idx_path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(idx_path, 'r', encoding='utf-8') as f:
    idx_code = f.read()
idx_code = re.sub(r"APP_VERSION = '[^']+'", f"APP_VERSION = '{new_ver}'", idx_code)
idx_code = re.sub(r"APP_BUILD_ID = \d+", f"APP_BUILD_ID = {new_build}", idx_code)
with open(idx_path, 'w', encoding='utf-8') as f:
    f.write(idx_code)

print(f'Bumped version to {new_ver} Build {new_build} successfully!')
