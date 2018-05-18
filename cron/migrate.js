/**
 * Migrations to data structure
 */

const JSON5 = require('json5')
// const stringify = require('json-stringify-pretty-compact')
const { readdir, readFile, writeFile } = require('fs')
const dir = './data'

readdir(dir, (err, files) => {
  if (err) throw err
  files.forEach(file => {
    readFile(`${dir}/${file}`, (err2, DATA) => {
      if (err2) throw err2

      const data = JSON5.parse(DATA)

      // data.data = data.data.filter(anime => anime.d[anime.d.length - 1].r >= 5)

      /*
      Object.keys(data).forEach(el => {
        data[el].d.forEach(array => {
          array.d = ~~array.d
        })
      })
      */

      // writeFile(`${dir}/${file}`, stringify(data, { maxLength: 250 }), err3 => {
      writeFile(`${dir}/${file}`, JSON5.stringify(data, { space: 1 }), err3 => {
        if (err3) throw err3
        console.log(`migrated ${file}`)
      })
    })
  })
})
