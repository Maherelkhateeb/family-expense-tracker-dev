import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

phrases_to_find = [
    'إدارة الديون والأقساط',
    'الصق رسالة البنك',
    'انقر على أي لون',
    'استخدم شريط الإضافة السريعة',
    'لا تنسي توثيق مصاريف',
    'تم تدقيق ومطابقة هذا الكشف آلياً',
    'استعراض كشف وسجل كافة الإيداعات',
    'كشف وتدقيق مصدر الرصيد الفعلي',
    '(انقر على أي بند للانتقال لكشف حركاته)',
    'كشف محاسبي دقيق على الانحرافات',
    'اختر مظهر ولون خلفية البرنامج',
    'دفتر الأستاذ وتدقيق مصروفات ودخل'
]

for p in phrases_to_find:
    idx = text.find(p)
    if idx != -1:
        start = max(0, idx - 150)
        end = min(len(text), idx + 250)
        print(f'=== PHRASE: {p} ===')
        print(text[start:end])
        print('-'*50)
    else:
        print(f'=== NOT FOUND: {p} ===')
