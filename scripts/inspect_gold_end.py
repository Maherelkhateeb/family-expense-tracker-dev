import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m_gold = html.find('id="goldDrawerPanel"')
# search for the first modal after goldDrawerPanel
m_modal = re.search(r'<div[^>]*id=["\'](txModal|modal|authModal|settingsModal)', html[m_gold:])
if m_modal:
    idx = m_gold + m_modal.start()
    print("Found modal at:", idx)
    print("Snippet between goldDrawer and first modal:")
    print(html[idx-400:idx+200])
