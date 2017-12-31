export function displayProgress (count, processed, offset, range) {
  try {
    if (offset + range > count) offset = count
    const progress = ((processed + offset) / count * 100)
    const progressFormatted = progress > 100 ? 100 : progress.toFixed(1)
    console.log(`${processed + offset} - ${progressFormatted}% complete`)
  } catch (E) {
    console.error(`Errored on offset ${offset} - ${offset + range}:`)
    throw E
  }
}
