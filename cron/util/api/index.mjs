import Kitsu from 'kitsu'
import OAuth2 from 'client-oauth2'
import { log } from '../log'

export const api = new Kitsu();

const { owner } = new OAuth2({
  clientId: '',
  clientSecret: '',
  accessTokenUri: 'https://kitsu.io/api/oauth/token'
})

if (process.env.KITSU_USERNAME) {
  if (!process.env.KITSU_PASSWORD) throw 'Missing KITSU_PASSWORD environment variable';
  (async () => {
    api.headers['Authorization'] = `Bearer ${ (await owner.getToken(process.env.KITSU_USERNAME, process.env.KITSU_PASSWORD)).accessToken }`
    log('Authenticated')
  })()
} else throw 'Not authenticated! Missing KITSU_USERNAME and KITSU_PASSWORD environment variables'
