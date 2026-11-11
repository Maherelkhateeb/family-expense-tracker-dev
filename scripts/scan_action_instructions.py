import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's check all placeholders, subtitles, small tags, tooltips, and badges
# Find text inside <small>, <p>, <span> with words like:
# 'تنبيه', 'ملاحظة', 'قم بـ', 'يرجى', 'خطوة', 'انقر', 'اضغط', 'تتيح', 'يوفر', 'مخصص', 'يقوم', 'يمكنك'
trigger_words = ['قم بـ', 'يرجى', 'انقر', 'اضغط', 'تتيح لك', 'يوفر لك', 'يقوم بـ', 'يمكنك', 'لا تنسى', 'لا تنسي', 'تذكير']

for tw in trigger_words:
    matches = re.findall(rf'([^<>\n]{{0,30}}{tw}[^<>\n]{{0,60}})', text)
    if matches:
        print(f'=== Trigger: "{tw}" ({len(matches)} matches) ===')
        for m in set(matches[:8]):
            print(f'  • {m.strip()}')
