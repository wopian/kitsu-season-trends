import { test, expect, type Page, type Route } from '@playwright/test'
import { metrics } from '../../shared/trends'
import { encode } from 'msgpack-lite'

type Reveal = { duration: string; property: string; easing: string }
type HandoffWindow = Window & { historyReveals: Reveal[] }

async function observeHistoryReveals(page: Page) {
  await page.evaluate(() => {
    const state = window as HandoffWindow
    state.historyReveals = []
    const seen = new WeakSet<Element>()
    // Sample active styles even when browser coalesces a short transition's frames.
    new MutationObserver(() => {
      for (const target of document.querySelectorAll('.history-chart-ready.history-ready-enter-active')) {
        if (seen.has(target)) continue
        seen.add(target)
        const style = getComputedStyle(target)
        state.historyReveals.push({
          duration: style.transitionDuration,
          property: style.transitionProperty,
          easing: style.transitionTimingFunction,
        })
      }
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
  })
}

const historyFixture = (id: number) => encode({
  meta: { i: id, t: 'History handoff fixture' },
  data: Array.from({ length: 6 }, (_, index) => ({
    d: Date.UTC(2026, 9, index + 1) / 36e5,
    l: 50 + index, r: 20 + index, p: 15 + index, o: 5, f: index,
  })),
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`history handoff reserves space and reveals only fresh loads (${reducedMotion})`, async ({ page }) => {
    test.setTimeout(60000)
    await page.emulateMedia({ reducedMotion })
    let release!: () => void
    const responseReady = new Promise<void>((resolve) => { release = resolve })
    let requests = 0
    let fail = true
    await page.route('**/msgpack/id/*.msgpack', async (route) => {
      requests++
      if (fail) return route.fulfill({ status: 503, body: 'unavailable' })
      await responseReady
      const id = Number(/\/(\d+)\.msgpack$/.exec(route.request().url())![1])
      await route.fulfill({ body: historyFixture(id) })
    })
    try {
      await page.goto('/2026/autumn/')
      await expect(page.getByText('Loading season history…')).toHaveCount(0, { timeout: 30000 })
      await observeHistoryReveals(page)
      const trigger = page.locator('.anime-card').first().getByRole('button', { name: 'Explore history', exact: true })
      await trigger.click()
      const dialog = page.getByRole('dialog')
      const slot = dialog.locator('.history-chart-slot')
      await expect(dialog.getByRole('alert')).toContainText('HTTP 503')
      await expect(dialog.locator('.chart-frame')).toHaveCount(0)
      expect((await slot.boundingBox())!.height).toBeGreaterThanOrEqual(360)

      fail = false
      await dialog.getByRole('button', { name: 'Retry anime history' }).click()
      await expect(slot).toHaveAttribute('aria-busy', 'true')
      await expect(dialog.getByRole('status')).toHaveText('Loading anime history…')
      const pendingSlot = (await slot.boundingBox())!
      const pendingDialog = (await dialog.boundingBox())!
      expect(pendingSlot.height).toBeGreaterThanOrEqual(360)
      release()
      await expect(slot).toHaveAttribute('aria-busy', 'false')
      await expect(dialog.locator('.history-chart-ready svg')).toBeVisible()
      await expect.poll(() => page.evaluate(() => (window as HandoffWindow).historyReveals)).toEqual([{
        duration: reducedMotion === 'reduce' ? '0.08s' : '0.15s',
        property: 'opacity',
        easing: 'cubic-bezier(0, 0, 0.2, 1)',
      }])
      await expect(dialog.locator('.history-ready-enter-active')).toHaveCount(0)
      expect(Math.abs((await slot.boundingBox())!.height - pendingSlot.height)).toBeLessThanOrEqual(1)
      expect(Math.abs((await dialog.boundingBox())!.height - pendingDialog.height)).toBeLessThanOrEqual(1)
      const downloads = dialog.getByRole('group', { name: 'Download full history' })
      await expect(downloads).toBeVisible()
      const bounds = (await downloads.boundingBox())!
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize()!.height)

      await dialog.getByRole('combobox', { name: 'History range', exact: true }).selectOption('30')
      const rating = dialog.getByRole('group', { name: 'Expanded graph metrics' }).getByRole('button', { name: 'Rating', exact: true })
      await rating.click()
      await rating.click()
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await trigger.click()
      await expect(dialog.locator('.history-chart-ready svg')).toBeVisible()
      await expect(dialog.locator('.history-ready-enter-active')).toHaveCount(0)
      expect(requests).toBe(2)
      expect(await page.evaluate(() => (window as HandoffWindow).historyReveals)).toHaveLength(1)
    } finally {
      release()
      await page.unroute('**/msgpack/id/*.msgpack')
    }
  })
}

test('history handoff consumes hidden reveal and ignores cancelled requests', async ({ page }) => {
  test.setTimeout(60000)
  const pending: { route: Route; release: () => void }[] = []
  await page.route('**/msgpack/id/*.msgpack', async (route) => {
    await new Promise<void>((release) => { pending.push({ route, release }) })
    const id = Number(/\/(\d+)\.msgpack$/.exec(route.request().url())![1])
    await route.fulfill({ body: historyFixture(id) }).catch(() => {})
  })
  try {
    await page.goto('/2026/autumn/')
    await expect(page.getByText('Loading season history…')).toHaveCount(0, { timeout: 30000 })
    await observeHistoryReveals(page)
    const cards = page.locator('.anime-card')
    const open = (index: number) => cards.nth(index).getByRole('button', { name: 'Explore history', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await open(0)
    await expect(dialog.locator('.history-chart-slot')).toHaveAttribute('aria-busy', 'true')
    await expect.poll(() => pending.length).toBe(1)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await open(1)
    await expect.poll(() => pending.length).toBe(2)
    const toggles = dialog.getByRole('group', { name: 'Expanded graph metrics' })
    for (const metric of metrics) await toggles.getByRole('button', { name: metric.label, exact: true }).click()
    pending[0]!.release()
    pending[1]!.release()
    await expect(dialog.locator('.history-chart-slot')).toHaveAttribute('aria-busy', 'false')
    await expect(dialog.getByText('Select graph metrics above.', { exact: true })).toBeVisible()
    await toggles.getByRole('button', { name: 'Rating', exact: true }).click()
    await expect(dialog.locator('.history-chart-ready svg')).toBeVisible()
    await expect(dialog.locator('.history-ready-enter-active')).toHaveCount(0)
    expect(await page.evaluate(() => (window as HandoffWindow).historyReveals)).toHaveLength(0)
    const id = Number(/\/(\d+)\.msgpack$/.exec(pending[1]!.route.request().url())![1])
    await expect(dialog.getByRole('link', { name: 'Download anime JSON' })).toHaveAttribute('href', `/data/id/${id}.json`)
  } finally {
    for (const request of pending) request.release()
    await page.unroute('**/msgpack/id/*.msgpack')
  }
})

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
    await expect(page.getByText('Loading season history…')).toHaveCount(0, { timeout: 30000 })
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
