import MockDate from 'mockdate'
import { previousSeasonYear } from './'

describe('util > previousSeason', () => {
  it('provides the previous season (mock Jan)', () => {
    MockDate.set(new Date('2020-01-01'))
    expect(previousSeasonYear()).toStrictEqual({
      current: false,
      season: 'autumn',
      year: 2019
    })
    MockDate.reset()
  })

  it('provides the previous season (mock Sep)', () => {
    MockDate.set(new Date('2020-09-01'))
    expect(previousSeasonYear()).toStrictEqual({
      current: false,
      season: 'spring',
      year: 2020
    })
    MockDate.reset()
  })
})
