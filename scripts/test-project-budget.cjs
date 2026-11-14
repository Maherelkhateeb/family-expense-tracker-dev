'use strict';

const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const url = process.env.APP_URL || 'http://127.0.0.1:8765/';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    for (const width of [320, 430]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, serviceWorkers: 'block' });
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.locator('#navTabExpected').click();
      await page.locator('#tabExpectedBudgets').click();
      await page.getByRole('button', { name: /موازنة تقديرية للمشروع/ }).click();
      await page.locator('#newPlanProjectInput').fill('مشروع الاختبار');
      await page.locator('#newPlanMonthInput').fill('2026-11');
      await page.getByRole('button', { name: /إنشاء وتفعيل الميزانية/ }).click();
      assert.match(await page.locator('#activeBudgetProjectInfo').innerText(), /مشروع الاختبار/);

      await page.locator('#inpBudgetItemAmount').fill('1000');
      await page.locator('button[onclick="addBudgetItemToCurrentPlan()"]').click();
      await page.locator('button[onclick="saveMonthlyBudget()"]').click();
      assert(await page.evaluate(() => JSON.parse(localStorage.getItem('family_monefy_monthly_budgets'))
        .some(plan => plan.project === 'مشروع الاختبار' && plan.month === '2026-11' && plan.items[0].amount === 1000)));

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('#navTabAnalytics').click();
      await page.locator('#btnTabComparisons').click();
      const card = page.locator('#projectBudgetAnalysis .project-budget-result');
      assert.equal(await card.locator('progress').getAttribute('value'), '0');

      const metrics = await page.evaluate(() => {
        const plan = { project: 'مشروع الاختبار', month: '2026-11', items: [{ amount: 1000 }] };
        const expense = { type: 'expense', date: '2026-11-01', project: plan.project, amount: 400 };
        return projectBudgetMetrics(plan, [
          expense,
          { ...expense, project: '', projectName: ' مشروع الاختبار ', date: '2026-11-30', amount: 850 },
          { ...expense, type: 'income' },
          { ...expense, type: 'transfer' },
          { ...expense, category: 'transfer' },
          { ...expense, date: '2026-12-01' },
          { ...expense, project: 'مشروع آخر' }
        ]);
      });
      assert.deepEqual(metrics, { expected: 1000, actual: 1250, remaining: -250, percent: 125 });
      await page.locator('#analyticsProjectFilter').selectOption('__no_project__');
      assert.equal(await card.count(), 0);
      await page.locator('#analyticsProjectFilter').selectOption('مشروع الاختبار');
      assert(await card.isVisible());
      assert(await card.evaluate(el => el.scrollWidth <= el.clientWidth + 2));
      console.log('PASS project budget creation, persistence, scope, analysis and layout', width);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
