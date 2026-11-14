import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Ops amount
p1 = text.find('class="ops-tx-amount-text"')
if p1 != -1:
    print("OPS AMOUNT MATCH:")
    print(repr(text[p1-50:p1+180]))

# 2. btnOpenSummaryDrawer
p2 = text.find('id="btnOpenSummaryDrawer"')
if p2 != -1:
    print("\nBTN OPEN SUMMARY DRAWER MATCH:")
    print(repr(text[p2-60:p2+300]))

# 3. Income history amount
p3 = text.find('closeModal(\'incomeHistoryModal\')')
if p3 != -1:
    # find where cards are rendered in incomeHistory
    p3_render = text.find('incomeHistoryList', p3)
    if p3_render != -1:
        print("\nINCOME HISTORY RENDER:")
        print(repr(text[p3_render-50:p3_render+400]))
    else:
        # search for 'renderIncomeHistory'
        p_inh = text.find('function renderIncomeHistory')
        if p_inh != -1:
            print("\nFUNCTION RENDER INCOME HISTORY:")
            print(repr(text[p_inh:p_inh+400]))
