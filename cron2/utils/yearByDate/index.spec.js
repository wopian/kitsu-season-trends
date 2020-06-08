import { UTC } from '../'
import { yearByDate } from './'

describe('util > yearByDate', () => {
  it('returns null if no parameter is set', () => {
    expect(yearByDate()).toBe(null)
  })

  it('returns null for null', () => {
    expect(yearByDate(null)).toBe(null)
  })

  it('returns 2019 for 2019 as a Date object', () => {
    expect(yearByDate(new UTC('2019'))).toBe(2019)
  })

  it('returns 2018 for 2018-12-01 as a Date object', () => {
    expect(yearByDate(new UTC('2018-12-01'))).toBe(2018)
  })
})
