import MockDate from 'mockdate'
import { nextSeasonYear } from './'

describe('util > nextSeason', () => {
  it('provides the next season (mocked Jan)', () => {
    MockDate.set(new Date('2020-01-01'))
    expect(nextSeasonYear()).toStrictEqual({
      current: false,
      season: 'spring',
      year: 2020
    })
    MockDate.reset()
  })

  it('provides the next season (mocked November)', () => {
    MockDate.set(new Date('2020-11-01'))
    expect(nextSeasonYear()).toStrictEqual({
      current: false,
      season: 'winter',
      year: 2021
    })
    MockDate.reset()
  })

  it('provides the next season (preset)', () => {
    expect(nextSeasonYear('summer', 2019)).toStrictEqual({
      current: false,
      season: 'autumn',
      year: 2019
    })
  })
})
