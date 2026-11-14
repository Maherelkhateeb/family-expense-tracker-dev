# scripts/inspect_tasks_full_modal.py
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="tasksFullScreenModal"')
pos_end = text.find('<!-- =============================================\n       مودال', pos)
if pos_end == -1:
    pos_end = text.find('</main>', pos) + 500

print(f"tasksFullScreenModal starts at {pos}, length: {pos_end - pos}")
with open('scripts/tasks_modal_content.txt', 'w', encoding='utf-8') as out:
    out.write(text[pos:pos+16000])

print("Written first 16000 chars to scripts/tasks_modal_content.txt")
