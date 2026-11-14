import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

INDEX_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Clean Tasks Full Screen Header
old_header = """            <div style="font-size: 1.02rem; font-weight: 900; color: #f8fafc;">إدارة المهام والخطوات الذكية</div>
            <div style="font-size: 0.70rem; color: #c084fc; font-weight: 700;">مهام عيلة ماهر ❤️ أية ومتابعة الإنجاز والمسؤوليات</div>"""

new_header = """            <div style="font-size: 1.02rem; font-weight: 900; color: #f8fafc;">قائمة المهام</div>"""

if old_header in content:
    content = content.replace(old_header, new_header)
    print("[OK] Replaced Tasks Full Screen Header")
else:
    print("[WARN] old_header not found verbatim")

# 2. Clean empty state hint 1
hint1 = '<div style="font-size: 0.72rem; color: #94a3b8; margin: 6px 0 14px;">يمكنك إضافة مهمة جديدة وتحديد الموعد والتنبيهات الموحدة بخطوة واحدة</div>'
if hint1 in content:
    content = content.replace(hint1, '')
    print("[OK] Removed empty state hint 1")

# 3. Clean empty state hint 2
hint2 = '<div style="font-size: 0.68rem; color: #64748b; margin-top: 4px;">أضف مهمتك الأولى باستخدام الحقل أعلاه</div>'
if hint2 in content:
    content = content.replace(hint2, '')
    print("[OK] Removed empty state hint 2")

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done cleaning tasks extra preambles.")
