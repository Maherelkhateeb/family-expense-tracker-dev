with open('scripts/verify_v524_comprehensive.py', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    'await page.click("button:has-text(\'إضافة\')")',
    'await page.locator("#tasksFullScreenModal button[onclick=\'handleQuickTaskAdd()\']").click()'
)

with open('scripts/verify_v524_comprehensive.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated add button selector to strict ID/onclick")
