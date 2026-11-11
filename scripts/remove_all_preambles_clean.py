import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import re

INDEX_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

orig_len = len(content)
print(f"Original length: {orig_len}")

replacements = [
    # 1. Header / Cockpit Tooltips
    ('title="رمز عائلة ماهر ❤️ أية (انقر للإعدادات وشعار العائلة)"', 'title="الإعدادات"'),
    ('title="انقر للمزامنة الشاملة وتحديث كود التطبيق والذهب والحسابات"', 'title="مزامنة وتحديث"'),
    ('title="مركز الضبط، إعدادات المظهر، والمزامنة السحابية"', 'title="الإعدادات"'),
    ('title="البحث الشامل في بيانات البرنامج بالكامل"', 'title="بحث"'),
    ('title="الرصيد الفعلي المتوفر في جميع المحافظ المالية (انقر لإدارة المحافظ)"', 'title="الرصيد الفعلي"'),
    ('title="إجمالي عمليات الدخل والإيداع (انقر للتسجيل أو عرض السجل)"', 'title="الإيداعات"'),
    ('title="إجمالي المصروفات الفعلية المسجلة (انقر لعرض سجل المصروفات المفلترة)"', 'title="المصروفات"'),
    ('title="كافة مصروفات العائلة (إجمالي عام لكافة البنود والأفراد)"', 'title="الكل"'),
    ('title="مصروفات وتكاليف البيت والأسرة المشتركة (إيجار، مياه، غاز، مستلزمات)"', 'title="البيت"'),
    ('title="انقر لتصفية المصاريف والفواتير القادمة"', 'title="فواتير قادمة"'),
    ('title="انقر لتصفية الديون المستحقة لنا"', 'title="ديون لنا"'),
    ('title="انقر لتصفية الديون المستحقة علينا"', 'title="ديون علينا"'),

    # 2. Settings Modal
    ('مصروفات العائلة &copy; 2026 - نظام مالي محاسبي عائلي متكامل', 'مصروفات العائلة &copy; 2026'),
    ('<div style="font-size: 0.65rem; color: #cbd5e1; font-weight: 700;">رمز الموزاييك الملكي المعتمد 👑</div>', ''),
    ('v4.0.0 • متزامن', 'v5.0.6 • متزامن'),
    ('<span class="version-badge">v4.9.5</span>', '<span class="version-badge">v5.0.6</span>'),

    # 3. Tasks Full Modal & New Task Modal
    ('<div style="font-size: 0.68rem; color: #c084fc; font-weight: 700;">مهام عيلة ماهر ❤️ أية ومتابعة الإنجاز والمسؤوليات</div>', ''),
    ('<div style="font-size: 1.02rem; font-weight: 900; color: #f8fafc;">قائمة المهام والمسؤوليات الذكية</div>', '<div style="font-size: 1.02rem; font-weight: 900; color: #f8fafc;">قائمة المهام</div>'),
    ('<div style="font-size: 0.74rem; color: #94a3b8; margin: 6px 0 16px;">استخدم شريط الإضافة السريعة أعلاه لتسجيل مهامك وخطواتك بلمسة زر</div>', ''),
    ('<span style="font-size: 0.65rem; color: #c084fc; font-weight: 700;">جدولة مواعيد، تنبيهات، وإرفاق صور</span>', ''),
    ('<div style="font-size: 0.64rem; color: #c084fc;">إدارة وتنظيم مهام العائلة وتذكيرات الالتزامات</div>', ''),
    ('<h3 style="margin: 0; font-size: 0.95rem; font-weight: 900; color: #f8fafc;">Microsoft To-Do | المهام اليومية</h3>', '<h3 style="margin: 0; font-size: 0.95rem; font-weight: 900; color: #f8fafc;">قائمة المهام</h3>'),

    # 4. Member Selection Modal (all occurrences)
    ('<span style="font-size: 0.65rem; color: #38bdf8; font-weight: 700;">انقر على الحساب للانتقال الفوري إليه</span>', ''),
    ('<div style="font-size: 0.66rem; color: #94a3b8; margin-top: 2px;">أدخل رمز PIN الخاص بهذا الحساب للتبديل إليه 🔒</div>', ''),

    # 5. Notifications Modal
    ('<div style="font-size: 0.64rem; color: #fbbf24;">تحديثات العمليات، المزامنة، وتذكيرات الاستحقاق</div>', ''),
    ('<h3 style="margin: 0; font-size: 0.95rem; font-weight: 900; color: #f8fafc;">مركز الإشعارات والتنبيهات الذكية</h3>', '<h3 style="margin: 0; font-size: 0.95rem; font-weight: 900; color: #f8fafc;">الإشعارات والتنبيهات</h3>'),

    # 6. Auth Modal
    ('<div style="font-size: 0.65rem; color: #94a3b8;">اختر حسابك وقم بإدخال رمز القفل الخاص بك للمتابعة</div>', ''),

    # 7. Google Drive Sync Modals
    ('<div style="font-size: 0.68rem; color: #34d399; font-weight: 700;">متصل ومحمي تلقائياً ☁️</div>', ''),
    ('<div class="activity-header-subtitle">تشغيل دائم مستقل 100% على هاتفك دون الاعتماد على GitHub</div>', ''),

    # 8. Activity Log Modal
    ('<div class="activity-header-subtitle">توثيق زمني فوري لكل حركات الإضافة، الخصم، التعديل والحذف</div>', ''),

    # 9. Global Search Modal
    ('<div style="font-size: 0.72rem; color: var(--text-muted);">ابحث فورياً في المصروفات، الإيرادات، الملاحظات، الطلبات، والديون</div>', ''),

    # 10. Notes Modal
    ('<div style="font-size: 0.72rem; color: var(--text-muted);">تسجيل الملاحظات العائلية المفتوحة وتوثيقها بتاريخها في الأرشيف</div>', ''),

    # 11. Theme Drawer Modal
    ('<div style="font-size: 0.68rem; color: #38bdf8; font-weight: 700;">اختر مظهر ولون خلفية البرنامج المفضل لك</div>', ''),

    # 12. Commitments / Debts Page
    ('<div style="font-size: 0.68rem; color: #94a3b8; font-weight: 600;">إدارة الديون والأقساط، وبناء الميزانيات التقديرية بديناميكية وربط متعدد بالأفراد</div>', ''),

    # 13. Income Choice Modal
    ('<div style="font-size: 0.72rem; color: #94a3b8;">استعراض كشف وسجل كافة الإيداعات السابقة بالتفصيل</div>', ''),

    # 14. Member Breakdown Left Drawer
    ('<span style="font-size: 0.62rem; color: #38bdf8;">(انقر على أي بند للانتقال لكشف حركاته)</span>', ''),

    # 15. Ledger Print Preview
    ('<p>دفتر الأستاذ وتدقيق مصروفات ودخل عائلة ماهر ❤️ أية</p>', ''),

    # 16. Transaction Modal
    ('عفواً، لا يتم قبول الإضافة الا بتسجيل بيان الحركة!', 'بيان الحركة مطلوب *'),
    ("'أنت الآن تسجل (دخل / إيداع وارد) - يضاف إلى الرصيد والمحفظة'", "'وارد / إيداع جديد إلى الرصيد'"),
    ("'أنت الآن تسجل (مصروف / خصم خارج) - يخصم من الرصيد والمحفظة'", "'مصروف / خصم جديد من الرصيد'"),
    ('<span id="txNatureText">أنت الآن تسجل (دخل / إيداع وارد) - يضاف إلى الرصيد والمحفظة</span>', '<span id="txNatureText">وارد / إيداع جديد</span>'),
]

