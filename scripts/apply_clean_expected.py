#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Upgrade renderExpectedList:
- Cards display ONLY: (1) العملية (2) البيان (3) الرقم (4) التاريخ
- ONLY on click/selection: reveals the action drawer (Settle/Collect, Edit, Delete, Receipt, Member)
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_fn = text.find('function renderExpectedList(')
pos_loop_start = text.find('list.forEach(item => {', pos_fn)
pos_loop_end = text.find('container.appendChild(card);', pos_loop_start)

if pos_loop_start == -1 or pos_loop_end == -1:
    print("Error: Could not locate expected loop")
    sys.exit(1)

pos_loop_end_full = text.find('});\n    }', pos_loop_end)
if pos_loop_end_full == -1:
    pos_loop_end_full = text.find('});', pos_loop_end)

new_expected_card_code = '''list.forEach(item => {
        const card = document.createElement('div');
        const isPaid = item.status === 'paid';
        const isUpcoming = item.type === 'upcoming_bill';
        const isDebtOnUs = item.type === 'debt_on_us';
        const isDebtForUs = item.type === 'debt_for_us';
        const isSelected = (window.selectedExpectedRowId === item.id);

        let iconClass = 'fa-solid fa-receipt';
        let iconColor = '#fbbf24';
        let typeName = 'مصروف قادم';
        let sign = '-';
        let amtColor = '#fbbf24';

        if (isDebtOnUs) {
          iconClass = 'fa-solid fa-arrow-down-long';
          iconColor = '#f87171';
          typeName = 'دين علينا';
          sign = '-';
          amtColor = '#f87171';
        } else if (isDebtForUs) {
          iconClass = 'fa-solid fa-arrow-up-long';
          iconColor = '#34d399';
          typeName = 'دين لنا';
          sign = '+';
          amtColor = '#34d399';
        }

        if (isPaid) {
          iconClass = 'fa-solid fa-circle-check';
          iconColor = '#38bdf8';
          typeName = 'مسدد';
          amtColor = '#94a3b8';
        }

        const numFormatted = fmtNum(Number(item.amount) || 0);

        card.className = 'expected-clean-card';
        card.setAttribute('data-exp-id', item.id);
        card.onclick = () => toggleSelectExpectedRow(item.id);
        card.style.cssText = `
          background: ${isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15, 23, 42, 0.75)'};
          border: 1px solid ${isSelected ? '#38bdf8' : (isPaid ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.08)')};
          border-radius: 12px;
          padding: 10px 12px;
          margin-bottom: 7px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          gap: 6px;
        `;

        // الصف الرئيسي النظيف: العملية والبيان | الرقم والتاريخ
        const mainRowHtml = `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <!-- العملية + البيان -->
            <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: ${iconColor}22; border: 1px solid ${iconColor}55; color: ${iconColor}; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; flex-shrink: 0;">
                <i class="${iconClass}"></i>
              </div>
              <div style="min-width: 0; flex: 1;">
                <div style="font-size: 0.88rem; font-weight: 850; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${escapeHtml(item.title || typeName)}
                </div>
                <div style="font-size: 0.70rem; color: #94a3b8; margin-top: 1px; display: flex; align-items: center; gap: 6px;">
                  <span style="color: ${iconColor}; font-weight: 750;">${typeName}</span>
                  <span>•</span>
                  <span>👤 ${escapeHtml(item.member || 'البيت')}</span>
                  ${item.priority === 'urgent' ? '<span style="color: #f87171; font-size: 0.62rem;"><i class="fa-solid fa-bolt"></i> عاجل</span>' : ''}
                </div>
              </div>
            </div>

            <!-- الرقم + تاريخ الاستحقاق -->
            <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0;">
              <div style="color: ${amtColor}; font-weight: 950; font-size: 0.95rem; font-family: var(--font-numbers); direction: ltr; unicode-bidi: isolate;">
                ${sign} ${numFormatted} <span style="font-size: 0.72rem; opacity: 0.9;">${curr}</span>
              </div>
              <div style="font-size: 0.65rem; color: #64748b; font-weight: 700; margin-top: 2px;">
                📅 ${item.dueDate || 'بدون موعد'}
              </div>
            </div>
          </div>
        `;

        // شريط الخيارات والإجراءات: يظهر فقط عند النقر واختيار الالتزام
        const photoUri = item.settleReceipt || item.photo;
        const actionsDrawerHtml = `
          <div class="expected-row-actions-drawer" data-drawer-exp-id="${item.id}" style="display: ${isSelected ? 'flex' : 'none'}; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.12); flex-wrap: wrap; gap: 6px;">
            <div style="font-size: 0.68rem; color: #94a3b8;">
              ${item.notes ? `<span>📝 ${escapeHtml(item.notes)}</span>` : `<span>الحالة: ${isPaid ? 'مسدد بالكامل ✅' : 'مستحق السداد ⏳'}</span>`}
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              ${photoUri ? `
                <button type="button" onclick="event.stopPropagation(); openReceiptLightbox('${photoUri}', 'مستند: ${escapeHtml(item.title)}')" style="padding: 4px 9px; border-radius: 7px; background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-paperclip"></i>
                  <span>مستند</span>
                </button>
              ` : ''}
              ${!isPaid ? `
                <button type="button" onclick="event.stopPropagation(); ${isDebtForUs ? `collectDebtForUs('${item.id}')` : `openSettleExpectedModal('${item.id}')`}" style="padding: 5px 12px; border-radius: 7px; background: linear-gradient(135deg, ${isDebtForUs ? '#059669, #047857' : '#0284c7, #0369a1'}); border: none; color: #fff; font-size: 0.72rem; font-weight: 850; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                  <i class="fa-solid fa-circle-check"></i>
                  <span>${isDebtForUs ? 'تحصيل وإيداع' : 'سداد وصرف'}</span>
                </button>
              ` : ''}
              <button type="button" onclick="event.stopPropagation(); openEditExpectedModal('${item.id}')" style="padding: 4px 9px; border-radius: 7px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #cbd5e1; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-pen-to-square"></i>
                <span>تعديل</span>
              </button>
              <button type="button" onclick="event.stopPropagation(); deleteExpectedItem('${item.id}')" style="padding: 4px 9px; border-radius: 7px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; font-size: 0.70rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-trash-can"></i>
                <span>حذف</span>
              </button>
            </div>
          </div>
        `;

        card.innerHTML = mainRowHtml + actionsDrawerHtml;
        container.appendChild(card);
      });'''

text = text[:pos_loop_start] + new_expected_card_code + text[pos_loop_end_full+3:]
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("✓ Successfully upgraded renderExpectedList to clean row with expandable action drawer on selection!")
