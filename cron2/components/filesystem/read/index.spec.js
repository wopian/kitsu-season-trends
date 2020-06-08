import mock from 'mock-fs'
import { bold, green, yellow, gray} from 'colorette'
import { read } from './'

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

describe('components > filesystem > read', () => {
  it('should return raw data from file', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    const data = await read('fake/data.json5', {
      current: true,
      season: 'winter',
      year: 2020
    })
    expect(data).toStrictEqual(mockFile)
    expect(spy).toHaveBeenCalledWith(`${bold(green('LOADED'))} ${yellow(' CURRENT')} Season data from ${gray('fake/data.json5')}`)
    spy.mockRestore()
  })
})
