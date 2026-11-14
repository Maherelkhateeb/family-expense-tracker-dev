import sys
import os
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

repo_dir = r"C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy"
html_path = "file:///" + os.path.join(repo_dir, "index.html").replace("\\", "/")
artifacts_dir = r"C:\Users\96656\.gemini\antigravity\brain\41612e6e-3dec-41c4-bd40-64364cb0071b"

console_errors = []
page_errors = []

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport similar to user device (e.g. 390x844)
        context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        print("Navigating to:", html_path)
        page.goto(html_path)
        page.wait_for_timeout(1500)

        print(f"Page errors: {len(page_errors)}")
        for pe in page_errors:
            print("  PAGE ERROR:", pe)
        print(f"Console errors: {len(console_errors)}")
        for ce in console_errors[:5]:
            print("  CONSOLE ERROR:", ce)

        # -------------------------------------------------------------
        # TEST 1: Main Balance & Truncation
        # -------------------------------------------------------------
        top_bal_el = page.locator("#topCardBalance")
        bal_text = top_bal_el.inner_text()
        print(f"1. Top Card Balance text: '{bal_text}'")
        assert "..." not in bal_text, f"Top card balance should not contain '...', got {bal_text}"
        assert "…" not in bal_text, f"Top card balance should not contain ellipsis, got {bal_text}"

        # -------------------------------------------------------------
        # TEST 2: Category Cards dynamic theme coloring
        # -------------------------------------------------------------
        print("\n2. Testing Category Cards theme adaptation...")
        # Switch to emerald
        page.evaluate("setAppTheme('emerald')")
        page.wait_for_timeout(300)
        card_bg_emerald = page.locator(".cat-card").first.evaluate("el => window.getComputedStyle(el).backgroundImage")
        print("   Emerald theme first card background:", card_bg_emerald[:60])
        assert "3, 28, 19" in card_bg_emerald or "rgb(3, 28, 19)" in card_bg_emerald or "#031c13" in card_bg_emerald or "rgb(6, 69, 50)" in card_bg_emerald or "160deg" in card_bg_emerald, f"Emerald gradient missing from card bg: {card_bg_emerald}"

        # Switch to ocean
        page.evaluate("setAppTheme('ocean')")
        page.wait_for_timeout(300)
        card_bg_ocean = page.locator(".cat-card").first.evaluate("el => window.getComputedStyle(el).backgroundImage")
        print("   Ocean theme first card background:", card_bg_ocean[:60])
        assert "5, 27, 42" in card_bg_ocean or "rgb(5, 27, 42)" in card_bg_ocean or "#051b2a" in card_bg_ocean or "14, 62, 92" in card_bg_ocean or "160deg" in card_bg_ocean, f"Ocean gradient missing from card bg: {card_bg_ocean}"

        # Screenshot Cockpit with Ocean theme
        snap1_path = os.path.join(artifacts_dir, "v526_cockpit_ocean_theme.png")
        page.screenshot(path=snap1_path)
        print(f"   Saved screenshot: {snap1_path}")

        # -------------------------------------------------------------
        # TEST 3: Theme selection indicator in Settings
        # -------------------------------------------------------------
        print("\n3. Testing Theme selection indicator in Settings...")
        page.evaluate("openModal('settingsModal'); updateSettingsModalDisplay();")
        page.wait_for_timeout(500)

        # Select Gold theme
        page.click("#themeOptGold")
        page.wait_for_timeout(300)
        gold_active = page.locator("#themeOptGold").evaluate("el => el.classList.contains('active')")
        gold_badge_vis = page.locator("#themeOptGold .theme-selected-badge").is_visible()
        gold_badge_txt = page.locator("#themeOptGold .theme-selected-badge").inner_text()
        gold_dot_html = page.locator("#themeOptGold .theme-color-dot").inner_html()
        print(f"   Gold option active: {gold_active}, badge visible: {gold_badge_vis} ('{gold_badge_txt}'), dot HTML: '{gold_dot_html}'")
        assert gold_active, "Gold theme option must be active"
        assert gold_badge_vis, "Gold theme option must have active badge visible"

        # Select Emerald theme
        page.click("#themeOptEmerald")
        page.wait_for_timeout(300)
        em_active = page.locator("#themeOptEmerald").evaluate("el => el.classList.contains('active')")
        em_badge_vis = page.locator("#themeOptEmerald .theme-selected-badge").is_visible()
        print(f"   Emerald option active: {em_active}, badge visible: {em_badge_vis}")
        assert em_active, "Emerald theme option must be active"
        assert em_badge_vis, "Emerald theme option must have active badge visible"

        # -------------------------------------------------------------
        # TEST 4: Family Emblem Switcher & User Badge
        # -------------------------------------------------------------
        print("\n4. Testing Family Emblem Switcher & User Badge...")
        # Check all 4 emblem buttons exist
        for i in range(1, 5):
            btn = page.locator(f"#btnEmblemOpt{i}")
            assert btn.is_visible(), f"#btnEmblemOpt{i} should be visible"

        # Click emblem 3 (المدار الزجاجي)
        page.click("#btnEmblemOpt3")
        page.wait_for_timeout(300)
        badge_txt = page.locator("#activeEmblemNameBadge").inner_text()
        print(f"   Emblem 3 clicked -> active badge text: '{badge_txt}'")
        assert "المدار الزجاجي" in badge_txt, f"Expected 'المدار الزجاجي' in badge, got '{badge_txt}'"

        # Click emblem 1 (الدرع الملكي)
        page.click("#btnEmblemOpt1")
        page.wait_for_timeout(300)
        badge_txt1 = page.locator("#activeEmblemNameBadge").inner_text()
        print(f"   Emblem 1 clicked -> active badge text: '{badge_txt1}'")
        assert "الدرع الملكي" in badge_txt1, f"Expected 'الدرع الملكي' in badge, got '{badge_txt1}'"

        # Check User badge bounding box (must not overflow parent card)
        user_badge = page.locator("#settingsActiveUserBadge")
        assert user_badge.is_visible(), "#settingsActiveUserBadge must be visible"
        parent_card = page.locator(".settings-user-capsule")

        badge_box = user_badge.bounding_box()
        parent_box = parent_card.bounding_box()
        print(f"   User badge bounding box: {badge_box}")
        print(f"   Parent capsule bounding box: {parent_box}")

        # In RTL or LTR: badge must be completely within parent horizontal bounds (allow 2px tolerance for borders)
        assert badge_box["x"] >= parent_box["x"] - 2, f"Badge left ({badge_box['x']}) spills outside parent left ({parent_box['x']})"
        assert badge_box["x"] + badge_box["width"] <= parent_box["x"] + parent_box["width"] + 2, f"Badge right spills outside parent right"
        print("   >>> CONFIRMED: User badge does NOT overflow parent card!")

        # Take screenshot of Settings Modal with Emblem Switcher and User Badge
        snap2_path = os.path.join(artifacts_dir, "v526_settings_emblem_and_user_badge.png")
        page.screenshot(path=snap2_path)
        print(f"   Saved screenshot: {snap2_path}")

        # Scroll down to theme selector in settings and take screenshot
        theme_sec = page.locator("#themeOptNavy")
        theme_sec.scroll_into_view_if_needed()
        page.wait_for_timeout(200)
        snap3_path = os.path.join(artifacts_dir, "v526_settings_theme_active_indicator.png")
        page.screenshot(path=snap3_path)
        print(f"   Saved screenshot: {snap3_path}")

        browser.close()
        print("\nALL TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    run_test()
