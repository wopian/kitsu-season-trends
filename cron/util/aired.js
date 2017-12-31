import { db } from './db'

// Array of all shows that have started airing. Airing shows will be
// removed, leaving only shows that have finished - which will be
// updated manually

export let aired = Object.keys(db.get('data').value())

export function airedSplice (id) {
  aired.splice(aired.indexOf(id), 1)
}
