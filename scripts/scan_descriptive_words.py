import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's search for text nodes that start with:
# "إدارة "
# "تسجيل "
# "كشف "
# "مقارنة "
# "اختر "
# "الصق "
# "زر "
# "توزيع "
# "انقر "
# "يمكن "
# "تتيح "
# "يقوم "
# "توثيق "
words = ['إدارة', 'تسجيل', 'كشف', 'مقارنة', 'اختر', 'الصق', 'زر', 'انقر', 'يمكنك', 'يقوم', 'توثيق', 'توضيح', 'شرح', 'ملاحظة:']

for w in words:
    matches = re.findall(rf'(<(?:p|small|div|span)[^>]*>[^<]*?{w}[^<]*?</(?:p|small|div|span)>)', text)
    print(f'Word "{w}": {len(matches)} matches')
    for m in matches[:5]:
        clean = re.sub(r'<[^>]+>', '', m).strip()
        print(f'   -> {clean[:100]}')
