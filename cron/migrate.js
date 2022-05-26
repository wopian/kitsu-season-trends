/**
 * Migrations to data structure
 */

const JSON5 = require('json5')
const { readdir, readFile, readFileSync, writeFile } = require('node:fs')
const { readFile: readFilePromise } = require('node:fs/promises')
const { wilson, average, mid } = require('wilson-rate')

const dir = './data'

function decToPercent(decimal) {
  return Math.round(decimal.toFixed(6) * 1e4) / 1e2
}

readdir(dir, (error, files) => {
  if (error) throw error
  for (const file of files) {
    console.log(file)
    if (['2017-autumn.json5'].includes(file)) continue

    readFile(`${dir}/${file}`, async (error2, DATA) => {
      if (error2) throw error2

      const data = JSON5.parse(DATA)

      for (const entry of data.data) {
        const newFile = `${dir}/id/${entry.i}.json5`

        const existingFile = JSON5.parse(await readFilePromise(newFile).catch(error4 => {
          if (error4.code !== 'ENOENT') throw error4
          else return '{}'
        }))

        entry.d.forEach(item => {
          delete item.i
        })

        const newFormatData = existingFile?.data ? [...existingFile.data, ...entry.d] : entry.d
        const newFormat = {
          meta: {
            i: entry.i,
            t: entry.t,
            u: entry.u
          },
          data: newFormatData.sort((a, b) => a.d - b.d)
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
