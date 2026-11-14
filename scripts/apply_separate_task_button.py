import re

filepath = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update drawerTasksViewSection to replace the inline box with the separate button
old_section = '''      <!-- صندوق إضافة مهمة جديدة احترافي مع اختيار موعد ووقت موحد وصور وتصنيفات -->
      <div style="background: rgba(15, 23, 42, 0.88); border: 1.2px solid rgba(168, 85, 247, 0.4); border-radius: 14px; padding: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 0.74rem; font-weight: 900; color: #f8fafc; display: flex; align-items: center; gap: 5px;">
            <i class="fa-solid fa-circle-plus" style="color: #a855f7;"></i> إضافة مهمة ذكية جديدة
          </span>
          <span style="font-size: 0.62rem; color: #c084fc; font-weight: 700;">تنبيه آلي بالموعد ⏰</span>
        </div>

        <!-- 1. بيان وعنوان المهمة -->
        <div style="margin-bottom: 8px;">
          <input type="text" id="drawerNewTaskTitleInput" placeholder="اكتب عنوان المهمة أو الالتزام... (مثال: سداد قسط المدرسة)" style="width: 100%; height: 38px; border-radius: 9px; background: rgba(30, 41, 59, 0.85); border: 1.2px solid rgba(168, 85, 247, 0.35); color: #fff; font-size: 0.80rem; font-weight: 800; padding: 0 10px; outline: none; box-sizing: border-box;">
        </div>

        <!-- 2. سطر تحديد التاريخ والوقت في نفس الاختيار (Unified DateTime Selection) -->
        <div style="margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="position: relative; flex: 1;">
              <span style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 0.76rem; color: #a855f7; pointer-events: none;">
                <i class="fa-regular fa-clock"></i>
              </span>
              <input type="datetime-local" id="drawerNewTaskDateTimeInput" class="task-datetime-input" style="width: 100%; height: 36px; border-radius: 9px; background: rgba(30, 41, 59, 0.85); border: 1.2px solid rgba(168, 85, 247, 0.35); color: #cbd5e1; font-size: 0.74rem; font-weight: 700; padding: 0 32px 0 8px; outline: none; box-sizing: border-box;" title="تحديد التاريخ والوقت معاً في نفس الاختيار">
            </div>
          </div>

          <!-- اختصارات سريعة لضبط الموعد بنقرة زر -->
          <div style="display: flex; gap: 4px; overflow-x: auto; padding: 5px 0 2px;" class="custom-scrollbar">
            <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('today_evening')">⚡ اليوم 8:00 م</button>
            <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('tomorrow_morning')">☀️ غداً 10:00 ص</button>
            <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('after_two_days')">📅 بعد يومين</button>
            <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('weekend')">🗓️ عطلة الأسبوع</button>
            <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('clear')" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.35); background: rgba(239, 68, 68, 0.1);">❌ مسح</button>
          </div>
        </div>

        <!-- 3. الأولوية والتصنيف والأزرار -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <select id="drawerNewTaskPriority" style="height: 30px; border-radius: 7px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.68rem; font-weight: 800; padding: 0 6px; outline: none;">
              <option value="normal">🟢 عادي</option>
              <option value="medium">🟡 متوسط</option>
              <option value="high">🔴 عالي جداً</option>
            </select>

            <select id="drawerNewTaskTag" style="height: 30px; border-radius: 7px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.68rem; font-weight: 800; padding: 0 6px; outline: none;">
              <option value="general">📋 عام</option>
              <option value="bills">📄 فواتير والتزامات</option>
              <option value="shopping">🛒 مشتريات وسوبرماركت</option>
              <option value="home">🏠 مستلزمات منزل</option>
              <option value="family">👨‍👩‍👧 أسرة وشخصي</option>
              <option value="work">💼 عمل ودراسة</option>
            </select>
          </div>

          <!-- التقاط وإرفاق صورة -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="file" id="inpTaskPhotoCamera" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskPhotoUpload(event)">
            <input type="file" id="inpTaskPhotoGallery" accept="image/*" style="display: none;" onchange="handleTaskPhotoUpload(event)">
            <button type="button" onclick="document.getElementById('inpTaskPhotoCamera').click()" title="تصوير عبر الكاميرا" style="height: 30px; padding: 0 8px; border-radius: 7px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-camera"></i> تصوير
            </button>
            <button type="button" onclick="document.getElementById('inpTaskPhotoGallery').click()" title="صورة من الاستوديو" style="height: 30px; padding: 0 8px; border-radius: 7px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-images"></i> صورة
            </button>
            <button type="button" onclick="handleDrawerAddNewTask()" style="height: 30px; padding: 0 14px; border-radius: 7px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.76rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);">
              <i class="fa-solid fa-plus"></i> إضافة مهمة
            </button>
          </div>
        </div>

        <!-- معاينة الصورة المعلقة للمهمة -->
        <div id="taskPendingPhotoPreview" style="display: none; margin-top: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 6px; text-align: center; position: relative;">
          <img id="taskPendingPhotoImg" src="" style="max-height: 80px; border-radius: 6px; border: 1.5px solid #a855f7; object-fit: contain;">
          <button type="button" onclick="clearTaskPendingPhoto()" style="position: absolute; top: 4px; left: 8px; background: #ef4444; border: none; border-radius: 50%; color: #fff; width: 22px; height: 22px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>
      </div>'''

