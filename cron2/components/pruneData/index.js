export async function pruneData (updatedData) {
  console.log(updatedData.length)
  // Deduplicate array just in case.
  updatedData = Array.from(new Set(updatedData.map(resource => resource.id)))
    .map(id => updatedData.find(resource => resource.id === id))
  console.log(updatedData.length)
}
