import MockDate from 'mockdate'
import { currentSeasonYear } from './'

describe('util > currentSeasonYear', () => {
  it('returns current season and year', () => {
    MockDate.set(new Date('2019-01-01'))
    expect(currentSeasonYear()).toStrictEqual({
      current: true,
      season: 'winter',
      year: 2019
    })
    MockDate.reset()
  })
})
