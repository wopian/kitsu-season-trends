import { decode } from 'msgpack-lite'
import { isSeasonStatsDocument, type SeasonStatsDocument } from '../../shared/season-stats'

export function useStatsData() {
  const data = shallowRef<SeasonStatsDocument | null>(null)
  const loading = ref(true)
  const error = ref('')
  let controller: AbortController | undefined
  async function load() {
    controller?.abort()
    const request = new AbortController()
    controller = request
    loading.value = true
    error.value = ''
    try {
      const response = await fetch('/stats.msgpack', { signal: request.signal, cache: 'no-cache' })
      if (!response.ok) throw new Error(`Stats request failed (HTTP ${response.status})`)
      const document: unknown = decode(new Uint8Array(await response.arrayBuffer()))
      if (!isSeasonStatsDocument(document)) throw new Error('Invalid stats data')
      if (!request.signal.aborted) data.value = document
    } catch (caught) {
      if (!request.signal.aborted) error.value = caught instanceof Error ? caught.message : 'Could not load stats'
    } finally {
      if (!request.signal.aborted) loading.value = false
    }
  }
  onMounted(load)
  onBeforeUnmount(() => controller?.abort())
  return { data, loading, error, retry: load }
}
