with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function setAnalyticsPeriod')
with open('scripts/analytics_period_fn.js', 'w', encoding='utf-8') as f_out:
    f_out.write(text[pos:pos+2500])

print("Written to scripts/analytics_period_fn.js")
