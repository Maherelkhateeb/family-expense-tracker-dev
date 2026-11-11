import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('function executeMasterUnifiedSyncAndRefresh')
print(content[idx-20:idx+80])
