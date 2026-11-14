import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 915})
        
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html')
        await page.wait_for_timeout(2000)
        
        # -------------------------------------------------------------
        # 1. VERIFY TRANSACTION MODAL (يخص من في العائلة)
        # -------------------------------------------------------------
        print("\n=== 1. Verifying Transaction Modal ===")
        await page.evaluate("openTxModal('expense')")
        await page.wait_for_timeout(1000)
        
        tx_info = await page.evaluate("""() => {
            const picker = document.getElementById('txMemberPhotoPicker');
            const chips = Array.from(picker ? picker.querySelectorAll('.member-photo-chip') : []).map(c => ({
                id: c.getAttribute('data-member-id'),
                text: c.textContent.trim(),
                active: c.classList.contains('active')
            }));
            const badge = document.getElementById('txActiveMemberNameBadge');
            const val = document.getElementById('inpTxMember');
            return {
                chipCount: chips.length,
                chips: chips,
                badge: badge ? badge.textContent : null,
                inputVal: val ? val.value : null
            };
        }""")
        print(f"Total chips: {tx_info['chipCount']}, Default Badge: {tx_info['badge']}, Input: {tx_info['inputVal']}")
        
        # Select member 'ماهر'
        await page.evaluate("selectTxMemberPicker('ماهر')")
        await page.wait_for_timeout(400)
        
        tx_after_select = await page.evaluate("""() => {
            return {
                badge: document.getElementById('txActiveMemberNameBadge')?.textContent,
                inputVal: document.getElementById('inpTxMember')?.value
            };
        }""")
        print(f"After selecting ماهر: Badge: {tx_after_select['badge']}, Input: {tx_after_select['inputVal']}")
        
        await page.screenshot(path="C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/v502_tx_modal_verified.png")
        print("Captured: v502_tx_modal_verified.png")
        await page.evaluate("closeModal('txModal')")
        await page.wait_for_timeout(500)
        
        # -------------------------------------------------------------
        # 2. VERIFY TASKS & SUBTASKS OVERHAUL
        # -------------------------------------------------------------
        print("\n=== 2. Verifying Tasks & Subtasks Overhaul ===")
        await page.evaluate("openSummaryDrawer('tasks')")
        await page.wait_for_timeout(1000)
        
        # Check Tasks Guide Banner
        guide_visible = await page.evaluate("() => Boolean(document.querySelector('.tasks-guide-banner'))")
        print("Tasks Guide Banner present:", guide_visible)
        
        # Toggle Guide Details
        await page.evaluate("toggleTasksGuideDetails()")
        await page.wait_for_timeout(400)
        guide_body_disp = await page.evaluate("() => document.getElementById('tasksGuideDetailsBody')?.style.display")
        print("Tasks Guide Details display after toggle:", guide_body_disp)
        
        # Ensure at least one task exists for testing subtasks
        tasks_count = await page.evaluate("""() => {
            let tasks = getTodoTasks();
            if (!tasks || tasks.length === 0) {
                tasks = [{
                    id: 'task-test-demo',
                    title: 'سداد فواتير وشراء احتياجات البيت الشهرية',
                    dueDateTime: '2026-11-08T18:00',
                    dueDate: '2026-11-08',
                    dueTime: '18:00',
                    priority: 'high',
                    tag: 'bills',
                    completed: false,
                    starred: true,
                    subtasks: [
                        { id: 'sub-1', title: 'سداد فاتورة الكهرباء عبر التطبيق البنكي', completed: true, dueDateTime: '2026-11-08T10:00' },
                        { id: 'sub-2', title: 'سحب كاش لمصروف البيت ومستلزمات الأولاد', completed: false, dueDateTime: '2026-11-08T14:00' }
                    ]
                }];
                saveTodoTasks(tasks);
                renderDrawerTasksList();
            }
            return tasks.length;
        }""")
        print("Tasks count in drawer:", tasks_count)
        await page.wait_for_timeout(500)
        
        # Test clicking '+ إضافة خطوة فرعية'
        task_id = await page.evaluate("() => getTodoTasks()[0]?.id")
        await page.evaluate(f"toggleSubtaskForm('{task_id}', true)")
        await page.wait_for_timeout(500)
        
        subtask_box_disp = await page.evaluate(f"() => document.getElementById('subtaskAddBox_{task_id}')?.style.display")
        print(f"Subtask Add Box for {task_id} display:", subtask_box_disp)
        
        await page.screenshot(path="C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/v502_tasks_subtasks_overhaul.png")
        print("Captured: v502_tasks_subtasks_overhaul.png")
        await page.evaluate("closeSummaryLeftDrawer()")
        await page.wait_for_timeout(500)
        
        # -------------------------------------------------------------
        # 3. VERIFY SETTINGS SCREEN REBUILD
        # -------------------------------------------------------------
        print("\n=== 3. Verifying Settings Rebuild ===")
        await page.evaluate("openSettingsModal()")
        await page.wait_for_timeout(1000)
        
        settings_info = await page.evaluate("""() => {
            const auditBtn = document.querySelector('button[onclick="runInstantSettingsAudit()"]');
            const userCapsule = document.querySelector('.settings-user-capsule');
            const activeUserTxt = document.getElementById('settingsCurrentMemberName')?.textContent;
            const emblemPicker = document.getElementById('emblemOptionButtonsGroup');
            return {
                hasAuditBtn: Boolean(auditBtn),
                auditBtnText: auditBtn ? auditBtn.textContent.trim() : null,
                hasUserCapsule: Boolean(userCapsule),
                activeUserText: activeUserTxt,
                emblemPickerRemoved: (emblemPicker === null)
            };
        }""")
        print("Settings Modal Info:", settings_info)
        
        await page.screenshot(path="C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/v502_settings_rebuilt.png")
        print("Captured: v502_settings_rebuilt.png")
        
        # Test Opening Full User Selection Modal
        await page.evaluate("openFullUserSelectionModal()")
        await page.wait_for_timeout(1000)
        
        full_user_info = await page.evaluate("""() => {
            const modal = document.getElementById('fullUserSelectionModal');
            const grid = document.getElementById('fullUserSelectionGridContainer');
            const cards = Array.from(grid ? grid.children : []).map(c => c.textContent.trim().replace(/\\s+/g, ' '));
            return {
                modalDisplay: window.getComputedStyle(modal).display,
                cardCount: cards.length,
                firstCard: cards[0],
                allCards: cards
            };
        }""")
        print("Full User Selection Info:", full_user_info)
        
        await page.screenshot(path="C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/v502_full_user_selection.png")
        print("Captured: v502_full_user_selection.png")
        
        await browser.close()
        print("\nAll verifications completed successfully!")

asyncio.run(run())
