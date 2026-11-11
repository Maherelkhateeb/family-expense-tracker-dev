with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_cal = text.find('id="tasksTabCalendarView"')
print("tasksTabCalendarView pos:", pos_cal)
with open('scripts/cal_view_preview.html', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos_cal:pos_cal+2500])
print("Written cal view preview")
