/**
 * Migrations to data structure
 */

const stringify = require('json-stringify-pretty-compact')
const { readdir, readFile, writeFile } = require('fs')
const { encode } = require('base-65503')

const dir = './data'

readdir(dir, (err, files) => {
  if (err) throw err
  files.forEach(file => {
    readFile(`${dir}/${file}`, 'utf8', (err2, DATA) => {
      if (err2) throw err2

      const { data, updated } = JSON.parse(DATA)

      Object.keys(data).forEach(el => {
        let date = new Date(updated)

        for (let i = data[el].d.slice(-1)[0].i; i >= 0; i--) {
          data[el].d[i].d = encode(date.getTime())
          date.setDate(date.getDate() - 1)
        }
      })

      writeFile(`${dir}/${file}`, stringify({ data, updated }, { maxLength: 250 }), err3 => {
        if (err3) throw err3
        console.log(`migrated ${file}`)
      })
    })
  })
})
