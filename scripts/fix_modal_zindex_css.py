with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add CSS rule for #taskDateTimePickerModal
css_rule = "\n    #taskDateTimePickerModal { z-index: 2000050 !important; }\n"
pos_style = text.find('</style>')
if pos_style != -1:
    text = text[:pos_style] + css_rule + text[pos_style:]
    print("Added CSS rule for #taskDateTimePickerModal")

# 2. Update openTaskDateTimePickerModal in JS to use setProperty with important
text = text.replace(
    "modal.style.zIndex = '2000000';",
    "modal.style.setProperty('z-index', '2000050', 'important');"
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved index.html with z-index 2000050 !important")
