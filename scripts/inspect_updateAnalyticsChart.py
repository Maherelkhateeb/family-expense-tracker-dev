with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function updateAnalyticsChart')
if pos != -1:
    print("Found updateAnalyticsChart at pos:", pos)
    with open('scripts/update_analytics_chart.js', 'w', encoding='utf-8') as f_out:
        f_out.write(text[pos:pos+3000])
    print("Saved to scripts/update_analytics_chart.js")
else:
    print("updateAnalyticsChart NOT found")
