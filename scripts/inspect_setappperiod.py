with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function setAppPeriod')
print("setAppPeriod pos:", pos)
with open('scripts/set_app_period_code.js', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos:pos+1500])

print("Written to scripts/set_app_period_code.js")
