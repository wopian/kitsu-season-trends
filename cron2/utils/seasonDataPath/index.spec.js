import { seasonDataPath } from './'

describe('util > seasonDataPath', () => {
  it('returns path for the provided season', () => {
    expect(seasonDataPath(
      { season: 'winter',
      year: 2019
    })).toBe('./data/2019-winter.json5')
  })
})
