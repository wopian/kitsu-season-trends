import Kitsu from 'kitsu'
import OAuth2 from 'client-oauth2'
import { IS_PRODUCTION } from '../../constants'
import { info, error } from '../'

if (IS_PRODUCTION) {
  if (!process.env.KITSU_USERNAME) {
    error('Missing KITSU_USERNAME environment variable')
    process.exit(1)
  }

  if (!process.env.KITSU_PASSWORD) {
    error('Missing KITSU_PASSWORD environment variable')
    process.exit(1)
  }
}

export const api = new Kitsu()

export const { owner } = new OAuth2({
  clientId: '',
  clientSecret: '',
  accessTokenUri: 'https://kitsu.io/api/oauth/token'
})

export async function setAuthorizationToken () {
  // Don't authenticate in Jest
  // TODO: Mock authentication
  if (!IS_PRODUCTION) return
  const { accessToken } = await owner.getToken(process.env.KITSU_USERNAME, process.env.KITSU_PASSWORD)
  api.headers['Authorization'] = `Bearer ${accessToken}`
  info(`Authenticated as ${process.env.KITSU_USERNAME}`)
}