for target, repl in replacements:
    c = content.count(target)
    if c > 0:
        content = content.replace(target, repl)
        print(f"[OK] Replaced ({c} times): {target[:60]}...")
    else:
        print(f"[WARN] Not found: {target[:60]}...")

# Clean multi-line blocks with regex:
# A. Notification Aya Reminder Box
notif_box_regex = r'<div style="background: rgba\(244, 114, 182, 0\.12\);.*?لا تنسي توثيق مصاريف.*?</div>\s*</div>'
if re.search(notif_box_regex, content, re.DOTALL):
    content = re.sub(notif_box_regex, '', content, flags=re.DOTALL)
    print("[OK] Removed Notification Aya Reminder Box")
else:
    print("[WARN] Notification Aya Reminder Box not found via regex")

# B. Theme Drawer Instruction Banner
theme_banner_regex = r'<div style="margin-bottom: 12px; padding: 7px 12px;.*?انقر على أي لون لتغيير خلفية التطبيق.*?</div>'
if re.search(theme_banner_regex, content, re.DOTALL):
    content = re.sub(theme_banner_regex, '', content, flags=re.DOTALL)
    print("[OK] Removed Theme Drawer Instruction Banner")
else:
    print("[WARN] Theme Drawer Instruction Banner not found via regex")

