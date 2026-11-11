import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Users\96656\.gemini\antigravity\scratch\family_expense_tracker_monefy\index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Original content length: {len(content)}")

# =========================================================================
# 1. FIX: topCardBalance font-size and overflow in HTML & CSS
# =========================================================================
# Line 12145 has:
# <div class="cockpit-hero-value" id="topCardBalance" style="font-size: clamp(1.65rem, 5.2vw, 2.20rem) !important; font-weight: 950 !important; letter-spacing: -0.3px; text-shadow: 0 2px 18px rgba(56, 189, 248, 0.65); margin: auto 0; color: #38bdf8;">+ 0.00 ج.م</div>
old_top_card_balance = '<div class="cockpit-hero-value" id="topCardBalance" style="font-size: clamp(1.65rem, 5.2vw, 2.20rem) !important; font-weight: 950 !important; letter-spacing: -0.3px; text-shadow: 0 2px 18px rgba(56, 189, 248, 0.65); margin: auto 0; color: #38bdf8;">+ 0.00 ج.م</div>'

new_top_card_balance = '<div class="cockpit-hero-value" id="topCardBalance" style="font-size: clamp(1.15rem, 3.8vw, 1.60rem); font-weight: 950; letter-spacing: -0.3px; text-shadow: 0 2px 18px rgba(56, 189, 248, 0.65); margin: auto 0; color: #38bdf8; max-width: 100%; overflow: visible;">+ 0.00 ج.م</div>'

if old_top_card_balance in content:
    content = content.replace(old_top_card_balance, new_top_card_balance)
    print("1. Replaced old topCardBalance inline font-size successfully.")
else:
    print("WARNING: old_top_card_balance not found verbatim, searching pattern...")
    content = re.sub(
        r'<div class="cockpit-hero-value" id="topCardBalance"[^>]*>',
        '<div class="cockpit-hero-value" id="topCardBalance" style="font-size: clamp(1.15rem, 3.8vw, 1.60rem); font-weight: 950; letter-spacing: -0.3px; text-shadow: 0 2px 18px rgba(56, 189, 248, 0.65); margin: auto 0; color: #38bdf8; max-width: 100%; overflow: visible;">',
        content
    )
    print("1. Pattern replacement for topCardBalance applied.")

# In CSS: update .cockpit-hero-value to not have !important clamp(1.70rem, 5.5vw, 2.30rem)
old_css_hero = """.cockpit-hero-value {
      font-size: clamp(1.70rem, 5.5vw, 2.30rem) !important;
      font-weight: 950 !important;
      color: #38bdf8 !important;
      letter-spacing: -0.3px !important;
      direction: rtl !important;
      text-align: right !important;
      font-variant-numeric: tabular-nums !important;
      line-height: 1.15 !important;
      white-space: nowrap !important;
      text-shadow: 0 2px 18px rgba(56, 189, 248, 0.65) !important;
    }"""

new_css_hero = """.cockpit-hero-value {
      font-size: clamp(1.15rem, 3.8vw, 1.60rem);
      font-weight: 950 !important;
      color: #38bdf8 !important;
      letter-spacing: -0.3px !important;
      direction: rtl !important;
      text-align: right !important;
      font-variant-numeric: tabular-nums !important;
      line-height: 1.15 !important;
      white-space: nowrap !important;
      text-shadow: 0 2px 18px rgba(56, 189, 248, 0.65) !important;
      max-width: 100% !important;
      overflow: visible !important;
    }"""

if old_css_hero in content:
    content = content.replace(old_css_hero, new_css_hero)
    print("2. Replaced .cockpit-hero-value CSS rule.")

# In renderUI, ensure dynamic font sizing for elBal uses setProperty with 'important'
old_bal_sizing = """        // تحجيم ذكي للأرقام الكبيرة حتى لا تتجاوز حدود البطاقة أو تظهر نقاط اختصار (...)
        const balStr = elBal.textContent || '';
        if (balStr.length > 22) {
          elBal.style.fontSize = 'clamp(0.95rem, 3.0vw, 1.12rem)';
          elBal.style.letterSpacing = '-0.4px';
        } else if (balStr.length > 15) {
          elBal.style.fontSize = 'clamp(1.12rem, 3.7vw, 1.30rem)';
          elBal.style.letterSpacing = '-0.3px';
        } else {
          elBal.style.fontSize = 'clamp(1.22rem, 4.0vw, 1.45rem)';
          elBal.style.letterSpacing = '-0.2px';
        }"""

new_bal_sizing = """        // تحجيم ذكي للأرقام الكبيرة حتى لا تتجاوز حدود البطاقة نهائياً وبدون أي نقاط اختصار (...)
        const balStr = elBal.textContent || '';
        if (balStr.length > 22) {
          elBal.style.setProperty('font-size', 'clamp(0.88rem, 2.7vw, 1.05rem)', 'important');
          elBal.style.letterSpacing = '-0.5px';
        } else if (balStr.length > 15) {
          elBal.style.setProperty('font-size', 'clamp(1.02rem, 3.2vw, 1.22rem)', 'important');
          elBal.style.letterSpacing = '-0.3px';
        } else if (balStr.length > 10) {
          elBal.style.setProperty('font-size', 'clamp(1.15rem, 3.6vw, 1.38rem)', 'important');
          elBal.style.letterSpacing = '-0.2px';
        } else {
          elBal.style.setProperty('font-size', 'clamp(1.25rem, 4.0vw, 1.55rem)', 'important');
          elBal.style.letterSpacing = '-0.1px';
        }"""

if old_bal_sizing in content:
    content = content.replace(old_bal_sizing, new_bal_sizing)
    print("3. Replaced balance dynamic sizing logic.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Step 1 done.")
