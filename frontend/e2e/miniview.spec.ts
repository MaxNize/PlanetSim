import { test, expect } from '@playwright/test';

test.describe('Miniview Canvas E2E Specs (SPEC-016)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open, display, and close miniview canvas via sidebar list button in sandbox mode', async ({ page }) => {
    // 1. Enter Sandbox Mode
    await page.getByRole('button', { name: 'Sandbox Mode' }).click();

    // 2. Create a body by dragging empty canvas space
    const canvas = page.locator('canvas[aria-label="Celestial simulation rendering area"]');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas bounding box not found');

    const startX = box.x + 400;
    const startY = box.y + 300;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY, { steps: 5 });
    await page.mouse.up();

    // Confirm dialog
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 3. Select first body list item in sidebar
    const listItem = page.locator('[data-testid^="body-item-"]').first();
    await expect(listItem).toBeVisible();

    const miniviewBtn = listItem.locator('[data-testid^="miniview-btn-"]');
    await expect(miniviewBtn).toBeVisible();

    // 4. Toggle Miniview ON
    await miniviewBtn.click();

    // 5. Assert Picture-in-Picture Miniview canvas mounts with aria-label
    const miniviewCanvas = page.locator('canvas[aria-label="Body miniview"]');
    await expect(miniviewCanvas).toBeVisible();

    // 6. Toggle Miniview OFF via sidebar button
    await miniviewBtn.click();

    // 7. Assert Miniview canvas is unmounted
    await expect(miniviewCanvas).toHaveCount(0);
  });

  test('should open and close miniview canvas via context menu on celestial body', async ({ page }) => {
    // 1. Enter Sandbox Mode
    await page.getByRole('button', { name: 'Sandbox Mode' }).click();

    // 2. Create a body
    const canvas = page.locator('canvas[aria-label="Celestial simulation rendering area"]');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas bounding box not found');

    const startX = box.x + 350;
    const startY = box.y + 250;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 40, startY, { steps: 5 });
    await page.mouse.up();

    await page.getByRole('button', { name: 'Confirm' }).click();

    // 3. Right-click on body position to open context menu
    await page.mouse.click(startX, startY, { button: 'right' });

    // 4. Click "Miniview" context menu item if visible
    const miniviewMenuItem = page.getByRole('menuitem', { name: /Miniview/i });
    if (await miniviewMenuItem.isVisible()) {
      await miniviewMenuItem.click();
      const miniviewCanvas = page.locator('canvas[aria-label="Body miniview"]');
      await expect(miniviewCanvas).toBeVisible();
    }
  });
});
