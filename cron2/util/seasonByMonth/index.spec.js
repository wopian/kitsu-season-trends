import { seasonByMonth } from './'

describe('util > seasonByMonth', () => {
  it('returns null if no parameter is set', () => {
    expect(seasonByMonth()).toBe(null)
  })

  it('returns null for null', () => {
    expect(seasonByMonth(null)).toBe(null)
  })

  it('returns winter for 0-2', () => {
    expect.assertions(3)
    expect(seasonByMonth(0)).toBe('winter')
    expect(seasonByMonth(1)).toBe('winter')
    expect(seasonByMonth(2)).toBe('winter')
  })

  it('returns spring for 3-5', () => {
    expect.assertions(3)
    expect(seasonByMonth(3)).toBe('spring')
    expect(seasonByMonth(4)).toBe('spring')
    expect(seasonByMonth(5)).toBe('spring')
  })

  it('returns summer for 6-8', () => {
    expect.assertions(3)
    expect(seasonByMonth(6)).toBe('summer')
    expect(seasonByMonth(7)).toBe('summer')
    expect(seasonByMonth(8)).toBe('summer')
  })

  it('returns autumn for 9-11', () => {
    expect.assertions(3)
    expect(seasonByMonth(9)).toBe('autumn')
    expect(seasonByMonth(10)).toBe('autumn')
    expect(seasonByMonth(11)).toBe('autumn')
  })
})
