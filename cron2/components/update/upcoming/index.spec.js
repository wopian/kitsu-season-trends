import MockAdapter from 'axios-mock-adapter'
import { getUpcomingResource, getUpcoming, updateUpcoming } from './'
import { api, bold, blue, magenta } from '../../../utils'

const mock = new MockAdapter(api.axios)
// https://kitsu.io/api/edge/anime?fields[anime]=canonicalTitle,ratingFrequencies,userCount,favoritesCount,subtype,startDate,endDate,status&sort=-averageRating,-userCount&page[offset]=0&page[limit]=1&filter[subtype]=tv,ona&filter[status]=upcoming&filter[season_year]=2020&filter[season]=spring
const rawResource = {
  data: [
    {
      id: '42444',
      type: 'anime',
      links: { self: 'https://kitsu.io/api/edge/anime/42444' },
      attributes: {
        canonicalTitle: 'Maesetsu!',
        ratingFrequencies: {
          4: '1',
          19: '2'
        },
        userCount: 118,
        favoritesCount: 1,
        subtype: 'TV',
        startDate: '2020-04-30',
        endDate: null,
        status: 'upcoming'
      }
    }
  ],
  links: {
    first: 'https://kitsu.io/api/edge/anime?fields%5Banime%5D=canonicalTitle%2CratingFrequencies%2CuserCount%2CfavoritesCount%2Csubtype%2CstartDate%2CendDate%2Cstatus&filter%5Bseason%5D=spring&filter%5Bseason_year%5D=2020&filter%5Bstatus%5D=upcoming&filter%5Bsubtype%5D=tv%2Cona&page%5Blimit%5D=1&page%5Boffset%5D=0&sort=-averageRating%2C-userCount',
    next: 'https://kitsu.io/api/edge/anime?fields%5Banime%5D=canonicalTitle%2CratingFrequencies%2CuserCount%2CfavoritesCount%2Csubtype%2CstartDate%2CendDate%2Cstatus&filter%5Bseason%5D=spring&filter%5Bseason_year%5D=2020&filter%5Bstatus%5D=upcoming&filter%5Bsubtype%5D=tv%2Cona&page%5Blimit%5D=1&page%5Boffset%5D=1&sort=-averageRating%2C-userCount',
    last: 'https://kitsu.io/api/edge/anime?fields%5Banime%5D=canonicalTitle%2CratingFrequencies%2CuserCount%2CfavoritesCount%2Csubtype%2CstartDate%2CendDate%2Cstatus&filter%5Bseason%5D=spring&filter%5Bseason_year%5D=2020&filter%5Bstatus%5D=upcoming&filter%5Bsubtype%5D=tv%2Cona&page%5Blimit%5D=1&page%5Boffset%5D=3&sort=-averageRating%2C-userCount'
  }
}
const rawResourceNoNext = {
  data: [
    {
      id: '42444',
      type: 'anime',
      links: { self: 'https://kitsu.io/api/edge/anime/42444' },
      attributes: {
        canonicalTitle: 'Maesetsu!',
        ratingFrequencies: {
          4: '1',
          19: '2'
        },
        userCount: 118,
        favoritesCount: 1,
        subtype: 'TV',
        startDate: '2020-04-30',
        endDate: null,
        status: 'upcoming'
      }
    }
  ],
  links: {
    first: 'https://kitsu.io/api/edge/anime?fields%5Banime%5D=canonicalTitle%2CratingFrequencies%2CuserCount%2CfavoritesCount%2Csubtype%2CstartDate%2CendDate%2Cstatus&filter%5Bseason%5D=spring&filter%5Bseason_year%5D=2020&filter%5Bstatus%5D=upcoming&filter%5Bsubtype%5D=tv%2Cona&page%5Blimit%5D=1&page%5Boffset%5D=0&sort=-averageRating%2C-userCount',
    last: 'https://kitsu.io/api/edge/anime?fields%5Banime%5D=canonicalTitle%2CratingFrequencies%2CuserCount%2CfavoritesCount%2Csubtype%2CstartDate%2CendDate%2Cstatus&filter%5Bseason%5D=spring&filter%5Bseason_year%5D=2020&filter%5Bstatus%5D=upcoming&filter%5Bsubtype%5D=tv%2Cona&page%5Blimit%5D=1&page%5Boffset%5D=3&sort=-averageRating%2C-userCount'
  }
}

beforeEach(() => {

})

afterEach(() => {
  mock.reset()
})

describe('components > update > upcoming > getUpcomingResource', () => {
  it('returns a kitsu-formatted JSON:API response', async () => {
    mock.onGet().replyOnce(200, rawResource)
    const { data, links } = await getUpcomingResource(0, { season: 'spring', year: 2020 })
    expect(links).toHaveProperty('first')
    expect(links).toHaveProperty('next')
    expect(links).toHaveProperty('last')
    expect(data).toHaveLength(1)
    expect(data[0]).toStrictEqual({
      id: '42444',
      type: 'anime',
      links: { self: 'https://kitsu.io/api/edge/anime/42444' },
      canonicalTitle: 'Maesetsu!',
      ratingFrequencies: { 4: '1', 19: '2' },
      userCount: 118,
      favoritesCount: 1,
      subtype: 'TV',
      startDate: '2020-04-30',
      endDate: null,
      status: 'upcoming'
    })
  })

  it('handles network errors', async () => {
    mock.onGet().networkError()
    await expect(getUpcomingResource(0, { season: 'spring', year: 2020 }))
      .rejects.toThrow('Network Error')
  })
})


describe('components > update > upcoming > getUpcoming', () => {
  it('fetches data until there\'s no next page', async () => {
    mock.onGet().replyOnce(200, rawResource).onGet().replyOnce(200, rawResourceNoNext)
    const data = await getUpcoming(0, { season: 'spring', year: 2020 })
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
    const data = await getUpcoming(0, { season: 'spring', year: 2020 })
    expect(data).toHaveLength(0)
  })
})

describe('components > update > upcoming > updateUpcoming', () => {
  it('logs the task status and returns final result', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    mock.onGet().replyOnce(200, rawResourceNoNext)
    const upcomingData = await updateUpcoming({ season: 'spring', year: 2020 })
    expect(spy).toHaveBeenNthCalledWith(1, `${bold(blue('  INFO'))} ${magenta('PREVIOUS')} Upcoming`)
    expect(spy).toHaveBeenNthCalledWith(2, `${bold(blue('  INFO'))} ${magenta('PREVIOUS')} Upcoming  1 resources`)
    expect(upcomingData).toHaveLength(1)
    expect(upcomingData[0]).toStrictEqual({
      id: '42444',
      type: 'anime',
      links: { self: 'https://kitsu.io/api/edge/anime/42444' },
      canonicalTitle: 'Maesetsu!',
      ratingFrequencies: { 4: '1', 19: '2' },
      userCount: 118,
      favoritesCount: 1,
      subtype: 'TV',
      startDate: '2020-04-30',
      endDate: null,
      status: 'upcoming'
    })
    spy.mockRestore()
  })
})
