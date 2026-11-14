import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = 'C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# -------------------------------------------------------------------------
# C. Add Tasks & Subtasks Workflow Guide banner in drawerTasksViewSection
# -------------------------------------------------------------------------

tasks_guide_banner_html = """      <!-- كارت توضيح ودليل آلية عمل المهام الذكية والخطوات الفرعية (دليل إرشادي تفاعلي) -->
      <div class="tasks-guide-banner" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(15, 23, 42, 0.92)); border: 1.2px solid rgba(168, 85, 247, 0.35); border-radius: 14px; padding: 10px 12px; margin-bottom: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
        <div style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="toggleTasksGuideDetails()">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(168, 85, 247, 0.22); color: #c084fc; display: flex; align-items: center; justify-content: center; font-size: 0.90rem; border: 1px solid rgba(168, 85, 247, 0.35);">
              <i class="fa-solid fa-lightbulb"></i>
            </div>
            <div>
              <div style="font-size: 0.80rem; font-weight: 900; color: #f8fafc;">آلية عمل نظام المهام والخطوات الفرعية 📋</div>
              <div style="font-size: 0.64rem; color: #c084fc; font-weight: 700;">دليل تفتيت المهام، الجدولة الموحدة، والربط المالي التلقائي</div>
            </div>
          </div>
          <button type="button" id="btnToggleTasksGuide" style="background: rgba(168, 85, 247, 0.18); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc; border-radius: 7px; padding: 3px 9px; font-size: 0.66rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <span>شرح الآلية</span>
            <i class="fa-solid fa-chevron-down" id="tasksGuideChevron"></i>
          </button>
        </div>
        
        <div id="tasksGuideDetailsBody" style="display: none; margin-top: 10px; border-top: 1px dashed rgba(168, 85, 247, 0.25); padding-top: 8px; font-size: 0.70rem; color: #cbd5e1; line-height: 1.55;">
          <div style="display: grid; grid-template-columns: 1fr; gap: 6px;">
            <div style="background: rgba(30, 41, 59, 0.7); padding: 7px 10px; border-radius: 8px; border-right: 3px solid #38bdf8;">
              <strong style="color: #38bdf8;">1. المهمة الرئيسية:</strong> حدد الهدف المالي أو العائلي مع تحديد الموعد والوقت في نفس الاختيار مع إرفاق صورة المستند أو الفاتورة.
            </div>
            <div style="background: rgba(30, 41, 59, 0.7); padding: 7px 10px; border-radius: 8px; border-right: 3px solid #a855f7;">
              <strong style="color: #c084fc;">2. تفتيت المهام إلى خطوات فرعية:</strong> قَسّم المهمة لخطوات تنفيذية محددة؛ كل خطوة لها موعد وصورة مستقلة، ويُحسب شريط الإنجاز التراكمي تلقائياً فور تأشيرها.
            </div>
            <div style="background: rgba(30, 41, 59, 0.7); padding: 7px 10px; border-radius: 8px; border-right: 3px solid #10b981;">
              <strong style="color: #34d399;">3. التحويل لمصروف بلمسة واحدة:</strong> انقر على أيقونة التحويل المالي <i class="fa-solid fa-money-bill-transfer"></i> لتنتقل تفاصيل المهمة ومبلغها مباشرة لنافذة المصروفات دون إعادة كتابة البيانات.
            </div>
            <div style="background: rgba(30, 41, 59, 0.7); padding: 7px 10px; border-radius: 8px; border-right: 3px solid #f59e0b;">
              <strong style="color: #fbbf24;">4. التنبيهات والفلترة اللحظية:</strong> تنبيهات صوتية ومرئية عند حلول مواعيد الاستحقاق، مع فلترة فورية حسب اليوم، الهام، المخطط، والمتأخر.
            </div>
          </div>
        </div>
      </div>
"""

target_drawer_tasks_view = '<div id="drawerTasksViewSection" style="display: none; flex: 1; overflow-y: auto; padding: 12px; flex-direction: column; gap: 10px;" class="custom-scrollbar">'

