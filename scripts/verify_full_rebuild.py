import asyncio
import sys
from datetime import datetime
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 412, "height": 915})
        page = await context.new_page()
        
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
        await page.wait_for_timeout(1000)
        
        # Seed test data with today's date for task and an operation
        today_iso = datetime.now().strftime("%Y-%m-%d")
        await page.evaluate(f"""() => {{
            const today = '{today_iso}';
            let tasks = [{{
                id: 'task-test-today',
                title: 'شراء مستلزمات البيت الشهرية',
                dueDateTime: today + 'T19:00',
                dueDate: today,
                dueTime: '19:00',
                priority: 'high',
                tag: 'shopping',
                completed: false,
                starred: true,
                author: 'ماهر',
                subtasks: [
                    {{ id: 'sub-1', title: 'سحب 2,000 ج.م من ماكينة البنك الأهلي', dueDateTime: today + 'T14:00', completed: true }},
                    {{ id: 'sub-2', title: 'شراء اللحوم والدواجن الطازجة', dueDateTime: today + 'T17:00', completed: false }}
                ]
            }}];
            localStorage.setItem('family_monefy_tasks', JSON.stringify(tasks));

            // Ensure we have a transaction
            if (!state.transactions || state.transactions.length === 0) {{
                state.transactions = [{{
                    id: 'tx-test-1',
                    type: 'expense',
                    category: 'food',
                    amount: 1550.00,
                    label: 'سوبرماركت زهران',
                    member: 'ماهر',
                    walletId: 'cash',
                    date: today
                }}];
                saveState();
            }}
        }}""")
        
        await page.reload()
        await page.wait_for_timeout(800)
        
        # ------------------------------------------------------------------
        # 1. VERIFY CURRENCY & SIGN ORDER IN OPERATIONS LIST
        # ------------------------------------------------------------------
        print("=== 1. AUDITING FINANCIAL SIGN & CURRENCY ORDER ===")
        nav_ops = page.locator('#navTabOperations')
        await nav_ops.click()
        await page.wait_for_timeout(600)
        
        clusters = page.locator('.amount-flow-cluster')
        cluster_count = await clusters.count()
        print(f"Found {cluster_count} .amount-flow-cluster elements in operations list!")
        assert cluster_count > 0, "No .amount-flow-cluster found in operations list!"
        
        # Check first cluster bounding boxes
        s_box = await page.evaluate("() => { const s = document.querySelector('.amount-flow-cluster .tx-sign-symbol'); return s ? s.getBoundingClientRect() : null; }")
        n_box = await page.evaluate("() => { const n = document.querySelector('.amount-flow-cluster .tx-number-val'); return n ? n.getBoundingClientRect() : null; }")
        c_box = await page.evaluate("() => { const c = document.querySelector('.amount-flow-cluster .tx-currency-label'); return c ? c.getBoundingClientRect() : null; }")
        
        print(f"Sign X (Rightmost): {s_box['x']:.2f}")
        print(f"Num X (Middle): {n_box['x']:.2f}")
        print(f"Curr X (Leftmost): {c_box['x']:.2f}")
        
        assert s_box['x'] > n_box['x'], "Sign is NOT to the right of Number!"
        assert n_box['x'] > c_box['x'], "Number is NOT to the right of Currency!"
        print("PERFECT: Sign is on the RIGHT, Number in the MIDDLE, Currency on the LEFT!")
        
        await page.screenshot(path="C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/v503_currency_sign_order.png")
        print("Captured: v503_currency_sign_order.png")
        
        # ------------------------------------------------------------------
        # 2. VERIFY TOP BAR TASKS SHORTCUT
        # ------------------------------------------------------------------
        print("\n=== 2. AUDITING TOP BAR TASKS SHORTCUT ===")
        # Navigate to Expenses / Cockpit
        await page.locator('#navTabExpenses').click()
        await page.wait_for_timeout(500)
        
        tasks_btn = page.locator('#btnOpenTasksDrawer')
        assert await tasks_btn.count() > 0, "btnOpenTasksDrawer NOT FOUND in top bar!"
        print("btnOpenTasksDrawer found in top bar. Clicking it...")
        await tasks_btn.click()
        await page.wait_for_timeout(600)
        
        tasks_section = page.locator('#drawerTasksViewSection')
        assert await tasks_section.is_visible(), "drawerTasksViewSection is NOT visible!"
        print("Tasks drawer section opened successfully via 1-tap top bar button!")
        
        # ------------------------------------------------------------------
        # 3. VERIFY TASKS & SUBTASKS REBUILD
        # ------------------------------------------------------------------
        print("\n=== 3. AUDITING TASKS & SUBTASKS MODULE ===")
        kpi_total = await page.locator('#kpiTasksTotal').inner_text()
        kpi_done = await page.locator('#kpiTasksDone').inner_text()
        print(f"Tasks KPIs: Total={kpi_total}, Done={kpi_done}")
        
        task_cards = page.locator('.task-card-item')
        card_count = await task_cards.count()
        print(f"Rendered Task Cards count: {card_count}")
        assert card_count > 0, "No task cards rendered in today's view!"
        
        # Check subtasks count on card
        first_card = task_cards.first
        btn_add_sub = first_card.locator('button:has-text("إضافة خطوة فرعية")')
        assert await btn_add_sub.count() > 0, "Button '+ إضافة خطوة فرعية' not found!"
        print("Found '+ إضافة خطوة فرعية'. Clicking to expand subtask creator...")
        await btn_add_sub.click()
        await page.wait_for_timeout(400)
        
        sub_box = page.locator('[id^="subtaskAddBox_"]').first
        assert await sub_box.is_visible(), "Subtask creation box did not expand!"
        print("Subtask creation box expanded with sleek design!")
        
        # Enter a new subtask
        sub_title_inp = page.locator('[id^="inpSubtaskTitle_"]').first
        await sub_title_inp.fill("شراء المنظفات والمناديل الورقية")
        
        btn_save_sub = sub_box.locator('button:has-text("حفظ الخطوة الفرعية")')
        await btn_save_sub.click()
        await page.wait_for_timeout(600)
        
        # Verify new subtask rendered in checklist
        new_sub = page.locator('.subtask-row-item:has-text("شراء المنظفات والمناديل الورقية")')
        assert await new_sub.count() > 0, "Newly added subtask not found in checklist!"
        print("SUCCESS: Subtask saved and rendered cleanly in checklist!")
        
        # Toggle subtask completion
        sub_toggle_btn = new_sub.locator('button').first
        await sub_toggle_btn.click()
        await page.wait_for_timeout(500)
        print("Toggled subtask completion!")
        
        await page.screenshot(path="C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/v503_tasks_rebuilt_from_scratch.png")
        print("Captured: v503_tasks_rebuilt_from_scratch.png")
        
        # ------------------------------------------------------------------
        # 4. VERIFY "تحويل لمصروف" (Convert Task to Expense)
        # ------------------------------------------------------------------
        print("\n=== 4. AUDITING CONVERT TASK TO EXPENSE ===")
        btn_convert = page.locator('button:has-text("تحويل لمصروف")').first
        assert await btn_convert.count() > 0, "'تحويل لمصروف' button not found!"
        await btn_convert.click()
        await page.wait_for_timeout(800)
        
        tx_modal = page.locator('#txModal')
        assert await tx_modal.is_visible(), "txModal did not open!"
        inp_label = await page.locator('#inpTxLabel').input_value()
        print(f"txModal opened with pre-filled label: '{inp_label}'")
        assert len(inp_label) > 0, "inpTxLabel was empty!"
        
        await page.screenshot(path="C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/v503_task_converted_to_expense.png")
        print("Captured: v503_task_converted_to_expense.png")
        
        print("\nALL VERIFICATIONS PASSED WITH 100% SUCCESS!")
        await browser.close()

asyncio.run(verify())
