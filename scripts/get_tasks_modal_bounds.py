with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('id="tasksFullScreenModal"')
end = text.find('</main>', start)
print("tasksFullScreenModal start:", start, "end:", end)
print("Total modal length:", end - start)
