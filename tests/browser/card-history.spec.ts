import { test, expect } from '@playwright/test'

test('card background, poster, statistics and chart open history', async ({ page }) => {
  await page.goto('/2026/autumn/')
  await expect(page.getByText('Loading season history…')).toHaveCount(0, { timeout: 30000 })
  const card = page.locator('.anime-card').first()
  const dialog = page.getByRole('dialog')
  const title = await card.locator('.title-button').innerText()
  for (const selector of ['.poster', '.card-statistic strong', '.chart-frame']) {
    await card.locator(selector).first().click()
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(title)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  }
  await card.click({ position: { x: 8, y: 8 } })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  for (const [selector, key] of [
    ['.title-button', 'Enter'],
    ['.expand-button', 'Space'],
  ] as const) {
    await card.locator(selector).focus()
    await page.keyboard.press(key)
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  }
  // Avoid external requests while checking that Kitsu links keep native behavior.
  await page.context().route('https://kitsu.app/**', (route) => route.fulfill({
    status: 200, contentType: 'text/html', body: '<title>Kitsu</title>',
  }))
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    card.getByRole('link', { name: 'Kitsu.app' }).click(),
  ])
  await expect(dialog).toHaveCount(0)
  await popup.close()
})
