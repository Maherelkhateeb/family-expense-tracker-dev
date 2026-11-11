import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Top bar button
btn_old = '<button type="button" class="tool-pill-action" id="btnOpenSummaryDrawer" onclick="openSummaryDrawer()" title="ملخص العمليات والنشاط المالي (اليوم / الأسبوع / الشهر)" style="height: 38px; padding: 0 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: flex; align-items: center; gap: 5px; cursor: pointer; border: 1.2px solid rgba(56, 189, 248, 0.4); background: rgba(15, 23, 42, 0.85); color: #38bdf8;">\n            <i class="fa-solid fa-chart-pie"></i>\n            <span>ملخص</span>\n          </button>'
btn_new = '<button type="button" class="tool-pill-action" id="btnOpenSummaryDrawer" onclick="openSummaryDrawer()" title="ملخص العمليات والنشاط المالي (اليوم / الأسبوع / الشهر)" style="height: 38px; padding: 0 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: flex; align-items: center; gap: 5px; cursor: pointer; border: 1.2px solid rgba(56, 189, 248, 0.4); background: rgba(15, 23, 42, 0.85); color: #38bdf8;">\n            <i class="fa-solid fa-chart-pie"></i>\n            <span>ملخص</span>\n          </button>\n\n          <!-- زر درج المهام والالتزامات العائلية والخطوات الفرعية (1-tap shortcut) -->\n          <button type="button" class="tool-pill-action" id="btnOpenTasksDrawer" onclick="openSummaryDrawer(\'tasks\')" title="إدارة المهام والالتزامات العائلية والخطوات الفرعية" style="height: 38px; padding: 0 10px; border-radius: 12px; font-size: 0.74rem; font-weight: 800; display: flex; align-items: center; gap: 5px; cursor: pointer; border: 1.2px solid rgba(168, 85, 247, 0.45); background: rgba(15, 23, 42, 0.85); color: #c084fc;">\n            <i class="fa-solid fa-list-check" style="color: #c084fc;"></i>\n            <span>المهام</span>\n          </button>'

if btn_old in content:
    content = content.replace(btn_old, btn_new, 1)
    print("1. Added btnOpenTasksDrawer to top bar!")
else:
    print("ERROR: btn_old not found!")

# 2. Ops tx amount
ops_amt_old = """            <div class="ops-tx-left-cluster">
              <span class="ops-tx-amount-text" style="color: ${color};">
                ${sign}${formatMoney(amt)}
              </span>"""

ops_amt_new = """            <div class="ops-tx-left-cluster">
              ${formatMoneyWithSignHtml(amt, sign, 'ops-tx-amount-text')}"""

if ops_amt_old in content:
    content = content.replace(ops_amt_old, ops_amt_new, 1)
    print("2. Updated ops-tx-amount in renderOperationsList!")
else:
    print("ERROR: ops_amt_old not found!")

# 3. Income history amount
inc_amt_old = """            <div class="ops-tx-left-cluster">
              <span class="ops-tx-amount-text" style="color: #10b981; font-weight: 900;">
                + ${formatMoney(amt)}
              </span>"""

inc_amt_new = """            <div class="ops-tx-left-cluster">
              ${formatMoneyWithSignHtml(amt, '+', 'ops-tx-amount-text')}"""

if inc_amt_old in content:
    content = content.replace(inc_amt_old, inc_amt_new, 1)
    print("3. Updated incomeHistory ops-tx-amount!")
else:
    print("ERROR: inc_amt_old not found!")

# 4. Income history total header
inc_tot_old = "if (totalAmtEl) totalAmtEl.textContent = '+ ' + formatMoney(total);"
inc_tot_new = "if (totalAmtEl) totalAmtEl.innerHTML = formatMoneyWithSignHtml(total, '+');"

if inc_tot_old in content:
    content = content.replace(inc_tot_old, inc_tot_new, 1)
    print("4. Updated income history total header!")
else:
    print("ERROR: inc_tot_old not found!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Saved updates.")
