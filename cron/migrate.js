/**
 * Migrations to data structure
 */

const JSON5 = require('json5')
const { readdir, readFile, writeFile } = require('node:fs')
const { wilson, average, mid } = require('wilson-rate')

const dir = './data'

function decToPercent(decimal) {
  return Math.round(decimal.toFixed(6) * 1e4) / 1e2
}

readdir(dir, (error, files) => {
  if (error) throw error
  for (const file of files) {
    readFile(`${dir}/${file}`, (error2, DATA) => {
      if (error2) throw error2

      const data = JSON5.parse(DATA)

      for (const entry of data.data) {
        entry.d = entry.d.filter(day => typeof day.m !== 'undefined')

        for (const day of entry.d) {
          // Migrate to upvotes/downvotes and wilson rating
          if (!day.p && !day.o && day.r) {
            const rating = day.m * 10
            const upvoted = Math.round(day.r * (rating / 100) * 100) / 100
            const downvoted =
              Math.round(day.r * ((100 - rating) / 100) * 100) / 100

            day.w = decToPercent(wilson(upvoted, downvoted, 1.96))
            day.a = decToPercent(average(upvoted, downvoted))
            day.m = decToPercent(mid(upvoted, downvoted))
            day.p = upvoted
            day.o = downvoted
          }
        }
      }

      writeFile(
        `${dir}/${file}`,
        JSON5.stringify(data, { space: 1 }),
        error3 => {
          if (error3) throw error3
          console.log(`migrated ${file}`)
        }
      )
    })
  }
})
