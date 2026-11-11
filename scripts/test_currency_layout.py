import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from playwright.sync_api import sync_playwright

html_content = """
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
body { font-family: sans-serif; background: #0f172a; color: white; padding: 20px; }
.test-box { font-size: 20px; margin: 15px 0; padding: 10px; background: #1e293b; border-radius: 8px; }
.amount-flow-cluster {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: baseline !important;
  gap: 3px !important;
  direction: rtl !important;
  unicode-bidi: isolate !important;
  white-space: nowrap !important;
}
.tx-sign-symbol { color: #f43f5e; font-weight: 900; }
.tx-number-val { font-weight: 900; }
.tx-currency-label { font-size: 0.8em; color: #94a3b8; }
</style>
</head>
<body>
<h3>Visual Position Check (Right to Left in RTL):</h3>
<div class="test-box">
  Cluster:
  <span class="amount-flow-cluster" dir="rtl">
    <span class="tx-sign-symbol">-</span>
    <span class="tx-number-val">1,500.00</span>
    <span class="tx-currency-label">ج.م</span>
  </span>
</div>

<div class="test-box">
  Cluster (currency first in DOM, dir="rtl"):
  <span class="amount-flow-cluster" dir="rtl">
    <span class="tx-currency-label">ج.م</span>
    <span class="tx-number-val">1,500.00</span>
    <span class="tx-sign-symbol">-</span>
  </span>
</div>

<div class="test-box">
  Text 1: 1,500.00 ج.م
</div>

<div class="test-box">
  Text 2: ج.م 1,500.00
</div>

<div class="test-box">
  Text 3 (with sign): - 1,500.00 ج.م
</div>

<div class="test-box">
  Text 4 (with sign): ج.م 1,500.00 -
</div>

<div class="test-box">
  Text 5 (with sign): - ج.م 1,500.00
</div>

</body>
</html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_content(html_content)
    # Get bounding boxes of elements
    boxes = page.evaluate("""() => {
      const results = [];
      const clusters = document.querySelectorAll('.amount-flow-cluster');
      clusters.forEach((c, idx) => {
        const sign = c.querySelector('.tx-sign-symbol').getBoundingClientRect();
        const num = c.querySelector('.tx-number-val').getBoundingClientRect();
        const curr = c.querySelector('.tx-currency-label').getBoundingClientRect();
        results.push({
          idx,
          sign_x: sign.x,
          num_x: num.x,
          curr_x: curr.x
        });
      });
      return results;
    }""")
    print("Bounding box results:", boxes)
    page.screenshot(path="C:/Users/96656/.gemini/antigravity/scratch/family_expense_tracker_monefy/scripts/test_visual_pos.png")
    browser.close()
