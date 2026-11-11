import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS: Add .amount-flow-cluster and enhanced task styles before </style>
css_marker = "  </style>\n</head>"
new_css = """    /* نسق تدفق المبالغ والعملة: علامة الزائد والناقص يمين الرقم ورمز العملة يسار الرقم */
    .amount-flow-cluster {
      display: inline-flex !important;
      flex-direction: row !important;
      align-items: baseline !important;
      gap: 3px !important;
      direction: rtl !important;
      unicode-bidi: isolate !important;
      white-space: nowrap !important;
    }
    .amount-flow-cluster .tx-sign-symbol {
      font-weight: 900 !important;
      font-size: 1.05em !important;
      line-height: 1 !important;
      margin-left: 2px !important;
      flex-shrink: 0 !important;
    }
    .amount-flow-cluster .tx-sign-symbol.sign-expense {
      color: #f43f5e !important;
    }
    .amount-flow-cluster .tx-sign-symbol.sign-income {
      color: #10b981 !important;
    }
    .amount-flow-cluster .tx-number-val {
      font-family: var(--font-numbers) !important;
      font-variant-numeric: tabular-nums !important;
      font-weight: 900 !important;
      line-height: 1 !important;
    }
    .amount-flow-cluster .tx-currency-label {
      font-size: 0.74em !important;
      font-weight: 800 !important;
      opacity: 0.9 !important;
      margin-right: 2px !important;
      flex-shrink: 0 !important;
    }

    /* تحسينات متقدمة لنظام المهام والخطوات الفرعية الاحترافي */
    .task-card-item {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%) !important;
      border: 1.3px solid rgba(168, 85, 247, 0.35) !important;
      border-radius: 16px !important;
      padding: 12px 14px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.40) !important;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    .task-card-item:hover {
      border-color: rgba(168, 85, 247, 0.60) !important;
      box-shadow: 0 6px 22px rgba(168, 85, 247, 0.18) !important;
    }
    .task-card-item.is-overdue {
      border-color: rgba(239, 68, 68, 0.75) !important;
      box-shadow: 0 0 16px rgba(239, 68, 68, 0.22) !important;
    }
    .task-card-item.is-today {
      border-color: rgba(245, 158, 11, 0.75) !important;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.20) !important;
    }
    .task-card-item.is-completed {
      border-color: rgba(52, 211, 153, 0.45) !important;
      opacity: 0.85 !important;
    }
    .task-check-circle {
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
      cursor: pointer !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 0.15s ease !important;
    }
    .task-check-circle:active {
      transform: scale(0.85) !important;
    }
    .subtask-row-item {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 8px !important;
      background: rgba(15, 23, 42, 0.65) !important;
      border: 1px solid rgba(255, 255, 255, 0.06) !important;
      border-radius: 8px !important;
      padding: 6px 8px !important;
      transition: background 0.15s ease !important;
    }
    .subtask-row-item:hover {
      background: rgba(30, 41, 59, 0.85) !important;
      border-color: rgba(168, 85, 247, 0.30) !important;
    }
    .subtask-row-item.done {
      opacity: 0.72 !important;
    }
  </style>
</head>"""

if css_marker in content:
    content = content.replace(css_marker, new_css, 1)
    print("1. Added CSS styles successfully.")
else:
    print("WARNING: css_marker not found!")

# 2. Add btnOpenTasksDrawer in quick tools strip
drawer_btn_target = """          <!-- زر درج ملخص النشاط المالي الشامل (يفتح من اليسار) -->
          <button type="button" class="tool-pill-action" id="btnOpenSummaryDrawer" onclick="openSummaryDrawer()" title="ملخص العمليات والنشاط المالي (اليوم / الأسبوع / الشهر / السنة)">
            <i class="fa-solid fa-chart-pie"></i>
            <span>ملخص</span>
          </button>"""

drawer_btn_replacement = """          <!-- زر درج ملخص النشاط المالي الشامل (يفتح من اليسار) -->
          <button type="button" class="tool-pill-action" id="btnOpenSummaryDrawer" onclick="openSummaryDrawer()" title="ملخص العمليات والنشاط المالي (اليوم / الأسبوع / الشهر / السنة)">
            <i class="fa-solid fa-chart-pie"></i>
            <span>ملخص</span>
          </button>

          <!-- زر درج المهام والالتزامات العائلية والخطوات الفرعية (1-tap shortcut) -->
          <button type="button" class="tool-pill-action" id="btnOpenTasksDrawer" onclick="openSummaryDrawer('tasks')" title="إدارة المهام والالتزامات العائلية والخطوات الفرعية" style="border-color: rgba(168, 85, 247, 0.4); color: #c084fc;">
            <i class="fa-solid fa-list-check" style="color: #c084fc;"></i>
            <span>المهام</span>
          </button>"""

