import sys, re
sys.stdout.reconfigure(encoding='utf-8')
content = open('index.html', encoding='utf-8').read()

for marker in ['التخطيط المالي والالتزامات', 'الميزانية التقديرية', 'قائمة الالتزامات',
               'commitments', 'commitmentsSection', 'الالتزامات والميزانية']:
    idx = content.find(marker)
    if idx >= 0:
        near = content[max(0,idx-300):idx+100]
        ids_near = re.findall(r'id="([^"]+)"', near)
        print(f'FOUND {marker!r} at {idx}')
        print(f'  Nearby IDs: {ids_near}')
        print()
