import Kitsu from 'kitsu-native'
export interface ApiAnime {
  id: string
  canonicalTitle: string
  subtype: string
  startDate: string | null
  endDate: string | null
  status: string
  ratingFrequencies: Record<string, string | number>
  favoritesCount: number
  posterImage?: { small?: string; medium?: string; original?: string } | null
}
export function createTransport(
  fetcher: typeof fetch = globalThis.fetch,
  sleep = (ms: number) => Bun.sleep(ms),
  interval = 350,
) {
  let tail = Promise.resolve()
  let next = 0
  return async (
    input: Parameters<typeof fetch>[0],
    init?: RequestInit,
  ): Promise<Response> => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const slot = tail.then(async () => {
        await sleep(Math.max(0, next - Date.now()))
        next = Date.now() + interval
      })
      tail = slot.catch(() => {})
      await slot
      try {
        const response = await fetcher(input, init)
        if (response.status !== 429 && response.status < 500) return response
        if (attempt === 2) return response
        const header = response.headers.get('retry-after')
        const retry = header
          ? Number.isFinite(Number(header))
            ? Number(header) * 1000
            : Date.parse(header) - Date.now()
          : 1000 * 2 ** attempt
        await response.body?.cancel()
        await sleep(Math.max(0, Number.isFinite(retry) ? retry : 1000))
      } catch (error) {
        if (init?.signal?.aborted || attempt === 2) throw error
        await sleep(1000 * 2 ** attempt)
      }
    }
    throw new Error('Request retry limit reached')
  }
}
export function createApi() {
  return new Kitsu({
    baseURL: 'https://kitsu.app/api/edge',
    timeout: 120_000,
    fetch: createTransport() as typeof fetch,
  })
}
export const fields =
  'canonicalTitle,ratingFrequencies,favoritesCount,subtype,startDate,endDate,status,posterImage'
export function apiPoster(entry: Pick<ApiAnime, 'posterImage'>) {
  return (
    entry.posterImage?.small ||
    entry.posterImage?.medium ||
    entry.posterImage?.original
  )
}
export async function batches(
  api: ReturnType<typeof createApi>,
  ids: number[],
  animeFields = fields,
) {
  const result: ApiAnime[] = []
  for (let offset = 0; offset < ids.length; offset += 20) {
    const { data } = await api.get<ApiAnime[]>('anime', {
      params: {
        filter: { id: ids.slice(offset, offset + 20).join(',') },
        fields: { anime: animeFields },
        page: { limit: 20 },
      },
    })
    if (!Array.isArray(data))
      throw new Error('Kitsu returned an invalid anime collection')
    result.push(...data)
  }
  return result
}
