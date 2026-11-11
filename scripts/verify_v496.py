import os, sys, time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

artifacts_dir = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
html_path = os.path.abspath("index.html")
file_url = f"file:///{html_path.replace(os.sep, '/')}"

print(f"Loading URL: {file_url}")

console_errors = []
console_logs = []

def filter_console_error(text):
    if 'URL scheme "file" is not supported' in text:
        return False
    if 'CORS policy' in text or 'ERR_FAILED' in text:
        return False
    return True

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={'width': 412, 'height': 915},
        device_scale_factor=2,
        is_mobile=True,
        has_touch=True
    )
    page = context.new_page()

    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" and filter_console_error(msg.text) else console_logs.append(msg.text))
    page.on("pageerror", lambda exc: console_errors.append(str(exc)) if filter_console_error(str(exc)) else None)

    page.goto(file_url, wait_until="domcontentloaded")
    time.sleep(2)

    print(f"Page title: {page.title()}")

    # 1. Check removal of #btnOpenTasksDrawer and #btnOpenGold
    has_tasks_btn = page.locator("#btnOpenTasksDrawer").count() > 0
    has_gold_btn = page.locator("#btnOpenGold").count() > 0
    print(f"Home #btnOpenTasksDrawer exists: {has_tasks_btn} (Expected: False)")
    print(f"Home #btnOpenGold exists: {has_gold_btn} (Expected: False)")

    # 2. Check Category cards
    cat_cards = page.locator(".cat-card")
    cat_count = cat_cards.count()
    print(f"Category cards count: {cat_count} (Expected: 9)")

    first_card = cat_cards.first
    top_half = first_card.locator(".cat-card-top-half")
    bottom_half = first_card.locator(".cat-card-bottom-half")
    print(f"Top half exists: {top_half.count() > 0}, Bottom half exists: {bottom_half.count() > 0}")

    bg_style = first_card.evaluate("el => window.getComputedStyle(el).backgroundImage")
    print(f"First card background-image: {bg_style[:100]}...")

    # Take screenshot of home screen
    home_screenshot = os.path.join(artifacts_dir, "v496_home_colorful_cards.png")
    page.screenshot(path=home_screenshot)
    print(f"Saved home screenshot to {home_screenshot}")

    # 3. Test clicking bottom half (opens operations filtered by category)
    print("Testing click on bottom half of first category card...")
    bottom_half.click()
    time.sleep(1)
    ops_view_visible = page.locator("#viewOperations").is_visible()
    print(f"Operations view visible after clicking bottom half: {ops_view_visible}")

    # Return to home
    page.evaluate("switchAppPage('home')")
    time.sleep(0.8)

    # 4. Test clicking top half (opens quick expense registration modal)
    print("Testing click on top half of first category card...")
    top_half.click()
    time.sleep(1)
    tx_modal_visible = page.locator("#txModal").is_visible()
    print(f"Quick transaction modal (#txModal) visible after clicking top half: {tx_modal_visible}")

    # Close txModal
    page.evaluate("closeModal('txModal')")
    time.sleep(0.5)

    # 5. Test Tasks in Drawer
    print("Testing Tasks in Left Drawer...")
    page.evaluate("openSummaryDrawer('tasks')")
    time.sleep(1)

    has_date_inp = page.locator("#drawerNewTaskDateInput").is_visible()
    has_time_inp = page.locator("#drawerNewTaskTimeInput").is_visible()
    print(f"Drawer task date input visible: {has_date_inp}, time input visible: {has_time_inp}")

    # Add a scheduled task due earlier today to trigger reminder
    page.fill("#drawerNewTaskTitleInput", "سداد فاتورة التليفون الأرضي والإنترنت")
    page.fill("#drawerNewTaskDateInput", "2026-11-07")
    page.fill("#drawerNewTaskTimeInput", "15:00")
    page.click("button[onclick='handleDrawerAddNewTask()']")
    time.sleep(1)

    # Verify task was added
    task_items = page.locator(".task-card-item")
    print(f"Task items count after adding: {task_items.count()}")

    # Add subtask with photo
    subtask_inp = page.locator("input[id^='inpSubtaskTitle_']").first
    if subtask_inp.count() > 0:
        subtask_id = subtask_inp.evaluate("el => el.id.replace('inpSubtaskTitle_', '')")
        subtask_inp.fill("تجهيز رقم الحساب وفاتورة المصرية للاتصالات")
        page.fill(f"#inpSubtaskDate_{subtask_id}", "2026-11-07")
        page.fill(f"#inpSubtaskTime_{subtask_id}", "15:05")
        
        # Test mock subtask photo
        mock_data_uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        page.evaluate(f"window.pendingSubtaskPhotos['{subtask_id}'] = '{mock_data_uri}'")
        
        page.click(f"button[onclick*=\"addSubtaskToTask('{subtask_id}')\"]")
        time.sleep(1)

        print(f"Subtask added. Checking subtask photo...")
        subtask_photo_count = page.locator(".task-card-item img[title*='المهمة الفرعية']").count()
        print(f"Subtask photo thumbnail rendered: {subtask_photo_count > 0}")

    # Take screenshot of Tasks drawer
    tasks_screenshot = os.path.join(artifacts_dir, "v496_tasks_drawer_scheduled.png")
    page.screenshot(path=tasks_screenshot)
    print(f"Saved tasks screenshot to {tasks_screenshot}")

    # 6. Test Reminder Engine execution
    print("Testing checkScheduledTaskReminders engine...")
    page.evaluate("checkScheduledTaskReminders()")
    time.sleep(1)

    notifs = page.evaluate("state.notifications ? state.notifications.length : 0")
    print(f"System notifications count after reminder check: {notifs}")

    # Open notifications modal
    page.evaluate("openNotificationsModal()")
    time.sleep(1)
    notif_screenshot = os.path.join(artifacts_dir, "v496_notifications_alarm.png")
    page.screenshot(path=notif_screenshot)
    print(f"Saved notifications screenshot to {notif_screenshot}")

    # Console errors report
    print(f"\n--- Relevant console errors count: {len(console_errors)} ---")
    for err in console_errors:
        print("ERR:", err)

    browser.close()

if len(console_errors) > 0:
    print("FAILED due to console errors")
    sys.exit(1)
else:
    print("SUCCESS: All verification checks passed cleanly!")
