import Kitsu from 'kitsu'
import OAuth2 from 'client-oauth2'
import { info, error } from '../'

if (process.env.KITSU_USERNAME) {
  if (!process.env.KITSU_PASSWORD) {
    error('Missing KITSU_PASSWORD environment variable')
    process.exit(1)
  }
} else {
  error('Missing KITSU_USERNAME and/or KITSU_PASSWORD environment vairables')
  process.exit(1)
}

export const api = new Kitsu()

export const { owner } = new OAuth2({
  clientId: '',
  clientSecret: '',
  accessTokenUri: 'https://kitsu.io/api/oauth/token'
})

export async function setAuthorizationToken () {
  const { accessToken } = await owner.getToken(process.env.KITSU_USERNAME, process.env.KITSU_PASSWORD)
  api.headers['Authorization'] = `Bearer ${accessToken}`
  info(`Authenticated as ${process.env.KITSU_USERNAME}`)
}
