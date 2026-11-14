with open('scripts/tasks_engine_block.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos_pro = text.find('function renderTasksProList')
pos_pro_end = text.find('function handleQuickTaskAdd', pos_pro)
print("renderTasksProList length:", pos_pro_end - pos_pro)

with open('scripts/render_tasks_snippet.js', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos_pro:pos_pro_end])
print("Saved renderTasksProList snippet")
