import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = 1660805
s5 = text[pos:]
import re
matches = [m.start() for m in re.finditer(r'</script>', s5)]
print('All </script> in s5:', matches)
if matches:
    for p in matches:
        print('Around', p, repr(s5[p-50:p+50]))
else:
    print('NO </script> IN S5 AT ALL!')
