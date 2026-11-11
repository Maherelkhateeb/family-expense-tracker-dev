# scripts/apply_tasks_overhaul_js_v528.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ==============================================================================
# Helper functions for Task Creation toggle, Camera & Gallery for Main & Subtasks
# ==============================================================================
js_new_helpers = '''
/* ==========================================================================
   إدارة إظهار وإخفاء نموذج المهام الجديد وإرفاق الصور للمهام والمهام الفرعية
   ========================================================================== */
window._pendingSubtaskPhotos = {};
window._activeSubtaskTaskId = null;

function showUnifiedTaskCreator() {
  const card = document.getElementById('tasksUnifiedCreatorCard');
  if (card) {
    card.style.display = 'flex';
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const inp = document.getElementById('quickTaskTitleInput');
    if (inp) setTimeout(() => inp.focus(), 100);
  }
}

function hideUnifiedTaskCreator() {
  const card = document.getElementById('tasksUnifiedCreatorCard');
  if (card) {
    card.style.display = 'none';
  }
  resetUnifiedTaskForm();
}

function toggleUnifiedTaskCreator() {
  const card = document.getElementById('tasksUnifiedCreatorCard');
  if (!card) return;
  if (card.style.display === 'none' || getComputedStyle(card).display === 'none') {
    showUnifiedTaskCreator();
  } else {
    hideUnifiedTaskCreator();
  }
}

function openTasksAndAddNewTask() {
  openTasksFullScreenModal();
  showUnifiedTaskCreator();
}

function triggerMainTaskCamera() {
  const inp = document.getElementById('mainTaskCameraInput');
  if (inp) inp.click();
}

function triggerMainTaskGallery() {
  const inp = document.getElementById('mainTaskGalleryInput');
  if (inp) inp.click();
}

function triggerSubtaskCamera(taskId) {
  window._activeSubtaskTaskId = taskId;
  const inp = document.getElementById('subtaskCameraInput');
  if (inp) inp.click();
}

function triggerSubtaskGallery(taskId) {
  window._activeSubtaskTaskId = taskId;
  const inp = document.getElementById('subtaskGalleryInput');
  if (inp) inp.click();
}

function handleTaskFileChosen(event, targetType) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const rawData = e.target.result;
    const img = new Image();
    img.onload = function() {
      const maxDim = 1200;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressedData = canvas.toDataURL('image/jpeg', 0.82);

      if (targetType === 'main') {
        window.currentQuickTaskPhoto = compressedData;
        const previewBar = document.getElementById('quickTaskPhotoPreviewBar');
        if (previewBar) {
          previewBar.style.display = 'inline-flex';
          previewBar.innerHTML = `
            <div style="position: relative; display: inline-block;">
              <img src="${compressedData}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 6px; border: 1.5px solid #10b981;">
              <button type="button" onclick="clearTaskPendingPhoto()" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 16px; height: 16px; font-size: 0.60rem; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
            </div>
          `;
        }
        if (typeof showToast === 'function') showToast('تم إرفاق صورة للمهمة الرئيسية بنجاح ✓');
      } else if (targetType === 'subtask') {
        const taskId = window._activeSubtaskTaskId;
        if (!taskId) return;
        window._pendingSubtaskPhotos[taskId] = compressedData;
        const subPreview = document.getElementById(`subtaskPendingPreview_${taskId}`);
        if (subPreview) {
          subPreview.style.display = 'flex';
          subPreview.innerHTML = `
            <div style="position: relative; display: inline-block;">
              <img src="${compressedData}" style="width: 28px; height: 28px; object-fit: cover; border-radius: 6px; border: 1.5px solid #38bdf8;">
              <button type="button" onclick="clearSubtaskPendingPhoto('${taskId}')" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 15px; height: 15px; font-size: 0.55rem; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <span style="font-size: 0.68rem; color: #38bdf8; font-weight: 800;">جاهز للخطوة الفرعية ✓</span>
          `;
        }
        if (typeof showToast === 'function') showToast('تم تجهيز صورة الخطوة الفرعية ✓');
      }
    };
    img.src = rawData;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function clearSubtaskPendingPhoto(taskId) {
  if (window._pendingSubtaskPhotos) {
    delete window._pendingSubtaskPhotos[taskId];
  }
  const preview = document.getElementById(`subtaskPendingPreview_${taskId}`);
  if (preview) {
    preview.style.display = 'none';
    preview.innerHTML = '';
  }
}

window.showUnifiedTaskCreator = showUnifiedTaskCreator;
window.hideUnifiedTaskCreator = hideUnifiedTaskCreator;
window.toggleUnifiedTaskCreator = toggleUnifiedTaskCreator;
window.openTasksAndAddNewTask = openTasksAndAddNewTask;
window.triggerMainTaskCamera = triggerMainTaskCamera;
window.triggerMainTaskGallery = triggerMainTaskGallery;
window.triggerSubtaskCamera = triggerSubtaskCamera;
window.triggerSubtaskGallery = triggerSubtaskGallery;
window.handleTaskFileChosen = handleTaskFileChosen;
window.clearSubtaskPendingPhoto = clearSubtaskPendingPhoto;
'''

