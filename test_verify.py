from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    context = browser.new_context(viewport={'width': 412, 'height': 892}, device_scale_factor=2)
    page = context.new_page()
    page.goto('http://localhost:8082/', wait_until='networkidle')
    page.wait_for_timeout(1000)
    
    # 1. Test Layout 0: Check floating mic visibility
    page.evaluate("window.HomeLayouts.setLayout(0)")
    page.wait_for_timeout(400)
    mic_l0_vis = page.evaluate("getComputedStyle(document.getElementById('btnVoiceAssistantFab')).display")
    print('Layout 0 mic display:', mic_l0_vis)
    page.screenshot(path='layout_test_shots/verify_l0_dark.png')
    
    # 2. Test Layout 4 Dark
    page.evaluate("window.HomeLayouts.setLayout(4)")
    page.wait_for_timeout(400)
    mic_l4_vis = page.evaluate("getComputedStyle(document.getElementById('btnVoiceAssistantFab')).display")
    print('Layout 4 mic display:', mic_l4_vis)
    page.screenshot(path='layout_test_shots/verify_l4_dark.png')
    
    # 3. Test Layout 4 Light
    page.evaluate("""
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        if (typeof switchAppTheme === 'function') switchAppTheme('light');
    """)
    page.evaluate("window.HomeLayouts.setLayout(4)")
    page.wait_for_timeout(400)
    mic_l4_light_vis = page.evaluate("getComputedStyle(document.getElementById('btnVoiceAssistantFab')).display")
    print('Layout 4 light mic display:', mic_l4_light_vis)
    page.screenshot(path='layout_test_shots/verify_l4_light.png')

    browser.close()
    print('ALL VERIFICATION SCREENSHOTS TAKEN SUCCESSFULLY!')
