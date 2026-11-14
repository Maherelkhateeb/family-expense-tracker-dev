import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx_start = text.find('<div id="tasksTabCalendarView"')
idx_end = text.find('id="tasksTabStatsView"')
# The closing </div> for tasksTabCalendarView is right before "<!-- ==========================================================\n           3. التبويب الثالث: شاشة متابعة الإنتاجية (tasksTabStatsView)"
comment_marker = '<!-- ==========================================================\n           3. التبويب الثالث:'
idx_comment = text.find(comment_marker, idx_start)

print("idx_start:", idx_start, "idx_comment:", idx_comment)

replacement_cal_html = """<div id="tasksTabCalendarView" style="display: none; flex-direction: column; gap: 12px;">
        <!-- بطاقة التقويم الشهري التفاعلي -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.2px solid rgba(168, 85, 247, 0.35); border-radius: 16px; padding: 14px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);">
          <!-- شريط تصفح الشهر -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <button type="button" onclick="navigateTasksCalendar(-1)" title="الشهر السابق" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"><i class="fa-solid fa-chevron-right"></i></button>
              <span id="calendarMonthTitle" style="font-size: 0.96rem; font-weight: 900; color: #f8fafc; min-width: 110px; text-align: center;">نوفمبر 2026</span>
              <button type="button" onclick="navigateTasksCalendar(1)" title="الشهر التالي" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"><i class="fa-solid fa-chevron-left"></i></button>
            </div>
            <button type="button" onclick="goToTasksCalendarToday()" style="padding: 5px 12px; border-radius: 8px; font-size: 0.72rem; font-weight: 850; background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.45); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all 0.2s;">
              <i class="fa-solid fa-calendar-day"></i>
              <span>اليوم</span>
            </button>
          </div>

          <!-- شبكة أيام الأسبوع -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 4px; margin-bottom: 8px; font-size: 0.70rem; font-weight: 850; color: #94a3b8;">
            <div>سبت</div><div>أحد</div><div>إثنين</div><div>ثلاثاء</div><div>أربعاء</div><div>خميس</div><div>جمعة</div>
          </div>

          <!-- شبكة أيام الشهر مع مؤشرات المهام النقطية الملونة -->
          <div id="tasksCalendarGrid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
            <!-- تتولد خلايا الأيام ديناميكياً مع النقاط الملونة للمهام -->
          </div>
        </div>

        <!-- قائمة مهام اليوم المختار من التقويم -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.90), rgba(15, 23, 42, 0.95)); border: 1.2px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.35);">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; flex-wrap: wrap; gap: 6px;">
            <div style="font-size: 0.86rem; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-calendar-check" style="color: #a855f7;"></i>
              <span id="calendarSelectedDayTitle">مهام اليوم المختار</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span id="calendarSelectedDayCountBadge" style="font-size: 0.68rem; background: rgba(56, 189, 248, 0.18); color: #38bdf8; padding: 2px 8px; border-radius: 7px; font-weight: 850; border: 1px solid rgba(56, 189, 248, 0.35);">0 مهام</span>
              <button type="button" onclick="openAddTaskForSelectedDate(window.calendarSelectedDate)" title="إضافة مهمة لهذا اليوم" style="height: 28px; padding: 0 10px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 0.70rem; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3); transition: all 0.2s;">
                <i class="fa-solid fa-plus"></i>
                <span>إضافة مهمة</span>
              </button>
            </div>
          </div>
          <div id="tasksCalendarDayList" style="display: flex; flex-direction: column; gap: 8px;">
            <!-- قائمة مهام اليوم المحدد -->
          </div>
        </div>
      </div>

      """

if idx_start != -1 and idx_comment != -1:
    new_text = text[:idx_start] + replacement_cal_html + text[idx_comment:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("tasksTabCalendarView HTML updated successfully!")
else:
    print("Could not locate positions for calendar HTML slice.")
