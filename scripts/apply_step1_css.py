# -*- coding: utf-8 -*-
"""
Script to apply comprehensive fixes:
1. Cockpit: explicit SVG strokes, dimensions, and luxurious styling
2. Commitments Cards: 3-tier vertical stack, non-truncating labels, stacked item count badges
3. Budgets Button & Dual Tabs: complete rebuild from scratch with .luxury-master-segment-strip
4. Budgets Engine: per-person expense linking with getExpensesForBudgetItem, Member Filter Strip, and Edit Budget Item Modal
"""

import sys
import os

INDEX_PATH = 'index.html'

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Original content length: {len(content)}")

# =========================================================================
# 1. Update CSS in <style>
# =========================================================================
new_css = """
    /* --- Master Luxury Segmented Strip for Commitments & Budgets --- */
    .luxury-master-segment-strip {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 8px !important;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95)) !important;
      padding: 6px !important;
      border-radius: 14px !important;
      border: 1.5px solid rgba(56, 189, 248, 0.28) !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
      box-sizing: border-box !important;
      margin-bottom: 12px !important;
    }
    .lux-segment-btn {
      padding: 8px 10px !important;
      border-radius: 11px !important;
      border: 1.2px solid transparent !important;
      background: transparent !important;
      color: #94a3b8 !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 8px !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      user-select: none !important;
    }
    .lux-segment-btn:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      color: #f1f5f9 !important;
    }
    .lux-segment-btn.active#tabExpectedBillsAndDebts {
      background: linear-gradient(135deg, #0284c7, #0369a1) !important;
      border-color: #38bdf8 !important;
      color: #ffffff !important;
      box-shadow: 0 4px 16px rgba(2, 132, 199, 0.45) !important;
    }
    .lux-segment-btn.active#tabExpectedBudgets {
      background: linear-gradient(135deg, #059669, #0d9488) !important;
      border-color: #34d399 !important;
      color: #ffffff !important;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.45) !important;
    }
    .lux-segment-icon {
      width: 32px !important;
      height: 32px !important;
      border-radius: 8px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 0.95rem !important;
      flex-shrink: 0 !important;
    }
    .lux-segment-btn.active .lux-segment-icon.bills-icon {
      background: rgba(255, 255, 255, 0.2) !important;
      color: #ffffff !important;
    }
    .lux-segment-btn:not(.active) .lux-segment-icon.bills-icon {
      background: rgba(56, 189, 248, 0.15) !important;
      color: #38bdf8 !important;
    }
    .lux-segment-btn.active .lux-segment-icon.budgets-icon {
      background: rgba(255, 255, 255, 0.2) !important;
      color: #ffffff !important;
    }
    .lux-segment-btn:not(.active) .lux-segment-icon.budgets-icon {
      background: rgba(16, 185, 129, 0.15) !important;
      color: #34d399 !important;
    }
    .lux-segment-info {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      text-align: right !important;
      flex: 1 !important;
      min-width: 0 !important;
    }
    .lux-segment-title {
      font-size: clamp(0.72rem, 2.1vw, 0.82rem) !important;
      font-weight: 900 !important;
      white-space: nowrap !important;
      line-height: 1.2 !important;
    }
    .lux-segment-sub {
      font-size: 0.60rem !important;
      opacity: 0.8 !important;
      white-space: nowrap !important;
    }
    .lux-segment-badge {
      font-size: 0.62rem !important;
      font-weight: 900 !important;
      padding: 2px 7px !important;
      border-radius: 8px !important;
      white-space: nowrap !important;
      flex-shrink: 0 !important;
    }
    .lux-segment-btn.active .lux-segment-badge {
      background: rgba(255, 255, 255, 0.25) !important;
      color: #ffffff !important;
    }
    .lux-segment-btn:not(.active) .lux-segment-badge {
      background: rgba(255, 255, 255, 0.08) !important;
      color: #94a3b8 !important;
    }

    /* --- Commitment Cards 3-tier Non-Truncating Grid --- */
    .com-kpi-cards-grid {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 6px !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .com-kpi-card {
      border-radius: 12px !important;
      padding: 6px 3px 5px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: space-between !important;
      cursor: pointer !important;
      text-align: center !important;
      min-height: 72px !important;
      box-sizing: border-box !important;
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
      overflow: hidden !important;
    }
    .com-card-header {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 3px !important;
      width: 100% !important;
      flex-wrap: nowrap !important;
    }
    .com-card-icon {
      font-size: 0.68rem !important;
      flex-shrink: 0 !important;
    }
    .com-card-title {
      font-size: clamp(0.58rem, 1.75vw, 0.68rem) !important;
      font-weight: 900 !important;
      white-space: nowrap !important;
      line-height: 1.15 !important;
      overflow: visible !important;
      text-overflow: clip !important;
    }
    .com-card-badge-wrap {
      margin: 2px 0 1px !important;
      width: 100% !important;
      display: flex !important;
      justify-content: center !important;
    }
    .com-card-count-badge {
      font-size: clamp(0.52rem, 1.5vw, 0.58rem) !important;
      padding: 1px 5px !important;
      border-radius: 5px !important;
      font-weight: 850 !important;
      white-space: nowrap !important;
      line-height: 1.2 !important;
      display: inline-block !important;
    }
    .com-card-amount {
      font-size: clamp(0.66rem, 1.95vw, 0.80rem) !important;
      font-weight: 950 !important;
      font-family: var(--font-numbers) !important;
      direction: rtl !important;
      line-height: 1.15 !important;
      white-space: nowrap !important;
    }

    /* شريط فلترة أفراد الميزانية */
    .budget-member-filter-strip {
      display: flex;
      gap: 5px;
      overflow-x: auto;
      padding: 4px 2px 8px;
      margin-bottom: 8px;
      scrollbar-width: none;
    }
    .budget-member-filter-strip::-webkit-scrollbar { display: none; }
    .btn-budget-member-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 9px;
      font-size: 0.72rem;
      font-weight: 850;
      white-space: nowrap;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(30, 41, 59, 0.7);
      color: #94a3b8;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-budget-member-pill:hover {
      background: rgba(56, 189, 248, 0.15);
      color: #f1f5f9;
      border-color: rgba(56, 189, 248, 0.35);
    }
    .btn-budget-member-pill.active {
      background: linear-gradient(135deg, #0284c7, #0369a1) !important;
      color: #ffffff !important;
      border-color: #38bdf8 !important;
      box-shadow: 0 2px 10px rgba(2, 132, 199, 0.4);
      font-weight: 950;
    }
"""

# Inject new_css before </style>
style_close = content.find('</style>')
if style_close != -1:
    content = content[:style_close] + new_css + '\n' + content[style_close:]
    print("Injected new CSS into <style>")
else:
    print("WARNING: </style> not found!")

with open('scripts/apply_step1_css.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Step 1 complete.")
