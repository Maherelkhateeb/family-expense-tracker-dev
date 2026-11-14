with open('scripts/index_56a62fa.html', 'r', encoding='utf-16', errors='ignore') as f:
    text = f.read()

import re
pos_cal = text.find('function renderTasksCalendar')
print("renderTasksCalendar in 56a62fa:", pos_cal)
if pos_cal != -1:
    print(text[pos_cal:pos_cal+2000])
