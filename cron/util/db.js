import fileAsync from 'lowdb/lib/storages/file-async'
import low from 'lowdb'
import stringify from 'json-stringify-pretty-compact'

import {season, year } from '../../src/util'

// Load season database
export const db = low(`./data/${year()}-${season()}.json`, {
  storage: fileAsync,
  format: {
    serialize: data => stringify(data, { maxLength: 250 })
  }
})

// Set defaults if new season
db.defaults({ data: {}, meta: {}, updated: '' }).write()

