with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('function getTodoTasks()')
end = text.find('\n    // =========================================================================\n    // محرك الفئات الذكية', start)
if end == -1:
    end = text.find('function openTasksModal()', start)

print("Tasks JS start:", start, "end:", end)
