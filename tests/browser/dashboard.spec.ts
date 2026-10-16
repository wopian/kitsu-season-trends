import { test, expect } from '@playwright/test'
import { metrics } from '../../shared/trends'

test('season overview keeps its height while history loads', async ({ page }) => {
  let releaseHistory!: () => void
  const historyGate = new Promise<void>((resolve) => {
    releaseHistory = resolve
  })
  await page.route('**/msgpack/*.msgpack', async (route) => {
    await historyGate
    await route.continue()
  })
  await page.goto('/2026/summer/')
  const overview = page.getByRole('region', { name: 'Season overview' })
  await expect(page.getByLabel('Season history loading')).toBeVisible()
  const before = await overview.boundingBox()
  const controls = page.getByRole('region', { name: 'Chart and ranking controls' })
  const controlsBefore = await controls.boundingBox()
  releaseHistory()
  await expect(overview.locator('svg').first()).toBeVisible()
  await expect(page.getByLabel('Season history loading')).toHaveCount(0)
  const after = await overview.boundingBox()
  const controlsAfter = await controls.boundingBox()
  expect(after!.height).toBe(before!.height)
  expect(controlsAfter!.y).toBe(controlsBefore!.y)
  const chart = await overview.locator('.overview-chart').boundingBox()
  expect(chart!.y + chart!.height).toBeLessThanOrEqual(after!.y + after!.height)
})

test('season navigation, metrics, filters and expanded history', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/2026/autumn/')
  await expect(
    page.getByRole('link', { name: 'Kitsu Season Trends', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('DAILY SIGNAL. SEASONAL STORIES.')).toHaveCount(0)
  await expect(page.getByText('Follow the shows.')).toHaveCount(0)
  const overview = page.getByRole('region', { name: 'Season overview' })
  await expect(overview).toBeVisible()
  await expect(overview.locator('details, summary')).toHaveCount(0)
  await expect(page.locator('h1')).toHaveText('Autumn 2026')
  await expect(page.getByText('Loading season history…')).toHaveCount(0, {
    timeout: 30000,
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  const firstCard = page.locator('.anime-card').first()
  const overviewBounds = await overview.boundingBox()
  const controlsBounds = await page
    .getByRole('region', { name: 'Chart and ranking controls' })
    .boundingBox()
  const firstCardBounds = await firstCard.boundingBox()
  expect(overviewBounds!.y + overviewBounds!.height).toBeLessThan(
    controlsBounds!.y,
  )
  expect(overviewBounds!.y + overviewBounds!.height).toBeLessThan(
    firstCardBounds!.y,
  )
  await firstCard.scrollIntoViewIfNeeded()
  await expect(firstCard.locator('svg').first()).toBeVisible({
    timeout: 30000,
  })
  const graph = page.getByRole('group', { name: 'Graph metrics', exact: true })
  const sort = page.getByRole('group', { name: 'Sort metric', exact: true })
  for (const metric of metrics) {
    const button = graph.getByRole('button', {
      name: metric.label,
      exact: true,
    })
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect(
      firstCard.locator(`.chart-frame path[stroke="${metric.color}"]`),
    ).toHaveCount(1)
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await expect(
      firstCard.locator(`[data-metric="${metric.key}"]`),
    ).toHaveCount(0)
    await expect(
      firstCard.locator(`.chart-frame path[stroke="${metric.color}"]`),
    ).toHaveCount(0)
    await button.click()
    await expect(
      firstCard.locator(`.chart-frame path[stroke="${metric.color}"]`),
    ).toHaveCount(1)
  }
  await expect(firstCard.locator('.chart-frame')).toContainText('100%')
  for (const metric of metrics)
    await graph.getByRole('button', { name: metric.label, exact: true }).click()
  await expect(firstCard.getByText('Select graph metrics above.')).toBeVisible()
  await expect(firstCard.locator('.chart-frame')).toHaveCount(0)
  await graph.getByRole('button', { name: 'Favourites', exact: true }).click()
  await expect(
    sort.getByRole('button', { name: 'Rating', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await sort.getByRole('button', { name: 'Users Rated', exact: true }).click()
  await expect(
    graph.getByRole('button', { name: 'Favourites', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Explore history' }).first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('combobox', { name: 'History range', exact: true }).selectOption('30')
  const expandedGraphs = page.getByRole('group', {
    name: 'Expanded graph metrics',
    exact: true,
  })
  for (const metric of metrics.filter((metric) => metric.key !== 'f'))
    await expandedGraphs
      .getByRole('button', { name: metric.label, exact: true })
      .click()
  for (const metric of metrics)
    await expect(
      page
        .getByRole('dialog')
        .locator(`.chart-frame path[stroke="${metric.color}"]`),
    ).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  for (const metric of metrics)
    await expect(
      graph.getByRole('button', { name: metric.label, exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
  await page.getByLabel('Find an anime').fill('no-such-anime-zzzz')
  await expect(page.getByText('No anime match these filters.')).toBeVisible()
  await page.getByLabel('Find an anime').fill('')
  await page.getByRole('button', { name: 'Previous available season' }).click()
  await expect(page).toHaveURL(/2026\/summer/)
  expect(errors).toEqual([])
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  const consoleBounds = await page.locator('.season-console').boundingBox()
  expect(consoleBounds!.x + consoleBounds!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
})
test('system theme and manual preference persist', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByRole('button', { name: 'light theme', exact: true }).click()
  await expect(page.locator('html')).toHaveClass(/light/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/light/)
})
test('data failure exposes retry and missing routes return real 404', async ({
  page,
}) => {
  await page.route('**/msgpack/*.msgpack', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' }),
  )
  await page.goto('/2017/spring/')
  await expect(
    page.getByRole('region', { name: 'Season overview' }),
  ).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('HTTP 503')
  await page.unroute('**/msgpack/*.msgpack')
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  const response = await page.goto('/2099/winter/')
  expect(response?.status()).toBe(404)
})
