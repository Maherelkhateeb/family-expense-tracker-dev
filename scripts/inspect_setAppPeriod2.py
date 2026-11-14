with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function setAppPeriod')
with open('scripts/set_app_period_full.js', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos:pos+3000])

print("Written to scripts/set_app_period_full.js")
