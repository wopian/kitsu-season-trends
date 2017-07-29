/**
 * Migrations to data structure
 */

const stringify = require('json-stringify-pretty-compact')
const { readdir, readFile, writeFile } = require('fs')
const base = require('base32768')
const base2 = require('base65536')
const { decode } = require('base-65503')

const dir = './data'

console.log(new Date(1501226428531))

const hours = (1501226428531 / 1000 / 60 / 60).toFixed(0)
const days = (hours / 24).toFixed(0)

console.log('1501226428531'.length)
console.log(hours.toString().length)
console.log(days.toString().length)

console.log(1501226428531)
throw hours * 3600000
console.log(hours)
console.log(days)

console.log(new Date(hours * 60 * 60 * 1000))
console.log(new Date(days * 24 * 60 * 60 * 1000))

/*
console.log(new Date(1501226428531))
console.log(new Date(1501724976990))
console.log(new Date(1501053698290))

console.log(base32768.encode(Buffer.from('1501139969697')))
console.log(base32768.encode(Buffer.from('1501139969697')).length)
console.log('1501139969697'.length)
console.log(new Date(+base32768.decode(base32768.encode(Buffer.from('1501139969697'))).toString()))
console.log(new Date(1501139969697))
*/

/*
function reencodeLength (number) {
  // if (typeof number === 'number') number = Buffer.from(number.toString())
  // else number = base.decode(number)
  number = decode(number)

  return number

  const encoded = base2.encode(Buffer.from(number.toString())).toString()

  if (number.toString().length <= `'${encoded}'`.length) return number
  else return encoded
}
  */

readdir(dir, (err, files) => {
  if (err) throw err
  files.forEach(file => {
    readFile(`${dir}/${file}`, 'utf8', (err2, DATA) => {
      if (err2) throw err2

      const { data, meta, updated } = JSON.parse(DATA)

      Object.keys(data).forEach(el => {
        data[el].d.forEach(array => {
          array.d = +array.d
        })
      })

      writeFile(`${dir}/${file}`, stringify({ data, meta, updated }, { maxLength: 250 }), err3 => {
        if (err3) throw err3
        console.log(`migrated ${file}`)
      })
    })
  })
})
