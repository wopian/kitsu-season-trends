import { test, expect } from '@playwright/test'

test('season previews render without JavaScript, with canonical autumn aliases', async ({ browser, request, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  const page = await context.newPage()
  try {
    for (const key of ['2017-spring', '2026-winter', '2026-autumn']) {
      const [year, season] = key.split('-')
      await page.goto(`/${year}/${season}/`)
      const image = await page.locator('meta[property="og:image"]').getAttribute('content')
      expect(image).toMatch(new RegExp(`^https://kitsu\\.wopian\\.me/social/${key}\\.png\\?v=[a-f0-9]{16}$`))
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', image!)
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
      const alt = await page.locator('meta[property="og:image:alt"]').getAttribute('content')
      expect(alt).toContain('Highest-rated new anime:')
      expect(alt).toContain('TV')
      expect(alt!.length).toBeLessThanOrEqual(420)
      const path = new URL(image!).pathname
      const png = await request.get(path)
      expect(png.headers()['content-type']).toContain('image/png')
      const bytes = await png.body()
      expect(bytes.readUInt32BE(16)).toBe(1200)
      expect(bytes.readUInt32BE(20)).toBe(630)
      const svg = await request.get(path.replace('.png', '.svg'))
      expect(svg.headers()['content-type']).toContain('image/svg+xml')
      expect(await svg.text()).toContain('<title>')
    }
    const autumn = await request.get('/2026/autumn/')
    const alias = await request.get('/2026/fall/')
    const image = (await autumn.text()).match(/property="og:image" content="([^"]+)"/)![1]
    expect(await alias.text()).toContain(`property="og:image" content="${image}"`)
    expect(await alias.text()).toContain('url=/2026/autumn')
    const home = await request.get('/')
    expect(await home.text()).toContain(`property="og:image" content="${image}"`)
  } finally { await context.close() }
})

test('season navigation changes social metadata', async ({ page }) => {
  await page.goto('/2026/autumn/')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /2026-autumn\.png/)
  await page.getByRole('group', { name: 'Season', exact: true }).getByRole('button', { name: 'winter', exact: true }).click()
  await expect(page).toHaveURL(/\/2026\/winter\/?$/)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /2026-winter\.png/)
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /Winter 2026/)
})
