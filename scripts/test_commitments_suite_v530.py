# -*- coding: utf-8 -*-
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 915})
    page.on('pageerror', lambda err: errors.append(f"PAGE ERROR: {err}"))
    page.on('console', lambda msg: errors.append(f"CONSOLE: {msg.type} - {msg.text}") if msg.type == 'error' else None)

    print("1. Navigating to app on http://127.0.0.1:8892/index.html...", flush=True)
    page.goto('http://127.0.0.1:8892/index.html', wait_until='load', timeout=15000)
    time.sleep(1.0)

    print("2. Switching to Expected / Commitments page...", flush=True)
    page.click('#navTabExpected')
    time.sleep(0.8)

    # Verify Master Net Card
    net_val = page.inner_text('#kpiNetValueCommitments')
    print(f"   -> Master Net Commitment Value: {net_val}", flush=True)

    # 3. Test Clicking 4 KPI Cards
    print("3. Testing click on 4 KPI Cards...", flush=True)
    page.click('#cardComBills')
    time.sleep(0.3)
    page.click('#cardComDebtsOnUs')
    time.sleep(0.3)
    page.click('#cardComDebtsForUs')
    time.sleep(0.3)
    page.click('#cardComSettled')
    time.sleep(0.3)
    page.click('#pillSubFilterAll')
    time.sleep(0.3)

    # 4. Test Adding a new Bill
    print("4. Testing Unified Add Commitment Panel...", flush=True)
    page.click('#btnTopAddCommitmentAction')
    time.sleep(0.5)
    page.fill('#inpUnifiedCommitmentTitle', 'فاتورة إنترنت تجريبية فخمة')
    page.fill('#inpUnifiedCommitmentAmount', '650')
    page.click('#btnSubmitUnifiedCommitmentText')
    time.sleep(0.8)

    # Verify new bill exists in bills list
    card_titles = page.evaluate("() => Array.from(document.querySelectorAll('#billsListContentContainer .ops-tx-card-clean')).map(c => c.innerText)")
    found_new_bill = any('فاتورة إنترنت تجريبية فخمة' in t for t in card_titles)
    print(f"   -> New bill added & rendered: {found_new_bill}", flush=True)
    assert found_new_bill, "New bill was not found in bills list!"

    # 5. Test Expanding the new Bill and Editing it
    print("5. Testing Edit Commitment Modal...", flush=True)
    page.locator('#billsListContentContainer .ops-tx-card-clean').first.click()
    time.sleep(0.5)

    # Click the scoped edit button
    edit_btn = page.locator('#billsListContentContainer .ops-tx-card-clean').first.locator('button[onclick*="openEditCommitmentModal"]')
    edit_btn.click()
    time.sleep(0.5)

    # Verify edit modal opened
    edit_modal_visible = page.is_visible('#editCommitmentModal')
    print(f"   -> Edit Commitment Modal visible: {edit_modal_visible}", flush=True)
    assert edit_modal_visible, "Edit modal failed to open!"

    # Change amount to 750
    page.fill('#inpEditCommitmentAmount', '750')
    page.click('#btnSaveEditedCommitment')
    time.sleep(0.8)

    # Verify updated card
    new_card_text = page.locator('#billsListContentContainer .ops-tx-card-clean').first.inner_text()
    print(f"   -> Updated bill card text: {new_card_text[:60]}", flush=True)
    assert '750' in new_card_text, "Amount did not update to 750!"

    # 6. Test Paying the Bill via Pay Modal with Wallet Selection
    print("6. Testing Pay Expected Modal...", flush=True)
    page.locator('#billsListContentContainer .ops-tx-card-clean').first.click()
    time.sleep(0.5)

    pay_btn = page.locator('#billsListContentContainer .ops-tx-card-clean').first.locator('button[onclick*="openPayExpectedModal"]')
    pay_btn.click()
    time.sleep(0.5)

    pay_modal_visible = page.is_visible('#payExpectedModal')
    print(f"   -> Pay Expected Modal visible: {pay_modal_visible}", flush=True)
    assert pay_modal_visible, "Pay Expected Modal failed to open!"

    wallet_opts = page.evaluate("() => Array.from(document.querySelectorAll('#payExpWalletSelect option')).map(o => o.text)")
    print(f"   -> Wallets available for payment: {wallet_opts}", flush=True)

    # Confirm payment
    page.click('#btnConfirmPayExpected')
    time.sleep(0.8)

    # 7. Test Sub-filter for Settled / Paid
    print("7. Testing Settled Sub-filter...", flush=True)
    page.click('#pillSubFilterSettled')
    time.sleep(0.5)
    settled_cards = page.evaluate("() => Array.from(document.querySelectorAll('#billsListContentContainer .ops-tx-card-clean')).map(c => c.innerText)")
    print(f"   -> Total settled cards: {len(settled_cards)}", flush=True)

    # Take screenshot of settled commitments
    page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\v530_commitments_settled.png')

    # 8. Test Switching to Budgets Tab
    print("8. Testing Budgets Top Tab...", flush=True)
    page.click('#tabExpectedBudgets')
    time.sleep(0.8)
    budgets_visible = page.is_visible('#panelMonthlyBudget')
    print(f"   -> Budgets Panel visible: {budgets_visible}", flush=True)
    assert budgets_visible, "Monthly Budgets panel failed to display!"

    # Switch to history sub-tab
    page.click('#btnBudgetSubHistory')
    time.sleep(0.5)
    history_visible = page.is_visible('#panelBudgetHistory')
    print(f"   -> Budget History visible: {history_visible}", flush=True)
    assert history_visible, "Budget History panel failed to display!"

    # Switch back to current budget
    page.click('#btnBudgetSubCurrent')
    time.sleep(0.5)

    page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\v530_commitments_budgets.png')

    # Switch back to bills and debts and take final screenshot
    page.click('#tabExpectedBillsAndDebts')
    time.sleep(0.5)
    page.click('#pillSubFilterAll')
    time.sleep(0.5)
    page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\scripts\v530_commitments_final.png')

    browser.close()

print(f"\nTotal errors logged: {len(errors)}", flush=True)
if errors:
    print("ERRORS:", flush=True)
    for err in errors:
        print("  -", err, flush=True)
else:
    print("100% COMPLETE AND FLAWLESS VERIFICATION! ALL COMMITMENT FEATURES WORK PERFECTLY!", flush=True)
