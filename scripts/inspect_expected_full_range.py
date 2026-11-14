import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

s = html.find('<div class="expected-top-hero"')
e = html.find('<!-- ==========================================================\n             3. لوحة سجل الميزانيات المحفوظة (panelBudgetHistory)')
print(f"Replacement range: {s} to {e} (length {e-s})")
print(html[s:s+400])
print("... [tail] ...")
print(html[e-300:e])
