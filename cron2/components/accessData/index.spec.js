import mock from 'mock-fs'
import { accessData } from './'
import * as mockedReadData from '../readData'

const mockedFileData = '{data:[{i:1}]}'

beforeEach(() => {
  mock({
    'fake': {
      'data.json5': mockedFileData
    }
  })
})

afterEach(() => {
  mock.restore()
})

describe('components > accessData', () => {
  it('should return JSON5 parsed data', async () => {
    mockedReadData.readData = jest.fn()
    mockedReadData.readData.mockResolvedValueOnce(mockedFileData)
    const data = await accessData('fake/data.json5')
    expect(data).toStrictEqual({ data: [ { i: 1 } ] })
  })
})
