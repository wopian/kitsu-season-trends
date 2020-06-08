import { UTC } from '../'
import { seasonByDate } from './'

describe('util > seasonByDate', () => {
  it('returns null if no parameter is set', () => {
    expect(seasonByDate()).toBe(null)
  })

  it('returns null for null', () => {
    expect(seasonByDate(null)).toBe(null)
  })

  it('returns winter for January, February and March', () => {
    expect.assertions(3)
    expect(seasonByDate(new UTC('2020-01-01'))).toBe('winter')
    expect(seasonByDate(new UTC('2020-02-01'))).toBe('winter')
    expect(seasonByDate(new UTC('2020-03-01'))).toBe('winter')
  })

  it('returns spring for April, May and June', () => {
    expect.assertions(3)
    expect(seasonByDate(new UTC('2020-04-01'))).toBe('spring')
    expect(seasonByDate(new UTC('2020-05-01'))).toBe('spring')
    expect(seasonByDate(new UTC('2020-06-01'))).toBe('spring')
  })

  it('returns summer for July, August and September', () => {
    expect.assertions(3)
    expect(seasonByDate(new UTC('2020-07-01'))).toBe('summer')
    expect(seasonByDate(new UTC('2020-08-01'))).toBe('summer')
    expect(seasonByDate(new UTC('2020-09-01'))).toBe('summer')
  })

  it('returns autumn for October, November and December', () => {
    expect.assertions(3)
    expect(seasonByDate(new UTC('2020-10-01'))).toBe('autumn')
    expect(seasonByDate(new UTC('2020-11-01'))).toBe('autumn')
    expect(seasonByDate(new UTC('2020-12-01'))).toBe('autumn')
  })
})
