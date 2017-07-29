/**
 * Migrations to data structure
 */

const stringify = require('json-stringify-pretty-compact')
const { readdir, readFile, writeFile } = require('fs')
const dir = './data'

readdir(dir, (err, files) => {
  if (err) throw err
  files.forEach(file => {
    readFile(`${dir}/${file}`, 'utf8', (err2, DATA) => {
      if (err2) throw err2

      const { data, meta, updated } = JSON.parse(DATA)

      Object.keys(data).forEach(el => {
        data[el].d.forEach(array => {
          array.d = ~~array.d
        })
      })

      writeFile(`${dir}/${file}`, stringify({ data, meta, updated }, { maxLength: 250 }), err3 => {
        if (err3) throw err3
        console.log(`migrated ${file}`)
      })
    })
  })
})
