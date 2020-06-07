import mock from 'mock-fs'
import { bold, green, yellow, gray} from 'colorette'
import { readData } from './'

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

describe('components > readData', () => {
  it('should return raw data from file', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    const data = await readData('fake/data.json5', {
      current: true,
      season: 'winter',
      year: 2020
    })
    expect(data).toStrictEqual(mockedFileData)
    expect(spy).toHaveBeenCalledWith(`${bold(green('LOADED'))} ${yellow(' CURRENT')} Season data from ${gray('fake/data.json5')}`)
    spy.mockRestore()
  })
})
