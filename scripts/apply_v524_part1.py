import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# -----------------------------------------------------------------------------
# 1. Remove the mosaic family image from the header
# -----------------------------------------------------------------------------
header_img_pattern = r'<div class="brand-clickable-wrap"[^>]*>.*?assets/family_option2_mosaic\.jpg.*?</div>\s*'
if re.search(header_img_pattern, html, re.DOTALL):
    html = re.sub(header_img_pattern, '', html, flags=re.DOTALL)
    print("✓ Successfully removed mosaic image from header")
else:
    # Also search for standalone img if wrap differs
    img_direct_pattern = r'<img\s+src="assets/family_option2_mosaic\.jpg"[^>]*id="headerBrandFamilyLogo"[^>]*>'
    if re.search(img_direct_pattern, html):
        html = re.sub(img_direct_pattern, '', html)
        print("✓ Successfully removed headerBrandFamilyLogo directly")

# -----------------------------------------------------------------------------
# 2. Modernize Tasks Add Section: Replace separate date/time inputs with Date & Time Trigger Button
# -----------------------------------------------------------------------------
old_task_add_pattern = r'<!-- السطر 2: تحديد اليوم والساعة جنباً إلى جنب.*?(?=<!-- أشرطة التصفية السريعة)'
new_task_add_snippet = '''<!-- السطر 2: زر تحديد التاريخ والساعة معاً (بلمسة واحدة) + زر تصوير مرفق الكاميرا المباشر -->
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn-quick-task-dt-trigger" id="btnQuickTaskDateTimeTrigger" onclick="openTaskDateTimePickerModal()" style="height: 36px; padding: 0 14px; border-radius: 10px; background: rgba(168, 85, 247, 0.22); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #e9d5ff; font-size: 0.78rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.25); transition: all 0.2s;">
              <i class="fa-regular fa-clock" style="color: #c084fc;"></i>
              <span id="lblQuickTaskDateTimeTrigger">📅 تحديد التاريخ والساعة معاً</span>
            </button>
            <button type="button" onclick="triggerTaskCameraOnly()" style="height: 36px; padding: 0 14px; border-radius: 10px; background: rgba(56, 189, 248, 0.18); border: 1.2px solid rgba(56, 189, 248, 0.5); color: #38bdf8; font-size: 0.78rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(56, 189, 248, 0.2);">
              <i class="fa-solid fa-camera"></i>
              <span>تصوير مرفق بالكاميرا</span>
            </button>
            <input type="file" id="quickTaskCameraInput" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskCameraOnlyChosen(event)">
            <div id="quickTaskPhotoPreviewBar" style="display: none; align-items: center; gap: 6px;"></div>
          </div>
        </div>

        '''

if re.search(old_task_add_pattern, html, re.DOTALL):
    html = re.sub(old_task_add_pattern, new_task_add_snippet, html, flags=re.DOTALL)
    print("✓ Successfully replaced static date/time with interactive Date & Time Trigger Button")
else:
    print("Notice: old_task_add_pattern didn't match directly, searching alternative bounds")
    start_str = '<div class="tasks-mobile-single-add-card"'
    end_str = 'id="tasksCategoryPillsStrip"'
    p_start = html.find(start_str)
    p_end = html.find(end_str)
    if p_start != -1 and p_end != -1:
        # find closing div before p_end
        div_end = html.rfind('</div>', p_start, p_end)
        html = html[:p_start] + '''<div class="tasks-mobile-single-add-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(168, 85, 247, 0.45); border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);">
          <!-- السطر 1: عنوان المهمة + زر الإضافة الفوري -->
          <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" id="quickTaskTitleInput" placeholder="+ اكتب مهمة جديدة واضغط إضافة..." style="flex: 1; height: 40px; border-radius: 10px; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 0.85rem; font-weight: 800; padding: 0 12px; outline: none; box-sizing: border-box;" onkeydown="if(event.key==='Enter') handleQuickTaskAdd()">
            <button type="button" onclick="handleQuickTaskAdd()" style="height: 40px; padding: 0 16px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.82rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.45); flex-shrink: 0;">
              <i class="fa-solid fa-plus"></i>
              <span>إضافة</span>
            </button>
          </div>

          <!-- السطر 2: زر تحديد التاريخ والساعة معاً + زر الكاميرا -->
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn-quick-task-dt-trigger" id="btnQuickTaskDateTimeTrigger" onclick="openTaskDateTimePickerModal()" style="height: 36px; padding: 0 14px; border-radius: 10px; background: rgba(168, 85, 247, 0.22); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #e9d5ff; font-size: 0.78rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.25); transition: all 0.2s;">
              <i class="fa-regular fa-clock" style="color: #c084fc;"></i>
              <span id="lblQuickTaskDateTimeTrigger">📅 تحديد التاريخ والساعة معاً</span>
            </button>
            <button type="button" onclick="triggerTaskCameraOnly()" style="height: 36px; padding: 0 14px; border-radius: 10px; background: rgba(56, 189, 248, 0.18); border: 1.2px solid rgba(56, 189, 248, 0.5); color: #38bdf8; font-size: 0.78rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(56, 189, 248, 0.2);">
              <i class="fa-solid fa-camera"></i>
              <span>تصوير مرفق بالكاميرا</span>
            </button>
            <input type="file" id="quickTaskCameraInput" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskCameraOnlyChosen(event)">
            <div id="quickTaskPhotoPreviewBar" style="display: none; align-items: center; gap: 6px;"></div>
          </div>
        </div>\n\n        ''' + html[html.rfind('<div', 0, p_end):]
        print("✓ Replaced task single add card via bounds")

# -----------------------------------------------------------------------------
# 3. Modernize Icon Theme Grid in Settings Modal (3 columns instead of 6)
# -----------------------------------------------------------------------------
html = html.replace('grid-template-columns: repeat(6, 1fr);', 'grid-template-columns: repeat(3, 1fr);')
print("✓ Adjusted icon-theme-pill grid to 3 columns")

# -----------------------------------------------------------------------------
# 4. Save intermediate html
# -----------------------------------------------------------------------------
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved HTML changes.")
