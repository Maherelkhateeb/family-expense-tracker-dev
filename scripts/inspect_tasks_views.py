import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inspect Tasks Calendar View
idx_cal = content.find('switchTasksViewMode')
if idx_cal != -1:
    print('=== switchTasksViewMode ===')
    print(content[idx_cal:idx_cal+1200])

idx_cal_render = content.find('renderTasksCalendarView')
if idx_cal_render != -1:
    print('=== renderTasksCalendarView ===')
    print(content[idx_cal_render:idx_cal_render+1200])

# 2. Inspect Tasks Productivity View
idx_prod = content.find('renderTasksProductivityView')
if idx_prod != -1:
    print('=== renderTasksProductivityView ===')
    print(content[idx_prod:idx_prod+800])
