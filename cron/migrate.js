/**
 * Migrations to data structure
 */

const JSON5 = require('json5')
const { readdir, readFile, writeFile } = require('node:fs')
const { wilson, average, mid } = require('wilson-rate')

const dir = './data'

function decToPercent(decimal) {
  return Math.round(decimal.toFixed(6) * 1e4) / 1e2
}

readdir(dir, (error, files) => {
  if (error) throw error
  for (const file of files) {
    console.log(file)
    // if (['2017-autumn.json5'].includes(file)) continue

    readFile(`${dir}/${file}`, (error2, DATA) => {
      if (error2) throw error2

      const data = JSON5.parse(DATA)

      for (const entry of data.data) {
        const newFile = `${dir}/id/${entry.i}.json5`

        let existingFile = null
        readFile(newFile, (error3, DATA2) => {
          if (error3.code === 'ENOENT') return
          if (error3) throw error3
          existingFile = JSON5.parse(DATA2)
        })

        entry.d.forEach(item => {
          delete item.i
        })

        const newFormat = {
          meta: {
            i: entry.i,
            t: entry.t,
            u: entry.u
          },
          data: existingFile ? [...existingFile.data, ...entry.d] : entry.d
        }

        writeFile(
          newFile,
          JSON5.stringify(newFormat, { space: 1 }),
          error3 => {
            if (error3) throw error3
            // console.log(`Generated ${newFile}`)
          }
        )
      }
    })

    break;
  }
})
