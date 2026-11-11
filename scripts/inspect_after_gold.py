import sys, io, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

m_gold = html.find('id="goldDrawerPanel"')
m_gold_end = html.find('</div>', html.find('<!-- ترويسة البورصة العلوية', m_gold))
# let's find the closing of goldDrawerPanel
# Search for next top-level elements after goldDrawerPanel
modals = re.findall(r'<div[^>]*class=["\'][^"\']*modal-overlay', html[m_gold:m_gold+50000])
print(f"Modals found after goldDrawerPanel: {len(modals)}")

# Search for </main> or </body> or end of appFrame
print("Searching for closing of appFrame...")
idx_next_sec = html.find('<!-- ============================================== \n         نوافذ الحوار والتأكيد (Modal Dialogs)', m_gold)
if idx_next_sec == -1:
    idx_next_sec = html.find('Modal Dialogs', m_gold)
print("Modal dialogs comment at:", idx_next_sec)
if idx_next_sec != -1:
    print(html[idx_next_sec-400:idx_next_sec+400])
