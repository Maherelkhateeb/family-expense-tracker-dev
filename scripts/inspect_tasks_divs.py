# scripts/inspect_tasks_divs.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_card = text.find('id="tasksUnifiedCreatorCard"')
pos_sticky = text.find('class="tasks-sticky-filter-wrapper"', pos_card)
print(text[pos_card+len(text[pos_card:pos_sticky])-200:pos_sticky+100])
