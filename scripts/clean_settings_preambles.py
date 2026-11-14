import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import re

INDEX_PATH = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

print("Original length:", len(content))

# -------------------------------------------------------------------------
# 1. Clean Up Preambles in Settings Modal
# -------------------------------------------------------------------------
# 1.1 Remove subtitle "المزامنة اللحظية، التخصيص البصري، وإدارة البيانات"
content = content.replace(
    '<div style="font-size: 0.65rem; color: #94a3b8; font-weight: 600;">المزامنة اللحظية، التخصيص البصري، وإدارة البيانات</div>',
    ''
)

# 1.2 Replace bulky blue button "⚖️ موازنة وتدقيق كافة المحافظ والأرصدة فوراً" with sleek button
old_audit_btn = """        <!-- 1. زر موازنة وتدقيق كافة الأرصدة والمحافظ فوراً (في الأعلى بدون ديباجة كتابية) -->
        <button type="button" onclick="runInstantSettingsAudit()" style="width: 100%; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #0284c7 0%, #0284c7 50%, #0ea5e9 100%); border: none; color: #fff; font-size: 0.88rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.40); margin: 2px 0 6px; transition: transform 0.12s ease;">
          <i class="fa-solid fa-scale-balanced" style="font-size: 1.1rem; color: #e0f2fe;"></i>
          <span>⚖️ موازنة وتدقيق كافة المحافظ والأرصدة فوراً</span>
        </button>"""

new_audit_btn = """        <!-- زر موازنة وتدقيق الأرصدة والمحافظ -->
        <button type="button" onclick="runInstantSettingsAudit()" style="width: 100%; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #0284c7, #0ea5e9); border: none; color: #fff; font-size: 0.82rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 10px rgba(2, 132, 199, 0.35); margin: 2px 0 6px;">
          <i class="fa-solid fa-scale-balanced" style="font-size: 0.95rem;"></i>
          <span>موازنة وتدقيق الأرصدة والمحافظ</span>
        </button>"""

if old_audit_btn in content:
    content = content.replace(old_audit_btn, new_audit_btn)
    print("[OK] Replaced audit button in settings")
else:
    print("[WARN] old_audit_btn not matched verbatim, using regex")
    content = re.sub(
        r'<button type="button" onclick="runInstantSettingsAudit\(\)"[^>]*>.*?<span>.*?موازنة وتدقيق.*?</span>.*?</button>',
        new_audit_btn,
        content,
        flags=re.DOTALL
    )

# 1.3 Remove "انقر هنا لفتح شاشة التبديل بين أفراد الأسرة 👥"
content = content.replace(
    '<div style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">انقر هنا لفتح شاشة التبديل بين أفراد الأسرة 👥</div>',
    '<div style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">أفراد الأسرة 👥</div>'
)

# 1.4 Clean up sync block: remove explanatory preamble & long button text
old_sync_block = """          <!-- زر المزامنة والتحديث الشامل الموحد (الكل في واحد بنقرة واحدة) -->
          <div style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.20), rgba(16, 185, 129, 0.20)); border: 1.5px solid rgba(56, 189, 248, 0.50); border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-arrows-rotate master-sync-icon-spin" id="settingsMasterSyncSpinIcon" style="color: #38bdf8; font-size: 1.1rem;"></i>
                <span style="font-weight: 900; font-size: 0.88rem; color: #f8fafc;">المزامنة والتحديث الشامل (الكل في واحد)</span>
              </div>
              <span id="settingsMasterSyncStatusBadge" style="font-size: 0.65rem; color: #34d399; font-weight: 800; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); padding: 2px 7px; border-radius: 6px;">مكتمل وجاهز</span>
            </div>
            <div style="font-size: 0.72rem; color: #94a3b8; line-height: 1.4;">
              زر موحد وذكي يقوم بكل شيء بنقرة واحدة: مزامنة بيانات Google Drive، سحب أحدث أسعار الذهب والعملات، وتنزيل وتطبيق أحدث كود للتطبيق وتطهير الكاش فوراً.
            </div>
            <button type="button" class="btn-submit-tx btn-master-sync-all" onclick="executeMasterUnifiedSyncAndRefresh(true)" style="margin: 4px 0 0; height: 44px; background: linear-gradient(135deg, #0284c7 0%, #10b981 100%); border: none; border-radius: 10px; font-weight: 900; font-size: 0.86rem; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.40); transition: all 0.2s ease;">
              <i class="fa-solid fa-arrows-rotate master-sync-icon-spin"></i>
              <span>تحديث ومزامنة شاملة لكل شيء الآن (زر واحد) 🚀</span>
            </button>
          </div>"""

new_sync_block = """          <!-- زر المزامنة والتحديث الشامل -->
          <div style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.18), rgba(16, 185, 129, 0.18)); border: 1.2px solid rgba(56, 189, 248, 0.40); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-cloud-bolt" id="settingsMasterSyncSpinIcon" style="color: #38bdf8; font-size: 1.05rem;"></i>
                <span style="font-weight: 900; font-size: 0.84rem; color: #f8fafc;">المزامنة السحابية والتحديث</span>
              </div>
              <span id="settingsMasterSyncStatusBadge" style="font-size: 0.65rem; color: #34d399; font-weight: 800; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); padding: 2px 7px; border-radius: 6px;">متزامن ✓</span>
            </div>
            <button type="button" class="btn-submit-tx btn-master-sync-all" onclick="executeMasterUnifiedSyncAndRefresh(true)" style="height: 40px; background: linear-gradient(135deg, #0284c7 0%, #10b981 100%); border: none; border-radius: 10px; font-weight: 900; font-size: 0.84rem; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35); transition: all 0.2s ease;">
              <i class="fa-solid fa-arrows-rotate master-sync-icon-spin"></i>
              <span>تحديث ومزامنة فورية 🚀</span>
            </button>
          </div>"""

if old_sync_block in content:
    content = content.replace(old_sync_block, new_sync_block)
    print("[OK] Replaced sync block in settings")
else:
    print("[WARN] old_sync_block not matched verbatim, using regex")
    content = re.sub(
        r'<!-- زر المزامنة والتحديث الشامل.*?<button type="button" class="btn-submit-tx btn-master-sync-all".*?<span>.*?تحديث ومزامنة.*?</span>.*?</button>\s*</div>',
        new_sync_block,
        content,
        flags=re.DOTALL
    )

# 1.5 Remove purple banner "لوحة معاينة واختيار خلفيات التطبيق (9 ألوان وخلفيات) 🎨"
old_purple_banner = """            <!-- زر فتح لوحة منتقي الخلفيات الموسعة الملونة -->
            <button type="button" class="btn-submit-tx" onclick="openThemeDrawer()" style="height: 38px; background: linear-gradient(135deg, #a855f7, #7c3aed); font-size: 0.82rem; font-weight: 900; border-radius: 10px; margin-bottom: 8px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.35); cursor: pointer; color: #fff;">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              <span>لوحة معاينة واختيار خلفيات التطبيق (9 ألوان وخلفيات) 🎨</span>
            </button>"""

if old_purple_banner in content:
    content = content.replace(old_purple_banner, "")
    print("[OK] Removed purple theme banner in settings")
else:
    print("[WARN] old_purple_banner not matched verbatim, using regex")
    content = re.sub(
        r'<button type="button" class="btn-submit-tx" onclick="openThemeDrawer\(\)".*?<span>لوحة معاينة واختيار خلفيات التطبيق.*?</span>\s*</button>',
        "",
        content,
        flags=re.DOTALL
    )

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("Settings preambles cleaned successfully. New length:", len(content))
