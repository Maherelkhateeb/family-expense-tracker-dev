with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Update z-index of taskDateTimePickerModal
text = text.replace(
    'id="taskDateTimePickerModal" style="z-index: 1000050 !important; display: none;"',
    'id="taskDateTimePickerModal" style="position: fixed; inset: 0; z-index: 2000000 !important; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.75);"'
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated taskDateTimePickerModal z-index to 2000000")
