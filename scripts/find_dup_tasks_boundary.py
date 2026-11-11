with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos2 = 1934246
pos_notif = text.find('function openNotificationsModal(', pos2)
print("pos2:", pos2)
print("pos_notif:", pos_notif)
print("Duplicate length to delete:", pos_notif - pos2)
