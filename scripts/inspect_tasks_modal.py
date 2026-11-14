with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('id="tasksFullScreenModal"')
end = text.find('</main>', start)
print("tasksFullScreenModal start:", start, "end:", end)
with open('scripts/tasks_modal_full.html', 'w', encoding='utf-8') as f_out:
    f_out.write(text[start:end+10])
print("wrote scripts/tasks_modal_full.html, size:", end + 10 - start)
