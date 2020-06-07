import { bold, blue, red } from 'colorette'
import { api, setAuthorizationToken } from './'
import * as mockOwner from '../oauth'

beforeEach(() => {
  mockOwner.owner.getToken = jest.fn()
  mockOwner.owner.getToken.mockResolvedValueOnce({ accessToken: '12345' })
})

describe('utils > api > setAuthorizationToken', () => {
  it('is not authorised by default', () => {
    const headers = api.headers
    expect(headers.Authorization).toBeUndefined()
  })

  it('sets authorization header', async () => {
    process.env.KITSU_USERNAME = "test"
    process.env.KITSU_PASSWORD = "test"
    const spy = jest.spyOn(console, 'log').mockImplementation()
    await setAuthorizationToken()
    const headers = api.headers
    expect(headers.Authorization).toEqual('Bearer 12345')
    expect(spy).toHaveBeenCalledWith(`${bold(blue('  INFO'))} Authenticated as test`)
    delete process.env.KITSU_USERNAME
    delete process.env.KITSU_PASSWORD
  })

  it('throws an error if KITSU_USERNAME is missing', async () => {
    await expect(setAuthorizationToken()).rejects.toThrow(`${bold(red('ERROR'))} Missing KITSU_USERNAME environment variable`)
  })

  it('throws an error if KITSU_PASSWORD is missing', async () => {
    process.env.KITSU_USERNAME = "test_password"
    await expect(setAuthorizationToken()).rejects.toThrow(`${bold(red('ERROR'))} Missing KITSU_PASSWORD environment variable`)
    delete process.env.KITSU_USERNAME
  })
})
