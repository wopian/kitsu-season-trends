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
        data[el].d = []
        for (let i = 0; i < data[el].mean.length; i++) {
          data[el].d.push({
            i,
            m: data[el].mean[i],
            r: encode(data[el].usersRated[i]),
            u: encode(data[el].users[i]),
            f: encode(data[el].favorites[i])
          })
        }

        delete data[el].mean
        delete data[el].users
        delete data[el].usersRated
        delete data[el].favorites

        /*
        data[el].i = encode(~~data[el].id)
        delete data[el].id

        data[el].s = data[el].slug
        delete data[el].slug

        data[el].t = data[el].title
        delete data[el].title

        data[el].p = encode(~~data[el].poster.split`?`[1])
        delete data[el].poster
        */
      })

      writeFile(`${dir}/${file}`, stringify({ data, updated }, { maxLength: 250 }), err3 => {
        if (err3) throw err3
        console.log(`migrated ${file}`)
      })
    })
  })
})
