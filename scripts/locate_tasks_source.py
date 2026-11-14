with open('scripts/index_8e95c9b.html', 'r', encoding='utf-16', errors='ignore') as f:
    text = f.read()

pos_start = text.find('function openTasksFullScreenModal')
# find script tag opening before pos_start
script_start = text.rfind('<script', 0, pos_start)
script_end = text.find('</script>', pos_start)

print("Script containing openTasksFullScreenModal starts at:", script_start)
print("Context before openTasksFullScreenModal (200 chars):")
print(repr(text[pos_start-200:pos_start]))
print("\nContext around script end (200 chars):")
print(repr(text[script_end-200:script_end+50]))