new_button = '''      <!-- زر منفصل ومستقل لإضافة مهمة جديدة يفتح نافذة الإضافة المتكاملة -->
      <button type="button" onclick="openNewTaskDrawerModal()" class="btn-create-task-main" style="width: 100%; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.84rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4); margin: 4px 0 2px; transition: transform 0.12s ease;">
        <i class="fa-solid fa-circle-plus" style="font-size: 1.05rem;"></i>
        <span>+ إضافة مهمة جديدة</span>
      </button>'''

assert old_section in content, "old_section not found in content!"
content = content.replace(old_section, new_button, 1)
print("1. Replaced inline form with prominent separate button in drawerTasksViewSection!")

# 2. Add the dedicated modal newTaskDrawerModal before </body>
dedicated_modal_markup = '''  <!-- =========================================================================
       نافذة إضافة مهمة جديدة مخصصة ومستقلة (Dedicated New Task Modal)
       ========================================================================= -->
  <div class="modal-overlay modal-overlay-custom" id="newTaskDrawerModal" style="display: none; z-index: 100030 !important; align-items: center !important; justify-content: center !important; padding: 14px; direction: rtl;" dir="rtl" onclick="if(event.target === this) closeModal('newTaskDrawerModal')">
    <div class="modal-content-card" style="max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto; background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98)); border: 1.5px solid rgba(168, 85, 247, 0.45); border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.85); padding: 18px; box-sizing: border-box;">
      
      <!-- هيدر النافذة -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(255, 255, 255, 0.08); padding-bottom: 10px; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 36px; height: 36px; border-radius: 12px; background: rgba(168, 85, 247, 0.2); border: 1.2px solid rgba(168, 85, 247, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.15rem; color: #c084fc;">
            <i class="fa-solid fa-list-check"></i>
          </div>
          <div>
            <h3 style="font-size: 0.98rem; font-weight: 900; color: #f8fafc; margin: 0;">إضافة مهمة ذكية جديدة</h3>
            <span style="font-size: 0.65rem; color: #c084fc; font-weight: 700;">جدولة مواعيد، تنبيهات، وإرفاق صور</span>
          </div>
        </div>
        <button type="button" class="btn-modal-close" onclick="closeModal('newTaskDrawerModal')">&times;</button>
      </div>

      <!-- 1. بيان وعنوان المهمة -->
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-size: 0.74rem; font-weight: 800; color: #cbd5e1; margin-bottom: 5px;">بيان أو عنوان المهمة:</label>
        <input type="text" id="drawerNewTaskTitleInput" placeholder="اكتب عنوان المهمة... (مثال: سداد قسط المدرسة)" style="width: 100%; height: 42px; border-radius: 10px; background: rgba(30, 41, 59, 0.85); border: 1.2px solid rgba(168, 85, 247, 0.35); color: #fff; font-size: 0.84rem; font-weight: 800; padding: 0 12px; outline: none; box-sizing: border-box;">
      </div>

      <!-- 2. موعد وتاريخ وساعة التنبيه في نفس الاختيار الموحد -->
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-size: 0.74rem; font-weight: 800; color: #cbd5e1; margin-bottom: 5px;">موعد وتاريخ التنبيه (في نفس الاختيار):</label>
        <div style="position: relative;">
          <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; color: #a855f7; pointer-events: none;">
            <i class="fa-regular fa-clock"></i>
          </span>
          <input type="datetime-local" id="drawerNewTaskDateTimeInput" class="task-datetime-input" style="width: 100%; height: 42px; border-radius: 10px; background: rgba(30, 41, 59, 0.85); border: 1.2px solid rgba(168, 85, 247, 0.35); color: #cbd5e1; font-size: 0.80rem; font-weight: 700; padding: 0 36px 0 10px; outline: none; box-sizing: border-box;">
        </div>

        <!-- أزرار الاختصارات الذكية للموعد -->
        <div style="display: flex; gap: 5px; overflow-x: auto; padding: 8px 0 2px;" class="custom-scrollbar">
          <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('today_evening')">⚡ اليوم 8:00 م</button>
          <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('tomorrow_morning')">☀️ غداً 10:00 ص</button>
          <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('after_two_days')">📅 بعد يومين</button>
          <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('weekend')">🗓️ عطلة الأسبوع</button>
          <button type="button" class="task-preset-chip" onclick="setTaskDateTimePreset('clear')" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.35); background: rgba(239, 68, 68, 0.1);">❌ مسح</button>
        </div>
      </div>

      <!-- 3. الأولوية والتصنيف -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
        <div>
          <label style="display: block; font-size: 0.72rem; font-weight: 800; color: #cbd5e1; margin-bottom: 5px;">مستوى الأولوية:</label>
          <select id="drawerNewTaskPriority" style="width: 100%; height: 38px; border-radius: 9px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.76rem; font-weight: 800; padding: 0 8px; outline: none; box-sizing: border-box;">
            <option value="normal">🟢 أولوية عادية</option>
            <option value="medium">🟡 أولوية متوسطة</option>
            <option value="high">🔴 أولوية قصوى</option>
          </select>
        </div>

        <div>
          <label style="display: block; font-size: 0.72rem; font-weight: 800; color: #cbd5e1; margin-bottom: 5px;">التصنيف / الوسم:</label>
          <select id="drawerNewTaskTag" style="width: 100%; height: 38px; border-radius: 9px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.76rem; font-weight: 800; padding: 0 8px; outline: none; box-sizing: border-box;">
            <option value="general">📋 عام</option>
            <option value="bills">📄 فواتير والتزامات</option>
            <option value="shopping">🛒 مشتريات وسوبرماركت</option>
            <option value="home">🏠 مستلزمات منزل</option>
            <option value="family">👨‍👩‍👧 أسرة وشخصي</option>
            <option value="work">💼 عمل ودراسة</option>
          </select>
        </div>
      </div>

      <!-- 4. إرفاق صورة -->
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 10px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.72rem; font-weight: 800; color: #cbd5e1;">
            <i class="fa-solid fa-paperclip" style="color: #38bdf8;"></i> إرفاق صورة أو مستند (اختياري):
          </span>
          <div style="display: flex; gap: 6px;">
            <input type="file" id="inpTaskPhotoCamera" accept="image/*" capture="environment" style="display: none;" onchange="handleTaskPhotoUpload(event)">
            <input type="file" id="inpTaskPhotoGallery" accept="image/*" style="display: none;" onchange="handleTaskPhotoUpload(event)">
            <button type="button" onclick="document.getElementById('inpTaskPhotoCamera').click()" title="التقاط بالكاميرا" style="padding: 5px 10px; border-radius: 7px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-camera"></i> تصوير
            </button>
            <button type="button" onclick="document.getElementById('inpTaskPhotoGallery').click()" title="اختيار من الاستوديو" style="padding: 5px 10px; border-radius: 7px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-images"></i> استوديو
            </button>
          </div>
        </div>

        <!-- معاينة الصورة المرفقة -->
        <div id="taskPendingPhotoPreview" style="display: none; margin-top: 10px; text-align: center; position: relative;">
          <img id="taskPendingPhotoImg" src="" style="max-height: 120px; border-radius: 8px; border: 1.5px solid #a855f7; object-fit: contain;">
          <button type="button" onclick="clearTaskPendingPhoto()" style="position: absolute; top: 4px; left: 8px; background: #ef4444; border: none; border-radius: 50%; color: #fff; width: 24px; height: 24px; font-size: 0.80rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>
      </div>

      <!-- أزرار الحفظ والإغلاق -->
      <div style="display: flex; gap: 8px;">
        <button type="button" onclick="handleDrawerAddNewTask()" style="flex: 1; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.85rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 14px rgba(168, 85, 247, 0.45);">
          <i class="fa-solid fa-check"></i> حفظ وإضافة المهمة
        </button>
        <button type="button" onclick="closeModal('newTaskDrawerModal')" style="height: 44px; padding: 0 18px; border-radius: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 0.82rem; font-weight: 800; cursor: pointer;">
          إلغاء
        </button>
      </div>

    </div>
  </div>\n\n'''

