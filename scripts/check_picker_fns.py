with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

fns = [
    'openTaskDateTimePickerModal',
    'closeTaskDateTimePickerModal',
    'selectTaskDatePreset',
    'selectTaskTimePreset',
    'confirmTaskDateTimePicker',
    'clearTaskDateTimePicker'
]
for fn in fns:
    print(f"function {fn}: {fn in text}")
