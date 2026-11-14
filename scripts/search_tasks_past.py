for ver, path in [('8e95c9b', 'scripts/index_8e95c9b.html'), ('56a62fa', 'scripts/index_56a62fa.html')]:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
    except:
        with open(path, 'r', encoding='utf-16', errors='ignore') as f:
            text = f.read()
    import re
    m = re.findall(r'function\s+([a-zA-Z0-9_]*task[a-zA-Z0-9_]*)', text, re.I)
    print(f"Version {ver} task functions:", len(m))
    for name in sorted(set(m)):
        print(f"  {name}")
    
    for term in ['tasksFullScreenModal', 'openTasks', 'openTasksDrawer', 'renderTasksCalendar']:
        matches = [m.start() for m in re.finditer(term, text)]
        print(f"  term '{term}': {len(matches)} occurrences")
