with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_start = 777300
pos_end = 781250
with open('scripts/tasks_filters_snippet.html', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos_start:pos_end])

print("Written tasks filters snippet")
