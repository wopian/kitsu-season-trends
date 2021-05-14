/**
 * Migrations to data structure
 */

const JSON5 = require('json5')
const { readdir, readFile, writeFile } = require('fs')
const { wilson, average, mid } = require('wilson-rate')
const dir = './data'

function decToPercent (decimal) {
  return Math.round(decimal.toFixed(6) * 1e4) / 1e2
}

readdir(dir, (err, files) => {
  if (err) throw err
  files.forEach(file => {
    readFile(`${dir}/${file}`, (err2, DATA) => {
      if (err2) throw err2

      const data = JSON5.parse(DATA)

      data.data.forEach(entry => {
        entry.d = entry.d.filter(day => typeof day.m !== 'undefined')

        entry.d.forEach((day) => {
          // Migrate to upvotes/downvotes and wilson rating
          if (!day.p && !day.o) {
            if (day.r) {
              const upvoted = Math.round(day.r * (day.w / 100) * 100) / 100
              const downvoted = Math.round(day.r * ((100 - day.w) / 100) * 100) / 100

              day.w = decToPercent(wilson(upvoted, downvoted, 1.96))
              day.a = decToPercent(average(upvoted, downvoted))
              day.m = decToPercent(mid(upvoted, downvoted))
              day.p = upvoted
              day.o = downvoted
            }
          }
        })


      })

      writeFile(`${dir}/${file}`, JSON5.stringify(data, { space: 1 }), err3 => {
        if (err3) throw err3
        console.log(`migrated ${file}`)
      })
    })
  })
})
