import MockDate from 'mockdate'
import { UTC } from '../'
import { nextSeasonYear } from './'

describe('util > nextSeason', () => {
  it('provides the next season (mock Jan)', () => {
    MockDate.set(new UTC('2020-01-01'))
    expect(nextSeasonYear()).toStrictEqual({
      current: false,
      season: 'spring',
      year: 2020
    })
    MockDate.reset()
  })

  it('provides the next season (mock November)', () => {
    MockDate.set(new UTC('2020-11-01'))
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
