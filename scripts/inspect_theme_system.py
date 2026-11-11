import sys, re
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_theme = text.find('id="themeDrawerModal"')
print("themeDrawerModal found at:", pos_theme)
if pos_theme != -1:
    print(text[pos_theme:pos_theme+2500])

print("\n--- Searching for theme functions ---")
funcs = re.findall(r'function\s+(?:setTheme|applyTheme|switchTheme|setAppFont|setFontSize|setIconStyle|setCardStyle)\w*\s*\(', text)
print("Theme funcs found:", funcs)
