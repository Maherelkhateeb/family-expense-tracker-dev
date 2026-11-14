import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_start = text.find('function renderTasksProList(')
pos_end = text.find('// =========================================================================\n    // نهاية نظام المهام', pos_start)
if pos_end == -1:
    pos_end = text.find('</script>', pos_start)

print("renderTasksProList start:", pos_start, "end:", pos_end)
with open('scripts/current_renderTasksProList_full.js', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos_start:pos_end])

print("Saved scripts/current_renderTasksProList_full.js, length:", pos_end - pos_start)
