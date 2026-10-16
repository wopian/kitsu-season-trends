import { test, expect } from '@playwright/test'

test('ratings guide opens locally and survives direct reload', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/2026/autumn/')
  await expect(page.locator('footer').getByRole('link', {
    name: 'How ratings work', exact: true,
  })).toHaveAttribute('href', '/ratings/')
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  const link = navigation.getByRole('link', { name: 'How ratings work', exact: true })
  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute('href', '/ratings/')
  await link.click()
  await expect(page).toHaveURL(/\/ratings\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('How ratings work')
  await expect(navigation.getByRole('link', { name: 'How ratings work', exact: true }))
    .toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('table', { name: 'Vote weights per Kitsu rating' })
    .getByRole('row')).toHaveCount(6)
  await expect(page.locator('.rating-formula')).toHaveText(
    '100 × upvotes / (upvotes + downvotes + 5)',
  )
  await expect(page.getByText(/Monday–Sunday UTC/)).toBeVisible()
  await page.getByRole('button', { name: 'dark theme', exact: true }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  const response = await page.reload()
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href', 'https://kitsu.wopian.me/ratings/',
  )
  expect(await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  )).toBe(true)
  await page.getByRole('link', { name: 'Back to seasons', exact: true }).click()
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/)
  await expect(page.locator('html')).toHaveClass(/dark/)
  expect(errors).toEqual([])
})
