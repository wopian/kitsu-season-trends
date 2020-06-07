import { seasonByStart } from './'

describe('util > seasonByStart', () => {
  it('returns null if no parameter is set', () => {
    expect(seasonByStart()).toBe(null)
  })

  it('returns null for null', () => {
    expect(seasonByStart(null)).toBe(null)
  })

  it('returns winter for December, January and February', () => {
    expect.assertions(3)
    expect(seasonByStart(new Date('2020-12-01'))).toBe('winter')
    expect(seasonByStart(new Date('2020-01-01'))).toBe('winter')
    expect(seasonByStart(new Date('2020-02-01'))).toBe('winter')
  })

  it('returns spring for March, April and May', () => {
    expect.assertions(3)
    expect(seasonByStart(new Date('2020-03-01'))).toBe('spring')
    expect(seasonByStart(new Date('2020-04-01'))).toBe('spring')
    expect(seasonByStart(new Date('2020-05-01'))).toBe('spring')
  })

  it('returns summer for June, July and August', () => {
    expect.assertions(3)
    expect(seasonByStart(new Date('2020-06-01'))).toBe('summer')
    expect(seasonByStart(new Date('2020-07-01'))).toBe('summer')
    expect(seasonByStart(new Date('2020-08-01'))).toBe('summer')
  })

  it('returns autumn for September, October and November', () => {
    expect.assertions(3)
    expect(seasonByStart(new Date('2020-09-01'))).toBe('autumn')
    expect(seasonByStart(new Date('2020-10-01'))).toBe('autumn')
    expect(seasonByStart(new Date('2020-11-01'))).toBe('autumn')
  })
})
