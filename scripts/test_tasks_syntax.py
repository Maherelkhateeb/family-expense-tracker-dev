import asyncio
from playwright.async_api import async_playwright

async def test_js():
    with open('scripts/generate_tasks_engine_v523.js', 'r', encoding='utf-8') as f:
        js = f.read()

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        try:
            await page.evaluate(f"() => {{ {js} }}")
            print("Syntax check: SUCCESS! Script executes without error.")
        except Exception as e:
            print("Syntax check: FAILED! Error:", e)
        await browser.close()

asyncio.run(test_js())
