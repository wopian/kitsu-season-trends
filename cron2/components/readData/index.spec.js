import mock from 'mock-fs'
import { bold, green, yellow, gray} from 'colorette'
import { readData } from './'

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

describe('components > readData', () => {
  it('should return raw data from file', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    const data = await readData('fake/data.json5', {
      current: true,
      season: 'winter',
      year: 2020
    })
    expect(data).toStrictEqual(mockFileData)
    expect(spy).toHaveBeenCalledWith(`${bold(green('LOADED'))} ${yellow(' CURRENT')} Season data from ${gray('fake/data.json5')}`)
    spy.mockRestore()
  })
})
