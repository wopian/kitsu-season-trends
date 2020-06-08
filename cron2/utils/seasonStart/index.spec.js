import { UTC } from '../'
import { seasonStart } from './'

describe('util > seasonStart', () => {
  it('returns null if no parameter is set', () => {
    expect(seasonStart()).toBe(null)
  })

  it('returns null for null', () => {
    expect(seasonStart(null)).toBe(null)
  })

  it('returns December for Winter', () => {
    expect(seasonStart(new UTC('2020-01-01')).toISOString())
      .toStrictEqual('2019-12-01T00:00:00.000Z')
  })

  it('returns March for Spring', () => {
    expect(seasonStart(new UTC('2020-04-01')).toISOString())
      .toStrictEqual('2020-03-01T00:00:00.000Z')
  })

  it('returns June for Summer', () => {
    expect(seasonStart(new UTC('2020-07-01')).toISOString())
      .toStrictEqual('2020-06-01T00:00:00.000Z')
  })

  it('returns September for Autumn', () => {
    expect(seasonStart(new UTC('2020-10-01')).toISOString())
      .toStrictEqual('2020-09-01T00:00:00.000Z')
  })
})
