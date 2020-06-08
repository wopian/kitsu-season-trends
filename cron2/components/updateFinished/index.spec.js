import MockAdapter from 'axios-mock-adapter'
import { bold, blue, magenta } from 'colorette'
import { getFinishedResource, getFinished, updateFinished } from './'
import { api } from '../../utils'

const mock = new MockAdapter(api.axios)
const rawResource = {
  data: {
    id: '1',
    type: 'anime',
    links: { self: 'https://kitsu.io/api/edge/anime/1' },
    attributes: {
      canonicalTitle: 'Test 1',
      ratingFrequencies: {
        2: '1',
        20: '1'
      },
      userCount: 10,
      favoritesCount: 1,
      tba: '',
      subtype: 'TV',
      startDate: '2000-01-20',
      endDate: '2020-05-15',
      status: 'finished'
    }
  }
}
const rawResourceNoNext = {
  data: {
    id: '2',
    type: 'anime',
    links: { self: 'https://kitsu.io/api/edge/anime/2' },
    attributes: {
      canonicalTitle: 'Test 2',
      ratingFrequencies: {
        2: '2',
        20: '2'
      },
      userCount: 20,
      favoritesCount: 2,
      tba: '',
      subtype: 'TV',
      startDate: '2010-05-27',
      endDate: '2020-06-09',
      status: 'finished'
    }
  }
}

beforeEach(() => {

})

afterEach(() => {
  mock.reset()
})

describe('components > updateFinished > getFinishedResource', () => {
  it('returns a kitsu-formatted JSON:API response', async () => {
    mock.onGet().replyOnce(200, rawResource)
    const { data } = await getFinishedResource(1)
    expect(data).toStrictEqual({
      id: '1',
      type: 'anime',
      links: { self: 'https://kitsu.io/api/edge/anime/1' },
      canonicalTitle: 'Test 1',
      ratingFrequencies: { 2: '1', 20: '1' },
      userCount: 10,
      favoritesCount: 1,
      subtype: 'TV',
      tba: '',
      startDate: '2000-01-20',
      endDate: '2020-05-15',
      status: 'finished'
    })
  })

  it('handles network errors', async () => {
    mock.onGet().networkError()
    await expect(getFinishedResource(1))
      .rejects.toThrow('Network Error')
  })
})


describe('components > updateFinished > getFinished', () => {
  it('fetches all resources provided', async () => {
    mock.onGet().replyOnce(200, rawResource).onGet().replyOnce(200, rawResourceNoNext)
    const data = await getFinished([ '1', '2' ], { season: 'spring', year: 2020 })
    expect(data).toHaveLength(2)
  })

  it('strips out resources that aren\'t finished', async () => {
    mock.onGet().replyOnce(200, {
      data: {
        id: '1',
        type: 'anime',
        attributes: {
          status: 'current'
        }
      }
    })
    const data = await getFinished([ 1 ], { season: 'spring', year: 2020 })
    expect(data).toHaveLength(0)
  })
})

describe('components > updateFinished > updateFinished', () => {
  it('logs the task status and returns final result', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    mock.onGet().replyOnce(200, rawResourceNoNext)
    const upcomingData = await updateFinished({ season: 'spring', year: 2020 }, [ 1 ])
    expect(spy).toHaveBeenNthCalledWith(1, `${bold(blue('  INFO'))} ${magenta('PREVIOUS')} Finished`)
    expect(spy).toHaveBeenNthCalledWith(2, `${bold(blue('  INFO'))} ${magenta('PREVIOUS')} Finished 1 resources`)
    expect(upcomingData).toHaveLength(1)
    expect(upcomingData[0]).toStrictEqual({
      id: '2',
      type: 'anime',
      links: { self: 'https://kitsu.io/api/edge/anime/2' },
      canonicalTitle: 'Test 2',
      ratingFrequencies: { 2: '2', 20: '2' },
      userCount: 20,
      favoritesCount: 2,
      subtype: 'TV',
      tba: '',
      startDate: '2010-05-27',
      endDate: '2020-06-09',
      status: 'finished'
    })
    spy.mockRestore()
  })
})
