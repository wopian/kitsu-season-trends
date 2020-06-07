import { monthBySeason } from './'

describe('util > monthBySeason', () => {
  it('returns null if no parameter is set', () => {
    expect(monthBySeason()).toBe(null)
  })

  it('returns null for null', () => {
    expect(monthBySeason(null)).toBe(null)
  })

  it('returns January for winter', () => {
    expect(monthBySeason('winter')).toBe(0)
  })

  it('returns April for spring', () => {
    expect(monthBySeason('spring')).toBe(3)
  })

  it('returns July for summer', () => {
    expect(monthBySeason('summer')).toBe(6)
  })

  it('returns October for autumn', () => {
    expect(monthBySeason('autumn')).toBe(9)
  })
})
