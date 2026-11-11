# scripts/check_cal_vars.py
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for term in ['calendarCurrentMonth', 'calendarCurrentYear', 'calendarSelectedDate', 'arabicMonths', 'navigateTasksCalendar', 'goToTasksCalendarToday']:
    matches = [m.start() for m in re.finditer(term, text)]
    print(f"{term}: {len(matches)} occurrences at {matches}")
