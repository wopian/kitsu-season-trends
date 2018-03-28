import { store } from '../../util'
import chalk from 'chalk'

const log = console.log

export async function stats () {
  await Promise.all(Object.keys(store.count).map(async counter => {
    const count = store.count[counter].length
    const counterColour = counter === 'added' ? 'greenBright' : counter === 'updated' ? 'blueBright' : 'redBright'
    const counterLabel = counter.toUpperCase()

    if (process.env.TRAVIS) log(`travis_fold:start:${counter}`)
    if (count > 0) log(chalk`{bold.${counterColour} ${counterLabel}} ${count} anime`)
    
    await store.count[counter]
      .sort((a, b) => a.localeCompare(b, 'en', {'sensitivity': 'base'}))
      .map(anime => {
        log(chalk`  {gray ${anime}}`)
      })
    
    if (process.env.TRAVIS) log(`travis_fold:end:${counter}\n`)
  }))
}
