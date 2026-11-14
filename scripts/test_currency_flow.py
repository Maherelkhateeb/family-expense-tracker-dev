import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

html_test = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
body { font-family: sans-serif; background: #0f172a; color: #fff; padding: 30px; }
.amount-flow-cluster {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: baseline !important;
  gap: 4px !important;
  direction: rtl !important;
  unicode-bidi: isolate !important;
  white-space: nowrap !important;
}
.tx-sign-symbol { font-weight: 900; font-size: 1.2rem; }
.tx-sign-symbol.sign-expense { color: #f43f5e; }
.tx-sign-symbol.sign-income { color: #10b981; }
.tx-number-val { font-variant-numeric: tabular-nums; font-weight: 900; font-size: 1.2rem; }
.tx-currency-label { font-size: 0.85rem; font-weight: 800; color: #94a3b8; }
</style>
</head>
<body>
  <h3>اختبار تدفق المبالغ والعملة (Sign Right, Num Middle, Curr Left):</h3>
  
  <div style="margin: 20px 0;">
    <div>مصروف (Expense):</div>
    <span class="amount-flow-cluster" id="expCluster" dir="rtl">
      <span class="tx-sign-symbol sign-expense" id="expSign">-</span>
      <span class="tx-number-val" id="expNum">1,550.00</span>
      <span class="tx-currency-label" id="expCurr">ج.م</span>
    </span>
  </div>

  <div style="margin: 20px 0;">
    <div>دخل (Income):</div>
    <span class="amount-flow-cluster" id="incCluster" dir="rtl">
      <span class="tx-sign-symbol sign-income" id="incSign">+</span>
      <span class="tx-number-val" id="incNum">8,250.50</span>
      <span class="tx-currency-label" id="incCurr">ج.م</span>
    </span>
  </div>

  <div style="margin: 20px 0;">
    <div>ريال سعودي:</div>
    <span class="amount-flow-cluster" id="sarCluster" dir="rtl">
      <span class="tx-sign-symbol sign-expense" id="sarSign">-</span>
      <span class="tx-number-val" id="sarNum">350.00</span>
      <span class="tx-currency-label" id="sarCurr">ر.س</span>
    </span>
  </div>

  <div style="margin: 20px 0;">
    <div>دولار:</div>
    <span class="amount-flow-cluster" id="usdCluster" dir="rtl">
      <span class="tx-sign-symbol sign-expense" id="usdSign">-</span>
      <span class="tx-number-val" id="usdNum">120.00</span>
      <span class="tx-currency-label" id="usdCurr">$</span>
    </span>
  </div>
</body>
</html>
"""

with open('C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/test_currency_flow.html', 'w', encoding='utf-8') as f:
    f.write(html_test)

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 412, "height": 800})
        await page.goto('file:///C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/test_currency_flow.html')
        await page.wait_for_timeout(400)
        
        for prefix in ['exp', 'inc', 'sar', 'usd']:
            s_box = await page.evaluate(f"() => document.getElementById('{prefix}Sign').getBoundingClientRect()")
            n_box = await page.evaluate(f"() => document.getElementById('{prefix}Num').getBoundingClientRect()")
            c_box = await page.evaluate(f"() => document.getElementById('{prefix}Curr').getBoundingClientRect()")
            
            print(f"[{prefix}] Sign X: {s_box['x']:.2f}, Num X: {n_box['x']:.2f}, Curr X: {c_box['x']:.2f}")
            assert s_box['x'] > n_box['x'], f"{prefix} Sign is not to the right of Num!"
            assert n_box['x'] > c_box['x'], f"{prefix} Num is not to the right of Curr!"
            print(f"[{prefix}] PASSED: Sign is on the RIGHT, Curr is on the LEFT!")
            
        await page.screenshot(path="C:/Users/96656/.gemini/antigravity/brain/0de95090-23a6-4a7f-a9b2-09153ee49670/test_currency_flow_verified.png")
        await browser.close()

asyncio.run(test())
