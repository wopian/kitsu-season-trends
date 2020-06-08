import { firstDayOfNextSeason } from './'

describe('utils > firstDayOfNextSeason', () => {
  it('gets first day of the season after winter', () => {
    expect(firstDayOfNextSeason('winter', 2020))
      .toEqual(new Date('2020-04-01T00:00:00.000Z'))
  })

  it('gets first day of the season after spring', () => {
    expect(firstDayOfNextSeason('spring', 2020))
      .toEqual(new Date('2020-07-01T00:00:00.000Z'))
  })

  it('gets first day of the season after summer', () => {
    expect(firstDayOfNextSeason('summer', 2020))
      .toEqual(new Date('2020-10-01T00:00:00.000Z'))
  })

  it('gets first day of the season after autumn', () => {
    expect(firstDayOfNextSeason('autumn', 2020))
      .toEqual(new Date('2021-01-01T00:00:00.000Z'))
  })
})
