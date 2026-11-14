import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('let quickTaskDueDatePreset =')
if start == -1:
    start = text.find('function setQuickTaskPreset(')

end = text.find('function toggleDrawerTaskCompletion(', start)
print("Quick add block start:", start, "end:", end)
print(text[start:end])
