import { pruneData, pruneDuplicate, pruneInvalid } from './'

const seasonYear = {
  season: 'winter',
  year: 2000
}

describe('components > pruneDuplicate', () => {
  it('handles empty arrays', async () => {
    const data = []
    const output = await pruneDuplicate(data)
    expect(output).toHaveLength(0)
    expect(output).toStrictEqual([])
  })

  it('removes duplicates by ID', async () => {
    const data = [
      { id: '1', userCount: 8 },
      { id: '1', userCount: 8 },
      { id: '2', userCount: 16 }
    ]
    const output = await pruneDuplicate(data)
    expect(output).toHaveLength(2)
    expect(output).toStrictEqual([
      { id: '1', userCount: 8 },
      { id: '2', userCount: 16 }
    ])
  })
})

describe('components > pruneInvalid', () => {
  it('handles empty arrays', async () => {
    const data = []
    const output = await pruneInvalid(data, seasonYear)
    expect(output).toHaveLength(0)
    expect(output).toStrictEqual([])
  })

  it('strips resources with less than 5 users', async () => {
    const data = [
      { id: '1', userCount: 3 },
      { id: '2', userCount: 9 }
    ]
    const output = await pruneInvalid(data, seasonYear)
    expect(output).toHaveLength(1)
    expect(output).toStrictEqual([
      { id: '2', userCount: 9 }
    ])
  })

  it('strips resources with no start date set', async () => {
    const data = [
      { id: '1', userCount: 9, startDate: null },
      { id: '2', userCount: 9, startDate: '2000-01-01' }
    ]
    const output = await pruneInvalid(data, seasonYear)
    expect(output).toHaveLength(1)
    expect(output).toStrictEqual([
      { id: '2', userCount: 9, startDate: '2000-01-01' }
    ])
  })

  it('strips resources that don\'t start until the next season', async () => {
    const data = [
      { id: '1', userCount: 9, startDate: '2000-04-01' },
      { id: '2', userCount: 9, startDate: '2000-01-01' }
    ]
    const output = await pruneInvalid(data, seasonYear)
    expect(output).toHaveLength(1)
    expect(output).toStrictEqual([
      { id: '2', userCount: 9, startDate: '2000-01-01' }
    ])
  })

  it('strips resources that finished before the season started', async () => {
    const data = [
      { id: '1', userCount: 9, startDate: '2000-01-01', endDate: '1999-11-01' },
      { id: '2', userCount: 9, startDate: '2000-01-01', endDate: null },
      { id: '3', userCount: 9, startDate: '2000-01-01', endDate: '2000-04-27' }
    ]
    const output = await pruneInvalid(data, seasonYear)
    expect(output).toHaveLength(2)
    expect(output).toStrictEqual([
      { id: '2', userCount: 9, startDate: '2000-01-01', endDate: null },
      { id: '3', userCount: 9, startDate: '2000-01-01', endDate: '2000-04-27' }
    ])
  })
})

describe('components > pruneData', () => {
  it('deduplicates and removes invalid resources', async () => {
    const data = [
      { id: '1', userCount: 8 },
      { id: '1', userCount: 8 },
      { id: '2', userCount: 1 }
    ]
    const output = await pruneData(seasonYear, data)
    expect(output).toHaveLength(1)
    expect(output).toStrictEqual([
      { id: '1', userCount: 8 }
    ])
  })
})
