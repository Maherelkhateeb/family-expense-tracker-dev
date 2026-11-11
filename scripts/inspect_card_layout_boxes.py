import os, sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

html_path = os.path.abspath("index.html")
file_url = f"file:///{html_path.replace(os.sep, '/')}"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 412, 'height': 915})
    page.goto(file_url, wait_until="domcontentloaded")

    card = page.locator(".cat-card").first
    card_box = card.bounding_box()
    top_box = card.locator(".cat-card-top-half").bounding_box()
    bubble_box = card.locator(".cat-icon-bubble").bounding_box()
    label_box = card.locator(".cat-label-text").bounding_box()
    bottom_box = card.locator(".cat-card-bottom-half").bounding_box()

    print(f"Card bounding box: {card_box}")
    print(f"Top half bounding box: {top_box}")
    print(f"Bubble bounding box: {bubble_box}")
    print(f"Label bounding box: {label_box}")
    print(f"Bottom half bounding box: {bottom_box}")

    browser.close()
