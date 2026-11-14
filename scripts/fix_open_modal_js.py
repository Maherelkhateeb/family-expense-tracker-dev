with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "modal.style.zIndex = '1000050';",
    "modal.style.zIndex = '2000000'; modal.style.position = 'fixed'; modal.style.inset = '0'; modal.style.display = 'flex'; modal.style.alignItems = 'center'; modal.style.justifyContent = 'center';"
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated openTaskDateTimePickerModal zIndex in JS")
