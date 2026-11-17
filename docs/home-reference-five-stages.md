# Family Expense Tracker — five-stage image-matching playbook

Documented 17 November 2026. Update as each stage is accepted.

## Goal and approval gate
The user supplied **five screenshots** of alternative expense home screens. Implement **one picture at a time**, in the order they appear in the user's message. The goal is precisely matching the reference's visual appearance, colors, sizes, placement, spacing, typography and proportions on a real phone **while retaining genuine application functionality**. Show screenshot output and comparison for the current stage and obtain the user's approval before moving to the next. Passing layout smoke tests is necessary but not sufficient; do not claim “100%” without screenshot review and user sign-off.

## Exact image order, implementation selector and source images
1. **Stage 1**: first user image, **two-column horizontal tiles with icons on the left**; screenshot filename `ChatGPT Image Nov 17, 2026, 02_31_04 PM(3).png` (940 × 1673), `#homeInterfaces[data-design="1"]`, class `.home-reference-one`.
2. **Stage 2**: second user image, **summary/wallet panels plus two-column expense tiles**; screenshot filename `ChatGPT Image Nov 17, 2026, 02_30_30 PM(3).png` (941 × 1672), design 2.
3. **Stage 3**: third user image, **single-column compact list**; screenshot filename `ChatGPT Image Nov 17, 2026, 02_30_27 PM(3).png` (941 × 1672), design 3 or the variant matching the visual, to verify rather than assume.
4. **Stage 4**: fourth user image, **large illustrated two-column tile design**; screenshot filename `ChatGPT Image Nov 17, 2026, 02_30_23 PM(3).png` (941 × 1672), design 4 or matching variant, verify.
5. **Stage 5**: fifth user image, **three-column icon-first grid**; screenshot filename `ChatGPT Image Nov 17, 2026, 02_30_09 PM(4).png` (940 × 1674), design 5 or matching variant, verify.

Do not assume existing design numbers match later reference screenshots: inspect `home-layout-391-X.png` and map them before changes.

## Preserve on all five stages
- The original home screen `data-design="0"` must remain **first and default**, unaffected visually.
- Keep the original header's functionality and photographs, filters, date buttons, bottom navigation, balances, and live transactions.
- All **nine financial expense categories** must remain visible even at zero balance. The **voice input is an action**, not a tenth spending category. Preserve its functionality and placement from each photo.
- Quick add, amount drilldown, operations return to originating page and scroll position, period filters, style switching and unsaved transaction data must keep working.
- Never alter real user transactions or family data just to imitate amounts seen in the example screenshot; use temporary fixture data in **isolated screenshot tests** instead.
- Scope each visual override to `#viewExpenses.home-reference-one.active` or the corresponding stage-specific alternative selector. No global color changes that disturb the default or unselected designs.

## Stage 1 implementation — what was done
- Existing base selectors: `home-reference-one.css`, `home-mobile-fit.css`; icon sprites in `assets/home-reference-one.webp`.
- **Avatar filter icon fidelity**: the reference icon artwork for `أخرى` and `الكل` is embedded as a compact **80×40 WebP CSS sprite**, scoped to the first and last avatar bubbles only. Real family portrait images are never overwritten. The reference text/numeric examples remain demonstrations and must not be written to live data.
- **Footer matte**: first photo has a pale background and rounded white footer, not the opaque dark 1px line rendered by the prior transparent app-frame corner. A scoped `#appBottomNav::before` light matte fixes the seam while leaving navigation click targets intact.
- **Final image review**: compare `stage1-reference-391.png` against the actual 391×695 Chromium capture after commit `ba2da9186`; the most obvious remaining differences are live account balances, notification counts and user-controlled family portraits, which must stay data-driven. Functional mobile tests passed on that code.
- **Bottom-nav pixel fidelity**: use the cropped five glossy icons from the user's first image, embedded as a compact **320×64 WebP inline CSS sprite** inside `home-mobile-fit.css` under marker `STAGE 1 NAV PHOTO SPRITE`; scoped to `body:has(#viewExpenses.home-reference-one.active)`. The original SVGs remain in DOM and the navigation handlers are untouched, while pseudo-elements draw [indicators, obligations, request, operations, expenses] from left to right. Keep any obligations badge dynamic — do not hardcode the example's red “11”.
- `Stage 1 nav/caption final calibration` refines icon scale, white footer background, voice caption and card border; photo-specific adjustments must not spill into other designs.
- Added only-first-variant CSS in `home-mobile-fit.css` under the marker `Stage 1 of 5` to replace an incorrectly vertical icon-above-title card with:
  - two columns in RTL;
  - five rows with correct first-reference pairs: [daily, bills], [food, house], [transport, education], [other, health], [voice, clothes], right-to-left;
  - card icon absolutely pinned left, title top right, numeric amount, progress bar and balance text beneath;
  - per-category pastel background and vivid outline, distinct purple voice tile;
  - explicit toolbar **grid-column** positions: [design switch, gold, wallets, currency, summary] right-to-left, because legacy JavaScript sets inline `order: ... !important` and defeats normal cascade.
