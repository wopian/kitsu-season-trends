import { db } from './'

export async function removeAnime (id) {
  try {
    await db.unset(`data.${id}`).write()
  } catch (E) {
    console.error(`Errored while removing #${id} from the database:`)
    throw E
  }
}
