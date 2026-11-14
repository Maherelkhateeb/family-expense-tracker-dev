#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Apply Universal Clean List Architecture:
1. renderOperationsList:
   - Displays strictly: (1) العملية (2) البيان (3) الرقم (4) التاريخ
   - ONLY when clicked/selected: reveals action buttons (Edit, Delete, Receipt)
2. renderExpectedList:
   - Displays strictly: (1) العملية (2) البيان (3) الرقم (4) التاريخ
   - ONLY when clicked/selected: reveals action buttons (Settle/Pay, Edit, Delete)
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# =========================================================================
# 1. Add global state for selected rows
# =========================================================================
state_init_snippet = '''    window.selectedOperationRowId = null;
    window.selectedExpectedRowId = null;

    function toggleSelectOperationRow(txId) {
      if (window.selectedOperationRowId === txId) {
        window.selectedOperationRowId = null;
      } else {
        window.selectedOperationRowId = txId;
      }
      const allActionDrawers = document.querySelectorAll('.ops-row-actions-drawer');
      allActionDrawers.forEach(d => {
        const id = d.getAttribute('data-drawer-tx-id');
        if (id === window.selectedOperationRowId) {
          d.style.display = 'flex';
        } else {
          d.style.display = 'none';
        }
      });
      document.querySelectorAll('.ops-tx-card-clean').forEach(c => {
        const id = c.getAttribute('data-tx-id');
        if (id === window.selectedOperationRowId) {
          c.style.borderColor = '#38bdf8';
          c.style.background = 'rgba(56, 189, 248, 0.08)';
        } else {
          c.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          c.style.background = 'rgba(15, 23, 42, 0.75)';
        }
      });
    }

    function toggleSelectExpectedRow(expId) {
      if (window.selectedExpectedRowId === expId) {
        window.selectedExpectedRowId = null;
      } else {
        window.selectedExpectedRowId = expId;
      }
      const allDrawers = document.querySelectorAll('.expected-row-actions-drawer');
      allDrawers.forEach(d => {
        const id = d.getAttribute('data-drawer-exp-id');
        if (id === window.selectedExpectedRowId) {
          d.style.display = 'flex';
        } else {
          d.style.display = 'none';
        }
      });
      document.querySelectorAll('.expected-clean-card').forEach(c => {
        const id = c.getAttribute('data-exp-id');
        if (id === window.selectedExpectedRowId) {
          c.style.borderColor = '#38bdf8';
          c.style.background = 'rgba(56, 189, 248, 0.08)';
        } else {
          c.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          c.style.background = 'rgba(15, 23, 42, 0.75)';
        }
      });
    }
'''

# Find insertion point before renderOperationsList
pos_ops = text.find('function renderOperationsList(')
if pos_ops != -1:
    text = text[:pos_ops] + state_init_snippet + '\n\n    ' + text[pos_ops:]
    print("✓ Added global row selection state and handlers!")

# =========================================================================
# 2. Upgrade renderOperationsList cards generation
# =========================================================================
# Find txs.forEach inside renderOperationsList
start_ops_loop = text.find('// كروت الحركات\n        txs.forEach(tx => {')
if start_ops_loop == -1:
    start_ops_loop = text.find('txs.forEach(tx => {', text.find('function renderOperationsList('))

end_ops_loop = text.find('cardsHtml += `\n          </div>\n        `;', start_ops_loop)
if end_ops_loop == -1:
    end_ops_loop = text.find('container.innerHTML = cardsHtml;', start_ops_loop)

print("Found ops loop at:", start_ops_loop, "to:", end_ops_loop)

