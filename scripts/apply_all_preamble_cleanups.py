import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

INDEX_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

orig_len = len(content)
print(f"Original length: {orig_len}")

exact_replacements = [
    # 1. Header & Cockpit Tooltips
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

    # 17. Multi-line Blocks Exact Strings
    ("""              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">
                كشف محاسبي دقيق على الانحرافات والفائض والعجز النقدي
              </div>""", ''),

    ("""        <p style="font-size: 0.75rem; color: var(--text-muted);">
          الصق رسالة البنك وسيقوم النظام باستخراج المبلغ والجهة فوراً وتوثيقها:
        </p>""", ''),

    ("""        <!-- شريط توضيحي -->
        <div style="font-size: 0.72rem; color: #94a3b8; background: rgba(15, 23, 42, 0.6); padding: 6px 10px; border-radius: 8px; margin-bottom: 12px; border: 1px dashed rgba(56, 189, 248, 0.3); display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-wand-magic-sparkles" style="color: #fbbf24;"></i>
          <span>انقر على أي لون لتغيير خلفية التطبيق فورياً وحفظ اختيارك</span>
        </div>""", ''),

    ("""      <!-- تنبيه ذكي خاص لأية -->
      <div id="notifAyaReminderBanner" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(15, 23, 42, 0.85)); border: 1px solid rgba(236, 72, 153, 0.4); border-radius: 12px; padding: 8px 12px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.1rem;">🌸</span>
        <div style="flex: 1;">
          <div style="font-size: 0.72rem; font-weight: 900; color: #f472b6;">تذكير يومي لطيف لأية:</div>
          <div style="font-size: 0.65rem; color: #e2e8f0;">لا تنسي توثيق مصاريف ومشتريات اليوم أولاً بأول للحفاظ على دقة الميزانية ❤️</div>
        </div>
      </div>""", ''),

    ("""            <div style="font-size: 0.68rem; color: #94a3b8; font-weight: 600;">
              تحليل مصادر السيولة النقدية والمصرفية، مطابقة الإيداعات والصرف، وفلترة تفصيلية متعددة الأبعاد
            </div>""", ''),

    ("""            <div class="drive-card-desc">
              يقوم التطبيق بتجميع كافة المصروفات، المداخيل، المحافظ، وسجل النشاطات في ملف احتياطي مشفر. على هاتفك المحمول، سيفتح لك خيار "حفظ في Google Drive" مباشرة!
            </div>""", ''),

    ("""            <div class="drive-card-desc">
              اختر ملف النسخة الاحتياطية (.json) المحفوظ على Google Drive أو ذاكرة جهازك لاستعادة كافة الحركات في ثانية واحدة.
            </div>""", ''),

    ("""            <div class="drive-card-desc">
              • <strong>تثبيت كبرنامج أصلي على الهاتف:</strong> افتح قائمة المتصفح واضغط <strong>"الإضافة إلى الشاشة الرئيسية (Add to Home Screen)"</strong> ليعمل معك كتطبيق هاتف مستقل بدون إنترنت وبدون شريط عنوان.<br>
              • <strong>تحميل نسخة HTML مستقلة:</strong> يمكنك تحميل ملف التطبيق كاملاً وافتحه في أي وقت بدون إنترنت.
            </div>""", '')
]

success_count = 0
for target, repl in exact_replacements:
    # Normalize CRLF / LF for comparison
    target_clean = target.replace('\r\n', '\n')
    if target in content:
        content = content.replace(target, repl)
        success_count += 1
        print(f"[OK] Replaced exact: {target[:40]}...")
    elif target_clean in content:
        content = content.replace(target_clean, repl)
        success_count += 1
        print(f"[OK] Replaced (normalized LF): {target_clean[:40]}...")
    else:
        print(f"[WARN] Not found: {target[:50]}...")

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nCompleted {success_count}/{len(exact_replacements)} replacements.")
print(f"New length: {len(content)} (Diff: {len(content) - orig_len} characters)")
