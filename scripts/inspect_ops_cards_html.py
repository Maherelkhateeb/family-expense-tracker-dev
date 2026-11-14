with open('scripts/current_renderOperationsList.js', 'r', encoding='utf-8') as f:
    text = f.read()[:13238]

idx = text.find('cardsHtml += `')
print(text[idx:idx+3500])