if target_drawer_tasks_view in content and 'class="tasks-guide-banner"' not in content:
    content = content.replace(target_drawer_tasks_view, target_drawer_tasks_view + "\n" + tasks_guide_banner_html)
    print("Added tasks_guide_banner_html")

# -------------------------------------------------------------------------
# D. Redesign Subtasks rendering inside task cards in renderDrawerTasksList()
# -------------------------------------------------------------------------

old_subtask_render_code = """            <!-- تفاصيل المهام الفرعية وإمكانية إضافة مهمة فرعية جديدة مع صورة وتاريخ ووقت موحد -->
            <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px; margin-top: 2px;">
              ${subtasksHtml}

              <!-- سطر إضافة مهمة فرعية جديدة مع موعد ووقت موحد وصورة -->
              <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; align-items: center; background: rgba(15, 23, 42, 0.55); border-radius: 8px; padding: 6px;">
                <input type="text" id="inpSubtaskTitle_${t.id}" placeholder="إضافة خطوة أو مهمة فرعية..." style="flex: 1 1 120px; height: 30px; border-radius: 6px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #fff; font-size: 0.72rem; padding: 0 8px; outline: none;">
                
                <!-- حقل تاريخ ووقت المهمة الفرعية الموحد -->
                <input type="datetime-local" id="inpSubtaskDateTime_${t.id}" class="task-datetime-input" style="width: 135px; height: 30px; border-radius: 6px; background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(168, 85, 247, 0.3); color: #cbd5e1; font-size: 0.65rem; padding: 0 4px;" title="تحديد موعد وساعة المهمة الفرعية معاً">
                
                <!-- إرفاق صورة للمهمة الفرعية -->
                <input type="file" id="inpSubtaskPhoto_${t.id}" accept="image/*" style="display: none;" onchange="handleSubtaskPhotoPicked(event, '${t.id}')">
                <button type="button" onclick="document.getElementById('inpSubtaskPhoto_${t.id}').click()" title="إرفاق صورة للمهمة الفرعية" id="btnSubtaskPhoto_${t.id}" style="height: 30px; padding: 0 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; gap: 3px;">
                  <i class="fa-solid fa-camera"></i>
                  <span id="subtaskPhotoBadge_${t.id}" style="display: none; font-size: 0.60rem; color: #34d399; font-weight: 800;">✓</span>
                </button>

                <button type="button" onclick="addSubtaskToTask('${t.id}')" style="height: 30px; padding: 0 12px; border-radius: 6px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-plus"></i> إضافة
                </button>
              </div>
            </div>"""

