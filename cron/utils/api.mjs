import throttle from 'axios-request-throttle'
import OAuth2 from 'client-oauth2'
import Kitsu from 'kitsu'

import { log } from './index.mjs'

const { owner } = new OAuth2({
  clientId: '',
  clientSecret: '',
  accessTokenUri: 'https://kitsu.io/api/oauth/token'
})

export const api = new Kitsu()

if (!process.env.KITSU_USERNAME && !process.env.KITSU_PASSWORD) {
  throw 'Missing KITSU_USERNAME and KITSU_PASSWORD environment variables'
}

const accessToken = await owner.getToken(
  process.env.KITSU_USERNAME,
  process.env.KITSU_PASSWORD
)

api.headers['Authorization'] = `Bearer ${accessToken}`

log('info', 'Authenticated with Kitsu.io')

throttle.use(api.axios, { requestsPerSecond: 3 })
