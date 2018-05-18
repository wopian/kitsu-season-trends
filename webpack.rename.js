const { readdir, rename } = require('fs')
const { basename } = require('path')
const ext = '.json5'

readdir('dist/data/', (err, files) => {
  files.forEach(file => {
    const newFile = `dist/data/${basename(file, ext)}.json`
    rename(`dist/data/${file}`, newFile, e => {
      if (e) throw e
    })
  })
})

readdir('dist/msgpack/', (err, files) => {
  files.forEach(file => {
    const newFile = `dist/msgpack/${basename(file, ext)}.msgpack`
    rename(`dist/msgpack/${file}`, newFile, e => {
      if (e) throw e
    })
  })
})