# C. Analytics Comparisons Subtitle
comp_sub_regex = r'<div style="font-size: 0\.72rem; color: #94a3b8; margin-top: 2px;">\s*كشف محاسبي دقيق على الانحرافات والفائض والعجز النقدي\s*</div>'
if re.search(comp_sub_regex, content, re.DOTALL):
    content = re.sub(comp_sub_regex, '', content, flags=re.DOTALL)
    print("[OK] Removed Analytics Comparisons Subtitle")
else:
    print("[WARN] Analytics Comparisons Subtitle not found via regex")

# D. SMS Modal Prompt
sms_prompt_regex = r'<p style="font-size: 0\.75rem; color: var\(--text-muted\);">\s*الصق رسالة البنك وسيقوم النظام.*?:\s*</p>'
if re.search(sms_prompt_regex, content, re.DOTALL):
    content = re.sub(sms_prompt_regex, '', content, flags=re.DOTALL)
    print("[OK] Removed SMS Modal Prompt")
else:
    print("[WARN] SMS Modal Prompt not found via regex")

# E. Actual Balance Audit Modal Subtitle
audit_sub_regex = r'<div style="font-size: 0\.68rem; color: #94a3b8; font-weight: 600;">\s*تحليل مصادر السيولة النقدية والمصرفية.*?</div>'
if re.search(audit_sub_regex, content, re.DOTALL):
    content = re.sub(audit_sub_regex, '', content, flags=re.DOTALL)
    print("[OK] Removed Actual Balance Audit Modal Subtitle")
else:
    print("[WARN] Actual Balance Audit Modal Subtitle not found via regex")

# F. Drive Sync Modal verbose descriptions
drive_card1_desc = r'<div class="drive-card-desc">\s*يقوم التطبيق بتجميع كافة المصروفات.*?</div>'
if re.search(drive_card1_desc, content, re.DOTALL):
    content = re.sub(drive_card1_desc, '', content, flags=re.DOTALL)
    print("[OK] Removed Drive Sync Modal Card 1 Desc")

drive_card2_desc = r'<div class="drive-card-desc">\s*اختر ملف النسخة الاحتياطية.*?</div>'
if re.search(drive_card2_desc, content, re.DOTALL):
    content = re.sub(drive_card2_desc, '', content, flags=re.DOTALL)
    print("[OK] Removed Drive Sync Modal Card 2 Desc")

drive_card3_desc = r'<div class="drive-card-desc">\s*• <strong>تثبيت كبرنامج أصلي على الهاتف.*?</div>'
if re.search(drive_card3_desc, content, re.DOTALL):
    content = re.sub(drive_card3_desc, '', content, flags=re.DOTALL)
    print("[OK] Removed Drive Sync Modal Card 3 Desc")

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"All preambles cleaned. New length: {len(content)} (diff: {len(content) - orig_len} chars)")