# 1. Inject helpers before handleQuickTaskAdd
anchor_fn = 'function handleQuickTaskAdd()'
if anchor_fn in content:
    content = content.replace(anchor_fn, js_new_helpers + '\n' + anchor_fn, 1)
    print("✓ New task creator & photo helpers injected successfully")
else:
    print("! Could not find handleQuickTaskAdd anchor")

# 2. Update handleQuickTaskAdd to hide creator after successful add
old_handle_quick_end = '''  renderTasksProList();
  updateTasksProductivityKPIs();
  if (typeof showToast === 'function') showToast('تمت إضافة المهمة بنجاح ✓');
}'''

new_handle_quick_end = '''  renderTasksProList();
  updateTasksProductivityKPIs();
  hideUnifiedTaskCreator();
  if (typeof showToast === 'function') showToast('تمت إضافة المهمة بنجاح ✓');
}'''

if old_handle_quick_end in content:
    content = content.replace(old_handle_quick_end, new_handle_quick_end, 1)
    print("✓ handleQuickTaskAdd updated to auto-hide creator on success")
else:
    print("! handleQuickTaskAdd end pattern not matched")

# 3. Update addNewSubtaskInline to include photo
old_add_subtask = '''function addNewSubtaskInline(taskId) {
  const inp = document.getElementById(`newSubtaskInput_${taskId}`);
  const title = inp ? inp.value.trim() : '';
  if (!title) return;

  const tasks = getTodoTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    if (!task.subtasks) task.subtasks = [];
    task.subtasks.push({
      id: 'sub_' + Date.now(),
      title: title,
      completed: false
    });
    saveTodoTasks(tasks);
    if (inp) inp.value = '';
    renderTasksProList();
  }
}'''

new_add_subtask = '''function addNewSubtaskInline(taskId) {
  const inp = document.getElementById(`newSubtaskInput_${taskId}`);
  const title = inp ? inp.value.trim() : '';
  if (!title) {
    if (typeof showToast === 'function') showToast('يرجى كتابة بيان الخطوة الفرعية');
    if (inp) inp.focus();
    return;
  }

  const tasks = getTodoTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    if (!task.subtasks) task.subtasks = [];
    const photo = (window._pendingSubtaskPhotos && window._pendingSubtaskPhotos[taskId]) ? window._pendingSubtaskPhotos[taskId] : null;
    task.subtasks.push({
      id: 'sub_' + Date.now(),
      title: title,
      completed: false,
      photo: photo
    });
    saveTodoTasks(tasks);
    if (inp) inp.value = '';
    clearSubtaskPendingPhoto(taskId);
    renderTasksProList();
    if (typeof showToast === 'function') showToast('تمت إضافة الخطوة الفرعية ✓');
  }
}'''

if old_add_subtask in content:
    content = content.replace(old_add_subtask, new_add_subtask, 1)
    print("✓ addNewSubtaskInline updated with photo attachment support")
else:
    print("! old_add_subtask not found by exact string, checking regex...")
    pattern_sub = r'function addNewSubtaskInline\(taskId\)\s*\{[\s\S]*?renderTasksProList\(\);\s*\}\s*\}'
    if re.search(pattern_sub, content):
        content = re.sub(pattern_sub, new_add_subtask, content, count=1)
        print("✓ addNewSubtaskInline updated via regex")

