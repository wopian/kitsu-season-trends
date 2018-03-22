export function remove (...prune) {
  return this.filter(item => !prune.includes(item))
}