new_ops_card_code = '''// بناء بطاقة الحركة النظيفة (العملية، البيان، الرقم، التاريخ فقط)
        txs.forEach(tx => {
          const cat = getCategoryObj(tx.category, tx.type);
          const isExp = tx.type === 'expense';
          const amt = Number(tx.amount) || 0;
          const sign = isExp ? '-' : '+';
          const amtColor = isExp ? '#ff4d6d' : '#34d399';
          const memberName = tx.member || 'العائلة';
          const walletName = typeof getWalletName === 'function' ? getWalletName(tx.walletId) : '';
          const isSelected = (window.selectedOperationRowId === tx.id);

          cardsHtml += `
            <div class="ops-tx-card-clean" data-tx-id="${tx.id}" onclick="toggleSelectOperationRow('${tx.id}')" style="background: ${isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15, 23, 42, 0.75)'}; border: 1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 12px; padding: 10px 12px; margin-bottom: 7px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
              
              <!-- الصف الرئيسي النظيف: العملية والبيان على اليمين | الرقم والتاريخ على اليسار -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <!-- العملية + البيان -->
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                  <div style="width: 38px; height: 38px; border-radius: 10px; background: ${cat.color ? cat.color + '22' : 'rgba(56, 189, 248, 0.15)'}; border: 1px solid ${cat.color ? cat.color + '55' : 'rgba(56, 189, 248, 0.3)'}; color: ${cat.color || '#38bdf8'}; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; flex-shrink: 0;">
                    <i class="fa-solid ${cat.icon || 'fa-receipt'}"></i>
                  </div>
                  <div style="min-width: 0; flex: 1;">
                    <div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${escapeHtml(tx.label || cat.name || 'بدون بيان')}
                    </div>
                    <div style="font-size: 0.70rem; color: #94a3b8; margin-top: 1px; display: flex; align-items: center; gap: 5px;">
                      <span style="color: ${cat.color || '#38bdf8'}; font-weight: 750;">${cat.name}</span>
                      ${tx.receipt ? '<span style="color: #f472b6; font-size: 0.65rem;"><i class="fa-solid fa-paperclip"></i> إيصال</span>' : ''}
                    </div>
                  </div>
                </div>

                <!-- الرقم + التاريخ -->
                <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0;">
                  <div style="color: ${amtColor}; font-weight: 950; font-size: 0.95rem; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate;">
                    ${sign} ${formatMoneyVal(amt)}
                  </div>
                  <div style="font-size: 0.65rem; color: #64748b; font-weight: 700; margin-top: 2px;">
                    ${tx.time ? tx.time + ' • ' : ''}${tx.date || dateStr}
                  </div>
                </div>
              </div>

              <!-- شريط الخيارات والإجراءات: يظهر فقط عند اختيار الحركة -->
              <div class="ops-row-actions-drawer" data-drawer-tx-id="${tx.id}" style="display: ${isSelected ? 'flex' : 'none'}; align-items: center; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.12); flex-wrap: wrap; gap: 6px;">
                <div style="font-size: 0.68rem; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
                  <span>👤 ${escapeHtml(memberName)}</span>
                  <span>•</span>
                  <span>💳 ${escapeHtml(walletName)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  ${tx.receipt ? `
                    <button type="button" onclick="event.stopPropagation(); openReceiptLightbox('${tx.receipt}', 'فاتورة: ${escapeHtml(tx.label || cat.name)}')" style="padding: 4px 9px; border-radius: 7px; background: rgba(236, 72, 153, 0.2); border: 1px solid rgba(236, 72, 153, 0.4); color: #f472b6; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                      <i class="fa-solid fa-file-invoice"></i>
                      <span>الإيصال</span>
                    </button>
                  ` : ''}
                  <button type="button" onclick="event.stopPropagation(); openEditTxModal('${tx.id}')" style="padding: 4px 10px; border-radius: 7px; background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-pen-to-square"></i>
                    <span>تعديل</span>
                  </button>
                  <button type="button" onclick="event.stopPropagation(); deleteTx('${tx.id}')" style="padding: 4px 9px; border-radius: 7px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <i class="fa-solid fa-trash-can"></i>
                    <span>حذف</span>
                  </button>
                </div>
              </div>

            </div>
          `;
        });
'''

# Find the exact loop in renderOperationsList
idx1 = text.find('// كروت الحركات\n        txs.forEach(tx => {')
if idx1 != -1:
    idx2 = text.find('cardsHtml += `\n          <div class="ops-date-group-header">', idx1)
    if idx2 == -1:
        idx2 = text.find('container.innerHTML = cardsHtml;', idx1)
    # find the end of this forEach
    # The loop ends at the closing brace of txs.forEach
    # let's look for `cardsHtml += `\n            </div>\n          `;\n        });`
    pattern = 'cardsHtml += `\n            <div class="ops-tx-card-lux"'
    pos_pat = text.find(pattern, idx1)
    if pos_pat != -1:
        pos_loop_end = text.find('});\n      }\n\n      // 7. تحديث إحصائيات الهيدر المصرفي', pos_pat)
        if pos_loop_end == -1:
            pos_loop_end = text.find('container.innerHTML = cardsHtml;', pos_pat)
        print("Found exact ops card generator boundaries:", pos_pat, "to:", pos_loop_end)
        text = text[:idx1] + new_ops_card_code + '\n      }\n\n      // 7. تحديث إحصائيات الهيدر المصرفي' + text[pos_loop_end + len('});\n      }\n\n      // 7. تحديث إحصائيات الهيدر المصرفي'):]
        print("✓ Successfully replaced renderOperationsList cards generator!")

# Helper for formatMoneyVal if not present in scope
if 'function formatMoneyVal(' not in text:
    text = text.replace(
        'window.selectedOperationRowId = null;',
        '''window.selectedOperationRowId = null;
    function formatMoneyVal(v) {
      const converted = typeof convertAmount === 'function' ? convertAmount(v) : v;
      const curr = typeof getCurrencySymbol === 'function' ? getCurrencySymbol() : (state.currency || 'ج.م');
      return Number(converted || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + curr;
    }'''
    )

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved index.html with universal clean operations list!")
