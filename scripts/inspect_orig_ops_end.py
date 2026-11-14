import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('scripts/current_renderOperationsList.js', 'r', encoding='utf-8') as f:
    text = f.read()

pos_end = text.find('function loadMoreOperations(')
print(text[pos_end-600:pos_end+100])
