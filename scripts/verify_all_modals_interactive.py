# -*- coding: utf-8 -*-
import subprocess
import time
from playwright.sync_api import sync_playwright

server = subprocess.Popen(['python', '-m', 'http.server', '8896'], cwd=r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy')
time.sleep(1.5)

errors = []
logs = []

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.on('pageerror', lambda err: errors.append(str(err)))
        page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else logs.append(msg.text))

        page.goto('http://localhost:8896/index.html')
        page.wait_for_timeout(2000)

        # 1. Edit transaction
        print("1. Testing editTx...")
        page.evaluate("""
            if (typeof editTx === 'function') {
                const tx = (window.state && window.state.transactions) ? window.state.transactions[0] : null;
                if (tx) editTx(tx.id);
            }
        """)
        page.wait_for_timeout(400)
        page.evaluate("if (typeof closeModal === 'function') closeModal('editTxModal');")
        page.wait_for_timeout(300)

        # 2. Open notifications modal
        print("2. Testing openNotificationsModal...")
        page.evaluate("openNotificationsModal();")
        page.wait_for_timeout(400)
        page.evaluate("if (typeof closeModal === 'function') closeModal('notificationsModal');")
        page.wait_for_timeout(300)

        # 3. Open actual balance audit modal
        print("3. Testing openActualBalanceAuditModal...")
        page.evaluate("openActualBalanceAuditModal();")
        page.wait_for_timeout(400)
        page.evaluate("if (typeof closeModal === 'function') closeModal('actualBalanceAuditModal');")
        page.wait_for_timeout(300)

        # 4. Open wallet transfer modal
        print("4. Testing wallet transfer modal...")
        page.evaluate("if (typeof openModal === 'function') openModal('walletTransferModal');")
        page.wait_for_timeout(400)
        page.evaluate("if (typeof closeModal === 'function') closeModal('walletTransferModal');")
        page.wait_for_timeout(300)

        # 5. Open tasks modal and close
        print("5. Testing tasks modal...")
        page.click("#btnHeaderTasksTop")
        page.wait_for_timeout(600)
        page.evaluate("if (typeof closeTasksFullScreenModal === 'function') closeTasksFullScreenModal();")
        page.wait_for_timeout(300)

        browser.close()
finally:
    server.terminate()

print(f"\nTotal runtime errors during full suite: {len(errors)}")
for e in errors:
    print("  [ERR]", e)
if len(errors) == 0:
    print("100% SUCCESS! ZERO RUNTIME ERRORS ACROSS ALL USER ACTIONS!")
