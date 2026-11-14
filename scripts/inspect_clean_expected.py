import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

for query in ['فاتورة مسجلة', 'بيان / اسم الفاتورة', 'حفظ وتثبيت الفاتورة', 'secAddBillForm', 'panelAddBill', 'addBillForm', 'secExpectedAddForm']:
    idx = text.find(query)
    print(f"'{query}': {idx}")
    if idx != -1:
        print(text[max(0, idx-100):min(len(text), idx+500)])
        break
