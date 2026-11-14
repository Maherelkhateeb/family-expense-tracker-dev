with open('scripts/index_56a62fa.html', 'r', encoding='utf-16', errors='ignore') as f:
    text = f.read()

pos_cal = text.find('function renderTasksCalendar')
print("renderTasksCalendar pos:", pos_cal)
pos_cal_end = text.find('function switchTasksViewMode', pos_cal)
if pos_cal_end == -1:
    pos_cal_end = pos_cal + 5000

with open('scripts/calendar_engine_code.js', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos_cal-200:pos_cal_end+3000])

print("Saved calendar engine code to scripts/calendar_engine_code.js")
