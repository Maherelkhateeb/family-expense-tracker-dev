import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's search for settingsModal
s_modal = html.find('id="settingsModal"')
if s_modal != -1:
    print(f"settingsModal found at index: {s_modal}")
    print(html[s_modal:s_modal+3500])
else:
    print("settingsModal NOT found!")

# Let's search for "ألوان ونمط الأيقونات"
m_icons = html.find('ألوان ونمط الأيقونات')
print(f"'ألوان ونمط الأيقونات' index: {m_icons}")
if m_icons != -1:
    print(html[m_icons-200:m_icons+600])

# Let's search for "مركز الضبط"
m_center = list(re.finditer(r'مركز الضبط|openSettingsModal', html))
print(f"Settings center matches: {len(m_center)}")
for mc in m_center[:6]:
    print(f"[{mc.start()}]: {html[mc.start()-50:mc.start()+150]}\n---")
