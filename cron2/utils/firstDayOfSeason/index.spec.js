import { firstDayOfSeason } from './'

describe('utils > firstDayOfSeason', () => {
  it('gets first day of the winter season', () => {
    expect(firstDayOfSeason('winter', 2020).toISOString())
      .toEqual('2020-01-01T00:00:00.000Z')
  })

  it('gets first day of the spring season', () => {
    expect(firstDayOfSeason('spring', 2020).toISOString())
      .toEqual('2020-04-01T00:00:00.000Z')
  })

  it('gets first day of the summer season', () => {
    expect(firstDayOfSeason('summer', 2020).toISOString())
      .toEqual('2020-07-01T00:00:00.000Z')
  })

  it('gets first day of the autumn season', () => {
    expect(firstDayOfSeason('autumn', 2020).toISOString())
      .toEqual('2020-10-01T00:00:00.000Z')
  })
})
