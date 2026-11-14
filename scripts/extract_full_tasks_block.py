with open('scripts/index_8e95c9b.html', 'r', encoding='utf-16', errors='ignore') as f:
    text = f.read()

import re
pos_start = text.find('function openTasksFullScreenModal')
print("pos_start:", pos_start)

# Find where this block ends
pos_end = text.find('</script>', pos_start)
print("pos_end:", pos_end)

tasks_block = text[pos_start:pos_end]
print(f"Tasks block length: {len(tasks_block)} characters")

with open('scripts/tasks_engine_block.js', 'w', encoding='utf-8') as f_out:
    f_out.write(tasks_block)

print("Saved to scripts/tasks_engine_block.js")