new_subtask_render_code = """            <!-- قسم الخطوات والمهام الفرعية المنسق والاحترافي -->
            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px; margin-top: 6px;">
              <!-- هيدر الخطوات الفرعية مع زر الإضافة المنسق -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-list-check" style="color: #c084fc; font-size: 0.78rem;"></i>
                  <span style="font-size: 0.72rem; font-weight: 850; color: #f8fafc;">الخطوات والمهام الفرعية:</span>
                  ${hasSubs ? `<span style="font-size: 0.62rem; color: #34d399; background: rgba(16, 185, 129, 0.16); border: 1px solid rgba(16, 185, 129, 0.35); padding: 1px 7px; border-radius: 6px; font-weight: 900;">${completedSubs} من ${subtasks.length} مكتملة (${progressPct}%)</span>` : ''}
                </div>
                <button type="button" onclick="toggleSubtaskForm('${t.id}')" style="background: rgba(168, 85, 247, 0.16); border: 1.2px solid rgba(168, 85, 247, 0.4); border-radius: 8px; color: #c084fc; font-size: 0.68rem; font-weight: 850; padding: 3px 9px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s ease;">
                  <i class="fa-solid fa-plus"></i> إضافة خطوة فرعية
                </button>
              </div>

              <!-- قائمة الخطوات الفرعية المسجلة -->
              ${hasSubs ? `
                <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px;">
                  ${subtasksHtml}
                </div>
              ` : `
                <div style="font-size: 0.66rem; color: #64748b; padding: 3px 2px; text-align: right; margin-bottom: 4px;">
                  💡 لم تتم إضافة خطوات فرعية بعد. انقر على "+ إضافة خطوة فرعية" لتفتيت المهمة.
                </div>
              `}

              <!-- صندوق ونموذج إضافة خطوة فرعية مخصص ومنسق هندسياً -->
              <div id="subtaskAddBox_${t.id}" style="display: none; background: rgba(15, 23, 42, 0.95); border: 1.3px solid rgba(168, 85, 247, 0.45); border-radius: 12px; padding: 10px 12px; margin-top: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);">
                <div style="font-size: 0.72rem; font-weight: 900; color: #c084fc; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                  <span style="display: flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-circle-plus"></i> إضافة خطوة أو مهمة فرعية جديدة:
                  </span>
                  <button type="button" onclick="toggleSubtaskForm('${t.id}', false)" style="background: transparent; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer; padding: 0 4px;">&times;</button>
                </div>
                
                <!-- 1. عنوان وبيان الخطوة الفرعية -->
                <div style="margin-bottom: 6px;">
                  <input type="text" id="inpSubtaskTitle_${t.id}" placeholder="اكتب بيان الخطوة الفرعية... (مثال: سحب إيصال الدفع من البنك)" style="width: 100%; height: 36px; border-radius: 8px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(168, 85, 247, 0.35); color: #fff; font-size: 0.76rem; font-weight: 700; padding: 0 10px; outline: none; box-sizing: border-box;">
                </div>
                
                <!-- 2. صف التاريخ والوقت الموحد + تصوير وإرفاق الصورة -->
                <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 8px;">
                  <div style="flex: 1; position: relative;">
                    <input type="datetime-local" id="inpSubtaskDateTime_${t.id}" class="task-datetime-input" style="width: 100%; height: 34px; border-radius: 8px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(168, 85, 247, 0.35); color: #cbd5e1; font-size: 0.70rem; padding: 0 8px; box-sizing: border-box;" title="تحديد موعد وساعة إنجاز الخطوة الفرعية">
                  </div>
                  
                  <!-- زر إرفاق صورة للخطوة الفرعية -->
                  <input type="file" id="inpSubtaskPhoto_${t.id}" accept="image/*" style="display: none;" onchange="handleSubtaskPhotoPicked(event, '${t.id}')">
                  <button type="button" onclick="document.getElementById('inpSubtaskPhoto_${t.id}').click()" title="إرفاق صورة للخطوة الفرعية" id="btnSubtaskPhoto_${t.id}" style="height: 34px; padding: 0 10px; border-radius: 8px; background: rgba(56, 189, 248, 0.16); border: 1.2px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.74rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
                    <i class="fa-solid fa-camera"></i>
                    <span>صورة</span>
                    <span id="subtaskPhotoBadge_${t.id}" style="display: none; font-size: 0.65rem; color: #34d399; font-weight: 900;">✓</span>
                  </button>
                </div>
                
                <!-- 3. أزرار الحفظ والإلغاء المنسقة -->
                <div style="display: flex; gap: 6px;">
                  <button type="button" onclick="addSubtaskToTask('${t.id}')" style="flex: 2; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.76rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.35);">
                    <i class="fa-solid fa-check"></i> حفظ الخطوة الفرعية
                  </button>
                  <button type="button" onclick="toggleSubtaskForm('${t.id}', false)" style="flex: 1; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 0.72rem; font-weight: 800; cursor: pointer;">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>"""

if old_subtask_render_code in content:
    content = content.replace(old_subtask_render_code, new_subtask_render_code)
    print("Replaced old_subtask_render_code with new_subtask_render_code successfully!")
else:
    print("WARNING: old_subtask_render_code not found directly!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Saved Tasks Overhaul changes.")
