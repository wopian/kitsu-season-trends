import { listIDs } from './'

describe('utils > listIDs', () => {
  it('maps an array of resource objects to an array of string IDs', () => {
    const data = [
      { id: '1', type: 'anime' },
      { id: '2', type: 'anime' }
    ]
    expect(listIDs(data, 'id')).toStrictEqual([ '1', '2' ])
  })

  it('maps an array of resource objects to an array of numeric IDs', () => {
    const data = [
      { i: 1, type: 'anime' },
      { i: 2, type: 'anime' }
    ]
    expect(listIDs(data, 'i')).toStrictEqual([ 1, 2 ])
  })
})
