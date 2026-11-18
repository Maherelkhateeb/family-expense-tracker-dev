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
    assert mic_l0_vis == 'flex', f"Expected flex on layout 0, got {mic_l0_vis}"
    
    # 2. Test Layout 4 Dark
    page.evaluate("window.HomeLayouts.setLayout(4)")
    page.wait_for_timeout(400)
    mic_l4_vis = page.evaluate("getComputedStyle(document.getElementById('btnVoiceAssistantFab')).display")
    print('Layout 4 mic display:', mic_l4_vis)
    assert mic_l4_vis == 'none', f"Expected none on layout 4, got {mic_l4_vis}"
    
    cards_count = page.evaluate("document.querySelectorAll('.hl-card-l4').length")
    print('Layout 4 cards count:', cards_count)
    assert cards_count == 9, f"Expected 9 cards, got {cards_count}"
    
    has_voice_banner = page.evaluate("document.querySelector('.hl-layout4-voice-strip') !== null")
    print('Layout 4 has full-width voice banner:', has_voice_banner)
    assert has_voice_banner, "Expected full-width voice banner in layout 4"
    
    # Verify card names in order
    card_names = page.eval_on_selector_all(".hl-card-l4-name", "els => els.map(e => e.textContent.trim())")
    print('Layout 4 card names:', card_names)
    assert 'ملابس وأحذية' in card_names, "Expected clothes card in 3x3 grid"
    
    page.screenshot(path='layout_test_shots/verify_l4_new_dark.png')
    
    # 3. Test Layout 4 Light
    page.evaluate("""
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        if (typeof switchAppTheme === 'function') switchAppTheme('light');
    """)
    page.evaluate("window.HomeLayouts.setLayout(4)")
    page.wait_for_timeout(400)
    page.screenshot(path='layout_test_shots/verify_l4_new_light.png')

    browser.close()
    print('NEW LAYOUT 4 TESTS PASSED 100% PERFECTLY!')
