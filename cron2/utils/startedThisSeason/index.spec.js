import { startedThisSeason } from './'

const seasonYear = {
  season: 'spring',
  year: '2010'
}

describe('util > startedThisSeason', () => {
  it('returns false for resources that started the season before', () => {
    expect(startedThisSeason('2010-01-01', seasonYear)).toBe(false)
  })

  it('returns true for resources that started the month before', () => {
    expect(startedThisSeason('2010-03-01', seasonYear)).toBe(true)
  })

  it('returns true for resources that started on the first month', () => {
    expect(startedThisSeason('2010-04-01', seasonYear)).toBe(true)
  })

  it('returns true for resources that started on the second month', () => {
    expect(startedThisSeason('2010-05-01', seasonYear)).toBe(true)
  })

  it('returns true for resources that started on the third month', () => {
    expect(startedThisSeason('2010-06-01', seasonYear)).toBe(true)
  })
})