if drawer_btn_target in content:
    content = content.replace(drawer_btn_target, drawer_btn_replacement, 1)
    print("2. Added btnOpenTasksDrawer to top bar.")
else:
    print("WARNING: drawer_btn_target not found!")

# 3. Update formatMoney and add formatMoneyWithSignHtml
money_target = """    function getCurrencySymbol() {
      if (state.currency === 'SAR') return 'ر.س';
      if (state.currency === 'USD') return '$';
      if (state.currency === 'GOLD21') return 'جم ذهب 21';
      return 'ج.م';
    }

    function formatMoney(n, compact = false) {
      const num = Number(n) || 0;
      if (Math.abs(num) < 0.005) {
        if (state.currency === 'USD') return '$0.00';
        if (state.currency === 'GOLD21') return '0.00 جم ذهب 21';
        return `0.00 ${getCurrencySymbol()}`;
      }
      const converted = convertAmount(num);
      const isUSD = state.currency === 'USD';
      const isGold = state.currency === 'GOLD21';
      
      if (isGold) {
        let formatted = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
        return `${formatted} جم ذهب 21`;
      }
      
      let formatted = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return isUSD ? `$${formatted}` : `${formatted} ${getCurrencySymbol()}`;
    }"""

money_replacement = """    function getCurrencySymbol() {
      if (state.currency === 'SAR') return 'ر.س';
      if (state.currency === 'USD') return '$';
      if (state.currency === 'GOLD21') return 'جم ذهب 21';
      return 'ج.م';
    }

    // منسق المبالغ الاحترافي المعتمد: علامة الزائد والناقص إلى يمين الرقم ورمز العملة إلى يسار الرقم دائماً في RTL
    function formatMoneyWithSignHtml(amount, typeOrSign = null, customClass = '') {
      const raw = Number(amount) || 0;
      const num = Math.abs(raw);
      const converted = convertAmount(num);
      const isGold = state.currency === 'GOLD21';
      const curr = getCurrencySymbol();
      let formatted = converted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: isGold ? 3 : 2
      });

      let sign = '';
      let signClass = '';
      if (typeOrSign === 'expense' || typeOrSign === '-' || (typeOrSign === null && raw < -0.0001)) {
        sign = '-';
        signClass = 'sign-expense';
      } else if (typeOrSign === 'income' || typeOrSign === '+' || (typeOrSign === null && raw > 0.0001)) {
        sign = '+';
        signClass = 'sign-income';
      }

      return `<span class="amount-flow-cluster ${customClass}" dir="rtl">` +
        (sign ? `<span class="tx-sign-symbol ${signClass}">${sign}</span>` : '') +
        `<span class="tx-number-val">${formatted}</span>` +
        `<span class="tx-currency-label">${curr}</span>` +
      `</span>`;
    }

    function formatMoney(n, compact = false) {
      const raw = Number(n) || 0;
      const num = Math.abs(raw);
      const converted = convertAmount(num);
      const isGold = state.currency === 'GOLD21';
      const curr = getCurrencySymbol();
      let formatted = converted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: isGold ? 3 : 2
      });
      // قاعدة التنسيق الصارمة: علامة الزائد والناقص يمين الرقم ورمز العملة يسار الرقم
      if (raw < -0.0001) {
        return `\\u200F- \\u200E${formatted} \\u200F${curr}`;
      }
      return `\\u200E${formatted} \\u200F${curr}`;
    }"""

if money_target in content:
    content = content.replace(money_target, money_replacement, 1)
    print("3. Replaced formatMoney and added formatMoneyWithSignHtml.")
else:
    print("WARNING: money_target not found!")

# 4. Update operations list render
ops_target = """            <div class="ops-tx-left-cluster">
              <span class="ops-tx-amount-text" style="color: ${color};">
                ${sign}${formatMoney(amt)}
              </span>
              <button class="ops-tx-edit-btn" onclick="openEditTxModal('${tx.id}')" title="تعديل وتفاصيل الحركة" style="background: rgba(255,255,255,0.06); border: none; color: #94a3b8; border-radius: 6px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <i class="fa-solid fa-pen-to-square" style="font-size: 0.76rem;"></i>
              </button>
              <button class="ops-tx-del-btn" onclick="deleteTx('${tx.id}')" title="حذف الحركة">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>"""

ops_replacement = """            <div class="ops-tx-left-cluster">
              ${formatMoneyWithSignHtml(amt, sign, 'ops-tx-amount-text')}
              <button class="ops-tx-edit-btn" onclick="openEditTxModal('${tx.id}')" title="تعديل وتفاصيل الحركة" style="background: rgba(255,255,255,0.06); border: none; color: #94a3b8; border-radius: 6px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <i class="fa-solid fa-pen-to-square" style="font-size: 0.76rem;"></i>
              </button>
              <button class="ops-tx-del-btn" onclick="deleteTx('${tx.id}')" title="حذف الحركة">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>"""

