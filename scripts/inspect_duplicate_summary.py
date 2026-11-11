import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Snippet 1
m1 = html.find("let currentSummaryPeriod = 'day';")
print("=== First occurrence ===")
print(html[m1-200:m1+300])

# Legacy functions
m_leg = html.find("openSummaryDrawer_Legacy")
print("=== Legacy block ===")
print(html[m_leg-200:m_leg+1500])
