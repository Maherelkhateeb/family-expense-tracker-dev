# scripts/inspect_tasks_modal_top_block.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="tasksFullScreenModal"')
pos_sticky = text.find('class="tasks-sticky-filter-wrapper"', pos)
print("tasksFullScreenModal top block:")
print(text[pos:pos_sticky])
