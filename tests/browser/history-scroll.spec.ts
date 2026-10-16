import { test, expect } from '@playwright/test'

test('closing history preserves window scroll and restores card focus', async ({ page }) => {
  await page.goto('/2026/autumn/')
  await expect(page.getByText('Loading season history…')).toHaveCount(0, { timeout: 30000 })
  const card = page.locator('.anime-card').nth(15)
  const dialog = page.getByRole('dialog')
  for (const close of ['button', 'escape', 'outside'] as const) {
    // Leave keyboard focus above the grid, then open a non-focusable card area.
    await page.getByLabel('Find an anime').focus()
    await card.scrollIntoViewIfNeeded()
    await card.click({ position: { x: 8, y: 8 } })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByLabel('Recorded history range')).toBeVisible()
    const before = await page.evaluate(() => window.scrollY)
    expect(before).toBeGreaterThan(1000)
    if (close === 'button')
      await dialog.getByRole('button', { name: 'Close', exact: true }).click()
    else if (close === 'escape')
      await page.keyboard.press('Escape')
    else
      await page.mouse.click(2, 2)
    await expect(dialog).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before)
    await expect(card.locator('.title-button')).toBeFocused()
    // Wait for focus restoration and scroll unlock to settle over successive frames.
    const positions = await page.evaluate(async () => {
      const positions: number[] = []
      for (let frame = 0; frame < 5; frame++) {
        await new Promise(requestAnimationFrame)
        positions.push(window.scrollY)
      }
      return positions
    })
    expect(positions).toEqual(Array(5).fill(before))
  }
  const trigger = card.locator('.expand-button')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(dialog).toBeVisible()
  const before = await page.evaluate(() => window.scrollY)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(before)
})
