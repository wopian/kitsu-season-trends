import { store } from '../../util'

export async function stats () {
  await Promise.all(Object.keys(store.count).map(async counter => {
    const count = store.count[counter].length
    if (count > 0) console.log(`\n${counter[0].toUpperCase()}${counter.slice(1)}: ${count}\n`)
    await store.count[counter].sort().map(anime => {
      console.log(`  ${anime}`)
    })
  }))
}
