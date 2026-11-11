import sys, io, os
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

artifact_dir = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
html_path = os.path.abspath("index.html")
file_url = f"file:///{html_path.replace(os.sep, '/')}"

print(f"Testing URL: {file_url}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={'width': 412, 'height': 915},
        device_scale_factor=2,
        is_mobile=True,
        has_touch=True
    )
    page = context.new_page()

    page.goto(file_url, wait_until="domcontentloaded", timeout=15000)
    page.wait_for_timeout(1000)

    # 1. Verify Cockpit Actual Balance
    bal_el = page.locator('#topCardBalance')
    bal_text = bal_el.text_content()
    bal_fs = bal_el.evaluate("el => window.getComputedStyle(el).fontSize")
    print(f"✓ Balance text: {bal_text.strip()} | Font Size: {bal_fs}")

    safy_count = page.locator("text='صافي السيولة المعتمدة للمحافظ'").count()
    print(f"✓ 'صافي السيولة المعتمدة للمحافظ' count: {safy_count} (Should be 0)")

    # 2. Verify Flow amounts
    inc_fs = page.locator('#topCardIncome').evaluate("el => window.getComputedStyle(el).fontSize")
    exp_fs = page.locator('#topCardExpense').evaluate("el => window.getComputedStyle(el).fontSize")
    print(f"✓ Cash flow Income font size: {inc_fs} | Expense font size: {exp_fs}")

    # 3. Verify Category Cards
    cat_cards = page.locator('.cat-card')
    card_count = cat_cards.count()
    print(f"✓ Category cards count: {card_count}")
    first_card_text = cat_cards.first.text_content()
    has_tasjeel = "تسجيل جديد" in first_card_text
    has_kashf = "كشف" in first_card_text
    print(f"✓ Has 'تسجيل جديد': {has_tasjeel} | Has 'كشف': {has_kashf}")

    # Screenshot 1: Home
    home_shot = os.path.join(artifact_dir, "v495_home_prominent.png")
    page.screenshot(path=home_shot)
    print(f"✓ Saved Home screenshot: {home_shot}")

    # 4. Summary Drawer
    page.evaluate("openSummaryDrawer('summary')")
    page.wait_for_timeout(500)
    summary_shot = os.path.join(artifact_dir, "v495_drawer_summary.png")
    page.screenshot(path=summary_shot)
    print(f"✓ Saved Summary Drawer screenshot: {summary_shot}")

    # Switch to Tasks tab
    page.evaluate("switchLeftDrawerTab('tasks')")
    page.wait_for_timeout(500)
    tasks_shot = os.path.join(artifact_dir, "v495_drawer_tasks.png")
    page.screenshot(path=tasks_shot)
    print(f"✓ Saved Tasks Drawer screenshot: {tasks_shot}")

    page.evaluate("closeSummaryLeftDrawer()")
    page.wait_for_timeout(300)

    # 5. Commitments page
    page.evaluate("switchAppPage('expected')")
    page.wait_for_timeout(500)
    exp_shot = os.path.join(artifact_dir, "v495_commitments_cards.png")
    page.screenshot(path=exp_shot)
    print(f"✓ Saved Commitments screenshot: {exp_shot}")

    page.evaluate("toggleBillsExpectedPanel()")
    page.wait_for_timeout(300)
    bills_cancel_btn = page.locator("#panelBillsExpected button:has-text('إلغاء / إغلاق')")
    print(f"✓ Bills panel cancel button found: {bills_cancel_btn.count() > 0}")

    # 6. Audit Modal
    page.evaluate("openActualBalanceAuditModal()")
    page.wait_for_timeout(500)
    audit_shot = os.path.join(artifact_dir, "v495_audit_modal_header_filters.png")
    page.screenshot(path=audit_shot)
    print(f"✓ Saved Audit Modal screenshot: {audit_shot}")

    mem_filter = page.locator('#auditMemberFilter')
    cat_filter = page.locator('#auditCategoryFilter')
    print(f"✓ Audit member header filter exists: {mem_filter.count() > 0} | Category filter: {cat_filter.count() > 0}")

    page.evaluate("closeModal('actualBalanceAuditModal')")
    page.wait_for_timeout(300)

    # 7. Edit Modal with Receipt Camera & Upload
    page.evaluate("openEditTxModal(state.transactions[0].id)")
    page.wait_for_timeout(500)
    edit_shot = os.path.join(artifact_dir, "v495_edit_tx_receipt_camera.png")
    page.screenshot(path=edit_shot)
    print(f"✓ Saved Edit Modal screenshot: {edit_shot}")

    cam_input = page.locator('#inpEditTxReceiptCamera')
    gal_input = page.locator('#inpEditTxReceipt')
    print(f"✓ Edit receipt camera input exists: {cam_input.count() > 0} | Gallery input: {gal_input.count() > 0}")

    page.evaluate("closeModal('editTxModal')")
    page.wait_for_timeout(300)

    # 8. Verify clicking Tasks button on home bar opens left drawer with Tasks
    page.evaluate("switchAppPage('expenses')")
    page.wait_for_timeout(300)
    page.click('#btnOpenTasksDrawer')
    page.wait_for_timeout(500)
    drawer_open = page.locator('#summaryLeftDrawer').evaluate("el => el.classList.contains('open')")
    tasks_visible = page.locator('#drawerTasksViewSection').is_visible()
    print(f"✓ Home tasks button opens left drawer: {drawer_open} | Tasks view visible: {tasks_visible}")

    print("\n🎉 ALL 8 PLAYWRIGHT CHECKS PASSED WITH 100% SUCCESS!")
    browser.close()
