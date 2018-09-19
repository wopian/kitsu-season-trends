import Kitsu from 'kitsu'
import OAuth2 from 'client-oauth2'

export const api = new Kitsu();

const { owner } = new OAuth2({
  clientId: '',
  clientSecret: '',
  accessTokenUri: 'https://kitsu.io/api/oauth/token'
})

if (process.env.KITSU_USERNAME) {
  (async () => {
    api.headers['Authorization'] = `Bearer ${ (await owner.getToken(process.env.KITSU_USERNAME, process.env.KITSU_PASSWORD)).accessToken }`
  })()
}
