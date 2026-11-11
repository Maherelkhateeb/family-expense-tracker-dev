import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find subViewCommitments, panelMonthlyBudget, panelBudgetHistory
idx_sub = content.find('id="subViewCommitments"')
idx_bud = content.find('id="panelMonthlyBudget"')
idx_hist = content.find('id="panelBudgetHistory"')
idx_view_end = content.find('id="appBottomNav"')

print(f"subViewCommitments at: {idx_sub}")
print(f"panelMonthlyBudget at: {idx_bud}")
print(f"panelBudgetHistory at: {idx_hist}")
print(f"appBottomNav at: {idx_view_end}")

# Let's check the end of panelBudgetHistory
idx_hist_end = content.find('</div>', content.find('id="budgetHistoryListContainer"', idx_hist))
idx_hist_end = content.find('</div>', idx_hist_end + 6)
print(f"History container ends near: {idx_hist_end}")
print(content[idx_hist_end-100:idx_hist_end+300])
