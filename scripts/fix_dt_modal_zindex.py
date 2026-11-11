import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('id="taskDateTimePickerModal" style="z-index: 100050; display: none;"', 'id="taskDateTimePickerModal" style="z-index: 1000050 !important; display: none;"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated taskDateTimePickerModal z-index")