if ops_target in content:
    content = content.replace(ops_target, ops_replacement, 1)
    print("4. Updated ops-tx-left-cluster in renderOperationsList.")
else:
    print("WARNING: ops_target not found!")

# 5. Update operations subtotal badges
subtotal_target = """        if (dayExpSum > 0 && dayIncSum > 0) {
          subtotalBadge = `<span class="ops-date-subtotal exp">- ${formatMoney(dayExpSum)}</span> <span class="ops-date-subtotal inc">+ ${formatMoney(dayIncSum)}</span>`;
        } else if (dayExpSum > 0) {
          subtotalBadge = `<span class="ops-date-subtotal exp">إجمالي المنصرف: - ${formatMoney(dayExpSum)}</span>`;
        } else {
          subtotalBadge = `<span class="ops-date-subtotal inc">إجمالي الدخل: + ${formatMoney(dayIncSum)}</span>`;
        }"""

subtotal_replacement = """        if (dayExpSum > 0 && dayIncSum > 0) {
          subtotalBadge = `${formatMoneyWithSignHtml(dayExpSum, '-', 'ops-date-subtotal exp')} ${formatMoneyWithSignHtml(dayIncSum, '+', 'ops-date-subtotal inc')}`;
        } else if (dayExpSum > 0) {
          subtotalBadge = `<span style="font-size: 0.70rem; color: #94a3b8; margin-left: 3px;">إجمالي المنصرف:</span> ${formatMoneyWithSignHtml(dayExpSum, '-', 'ops-date-subtotal exp')}`;
        } else {
          subtotalBadge = `<span style="font-size: 0.70rem; color: #94a3b8; margin-left: 3px;">إجمالي الدخل:</span> ${formatMoneyWithSignHtml(dayIncSum, '+', 'ops-date-subtotal inc')}`;
        }"""

if subtotal_target in content:
    content = content.replace(subtotal_target, subtotal_replacement, 1)
    print("5. Updated subtotal badges in renderOperationsList.")
else:
    print("WARNING: subtotal_target not found!")

# 6. Update income history modal amount
inc_target = """            <div class="ops-tx-left-cluster">
              <span class="ops-tx-amount-text" style="color: #10b981; font-weight: 900;">
                + ${formatMoney(amt)}
              </span>
              <button class="ops-tx-edit-btn" onclick="closeModal('incomeHistoryModal'); openEditTxModal('${t.id}')" title="تعديل وتفاصيل الحركة" style="background: rgba(255,255,255,0.06); border: none; color: #94a3b8; border-radius: 6px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <i class="fa-solid fa-pen-to-square" style="font-size: 0.76rem;"></i>
              </button>
            </div>"""

inc_replacement = """            <div class="ops-tx-left-cluster">
              ${formatMoneyWithSignHtml(amt, '+', 'ops-tx-amount-text')}
              <button class="ops-tx-edit-btn" onclick="closeModal('incomeHistoryModal'); openEditTxModal('${t.id}')" title="تعديل وتفاصيل الحركة" style="background: rgba(255,255,255,0.06); border: none; color: #94a3b8; border-radius: 6px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <i class="fa-solid fa-pen-to-square" style="font-size: 0.76rem;"></i>
              </button>
            </div>"""

if inc_target in content:
    content = content.replace(inc_target, inc_replacement, 1)
    print("6. Updated incomeHistoryModal amount.")
else:
    print("WARNING: inc_target not found!")

# 7. Update category analytics modal amounts
cat_total_target = """              <span style="font-size: 1.25rem; font-weight: 900; color: #ef4444; direction: ltr;">- ${formatMoney(totalSpent)}</span>"""
cat_total_replacement = """              ${formatMoneyWithSignHtml(totalSpent, '-', 'style="font-size: 1.22rem;"')}"""

if cat_total_target in content:
    content = content.replace(cat_total_target, cat_total_replacement, 1)
    print("7. Updated category analytics total.")
else:
    print("WARNING: cat_total_target not found!")

cat_row_target = """                    <span style="color: #ef4444; font-weight: 800; direction: ltr;">- ${formatMoney(t.amount)}</span>"""
cat_row_replacement = """                    ${formatMoneyWithSignHtml(t.amount, '-')}"""

if cat_row_target in content:
    content = content.replace(cat_row_target, cat_row_replacement, 1)
    print("8. Updated category analytics row amount.")
else:
    print("WARNING: cat_row_target not found!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Saved base changes.")
