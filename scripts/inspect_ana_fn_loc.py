with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pos_ana = text.find('function setAnalyticsPeriod')
print("pos_ana:", pos_ana)
print(text[pos_ana:pos_ana+400])
