import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_start = text.find('function renderOperationsList(')
pos_end = text.find('function openEditTxModal(', pos_start)

print("renderOperationsList start:", pos_start, "end:", pos_end)
with open('scripts/current_renderOperationsList.js', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos_start:pos_end])

print("Saved scripts/current_renderOperationsList.js, length:", pos_end - pos_start)
