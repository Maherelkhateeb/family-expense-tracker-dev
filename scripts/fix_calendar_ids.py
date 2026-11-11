import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix gridEl and container lookups
content = content.replace(
    "const gridEl = document.getElementById('calendarGridContainer');",
    "const gridEl = document.getElementById('tasksCalendarGrid') || document.getElementById('calendarGridContainer');",
    1
)

content = content.replace(
    "const container = document.getElementById('calendarSelectedDayTasksList');",
    "const container = document.getElementById('tasksCalendarDayList') || document.getElementById('calendarSelectedDayTasksList');",
    1
)

content = content.replace(
    "if (title) title.textContent = `مهام يوم: ${dateLabel}`;",
    """if (title) title.textContent = `مهام يوم: ${dateLabel}`;
      const countBadge = document.getElementById('calendarSelectedDayCountBadge');
      if (countBadge) countBadge.textContent = `${dayTasks.length} مهام`;""",
    1
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed Calendar IDs!")
