import { checkExists, displayProgress, getAnime, RANGE } from './'
import { airedSplice } from './aired'

export async function getAiring (offset = 0) {
  try {
    const { data, meta, links } = await getAnime({ offset })
    data.forEach(async item => {
      airedSplice(item.id)
      await checkExists(item)
    })
    displayProgress(meta.count, data.length, offset)
    return links
  } catch (E) {
    console.error(`Errored while getting airing anime offset ${offset} - ${offset + RANGE}:`)
    throw E
  }
}
