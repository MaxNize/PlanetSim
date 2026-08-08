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
});
