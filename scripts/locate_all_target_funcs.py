import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

funcs = [
    'function renderOperationsList',
    'function renderExpectedList',
    'function renderTasksProList',
    'function closeTasksFullScreenModal',
    'id="tasksFullScreenModal"'
]

for fn in funcs:
    pos = text.find(fn)
    print(f"{fn} found at index: {pos}")
