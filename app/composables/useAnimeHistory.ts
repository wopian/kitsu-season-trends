import { decode } from 'msgpack-lite'
import type { AnimeArchive } from '../../shared/trends'

export function useAnimeHistory(id: Ref<number | null>) {
  const archive = shallowRef<AnimeArchive | null>(null)
  const loading = ref(false)
  const error = ref('')
  const cache = new Map<number, AnimeArchive>()
  let controller: AbortController | undefined
  async function load() {
    controller?.abort()
    const requestedId = id.value
    archive.value =
      requestedId === null ? null : (cache.get(requestedId) ?? null)
    error.value = ''
    loading.value = false
    if (requestedId === null || archive.value) return
    const request = new AbortController()
    controller = request
    loading.value = true
    try {
      const response = await fetch(`/msgpack/id/${requestedId}.msgpack`, {
        signal: request.signal,
        cache: 'no-cache',
      })
      if (!response.ok)
        throw new Error(
          `Anime history request failed (HTTP ${response.status})`,
        )
      const document = decode(
        new Uint8Array(await response.arrayBuffer()),
      ) as AnimeArchive
      if (
        document.meta?.i !== requestedId ||
        !Array.isArray(document.data) ||
        !document.data.every((point) => Number.isFinite(point.d))
      )
        throw new Error('Invalid anime history data')
      if (!request.signal.aborted && id.value === requestedId) {
        cache.set(requestedId, document)
        archive.value = document
      }
    } catch (caught) {
      if (!request.signal.aborted)
        error.value =
          caught instanceof Error
            ? caught.message
            : 'Could not load anime history'
    } finally {
      if (!request.signal.aborted) loading.value = false
    }
  }
  watch(id, load)
  onBeforeUnmount(() => controller?.abort())
  return { archive, loading, error, retry: load }
}
