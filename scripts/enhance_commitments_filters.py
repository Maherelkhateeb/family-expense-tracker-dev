import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Enhance renderCommitmentsBillsList
old_b_filter = """      let list = allBills.slice();
      if (activeBillsFilterStatus === 'upcoming') {
        list = list.filter(b => b.status !== 'paid');
      } else if (activeBillsFilterStatus === 'paid') {
        list = list.filter(b => b.status === 'paid');
      }"""

new_b_filter = """      let list = allBills.slice();
      if (activeCommitmentSubFilter === 'settled' || activeBillsFilterStatus === 'paid') {
        list = list.filter(b => b.status === 'paid');
      } else {
        list = list.filter(b => b.status !== 'paid');
      }"""

if old_b_filter in content:
    content = content.replace(old_b_filter, new_b_filter, 1)
    print("Updated bills list filtering.")

# Enhance renderCommitmentsDebtsList
old_d_filter = """      let list = allDebts.slice();
      if (activeDebtsFilterStatus === 'debt_on_us') {
        list = list.filter(d => (d.type === 'debt_on_us' || d.type === 'debt') && d.status !== 'paid');
      } else if (activeDebtsFilterStatus === 'debt_for_us') {
        list = list.filter(d => d.type === 'debt_for_us' && d.status !== 'paid');
      } else if (activeDebtsFilterStatus === 'paid') {
        list = list.filter(d => d.status === 'paid');
      }"""

new_d_filter = """      let list = allDebts.slice();
      if (activeCommitmentSubFilter === 'debts_on_us' || activeDebtsFilterStatus === 'debt_on_us') {
        list = list.filter(d => (d.type === 'debt_on_us' || d.type === 'debt') && d.status !== 'paid');
      } else if (activeCommitmentSubFilter === 'debts_for_us' || activeDebtsFilterStatus === 'debt_for_us') {
        list = list.filter(d => d.type === 'debt_for_us' && d.status !== 'paid');
      } else if (activeCommitmentSubFilter === 'settled' || activeDebtsFilterStatus === 'paid') {
        list = list.filter(d => d.status === 'paid');
      } else {
        list = list.filter(d => d.status !== 'paid');
      }"""

if old_d_filter in content:
    content = content.replace(old_d_filter, new_d_filter, 1)
    print("Updated debts list filtering.")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Filtering rules unified.")
