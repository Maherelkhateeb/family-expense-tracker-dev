# -*- coding: utf-8 -*-
import re

FILE_HTML = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html"
FILE_SW = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\sw.js"
FILE_VER = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\version.json"

# 1. Update index.html
with open(FILE_HTML, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('v5.2.7', 'v5.2.8')
html = html.replace('202611081730', '202611081755')

with open(FILE_HTML, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html to v5.2.8")

# 2. Update sw.js
with open(FILE_SW, 'r', encoding='utf-8') as f:
    sw = f.read()

sw = re.sub(r'const CACHE_NAME = "[^"]+";', 'const CACHE_NAME = "family-expense-tracker-v5.2.8-202611081755";', sw)

with open(FILE_SW, 'w', encoding='utf-8') as f:
    f.write(sw)
print("Updated sw.js to v5.2.8")

# 3. Update version.json
ver_json = '''{
  "version": "v5.2.8",
  "buildId": 202611081755,
  "updatedAt": "2026-11-08T17:55:00+03:00",
  "changelog": [
    "v5.2.8: حل ومعالجة شاملة لكافة الأزرار والنوافذ المعلقة (54 دالة جديدة)",
    "v5.2.8: تفعيل نافذة تعديل العمليات وحفظ التعديلات في السجلات والأرصدة (editTx)",
    "v5.2.8: تفعيل مركز الإشعارات وتحديد المقروء ومطابقة الحسابات",
    "v5.2.8: تشغيل نافذة مراجعة الرصيد الفعلي وتدقيق الحسابات بالكامل وتصدير الكشف",
    "v5.2.8: تشغيل التحويل الفوري بين المحافظ وطباعة وتصدير كشف حساب المحفظة",
    "v5.2.8: تفعيل التحقق من رمز PIN لأفراد العائلة عند التبديل بين الحسابات",
    "v5.2.8: ربط كاميرا ومرفقات المهام الفرعية والمهام الرئيسية بدقة",
    "v5.2.8: تفعيل أزرار النسخ الاحتياطي التلقائي ومزامنة Google Drive وتنزيل JSON"
  ]
}
'''

with open(FILE_VER, 'w', encoding='utf-8') as f:
    f.write(ver_json)
print("Updated version.json to v5.2.8")
