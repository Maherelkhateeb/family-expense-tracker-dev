import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('function fetchTradingViewRates()')
print('start:', start)
end = text.find('\n    // =========================================================================\n    // محرك البدء الشامل والموازنة التلقائية', start)
print('end:', end)

if start != -1 and end != -1:
    print("Found exact function block, size:", end - start)
