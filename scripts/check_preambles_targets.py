import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import re

INDEX_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

checks = [
    ("Header title settings", 'title="رمز عائلة ماهر ❤️ أية (انقر للإعدادات وشعار العائلة)"'),
    ("Header title master sync", 'title="انقر للمزامنة الشاملة وتحديث كود التطبيق والذهب والحسابات"'),
    ("Header title main settings", 'title="مركز الضبط، إعدادات المظهر، والمزامنة السحابية"'),
    ("Header title search", 'title="البحث الشامل في بيانات البرنامج بالكامل"'),
    ("Cockpit title balance", 'title="الرصيد الفعلي المتوفر في جميع المحافظ المالية (انقر لإدارة المحافظ)"'),
    ("Cockpit title income", 'title="إجمالي عمليات الدخل والإيداع (انقر للتسجيل أو عرض السجل)"'),
    ("Cockpit title expense", 'title="إجمالي المصروفات الفعلية المسجلة (انقر لعرض سجل المصروفات المفلترة)"'),
    ("Settings footer", 'مصروفات العائلة &copy; 2026 - نظام مالي محاسبي عائلي متكامل'),
    ("Settings mosaic tag", 'رمز الموزاييك الملكي المعتمد 👑'),
    ("Tasks full modal subtitle", 'مهام عيلة ماهر ❤️ أية ومتابعة الإنجاز والمسؤوليات'),
    ("Tasks quick enter hint", 'استخدم شريط الإضافة السريعة أعلاه لتسجيل مهامك وخطواتك بلمسة زر'),
    ("New task subtitle", 'جدولة مواعيد، تنبيهات، وإرفاق صور'),
    ("Legacy task subtitle", 'إدارة وتنظيم مهام العائلة وتذكيرات الالتزامات'),
    ("Full user select subtitle", 'انقر على الحساب للانتقال الفوري إليه'),
    ("Full user pin subtitle", 'أدخل رمز PIN الخاص بهذا الحساب للتبديل إليه 🔒'),
    ("Notifications subtitle", 'تحديثات العمليات، المزامنة، وتذكيرات الاستحقاق'),
    ("Notifications reminder Aya", 'لا تنسي توثيق مصاريف ومشتريات اليوم أولاً بأول للحفاظ على دقة الميزانية ❤️'),
    ("Auth modal subtitle", 'اختر حسابك وقم بإدخال رمز القفل الخاص بك للمتابعة'),
    ("Google drive modal subtitle", 'متصل ومحمي تلقائياً ☁️'),
    ("Drive sync modal subtitle", 'تشغيل دائم مستقل 100% على هاتفك دون الاعتماد على GitHub'),
    ("Activity modal subtitle", 'توثيق زمني فوري لكل حركات الإضافة، الخصم، التعديل والحذف'),
    ("Global search subtitle", 'ابحث فورياً في المصروفات، الإيرادات، الملاحظات، الطلبات، والديون'),
    ("Notes modal subtitle", 'تسجيل الملاحظات العائلية المفتوحة وتوثيقها بتاريخها في الأرشيف'),
    ("Theme modal subtitle", 'اختر مظهر ولون خلفية البرنامج المفضل لك'),
    ("Theme modal banner", 'انقر على أي لون لتغيير خلفية التطبيق فورياً وحفظ اختيارك'),
    ("Commitments subtitle", 'إدارة الديون والأقساط، وبناء الميزانيات التقديرية بديناميكية وربط متعدد بالأفراد'),
    ("Comparisons subtitle", 'كشف محاسبي دقيق على الانحرافات والفائض والعجز النقدي'),
    ("SMS modal text", 'الصق رسالة البنك وسيقوم النظام باستخراج المبلغ والجهة فوراً وتوثيقها:'),
    ("Income choice subtitle", 'استعراض كشف وسجل كافة الإيداعات السابقة بالتفصيل'),
    ("Drawer category click hint", '(انقر على أي بند للانتقال لكشف حركاته)'),
    ("Tx label error long", 'عفواً، لا يتم قبول الإضافة الا بتسجيل بيان الحركة!'),
]

for label, needle in checks:
    count = content.count(needle)
    print(f"[{'OK' if count > 0 else 'MISS'}] {label} (count: {count})")
