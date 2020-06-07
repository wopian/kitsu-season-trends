import mock from 'mock-fs'
import { accessData } from './'
import * as mockReadData from '../readData'

const mockFileData = '{data:[{i:1}]}'

beforeEach(() => {
  mock({
    'fake': {
      'data.json5': mockFileData
    }
  })
})

afterEach(() => {
  mock.restore()
})

describe('components > accessData', () => {
  it('should return JSON5 parsed data', async () => {
    mockReadData.readData = jest.fn()
    mockReadData.readData.mockResolvedValueOnce(mockFileData)
    const data = await accessData('fake/data.json5')
    expect(data).toStrictEqual({ data: [ { i: 1 } ] })
  })
})
