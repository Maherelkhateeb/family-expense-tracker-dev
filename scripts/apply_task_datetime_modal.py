import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update neon card style in CSS
neon_start = html.find('html[data-card-style="neon"] body .kpi-master-wealth-cockpit')
neon_end = html.find('/* =========================================================================\n       تحسين عرض نافذة تدقيق الرصيد الفعلي', neon_start)
if neon_start != -1 and neon_end != -1:
    new_neon_css = '''html[data-card-style="neon"] body .kpi-master-wealth-cockpit,
    html[data-card-style="neon"] body #topKpiThreeStrip,
    html[data-card-style="neon"] body .ops-tx-card-clean,
    html[data-card-style="neon"] body .expected-clean-card,
    html[data-card-style="neon"] body .modal-content-card,
    html[data-card-style="neon"] body .settings-unified-section,
    html[data-card-style="neon"] body .app-card-panel {
      background: rgba(15, 23, 42, 0.88) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      border: 1px solid rgba(56, 189, 248, 0.35) !important;
      border-radius: 14px !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45), 0 0 10px rgba(56, 189, 248, 0.15) !important;
    }
    html[data-card-style="neon"] body .cockpit-hero-side {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }
    html[data-card-style="neon"] body .stat-capsule-twin {
      background: rgba(15, 23, 42, 0.8) !important;
      border: 1px solid rgba(56, 189, 248, 0.35) !important;
      border-radius: 10px !important;
    }
'''
    html = html[:neon_start] + new_neon_css + html[neon_end:]
    print("✓ Successfully modernized neon card style in CSS")

# 2. In #tasksFullScreenModal, replace the squished quickTaskDateTimeInput block
old_dt_block_start = html.find('<!-- آلية اختيار الساعة واليوم المباشرة المطورة بجانب الرقائق -->')
if old_dt_block_start != -1:
    old_dt_block_end = html.find('</div>\n            </div>', old_dt_block_start) + 6
    new_dt_trigger_html = '''<!-- زر منتقي الوقت والتاريخ المطوّر اللمسي بدون نصوص متداخلة -->
              <button type="button" class="btn-quick-task-dt-trigger" id="btnQuickTaskDateTimeTrigger" onclick="openTaskDateTimePickerModal()" style="height: 28px; padding: 0 10px; border-radius: 7px; background: rgba(168, 85, 247, 0.20); border: 1.2px solid rgba(168, 85, 247, 0.55); color: #e9d5ff; font-size: 0.72rem; font-weight: 850; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all 0.2s;">
                <i class="fa-regular fa-clock" style="color: #c084fc;"></i>
                <span id="lblQuickTaskDateTimeTrigger">📅 تحديد التاريخ والساعة</span>
              </button>'''
    html = html[:old_dt_block_start] + new_dt_trigger_html + html[old_dt_block_end:]
    print("✓ Successfully replaced squished datetime input with modern trigger button")

