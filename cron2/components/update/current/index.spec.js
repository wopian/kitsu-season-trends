import MockAdapter from 'axios-mock-adapter'
import { getCurrentResource, getCurrent, updateCurrent } from './'
import { api, bold, blue, magenta } from '../../../utils'

const mock = new MockAdapter(api.axios)
// https://kitsu.io/api/edge/anime?fields[anime]=canonicalTitle,ratingFrequencies,userCount,favoritesCount,tba,subtype,startDate,endDate,status&sort=-averageRating,-userCount&page[offset]=0&page[limit]=1&filter[subtype]=tv,ona&filter[status]=current
const rawResource = {
  data: [
    {
      id: '12',
      type: 'anime',
      links: { self: 'https://kitsu.io/api/edge/anime/12' },
      attributes: {
        canonicalTitle: 'One Piece',
        ratingFrequencies: {
          8: '4984',
          20: '47505'
        },
        userCount: 149650,
        favoritesCount: 5719,
        tba: '',
        subtype: 'TV',
        startDate: '1999-10-20',
        endDate: null,
        status: 'current'
      }
    }
  ],
  links: {
    first: 'https://kitsu.io/api/edge/anime?fields%5Banime%5D=canonicalTitle%2CratingFrequencies%2CuserCount%2CfavoritesCount%2Ctba%2Csubtype%2CstartDate%2CendDate%2Cstatus&filter%5Bstatus%5D=current&filter%5Bsubtype%5D=tv%2Cona&page%5Blimit%5D=1&page%5Boffset%5D=0&sort=-averageRating%2C-userCount',
    next: 'https://kitsu.io/api/edge/anime?fields%5Banime%5D=canonicalTitle%2CratingFrequencies%2CuserCount%2CfavoritesCount%2Ctba%2Csubtype%2CstartDate%2CendDate%2Cstatus&filter%5Bstatus%5D=current&filter%5Bsubtype%5D=tv%2Cona&page%5Blimit%5D=1&page%5Boffset%5D=1&sort=-averageRating%2C-userCount',
    last: 'https://kitsu.io/api/edge/anime?fields%5Banime%5D=canonicalTitle%2CratingFrequencies%2CuserCount%2CfavoritesCount%2Ctba%2Csubtype%2CstartDate%2CendDate%2Cstatus&filter%5Bstatus%5D=current&filter%5Bsubtype%5D=tv%2Cona&page%5Blimit%5D=1&page%5Boffset%5D=238&sort=-averageRating%2C-userCount'
    }
}
const rawResourceNoNext = {
  data: [
    {
      id: '12',
      type: 'anime',
      links: { self: 'https://kitsu.io/api/edge/anime/12' },
      attributes: {
        canonicalTitle: 'One Piece',
        ratingFrequencies: {
          8: '4984',
          20: '47505'
        },
        userCount: 149650,
        favoritesCount: 5719,
        tba: '',
        subtype: 'TV',
        startDate: '1999-10-20',
        endDate: null,
        status: 'current'
      }
    }
  ],
  links: {
    first: 'https://kitsu.io/api/edge/anime?fields%5Banime%5D=canonicalTitle%2CratingFrequencies%2CuserCount%2CfavoritesCount%2Ctba%2Csubtype%2CstartDate%2CendDate%2Cstatus&filter%5Bstatus%5D=current&filter%5Bsubtype%5D=tv%2Cona&page%5Blimit%5D=1&page%5Boffset%5D=0&sort=-averageRating%2C-userCount',
    last: 'https://kitsu.io/api/edge/anime?fields%5Banime%5D=canonicalTitle%2CratingFrequencies%2CuserCount%2CfavoritesCount%2Ctba%2Csubtype%2CstartDate%2CendDate%2Cstatus&filter%5Bstatus%5D=current&filter%5Bsubtype%5D=tv%2Cona&page%5Blimit%5D=1&page%5Boffset%5D=238&sort=-averageRating%2C-userCount'
  }
}

beforeEach(() => {

})

afterEach(() => {
  mock.reset()
})

describe('components > update > current > getCurrentResource', () => {
  it('returns a kitsu-formatted JSON:API response', async () => {
    mock.onGet().replyOnce(200, rawResource)
    const { data, links } = await getCurrentResource(0, { season: 'spring', year: 2020 })
    expect(links).toHaveProperty('first')
    expect(links).toHaveProperty('next')
    expect(links).toHaveProperty('last')
    expect(data).toHaveLength(1)
    expect(data[0]).toStrictEqual({
      id: '12',
      type: 'anime',
      links: { self: 'https://kitsu.io/api/edge/anime/12' },
      canonicalTitle: 'One Piece',
      ratingFrequencies: { 8: '4984', 20: '47505' },
      userCount: 149650,
      favoritesCount: 5719,
      subtype: 'TV',
      tba: '',
      startDate: '1999-10-20',
      endDate: null,
      status: 'current'
    })
  })

  it('handles network errors', async () => {
    mock.onGet().networkError()
    await expect(getCurrentResource(0, { season: 'spring', year: 2020 }))
      .rejects.toThrow('Network Error')
  })
})


describe('components > update > current > getCurrent', () => {
  it('fetches data until there\'s no next page', async () => {
    mock.onGet().replyOnce(200, rawResource).onGet().replyOnce(200, rawResourceNoNext)
    const data = await getCurrent(0, { season: 'spring', year: 2020 })
    expect(data).toHaveLength(2)
  })

  it('strips out resources that aren\'t upcoming', async () => {
    mock.onGet().replyOnce(200, {
      data: [
        {
          id: '1',
          type: 'anime',
          attributes: {
            status: 'completed'
          }
        }
      ]
    })
    const data = await getCurrent(0, { season: 'spring', year: 2020 })
    expect(data).toHaveLength(0)
  })
})

describe('components > update > current > updateCurrent', () => {
  it('logs the task status and returns final result', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    mock.onGet().replyOnce(200, rawResourceNoNext)
    const upcomingData = await updateCurrent({ season: 'spring', year: 2020 })
    expect(spy).toHaveBeenNthCalledWith(1, `${bold(blue('  INFO'))} ${magenta('PREVIOUS')} Current`)
    expect(spy).toHaveBeenNthCalledWith(2, `${bold(blue('  INFO'))} ${magenta('PREVIOUS')} Current   1 resources`)
    expect(upcomingData).toHaveLength(1)
    expect(upcomingData[0]).toStrictEqual({
      id: '12',
      type: 'anime',
      links: { self: 'https://kitsu.io/api/edge/anime/12' },
      canonicalTitle: 'One Piece',
      ratingFrequencies: { 8: '4984', 20: '47505' },
      userCount: 149650,
      favoritesCount: 5719,
      subtype: 'TV',
      tba: '',
      startDate: '1999-10-20',
      endDate: null,
      status: 'current'
    })
    spy.mockRestore()
  })
})
