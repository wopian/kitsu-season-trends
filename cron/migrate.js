/**
 * Migrations to data structure
 */

const JSON5 = require('json5')
const { readdir, readFile, writeFile } = require('fs')
const dir = './data'

readdir(dir, (err, files) => {
  if (err) throw err
  files.forEach(file => {
    readFile(`${dir}/${file}`, (err2, DATA) => {
      if (err2) throw err2

      const data = JSON5.parse(DATA)

      data.data.forEach(entry => {
        // Add n to 2017 data (set all as NEW)
        //if (typeof entry.n === 'undefined') entry.n = 1

        // Add u to 2017 data (set all as TV)
        //if (typeof entry.u === 'undefined') entry.u = 0

        entry.d = entry.d.filter(day => typeof day.m !== 'undefined')

        entry.d.forEach(day => {
          if (typeof day.m === 'undefined') console.log(day)
        })


      })

      // Removed entries with less than 5 user ratings
      // data.data = data.data.filter(anime => anime.d[anime.d.length - 1].r >= 5)

      /*
      writeFile(`${dir}/${file}`, JSON5.stringify(data, { space: 1 }), err3 => {
        if (err3) throw err3
        console.log(`migrated ${file}`)
      })
      */
    })
  })
})
