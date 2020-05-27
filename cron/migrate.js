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
      const entriesToDelete = []

      data.data.forEach(entry => {
        entry.d = entry.d.filter(day => typeof day.m !== 'undefined')

        entry.d.forEach((day, index) => {
          if (index !== day.i) {
            entriesToDelete.push(entry.i)
          }
        })


      })

      const deDupe = [...new Set(entriesToDelete)]
      console.log(deDupe)

      data.data = data.data.filter(entry => !deDupe.includes(entry.i))

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
