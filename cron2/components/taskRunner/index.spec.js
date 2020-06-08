import { taskRunner } from './'
import * as mockAccess from '../filesystem/access'
import * as mockProcess from '../tasks/process'
import * as mockMap from '../tasks/map'

const data = { data: [ { i: 1 } ] }
const path = 'fake.json5'
const seasonYear = {
  current: false,
  season: 'winter',
  year: 2019
}

beforeEach(() => {
  mockAccess.access = jest.fn()
  mockProcess.process = jest.fn()
  mockProcess.map = jest.fn()
  mockMap.access.mockResolvedValueOnce(data)
})

describe.skip('components > taskRunner', () => {
  it('calls access', async () => {
    await taskRunner(path, seasonYear)
    expect(mockAccess.access)
      .toHaveBeenCalledWith(path, seasonYear)
  })

  it('calls process', async () => {
    /*
    mockProcess.process.mockResolvedValue({
      prunedExistingData: [],
      prunedUpdatedData: []
    })
    */
    mockProcess.process.mockResolvedValueOnce(() => {
      return {
        prunedExistingData: [],
        prunedUpdatedData: []
      }
    })
    await taskRunner(path, seasonYear)
    expect(mockProcess.process)
      .toHaveBeenCalledWith(seasonYear, data)
  })
})
