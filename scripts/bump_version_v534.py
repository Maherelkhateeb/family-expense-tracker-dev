import json, sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update version.json
v_data = {
  "version": "v5.3.4",
  "buildId": "202611091255",
  "updatedAt": "2026-11-09T12:55:00+03:00",
  "changelog": [
    "v5.3.4: إصلاح محرك خلفيات وسمات التطبيق (15 سمة) بتدرجات شعاعية نابضة وتأقلم فوري كامل لنافذة الضبط وواجهة النظام بدون حجب",
    "v5.3.4: ترقية محرك ألوان ونمط الأيقونات (12 باليت) ليتفاعل فورياً مع فقاعات الأقسام بالكامل باللون المتوهج والإطار والظل المجسم",
    "v5.3.4: تفعيل تمييز أزرار باليتات الأيقونات داخل نافذة الضبط بإطار وظل لوني مطابق لكل باليت مع تحديث الشارة اللحظية",
    "v5.3.4: توسيع بطاقات المصروفات THEME_CARD_PALETTES لتشمل كافة السمات الـ 15 (بما فيها أزرق ليلي، عنبر، قرمزي، غابة، كربون، ياقوت)"
  ],
  "notes": "v5.3.4: تفعيل كامل للسمات الـ 15 وباليتات الأيقونات الـ 12 مع تأثير بصري فوري شامل وتجربة استخدام استثنائية"
}

with open('version.json', 'w', encoding='utf-8') as f:
    json.dump(v_data, f, ensure_ascii=False, indent=2)
print("Updated version.json to v5.3.4")

# 2. Update sw.js
with open('sw.js', 'r', encoding='utf-8') as f:
    sw_text = f.read()

sw_text = sw_text.replace("const CACHE_NAME = \"family-finance-v5.3.3-202611091135\";", "const CACHE_NAME = \"family-finance-v5.3.4-202611091255\";")
with open('sw.js', 'w', encoding='utf-8') as f:
    f.write(sw_text)
print("Updated sw.js to v5.3.4")

# 3. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    idx_text = f.read()

idx_text = idx_text.replace("v5.3.3", "v5.3.4")
idx_text = idx_text.replace("202611091135", "202611091255")
idx_text = idx_text.replace("202611091145", "202611091255")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx_text)
print("Updated index.html to v5.3.4")