- `STAGE 1 REFINEMENT` at stylesheet end improves five header capsule widths (removes huge blank gap), aligns portrait sizes, period selector, balance summary, quick-tool sizes and card vertical spacing at approx 391 × 695.
- Important visual truth: original screenshot has example transaction amounts and photos that can differ from live account state; do not set user balances or portraits from screenshots.
- Main tests: `scripts/test-home-reference-one.cjs` (first photo, actions, all 9 categories + voice, screenshots and default-mode preservation), `scripts/test-home-layouts.cjs` (320, 360, 390, **391×695**, 430 and 768 widths, all six layouts, visual row order, no overflow), `.github/workflows/home-reference-one-qa.yml`.
- Actual baseline before the refinement: a full phone screenshot `home-layout-391-1.png` from GitHub Actions run 44122502281 and a side-by-side comparison `stage1-comparison-home-layout-391-1.png`.
- Earlier reference first-card arrangement accidentally matched but still had tiny fonts, cramped/incorrect header capsule spacing and excessive card height. The final stage must compare after the refinements, not reuse the baseline.
- **Stage 1 status**: **IMPLEMENTED, DEPLOYED AND FUNCTIONAL QA PASSED — AWAITING USER VISUAL SIGN-OFF**. Continue visual and interaction QA, inspect the new screenshot, compare against the original and share the result for approval.

## Confirmed Android clipping defect and durable repair (17 November 2026)
- **User evidence**: mobile browser screenshot with a roughly **345 CSS-pixel width** and a reduced visual viewport caused the bottom `ملابس وأحذية` / `إضافة صوتية للمصروفات` row to disappear behind the fixed footer. The reference image visibly contains all five rows.
- **Exact root cause**: the original alternative used `#viewExpenses {overflow:hidden}`, `#homeInterfaces {flex:1 1 0%; max-height:100%; overflow:hidden}`, and `.reference-one-grid {height:100%; grid-template-rows:repeat(5,minmax(0,1fr))}`. This combination resized rows to fill an unconstrained flex parent and clipped any overflow at the app/footer boundary.
- **Permanent first-design-only correction**: append the `FIRST REFERENCE PHONE` CSS section in `home-mobile-fit.css`. Let `#viewExpenses` and `#homeInterfaces` use intrinsic content height, remove overflow hiding on these layers, use five controlled row heights `clamp(67px,18.1cqi,79px)`, and retain scrolling in the real `#appScrollBody` when Chrome's visible viewport is genuinely too short.
- **Do not 'solve' this by** hiding one expense category, making voice an accounting category, shrinking text to illegibility, or setting `overflow:hidden` on parent views.
- **Regression test**: `scripts/test-home-short-viewport.cjs` simulates 320×535, 345×590, **345×650 (the user's approximate mobile browser viewport)**, 360×620, 391×695 and 430×700. All ten cards and voice input must be reachable, with full last-row visibility at 345×650 without scrolling. It also checks that short screens can scroll all the way to the last row, with no horizontal overflow. The workflow uploads initial/bottom screenshots and does not alter real data.
- **Visual acceptance**: `stage1-before-after-fixed.png` shows reference vs the user screenshot before vs 391×695 corrected output. Numerical account values remain dynamic.
- **Reuse** for remaining reference screens: measure mobile viewport available **after browser chrome**, keep a normal fixed bottom navigation, and create a short-viewport regression for every design. Never infer success from desktop or 844px tall screenshots alone.

## Repeatable image-to-app matching method (stages 2–5)
1. Identify correct screenshot reference and app design selector; generate an image contact sheet if needed.
2. Normalize the reference to a mobile CSS viewport, e.g. 940×1673 → 391×695. Record the bounding boxes of header, family row, time filters, balance card, tools, category cards and bottom nav.
3. Run the real mobile screenshot Action / Playwright, download the artifact, inspect `home-layout-391-N.png` and make a side-by-side **before**.
4. Compare exact pair order, number of rows/columns, icon location/size, card geometry, gradients, border width/radius, type size and weight, text direction (Arabic RTL), progress bar and voice tile.
5. Change only the current design's scoped CSS. If inline `!important` collides, use explicit grid placement plus physical coordinate assertions.
6. Rerun snapshots at 320, 360, 390, 391×695, 430 and 768; verify no hiding, truncation, overlap, unintended scroll, or disabled actions.
7. Inspect the **new actual screenshots**, fix each identified discrepancy and rerun. Do not silently equate functional QA with visual fidelity.
8. Capture the final screenshot side-by-side, show result and direct link to the current design (`?homeLayout=reference-N`), and **wait for user approval** before the next image. Track changes and update this file.

## General QA principles
- Screenshot comparisons are photo-specific, and CSS cascade order matters: the last matching `!important` rule and inline important are frequent sources of false confidence.
- For `flex`/grid-based header capsule layout inspect computed `getBoundingClientRect()` of every button, not only stylesheet declarations.
- Test visually at the reference's aspect ratio; test interactivity independently at common mobile sizes.
- Clearly distinguish completed tests, new pending tests, and unverified visual 100% claims.
