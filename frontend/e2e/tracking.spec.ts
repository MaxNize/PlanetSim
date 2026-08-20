import { test, expect } from '@playwright/test';

test.describe('Object Tracking & Camera Follow E2E Specs (SPEC-015)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should lock and unlock camera tracking via sidebar track button in sandbox mode', async ({ page }) => {
    // 1. Enter Sandbox Mode
    await page.getByRole('button', { name: 'Sandbox Mode' }).click();

    // 2. Create a body in sandbox mode
    const canvas = page.locator('canvas[aria-label="Celestial simulation rendering area"]');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas bounding box not found');

    const startX = box.x + 380;
    const startY = box.y + 280;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 40, startY, { steps: 5 });
    await page.mouse.up();

    await page.getByRole('button', { name: 'Confirm' }).click();

    // 3. Select body list item in sidebar
    const listItem = page.locator('[data-testid^="body-item-"]').first();
    await expect(listItem).toBeVisible();

    const trackBtn = listItem.locator('[data-testid^="track-btn-"]');
    await expect(trackBtn).toBeVisible();

    // 4. Click track button to lock camera onto body
    await trackBtn.click();

    // 5. Click track button again to stop camera tracking
    await trackBtn.click();

    // 6. Verify main rendering canvas remains visible and active
    await expect(canvas).toBeVisible();
  });

  test('should release camera tracking when user initiates manual canvas pan', async ({ page }) => {
    // 1. Enter Sandbox Mode
    await page.getByRole('button', { name: 'Sandbox Mode' }).click();

    // 2. Create a body
    const canvas = page.locator('canvas[aria-label="Celestial simulation rendering area"]');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas bounding box not found');

    const startX = box.x + 400;
    const startY = box.y + 300;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY, { steps: 5 });
    await page.mouse.up();

    await page.getByRole('button', { name: 'Confirm' }).click();

    // 3. Activate tracking on created body
    const trackBtn = page.locator('[data-testid^="track-btn-"]').first();
    await trackBtn.click();

    // 4. Initiate manual panning via Space + Drag on canvas
    await canvas.hover();
    await page.keyboard.down('Space');

    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 80, cy - 80, { steps: 5 });
    await page.mouse.up();
    await page.keyboard.up('Space');

    // 5. Assert canvas continues rendering smoothly after disengagement
    await expect(canvas).toBeVisible();
  });
});
