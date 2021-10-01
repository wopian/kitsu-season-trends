import { store, log } from '../../util/index.mjs'
import { bold, gray, green, blue, red, magenta } from 'picocolors'

function counterLabelColour (counter) {
  const label = counter.toUpperCase()
  switch(counter) {
    case 'added':
      return green(label)
    case 'updated':
      return blue(label)
    case 'skipped':
      return magenta(label)
    default:
      return red(label)
  }
}

export async function stats () {
  await Promise.all(Object.keys(store.count).map(async counter => {
    const count = store.count[counter].length
    const counterLabel = counterLabelColour(counter)

    if (count > 0) log(`${bold(counterLabel)} ${count} anime`)

    store.count[counter]
      .sort((a, b) => a.localeCompare(b, 'en', {'sensitivity': 'base'}))
      .map(anime => {
        log(gray(`  ${anime}`))
      })
  }))
}
