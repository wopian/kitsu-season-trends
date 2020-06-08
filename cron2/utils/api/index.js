import Kitsu from 'kitsu'
import { owner } from './oauth'
import { info, error } from '../'

export const api = new Kitsu()

export async function setAuthorizationToken () {
  if (!process.env.KITSU_USERNAME) throw new Error(error('Missing KITSU_USERNAME environment variable'))
  if (!process.env.KITSU_PASSWORD) throw new Error(error('Missing KITSU_PASSWORD environment variable'))
  const { accessToken } = await owner.getToken(process.env.KITSU_USERNAME, process.env.KITSU_PASSWORD)
  api.headers['Authorization'] = `Bearer ${accessToken}`
  info(`Authenticated as ${process.env.KITSU_USERNAME}`)
}
