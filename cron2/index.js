import Queue from 'yocto-queue'
import JSON5 from 'json5'
import { readFile } from 'node:fs/promises'
import { constants } from 'node:fs'

const NOW = new Date().toISOString()
const TYPE = {
  CURRENT: 'current',
  PREVIOUS: 'previous',
  SHARED: 'shared'
}

const seasons = {
  current: { season: 'summer', year: 2021, data: null },
  previous: { season: 'spring', year: 2021, data: null },
}

const queue = {
  ids: new Set(),
  shared: new Queue,
  current: new Queue,
  previous: new Queue
}

for (const item in seasons) {
  const { season, year } = seasons[item]
  const FILE = `./data/${year}-${season}.json5`
  try {
    seasons[item].data = JSON5.parse(await readFile(FILE, 'utf8'))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    else {
      console.log(`No data found for ${FILE}`)
    }
  }
}

console.log(seasons)

const printEntries = async (item, type) => {
  for (const entry of item.data.data) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10))
    console.log(item.year, item.season, entry.t)
    queue.ids.add(entry.i)
    if (
      (type === TYPE.CURRENT && seasons.previous.data.data.find(previous => previous.i === entry.i)) ||
      (type === TYPE.PREVIOUS && seasons.current.data.data.find(current => current.i === entry.i))) {
      queue.shared.enqueue(entry.i)
    } else queue[type].enqueue(entry.i)
    // console.log(queue.current.size, queue.previous.size, queue.ids.size)
  }
}

const dequeueInBatches = async type => {
  console.log('Started dequeue for ', type)
  while (queue[type].size) {
    let batch = ''
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10))
      const id = queue[type].dequeue()
      if (!id) break
      batch += `${i === 0 ? '' : ','}${id}`
    }
    console.log(type, batch.split(','))
  }
  console.log('Emptied queue for ', type)
}


Promise.allSettled([
  printEntries(seasons.current, TYPE.CURRENT),
  printEntries(seasons.previous, TYPE.PREVIOUS)
]).then(async () => Promise.allSettled([
  dequeueInBatches(TYPE.SHARED),
  dequeueInBatches(TYPE.CURRENT),
  dequeueInBatches(TYPE.PREVIOUS),
])).then(() => console.log(queue.shared.size, queue.ids.size))