import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

search_phrases = [
    'يقوم التطبيق بتجميع',
    'تشغيل دائم مستقل',
    'توثيق زمني فوري',
    'اختر ملف النسخة الاحتياطية',
    'تثبيت كبرنامج أصلي',
    'رمز الموزاييك الملكي',
    'دفتر الأستاذ وتدقيق',
    'إدارة وتنظيم مهام العائلة',
    'تحديثات العمليات، المزامنة',
    'انقر على الحساب للانتقال',
    'ابحث فورياً في المصروفات',
    'جدولة مواعيد، تنبيهات',
    'تسجيل الملاحظات العائلية المفتوحة',
    'اختر مظهر ولون خلفية البرنامج',
    'أنت الآن تسجل (دخل / إيداع وارد)',
    'الصق رسالة البنك وسيقوم النظام',
    'مصروفات العائلة © 2026 - نظام مالي محاسبي عائلي متكامل'
]

for phrase in search_phrases:
    found = False
    for i, line in enumerate(lines):
        if phrase in line:
            print(f'Line {i+1}: {phrase} -> {line.strip()[:100]}')
            found = True
    if not found:
        print(f'NOT FOUND: {phrase}')
