with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for term in ['tasksCategoryPillsStrip', 'tasksSmartListTabs', 'tasksSearchInput', 'tasksMemberFilterPills', 'tasksFullScreenContainerList']:
    print(f"term '{term}': {text.find(term)}")
