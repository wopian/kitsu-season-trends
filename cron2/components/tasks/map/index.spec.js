import { map } from './'

const seasonYear = {
  season: 'winter',
  year: '2020'
}

describe('components > tasks > map > map', () => {
  it('', async () => {
    const data = [
      { i: 12, t: 'One Piece', u: 0, n: 0, d: [
        { i: 0, d: 438294, m: 8.32, r: 72808, u: 127532, f: 5290 }
      ]}
    ]
    const updated = [
      {
        id: '12',
        type: 'anime',
        canonicalTitle: 'One Piece',
        ratingFrequencies: {
          2: '4468',
          3: '87',
          4: '405',
          5: '71',
          6: '349',
          7: '67',
          8: '4989',
          9: '94',
          10: '1153',
          11: '139',
          12: '2135',
          13: '181',
          14: '11730',
          15: '409',
          16: '5387',
          17: '658',
          18: '5292',
          19: '563',
          20: '47522'
        },
        userCount: 149856,
        favoritesCount: 5723,
        subtype: 'TV',
        startDate: '1999-10-20',
        endDate: null,
        status: 'current'
      }
    ]
    const output = await map(seasonYear, data, updated)
    expect(output).toEqual([
      {
        i: 12,
        t: 'One Piece',
        u: 0,
        n: 0,
        d: [
          { i: 0, d: 438294, m: 8.32, r: 72808, u: 127532, f: 5290 },
          { i: 1, d: 442115, m: 8, r: 85699, u: 149856, f: 5723 }
        ]
      }
    ])
  })
})