# 3. Inject #taskDateTimePickerModal before the end of #tasksFullScreenModal or inside modals
dt_modal_html = '''
    <!-- =========================================================================
         نافذة منتقي الوقت والتاريخ المتطورة للمهام (Touch-Friendly Task Date & Time Picker Modal)
         ========================================================================= -->
    <div class="modal-overlay modal-overlay-custom" id="taskDateTimePickerModal" style="z-index: 100050; display: none;">
      <div class="modal-content-card" style="max-width: 440px; border-radius: 18px; padding: 16px 18px; background: #0c1429; border: 1.2px solid rgba(168, 85, 247, 0.45); box-shadow: 0 12px 40px rgba(0,0,0,0.85);">
        
        <!-- الرأس -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(168,85,247,0.22); color: #c084fc; display: flex; align-items: center; justify-content: center; font-size: 1rem;">
              <i class="fa-regular fa-clock"></i>
            </div>
            <div>
              <div style="font-weight: 900; color: #f8fafc; font-size: 0.94rem;">تحديد موعد وتوقيت المهمة</div>
              <div style="font-size: 0.65rem; color: #94a3b8;">اختر اليوم والوقت بلمسة واحدة بدون تداخل</div>
            </div>
          </div>
          <button type="button" class="btn-close-drawer" onclick="closeTaskDateTimePickerModal()">&times;</button>
        </div>

        <!-- 1. اختيار اليوم (رقائق سريعة + تقويم واضح) -->
        <div style="margin-bottom: 12px;">
          <div style="font-size: 0.76rem; font-weight: 850; color: #cbd5e1; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
            <i class="fa-regular fa-calendar" style="color: #38bdf8;"></i>
            <span>اليوم المستهدف:</span>
          </div>
          <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px;" id="taskModalDateChips">
            <button type="button" class="task-dt-chip active" id="chipModalDateToday" onclick="selectTaskDatePreset('today', this)" style="padding: 5px 9px; border-radius: 7px; font-size: 0.72rem; font-weight: 800; background: rgba(56, 189, 248, 0.22); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.45); cursor: pointer;">☀️ اليوم</button>
            <button type="button" class="task-dt-chip" id="chipModalDateTomorrow" onclick="selectTaskDatePreset('tomorrow', this)" style="padding: 5px 9px; border-radius: 7px; font-size: 0.72rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">🌅 غداً</button>
            <button type="button" class="task-dt-chip" id="chipModalDateAfter2" onclick="selectTaskDatePreset('after2days', this)" style="padding: 5px 9px; border-radius: 7px; font-size: 0.72rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">📅 بعد يومين</button>
            <button type="button" class="task-dt-chip" id="chipModalDateFriday" onclick="selectTaskDatePreset('friday', this)" style="padding: 5px 9px; border-radius: 7px; font-size: 0.72rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">🕌 الجمعة</button>
            <button type="button" class="task-dt-chip" id="chipModalDateNextWeek" onclick="selectTaskDatePreset('nextweek', this)" style="padding: 5px 9px; border-radius: 7px; font-size: 0.72rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">🗓️ الأسبوع القادم</button>
          </div>
          <!-- حقل تاريخ واضح ومنفصل -->
          <input type="date" id="taskCustomPickerDate" class="form-input-custom" onchange="onTaskCustomDateChange(this.value)" style="width: 100%; height: 38px; border-radius: 9px; font-size: 0.85rem; font-weight: 800; background: rgba(15,23,42,0.9); color: #f8fafc; border: 1.2px solid rgba(255,255,255,0.15); padding: 0 10px; box-sizing: border-box;">
        </div>

        <!-- 2. اختيار الساعة والتوقيت (رقائق سريعة + وقت واضح) -->
        <div style="margin-bottom: 14px;">
          <div style="font-size: 0.76rem; font-weight: 850; color: #cbd5e1; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
            <i class="fa-regular fa-clock" style="color: #c084fc;"></i>
            <span>الساعة والتوقيت:</span>
          </div>
          <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px;" id="taskModalTimeChips">
            <button type="button" class="task-time-chip active" onclick="selectTaskTimePreset('10:00', this)" style="padding: 5px 9px; border-radius: 7px; font-size: 0.72rem; font-weight: 800; background: rgba(168, 85, 247, 0.22); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.45); cursor: pointer;">☀️ 10:00 ص (الصباح)</button>
            <button type="button" class="task-time-chip" onclick="selectTaskTimePreset('14:00', this)" style="padding: 5px 9px; border-radius: 7px; font-size: 0.72rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">⛅ 02:00 م (الظهيرة)</button>
            <button type="button" class="task-time-chip" onclick="selectTaskTimePreset('18:00', this)" style="padding: 5px 9px; border-radius: 7px; font-size: 0.72rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">🌙 06:00 م (المساء)</button>
            <button type="button" class="task-time-chip" onclick="selectTaskTimePreset('21:00', this)" style="padding: 5px 9px; border-radius: 7px; font-size: 0.72rem; font-weight: 800; background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.12); cursor: pointer;">🌃 09:00 م (الليل)</button>
          </div>
          <!-- حقل وقت واضح ومنفصل -->
          <input type="time" id="taskCustomPickerTime" class="form-input-custom" onchange="onTaskCustomTimeChange(this.value)" value="10:00" style="width: 100%; height: 38px; border-radius: 9px; font-size: 0.85rem; font-weight: 800; background: rgba(15,23,42,0.9); color: #f8fafc; border: 1.2px solid rgba(255,255,255,0.15); padding: 0 10px; box-sizing: border-box;">
        </div>

        <!-- ملخص الموعد المختار بوضوح تام -->
        <div id="taskDateTimeSummaryBadge" style="background: rgba(168,85,247,0.14); border: 1px solid rgba(168,85,247,0.35); border-radius: 10px; padding: 9px 12px; font-size: 0.80rem; font-weight: 850; color: #e9d5ff; text-align: center; margin-bottom: 14px;">
          الموعد: اليوم، الساعة 10:00 صباحاً
        </div>

        <!-- أزرار الإجراء: تأكيد أو مسح -->
        <div style="display: flex; gap: 8px;">
          <button type="button" onclick="confirmTaskDateTimePicker()" style="flex: 1; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #6366f1); border: none; color: #fff; font-weight: 900; font-size: 0.84rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 3px 12px rgba(168,85,247,0.35);">
            <i class="fa-solid fa-check"></i>
            <span>تأكيد موعد المهمة</span>
          </button>
          <button type="button" onclick="clearTaskDateTimePicker()" style="height: 40px; padding: 0 14px; border-radius: 10px; background: rgba(244,63,94,0.15); border: 1.2px solid rgba(244,63,94,0.4); color: #f43f5e; font-weight: 850; font-size: 0.78rem; cursor: pointer;">
            مسح الموعد
          </button>
        </div>
      </div>
    </div>
'''

tasks_modal_end = html.find('</div>\n    </div>\n\n    <!-- =========================================================================\n         نافذة تسجيل حركة جديدة')
if tasks_modal_end != -1:
    html = html[:tasks_modal_end] + dt_modal_html + html[tasks_modal_end:]
    print("✓ Successfully injected #taskDateTimePickerModal")
else:
    # Inject before </body>
    b_idx = html.rfind('</body>')
    html = html[:b_idx] + dt_modal_html + html[b_idx:]
    print("✓ Fallback: injected #taskDateTimePickerModal before body")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved tasks date-time picker markup.")
