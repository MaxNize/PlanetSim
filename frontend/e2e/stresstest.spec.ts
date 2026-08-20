import { test, expect } from '@playwright/test';

test.describe('FPS Display & Performance Stress Test E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display live FPS counter in telemetry panel and canvas HUD overlay', async ({ page }) => {
    // 1. Assert telemetry panel displays FPS section
    await expect(page.getByText('Performance:').first()).toBeVisible();
    await expect(page.getByText(/FPS/).first()).toBeVisible();

    // 2. Assert canvas HUD overlay badge displays live FPS and body count
    await expect(page.getByText(/\d+ FPS/).first()).toBeVisible();
    await expect(page.getByText(/\d+ Bodies/).first()).toBeVisible();
  });

  test('should launch Stress Test modal and execute automated 60 FPS benchmark', async ({ page }) => {
    // 1. Switch to Sandbox Mode
    await page.getByRole('button', { name: 'Sandbox Mode' }).click();

    // 2. Open Stress Test modal via telemetry button
    const stressTestBtn = page.getByRole('button', { name: '⚡ Stress Test' }).first();
    await expect(stressTestBtn).toBeVisible();
    await stressTestBtn.click();

    // 3. Assert modal opens with workload indicator
    const modalHeader = page.getByRole('heading', { name: 'Performance Stress Test' });
    await expect(modalHeader).toBeVisible();

    // 4. Test quick spawn button (+50 bodies)
    const spawn50Btn = page.getByRole('button', { name: '+50', exact: true });
    await spawn50Btn.click();

    // 5. Verify workload counter updates
    await expect(page.getByText(/\d+ Bodies/).first()).toBeVisible();

    // 6. Trigger automated benchmark
    const startBenchmarkBtn = page.getByRole('button', { name: '▶ Run Auto Benchmark' });
    await expect(startBenchmarkBtn).toBeVisible();
    await startBenchmarkBtn.click();

    // 7. Wait for benchmark stage log history element via testid
    const logSection = page.getByTestId('benchmark-log-history');
    await logSection.waitFor({ state: 'attached', timeout: 15000 });
    await logSection.scrollIntoViewIfNeeded();
    await expect(logSection).toBeVisible();
  });
});
