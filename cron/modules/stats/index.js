import { store } from '../../util'
import chalk from 'chalk'

const log = console.log
const travis = process.env.TRAVIS

export async function stats () {
  await Promise.all(Object.keys(store.count).map(async counter => {
    const count = store.count[counter].length
    const counterColour = counter === 'added' ? 'greenBright'
                        : counter === 'updated' ? 'blueBright'
                        : counter === 'skipped' ? 'magentaBright'
                        : 'redBright'
    const counterLabel = counter.toUpperCase()

    if (travis) log(`travis_fold:start:${counter}`)
    if (count > 0) log(chalk`{bold.${counterColour} ${counterLabel}} ${count} anime`)

    store.count[counter]
      .sort((a, b) => a.localeCompare(b, 'en', {'sensitivity': 'base'}))
      .map(anime => {
        log(chalk`  {gray ${anime}}`)
      })

    if (travis) log(`travis_fold:end:${counter}`)
  }))
}
