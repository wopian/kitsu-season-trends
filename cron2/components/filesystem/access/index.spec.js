import mock from 'mock-fs'
import { access } from './'
import * as mockRead from '../read'

const mockFile = '{data:[{i:1}]}'

beforeEach(() => {
  mock({
    'fake': {
      'data.json5': mockFile
    }
  })
})

afterEach(() => {
  mock.restore()
})

describe('components > filesystem > access', () => {
  it('should return JSON5 parsed data', async () => {
    mockRead.read = jest.fn()
    mockRead.read.mockResolvedValueOnce(mockFile)
    const data = await access('fake/data.json5')
    expect(data).toStrictEqual({ data: [ { i: 1 } ] })
  })
})
