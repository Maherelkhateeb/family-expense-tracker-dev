import sys

INDEX_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update empty state in renderDrawerTasksList
old_empty_block = '''      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 14px; background: rgba(15, 23, 42, 0.65); border: 1.5px dashed rgba(168, 85, 247, 0.30); border-radius: 16px; margin-top: 6px;">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(168, 85, 247, 0.15); color: #c084fc; display: inline-flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: 10px;">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <div style="font-weight: 850; font-size: 0.88rem; color: #f8fafc;">لا توجد مهام في هذا القسم حالياً</div>
            <div style="font-size: 0.72rem; color: #94a3b8; margin: 6px 0 14px;">يمكنك إضافة مهمة جديدة وتحديد الموعد والتنبيهات الموحدة بخطوة واحدة</div>
            <button type="button" onclick="openNewTaskDrawerModal()" style="height: 36px; padding: 0 18px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.76rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 10px rgba(168, 85, 247, 0.35);">
              <i class="fa-solid fa-plus"></i> + إضافة مهمة جديدة الآن
            </button>
          </div>
        `;
        return;
      }'''

new_empty_block = '''      const syncTasksFull = () => {
        const fullContainer = document.getElementById('tasksFullScreenContainerList');
        if (fullContainer) fullContainer.innerHTML = container.innerHTML;
        const kTot = document.getElementById('kpiTasksTotalFull');
        const kAct = document.getElementById('kpiTasksActiveFull');
        const kOvd = document.getElementById('kpiTasksOverdueFull');
        const kDon = document.getElementById('kpiTasksDoneFull');
        const bProg = document.getElementById('tasksOverallProgressBarFull');
        const pProg = document.getElementById('tasksOverallProgressPctFull');
        if (kTot) kTot.textContent = totalCount;
        if (kAct) kAct.textContent = activeCount;
        if (kOvd) kOvd.textContent = overdueCount;
        if (kDon) kDon.textContent = completedCount;
        if (bProg) bProg.style.width = overallPct + '%';
        if (pProg) pProg.textContent = overallPct + '%';
      };

      if (filtered.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 14px; background: rgba(15, 23, 42, 0.65); border: 1.5px dashed rgba(168, 85, 247, 0.30); border-radius: 16px; margin-top: 6px;">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(168, 85, 247, 0.15); color: #c084fc; display: inline-flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: 10px;">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <div style="font-weight: 850; font-size: 0.88rem; color: #f8fafc;">لا توجد مهام في هذا القسم حالياً</div>
            <div style="font-size: 0.72rem; color: #94a3b8; margin: 6px 0 14px;">يمكنك إضافة مهمة جديدة وتحديد الموعد والتنبيهات الموحدة بخطوة واحدة</div>
            <button type="button" onclick="openNewTaskDrawerModal()" style="height: 36px; padding: 0 18px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; font-size: 0.76rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 10px rgba(168, 85, 247, 0.35);">
              <i class="fa-solid fa-plus"></i> + إضافة مهمة جديدة الآن
            </button>
          </div>
        `;
        syncTasksFull();
        return;
      }'''

if old_empty_block in content:
    content = content.replace(old_empty_block, new_empty_block, 1)
    print("[OK] Empty block updated.")
else:
    print("! Warning: old_empty_block not found.")

# 2. Update end of renderDrawerTasksList
old_end_block = '''              </div>
            </div>
          </div>
        `;
      }).join('');
    }'''

new_end_block = '''              </div>
            </div>
          </div>
        `;
      }).join('');
      syncTasksFull();
    }'''

if old_end_block in content:
    content = content.replace(old_end_block, new_end_block, 1)
    print("[OK] End block updated.")
else:
    print("! Warning: old_end_block not found.")

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated index.html successfully.")
