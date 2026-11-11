with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos = text.find("navigator.serviceWorker.register")
if pos != -1:
    print("Found serviceWorker.register:")
    print(text[pos-200:pos+800])
else:
    print("serviceWorker.register NOT found")
