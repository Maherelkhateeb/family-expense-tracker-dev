with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('function fetchTradingViewRates(')
print('start:', start)
end = text.find('\n    function ', start + 100)
if end == -1:
    end = text.find('\n  function ', start + 100)

with open('scripts/fetchTradingViewRates.js', 'w', encoding='utf-8') as f_out:
    f_out.write(text[start:end])
print('wrote fetchTradingViewRates.js, size:', end - start)