# 4. Update subtasks rendering inside renderTasksProList:
# Add subtask photo display + camera & gallery buttons for subtask add form
old_subtask_render_pattern = r'\$\{subtasks\.map\(s => `[\s\S]*?`\)\.join\(\'\'\)\}\s*</div>\s*` : \'\'\}\s*<div style="display: flex; gap: 4px; margin-top: 4px;">\s*<input type="text" id="newSubtaskInput_\$\{t\.id\}"[\s\S]*?</div>'

new_subtask_render = '''${subtasks.map(s => `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(15, 23, 42, 0.7); padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
                <div style="display: flex; align-items: center; gap: 7px; min-width: 0;">
                  <button type="button" onclick="toggleSubtaskCompleted('${t.id}', '${s.id}')" style="width: 20px; height: 20px; border-radius: 50%; border: 1.2px solid ${s.completed ? '#10b981' : '#a855f7'}; background: ${s.completed ? '#10b981' : 'transparent'}; color: #fff; font-size: 0.65rem; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
                    ${s.completed ? '<i class="fa-solid fa-check"></i>' : ''}
                  </button>
                  <span style="font-size: 0.76rem; font-weight: 750; color: ${s.completed ? '#64748b' : '#e2e8f0'}; text-decoration: ${s.completed ? 'line-through' : 'none'}; word-break: break-word;">${escapeHtml(s.title)}</span>
                  ${s.photo ? `<img src="${s.photo}" alt="مرفق الخطوة" style="width: 26px; height: 26px; border-radius: 6px; object-fit: cover; border: 1.2px solid #38bdf8; cursor: pointer; flex-shrink: 0;" onclick="event.stopPropagation(); if(typeof openReceiptLightbox==='function') openReceiptLightbox('${s.photo}', '${escapeHtml(s.title)}')" title="انقر لعرض صورة الخطوة الفرعية مكبرة">` : ''}
                </div>
                <button type="button" onclick="deleteSubtask('${t.id}', '${s.id}')" style="background: transparent; border: none; color: #f87171; cursor: pointer; font-size: 0.74rem; padding: 2px;"><i class="fa-solid fa-xmark"></i></button>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <!-- حقل إضافة خطوة فرعية جديدة مع خياري: تصوير أو استوديو -->
        <div style="display: flex; gap: 5px; margin-top: 6px; align-items: center;">
          <input type="text" id="newSubtaskInput_${t.id}" placeholder="+ إضافة خطوة فرعية..." style="flex: 1; height: 32px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1.2px solid rgba(168,85,247,0.35); color: #fff; font-size: 0.74rem; font-weight: 750; padding: 0 10px; outline: none; box-sizing: border-box;" onkeydown="if(event.key==='Enter') addNewSubtaskInline('${t.id}')">
          <button type="button" onclick="triggerSubtaskCamera('${t.id}')" title="تصوير خطوة فرعية بالكاميرا" style="height: 32px; padding: 0 8px; border-radius: 8px; background: rgba(56,189,248,0.18); border: 1.2px solid rgba(56,189,248,0.45); color: #38bdf8; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-camera"></i>
          </button>
          <button type="button" onclick="triggerSubtaskGallery('${t.id}')" title="اختيار صورة من الاستوديو" style="height: 32px; padding: 0 8px; border-radius: 8px; background: rgba(16,185,129,0.18); border: 1.2px solid rgba(16,185,129,0.45); color: #34d399; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-image"></i>
          </button>
          <button type="button" onclick="addNewSubtaskInline('${t.id}')" style="height: 32px; padding: 0 12px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.74rem; font-weight: 900; cursor: pointer;">إضافة</button>
        </div>
        <div id="subtaskPendingPreview_${t.id}" style="display: none; align-items: center; gap: 6px; margin-top: 4px;"></div>'''

match_sub = re.search(old_subtask_render_pattern, content)
if match_sub:
    content = content[:match_sub.start()] + new_subtask_render + content[match_sub.end():]
    print("✓ Subtask rendering and add form updated with camera & gallery buttons!")
else:
    print("! Could not match old_subtask_render_pattern via regex, checking manual replace...")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved stage 2 changes to index.html successfully!")
