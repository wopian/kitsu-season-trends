import { firstDayOfNextSeason } from './'

describe('utils > lastDayOfSeason', () => {
  it('gets first day of the spring season', () => {
    expect(firstDayOfNextSeason('winter', 2020))
      .toEqual(new Date('2020-04-01T00:00:00.000Z'))
  })

  it('gets first day of the summer season', () => {
    expect(firstDayOfNextSeason('spring', 2020))
      .toEqual(new Date('2020-07-01T00:00:00.000Z'))
  })

  it('gets first day of the autumn season', () => {
    expect(firstDayOfNextSeason('summer', 2020))
      .toEqual(new Date('2020-10-01T00:00:00.000Z'))
  })

  it('gets first day of the winter season', () => {
    expect(firstDayOfNextSeason('autumn', 2020))
      .toEqual(new Date('2021-01-01T00:00:00.000Z'))
  })
})
