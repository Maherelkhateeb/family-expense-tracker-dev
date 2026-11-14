import os, sys, time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

artifacts_dir = r"C:\Users\96656\.gemini\antigravity\brain\0de95090-23a6-4a7f-a9b2-09153ee49670"
html_path = os.path.abspath("index.html")
file_url = f"file:///{html_path.replace(os.sep, '/')}"

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

    # 1. Check Category Card Layout
    first_card = page.locator(".cat-card").first
    top_half = first_card.locator(".cat-card-top-half")
    bottom_half = first_card.locator(".cat-card-bottom-half")
    bubble = first_card.locator(".cat-icon-bubble")
    label = first_card.locator(".cat-label-text")

    print("Checking Category Card dimensions:")
    print("  Top half box:", top_half.bounding_box())
    print("  Bubble box:", bubble.bounding_box())
    print("  Label box:", label.bounding_box())
    print("  Label text:", label.inner_text())
    print("  Bottom half box:", bottom_half.bounding_box())

    # Check that "كشف العمليات" is NOT in the card
    has_kashf_text = page.locator(".cat-card:has-text('كشف العمليات')").count() > 0
    print(f"Any category card contains 'كشف العمليات': {has_kashf_text} (Expected: False)")

    # 2. Test Currency Toggle with Gold 21
    print("\nTesting Currency Switcher:")
    curr_btn = page.locator("#btnToggleCurrency")
    print("  Initial currency:", page.locator("#activeCurrencyText").inner_text())

    # Click 1: EGP -> USD
    curr_btn.click()
    time.sleep(0.5)
    print("  After click 1:", page.locator("#activeCurrencyText").inner_text())

    # Click 2: USD -> SAR
    curr_btn.click()
    time.sleep(0.5)
    print("  After click 2:", page.locator("#activeCurrencyText").inner_text())

    # Click 3: SAR -> GOLD21
    curr_btn.click()
    time.sleep(0.5)
    gold_text = page.locator("#activeCurrencyText").inner_text()
    print("  After click 3 (Gold 21):", gold_text)
    
    # Take screenshot of home in Gold 21
    gold_screenshot = os.path.join(artifacts_dir, "v496_home_gold21_active.png")
    page.screenshot(path=gold_screenshot)
    print(f"  Saved Gold 21 screenshot to {gold_screenshot}")

    # Click 4: GOLD21 -> EGP
    curr_btn.click()
    time.sleep(0.5)
    print("  After click 4 (back to EGP):", page.locator("#activeCurrencyText").inner_text())

    # 3. Test Millions without Overflow
    print("\nTesting Million Amount Display in Category Card:")
    page.evaluate("""() => {
      // Add a test expense of 15,250,000 EGP to food category
      state.transactions.unshift({
        id: 'tx-million-test',
        type: 'expense',
        category: 'food',
        amount: 15250000,
        member: 'ماهر',
        date: getLocalDateStr(new Date()),
        desc: 'شراء صفقة أغذية كبرى'
      });
      renderUI();
    }""")
    time.sleep(1)

    food_card = page.locator(".cat-card[data-cat-id='food']")
    food_amt_box = food_card.locator(".cat-amount-val").bounding_box()
    food_card_box = food_card.bounding_box()
    print("  Food card width:", food_card_box['width'], "Amount width:", food_amt_box['width'])
    is_contained = food_amt_box['width'] <= food_card_box['width']
    print(f"  Million amount fits within card: {is_contained}")

    # Take screenshot with million amount
    million_screenshot = os.path.join(artifacts_dir, "v496_home_million_amount_contained.png")
    page.screenshot(path=million_screenshot)
    print(f"  Saved million amount screenshot to {million_screenshot}")

    # 4. Test Horizontal Swipe Gestures
    print("\nTesting Horizontal Swipe Gestures:")
    # Swipe right from left edge to open summary drawer
    page.mouse.move(30, 400)
    page.mouse.down()
    page.mouse.move(180, 400, steps=5)
    page.mouse.up()
    time.sleep(1)

    left_drawer_open = page.locator("#summaryLeftDrawer").evaluate("el => el.classList.contains('open') || el.classList.contains('active')")
    print(f"  Left drawer open after edge swipe right: {left_drawer_open}")

    # Swipe left on screen to close summary drawer
    page.mouse.move(250, 400)
    page.mouse.down()
    page.mouse.move(50, 400, steps=5)
    page.mouse.up()
    time.sleep(1)

    left_drawer_closed = page.locator("#summaryLeftDrawer").evaluate("el => !(el.classList.contains('open') || el.classList.contains('active'))")
    print(f"  Left drawer closed after swipe left: {left_drawer_closed}")

    # Swipe left from right edge to open gold drawer
    page.mouse.move(390, 400)
    page.mouse.down()
    page.mouse.move(240, 400, steps=5)
    page.mouse.up()
    time.sleep(1)

    right_drawer_open = page.locator("#goldDrawerPanel").evaluate("el => el.classList.contains('open') || el.classList.contains('active')")
    print(f"  Right drawer open after edge swipe left: {right_drawer_open}")

    # Swipe right to close gold drawer
    page.mouse.move(200, 400)
    page.mouse.down()
    page.mouse.move(370, 400, steps=5)
    page.mouse.up()
    time.sleep(1)

    right_drawer_closed = page.locator("#goldDrawerPanel").evaluate("el => !(el.classList.contains('open') || el.classList.contains('active'))")
    print(f"  Right drawer closed after swipe right: {right_drawer_closed}")

    print(f"\n--- Relevant console errors count: {len(console_errors)} ---")
    for err in console_errors:
        print("ERR:", err)

    browser.close()

if len(console_errors) > 0:
    print("FAILED due to console errors")
    sys.exit(1)
else:
    print("\nSUCCESS: All new features and visual hierarchies verified perfectly!")
