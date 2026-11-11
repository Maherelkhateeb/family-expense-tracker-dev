import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    c = f.read()

print("--- Swipe / Touch Event Listeners ---")
for m in re.finditer(r'touchstart|touchend|touchmove', c):
    p = m.start()
    print(c[max(0, p-150):min(len(c), p+300)])
    print('='*50)
