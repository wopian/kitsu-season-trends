/**
 * Migrations to data structure
 */

const stringify = require('json-stringify-pretty-compact')
const { readdir, readFile, writeFile } = require('fs')
const { encode } = require('msgpack-lite/lib/encode')
const { decode } = require('msgpack-lite/lib/decode')
const dir = './data'

readdir(dir, (err, files) => {
  if (err) throw err
  files.forEach(file => {
    readFile(`${dir}/${file}`, (err2, DATA) => {
      if (err2) throw err2

      const data = decode(DATA)

      console.log(data.meta)

      /*
      Object.keys(data).forEach(el => {
        data[el].d.forEach(array => {
          array.d = ~~array.d
        })
      })
      */

      writeFile(`${dir}/${file}`, encode(data), err3 => {
        if (err3) throw err3
        console.log(`migrated ${file}`)
      })
    })
  })
})
