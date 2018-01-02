/**
 * Migrations to data structure
 */

const stringify = require('json-stringify-pretty-compact')
const { readdir, readFile, writeFile } = require('fs')
const dir = './data'

readdir(dir, (err, files) => {
  if (err) throw err
  files.forEach(file => {
    readFile(`${dir}/${file}`, (err2, DATA) => {
      if (err2) throw err2

      const data = JSON.parse(DATA)

      Object.keys(data.data).forEach(id => {
        const d = data.data[id].d
        if (d[d.length - 1].r <= 1) delete data.data[id]
      })

      /*
      Object.keys(data).forEach(el => {
        data[el].d.forEach(array => {
          array.d = ~~array.d
        })
      })
      */

      writeFile(`${dir}/${file}`, stringify(data, { maxLength: 250 }), err3 => {
        if (err3) throw err3
        console.log(`migrated ${file}`)
      })
    })
  })
})
