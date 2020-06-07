import { seasonKind } from './'

describe('utils > seasonKind', () => {
  it('returns CURRENT for current season', () => {
    const seasonYear = {
      current: true,
      season: 'winter',
      year: '2020'
    }
    expect(seasonKind(seasonYear)).toBe('\u001b[33m CURRENT\u001B[39m')
  })

  it('returns PREVIOUS for previous season', () => {
    const seasonYear = {
      current: false,
      season: 'winter',
      year: '2020'
    }
    expect(seasonKind(seasonYear)).toBe('\u001b[35mPREVIOUS\u001B[39m')
  })
})
