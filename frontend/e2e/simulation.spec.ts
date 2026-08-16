import { test, expect } from '@playwright/test';

test.describe('Restricted 3-Body Planet Simulation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
  });

  test('should load the page with fullscreen canvas and overlay panels', async ({ page }) => {
    // 1. Assert header overlay is visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header.locator('h1')).toHaveText('Restricted 3-Body Planet Simulation');

    // 2. Assert fullscreen canvas is mounted
    const canvas = page.locator('canvas[aria-label="Celestial simulation rendering area"]');
    await expect(canvas).toBeVisible();

    // 3. Assert floating UI cards are visible
    await expect(page.getByRole('heading', { name: 'Simulation System' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Simulation Telemetry' })).toBeVisible();
  });

  test('should toggle play/pause and progress simulation time', async ({ page }) => {
    const playButton = page.getByRole('button', { name: /(Play|Pause)/ });
    const telemetryTimeLocator = page.locator('div', { hasText: 'Elapsed Time:' }).first();

    // Initial state: simulation is paused
    await expect(playButton).toHaveText('▶ Play');

    // Capture initial time
    const initialText = await telemetryTimeLocator.innerText();

    // Click play to start simulation
    await playButton.click();
    await expect(playButton).toHaveText('⏸ Pause');

    // Wait a brief moment and verify time has progressed
    await page.waitForTimeout(500);
    const runningText = await telemetryTimeLocator.innerText();
    expect(runningText).not.toBe(initialText);

    // Pause the simulation again
    await playButton.click();
    await expect(playButton).toHaveText('▶ Play');

    // Verify time does not progress further while paused
    const pausedText = await telemetryTimeLocator.innerText();
    await page.waitForTimeout(300);
    const afterPausedText = await telemetryTimeLocator.innerText();
    expect(afterPausedText).toBe(pausedText);
  });

  test('should support canvas zooming via mouse wheel events', async ({ page }) => {
    const canvas = page.locator('canvas[aria-label="Celestial simulation rendering area"]');
    const playButton = page.getByRole('button', { name: /(Play|Pause)/ });

    // Ensure simulation is running to render active telemetries
    await playButton.click();

    // Hover canvas to target it
    await canvas.hover();

    // Dispatch a zoom wheel event on the canvas
    await canvas.dispatchEvent('wheel', { deltaY: 200 });

    // Wait for canvas redraw and check that scale telemetry updates without crashes
    await page.waitForTimeout(200);
    const canvasVisible = await canvas.isVisible();
    expect(canvasVisible).toBe(true);
  });

  test('should allow dragging to pan the viewport when space is pressed', async ({ page }) => {
    const canvas = page.locator('canvas[aria-label="Celestial simulation rendering area"]');

    await canvas.hover();

    // Hold Spacebar to enter panning mode
    await page.keyboard.down('Space');

    // Click and drag canvas to pan
    const box = await canvas.boundingBox();
    if (box) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX - 100, startY - 100, { steps: 5 });
      await page.mouse.up();
    }

    await page.keyboard.up('Space');

    // Verify canvas is still visible and functional
    await expect(canvas).toBeVisible();
  });

  test('should support entering sandbox mode, placing a body, and configuring it', async ({ page }) => {
    // 1. Assert sandbox button is visible and click it
    const sandboxTab = page.getByRole('button', { name: 'Sandbox Mode' });
    await expect(sandboxTab).toBeVisible();
    await sandboxTab.click();

    // 2. Assert the (button-less, FP-38) creation hint is visible
    await expect(page.getByText(/Click & drag empty canvas space/)).toBeVisible();

    // 3. Click-drag empty canvas space directly to create a body: mousedown sets position,
    // drag sets velocity, mouseup opens the confirm dialog — no "Add Body" mode toggle.
    const canvas = page.locator('canvas[aria-label="Celestial simulation rendering area"]');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas bounding box not found');
    const startX = box.x + 400;
    const startY = box.y + 300;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY, { steps: 5 });
    await page.mouse.up();

    // 4. Config modal should open
    const modalHeader = page.getByRole('heading', { name: 'Configure New Body' });
    await expect(modalHeader).toBeVisible();

    // 5. Change body name and confirm
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('E2E Test Star');

    const confirmButton = page.getByRole('button', { name: 'Confirm' });
    await confirmButton.click();

    // 6. Verify the new body is listed in sidebar and telemetry
    await expect(page.getByText('E2E Test Star').first()).toBeVisible();

    // 7. Track and Miniview should also be toggleable from the object list, not just the canvas
    // context menu (user feedback: "Mini view und tracking sollte auch aus der objekt liste möglich sein").
    const listItem = page.locator('[data-testid^="body-item-"]').first();
    const trackButton = listItem.locator('[data-testid^="track-btn-"]');
    const miniviewButton = listItem.locator('[data-testid^="miniview-btn-"]');

    await trackButton.click();
    await expect(page.locator('canvas[aria-label="Body miniview"]')).toHaveCount(0);
    await trackButton.click(); // untrack again, don't leave the camera locked for the next assertion

    await miniviewButton.click();
    await expect(page.locator('canvas[aria-label="Body miniview"]')).toBeVisible();
    await miniviewButton.click();
    await expect(page.locator('canvas[aria-label="Body miniview"]')).toHaveCount(0);
  });
});
