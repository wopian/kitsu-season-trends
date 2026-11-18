import { test, expect } from '@playwright/test'
import { encode } from 'msgpack-lite'
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
  const spotlight = page.getByRole('list', { name: 'Top anime' })
  await expect(spotlight.getByRole('listitem')).toHaveCount(3)
  const spotlightBefore = await spotlight.boundingBox()
  releaseHistory()
  await expect(overview.locator('svg').first()).toBeVisible()
  await expect(page.getByLabel('Season history loading')).toHaveCount(0)
  const after = await overview.boundingBox()
  const controlsAfter = await controls.boundingBox()
  expect(after!.height).toBe(before!.height)
  expect(controlsAfter!.y).toBe(controlsBefore!.y)
  expect((await spotlight.boundingBox())!.y).toBe(spotlightBefore!.y)
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
  await page.getByRole('button', { name: 'Trends', exact: true }).click()
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
  expect(controlsBounds!.y + controlsBounds!.height).toBeLessThan(overviewBounds!.y)
  expect(overviewBounds!.y + overviewBounds!.height).toBeLessThan(
    firstCardBounds!.y,
  )
  await firstCard.scrollIntoViewIfNeeded()
  await expect(firstCard.locator('svg').first()).toBeVisible({
    timeout: 30000,
  })
  const graph = page.getByRole('group', { name: 'Graph metrics', exact: true })
  const sort = page.getByRole('combobox', { name: 'Sort by' })
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
  await expect(sort).toHaveValue('rating')
  await sort.selectOption('r')
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

