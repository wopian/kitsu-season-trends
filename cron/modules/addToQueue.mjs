import Queue from 'yocto-queue'

import { TYPE } from '../constants.mjs'
import { log } from '../utils/index.mjs'

export const queue = {
  ids: new Set(),
  [TYPE.SHARED]: new Queue(),
  [TYPE.CURRENT]: new Queue(),
  [TYPE.PREVIOUS]: new Queue(),
  process: new Queue()
}

export const addToQueue = (type, tasks) => {
  if (!tasks[type]?.data?.data) return
  log(type, 'Started adding entries to queue')
  for (const entry of tasks[type].data.data) {
    if (
      (type === TYPE.CURRENT &&
        tasks[TYPE.PREVIOUS]?.data?.data?.find(
          previous => previous.i === entry.i
        )) ||
      (type === TYPE.PREVIOUS &&
        tasks[TYPE.CURRENT]?.data?.data?.find(current => current.i === entry.i))
    ) {
      queue[TYPE.SHARED].enqueue(entry.i)
    } else queue[type].enqueue(entry.i)
  }
  log(type, 'Finished adding entries to queue')
}
