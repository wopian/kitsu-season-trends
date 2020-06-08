import { taskRunner } from './'
import * as mockAccessData from '../accessData'
import * as mockProcessData from '../processData'

const data = { data: [ { i: 1 } ] }
const path = 'fake.json5'
const seasonYear = {
  current: false,
  season: 'winter',
  year: 2019
}

beforeEach(() => {
  mockAccessData.accessData = jest.fn()
  mockProcessData.processData = jest.fn()
  mockAccessData.accessData.mockResolvedValueOnce(data)
})

describe('components > taskRunner', () => {
  it('calls accessData', async () => {
    await taskRunner(path, seasonYear)
    expect(mockAccessData.accessData)
      .toHaveBeenCalledWith(path, seasonYear)
  })

  it('calls processData', async () => {
    await taskRunner(path, seasonYear)
    expect(mockProcessData.processData)
      .toHaveBeenCalledWith(seasonYear, data)
  })
})
