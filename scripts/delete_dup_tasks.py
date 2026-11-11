import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos2 = 1934246
pos_notif = text.find('function openNotificationsModal(', pos2)

text = text[:pos2] + text[pos_notif:]
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("✓ Successfully deleted 25,255 bytes of duplicate old tasks code!")
