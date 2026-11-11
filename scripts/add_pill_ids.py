import sys

INDEX_PATH = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = '''            <div style="display: flex; gap: 6px; align-items: center;" id="opsTypeFilterPills">
              <button class="btn-export-tool active" onclick="setOpsTypeFilter('all', this)" style="border-radius: 10px; font-weight: 800; padding: 6px 14px; background: rgba(56, 189, 248, 0.2); color: #38bdf8;">
                <i class="fa-solid fa-layer-group"></i> كافة العمليات
              </button>
              <button class="btn-export-tool" onclick="setOpsTypeFilter('expense', this)" style="border-radius: 10px; font-weight: 800; padding: 6px 14px; color: #f43f5e;">
                <i class="fa-solid fa-arrow-up-right"></i> المصروفات
              </button>
              <button class="btn-export-tool" onclick="setOpsTypeFilter('income', this)" style="border-radius: 10px; font-weight: 800; padding: 6px 14px; color: #10b981;">
                <i class="fa-solid fa-arrow-down-left"></i> الإيداعات والدخل
              </button>
            </div>'''

new_block = '''            <div style="display: flex; gap: 6px; align-items: center;" id="opsTypeFilterPills">
              <button id="btnOpsFilterAll" class="btn-export-tool active" onclick="setOpsTypeFilter('all', this)" style="border-radius: 10px; font-weight: 800; padding: 6px 14px; background: rgba(56, 189, 248, 0.2); color: #38bdf8;">
                <i class="fa-solid fa-layer-group"></i> كافة العمليات
              </button>
              <button id="btnOpsFilterExpenses" class="btn-export-tool" onclick="setOpsTypeFilter('expense', this)" style="border-radius: 10px; font-weight: 800; padding: 6px 14px; color: #f43f5e;">
                <i class="fa-solid fa-arrow-up-right"></i> المصروفات
              </button>
              <button id="btnOpsFilterIncome" class="btn-export-tool" onclick="setOpsTypeFilter('income', this)" style="border-radius: 10px; font-weight: 800; padding: 6px 14px; color: #10b981;">
                <i class="fa-solid fa-arrow-down-left"></i> الإيداعات والدخل
              </button>
            </div>'''

if old_block in content:
    content = content.replace(old_block, new_block, 1)
    with open(INDEX_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added IDs to opsTypeFilterPills successfully.")
else:
    print("Error: old_block not found.")
