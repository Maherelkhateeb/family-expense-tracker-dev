import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m_exp = re.search(r'id=["\']viewExpected["\']', html)
m_nav = re.search(r'id=["\']appBottomNav["\']', html)

if m_exp and m_nav:
    print("viewExpected position:", m_exp.start())
    print("appBottomNav position:", m_nav.start())
    sub = html[m_exp.start():m_nav.start()]
    print("Substring length:", len(sub))
    open_divs = len(re.findall(r'<div\b', sub))
    close_divs = len(re.findall(r'</div\b', sub))
    print(f"Inside viewExpected: open divs = {open_divs}, close divs = {close_divs}")
    
    # Check after nav where viewExpected closes or where body ends
    sub_after = html[m_nav.start():m_nav.start()+2500]
    print("After nav snippet:")
    print(sub_after[:1500])
