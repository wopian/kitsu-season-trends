import strip from 'strip-ansi'
import { seasonKind } from './'

describe('utils > seasonKind', () => {
  it('returns CURRENT for current season', () => {
    const seasonYear = {
      current: true,
      season: 'winter',
      year: '2020'
    }
    expect(strip(seasonKind(seasonYear))).toBe(' CURRENT')
  })

  it('returns PREVIOUS for previous season', () => {
    const seasonYear = {
      current: false,
      season: 'winter',
      year: '2020'
    }
    expect(strip(seasonKind(seasonYear))).toBe('PREVIOUS')
  })
})
