import { TYPE } from './constants.mjs'
import {
  addToQueue,
  batchFetchExisting,
  fetchNew,
  processData,
  read,
  tasks,
  write
} from './modules/index.mjs'
import { currentTime, log } from './utils/index.mjs'

await Promise.allSettled([
  read(tasks[TYPE.CURRENT]),
  read(tasks[TYPE.PREVIOUS])
])

await Promise.allSettled([
  addToQueue(TYPE.CURRENT, tasks),
  addToQueue(TYPE.PREVIOUS, tasks)
])

await Promise.allSettled([
  fetchNew(TYPE.CURRENT, 'current'),
  fetchNew(TYPE.CURRENT, 'upcoming')
])

await Promise.allSettled([
  batchFetchExisting(TYPE.SHARED),
  batchFetchExisting(TYPE.CURRENT),
  batchFetchExisting(TYPE.PREVIOUS)
])

await processData()

await Promise.allSettled([
  write(tasks[TYPE.CURRENT]),
  write(tasks[TYPE.PREVIOUS])
])

log('info', `Finished processing at ${currentTime()}`)