test('rankings use shared controls and preserve history focus', async ({ page }) => {
  const entries = [
    { i: 1, t: 'Shared Alpha', u: 0, n: 1, r: 10, l: 90 },
    { i: 2, t: 'Shared Beta', u: 0, n: 1, r: 30, l: 80 },
    { i: 3, t: 'Shared Gamma', u: 1, n: 1, r: 20, l: 85 },
    { i: 4, t: 'Solo Delta', u: 0, n: 1, r: 40, l: 75 },
    { i: 5, t: 'Shared Encore', u: 0, n: 0, r: 50, l: 95 },
  ]
  await page.route('**/msgpack/2026-autumn.msgpack', (route) =>
    route.fulfill({
      body: encode({
        data: entries.map(({ r, l, ...anime }) => ({ ...anime, d: [{ d: 498192, l, r }] })),
        meta: { total: entries.length },
        updated: '2026-11-01T22:00:00Z',
        useLaplace: true,
      }),
    }),
  )
  await page.route('**/msgpack/id/*.msgpack', (route) =>
    route.fulfill({ status: 503 }),
  )
  await page.route('https://media.kitsu.app/**', (route) => route.abort())
  await page.goto('/2026/autumn/')
  const view = page.getByRole('group', { name: 'Season view' })
  const rankings = view.getByRole('button', { name: 'Rankings' })
  const trends = view.getByRole('button', { name: 'Trends' })
  const spotlight = page.getByRole('list', { name: 'Top anime' })
  const rest = page.getByRole('list', { name: 'More ranked anime' })
  const search = page.getByRole('searchbox', { name: 'Find an anime' })
  const graph = page.getByRole('group', { name: 'Graph metrics', exact: true })
  const sort = page.getByRole('combobox', { name: 'Sort by' })
  const format = page.getByRole('group', { name: 'Format' })
  const overview = page.getByRole('region', { name: 'Season overview' })
  const results = page.getByRole('region', { name: 'Anime', exact: true })
  await expect(rankings).toHaveAttribute('aria-pressed', 'true')
  await expect(graph).toHaveCount(0)
  await expect(spotlight.locator('.ranking-title')).toHaveText(['Shared Alpha', 'Shared Gamma', 'Shared Beta'])
  await expect(rest.locator('.ranking-title')).toHaveText(['Solo Delta'])
  await expect(rest.locator('.ranking-position')).toHaveText('#4')
  await expect(spotlight.locator('.poster-fallback').first()).toHaveText('S')
  await expect(overview.locator('svg').first()).toBeVisible()

  for (const [trigger, title] of [
    [spotlight.getByRole('button', { name: 'Explore history for Shared Alpha' }), 'Shared Alpha'],
    [rest.getByRole('button', { name: 'Explore history for Solo Delta' }), 'Solo Delta'],
  ] as const) {
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: title })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  }

  await search.fill('Shared')
  await expect(spotlight.getByRole('listitem')).toHaveCount(3)
  await expect(rest).toHaveCount(0)
  await format.getByRole('button', { name: 'ONA' }).click()
  await expect(spotlight.getByRole('listitem')).toHaveCount(2)
  await sort.selectOption('r')
  await expect(spotlight.locator('.ranking-title')).toHaveText(['Shared Beta', 'Shared Alpha'])
  await expect(spotlight.locator('.ranking-score strong')).toHaveText(['30', '10'])
  await trends.click()
  await expect(trends).toHaveAttribute('aria-pressed', 'true')
  await expect(graph).toBeVisible()
  await expect(overview.locator('svg').first()).toBeVisible()
  await expect(search).toHaveValue('Shared')
  await expect(format.getByRole('button', { name: 'ONA' })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.anime-card h2')).toHaveText(['Shared Beta', 'Shared Alpha'])
  await rankings.click()
  await expect(spotlight.locator('.ranking-title')).toHaveText(['Shared Beta', 'Shared Alpha'])
  await search.fill('Alpha')
  await expect(spotlight.getByRole('listitem')).toHaveCount(1)
  await search.fill('no matches')
  await expect(spotlight).toHaveCount(0)
  await expect(results.getByRole('status')).toHaveText('0 anime')
  await page.getByRole('button', { name: 'Reset filters' }).click()
  await expect(search).toHaveValue('')
  await expect(search).toBeFocused()
  await expect(format.getByRole('button', { name: 'ONA' })).toHaveAttribute('aria-pressed', 'true')
  await expect(spotlight.locator('.ranking-title')).toHaveText(['Solo Delta', 'Shared Beta', 'Shared Gamma'])
  await expect(rest.locator('.ranking-title')).toHaveText(['Shared Alpha'])
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
test('page and view motion follow pointer input and reduced motion', async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate
    Element.prototype.animate = function (frames, options) {
      if (this instanceof HTMLElement && this.matches('main h1') && Array.isArray(frames)) {
        this.dataset.headingMotion = frames[0]?.transform ? 'slide' : 'fade'
      }
      return animate.call(this, frames, options)
    }
  })
  await page.goto('/2026/autumn/')
  const heading = page.getByRole('heading', { level: 1 })
  const view = page.getByRole('group', { name: 'Season view' })
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(heading).not.toHaveAttribute('data-heading-motion')
  await view.getByRole('button', { name: 'Trends' }).click()
  await expect(view).toHaveAttribute('data-pointer-change', 'true')
  await view.getByRole('button', { name: 'Rankings' }).press('Enter')
  await expect(view).not.toHaveAttribute('data-pointer-change')

  const previous = page.getByRole('button', { name: 'Previous available season' })
  if (isMobile) await previous.tap()
  else await previous.click()
  await expect(heading).toHaveText('Summer 2026')
  await expect(heading).toHaveAttribute('data-heading-motion', 'slide')
  await navigation.getByRole('link', { name: 'Season stats' }).press('Enter')
  await expect(heading).toHaveText('Season stats')
  await expect(heading).not.toHaveAttribute('data-heading-motion')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await navigation.getByRole('link', { name: 'How ratings work' }).click()
  await expect(heading).toHaveText('How ratings work')
  await expect(heading).toHaveAttribute('data-heading-motion', 'fade')
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
  await expect(page.getByText('Season history unavailable')).toBeVisible()
  await page.unroute('**/msgpack/*.msgpack')
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  const response = await page.goto('/2099/winter/')
  expect(response?.status()).toBe(404)
})
