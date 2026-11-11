import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

modal_ids = [
    'walletModal', 'transferModal', 'walletStatementModal', 
    'newBudgetPlanModal', 'payExpenseModal', 'actualBalanceAuditModal',
    'incomeChoiceModal', 'editTxModal', 'smsModal', 'permModal'
]

for mid in modal_ids:
    idx = text.find(f'id="{mid}"')
    if idx != -1:
        print(f'=== MODAL: {mid} ===')
        print(text[idx:idx+800])
        print('-'*40)
