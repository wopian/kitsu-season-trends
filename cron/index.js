import { counters, db, getAiring, getUpcoming, getAired, RANGE, NOW } from './util'

async function stats () {
  try {
    db.set('meta.total', db.get('data').size().value()).write()
    db.set('updated', NOW).write()
    Object.keys(counters).forEach(counter => {
      const count = counters[counter].length
      if (count > 0) console.log(`\n${counter[0].toUpperCase()}${counter.slice(1)}: ${count}\n`)
      counters[counter].sort().forEach(anime => {
        console.log(`  ${anime}`)
      })
    })
  } catch (E) {
    throw E
  }
}

async function manualUpdates () {
  try {
    await getUpcoming()
    await getAired()
    stats()
  } catch (E) {
    throw E
  }
}

async function main (offset = 0) {
  try {
    const { next } = await getAiring(offset)
    if (next) await main(offset + RANGE)
    else manualUpdates()
  } catch (E) {
    throw E
  }
}

main()
