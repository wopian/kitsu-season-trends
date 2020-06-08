import { UTC } from '../'
import { yearBySeason } from './'

describe('util > yearBySeason', () => {
  it('returns null if no parameter is set', () => {
    expect(yearBySeason()).toBe(null)
  })

  it('returns null for null', () => {
    expect(yearBySeason(null)).toBe(null)
  })

  it('returns 2019 for November 2019', () => {
    expect(yearBySeason(new UTC('2019-11-01'))).toBe(2019)
  })

  it('returns 2020 for December 2019', () => {
    expect(yearBySeason(new UTC('2019-12-01'))).toBe(2020)
  })
})