target_tag = '<div class="modal-overlay modal-overlay-custom" id="tasksModal">'
assert target_tag in content, "target_tag for modal not found!"
content = content.replace(target_tag, dedicated_modal_markup + target_tag, 1)
print("2. Added dedicated newTaskDrawerModal markup!")

# 3. Add JS helper openNewTaskDrawerModal and update handleDrawerAddNewTask to close modal on save
old_handle_drawer = '''      tasks.unshift(newTask);
      saveTodoTasks(tasks);

      if (titleInp) titleInp.value = '';
      if (dtInp) dtInp.value = '';
      clearTaskPendingPhoto();
      playNotificationChime();
      renderDrawerTasksList();
      showToast('✨ تمت إضافة المهمة والموعد بنجاح!');'''

new_handle_drawer = '''      tasks.unshift(newTask);
      saveTodoTasks(tasks);

      if (titleInp) titleInp.value = '';
      if (dtInp) dtInp.value = '';
      clearTaskPendingPhoto();
      closeModal('newTaskDrawerModal');
      playNotificationChime();
      renderDrawerTasksList();
      showToast('✨ تمت إضافة المهمة والموعد بنجاح!');'''

assert old_handle_drawer in content, "old_handle_drawer not found!"
content = content.replace(old_handle_drawer, new_handle_drawer, 1)

# Add openNewTaskDrawerModal function
fn_marker = "    function switchDrawerTodoSection(sec) {"
new_open_fn = '''    function openNewTaskDrawerModal() {
      openModal('newTaskDrawerModal');
      setTimeout(() => {
        const inp = document.getElementById('drawerNewTaskTitleInput');
        if (inp) inp.focus();
      }, 150);
    }\n\n'''

content = content.replace(fn_marker, new_open_fn + fn_marker, 1)
print("3. Added openNewTaskDrawerModal function and updated handleDrawerAddNewTask!")

# 4. Reduce visibility sync throttle from 3 minutes to 15 seconds to ensure fast updates on mobile!
content = content.replace(
    'if (now - lastVisSyncTime > 180000) { // Throttle: 3 minutes between automatic syncs',
    'if (now - lastVisSyncTime > 15000) { // Throttle: 15 seconds between automatic syncs'
)
print("4. Reduced visibility sync throttle to 15 seconds!")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished applying separate task creation button and modal!")
