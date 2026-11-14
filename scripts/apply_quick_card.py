import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx_start = content.find('class="tasks-mobile-single-add-card"')
if idx_start == -1:
    print("Could not find tasks-mobile-single-add-card")
    sys.exit(1)

# Find <div before it
idx_div = content.rfind('<div', 0, idx_start)

# Find end of tasks-mobile-single-add-card
# It ends right before the filter pills <div style="display: flex; gap: 6px; overflow-x: auto;
idx_filter_pills = content.find('id="tasksCategoryFilterPills"', idx_start)
if idx_filter_pills == -1:
    idx_filter_pills = content.find('onclick="setTaskCategoryFilter(', idx_start)

idx_end = content.rfind('</div>', idx_start, idx_filter_pills)
idx_end = content.find('</div>', idx_end) + 6 # include closing div

print(f"Replacing tasks-mobile-single-add-card from {idx_div} to {idx_end} ({idx_end - idx_div} chars)")

new_card_html = """<div class="tasks-mobile-single-add-card" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(168, 85, 247, 0.45); border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);">
          <!-- السطر 1: عنوان المهمة + زر الإضافة -->
          <div style="display: flex; gap: 6px; align-items: center;">
            <input type="text" id="quickTaskTitleInput" placeholder="+ اكتب مهمة جديدة واضغط إضافة..." style="flex: 1; height: 40px; border-radius: 10px; background: rgba(15, 23, 42, 0.92); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 0.85rem; font-weight: 800; padding: 0 12px; outline: none; box-sizing: border-box;" onkeydown="if(event.key==='Enter') handleQuickTaskAdd()">
            <button type="button" onclick="handleQuickTaskAdd()" style="height: 40px; padding: 0 16px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.82rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 3px 12px rgba(168, 85, 247, 0.45); flex-shrink: 0;">
              <i class="fa-solid fa-plus"></i>
              <span>إضافة</span>
            </button>
          </div>

          <!-- السطر 2: تحديد اليوم والساعة جنباً إلى جنب في شاشة واحدة دون شرائح منبثقة أو خيارات مثبتة -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(168, 85, 247, 0.35); border-radius: 10px; padding: 6px 10px; display: flex; flex-direction: column; gap: 2px;">
              <label style="font-size: 0.65rem; color: #c084fc; font-weight: 850; display: flex; align-items: center; gap: 4px;">
                <i class="fa-regular fa-calendar"></i> اليوم والتاريخ:
              </label>
              <input type="date" id="quickTaskInlineDate" class="form-input-custom" style="width: 100%; height: 32px; border: none; background: transparent; color: #fff; font-size: 0.80rem; font-weight: 850; outline: none; padding: 0;">
            </div>
            <div style="background: rgba(15, 23, 42, 0.75); border: 1.2px solid rgba(56, 189, 248, 0.35); border-radius: 10px; padding: 6px 10px; display: flex; flex-direction: column; gap: 2px;">
              <label style="font-size: 0.65rem; color: #38bdf8; font-weight: 850; display: flex; align-items: center; gap: 4px;">
                <i class="fa-regular fa-clock"></i> توقيت الإشعار:
              </label>
              <input type="time" id="quickTaskInlineTime" class="form-input-custom" style="width: 100%; height: 32px; border: none; background: transparent; color: #fff; font-size: 0.80rem; font-weight: 850; outline: none; padding: 0;">
            </div>
          </div>

          <!-- السطر 3: مرفق الكاميرا المباشر فقط (بدون فتح ملفات) + معاينة الصورة -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
            <button type="button" onclick="triggerTaskCameraOnly()" style="height: 34px; padding: 0 12px; border-radius: 9px; background: rgba(56, 189, 248, 0.15); border: 1.2px solid rgba(56, 189, 248, 0.45); color: #38bdf8; font-size: 0.74rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(56, 189, 248, 0.2);">
              <i class="fa-solid fa-camera"></i>
              <span>تصوير مرفق بالكاميرا</span>
            </button>
            <input type="file" id="quickTaskCameraInput" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskCameraOnlyChosen(event)">
            <div id="quickTaskPhotoPreviewBar" style="display: none; align-items: center; gap: 6px;"></div>
          </div>
        </div>"""

content = content[:idx_div] + new_card_html + content[idx_end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("tasks-mobile-single-add-card replaced successfully!")
