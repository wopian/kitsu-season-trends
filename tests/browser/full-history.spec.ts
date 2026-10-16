import { test, expect } from '@playwright/test'
import { metrics } from '../../shared/trends'
import { encode } from 'msgpack-lite'

test('Full history switches to weekly only above 90 observations', async ({ page }) => {
  for (const count of [90, 91]) {
    await page.route('**/msgpack/id/*.msgpack', (route) => {
      const id = Number(/\/(\d+)\.msgpack$/.exec(route.request().url())![1])
      return route.fulfill({ body: encode({
        meta: { i: id, t: 'Sampling threshold' },
        data: Array.from({ length: count }, (_, index) => ({
          d: Date.UTC(2026, 0, index + 1) / 36e5,
          l: 50 + index / 10, r: index + 1, p: index + 0.25, o: index / 2, f: index,
        })),
      }) })
    })
    await page.goto('/2026/autumn/')
    await page.locator('.anime-card').first().getByRole('button', { name: 'Explore history', exact: true }).click()
    const dialog = page.getByRole('dialog')
    const sampling = dialog.locator('.history-sampling strong')
    const path = dialog.locator(`.chart-frame path[stroke="${metrics[0]!.color}"]`)
    await expect(sampling).toHaveText(count > 90 ? 'Weekly maxima' : 'Daily samples')
    const points = async () => ((await path.getAttribute('d'))?.match(/[ML]/g) ?? []).length
    if (count === 90) await expect.poll(points).toBe(90)
    else {
      await expect.poll(points).toBeGreaterThan(0)
      await expect.poll(points).toBeLessThan(20)
    }
    for (const days of ['30', '90']) {
      await dialog.getByRole('combobox', { name: 'History range', exact: true }).selectOption(days)
      await expect(sampling).toHaveText('Daily samples')
      await expect.poll(points).toBe(Number(days))
    }
    await dialog.getByRole('combobox', { name: 'History range', exact: true }).selectOption('0')
    await expect(sampling).toHaveText(count > 90 ? 'Weekly maxima' : 'Daily samples')
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await page.unroute('**/msgpack/id/*.msgpack')
  }
})

test('Full history loads ID archive across seasons, retries failures and caches success', async ({
  page,
}) => {
  test.setTimeout(60000)
  const requests: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('/msgpack/id/12.msgpack'))
      requests.push(request.url())
  })
  await page.route('**/msgpack/id/12.msgpack', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' }),
  )
  await page.goto('/2026/autumn/')
  await expect(page.getByText('Loading season history…')).toHaveCount(0, {
    timeout: 30000,
  })
  await page
    .getByRole('group', { name: 'Season status' })
    .getByRole('button', { name: 'Leftovers', exact: true })
    .click()
  await page.getByLabel('Find an anime').fill('One Piece')
  await page
    .getByRole('button', { name: 'Expand chart for One Piece', exact: true })
    .click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('alert')).toContainText('HTTP 503')
  await expect(dialog.locator('.chart-frame')).toHaveCount(0)
  await page.unroute('**/msgpack/id/12.msgpack')
  await dialog.getByRole('button', { name: 'Retry anime history' }).click()
  await expect(dialog.getByLabel('Recorded history range')).toContainText(
    '2017',
    { timeout: 30000 },
  )
  await expect(dialog.getByLabel('Recorded history range')).toContainText(
    '2026',
  )
  await expect(dialog.locator('.chart-frame')).toContainText('2017')
  await expect(dialog.locator('.chart-frame')).toContainText('2026')
  await expect(dialog.locator('.chart-frame svg')).toContainText('Oct 2026')
  await expect(dialog.getByText(/Weekly maxima/)).toBeVisible()
  const footer = dialog.locator('[data-slot="footer"]')
  const downloads = footer.getByRole('group', { name: 'Download full history' })
  const jsonLink = downloads.getByRole('link', { name: 'Download anime JSON' })
  const messagePackLink = downloads.getByRole('link', { name: 'Download anime MessagePack' })
  await expect(jsonLink).toBeVisible()
  await expect(messagePackLink).toBeVisible()
  await expect(jsonLink).toHaveAttribute('href', '/data/id/12.json')
  const footerBounds = await footer.boundingBox()
  expect(footerBounds!.y + footerBounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height)
  const jsonBounds = await jsonLink.boundingBox()
  const messagePackBounds = await messagePackLink.boundingBox()
  expect(jsonBounds!.x + jsonBounds!.width).toBeLessThan(messagePackBounds!.x)
  const ratingPath = await dialog
    .locator(`.chart-frame path[stroke="${metrics[0]!.color}"]`)
    .getAttribute('d')
  expect((ratingPath?.match(/[ML]/g) ?? []).length).toBeLessThan(500)
  expect((ratingPath?.match(/[ML]/g) ?? []).length).toBeGreaterThan(30)
  expect((ratingPath?.match(/M/g) ?? []).length).toBeGreaterThan(1)
  await page
    .getByRole('combobox', { name: 'History range', exact: true })
    .selectOption('30')
  await expect(dialog.locator('.chart-frame svg')).not.toContainText('2017')
  await expect(dialog.getByText(/Weekly maxima/)).toHaveCount(0)
  await expect(footer.getByText('Daily samples', { exact: true })).toBeVisible()
  await expect(footer.getByText('Dates use UTC', { exact: true })).toBeVisible()
  await page
    .getByRole('combobox', { name: 'History range', exact: true })
    .selectOption('0')
  await expect(dialog.locator('.chart-frame')).toContainText('2017')
  await expect(
    dialog.getByRole('link', { name: 'Download anime MessagePack' }),
  ).toHaveAttribute('href', '/msgpack/id/12.msgpack')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  const requested = requests.length
  await page
    .getByRole('button', { name: 'Expand chart for One Piece', exact: true })
    .click()
  await expect(
    page.getByRole('dialog').getByLabel('Recorded history range'),
  ).toContainText('2017')
  expect(requests).toHaveLength(requested)
})
