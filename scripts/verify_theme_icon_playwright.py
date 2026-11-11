# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

def test_themes_and_icons():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 420, 'height': 880})
        
        page.on('console', lambda msg: print(f'[CONSOLE] {msg.type}: {msg.text}'))
        page.on('pageerror', lambda err: print(f'[PAGE ERROR] {err}'))
        
        url = 'file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/index.html?user=maher'
        page.goto(url)
        page.wait_for_timeout(2000)
        
        # Screenshot initial home screen
        page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\1661ab9d-1423-4a78-8610-5105477fd91a\verified_home_initial.png')
        
        # Open Settings modal
        page.evaluate("if (typeof openSettingsModal === 'function') openSettingsModal();")
        page.wait_for_timeout(800)
        
        # 1. Click Emerald Theme
        print("Clicking #themeOptEmerald...")
        page.click('#themeOptEmerald')
        page.wait_for_timeout(600)
        
        # 2. Click Gold Icon Theme
        print("Clicking #iconThemeOptGold...")
        page.click('#iconThemeOptGold')
        page.wait_for_timeout(600)
        
        page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\1661ab9d-1423-4a78-8610-5105477fd91a\verified_settings_emerald_gold.png')
        
        # Close Settings modal using closeModal('settingsModal')
        print("Closing Settings modal...")
        page.evaluate("closeModal('settingsModal');")
        page.wait_for_timeout(800)
        
        # Screenshot home screen with Emerald theme + Gold icons
        page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\1661ab9d-1423-4a78-8610-5105477fd91a\verified_home_emerald_gold.png')
        
        # 3. Open Settings and switch to Midnight theme + Rose icon palette
        print("Opening settings and switching to Midnight theme + Rose icon palette...")
        page.evaluate("if (typeof openSettingsModal === 'function') openSettingsModal();")
        page.wait_for_timeout(600)
        page.click('#themeOptMidnight')
        page.wait_for_timeout(600)
        page.click('#iconThemeOptRose')
        page.wait_for_timeout(600)
        
        page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\1661ab9d-1423-4a78-8610-5105477fd91a\verified_settings_midnight_rose.png')
        
        # Close Settings modal
        page.evaluate("closeModal('settingsModal');")
        page.wait_for_timeout(800)
        
        # Screenshot home screen with Midnight theme + Rose icons
        page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\1661ab9d-1423-4a78-8610-5105477fd91a\verified_home_midnight_rose.png')
        
        # 4. Open Settings and switch to Light theme + Emerald icon palette
        print("Opening settings and switching to Light theme + Emerald icon palette...")
        page.evaluate("if (typeof openSettingsModal === 'function') openSettingsModal();")
        page.wait_for_timeout(600)
        page.click('#themeOptLight')
        page.wait_for_timeout(600)
        page.click('#iconThemeOptEmerald')
        page.wait_for_timeout(600)
        
        page.evaluate("closeModal('settingsModal');")
        page.wait_for_timeout(800)
        page.screenshot(path=r'C:\Users\96656\.gemini\antigravity\brain\1661ab9d-1423-4a78-8610-5105477fd91a\verified_home_light_emerald.png')
        
        browser.close()
        print("All visual tests completed successfully!")

if __name__ == '__main__':
    test_themes_and_icons()
