/**
 * Migrations to data structure
 */

const stringify = require('json-stringify-pretty-compact')
const { readdir, readFile, writeFile } = require('fs')

const dir = './data'

readdir(dir, (err, files) => {
  if (err) throw err
  files.forEach(file => {
    readFile(`${dir}/${file}`, 'utf8', (err2, data) => {
      if (err2) throw err2
      writeFile(`${dir}/${file}`, stringify(JSON.parse(data)), err3 => {
        if (err3) throw err3
        console.log(`processed ${file}`)
      })
    })
  })
})
